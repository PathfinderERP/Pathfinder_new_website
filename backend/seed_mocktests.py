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
    
    # 1. NEET Zoology Mock Test (Class 11)
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
        ),
        MockTestQuestion(
            id="nz_q6",
            question_text="Match the connective tissue cell variant (Column I) with its primary functional characteristic (Column II):\nColumn I: A. Fibroblast, B. Macrophage, C. Mast Cell, D. Plasma Cell\nColumn II: I. Scavengers of connective tissue, II. Secrete histamine/serotonin, III. Key cells of immune system, IV. Largest cells producing fibers",
            options=[
                "A-IV, B-I, C-II, D-III",
                "A-IV, B-I, C-III, D-II",
                "A-I, B-IV, C-II, D-III",
                "A-I, B-II, C-IV, D-III"
            ],
            correct_option=1,
            explanation="Fibroblasts produce fibers (IV), Macrophages act as scavengers (I), Mast cells secrete histamine (II), and Plasma cells produce antibodies/immune cells (III)."
        ),
        MockTestQuestion(
            id="nz_q7",
            question_text="Match the category of gland classification (Column I) with its corresponding example (Column II):\nColumn I: A. Unicellular Exocrine, B. Multicellular Exocrine, C. Endocrine Gland, D. Heterocrine Gland\nColumn II: I. Thyroid/Pituitary, II. Pancreas, III. Salivary/Gastric, IV. Goblet cells",
            options=[
                "A-IV, B-III, C-I, D-II",
                "A-IV, B-I, C-III, D-II",
                "A-III, B-IV, C-I, D-II",
                "A-III, B-I, C-IV, D-II"
            ],
            correct_option=1,
            explanation="Goblet cells are unicellular exocrine (IV), Salivary glands are multicellular exocrine (III), Thyroid is endocrine (I), and Pancreas is heterocrine/mixed (II)."
        ),
        MockTestQuestion(
            id="nz_q8",
            question_text="Match the plasma membrane / intercellular junction modification (Column I) with its primary function / location (Column II):\nColumn I: A. Microvilli, B. Gap Junction, C. Tight Junction, D. Cilia\nColumn II: I. Stop substances leaking, II. Increase surface area in PCT, III. Long processes helping movement, IV. Connect cytoplasm for rapid ion transfer",
            options=[
                "A-II, B-IV, C-I, D-III",
                "A-II, B-I, C-IV, D-III",
                "A-III, B-IV, C-I, D-II",
                "A-III, B-I, C-IV, D-II"
            ],
            correct_option=1,
            explanation="Microvilli increase surface area (II), Gap junctions connect cytoplasm (IV), Tight junctions stop leaking (I), and Cilia move particles (III)."
        ),
        MockTestQuestion(
            id="nz_q9",
            question_text="Read the following statements regarding the external segments of a cockroach (Periplaneta americana):\nStatement I: The body is clearly segmented and divisible into three distinct regions: head, thorax, and abdomen.\nStatement II: In the embryonic stage, the body contains 20 segments, whereas the adult stage retains 14 segments.\nStatement III: The adult head capsule is formed by the complete fusion of six segments.\nWhich of the statements given above are correct?",
            options=[
                "Only I and II",
                "Only II and III",
                "Only I and III",
                "All I, II, and III"
            ],
            correct_option=4,
            explanation="All statements are anatomically correct regarding the Periplaneta americana segments."
        ),
        MockTestQuestion(
            id="nz_q10",
            question_text="Assess the truth value of the statements below regarding cockroach wing morphology:\nStatement 1: Forewings are long, narrow, opaque, and function primarily as protective covers for the hind wings at rest.\nStatement 2: Only adult cockroaches possess fully formed, functional wings used actively in flight.",
            options=[
                "Both statements are True",
                "Both statements are False",
                "Statement 1 is True, Statement 2 is False",
                "Statement 1 is False, Statement 2 is True"
            ],
            correct_option=1,
            explanation="Both statements are correct. Cockroach nymphs lack wings, and only adults possess fully formed wings."
        )
    ]
    
    test_1 = MockTest(
        title="NEET UG Zoology Mock Test 1",
        description="Chapter test covering Animal Kingdom and Structural Organisation in Animals.",
        course_type="NEET",
        target_class="11",
        duration_minutes=20,
        total_marks=40,
        questions=neet_zoo_questions,
        created_at=datetime.datetime.utcnow()
    )
    test_1.save()
    print("Created NEET Zoology Mock Test!")
    
    # 2. JEE Physics Mock Test (Class 11)
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
        ),
        MockTestQuestion(
            id="jp_q4",
            question_text="The masses of the blocks A and B are 3 kg and 4 kg respectively. The force supplied by the string on the pulley is (Given: sin α = 0.8, sin β = 0.6 and g = 10 m/s^2):",
            options=[
                "24 N",
                "20 N",
                "24√2 N",
                "20√2 N"
            ],
            correct_option=3,
            explanation="Tension T = 24 N. The force supplied by the string on the pulley is T√2 = 24√2 N."
        ),
        MockTestQuestion(
            id="jp_q5",
            question_text="A bead at rest starts sliding without friction from the highest point of a vertical circle (of radius R) along a chord making an angle θ with the vertical. The time taken by the bead to descend is:",
            options=[
                "√(2R cos θ / g)",
                "√(4R cos θ / g)",
                "√(2R / g)",
                "√(4R / g)"
            ],
            correct_option=4,
            explanation="The length of the chord is 2R cos θ. The acceleration along the chord is g cos θ. Distance s = 0.5 a t^2 => 2R cos θ = 0.5 (g cos θ) t^2 => t = √(4R / g)."
        ),
        MockTestQuestion(
            id="jp_q6",
            question_text="Two identical heavy spheres, each of radius R and mass M, are placed in a hemispherical bowl of radius 3R. The force of interaction between the spheres is N1 and that between a sphere and the bowl is N2. Then:",
            options=[
                "N1 = 2Mg/√3 and N2 = Mg/√3",
                "N1 = Mg/√3 and N2 = Mg/√3",
                "N1 = 2Mg/√3 and N2 = 2Mg/√3",
                "N1 = Mg/√3 and N2 = 2Mg/√3"
            ],
            correct_option=4,
            explanation="Applying equilibrium conditions, N2 sin 60 = Mg => N2 = 2Mg/√3. N1 = N2 cos 60 = Mg/√3."
        ),
        MockTestQuestion(
            id="jp_q7",
            question_text="From the ground, a body is projected with a velocity u = (3i + 4j + 5k) m/s, where the Z-axis is vertical. Its range is (g = 10 m/s^2):",
            options=[
                "10 m",
                "15 m",
                "5 m",
                "20 m"
            ],
            correct_option=3,
            explanation="Horizontal velocity component ux = √(3^2 + 4^2) = 5 m/s. Vertical component uz = 5 m/s. Range R = (2 * ux * uz) / g = (2 * 5 * 5) / 10 = 5 m."
        ),
        MockTestQuestion(
            id="jp_q8",
            question_text="Ship A starts moving with a velocity of 30 km/h along eastward and at the same instant ship B at 125 km south of A starts moving with a velocity of 40 km/h along northward. After how much time will their separating distance be minimum?",
            options=[
                "1 h",
                "2 h",
                "3 h",
                "4 h"
            ],
            correct_option=2,
            explanation="Relative distance equation: S^2 = (125 - 40t)^2 + (30t)^2. Differentiating and equating to 0 yields t = 2 hours."
        ),
        MockTestQuestion(
            id="jp_q9",
            question_text="If a body is projected vertically upward with a speed u, the distance covered by it in the last 't' second of its upward motion is:",
            options=[
                "ut - 0.5 gt^2",
                "0.5 gt^2",
                "ut",
                "(u + gt)t"
            ],
            correct_option=2,
            explanation="The distance covered in the last t seconds of upward motion is equal to the distance covered in the first t seconds of a free fall, which is 0.5 gt^2."
        ),
        MockTestQuestion(
            id="jp_q10",
            question_text="A fireman of mass 60 kg slides down a vertical pole. He is pressing the pole with a force of 600 N. The coefficient of friction between the pole and his palm is 0.5. With what acceleration will the fireman slide down the pole? (g = 10 m/s^2):",
            options=[
                "Zero",
                "2 m/s^2",
                "3 m/s^2",
                "5 m/s^2"
            ],
            correct_option=4,
            explanation="Frictional force f = μ * N = 0.5 * 600 = 300 N. Net downward force = Mg - f = 600 - 300 = 300 N. Acceleration a = F/M = 300 / 60 = 5 m/s^2."
        )
    ]
    
    test_2 = MockTest(
        title="JEE Main Physics Mock Test 1",
        description="Practice test covering Kinematics (Motion in 1D & 2D) and Laws of Motion.",
        course_type="JEE",
        target_class="11",
        duration_minutes=20,
        total_marks=40,
        questions=jee_phys_questions,
        created_at=datetime.datetime.utcnow()
    )
    test_2.save()
    print("Created JEE Physics Mock Test!")
    
    # 3. NEET Botany Mock Test (Class 12)
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
        ),
        MockTestQuestion(
            id="nb_q4",
            question_text="Read the following statements:\n(i) Microspore tetrads possess tetraploid nucleus.\n(ii) Sporogenous tissue occupies the centre of each microsporangium.\n(iii) Cells of sporogenous tissue undergo meiosis.\n(iv) Each cell of the sporogenous tissue is a potential microspore mother cell.\nWhich of the above statements are correct?",
            options=[
                "(i), (ii) and (iii)",
                "(iv) and (v)",
                "(i) and (v)",
                "(ii), (iii) and (iv)"
            ],
            correct_option=4,
            explanation="Microspore tetrads possess haploid nuclei (not tetraploid). Statements ii, iii, and iv are correct."
        ),
        MockTestQuestion(
            id="nb_q5",
            question_text="Arrange the following taxa in decreasing order of their common features:\nMammalia, Carnivora, Felis, Chordata, Felidae",
            options=[
                "Chordata → Mammalia → Carnivora → Felidae → Felis",
                "Felis → Felidae → Carnivora → Mammalia → Chordata",
                "Felis → Carnivora → Felidae → Mammalia → Chordata",
                "Chordata → Mammalia → Felidae → Carnivora → Felis"
            ],
            correct_option=2,
            explanation="Taxa are arranged in increasing order of hierarchy (decreasing order of common features) from Genus (Felis) to Phylum (Chordata)."
        ),
        MockTestQuestion(
            id="nb_q6",
            question_text="Identify A, B, C, and D in the embryonic sac diagram (A = Pollen tube, B = Antipodals, C = Synergids, D = Egg cell):",
            options=[
                "A: Antipodals, B: Pollen tube, C: Synergids, D: Egg cell",
                "A: Pollen tube, B: Antipodals, C: Egg cell, D: Synergids",
                "A: Pollen tube, B: Synergids, C: Egg cell, D: Antipodals",
                "A: Synergids, B: Pollen tube, C: Egg cell, D: Antipodals"
            ],
            correct_option=2,
            explanation="Pollen tube enters from micropylar end (A), antipodals are at chalazal end (B), egg cell is C, and synergids are D."
        ),
        MockTestQuestion(
            id="nb_q7",
            question_text="Match Column I (Taxonomic Category) with Column II (Housefly classification) and select correct option:\nColumn I: A. Family, B. Order, C. Class, D. Phylum\nColumn II: (i) Diptera, (ii) Arthropoda, (iii) Muscidae, (iv) Insecta",
            options=[
                "A-(iii), B-(i), C-(iv), D-(ii)",
                "A-(iii), B-(ii), C-(iv), D-(i)",
                "A-(iv), B-(iii), C-(ii), D-(i)",
                "A-(iv), B-(ii), C-(i), D-(iii)"
            ],
            correct_option=1,
            explanation="Housefly Family is Muscidae (A-iii), Order is Diptera (B-i), Class is Insecta (C-iv), and Phylum is Arthropoda (D-ii)."
        ),
        MockTestQuestion(
            id="nb_q8",
            question_text="Cyanobacteria are best described as:",
            options=[
                "Unicellular, colonial or filamentous marine, fresh water or terrestrial algae",
                "Available only in the form of colonies",
                "Sometimes surrounded by mucilaginous or gelatinous sheath",
                "Not associated with algal bloom"
            ],
            correct_option=1,
            explanation="Cyanobacteria are photosynthetic prokaryotes forming unicellular, colonial or filamentous structures in diverse habitats."
        ),
        MockTestQuestion(
            id="nb_q9",
            question_text="The filiform apparatus of synergids:",
            options=[
                "Play an important role in guiding the pollen tube into the synergid",
                "Help in the opening of pollen tube",
                "Prevents pollen tube from bursting",
                "Is diploid"
            ],
            correct_option=1,
            explanation="The filiform apparatus guides the entry of the pollen tube into the synergid."
        ),
        MockTestQuestion(
            id="nb_q10",
            question_text="The epidermis serves several functions like:",
            options=[
                "Absorbs water and minerals",
                "Regulates gaseous exchange",
                "Secretes metabolic compounds",
                "More than one option is correct"
            ],
            correct_option=4,
            explanation="The epidermis regulates gas exchange, absorbs water (roots), and protects, making more than one option correct."
        )
    ]
    
    test_3 = MockTest(
        title="NEET UG Botany Mock Test 1",
        description="Practice test covering Plant Kingdom and Morphology/Anatomy of Flowering Plants.",
        course_type="NEET",
        target_class="12",
        duration_minutes=20,
        total_marks=40,
        questions=neet_bot_questions,
        created_at=datetime.datetime.utcnow()
    )
    test_3.save()
    print("Created NEET Botany Mock Test!")
    print("Seeding completed successfully!")

if __name__ == '__main__':
    seed_data()
