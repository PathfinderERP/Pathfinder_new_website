import os
import django
import datetime

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'contact_backend.settings')
django.setup()

from courses.models import MockTest, MockTestQuestion

def seed_data():
    print("Clearing existing mock tests...")
    MockTest.objects.delete()
    
    # 1. NEET Zoology Mock Test
    neet_zoo_questions = [
        MockTestQuestion(
            id="nz_q1",
            question_text="An epithelium is found lining the proximal convoluted tubule (PCT) of a nephron. It consists of a single layer of cube-like cells equipped with microvilli to optimize absorption. This tissue is best classified as:",
            options=[
                "Simple Squamous Epithelium",
                "Simple Columnar Epithelium",
                "Simple Cuboidal Epithelium",
                "Pseudostratified Ciliated Epithelium"
            ],
            correct_option=3,
            explanation="Simple cuboidal epithelium with microvilli is found in the PCT of a nephron to optimize absorption."
        ),
        MockTestQuestion(
            id="nz_q2",
            question_text="Myelinogenesis is the process of synthesizing a protective myelin sheath. Which specific cells carry out myelination in the Peripheral Nervous System (PNS)?",
            options=[
                "Oligodendrocytes",
                "Astrocytes",
                "Schwann cells",
                "Microgliocyte cells"
            ],
            correct_option=3,
            explanation="In the Peripheral Nervous System (PNS), Schwann cells form the myelin sheath around axons."
        ),
        MockTestQuestion(
            id="nz_q3",
            question_text="Assess the truth value of the following two statements regarding skeletal connective tissues:\nStatement 1: The matrix of cartilage is hard and completely non-pliable due to rich depositions of calcium salts.\nStatement 2: The matrix of bone is non-pliable, rich in calcium salts, and heavily loaded with collagen fibres which give it structural strength.",
            options=[
                "Both statements are True",
                "Both statements are False",
                "Statement 1 is True, Statement 2 is False",
                "Statement 1 is False, Statement 2 is True"
            ],
            correct_option=4,
            explanation="Statement 1 is false because the matrix of cartilage is pliable. Statement 2 is true."
        ),
        MockTestQuestion(
            id="nz_q4",
            question_text="During harsh environmental periods, frogs seek shelter deep inside burrows and experience states of seasonal inactivity. The summer sleep initiated to protect against extreme heat is known as __________, while the winter sleep to evade extreme cold is termed __________:",
            options=[
                "Hibernation; Aestivation",
                "Aestivation; Hibernation",
                "Diapause; Hibernation",
                "Aestivation; Regeneration"
            ],
            correct_option=2,
            explanation="Summer sleep is aestivation and winter sleep is hibernation."
        ),
        MockTestQuestion(
            id="nz_q5",
            question_text="In male frogs, vasa efferentia run into a specialized canal system inside the kidney before opening into the urinogenital duct. This canal is:",
            options=[
                "Haversian canal",
                "Bidder's canal",
                "Inguinal canal",
                "Volkmann's canal"
            ],
            correct_option=2,
            explanation="Bidder's canal receives vasa efferentia inside the kidney in male frogs."
        )
    ]
    
    test_1 = MockTest(
        title="NEET UG Zoology Mock Test 1",
        description="Chapter test covering Animal Kingdom and Structural Organisation in Animals.",
        course_type="NEET",
        duration_minutes=10,
        total_marks=20,
        questions=neet_zoo_questions,
        created_at=datetime.datetime.utcnow()
    )
    test_1.save()
    print("Created NEET Zoology Mock Test!")
    
    # 2. JEE Physics Mock Test
    jee_phys_questions = [
        MockTestQuestion(
            id="jp_q1",
            question_text="A uniform flexible chain of mass M hangs between two fixed points at same horizontal plane. In equilibrium, the inclination of the chain at two ends A and C is θ = 30° with the horizontal. The tension at the lowest point B of the chain is:",
            options=[
                "Mg",
                "Mg / 2",
                "(√3 / 2) Mg",
                "2Mg / √3"
            ],
            correct_option=3,
            explanation="T1 sin(30) = Mg / 2 => T1 = Mg. At the lowest point B, the horizontal component is T2 = T1 cos(30) = (√3 / 2) Mg."
        ),
        MockTestQuestion(
            id="jp_q2",
            question_text="At time t = 0, a body is projected with a velocity u makes an angle α with the horizontal. At time t = 8 second, its velocity again makes the same angle α with the horizontal. At time t = 1 second, its velocity makes an angle 45° with the horizontal. Then (g = 10 m/s^2):",
            options=[
                "u = 30 m/s",
                "u = 40 m/s",
                "α = tan^-1(3/4)",
                "α = tan^-1(4/3)"
            ],
            correct_option=4,
            explanation="Time of flight = 8s => u sin(a) = 40. At t = 1s, tan(45) = (u sin(a) - gt) / u cos(a) => u cos(a) = 30. Therefore, tan(a) = 4/3 => a = tan^-1(4/3)."
        ),
        MockTestQuestion(
            id="jp_q3",
            question_text="The speed of water current in a river of width 200 m is 18 km/h. An engine boat crosses the river in minimum time t with a downstream drift d. If the speed of the engine boat in still water is 36 km/h then:",
            options=[
                "t = 40 s and d = 100 m",
                "t = 20 s and d = 100 m",
                "t = 20 s and d = 50 m",
                "t = 40 s and d = 200 m"
            ],
            correct_option=2,
            explanation="River current = 5 m/s. Boat speed = 10 m/s. Min time t = 200 / 10 = 20s. Drift d = 5 * 20 = 100m."
        )
    ]
    
    test_2 = MockTest(
        title="JEE Main Physics Mock Test 1",
        description="Practice test covering Kinematics (Motion in 1D & 2D) and Laws of Motion.",
        course_type="JEE",
        duration_minutes=5,
        total_marks=12,
        questions=jee_phys_questions,
        created_at=datetime.datetime.utcnow()
    )
    test_2.save()
    print("Created JEE Physics Mock Test!")
    
    # 3. NEET Botany Mock Test
    neet_bot_questions = [
        MockTestQuestion(
            id="nb_q1",
            question_text="Given below are two statements.\nStatement I: Endarch and exarch are the terms often used for describing the position of secondary xylem in the plant body.\nStatement II: Exarch condition is the most common feature of the root system.",
            options=[
                "Statement I is correct but statement II is false",
                "Statement I is incorrect but statement II is true",
                "Both statement I and statement II are true",
                "Both statement I and statement II are false"
            ],
            correct_option=2,
            explanation="Endarch and exarch refer to primary xylem, not secondary xylem. Exarch is indeed standard in root anatomy."
        ),
        MockTestQuestion(
            id="nb_q2",
            question_text="Which of the following 'suffixes' used for units of classification in plants indicates a taxonomic category of 'family'?",
            options=[
                "– ales",
                "– onae",
                "– aceae",
                "– ae"
            ],
            correct_option=3,
            explanation="Family names in plants end with the suffix -aceae."
        ),
        MockTestQuestion(
            id="nb_q3",
            question_text="Which of the following is incorrect for blue green algae?",
            options=[
                "Cells are covered by peptidoglycan cell wall and mucilage sheath",
                "Ribosomes are 70S type",
                "Cells possess naked DNA",
                "Many membrane bound cell organelles are present"
            ],
            correct_option=4,
            explanation="Blue green algae (Cyanobacteria) are prokaryotes, which do not have membrane-bound cell organelles."
        )
    ]
    
    test_3 = MockTest(
        title="NEET UG Botany Mock Test 1",
        description="Practice test covering Plant Kingdom and Morphology/Anatomy of Flowering Plants.",
        course_type="NEET",
        duration_minutes=5,
        total_marks=12,
        questions=neet_bot_questions,
        created_at=datetime.datetime.utcnow()
    )
    test_3.save()
    print("Created NEET Botany Mock Test!")
    print("Seeding completed successfully!")

if __name__ == '__main__':
    seed_data()
