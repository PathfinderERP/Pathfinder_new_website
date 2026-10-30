#!/usr/bin/env python3
"""
Pathfinder Text Mail Sending Server
----------------------------------
A lightweight HTTP server and CLI tool for sending text emails and notifications
using SMTP (Google Workspace / Gmail).

Default Configuration:
  EMAIL_BACKEND: django.core.mail.backends.smtp.EmailBackend
  EMAIL_HOST: smtp.gmail.com
  EMAIL_PORT: 587
  EMAIL_USE_TLS: True
  EMAIL_HOST_USER: support@pathfinder.edu.in
  EMAIL_HOST_PASSWORD: gfimwwrrwycqsdas
  DEFAULT_FROM_EMAIL: noreply@pathfinder.com

Usage:
  1. Start HTTP Server:
     python mail_server.py [--port 5005] [--host 0.0.0.0]
     
  2. Send Test Email via CLI:
     python mail_server.py --test recipient@example.com
     
  3. Send Custom Email via CLI:
     python mail_server.py --to recipient@example.com --subject "Subject" --message "Message body"
"""

import os
import sys
import json
import smtplib
import argparse
from http.server import HTTPServer, BaseHTTPRequestHandler
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formatdate, make_msgid

# Configuration
CONFIG = {
    "EMAIL_BACKEND": os.getenv("EMAIL_BACKEND", "django.core.mail.backends.smtp.EmailBackend"),
    "EMAIL_HOST": os.getenv("EMAIL_HOST", "smtp.gmail.com"),
    "EMAIL_PORT": int(os.getenv("EMAIL_PORT", 587)),
    "EMAIL_USE_TLS": os.getenv("EMAIL_USE_TLS", "True").lower() == "true",
    "EMAIL_HOST_USER": os.getenv("EMAIL_HOST_USER", "support@pathfinder.edu.in"),
    "EMAIL_HOST_PASSWORD": os.getenv("EMAIL_HOST_PASSWORD", "gfimwwrrwycqsdas"),
    "DEFAULT_FROM_EMAIL": os.getenv("DEFAULT_FROM_EMAIL", "noreply@pathfinder.com"),
}

def send_text_email(to_email, subject, message, from_email=None):
    """
    Sends a plain text email using the configured SMTP server.
    """
    if not to_email:
        raise ValueError("Recipient 'to' email address is required.")
    
    sender = from_email or CONFIG["DEFAULT_FROM_EMAIL"]
    
    # Handle list or single email string
    recipients = [to_email] if isinstance(to_email, str) else list(to_email)

    msg = MIMEMultipart('alternative')
    msg['From'] = f"Pathfinder <{sender}>" if "<" not in sender else sender
    msg['To'] = ", ".join(recipients)
    msg['Subject'] = subject or "Notification from Pathfinder"
    msg['Date'] = formatdate(localtime=True)
    msg['Message-ID'] = make_msgid(domain="pathfinder.edu.in")

    # Plain text body
    text_part = MIMEText(message, 'plain', 'utf-8')
    msg.attach(text_part)

    # Connect to SMTP Server
    server = smtplib.SMTP(CONFIG["EMAIL_HOST"], CONFIG["EMAIL_PORT"], timeout=25)
    server.ehlo()
    if CONFIG["EMAIL_USE_TLS"]:
        server.starttls()
        server.ehlo()

    server.login(CONFIG["EMAIL_HOST_USER"], CONFIG["EMAIL_HOST_PASSWORD"])
    server.sendmail(CONFIG["EMAIL_HOST_USER"], recipients, msg.as_string())
    server.quit()

    return {
        "status": "success",
        "to": recipients,
        "from": sender,
        "subject": subject
    }

def verify_smtp_connection():
    """
    Verifies SMTP connection and authentication.
    """
    server = smtplib.SMTP(CONFIG["EMAIL_HOST"], CONFIG["EMAIL_PORT"], timeout=15)
    server.ehlo()
    if CONFIG["EMAIL_USE_TLS"]:
        server.starttls()
        server.ehlo()
    server.login(CONFIG["EMAIL_HOST_USER"], CONFIG["EMAIL_HOST_PASSWORD"])
    server.quit()
    return True

class MailRequestHandler(BaseHTTPRequestHandler):
    """
    HTTP Request Handler for text mail sending service.
    """
    def _set_headers(self, status_code=200, content_type="application/json"):
        self.send_response(status_code)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(204)

    def do_GET(self):
        parsed_path = self.path.split("?")[0]

        if parsed_path in ("/health", "/status", "/api/status"):
            try:
                verify_smtp_connection()
                smtp_status = "connected"
            except Exception as e:
                smtp_status = f"failed: {str(e)}"

            response_data = {
                "server": "Pathfinder Text Mail Sending Server",
                "status": "running",
                "smtp": smtp_status,
                "config": {
                    "host": CONFIG["EMAIL_HOST"],
                    "port": CONFIG["EMAIL_PORT"],
                    "use_tls": CONFIG["EMAIL_USE_TLS"],
                    "user": CONFIG["EMAIL_HOST_USER"],
                    "from_email": CONFIG["DEFAULT_FROM_EMAIL"]
                }
            }
            self._set_headers(200 if "connected" in smtp_status else 500)
            self.wfile.write(json.dumps(response_data, indent=2).encode('utf-8'))
            return

        # Render Web UI for browser GET /
        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pathfinder Mail Sending Server</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0F172A; color: #F8FAFC; margin: 0; padding: 40px 20px; }}
    .card {{ max-width: 620px; margin: 0 auto; background: #1E293B; border-radius: 16px; border: 1px solid #334155; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }}
    h1 {{ font-size: 24px; font-weight: 800; margin-top: 0; color: #FF7D54; display: flex; items-center; gap: 8px; }}
    .badge {{ display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 9999px; background: rgba(16, 185, 129, 0.2); color: #34D399; margin-bottom: 20px; }}
    .field {{ margin-bottom: 16px; }}
    label {{ display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #94A3B8; }}
    input, textarea {{ width: 100%; box-sizing: border-box; background: #0F172A; border: 1px solid #334155; border-radius: 8px; padding: 10px 14px; color: #F8FAFC; font-size: 14px; outline: none; }}
    input:focus, textarea:focus {{ border-color: #FF7D54; ring: 2px solid rgba(255, 125, 84, 0.3); }}
    button {{ background: linear-gradient(135deg, #FF7D54, #FF6B3D); color: white; border: none; padding: 12px 24px; font-weight: 700; border-radius: 8px; cursor: pointer; font-size: 14px; width: 100%; }}
    button:hover {{ opacity: 0.95; }}
    .info {{ font-size: 12px; color: #64748B; margin-top: 24px; padding-top: 16px; border-top: 1px solid #334155; }}
    #result {{ margin-top: 16px; padding: 12px; border-radius: 8px; font-size: 13px; display: none; }}
  </style>
</head>
<body>
  <div class="card">
    <h1>Pathfinder Mail Server</h1>
    <div class="badge">SMTP Ready &bull; {CONFIG["EMAIL_HOST_USER"]}</div>

    <form id="mailForm">
      <div class="field">
        <label>Recipient Email Address *</label>
        <input type="email" id="to" placeholder="e.g. student@example.com" required value="support@pathfinder.edu.in">
      </div>
      <div class="field">
        <label>Subject</label>
        <input type="text" id="subject" placeholder="Subject" value="Test Message from Pathfinder Server">
      </div>
      <div class="field">
        <label>Message Body (Plain Text)</label>
        <textarea id="message" rows="5" placeholder="Enter message here...">Hello,\n\nThis is a test notification from the Pathfinder Text Mail Sending Server.\n\nBest regards,\nPathfinder Academy</textarea>
      </div>
      <button type="submit" id="btnSubmit">Send Email</button>
    </form>
    <div id="result"></div>

    <div class="info">
      <strong>Server Config:</strong><br>
      Host: {CONFIG["EMAIL_HOST"]}:{CONFIG["EMAIL_PORT"]} (TLS: True)<br>
      User: {CONFIG["EMAIL_HOST_USER"]}<br>
      From: {CONFIG["DEFAULT_FROM_EMAIL"]}
    </div>
  </div>

  <script>
    document.getElementById('mailForm').addEventListener('submit', async (e) => {{
      e.preventDefault();
      const btn = document.getElementById('btnSubmit');
      const resDiv = document.getElementById('result');
      btn.disabled = true;
      btn.innerText = 'Sending...';
      resDiv.style.display = 'none';

      try {{
        const res = await fetch('/send-mail', {{
          method: 'POST',
          headers: {{ 'Content-Type': 'application/json' }},
          body: JSON.stringify({{
            to: document.getElementById('to').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
          }})
        }});
        const data = await res.json();
        resDiv.style.display = 'block';
        if (res.ok) {{
          resDiv.style.background = 'rgba(16, 185, 129, 0.15)';
          resDiv.style.color = '#34D399';
          resDiv.style.border = '1px solid rgba(16, 185, 129, 0.3)';
          resDiv.innerText = 'Email sent successfully to ' + data.to;
        }} else {{
          resDiv.style.background = 'rgba(239, 68, 68, 0.15)';
          resDiv.style.color = '#F87171';
          resDiv.style.border = '1px solid rgba(239, 68, 68, 0.3)';
          resDiv.innerText = 'Error: ' + (data.error || 'Failed to send');
        }}
      }} catch (err) {{
        resDiv.style.display = 'block';
        resDiv.style.background = 'rgba(239, 68, 68, 0.15)';
        resDiv.style.color = '#F87171';
        resDiv.innerText = 'Network error: ' + err.message;
      }} finally {{
        btn.disabled = false;
        btn.innerText = 'Send Email';
      }}
    }});
  </script>
</body>
</html>
"""
        self._set_headers(200, "text/html")
        self.wfile.write(html_content.encode('utf-8'))

    def do_POST(self):
        parsed_path = self.path.split("?")[0]
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)

        try:
            data = json.loads(body.decode('utf-8')) if body else {}
        except Exception:
            self._set_headers(400)
            self.wfile.write(json.dumps({"error": "Invalid JSON body"}).encode('utf-8'))
            return

        if parsed_path in ("/send", "/send-mail", "/api/send"):
            to_email = data.get("to") or data.get("recipient")
            subject = data.get("subject", "Notification from Pathfinder")
            message = data.get("message") or data.get("body") or data.get("text", "")
            from_email = data.get("from_email") or data.get("from")

            if not to_email:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "Missing 'to' recipient email."}).encode('utf-8'))
                return

            try:
                res = send_text_email(to_email, subject, message, from_email)
                self._set_headers(200)
                self.wfile.write(json.dumps(res).encode('utf-8'))
            except Exception as e:
                self._set_headers(500)
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            return

        elif parsed_path in ("/test", "/test-mail", "/api/test"):
            to_email = data.get("to", CONFIG["EMAIL_HOST_USER"])
            test_subject = "Pathfinder Mail Server - Connection Test"
            test_body = f"""Hello,

This is a test notification confirming that the Pathfinder Text Mail Sending Server is operating correctly.

Configuration Verified:
- SMTP Host: {CONFIG["EMAIL_HOST"]}:{CONFIG["EMAIL_PORT"]}
- User: {CONFIG["EMAIL_HOST_USER"]}
- From: {CONFIG["DEFAULT_FROM_EMAIL"]}
- TLS Enabled: {CONFIG["EMAIL_USE_TLS"]}

Best regards,
Pathfinder Technical Operations
"""
            try:
                res = send_text_email(to_email, test_subject, test_body)
                self._set_headers(200)
                self.wfile.write(json.dumps(res).encode('utf-8'))
            except Exception as e:
                self._set_headers(500)
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            return

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))

def run_server(host="0.0.0.0", port=5005):
    """Starts the HTTP mail server."""
    server_address = (host, port)
    httpd = HTTPServer(server_address, MailRequestHandler)
    print("=" * 60)
    print("  PATHFINDER TEXT MAIL SENDING SERVER")
    print("=" * 60)
    print(f"  Server listening on: http://{host}:{port}")
    print(f"  SMTP Host:           {CONFIG['EMAIL_HOST']}:{CONFIG['EMAIL_PORT']}")
    print(f"  Auth User:           {CONFIG['EMAIL_HOST_USER']}")
    print(f"  Default From:        {CONFIG['DEFAULT_FROM_EMAIL']}")
    print("-" * 60)
    print(f"  - Web UI:            http://localhost:{port}/")
    print(f"  - Health Status:     http://localhost:{port}/health")
    print(f"  - Send API (POST):   http://localhost:{port}/send-mail")
    print("=" * 60)
    print("Press Ctrl+C to stop the server.\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Mail Server...")
        httpd.server_close()
        print("Server stopped.")

def main():
    parser = argparse.ArgumentParser(description="Pathfinder Text Mail Sending Server & CLI")
    parser.add_argument("--port", type=int, default=int(os.getenv("PORT", 5005)), help="Port to listen on (default: 5005)")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Host interface (default: 0.0.0.0)")
    parser.add_argument("--test", type=str, help="Send a test email to the specified address and exit")
    parser.add_argument("--to", type=str, help="Recipient email address")
    parser.add_argument("--subject", type=str, default="Notification from Pathfinder", help="Email subject")
    parser.add_argument("--message", type=str, help="Email plain text message body")

    args = parser.parse_args()

    if args.test:
        print(f"Sending test email to {args.test}...")
        try:
            result = send_text_email(
                args.test,
                "Pathfinder Mail Server - Connection Test",
                f"Hello,\n\nThis is a test email sent using the Pathfinder Mail Server.\n\nConfig:\nHost: {CONFIG['EMAIL_HOST']}:{CONFIG['EMAIL_PORT']}\nUser: {CONFIG['EMAIL_HOST_USER']}\nFrom: {CONFIG['DEFAULT_FROM_EMAIL']}"
            )
            print("Email sent successfully!")
            print(json.dumps(result, indent=2))
        except Exception as e:
            print("Failed to send email:", e)
            sys.exit(1)
        return

    if args.to and args.message:
        print(f"Sending email to {args.to}...")
        try:
            result = send_text_email(args.to, args.subject, args.message)
            print("Email sent successfully!")
            print(json.dumps(result, indent=2))
        except Exception as e:
            print("Failed to send email:", e)
            sys.exit(1)
        return

    # Default: Run HTTP server
    run_server(host=args.host, port=args.port)

if __name__ == "__main__":
    main()
