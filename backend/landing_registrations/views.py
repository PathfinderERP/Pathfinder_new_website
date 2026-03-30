import threading
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from .models import LandingPageRegistration
from .serializers import LandingPageRegistrationSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def create_registration(request):
    """
    Handle landing page registration form submission.
    Sends confirmation email to student and notification to official email.
    """
    serializer = LandingPageRegistrationSerializer(data=request.data)
    
    if serializer.is_valid():
        registration = serializer.save()
        
        # Send emails in background to avoid long wait times
        
        def send_emails_async(reg_id):
            try:
                # Re-fetch registration to ensure data is fresh inside the thread
                reg = LandingPageRegistration.objects.get(id=reg_id)
                from django.core.mail import EmailMultiAlternatives, get_connection
                
                # Use a single connection for both emails to be more efficient
                print(f"[EMAIL] [EMAIL THREAD] Connecting to {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
                print(f"[EMAIL] [EMAIL THREAD] SSL: {settings.EMAIL_USE_SSL} | TLS: {settings.EMAIL_USE_TLS}")
                print(f"[EMAIL] [EMAIL THREAD] User: {settings.EMAIL_HOST_USER}")

                # Force explicit connection parameters to avoid any default fallback
                connection = get_connection(
                    host=settings.EMAIL_HOST,
                    port=settings.EMAIL_PORT,
                    username=settings.EMAIL_HOST_USER,
                    password=settings.EMAIL_HOST_PASSWORD,
                    use_tls=settings.EMAIL_USE_TLS,
                    use_ssl=settings.EMAIL_USE_SSL,
                    timeout=getattr(settings, 'EMAIL_TIMEOUT', 30)
                )
                
                print("[EMAIL] [EMAIL THREAD] Opening connection...")
                connection.open()
                print("[SUCCESS] [EMAIL THREAD] Connection opened successfully")
                
                messages_to_send = []

                # 1. Prepare student confirmation (Professional HTML)
                if reg.email:
                    print(f"[EMAIL] [EMAIL THREAD] Preparing student email for: {reg.email}")
                    student_subject = "Congratulations! Your Registration with Pathfinder is Received"
                    student_text = f"Dear {reg.name},\n\nCongratulations! We have successfully received your registration for Pathfinder's {reg.page_source} program.\n\nBest regards,\nPathfinder Team"
                    
                    html_content = f"""
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f0f0f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                        <div style="background-color: #FF9F00; padding: 35px 20px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: 2px; font-weight: 800; text-transform: uppercase;">PATHFINDER</h1>
                            <p style="color: white; margin: 10px 0 0 0; opacity: 0.95; font-size: 14px; font-weight: 500;">Where Aspiration Meets Success</p>
                        </div>
                        
                        <div style="padding: 40px 30px; background-color: #ffffff; line-height: 1.7; color: #333333;">
                            <h2 style="color: #FF9F00; margin-top: 0; font-size: 22px; font-weight: 700;">Congratulations, {reg.name}!</h2>
                            <p style="font-size: 15px;">We are delighted to inform you that your registration for the <strong>{reg.page_source}</strong> program has been successfully received.</p>
                            
                            <div style="background-color: #fffaf2; border-left: 4px solid #FF9F00; padding: 25px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                                <p style="margin: 0; color: #444; font-size: 15px;">Our expert academic counselors will review your profile and <strong>contact you shortly</strong> at <b>{reg.phone}</b> to discuss the admission process and scholarship opportunities.</p>
                            </div>
                            
                            <p style="font-size: 15px; margin-bottom: 25px;">Thank you for choosing Pathfinder as your partner in success. We look forward to helping you achieve your dreams.</p>
                            
                            <div style="border-top: 1px solid #eeeeee; margin-top: 30px; padding-top: 25px;">
                                <p style="margin: 0; font-weight: 700; color: #333; font-size: 14px;">Warm Regards,</p>
                                <p style="margin: 5px 0; color: #FF9F00; font-weight: 700; font-size: 15px;">The Pathfinder Academic Team</p>
                            </div>
                        </div>
                        
                        <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 11px; color: #999999; border-top: 1px solid #f0f0f0;">
                            <p style="margin: 5px 0;">© 2026 Pathfinder. All rights reserved.</p>
                            <p style="margin: 5px 0; opacity: 0.7;">This is an automated notification. Please do not reply to this email.</p>
                        </div>
                    </div>
                    """
                    
                    msg1 = EmailMultiAlternatives(
                        subject=student_subject,
                        body=student_text,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        to=[reg.email],
                        connection=connection
                    )
                    msg1.attach_alternative(html_content, "text/html")
                    messages_to_send.append(msg1)
                else:
                    print("[WARNING] [EMAIL THREAD] No student email found, skipping student confirmation")

                # 2. Prepare official notification
                frontend_url = getattr(settings, 'FRONTEND_URL', 'https://pathfinder-landing-3.vercel.app')
                admin_leads_url = f"{frontend_url}/business/admin/ads-leads"
                backend_base_url = "https://three-pathfinder-new-backend-9.onrender.com"
                backend_detail_url = f"{backend_base_url}/api/landing/registrations/{reg.id}/"

                official_subject = f"New {reg.page_source} Landing Page Registration"
                official_text = f"New student registration: {reg.name}\nPhone: {reg.phone}\n\nLinks:\nAdmin: {admin_leads_url}\nAPI: {backend_detail_url}"
                
                msg2 = EmailMultiAlternatives(
                    subject=official_subject,
                    body=official_text,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[settings.OFFICIAL_EMAIL],
                    connection=connection
                )
                messages_to_send.append(msg2)
                
                # Send both
                print(f"[EMAIL] [EMAIL THREAD] Sending {len(messages_to_send)} messages...")
                connection.send_messages(messages_to_send)
                connection.close()
                print("[SUCCESS] [EMAIL THREAD] Emails sent and connection closed")
                    
            except Exception as e:
                print(f"[ERROR] [EMAIL THREAD] ERROR: {str(e)}")

        # Start the thread AFTER the database transaction is committed
        from django.db import transaction
        import time

        def start_email_thread():
            # Small delay to ensure Render network and DB are ready
            time.sleep(1)
            email_thread = threading.Thread(target=send_emails_async, args=(registration.id,))
            email_thread.daemon = True
            email_thread.start()

        transaction.on_commit(start_email_thread)
        
        return Response({
            'success': True,
            'message': 'Registration successful! Check your email for confirmation.',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'message': 'Registration failed. Please check your information.',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def registration_detail(request, pk):
    """
    Retrieve, update or delete a landing page registration.
    """
    try:
        registration = LandingPageRegistration.objects.get(pk=pk)
    except LandingPageRegistration.DoesNotExist:
        return Response({'message': 'Registration not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = LandingPageRegistrationSerializer(registration)
        return Response(serializer.data)

    elif request.method == 'PATCH':
        serializer = LandingPageRegistrationSerializer(registration, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        registration.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_registrations(request):
    """
    List all landing page registrations (admin only).
    """
    registrations = LandingPageRegistration.objects.all()
    serializer = LandingPageRegistrationSerializer(registrations, many=True)
    return Response(serializer.data)
