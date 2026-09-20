import hmac
import hashlib
import json
import logging
import os
import datetime
import urllib.request
import urllib.parse
import ssl
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Enrollment, Course

logger = logging.getLogger(__name__)

# Live Production Config from Environment Variables
ICICI_MODE = os.getenv("ICICI_MODE", "LIVE")
ICICI_MERCHANT_ID = os.getenv("ICICI_MERCHANT_ID", os.getenv("ICICI_LIVE_MERCHANT_ID", "100000000517815"))
ICICI_AGGREGATOR_ID = os.getenv("ICICI_AGGREGATOR_ID", os.getenv("ICICI_LIVE_AGGREGATOR_ID", "100000000517814"))
ICICI_SECRET_KEY = os.getenv("ICICI_SECRET_KEY", os.getenv("ICICI_LIVE_SECRET_KEY", ""))
ICICI_SALE_URL = os.getenv("ICICI_SALE_URL", os.getenv("ICICI_LIVE_SALE_URL", "https://pgpay.icicibank.com/pg/api/v2/initiateSale"))
ICICI_COMMAND_URL = os.getenv("ICICI_COMMAND_URL", os.getenv("ICICI_LIVE_COMMAND_URL", "https://pgpay.icicibank.com/pg/api/command"))
SECRET_KEY = ICICI_SECRET_KEY

def get_icici_config(mode=None):
    """
    Returns production ICICI credentials strictly from .env
    """
    return {
        "mode": "LIVE",
        "merchantId": ICICI_MERCHANT_ID,
        "aggregatorID": ICICI_AGGREGATOR_ID,
        "secretKey": ICICI_SECRET_KEY,
        "saleUrl": ICICI_SALE_URL,
        "commandUrl": ICICI_COMMAND_URL
    }

def calculate_v1_secure_hash(data_dict, secret_key=None):
    if not secret_key:
        secret_key = get_icici_config()["secretKey"]
    filtered = {k: str(v) for k, v in data_dict.items() if v is not None and str(v) != '' and k != 'secureHash'}
    sorted_keys = sorted(filtered.keys())
    hash_text = "".join([filtered[k] for k in sorted_keys])
    
    key_bytes = secret_key.encode('utf-8')
    msg_bytes = hash_text.encode('utf-8')
    
    signature = hmac.new(key_bytes, msg_bytes, hashlib.sha256).hexdigest().lower()
    return signature, hash_text, sorted_keys

def calculate_v2_secure_hash(json_payload, secret_key=SECRET_KEY):
    """
    V2 Secure Hash Logic:
    1. Minify JSON (no whitespace, JSON stringify).
    2. Compute HMAC-SHA256 of minified JSON using secret_key.
    3. Return lowercase hex digest.
    """
    if isinstance(json_payload, dict):
        minified_json = json.dumps(json_payload, separators=(',', ':'))
    else:
        minified_json = str(json_payload)
        
    key_bytes = secret_key.encode('utf-8')
    msg_bytes = minified_json.encode('utf-8')
    signature = hmac.new(key_bytes, msg_bytes, hashlib.sha256).hexdigest().lower()
    return signature, minified_json

@method_decorator(csrf_exempt, name='dispatch')
class ICICIConfigView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        mode = request.query_params.get('mode') or ICICI_MODE
        config = get_icici_config(mode)
        return Response(config, status=status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch')
class ICICIHashGeneratorView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        """
        Generate ICICI Payment Gateway secureHash & hashText based on requested parameters & mode.
        Mode can be 'v1' (alphabetical concatenated values) or 'v2' (minified JSON string).
        """
        try:
            mode = request.data.get('mode', 'v1')
            req_icici_mode = request.data.get('iciciMode') or ICICI_MODE
            config = get_icici_config(req_icici_mode)
            secret_key = request.data.get('secretKey') or config["secretKey"]
            params = request.data.get('params', {})

            if mode == 'v2':
                secure_hash, minified_json = calculate_v2_secure_hash(params, secret_key)
                return Response({
                    "success": True,
                    "mode": "v2",
                    "minifiedJson": minified_json,
                    "secureHash": secure_hash
                }, status=status.HTTP_200_OK)
            else:
                secure_hash, hash_text, sorted_keys = calculate_v1_secure_hash(params, secret_key)
                return Response({
                    "success": True,
                    "mode": "v1",
                    "sortedKeys": sorted_keys,
                    "hashText": hash_text,
                    "secureHash": secure_hash
                }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error generating hash: {e}")
            return Response({"success": False, "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(csrf_exempt, name='dispatch')
class ICICIProxyView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        """
        Proxy requests to ICICI Bank UAT/Prod server to bypass browser CORS rules.
        """
        try:
            target_url = request.data.get('target_url')
            payload_type = request.data.get('payload_type', 'json') # 'json' or 'form'
            payload = request.data.get('payload', {})

            if not target_url:
                return Response({"error": "target_url is required"}, status=status.HTTP_400_BAD_REQUEST)

            # Ignore SSL verification for UAT sandbox if necessary
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE

            if payload_type == 'json':
                req_data = json.dumps(payload).encode('utf-8')
                req = urllib.request.Request(target_url, data=req_data, headers={
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0'
                })
            else:
                req_data = urllib.parse.urlencode(payload).encode('utf-8')
                req = urllib.request.Request(target_url, data=req_data, headers={
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0'
                })

            with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
                resp_text = resp.read().decode('utf-8')
                try:
                    resp_json = json.loads(resp_text)
                    return Response({"status": resp.status, "data": resp_json}, status=status.HTTP_200_OK)
                except Exception:
                    return Response({"status": resp.status, "raw_response": resp_text}, status=status.HTTP_200_OK)

        except urllib.error.HTTPError as e:
            err_text = e.read().decode('utf-8') if e.fp else str(e)
            try:
                err_json = json.loads(err_text)
                return Response({"status": e.code, "data": err_json, "error": str(e)}, status=status.HTTP_200_OK)
            except Exception:
                return Response({"status": e.code, "raw_response": err_text, "error": str(e)}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"ICICI Proxy Error: {e}")
            return Response({"error": str(e), "message": "Failed to connect to ICICI Bank endpoint"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(csrf_exempt, name='dispatch')
class ICICICallbackView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        """
        Handle POST callback response sent back by ICICI Payment Gateway after payment attempt.
        Redirects the browser back to frontend /my-courses with transaction status query parameters.
        """
        try:
            data = request.data
            logger.info(f"ICICI Payment Callback POST received: {data}")
            
            txn_status = data.get('responseCode') or data.get('status') or 'UNKNOWN'
            txn_no = data.get('merchantTxnNo') or data.get('txnRefNo') or ''
            
            # Construct frontend redirect URL
            redirect_url = f"https://pathfinder.edu.in/my-courses?txnNo={txn_no}&status={txn_status}"
            return redirect(redirect_url)
        except Exception as e:
            logger.error(f"Error handling ICICI callback POST: {e}")
            return redirect("https://pathfinder.edu.in/my-courses")

    def get(self, request):
        """
        Handle GET callback if gateway redirects via GET.
        """
        return redirect("https://pathfinder.edu.in/my-courses")

@method_decorator(csrf_exempt, name='dispatch')
class ICICIWebhookView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        """
        Production Server-to-Server Realtime Webhook Endpoint for ICICI Bank Payment Gateway.
        ICICI posts JSON/Form payload when payment event completes.
        """
        try:
            payload = request.data
            logger.info(f"[ICICI WEBHOOK] Received payload: {json.dumps(payload)}")

            response_code = payload.get("responseCode")
            merchant_txn_no = payload.get("merchantTxnNo") or payload.get("txnID")
            txn_id = payload.get("txnID") or payload.get("paymentID")
            amount = payload.get("amount")
            email = payload.get("customerEmailID")
            mobile = payload.get("customerMobileNo")
            course_id = payload.get("addlParam1")
            payment_mode = payload.get("paymentMode")
            bank_code = payload.get("bankCode")
            
            referral_code = payload.get("addlParam2")
            customer_name = payload.get("customerName") or "Pathfinder Student"
            
            # Determine success status
            is_success = str(response_code) in ["0000", "00", "SUCCESS", "0"]

            if is_success:
                logger.info(f"[ICICI WEBHOOK] Payment Successful for Txn: {merchant_txn_no}, Gateway TxnID: {txn_id}, Mode: {payment_mode}")

                # Auto-create or update Enrollment in MongoDB
                course_name = "Pathfinder Course Program"
                if course_id:
                    try:
                        course = Course.objects(id=course_id).first()
                        if course and getattr(course, 'name', None):
                            course_name = course.name
                    except Exception as c_err:
                        logger.warning(f"[ICICI WEBHOOK] Course lookup fallback: {c_err}")

                    # Check if enrollment already recorded
                    existing_enrollment = Enrollment.objects(payment_id=merchant_txn_no).first()
                    if not existing_enrollment:
                        Enrollment.objects.create(
                            user_id=email or mobile or "Guest",
                            course_id=str(course_id),
                            course_name=course_name,
                            amount_paid=float(amount) if amount else 0.0,
                            payment_id=merchant_txn_no,
                            payment_status='completed',
                            status='active',
                            enrolled_at=datetime.datetime.utcnow()
                        )
                        logger.info(f"[ICICI WEBHOOK] Created Enrollment for User: {email or mobile}, Course: {course_id}")

                # If purchase came via referral code, credit 10% referral bonus
                if referral_code:
                    try:
                        from shiksha_bandhu.views import process_referral_payment
                        process_referral_payment(
                            referral_id=referral_code,
                            student_name=customer_name,
                            student_email=email,
                            student_mobile=mobile,
                            course_name=course_name,
                            amount_paid=float(amount) if amount else 4500.0,
                            merchant_txn_no=merchant_txn_no
                        )
                        logger.info(f"[ICICI WEBHOOK] Credited 10% referral bonus to partner {referral_code}")
                    except Exception as ref_err:
                        logger.error(f"[ICICI WEBHOOK] Error processing referral bonus: {ref_err}")

            return Response({"status": "SUCCESS", "message": "Webhook processed successfully"}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"[ICICI WEBHOOK] Error processing webhook: {e}")
            return Response({"status": "ERROR", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request):
        """Support GET request for webhook ping verification"""
        return Response({"status": "ACTIVE", "gateway": "ICICI Payment Gateway Webhook Endpoint"}, status=status.HTTP_200_OK)



