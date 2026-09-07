import hmac
import hashlib
import json
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

logger = logging.getLogger(__name__)

SECRET_KEY = "db06cca0-838b-4e01-8b20-6ac446ffb6bd"
MERCHANT_ID = "100000000007164"
AGGREGATOR_ID = "A100000000007164"

def calculate_v1_secure_hash(data_dict, secret_key=SECRET_KEY):
    """
    V1 Secure Hash Logic:
    1. Filter out null/empty parameters.
    2. Sort non-empty parameter key-value pairs alphabetically by key.
    3. Concatenate parameter values into a single string (hashText).
    4. Compute HMAC-SHA256 of hashText using secret_key.
    5. Return lowercase hex digest.
    Note: Do not include 'secureHash' itself in the calculation if present in data_dict.
    """
    filtered = {k: str(v) for k, v in data_dict.items() if v is not None and str(v) != '' and k != 'secureHash'}
    sorted_keys = sorted(filtered.keys())
    hash_text = "".join([filtered[k] for k in sorted_keys])
    
    key_bytes = secret_key.encode('utf-8')
    msg_bytes = hash_text.encode('utf-8')
    
    signature = hmac.new(key_bytes, msg_bytes, hashlib.sha256).hexdigest().lower()
    return signature, hash_text, sorted_keys

def calculate_v2_secure_hash(json_payload, secret_key=SECRET_KEY):
    """
    V2 Secure Hash Logic (for JSON API requests like Get Card Bin / User Cancel / Get Service Charges):
    1. Minify JSON (no whitespace, JSON stringify).
    2. Compute HMAC-SHA256 of minified JSON using secret_key.
    3. Return lowercase hex digest.
    """
    if isinstance(json_payload, dict):
        # ensure minified JSON string without spaces
        minified_json = json.dumps(json_payload, separators=(',', ':'))
    else:
        minified_json = str(json_payload)
        
    key_bytes = secret_key.encode('utf-8')
    msg_bytes = minified_json.encode('utf-8')
    signature = hmac.new(key_bytes, msg_bytes, hashlib.sha256).hexdigest().lower()
    return signature, minified_json

class ICICIHashGeneratorView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        """
        Generate ICICI Payment Gateway secureHash & hashText based on requested parameters & mode.
        Mode can be 'v1' (alphabetical concatenated values) or 'v2' (minified JSON string).
        """
        try:
            mode = request.data.get('mode', 'v1')
            secret_key = request.data.get('secretKey', SECRET_KEY)
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
