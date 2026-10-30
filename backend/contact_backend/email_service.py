import os
import threading
import logging
from datetime import datetime
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

logger = logging.getLogger(__name__)

def amount_to_words(amt):
    """
    Converts a numerical amount into Indian Rupee Words representation.
    """
    try:
        val = float(amt)
        rupees = int(val)
        paise = int(round((val - rupees) * 100))
        
        ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
                "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
        tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
        
        def convert_less_than_thousand(num):
            res = ""
            if num >= 100:
                res += ones[num // 100] + " Hundred "
                num %= 100
            if num >= 20:
                res += tens[num // 10] + " "
                num %= 10
            if num > 0:
                res += ones[num] + " "
            return res.strip()
            
        def convert_indian(num):
            if num == 0:
                return "Zero"
            crore = num // 10000000
            num %= 10000000
            lakh = num // 100000
            num %= 100000
            thousand = num // 1000
            num %= 1000
            rem = num
            
            parts = []
            if crore:
                parts.append(convert_less_than_thousand(crore) + " Crore")
            if lakh:
                parts.append(convert_less_than_thousand(lakh) + " Lakh")
            if thousand:
                parts.append(convert_less_than_thousand(thousand) + " Thousand")
            if rem:
                parts.append(convert_less_than_thousand(rem))
            return " ".join(parts).strip()
            
        r_str = convert_indian(rupees) + " Rupees"
        if paise > 0:
            p_str = convert_less_than_thousand(paise) + " Paise"
            return f"{r_str} and {p_str} Only"
        return f"{r_str} Only"
    except Exception:
        return ""

def generate_invoice_html(student_name, recipient_email, txn_no, amount, course_name, phone=None, date_str=None):
    """
    Generates a premium, responsive HTML email template for Pathfinder payment invoices.
    """
    if not date_str:
        date_str = datetime.now().strftime("%d/%m/%Y, %I:%M %p")
    
    clean_name = student_name or "Valued Student"
    clean_phone = phone or "N/A"
    clean_course = course_name or "Academic Program"
    formatted_amount = f"{float(amount):,.2f}" if amount else "0.00"
    amount_in_words = amount_to_words(amount)

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Invoice - Pathfinder Educational Centre</title>
  <style>
    body {{
      margin: 0;
      padding: 0;
      background-color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1E293B;
      -webkit-font-smoothing: antialiased;
    }}
    .email-container {{
      max-width: 640px;
      margin: 30px auto;
      background: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
      border: 1px solid #E2E8F0;
    }}
    .header-bar {{
      background: linear-gradient(135deg, #FF7D54 0%, #FF6B3D 50%, #EE4600 100%);
      padding: 28px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }}
    .brand-section {{
      background-color: #FFFFFF;
      padding: 10px 16px;
      border-radius: 12px;
      display: inline-block;
    }}
    .receipt-title {{
      text-align: right;
      color: #FFFFFF;
    }}
    .receipt-title h1 {{
      margin: 0;
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }}
    .receipt-title p {{
      margin: 4px 0 0;
      font-size: 12px;
      color: #FFEDD5;
      font-weight: 600;
    }}
    .content-body {{
      padding: 32px;
    }}
    .greeting {{
      font-size: 17px;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 8px;
    }}
    .intro-text {{
      font-size: 14px;
      color: #475569;
      line-height: 1.6;
      margin-top: 0;
      margin-bottom: 24px;
    }}
    .section-title {{
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #EE4600;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #FFEDD5;
    }}
    .info-grid {{
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin-bottom: 24px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      overflow: hidden;
    }}
    .info-grid td {{
      padding: 12px 16px;
      font-size: 13px;
      border-bottom: 1px solid #F1F5F9;
    }}
    .info-grid tr:last-child td {{
      border-bottom: none;
    }}
    .info-label {{
      color: #64748B;
      font-weight: 600;
      width: 38%;
    }}
    .info-value {{
      color: #0F172A;
      font-weight: 800;
      text-align: right;
    }}
    .badge-paid {{
      background: #10B981;
      color: #FFFFFF;
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
      display: inline-block;
      letter-spacing: 0.5px;
    }}
    .items-table {{
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }}
    .items-table th {{
      background: #0F172A;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 10px 14px;
      text-align: left;
    }}
    .items-table th.text-right {{
      text-align: right;
    }}
    .items-table td {{
      padding: 14px;
      font-size: 13px;
      color: #1E293B;
      border-bottom: 1px solid #E2E8F0;
      background: #FFFFFF;
    }}
    .items-table td.text-right {{
      text-align: right;
    }}
    .total-box {{
      background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%);
      border: 1px solid #FDBA74;
      border-radius: 12px;
      padding: 18px 24px;
      margin-bottom: 28px;
    }}
    .total-table {{
      width: 100%;
      border-collapse: collapse;
    }}
    .total-table td {{
      padding: 4px 0;
      font-size: 14px;
    }}
    .total-final {{
      font-size: 18px;
      font-weight: 900;
      color: #9A3412;
      border-top: 2px dashed #FDBA74;
      padding-top: 10px !important;
      margin-top: 6px;
    }}
    .total-final-amount {{
      font-size: 24px;
      font-weight: 900;
      color: #EE4600;
      text-align: right;
    }}
    .notice-box {{
      background: #FFFBEB;
      border-left: 4px solid #F59E0B;
      padding: 14px 18px;
      border-radius: 0 10px 10px 0;
      font-size: 13px;
      color: #92400E;
      line-height: 1.5;
      margin-bottom: 24px;
    }}
    .notice-box strong {{
      color: #78350F;
    }}
    .helpline-card {{
      background: #F1F5F9;
      border-radius: 12px;
      padding: 16px 20px;
      text-align: center;
      margin-bottom: 28px;
    }}
    .helpline-card p {{
      margin: 0;
      font-size: 13px;
      color: #334155;
      font-weight: 600;
    }}
    .helpline-card .phone-link {{
      color: #EE4600;
      font-size: 20px;
      font-weight: 900;
      text-decoration: none;
      display: inline-block;
      margin-top: 6px;
      letter-spacing: 0.5px;
    }}
    .footer {{
      background: #0F172A;
      color: #94A3B8;
      padding: 24px 32px;
      font-size: 11px;
      line-height: 1.6;
      text-align: center;
    }}
    .footer a {{
      color: #FF7D54;
      text-decoration: none;
    }}
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header with Pathfinder Branding -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #EE4600 0%, #FF7D54 100%);">
      <tr>
        <td style="padding: 24px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="left" valign="middle">
                <div style="background:#FFFFFF; padding:8px 14px; border-radius:10px; display:inline-block;">
                  <img src="https://pathfinder.edu.in/images/icon/logo-1.svg" alt="Pathfinder" style="height:38px; display:block; border:0;" />
                </div>
              </td>
              <td align="right" valign="middle" style="color:#FFFFFF; text-align:right;">
                <div style="font-size:16px; font-weight:900; letter-spacing:0.5px; text-transform:uppercase;">Official Fee Receipt</div>
                <div style="font-size:12px; color:#FFEDD5; margin-top:3px; font-weight:600;">Receipt #{txn_no}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Main Content -->
    <div class="content-body">
      <div class="greeting">Dear {clean_name},</div>
      <p class="intro-text">
        Thank you for choosing <strong>Pathfinder Educational Centre</strong>. We are pleased to confirm that your payment has been successfully processed. Please find your official payment invoice details below:
      </p>

      <!-- Transaction Overview -->
      <div class="section-title">Transaction Overview</div>
      <table class="info-grid">
        <tr>
          <td class="info-label">Transaction Reference</td>
          <td class="info-value">{txn_no}</td>
        </tr>
        <tr>
          <td class="info-label">Payment Date & Time</td>
          <td class="info-value">{date_str}</td>
        </tr>
        <tr>
          <td class="info-label">Payment Channel</td>
          <td class="info-value">Online Gateway (ICICI 3D Secure)</td>
        </tr>
        <tr>
          <td class="info-label">Payment Status</td>
          <td class="info-value"><span class="badge-paid">✓ PAID</span></td>
        </tr>
      </table>

      <!-- Student & Course Details -->
      <div class="section-title">Student & Enrolled Program Details</div>
      <table class="info-grid">
        <tr>
          <td class="info-label">Student Name</td>
          <td class="info-value">{clean_name}</td>
        </tr>
        <tr>
          <td class="info-label">Contact Number</td>
          <td class="info-value">{clean_phone}</td>
        </tr>
        <tr>
          <td class="info-label">Email Address</td>
          <td class="info-value">{recipient_email}</td>
        </tr>
        <tr>
          <td class="info-label">Program / Item</td>
          <td class="info-value" style="color: #EE4600;">{clean_course}</td>
        </tr>
      </table>

      <!-- Itemized Table -->
      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th class="text-right">Qty</th>
            <th class="text-right">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>{clean_course}</strong><br>
              <span style="font-size: 11px; color: #64748B;">Official Admission / Academic Courseware</span>
            </td>
            <td class="text-right">1</td>
            <td class="text-right"><strong>₹{formatted_amount}</strong></td>
          </tr>
        </tbody>
      </table>

      <!-- Total Box -->
      <div class="total-box">
        <table class="total-table">
          <tr>
            <td style="color: #64748B;">Subtotal:</td>
            <td style="text-align: right; color: #0F172A; font-weight: 700;">₹{formatted_amount}</td>
          </tr>
          <tr>
            <td style="color: #64748B;">Taxes (Inclusive):</td>
            <td style="text-align: right; color: #0F172A; font-weight: 700;">₹0.00</td>
          </tr>
          <tr>
            <td class="total-final">Total Amount Paid:</td>
            <td class="total-final total-final-amount">₹{formatted_amount}</td>
          </tr>
          <tr>
            <td colspan="2" style="font-size: 12px; color: #78350F; padding-top: 8px; font-style: italic;">
              <strong>Amount in Words:</strong> {amount_in_words}
            </td>
          </tr>
        </table>
      </div>

      <!-- Auto-generated Disclaimer -->
      <div class="notice-box">
        <strong>⚠️ Auto-Generated Notification:</strong><br>
        Please note that this is an automatically generated email from the Pathfinder portal. 
        <strong>Please do not reply directly to this email address</strong> as incoming messages to this inbox are not monitored.
      </div>

      <!-- Support / Contact Details Box -->
      <div class="helpline-card">
        <p>Need assistance or have questions regarding your enrollment / materials?</p>
        <p style="margin-top: 4px; font-size: 12px; color: #64748B;">Our student support desk is available to assist you:</p>
        <a href="tel:9147178886" class="phone-link">📞 9147178886</a>
        <div style="font-size: 12px; color: #64748B; margin-top: 6px;">
          Email: <a href="mailto:support@pathfinder.edu.in" style="color: #EE4600; font-weight: 700; text-decoration: none;">support@pathfinder.edu.in</a>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <strong>PATHFINDER EDUCATIONAL CENTRE LLP</strong><br>
      Head Office: 96K, Shyama Prasad Mukherjee Road, Hazra, Kolkata - 700026, West Bengal<br>
      Website: <a href="https://pathfinder.edu.in" target="_blank">pathfinder.edu.in</a> | Student Helpline: 9147178886<br>
      <p style="margin: 12px 0 0; color: #64748B;">
        &copy; {datetime.now().year} Pathfinder Educational Centre. All Rights Reserved. Computer Generated Official Tax Invoice.
      </p>
    </div>
  </div>
</body>
</html>
"""
    return html

def send_invoice_email(recipient_email, student_name, txn_no, amount, course_name, phone=None):
    """
    Sends the official payment invoice email to the student with full HTML formatting and plain text fallback.
    """
    if not recipient_email or "@" not in recipient_email:
        logger.warning(f"Cannot send invoice email: Invalid recipient '{recipient_email}'")
        return False

    date_str = datetime.now().strftime("%d/%m/%Y, %I:%M %p")
    clean_name = student_name or "Student"
    clean_course = course_name or "Academic Program"
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'Pathfinder <support@pathfinder.edu.in>')
    if "noreply@pathfinder.com" in from_email:
        from_email = "Pathfinder Support <support@pathfinder.edu.in>"

    subject = f"Official Payment Invoice - {clean_course} [Receipt #{txn_no}]"

    text_content = f"""Dear {clean_name},

Thank you for choosing Pathfinder Educational Centre.

Your payment for {clean_course} has been successfully received and confirmed.

============================================================
              PAYMENT INVOICE & RECEIPT
============================================================
Receipt No:        {txn_no}
Date & Time:       {date_str}
Payment Status:    PAID (ICICI 3D Secure)
Total Amount Paid: ₹{amount}
Amount in Words:   {amount_to_words(amount)}

STUDENT DETAILS:
Name:              {clean_name}
Contact Number:    {phone or 'N/A'}
Email:             {recipient_email}
Program:           {clean_course}
============================================================

IMPORTANT NOTICE:
This is an automatically generated email notification. Please do NOT reply directly to this email.

CONTACT & SUPPORT:
For any assistance or queries, please call our Student Helpdesk:
Phone: 9147178886
Email: support@pathfinder.edu.in
Website: https://pathfinder.edu.in

PATHFINDER EDUCATIONAL CENTRE LLP
Head Office: 96K, Shyama Prasad Mukherjee Road, Hazra, Kolkata - 700026
"""

    html_content = generate_invoice_html(
        student_name=clean_name,
        recipient_email=recipient_email,
        txn_no=txn_no,
        amount=amount,
        course_name=clean_course,
        phone=phone,
        date_str=date_str
    )

    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=[recipient_email]
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        logger.info(f"Successfully sent official invoice email to {recipient_email} for txn {txn_no}")
        return True
    except Exception as e:
        logger.error(f"Failed to send official invoice email to {recipient_email}: {e}")
        return False

def send_invoice_email_async(recipient_email, student_name, txn_no, amount, course_name, phone=None):
    """
    Sends the invoice email in a background thread to prevent blocking HTTP requests.
    """
    thread = threading.Thread(
        target=send_invoice_email,
        args=(recipient_email, student_name, txn_no, amount, course_name, phone)
    )
    thread.daemon = True
    thread.start()
    return thread
