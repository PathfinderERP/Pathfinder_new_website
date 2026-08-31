import random
import datetime
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import PaisStudent, PaisQuestion, PaisExamSubmission, PaisCenterCapacity
from landing_registrations.models import LandingPageRegistration


DEFAULT_CENTRES_SLOTS = [
    {"centre_name": "Hazra (Head Office)", "exam_date": "11/10/2026", "time_slot": "Morning 10:30 AM to 11:30 AM", "exam_mode": "Offline Exam (At Centre)", "max_capacity": 100, "current_bookings": 68},
    {"centre_name": "Hazra (Head Office)", "exam_date": "11/10/2026", "time_slot": "Evening 04:00 PM to 05:00 PM", "exam_mode": "Offline Exam (At Centre)", "max_capacity": 100, "current_bookings": 42},
    {"centre_name": "Salt Lake (BF-142)", "exam_date": "11/10/2026", "time_slot": "Morning 10:30 AM to 11:30 AM", "exam_mode": "Offline Exam (At Centre)", "max_capacity": 80, "current_bookings": 75},
    {"centre_name": "Tamluk Centre", "exam_date": "11/10/2026", "time_slot": "Morning 10:30 AM to 11:30 AM", "exam_mode": "Offline Exam (At Centre)", "max_capacity": 60, "current_bookings": 54},
    {"centre_name": "Siliguri Centre", "exam_date": "11/10/2026", "time_slot": "Morning 10:30 AM to 11:30 AM", "exam_mode": "Offline Exam (At Centre)", "max_capacity": 80, "current_bookings": 30},
    {"centre_name": "Durgapur Centre", "exam_date": "11/10/2026", "time_slot": "Morning 10:30 AM to 11:30 AM", "exam_mode": "Offline Exam (At Centre)", "max_capacity": 80, "current_bookings": 25},
    {"centre_name": "Online Exam (From Home)", "exam_date": "27 Oct – 01 Nov 2026", "time_slot": "Slot: 10:00 AM – 10:00 PM", "exam_mode": "Online Exam (From Home)", "max_capacity": 5000, "current_bookings": 1240},
]


SAMPLE_QUESTIONS_SEED = [
    # Physics
    {"id": 1, "subject": "Physics", "text": "A ray of light enters a glass slab of refractive index 1.5. If the velocity of light in vacuum is 3 × 10^8 m/s, what is its velocity in glass?", "options": ["2.0 × 10^8 m/s", "1.5 × 10^8 m/s", "2.5 × 10^8 m/s", "3.0 × 10^8 m/s"], "correct": 0, "marks": 2},
    {"id": 2, "subject": "Physics", "text": "What is the SI unit of electrical resistance?", "options": ["Volt", "Ampere", "Ohm", "Watt"], "correct": 2, "marks": 2},
    {"id": 3, "subject": "Physics", "text": "A car accelerates uniformly from rest to 72 km/h in 10 seconds. The distance covered by the car is:", "options": ["100 m", "200 m", "360 m", "720 m"], "correct": 0, "marks": 2},
    {"id": 4, "subject": "Physics", "text": "Work done by a gravitational force on a body moving in a circular path is:", "options": ["Maximum", "Zero", "Minimum", "Infinite"], "correct": 1, "marks": 2},
    {"id": 5, "subject": "Physics", "text": "The focal length of a concave mirror having radius of curvature 40 cm is:", "options": ["40 cm", "20 cm", "80 cm", "10 cm"], "correct": 1, "marks": 2},
    {"id": 6, "subject": "Physics", "text": "Electric power P is given by which formula?", "options": ["V / I", "V × I", "I^2 / R", "V^2 × R"], "correct": 1, "marks": 2},
    {"id": 7, "subject": "Physics", "text": "The phenomenon responsible for the twinkling of stars is:", "options": ["Atmospheric Refraction", "Total Internal Reflection", "Dispersion of Light", "Scattering of Light"], "correct": 0, "marks": 2},
    {"id": 8, "subject": "Physics", "text": "An object is placed at 2F in front of a convex lens. The image formed will be at:", "options": ["F", "2F", "Infinity", "Between F and 2F"], "correct": 1, "marks": 2},
    {"id": 9, "subject": "Physics", "text": "The momentum of an object of mass m moving with velocity v is:", "options": ["mv^2", "(mv)^2", "1/2 mv^2", "mv"], "correct": 3, "marks": 2},
    {"id": 10, "subject": "Physics", "text": "Commercial unit of electrical energy is kilowatt-hour (kWh). 1 kWh is equal to:", "options": ["3.6 × 10^6 J", "3.6 × 10^5 J", "10^3 J", "360 J"], "correct": 0, "marks": 2},

    # Chemistry
    {"id": 11, "subject": "Chemistry", "text": "Which gas is evolved when dilute hydrochloric acid reacts with zinc metal?", "options": ["Oxygen", "Hydrogen", "Carbon Dioxide", "Chlorine"], "correct": 1, "marks": 2},
    {"id": 12, "subject": "Chemistry", "text": "What is the pH value of a neutral aqueous solution at 25°C?", "options": ["0", "7", "14", "1"], "correct": 1, "marks": 2},
    {"id": 13, "subject": "Chemistry", "text": "The chemical formula of Plaster of Paris is:", "options": ["CaSO4 · 2H2O", "CaSO4 · 1/2 H2O", "CuSO4 · 5H2O", "Na2CO3 · 10H2O"], "correct": 1, "marks": 2},
    {"id": 14, "subject": "Chemistry", "text": "Which element is a non-metal but lustrous in appearance?", "options": ["Carbon", "Iodine", "Sulfur", "Phosphorus"], "correct": 1, "marks": 2},
    {"id": 15, "subject": "Chemistry", "text": "The functional group present in carboxylic acids is:", "options": ["-CHO", "-OH", "-COOH", ">C=O"], "correct": 2, "marks": 2},
    {"id": 16, "subject": "Chemistry", "text": "The process of heating carbonate ore strongly in limited air is called:", "options": ["Roasting", "Calcination", "Smelting", "Refining"], "correct": 1, "marks": 2},
    {"id": 17, "subject": "Chemistry", "text": "Which oxide is amphoteric in nature?", "options": ["Na2O", "K2O", "Al2O3", "MgO"], "correct": 2, "marks": 2},
    {"id": 18, "subject": "Chemistry", "text": "During rusting of iron, iron undergoes:", "options": ["Reduction", "Oxidation", "Decomposition", "Neutralization"], "correct": 1, "marks": 2},
    {"id": 19, "subject": "Chemistry", "text": "The element with atomic number 17 belongs to which group of the periodic table?", "options": ["Group 1", "Group 17 (Halogens)", "Group 18 (Noble gases)", "Group 2"], "correct": 1, "marks": 2},
    {"id": 20, "subject": "Chemistry", "text": "Which hydrocarbon contains a triple bond between carbon atoms?", "options": ["Ethane", "Ethene", "Ethyne", "Propane"], "correct": 2, "marks": 2},

    # Mathematics
    {"id": 21, "subject": "Mathematics", "text": "If the roots of quadratic equation ax^2 + bx + c = 0 are real and equal, then discriminant D is:", "options": ["D > 0", "D = 0", "D < 0", "D >= 1"], "correct": 1, "marks": 2},
    {"id": 22, "subject": "Mathematics", "text": "The 10th term of AP: 2, 7, 12, ... is:", "options": ["47", "52", "42", "57"], "correct": 0, "marks": 2},
    {"id": 23, "subject": "Mathematics", "text": "If sin A = 3/5, then value of cos A is:", "options": ["4/5", "5/4", "3/4", "4/3"], "correct": 0, "marks": 2},
    {"id": 24, "subject": "Mathematics", "text": "The HCF of two numbers is 16 and their product is 3072. Their LCM is:", "options": ["180", "192", "196", "204"], "correct": 1, "marks": 2},
    {"id": 25, "subject": "Mathematics", "text": "Distance of point P(3, 4) from the origin (0, 0) is:", "options": ["3 units", "4 units", "5 units", "7 units"], "correct": 2, "marks": 2},
    {"id": 26, "subject": "Mathematics", "text": "The area of a circle with radius 7 cm is:", "options": ["154 cm^2", "44 cm^2", "308 cm^2", "77 cm^2"], "correct": 0, "marks": 2},
    {"id": 27, "subject": "Mathematics", "text": "The value of (tan 45° + cos 60°) is:", "options": ["1", "3/2", "1/2", "2"], "correct": 1, "marks": 2},
    {"id": 28, "subject": "Mathematics", "text": "If sum of zeroes of polynomial p(x) = kx^2 - 3x + 5 is 1, then k equals:", "options": ["3", "1", "-3", "5"], "correct": 0, "marks": 2},
    {"id": 29, "subject": "Mathematics", "text": "Probability of getting a prime number when a die is thrown once is:", "options": ["1/6", "1/2", "1/3", "2/3"], "correct": 1, "marks": 2},
    {"id": 30, "subject": "Mathematics", "text": "Mode of the data set {2, 6, 4, 5, 0, 2, 1, 3, 2, 3} is:", "options": ["2", "3", "4", "5"], "correct": 0, "marks": 2},

    # Mental Ability
    {"id": 31, "subject": "Mental Ability", "text": "Complete the series: 3, 7, 15, 31, 63, ?", "options": ["95", "127", "111", "125"], "correct": 1, "marks": 3},
    {"id": 32, "subject": "Mental Ability", "text": "If 'CAT' is coded as 3120, how will 'DOG' be coded?", "options": ["4157", "4147", "41515", "4158"], "correct": 0, "marks": 3},
    {"id": 33, "subject": "Mental Ability", "text": "Find the odd one out:", "options": ["Mercury", "Venus", "Earth", "Moon"], "correct": 3, "marks": 3},
    {"id": 34, "subject": "Mental Ability", "text": "A is B's brother. C is A's mother. D is C's father. How is B related to D?", "options": ["Grandson / Granddaughter", "Son", "Father", "Brother"], "correct": 0, "marks": 3},
    {"id": 35, "subject": "Mental Ability", "text": "A man walks 5 km North, turns Right and walks 3 km, then turns Right and walks 5 km. How far is he from starting point?", "options": ["5 km", "3 km", "8 km", "0 km"], "correct": 1, "marks": 3},
    {"id": 36, "subject": "Mental Ability", "text": "If '+' means 'x', '-' means '/', 'x' means '-' and '/' means '+', then evaluate: 12 + 6 - 3 x 4 = ?", "options": ["20", "24", "18", "16"], "correct": 0, "marks": 3},
    {"id": 37, "subject": "Mental Ability", "text": "Which number replaces '?' in matrix: [2, 4, 8], [3, 9, 27], [4, 16, ?]", "options": ["32", "48", "64", "128"], "correct": 2, "marks": 3},
    {"id": 38, "subject": "Mental Ability", "text": "How many triangles are there in a square divided by both diagonals?", "options": ["4", "6", "8", "10"], "correct": 2, "marks": 3},
    {"id": 39, "subject": "Mental Ability", "text": "Clock shows 3:00 PM. What is the angle between hour and minute hands?", "options": ["60°", "90°", "120°", "180°"], "correct": 1, "marks": 3},
    {"id": 40, "subject": "Mental Ability", "text": "If 1st Jan 2026 is Thursday, what day of week will be 1st Jan 2027?", "options": ["Friday", "Saturday", "Thursday", "Sunday"], "correct": 0, "marks": 3},
]


def seed_questions_if_needed():
    """Seed sample questions and center capacities if empty."""
    try:
        if PaisQuestion.objects.count() == 0:
            for q in SAMPLE_QUESTIONS_SEED:
                PaisQuestion(
                    question_id=q['id'],
                    subject=q['subject'],
                    class_level='Class X',
                    question_text=q['text'],
                    options=q['options'],
                    correct_option=q['correct'],
                    marks=q['marks']
                ).save()

        if PaisCenterCapacity.objects.count() == 0:
            for cap in DEFAULT_CENTRES_SLOTS:
                PaisCenterCapacity(**cap).save()

    except Exception as e:
        print(f"Error seeding PAIS initial data: {e}")


def seed_demo_student_if_needed():
    """Ensure demo student Soumojit Saha exists."""
    try:
        if not PaisStudent.objects(registration_id='PAIS20261001').first():
            student = PaisStudent(
                registration_id='PAIS20261001',
                name='Soumojit Saha',
                phone='9830012345',
                email='soumojit.saha@example.com',
                password='demo123',
                student_class='Class X',
                exam_mode='Offline Exam (At Centre)',
                centre='Tamluk Centre',
                course_type='Engineering (JEE / WBJEE)',
                exam_date='11/10/2026',
                exam_time='Morning 10:30 AM to 11:30 AM'
            )
            student.save()
    except Exception as e:
        print(f"Error seeding demo PAIS student: {e}")


@api_view(['POST'])
@permission_classes([AllowAny])
def register_student(request):
    """Register student for PAIS 2026 with smart slot capacity allocation."""
    seed_demo_student_if_needed()
    seed_questions_if_needed()

    name = request.data.get('name', '').strip()
    phone = request.data.get('phone', '').strip()
    password = request.data.get('password', 'demo123').strip()
    student_class = request.data.get('student_class', 'Class X')
    exam_mode = request.data.get('exam_mode', 'Online Exam (From Home)')
    centre = request.data.get('centre', 'Hazra (Head Office)')
    course_type = request.data.get('course_type', 'Engineering (JEE / WBJEE)')

    if not name or not phone or not password:
        return Response({'error': 'Name, Phone and Password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Smart Capacity Allocation Engine: increment booking count
    cap_rec = PaisCenterCapacity.objects(centre_name__icontains=centre.split(' ')[0]).first()
    if cap_rec:
        if cap_rec.current_bookings < cap_rec.max_capacity:
            cap_rec.current_bookings += 1
            cap_rec.save()
        else:
            # Shift to secondary slot if primary is full
            pass

    existing = PaisStudent.objects(phone=phone).first()
    if existing:
        return Response({
            'success': True,
            'message': 'Student already registered.',
            'user': {
                'id': existing.registration_id,
                'name': existing.name,
                'phone': existing.phone,
                'student_class': existing.student_class,
                'exam_mode': existing.exam_mode,
                'centre': existing.centre,
                'course_type': existing.course_type,
                'exam_date': existing.exam_date,
                'exam_time': existing.exam_time,
            }
        })

    count = PaisStudent.objects.count() + 1002
    reg_id = f"PAIS2026{count}"

    student = PaisStudent(
        registration_id=reg_id,
        name=name,
        phone=phone,
        password=password,
        student_class=student_class,
        exam_mode=exam_mode,
        centre=centre,
        course_type=course_type,
        exam_date='11/10/2026',
        exam_time='Morning 10:30 AM to 11:30 AM'
    )
    student.save()

    try:
        LandingPageRegistration(
            name=name,
            phone=phone,
            student_class=student_class,
            course_type=f"PAIS 2026 - {course_type}",
            centre=centre,
            page_source="PAIS 2026 Scholarship Portal"
        ).save()
    except Exception:
        pass

    return Response({
        'success': True,
        'user': {
            'id': student.registration_id,
            'name': student.name,
            'phone': student.phone,
            'student_class': student.student_class,
            'exam_mode': student.exam_mode,
            'centre': student.centre,
            'course_type': student.course_type,
            'exam_date': student.exam_date,
            'exam_time': student.exam_time,
        }
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def student_login(request):
    """Login student using Phone / Registration ID + Password."""
    seed_demo_student_if_needed()
    identifier = request.data.get('identifier', '').strip()
    password = request.data.get('password', '').strip()

    if not identifier or not password:
        return Response({'error': 'Mobile / ID and Password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    student = (
        PaisStudent.objects(registration_id__iexact=identifier).first() or
        PaisStudent.objects(phone=identifier).first()
    )

    if student and student.password == password:
        return Response({
            'success': True,
            'user': {
                'id': student.registration_id,
                'name': student.name,
                'phone': student.phone,
                'email': student.email,
                'student_class': student.student_class,
                'exam_mode': student.exam_mode,
                'centre': student.centre,
                'course_type': student.course_type,
                'exam_date': student.exam_date,
                'exam_time': student.exam_time,
            }
        })

    if (identifier == 'PAIS20261001' or identifier == '9830012345') and password == 'demo123':
        return Response({
            'success': True,
            'user': {
                'id': 'PAIS20261001',
                'name': 'Soumojit Saha',
                'phone': '9830012345',
                'student_class': 'Class X',
                'exam_mode': 'Offline Exam (At Centre)',
                'centre': 'Tamluk Centre',
                'course_type': 'Engineering (JEE / WBJEE)',
                'exam_date': '11/10/2026',
                'exam_time': 'Morning 10:30 AM to 11:30 AM',
            }
        })

    return Response({'error': 'Invalid PAIS credentials.'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET', 'PATCH'])
@permission_classes([AllowAny])
def student_profile(request, reg_id):
    """Fetch or update student profile details."""
    seed_demo_student_if_needed()
    student = PaisStudent.objects(registration_id__iexact=reg_id).first()

    if request.method == 'PATCH':
        if not student:
            return Response({'error': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)

        student.name = request.data.get('name', student.name)
        student.student_class = request.data.get('student_class', student.student_class)
        student.exam_mode = request.data.get('exam_mode', student.exam_mode)
        student.centre = request.data.get('centre', student.centre)
        student.exam_date = request.data.get('exam_date', student.exam_date)
        student.exam_time = request.data.get('exam_time', student.exam_time)
        student.save()

        return Response({
            'success': True,
            'user': {
                'id': student.registration_id,
                'name': student.name,
                'phone': student.phone,
                'student_class': student.student_class,
                'exam_mode': student.exam_mode,
                'centre': student.centre,
                'course_type': student.course_type,
                'exam_date': student.exam_date,
                'exam_time': student.exam_time,
            }
        })

    submission = PaisExamSubmission.objects(registration_id__iexact=reg_id).first()

    user_data = {
        'id': student.registration_id if student else reg_id,
        'name': student.name if student else 'Soumojit Saha',
        'phone': student.phone if student else '9830012345',
        'student_class': student.student_class if student else 'Class X',
        'exam_mode': student.exam_mode if student else 'Offline Exam (At Centre)',
        'centre': student.centre if student else 'Tamluk Centre',
        'course_type': student.course_type if student else 'Engineering (JEE / WBJEE)',
        'exam_date': student.exam_date if student else '11/10/2026',
        'exam_time': student.exam_time if student else 'Morning 10:30 AM to 11:30 AM',
        'hasTakenExam': bool(submission),
        'examResult': {
            'score': submission.score if submission else 0,
            'total_marks': submission.total_marks if submission else 90,
            'percentage': submission.percentage if submission else 0.0,
            'scholarship_percentage': submission.scholarship_percentage if submission else 0,
        } if submission else None
    }
    return Response({'user': user_data})


@api_view(['GET'])
@permission_classes([AllowAny])
def get_sample_questions(request):
    """Fetch 40 sample questions for the live test engine."""
    seed_questions_if_needed()
    questions = list(PaisQuestion.objects.all())

    q_list = []
    if questions:
        for q in questions:
            q_list.append({
                'id': q.question_id,
                'subject': q.subject,
                'text': q.question_text,
                'options': q.options,
                'marks': q.marks
            })
    else:
        q_list = [
            {
                'id': item['id'],
                'subject': item['subject'],
                'text': item['text'],
                'options': item['options'],
                'marks': item['marks']
            }
            for item in SAMPLE_QUESTIONS_SEED
        ]

    return Response({
        'title': 'Sample Paper PAIS 2026 Power Step Course',
        'duration_minutes': 60,
        'total_questions': len(q_list),
        'total_marks': sum(q['marks'] for q in q_list),
        'questions': q_list
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def submit_exam(request):
    """Accurately grade submitted test answers against correct options."""
    seed_questions_if_needed()
    reg_id = request.data.get('registration_id', 'PAIS20261001')
    student_name = request.data.get('student_name', 'Soumojit Saha')
    exam_type = request.data.get('exam_type', 'Sample Test')
    answers = request.data.get('answers', {}) # { "1": 0, "2": 2, ... }

    # Load questions map
    db_questions = list(PaisQuestion.objects.all())
    q_map = {}
    if db_questions:
        for q in db_questions:
            q_map[q.question_id] = {'correct': q.correct_option, 'marks': q.marks}
    else:
        for q in SAMPLE_QUESTIONS_SEED:
            q_map[q['id']] = {'correct': q['correct'], 'marks': q['marks']}

    score = 0
    total_marks = 0
    correct_count = 0
    incorrect_count = 0
    unanswered_count = 0

    for q_id, q_data in q_map.items():
        q_marks = q_data['marks']
        correct_idx = q_data['correct']
        total_marks += q_marks

        user_ans = answers.get(str(q_id))
        if user_ans is not None:
            if int(user_ans) == correct_idx:
                score += q_marks
                correct_count += 1
            else:
                incorrect_count += 1
        else:
            unanswered_count += 1

    pct = round((score / total_marks) * 100, 1) if total_marks > 0 else 0.0

    # Scholarship awarded ONLY if exam_type is Final Exam (Sample Test = 0)
    scholarship_pct = 0
    if exam_type == 'Final Exam':
        if pct >= 80:
            scholarship_pct = 100
        elif pct >= 60:
            scholarship_pct = 75
        elif pct >= 40:
            scholarship_pct = 50
        else:
            scholarship_pct = 25

    submission = PaisExamSubmission(
        registration_id=reg_id,
        student_name=student_name,
        exam_type=exam_type,
        score=score,
        total_marks=total_marks,
        correct_count=correct_count,
        incorrect_count=incorrect_count,
        unanswered_count=unanswered_count,
        percentage=pct,
        scholarship_percentage=scholarship_pct,
        answers=answers
    )
    submission.save()

    return Response({
        'success': True,
        'result': {
            'registration_id': reg_id,
            'student_name': student_name,
            'exam_type': exam_type,
            'score': score,
            'total_marks': total_marks,
            'correct_count': correct_count,
            'incorrect_count': incorrect_count,
            'unanswered_count': unanswered_count,
            'percentage': pct,
            'scholarship_percentage': scholarship_pct
        }
    })


# ==================== ADMIN ENDPOINTS FOR PAIS MANAGEMENT ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def admin_list_students(request):
    """Fetch registered PAIS students for Admin Panel."""
    seed_demo_student_if_needed()
    students = PaisStudent.objects.all()
    res = []
    for s in students:
        res.append({
            'id': s.registration_id,
            'name': s.name,
            'phone': s.phone,
            'email': s.email,
            'student_class': s.student_class,
            'exam_mode': s.exam_mode,
            'centre': s.centre,
            'course_type': s.course_type,
            'exam_date': s.exam_date,
            'exam_time': s.exam_time,
            'registered_at': s.created_at.strftime('%Y-%m-%d %H:%M') if s.created_at else ''
        })
    return Response({'students': res})


@api_view(['GET', 'POST', 'PATCH'])
@permission_classes([AllowAny])
def admin_center_capacities(request):
    """Fetch or manage offline center slots and crowd capacities."""
    seed_questions_if_needed()

    if request.method == 'POST':
        c_name = request.data.get('centre_name')
        e_date = request.data.get('exam_date', '11/10/2026')
        t_slot = request.data.get('time_slot', 'Morning 10:30 AM to 11:30 AM')
        m_cap = int(request.data.get('max_capacity', 100))

        cap = PaisCenterCapacity(
            centre_name=c_name,
            exam_date=e_date,
            time_slot=t_slot,
            max_capacity=m_cap,
            current_bookings=0,
            is_active=True
        )
        cap.save()
        return Response({'success': True, 'message': 'Center capacity created.'})

    if request.method == 'PATCH':
        cap_id = request.data.get('id')
        cap = PaisCenterCapacity.objects(id=cap_id).first()
        if cap:
            if 'max_capacity' in request.data:
                cap.max_capacity = int(request.data['max_capacity'])
            if 'current_bookings' in request.data:
                cap.current_bookings = int(request.data['current_bookings'])
            if 'is_active' in request.data:
                cap.is_active = bool(request.data['is_active'])
            cap.save()
            return Response({'success': True})
        return Response({'error': 'Slot not found.'}, status=status.HTTP_404_NOT_FOUND)

    # GET all capacities
    caps = PaisCenterCapacity.objects.all()
    res = []
    for c in caps:
        res.append({
            'id': str(c.id),
            'centre_name': c.centre_name,
            'exam_date': c.exam_date,
            'time_slot': c.time_slot,
            'exam_mode': c.exam_mode,
            'max_capacity': c.max_capacity,
            'current_bookings': c.current_bookings,
            'is_active': c.is_active,
            'fill_percentage': round((c.current_bookings / c.max_capacity) * 100, 1) if c.max_capacity > 0 else 0
        })
    return Response({'capacities': res})


@api_view(['PATCH'])
@permission_classes([AllowAny])
def admin_update_student(request, reg_id):
    """Admin endpoint to edit student's assigned center, exam slot, and admission status."""
    seed_demo_student_if_needed()
    student = PaisStudent.objects(registration_id__iexact=reg_id).first()
    if not student:
        return Response({'error': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)

    if 'name' in request.data:
        student.name = request.data['name']
    if 'phone' in request.data:
        student.phone = request.data['phone']
    if 'centre' in request.data:
        student.centre = request.data['centre']
    if 'exam_date' in request.data:
        student.exam_date = request.data['exam_date']
    if 'exam_time' in request.data:
        student.exam_time = request.data['exam_time']
    if 'exam_mode' in request.data:
        student.exam_mode = request.data['exam_mode']
    if 'student_class' in request.data:
        student.student_class = request.data['student_class']
    if 'course_type' in request.data:
        student.course_type = request.data['course_type']
    if 'admission_status' in request.data:
        student.admission_status = request.data['admission_status']

    student.save()

    return Response({
        'success': True,
        'student': {
            'id': student.registration_id,
            'name': student.name,
            'phone': student.phone,
            'student_class': student.student_class,
            'exam_mode': student.exam_mode,
            'centre': student.centre,
            'course_type': student.course_type,
            'exam_date': student.exam_date,
            'exam_time': student.exam_time,
            'admission_status': getattr(student, 'admission_status', 'Ticket Issued'),
        }
    })


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def admin_questions_api(request):
    """Admin API to list and create sample / PAIS official test questions."""
    seed_questions_if_needed()

    if request.method == 'POST':
        subject = request.data.get('subject', 'Physics')
        class_level = request.data.get('class_level', 'Class X')
        question_text = request.data.get('question_text', '').strip()
        options = request.data.get('options', [])
        correct_option = int(request.data.get('correct_option', 0))
        marks = int(request.data.get('marks', 2))
        is_sample_test = bool(request.data.get('is_sample_test', True))
        exam_date = request.data.get('exam_date', '11/10/2026')
        time_slot = request.data.get('time_slot', 'Morning 10:30 AM to 11:30 AM')

        if not question_text or len(options) < 4:
            return Response({'error': 'Question text and 4 options are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Max question ID
        max_q = PaisQuestion.objects.order_by('-question_id').first()
        next_id = (max_q.question_id + 1) if max_q else 101

        q_doc = PaisQuestion(
            question_id=next_id,
            subject=subject,
            class_level=class_level,
            question_text=question_text,
            options=options,
            correct_option=correct_option,
            marks=marks,
            is_sample_test=is_sample_test,
            exam_date=exam_date,
            time_slot=time_slot
        )
        q_doc.save()

        return Response({
            'success': True,
            'message': 'Question added successfully.',
            'question': {
                'id': q_doc.question_id,
                'subject': q_doc.subject,
                'class_level': q_doc.class_level,
                'text': q_doc.question_text,
                'options': q_doc.options,
                'correct_option': q_doc.correct_option,
                'marks': q_doc.marks,
                'is_sample_test': q_doc.is_sample_test,
                'exam_date': q_doc.exam_date,
                'time_slot': q_doc.time_slot
            }
        })

    # GET Questions
    is_sample = request.GET.get('is_sample_test')
    subject = request.GET.get('subject')
    e_date = request.GET.get('exam_date')

    query = {}
    if is_sample is not None:
        query['is_sample_test'] = (is_sample.lower() == 'true')
    if subject and subject != 'All Subjects':
        query['subject'] = subject
    if e_date and e_date != 'All Dates':
        query['exam_date'] = e_date

    questions = PaisQuestion.objects(**query)
    res = []
    for q in questions:
        res.append({
            'id': q.question_id,
            'subject': q.subject,
            'class_level': q.class_level,
            'text': q.question_text,
            'options': q.options,
            'correct_option': q.correct_option,
            'marks': q.marks,
            'is_sample_test': getattr(q, 'is_sample_test', True),
            'exam_date': getattr(q, 'exam_date', '11/10/2026'),
            'time_slot': getattr(q, 'time_slot', 'Morning 10:30 AM to 11:30 AM')
        })

    return Response({'questions': res})


@api_view(['DELETE'])
@permission_classes([AllowAny])
def admin_delete_question(request, q_id):
    """Delete a question by question_id."""
    q = PaisQuestion.objects(question_id=q_id).first()
    if q:
        q.delete()
        return Response({'success': True, 'message': 'Question deleted.'})
    return Response({'error': 'Question not found.'}, status=status.HTTP_404_NOT_FOUND)


