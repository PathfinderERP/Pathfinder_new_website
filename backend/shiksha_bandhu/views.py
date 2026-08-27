import datetime
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import ShikshaBandhuPartner, ShikshaBandhuClick, ShikshaBandhuBonus
from landing_registrations.models import LandingPageRegistration


BASE_DEMO_REFERRALS = []


def seed_default_partner_if_needed():
    """Ensure default partner SB004 exists in MongoDB."""
    try:
        partner = ShikshaBandhuPartner.objects(partner_id='SB004').first()
        if not partner:
            partner = ShikshaBandhuPartner(
                partner_id='SB004',
                name='Rahul Das',
                mobile='+91 91471 78886',
                email='rahul.das@example.com',
                password='demo123',
                status='active',
                joined_on=datetime.datetime(2026, 2, 12)
            )
            partner.save()
    except Exception as e:
        print(f"Error seeding default partner: {e}")


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

    return Response({'error': 'Invalid Shiksha Bandhu credentials.'}, status=status.HTTP_401_UNAUTHORIZED)


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
def get_partner_stats(request, partner_id):
    """Fetch live stats, referral leads, and earnings history for a partner."""
    seed_default_partner_if_needed()
    p_id = partner_id.strip().upper()
    
    # Real DB Clicks
    total_clicks = ShikshaBandhuClick.objects(partner_id=p_id).count()

    # Real DB Leads submitted with referral_id = p_id
    db_leads = list(LandingPageRegistration.objects(referral_id__iexact=p_id))
    total_registrations = len(db_leads)

    # Real DB Bonus records
    bonuses = list(ShikshaBandhuBonus.objects(partner_id=p_id))
    
    # Calculate successful and bonus from DB
    total_successful = sum(1 for b in bonuses if b.status == 'Successful')
    total_bonus = sum(b.bonus_amount for b in bonuses if b.status == 'Successful')
    total_pending = sum(b.bonus_amount for b in bonuses if b.status == 'Pending')
    this_month_bonus = total_bonus

    # Build referrals list (Base demo + real DB leads)
    referrals_list = []
    
    # Add base demo referrals if SB004
    if p_id == 'SB004':
        for item in BASE_DEMO_REFERRALS:
            # Check if updated in bonus model
            b_rec = next((b for b in bonuses if b.lead_id == item['id']), None)
            referrals_list.append({
                'id': item['id'],
                'student': item['student'],
                'studentName': item['studentName'],
                'mobile': item['mobile'],
                'program': item['program'],
                'date': item['date'],
                'status': b_rec.status if b_rec else item['status'],
                'bonus': b_rec.bonus_amount if (b_rec and b_rec.status == 'Successful') else item['bonus']
            })

    # Add real leads from MongoDB
    for idx, lead in enumerate(db_leads, start=1050):
        lead_id_str = str(lead.id)
        b_rec = next((b for b in bonuses if b.lead_id == lead_id_str), None)
        referrals_list.append({
            'id': lead_id_str,
            'student': f"Student #{idx}",
            'studentName': lead.name,
            'mobile': lead.phone,
            'program': lead.course_type or 'Pathfinder Mock Test',
            'date': lead.created_at.strftime('%d %b %Y') if lead.created_at else 'Today',
            'status': b_rec.status if b_rec else ('Successful' if lead.is_contacted else 'Pending'),
            'bonus': b_rec.bonus_amount if (b_rec and b_rec.status == 'Successful') else 250
        })

    # Build bonus history
    bonus_history = [
        {'date': r['date'], 'program': r['program'], 'referral': r['student'], 'status': r['status'], 'bonus': r['bonus'] or 250}
        for r in referrals_list if r['status'] != 'Cancelled'
    ]

    partner_doc = ShikshaBandhuPartner.objects(partner_id=p_id).first()

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
            'successfulReferrals': total_successful,
            'totalBonus': total_bonus,
            'pendingBonus': total_pending,
            'thisMonth': this_month_bonus
        },
        'referrals': referrals_list,
        'bonusHistory': bonus_history
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def admin_list_partners(request):
    """Admin endpoint to fetch all Shiksha Bandhu partners and system summary."""
    seed_default_partner_if_needed()
    partners = list(ShikshaBandhuPartner.objects.all())
    leads = list(LandingPageRegistration.objects(referral_id__ne=None))

    partner_data = []
    for p in partners:
        p_id = p.partner_id.upper()
        p_clicks = ShikshaBandhuClick.objects(partner_id=p_id).count()
        p_leads = sum(1 for l in leads if l.referral_id and l.referral_id.upper() == p_id)
        
        p_bonuses = list(ShikshaBandhuBonus.objects(partner_id=p_id))
        p_earned = sum(b.bonus_amount for b in p_bonuses if b.status == 'Successful')
        p_successful = sum(1 for b in p_bonuses if b.status == 'Successful')

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
    bonuses = {b.lead_id: b for b in ShikshaBandhuBonus.objects.all()}

    ref_list = []
    
    # Add base demo referrals
    for item in BASE_DEMO_REFERRALS:
        b_rec = bonuses.get(item['id'])
        ref_list.append({
            'id': item['id'],
            'displayId': item['displayId'],
            'partnerId': 'SB004',
            'studentName': item['studentName'],
            'mobile': item['mobile'],
            'program': item['program'],
            'date': item['date'],
            'status': b_rec.status if b_rec else item['status'],
            'bonusAmount': b_rec.bonus_amount if b_rec else item['bonus']
        })

    # Add real MongoDB leads
    for idx, lead in enumerate(leads, start=1050):
        lead_id_str = str(lead.id)
        b_rec = bonuses.get(lead_id_str)
        ref_list.append({
            'id': lead_id_str,
            'displayId': f"L-{idx}",
            'partnerId': (lead.referral_id or 'SB004').upper(),
            'studentName': lead.name,
            'mobile': lead.phone,
            'program': lead.course_type or 'Pathfinder Mock Test',
            'date': lead.created_at.strftime('%d %b %Y') if lead.created_at else 'Today',
            'status': b_rec.status if b_rec else ('Successful' if lead.is_contacted else 'Pending'),
            'bonusAmount': b_rec.bonus_amount if b_rec else 250
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
                lead.save()
        except Exception:
            pass

        return Response({'success': True, 'referral_id': referral_id, 'status': new_status, 'bonus': bonus_amount})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
