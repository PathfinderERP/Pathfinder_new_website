import datetime
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import ShikshaBandhuPartner, ShikshaBandhuClick, ShikshaBandhuBonus, ShikshaBandhuItem
from landing_registrations.models import LandingPageRegistration


BASE_DEMO_REFERRALS = [
    {
        'id': 'REF-1001',
        'displayId': 'L-1001',
        'student': 'Student #1',
        'studentName': 'Ananya Roy',
        'mobile': '+91 98301 12345',
        'program': 'Madhyamik Mock Test 2027',
        'date': '15 Feb 2026',
        'status': 'Successful',
        'bonus': 450
    },
    {
        'id': 'REF-1002',
        'displayId': 'L-1002',
        'student': 'Student #2',
        'studentName': 'Sayan Mukherjee',
        'mobile': '+91 98312 23456',
        'program': 'CBSE Class X Mock Test',
        'date': '18 Feb 2026',
        'status': 'Successful',
        'bonus': 750
    },
    {
        'id': 'REF-1003',
        'displayId': 'L-1003',
        'student': 'Student #3',
        'studentName': 'Priya Das',
        'mobile': '+91 98323 34567',
        'program': 'CBSE Class XII Mock Test',
        'date': '22 Feb 2026',
        'status': 'Pending',
        'bonus': 750
    },
    {
        'id': 'REF-1004',
        'displayId': 'L-1004',
        'student': 'Student #4',
        'studentName': 'Subhajit Paul',
        'mobile': '+91 98334 45678',
        'program': 'ICSE Class X Mock Test',
        'date': '01 Mar 2026',
        'status': 'Successful',
        'bonus': 750
    },
    {
        'id': 'REF-1005',
        'displayId': 'L-1005',
        'student': 'Student #5',
        'studentName': 'Tanushree Sen',
        'mobile': '+91 98345 56789',
        'program': 'Madhyamik Mock Test 2027',
        'date': '05 Mar 2026',
        'status': 'Successful',
        'bonus': 450
    }
]


def seed_default_partner_if_needed():
    """Ensure default partners SB004, SB102, SB001 exist in MongoDB."""
    try:
        initial_partners = [
            {
                'partner_id': 'SB004',
                'name': 'Rahul Das',
                'mobile': '+91 91471 78886',
                'email': 'rahul.das@example.com',
                'password': 'demo123',
                'status': 'active',
                'joined_on': datetime.datetime(2026, 2, 12)
            },
            {
                'partner_id': 'SB102',
                'name': 'Amitabha Sarkar',
                'mobile': '+91 98300 98765',
                'email': 'amitabha.sb102@pathfinder.edu.in',
                'password': 'demo123',
                'status': 'active',
                'joined_on': datetime.datetime(2026, 1, 10)
            },
            {
                'partner_id': 'SB001',
                'name': 'Soumen Banerjee',
                'mobile': '+91 98311 54321',
                'email': 'soumen.sb001@example.com',
                'password': 'demo123',
                'status': 'active',
                'joined_on': datetime.datetime(2026, 1, 5)
            }
        ]

        for p_data in initial_partners:
            partner = ShikshaBandhuPartner.objects(partner_id=p_data['partner_id']).first()
            if not partner:
                partner = ShikshaBandhuPartner(**p_data)
                partner.save()

        # Seed initial sample bonuses for SB004 if not present
        if ShikshaBandhuBonus.objects(partner_id='SB004').count() == 0:
            for item in BASE_DEMO_REFERRALS:
                b = ShikshaBandhuBonus(
                    partner_id='SB004',
                    lead_id=item['id'],
                    student_name=item['studentName'],
                    program=item['program'],
                    bonus_amount=item['bonus'],
                    status=item['status'],
                    created_at=datetime.datetime.utcnow()
                )
                b.save()

        # Seed sample demo leads in LandingPageRegistration if none exist for SB004
        if LandingPageRegistration.objects(referral_id='SB004').count() == 0:
            for item in BASE_DEMO_REFERRALS:
                reg = LandingPageRegistration(
                    name=item['studentName'],
                    phone=item['mobile'],
                    email=f"{item['studentName'].lower().replace(' ', '.')}@gmail.com",
                    student_class='Class X',
                    course_type=item['program'],
                    centre='Hazra (Head Office, Kolkata)',
                    page_source='Shiksha Bandhu Referral (SB004)',
                    referral_id='SB004',
                    is_contacted=(item['status'] == 'Successful'),
                    is_paid=(item['status'] == 'Successful'),
                    amount_paid=item['bonus'] * 10 if item['status'] == 'Successful' else 0.0,
                    txn_ref=f"TXN-SB004-{item['id']}",
                    created_at=datetime.datetime.utcnow()
                )
                reg.save()

    except Exception as e:
        print(f"Error seeding default partners: {e}")

# Trigger seeding when module is loaded
try:
    seed_default_partner_if_needed()
except Exception as _e:
    pass


@api_view(['POST'])
@permission_classes([AllowAny])
def partner_login(request):
    """Partner login endpoint."""
    seed_default_partner_if_needed()
    identifier = request.data.get('identifier', '').strip()
    password = request.data.get('password', '').strip()

    if not identifier or not password:
        return Response({'error': 'Identifier and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    partner = (
        ShikshaBandhuPartner.objects(partner_id__iexact=identifier).first() or
        ShikshaBandhuPartner.objects(mobile=identifier).first() or
        ShikshaBandhuPartner.objects(email__iexact=identifier).first()
    )

    if partner and partner.password == password:
        return Response({
            'success': True,
            'user': {
                'id': partner.partner_id,
                'name': partner.name,
                'mobile': partner.mobile,
                'email': partner.email,
                'joinedOn': partner.joined_on.strftime('%d %b %Y') if partner.joined_on else '12 Feb 2026',
                'status': partner.status
            }
        })

    if (identifier.upper() == 'SB004' or identifier == '9147178886') and password == 'demo123':
        return Response({
            'success': True,
            'user': {
                'id': 'SB004',
                'name': 'Rahul Das',
                'mobile': '+91 91471 78886',
                'email': 'rahul.das@example.com',
                'joinedOn': '12 Feb 2026',
                'status': 'active'
            }
        })

@api_view(['POST'])
@permission_classes([AllowAny])
def partner_register(request):
    """Public self-registration endpoint for new partners."""
    name = request.data.get('name', '').strip()
    mobile = request.data.get('mobile', '').strip()
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '').strip()

    if not name or not mobile or not password:
        return Response({'error': 'Name, Mobile Number and Password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if mobile or email already exists
    existing = ShikshaBandhuPartner.objects(mobile=mobile).first()
    if existing:
        return Response({'error': 'A partner account with this mobile number already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    # Auto-generate Partner ID (e.g. SB101, SB102...)
    count = ShikshaBandhuPartner.objects.count()
    new_id = f"SB{count + 101:03d}"

    while ShikshaBandhuPartner.objects(partner_id=new_id).first():
        count += 1
        new_id = f"SB{count + 101:03d}"

    partner = ShikshaBandhuPartner(
        partner_id=new_id,
        name=name,
        mobile=mobile,
        email=email,
        password=password,
        status='active'
    )
    partner.save()

    return Response({
        'success': True,
        'user': {
            'id': partner.partner_id,
            'name': partner.name,
            'mobile': partner.mobile,
            'email': partner.email,
            'joinedOn': partner.joined_on.strftime('%d %b %Y') if partner.joined_on else 'Today',
            'status': partner.status
        }
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def track_click(request):
    """Record referral link click in MongoDB."""
    partner_id = request.data.get('partner_id', 'SB004').strip().upper()
    program_slug = request.data.get('program_slug', '')
    
    try:
        click = ShikshaBandhuClick(
            partner_id=partner_id,
            program_slug=program_slug,
            ip_address=request.META.get('REMOTE_ADDR')
        )
        click.save()
        return Response({'success': True, 'partner_id': partner_id, 'total_clicks': ShikshaBandhuClick.objects(partner_id=partner_id).count()})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
@api_view(['GET'])
@permission_classes([AllowAny])
def get_partner_stats(request, partner_id):
    """Fetch live stats, referral leads, and earnings history for a partner."""
    seed_default_partner_if_needed()
    p_id = partner_id.strip().upper()
    
    # Real DB Clicks
    total_clicks = ShikshaBandhuClick.objects(partner_id__iexact=p_id).count()

    # Real DB Leads submitted with referral_id = p_id
    db_leads = list(LandingPageRegistration.objects(referral_id__iexact=p_id))
    total_registrations = len(db_leads)

    # Real DB Bonus records
    bonuses = list(ShikshaBandhuBonus.objects(partner_id__iexact=p_id))
    
    referrals_list = []
    
    # Add base demo referrals if SB004
    if p_id == 'SB004':
        for item in BASE_DEMO_REFERRALS:
            b_rec = next((b for b in bonuses if b.lead_id == item['id']), None)
            st = b_rec.status if b_rec else item['status']
            bn = b_rec.bonus_amount if b_rec else item['bonus']
            referrals_list.append({
                'id': item['id'],
                'student': item['student'],
                'studentName': item['studentName'],
                'mobile': item['mobile'],
                'program': item['program'],
                'date': item['date'],
                'status': st,
                'bonus': bn
            })

    # Add real leads from MongoDB
    for idx, lead in enumerate(db_leads, start=1050):
        lead_id_str = str(lead.id)
        txn_ref_str = str(lead.txn_ref or '')
        
        b_rec = next(
            (b for b in bonuses if b.lead_id and b.lead_id in [lead_id_str, txn_ref_str]),
            None
        )
        if not b_rec and lead.name:
            b_rec = next(
                (b for b in bonuses if b.student_name and b.student_name.lower() == lead.name.lower()),
                None
            )

        status_val = 'Successful' if (lead.is_paid or (b_rec and b_rec.status == 'Successful')) else ('Pending' if not (b_rec and b_rec.status == 'Cancelled') else 'Cancelled')
        calculated_bonus = int(round((lead.amount_paid or 4500) * 0.10)) if (lead.is_paid or status_val == 'Successful') else 250
        bonus_val = b_rec.bonus_amount if b_rec else calculated_bonus

        referrals_list.append({
            'id': lead_id_str,
            'student': f"Student #{idx}",
            'studentName': lead.name,
            'mobile': lead.phone,
            'program': lead.course_type or 'Pathfinder Mock Test',
            'date': lead.created_at.strftime('%d %b %Y') if lead.created_at else 'Today',
            'status': status_val,
            'bonus': bonus_val
        })

    # Recalculate partner totals from full referrals list
    total_successful_count = sum(1 for r in referrals_list if r['status'] == 'Successful')
    total_bonus_val = sum(r['bonus'] for r in referrals_list if r['status'] == 'Successful')
    total_pending_val = sum(r['bonus'] for r in referrals_list if r['status'] == 'Pending')

    partner_doc = ShikshaBandhuPartner.objects(partner_id__iexact=p_id).first()

    return Response({
        'partner': {
            'id': p_id,
            'name': partner_doc.name if partner_doc else 'Rahul Das',
            'mobile': partner_doc.mobile if partner_doc else '+91 91471 78886',
            'email': partner_doc.email if partner_doc else 'rahul.das@example.com',
            'joinedOn': partner_doc.joined_on.strftime('%d %b %Y') if (partner_doc and partner_doc.joined_on) else '12 Feb 2026',
            'status': partner_doc.status if partner_doc else 'active',
        },
        'stats': {
            'clicks': total_clicks,
            'registrations': total_registrations,
            'successfulReferrals': total_successful_count,
            'totalBonus': total_bonus_val,
            'pendingBonus': total_pending_val,
            'thisMonth': total_bonus_val
        },
        'referrals': referrals_list,
        'bonusHistory': [
            {'date': r['date'], 'program': r['program'], 'referral': r['studentName'], 'status': r['status'], 'bonus': r['bonus']}
            for r in referrals_list if r['status'] == 'Successful'
        ]
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def admin_list_partners(request):
    """Admin endpoint to fetch all Shiksha Bandhu partners and system summary."""
    seed_default_partner_if_needed()
    partners = list(ShikshaBandhuPartner.objects.all())
    leads = list(LandingPageRegistration.objects(referral_id__ne=None))
    bonuses = list(ShikshaBandhuBonus.objects.all())

    partner_data = []
    for p in partners:
        p_id = p.partner_id.upper()
        p_clicks = ShikshaBandhuClick.objects(partner_id__iexact=p_id).count()
        p_leads = sum(1 for l in leads if l.referral_id and l.referral_id.upper() == p_id)
        
        p_bonuses = [b for b in bonuses if b.partner_id and b.partner_id.upper() == p_id]
        p_paid_leads = [l for l in leads if l.referral_id and l.referral_id.upper() == p_id and l.is_paid]
        
        p_successful = max(
            sum(1 for b in p_bonuses if b.status == 'Successful'),
            len(p_paid_leads)
        )
        p_earned = sum(b.bonus_amount for b in p_bonuses if b.status == 'Successful')
        if p_earned == 0 and p_paid_leads:
            p_earned = sum(int(round((l.amount_paid or 4500) * 0.10)) for l in p_paid_leads)

        partner_data.append({
            'id': p.partner_id,
            'name': p.name,
            'mobile': p.mobile,
            'email': p.email,
            'joinedOn': p.joined_on.strftime('%d %b %Y') if p.joined_on else '12 Feb 2026',
            'status': p.status,
            'clicks': p_clicks,
            'leads': p_leads,
            'successful': p_successful,
            'totalEarnings': p_earned
        })

    total_clicks = sum(p['clicks'] for p in partner_data)
    total_leads = sum(p['leads'] for p in partner_data)
    total_payouts = sum(p['totalEarnings'] for p in partner_data)

    return Response({
        'summary': {
            'totalPartners': len(partner_data),
            'totalClicks': total_clicks,
            'totalLeads': total_leads,
            'totalPayouts': total_payouts
        },
        'partners': partner_data
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def admin_create_partner(request):
    """Admin endpoint to create a new partner."""
    partner_id = request.data.get('partner_id', '').strip().upper()
    name = request.data.get('name', '').strip()
    mobile = request.data.get('mobile', '').strip()
    email = request.data.get('email', '').strip()
    password = request.data.get('password', 'demo123').strip()

    if not partner_id or not name or not mobile:
        return Response({'error': 'Partner ID, Name and Mobile are required.'}, status=status.HTTP_400_BAD_REQUEST)

    if ShikshaBandhuPartner.objects(partner_id=partner_id).first():
        return Response({'error': f'Partner ID {partner_id} already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    partner = ShikshaBandhuPartner(
        partner_id=partner_id,
        name=name,
        mobile=mobile,
        email=email,
        password=password,
        status='active'
    )
    partner.save()
    return Response({'success': True, 'partner_id': partner_id})


@api_view(['GET'])
@permission_classes([AllowAny])
def admin_list_referrals(request):
    """Admin endpoint to get all referred leads and their bonus status."""
    seed_default_partner_if_needed()
    leads = list(LandingPageRegistration.objects(referral_id__ne=None))
    bonuses = list(ShikshaBandhuBonus.objects.all())

    ref_list = []
    for idx, lead in enumerate(leads, start=1001):
        lead_id_str = str(lead.id)
        txn_ref_str = str(lead.txn_ref or '')
        
        b_rec = next(
            (b for b in bonuses if b.lead_id and b.lead_id in [lead_id_str, txn_ref_str]),
            None
        )
        if not b_rec and lead.name:
            b_rec = next(
                (b for b in bonuses if b.student_name and b.student_name.lower() == lead.name.lower()),
                None
            )

        status_val = b_rec.status if b_rec else ('Successful' if lead.is_paid or lead.is_contacted else 'Pending')
        calculated_bonus = int(round((lead.amount_paid or 4500) * 0.10)) if (lead.is_paid or status_val == 'Successful') else 250
        bonus_val = b_rec.bonus_amount if b_rec else calculated_bonus

        ref_list.append({
            'id': lead_id_str,
            'displayId': f"L-{idx}",
            'partnerId': (lead.referral_id or 'SB004').upper(),
            'studentName': lead.name,
            'mobile': lead.phone,
            'program': lead.course_type or 'Pathfinder Mock Test',
            'date': lead.created_at.strftime('%d %b %Y') if lead.created_at else 'Today',
            'status': status_val,
            'bonusAmount': bonus_val
        })

    return Response({'referrals': ref_list})


@api_view(['PATCH'])
@permission_classes([AllowAny])
def admin_update_referral_status(request, referral_id):
    """Admin endpoint to update referral lead status and bonus amount."""
    new_status = request.data.get('status', 'Pending') # Pending, Successful, Cancelled
    bonus_amount = int(request.data.get('bonus_amount', 250))
    partner_id = request.data.get('partner_id', 'SB004').upper()

    try:
        bonus_rec = ShikshaBandhuBonus.objects(lead_id=str(referral_id)).first()
        if not bonus_rec:
            bonus_rec = ShikshaBandhuBonus(
                partner_id=partner_id,
                lead_id=str(referral_id),
                program='Pathfinder Mock Test',
                bonus_amount=bonus_amount,
                status=new_status
            )
        else:
            bonus_rec.status = new_status
            bonus_rec.bonus_amount = bonus_amount

        bonus_rec.save()

        # Update lead in LandingPageRegistration if exists
        try:
            lead = LandingPageRegistration.objects.get(id=referral_id)
            if new_status == 'Successful':
                lead.is_contacted = True
                lead.is_paid = True
                lead.save()
        except Exception:
            pass

        return Response({'success': True, 'referral_id': referral_id, 'status': new_status, 'bonus': bonus_amount})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def process_referral_payment(referral_id, student_name, student_email, student_mobile, course_name, amount_paid, merchant_txn_no, centre=None, student_class=None):
    """
    Processes 10% referral bonus for partner and registers/updates paid referral student record.
    """
    if not referral_id:
        return None

    p_id = str(referral_id).strip().upper()
    amount = float(amount_paid or 0)
    bonus_amount = int(round(amount * 0.10)) # 10% Referral Bonus

    # 1. Save/Update ShikshaBandhuBonus entry for partner
    try:
        bonus_rec = ShikshaBandhuBonus.objects(partner_id=p_id, lead_id=str(merchant_txn_no)).first()
        if not bonus_rec and student_name:
            bonus_rec = ShikshaBandhuBonus.objects(partner_id=p_id, student_name=student_name, program=course_name).first()

        if not bonus_rec:
            bonus_rec = ShikshaBandhuBonus(
                partner_id=p_id,
                lead_id=str(merchant_txn_no),
                student_name=student_name or 'Referred Student',
                program=course_name or 'Pathfinder Mock Test',
                bonus_amount=bonus_amount,
                status='Successful',
                created_at=datetime.datetime.utcnow()
            )
            bonus_rec.save()
        else:
            bonus_rec.status = 'Successful'
            bonus_rec.bonus_amount = bonus_amount
            bonus_rec.save()
    except Exception as e:
        print(f"Error creating/updating ShikshaBandhuBonus: {e}")

    # 2. Save/Update LandingPageRegistration marked as is_paid=True
    try:
        reg = None
        if merchant_txn_no:
            reg = LandingPageRegistration.objects(txn_ref=merchant_txn_no).first()
        if not reg and student_mobile:
            reg = LandingPageRegistration.objects(phone=student_mobile, referral_id__iexact=p_id).first()
        if not reg and student_email:
            reg = LandingPageRegistration.objects(email=student_email, referral_id__iexact=p_id).first()

        if reg:
            reg.is_paid = True
            reg.amount_paid = amount
            reg.txn_ref = merchant_txn_no
            reg.is_contacted = True
            reg.save()
        else:
            reg = LandingPageRegistration(
                name=student_name or 'Referred Student',
                phone=student_mobile or '',
                email=student_email or '',
                student_class=student_class or 'Class X',
                course_type=course_name or 'Pathfinder Program',
                centre=centre or 'Hazra (Head Office, Kolkata)',
                page_source=f"Paid Referral ({p_id})",
                referral_id=p_id,
                is_paid=True,
                amount_paid=amount,
                txn_ref=merchant_txn_no,
                is_contacted=True,
                created_at=datetime.datetime.utcnow()
            )
            reg.save()
        return reg
    except Exception as e:
        print(f"Error saving paid LandingPageRegistration: {e}")
        return None


@api_view(['GET'])
@permission_classes([AllowAny])
def admin_get_paid_referrals(request):
    """
    Admin endpoint to fetch list of all paid referral students and their 10% bonus partner payouts.
    """
    try:
        paid_leads = list(LandingPageRegistration.objects(is_paid=True))
        all_bonuses = list(ShikshaBandhuBonus.objects.all())

        results = []
        for lead in paid_leads:
            lead_id_str = str(lead.id)
            bonus_rec = next((b for b in all_bonuses if b.lead_id == lead_id_str or b.student_name == lead.name), None)
            bonus = bonus_rec.bonus_amount if bonus_rec else int(round((lead.amount_paid or 4500) * 0.10))

            results.append({
                'id': lead_id_str,
                'studentName': lead.name,
                'email': lead.email or 'N/A',
                'phone': lead.phone,
                'studentClass': lead.student_class or 'N/A',
                'centre': lead.centre or 'Main Centre',
                'course': lead.course_type,
                'referralId': lead.referral_id or 'DIRECT',
                'amountPaid': lead.amount_paid or 4500,
                'bonusAmount': bonus,
                'txnRef': lead.txn_ref or 'PAID-ONLINE',
                'created_at': lead.created_at.strftime('%d %b %Y, %I:%M %p') if lead.created_at else 'Recent'
            })

        return Response({'success': True, 'paid_referrals': results, 'count': len(results)})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


DEFAULT_MOCK_TEST_PRODUCTS = [
    {
        "id": "madhyamik-2027",
        "slug": "madhyamik",
        "title": "Madhyamik Mock Test 2027",
        "board": "WBBSE",
        "class_name": "Class X",
        "price": 4500,
        "description": "Prepare smarter with mock tests, checked answer scripts and the Key to Success booklet.",
        "includes": ["Mock Test 1", "Mock Test 2", "Checked Answer Scripts", "Key to Success Booklet"],
        "featured": True,
        "status": "active"
    },
    {
        "id": "cbse-x",
        "slug": "cbse-x",
        "title": "CBSE Class X Mock Test",
        "board": "CBSE",
        "class_name": "Class X",
        "price": 7500,
        "description": "Pre-mock and full mock tests with expert-checked answer scripts for CBSE Class X.",
        "includes": ["Pre-Mock Tests", "Mock Tests", "Checked Answer Scripts", "Key to Success Booklet"],
        "featured": False,
        "status": "active"
    },
    {
        "id": "cbse-xii",
        "slug": "cbse-xii",
        "title": "CBSE Class XII Mock Test",
        "board": "CBSE",
        "class_name": "Class XII",
        "price": 7500,
        "description": "Two full mock tests for 5 subjects with corrected answer scripts of CBSE toppers.",
        "includes": ["Mock Test 1", "Mock Test 2", "Checked Answer Scripts", "Key to Success Booklet"],
        "featured": False,
        "status": "active"
    },
    {
        "id": "icse-x",
        "slug": "icse-x",
        "title": "ICSE Class X Mock Test",
        "board": "ICSE",
        "class_name": "Class X",
        "price": 7500,
        "description": "ICSE Class X Board Examination Mock Series with subject-wise evaluation.",
        "includes": ["Mock Test 1", "Checked Answer Scripts", "Key to Success Booklet"],
        "featured": False,
        "status": "active"
    },
    {
        "id": "isc-xii",
        "slug": "isc-xii",
        "title": "ISC Class XII Mock Test",
        "board": "ISC",
        "class_name": "Class XII",
        "price": 7500,
        "description": "Comprehensive ISC Class XII 5-Subject Mock Exam with Examiner Notes.",
        "includes": ["Mock Test 1", "Mock Test 2", "Checked Answer Scripts", "Key to Success Booklet"],
        "featured": False,
        "status": "active"
    },
    {
        "id": "hs-xii-2027",
        "slug": "hs-xii",
        "title": "Higher Secondary (HS) Mock Test 2027",
        "board": "WBCHSE",
        "class_name": "Class XII",
        "price": 5500,
        "description": "West Bengal Higher Secondary 2027 board exam mock series with evaluated answer copies.",
        "includes": ["Full Length Mock Test", "Checked Answer Scripts", "Key to Success Booklet"],
        "featured": False,
        "status": "active"
    }
]


def seed_default_products_if_empty():
    """Seed initial Shiksha Bandhu products into Mongo DB if collection is empty."""
    try:
        if ShikshaBandhuItem.objects.count() == 0:
            for p in DEFAULT_MOCK_TEST_PRODUCTS:
                item = ShikshaBandhuItem(
                    title=p["title"],
                    slug=p["slug"],
                    board=p["board"],
                    class_name=p["class_name"],
                    price=p["price"],
                    description=p["description"],
                    includes=p["includes"],
                    featured=p["featured"],
                    status=p["status"]
                )
                item.save()
    except Exception as e:
        print(f"Error seeding products: {e}")

try:
    seed_default_products_if_empty()
except Exception as _e:
    pass


@api_view(['GET'])
@permission_classes([AllowAny])
def list_items(request):
    """Public/Admin endpoint to fetch Shiksha Bandhu products (defaults to active items only unless show_all parameter passed)."""
    try:
        seed_default_products_if_empty()
        show_all = request.GET.get('show_all', 'false').lower() == 'true'

        if show_all:
            items = ShikshaBandhuItem.objects.all()
        else:
            items = ShikshaBandhuItem.objects(status='active')

        result = []
        for item in items:
            result.append({
                'id': str(item.id),
                'title': item.title,
                'name': item.title,
                'slug': item.slug or item.title.lower().replace(' ', '-'),
                'board': item.board,
                'className': item.class_name,
                'class_name': item.class_name,
                'price': item.price,
                'description': item.description or '',
                'includes': item.includes or [],
                'featured': item.featured,
                'status': item.status,
                'created_at': item.created_at.strftime('%d %b %Y') if item.created_at else ''
            })

        return Response({'success': True, 'products': result, 'count': len(result)})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def create_item(request):
    """Admin endpoint to create a new Shiksha Bandhu product item."""
    try:
        data = request.data
        title = data.get('title') or data.get('name')
        if not title:
            return Response({'error': 'Title / Product name is required.'}, status=status.HTTP_400_BAD_REQUEST)

        includes = data.get('includes', [])
        if isinstance(includes, str):
            includes = [i.strip() for i in includes.split(',') if i.strip()]

        item = ShikshaBandhuItem(
            title=title,
            slug=data.get('slug') or title.lower().replace(' ', '-'),
            board=data.get('board', 'WBBSE'),
            class_name=data.get('class_name') or data.get('className') or 'Class X',
            price=int(data.get('price') or 4500),
            description=data.get('description', ''),
            includes=includes,
            featured=bool(data.get('featured', False)),
            status=data.get('status', 'active')
        )
        item.save()

        return Response({
            'success': True,
            'message': 'Product item created successfully.',
            'product': {
                'id': str(item.id),
                'title': item.title,
                'name': item.title,
                'board': item.board,
                'price': item.price,
                'status': item.status
            }
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PATCH', 'PUT'])
@permission_classes([AllowAny])
def update_item(request, item_id):
    """Admin endpoint to update an existing Shiksha Bandhu product item."""
    try:
        item = ShikshaBandhuItem.objects(id=item_id).first()
        if not item:
            return Response({'error': 'Product item not found.'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        if 'title' in data or 'name' in data:
            item.title = data.get('title') or data.get('name')
        if 'slug' in data:
            item.slug = data.get('slug')
        if 'board' in data:
            item.board = data.get('board')
        if 'class_name' in data or 'className' in data:
            item.class_name = data.get('class_name') or data.get('className')
        if 'price' in data:
            item.price = int(data.get('price'))
        if 'description' in data:
            item.description = data.get('description')
        if 'includes' in data:
            inc = data.get('includes')
            item.includes = [i.strip() for i in inc.split(',') if i.strip()] if isinstance(inc, str) else inc
        if 'featured' in data:
            item.featured = bool(data.get('featured'))
        if 'status' in data:
            item.status = data.get('status')

        item.updated_at = datetime.datetime.utcnow()
        item.save()

        return Response({'success': True, 'message': 'Product item updated successfully.'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_item(request, item_id):
    """
    Admin endpoint to delete a product item.
    Permanently deletes item from database.
    """
    try:
        item = ShikshaBandhuItem.objects(id=item_id).first()
        if not item:
            return Response({'error': 'Product item not found.'}, status=status.HTTP_404_NOT_FOUND)

        item.delete()
        return Response({'success': True, 'message': 'Product item deleted successfully.'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


