import os
import sys
import django
import datetime

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'contact_backend.settings')
django.setup()

from custom_pages.models import CustomPage

def seed_image_pages():
    print("Clearing existing matching dynamic pages for seeding...")
    
    slugs = [
        "cbse-mock-test-program",
        "icse-isc-mock-test-program",
        "key-to-success",
        "madhyamik-mock-test-program",
        "mock-test-program"
    ]
    CustomPage.objects(slug__in=slugs).delete()
    
    pages = [
        # 1. CBSE Mock Test Programme (Slug: cbse-mock-test-program)
        {
            "title": "CBSE Mock Test Programme",
            "slug": "cbse-mock-test-program",
            "is_live": True,
            "meta_title": "CBSE Mock Test Programme Class 10 & 12 | Pathfinder",
            "meta_description": "Prepare for CBSE board examinations with unit tests, mid-term tests, and full mock exams under expert guidance.",
            "meta_keywords": "CBSE mock test, Class 10 CBSE, Class 12 CBSE, Pathfinder board exams",
            "hero": {
                "title": "CBSE Mock Test Programme",
                "title_highlight": "Class 10 & 12",
                "description": "Where Practice Meets Performance! Prepare for CBSE Class 10 & 12 Unit Tests, Mid-Term Tests, and Board Examinations under the guidance of Pathfinder's Expert Faculty.",
                "bg_image_url": "https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
                "primary_btn_text": "Apply Now",
                "secondary_btn_text": "Book Test"
            },
            "legacy": {
                "title": "CBSE Department Legacy",
                "subtitle": "Helping thousands of students score 95%+ in their CBSE board exams",
                "milestones": [
                    {"year": "2024", "title": "Class 10 Toppers", "description": "Over 250+ students scored above 95% in CBSE Class 10 Boards.", "icon": "Trophy"},
                    {"year": "2025", "title": "Class 12 Toppers", "description": "Pathfinder student secured 99.2% overall in CBSE Class 12.", "icon": "Award"}
                ]
            },
            "toppers": {
                "title": "Pathfinder CBSE Spotlights",
                "toppers_list": [
                    {"name": "Aniket Sen", "score": "98.8% CBSE 10th", "rank": "AIR 12", "exam": "CBSE 2025", "image_url": "/images/spotlight/1.png"},
                    {"name": "Ritika Dey", "score": "99.2% CBSE 12th", "rank": "AIR 3", "exam": "CBSE 2025", "image_url": "/images/spotlight/2.png"}
                ]
            },
            "features": {
                "title": "What Students Get",
                "features_list": [
                    {"title": "Full-Length & Unit Mock Tests", "description": "Quarterly Mid-term, Pre-board, and Mock Test modules matching the CBSE patterns.", "icon": "Laptop"},
                    {"title": "Progressive Performance Reports", "description": "Detailed analysis showing chapter-wise strengths and speed stats.", "icon": "TrendingUp"},
                    {"title": "Time Management Insights", "description": "Master structured paper answering techniques to optimize final exams.", "icon": "Clock"},
                    {"title": "Video & Detailed Explanations", "description": "Access full video solutions and step-by-step marking schemes after each test.", "icon": "BookOpen"}
                ]
            },
            "courses": {
                "title": "Fees Structure for CBSE Test Programme [2025-26]",
                "courses_list": [
                    {"name": "Class X CBSE Mock Test Program (Pre-board & Mock Test)", "duration": "Class 10", "target": "Quarterly, Mid-term, Pre-board & Full Mock", "features": ["Fees: Rs. 16,000/- for full program", "Crash Course Option: Rs. 12,000/-", "Includes detailed paper evaluations"]},
                    {"name": "Class XII CBSE Mock Test Program (Half Yearly & Full Mock)", "duration": "Class 12", "target": "Comprehensive 5-Subject Mock Prep", "features": ["Fees: Rs. 7,500/- for full Mock Test I & II", "Single Subject Option: Rs. 2,500/-", "Step-by-step model answers included"]}
                ]
            },
            "faq": {
                "title": "Why take this Mock Test?",
                "faqs_list": [
                    {"question": "Are WBBSE, CBSE, and ICSE mock tests designed separately?", "answer": "Yes, mock tests are engineered by separate expert panels matching each board's latest syllabus blueprints and grading structures."},
                    {"question": "Who evaluates the mock exam papers?", "answer": "Every mock exam is graded by senior professors with extensive board evaluation experience to replicate official marking patterns."}
                ]
            },
            "contact": {
                "title": "Register Now for CBSE Mock Test Programme",
                "email_recipient": "cbse-mock@pathfinder.edu.in"
            }
        },

        # 2. ICSE & ISC Mock Test Programme (Slug: icse-isc-mock-test-program)
        {
            "title": "ICSE & ISC Mock Test Programme",
            "slug": "icse-isc-mock-test-program",
            "is_live": True,
            "meta_title": "ICSE & ISC Mock Test Programme Class 10 & 12 | Pathfinder",
            "meta_description": "Boost your ICSE & ISC preparation with board-standard mock tests, detailed papers analysis, and evaluation.",
            "meta_keywords": "ICSE mock test, Class 10 ICSE, ISC mock test, Class 12 ISC",
            "hero": {
                "title": "ICSE & ISC Mock Test Programme",
                "title_highlight": "Class 10 & 12",
                "description": "Practice under right guidance leads to ultimate success! Achieve your dreams with expert guidance, board-standard mock tests, and top NLU/IIT/AIIMS mentoring.",
                "bg_image_url": "https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
                "primary_btn_text": "Apply Now",
                "secondary_btn_text": "Book Test"
            },
            "legacy": {
                "title": "ICSE / ISC Excellence",
                "subtitle": "Unlocking ultimate academic heights year after year",
                "milestones": [
                    {"year": "2024", "title": "Top Performance", "description": "Over 180+ students scored above 97% in ICSE Class 10 Boards.", "icon": "Trophy"}
                ]
            },
            "toppers": {
                "title": "Pathfinder ICSE / ISC Achievers",
                "toppers_list": [
                    {"name": "Sreeja Paul", "score": "99.4% ICSE", "rank": "AIR 2", "exam": "ICSE 2025", "image_url": "/images/spotlight/3.png"},
                    {"name": "Souvik Ghosh", "score": "98.6% ISC", "rank": "AIR 15", "exam": "ISC 2025", "image_url": "/images/spotlight/1.png"}
                ]
            },
            "features": {
                "title": "What Students Get",
                "features_list": [
                    {"title": "ICSE & ISC Board Exam Analysis", "description": "Exhaustive question pattern breakdown and trend study of previous years.", "icon": "Laptop"},
                    {"title": "Curated Study Materials", "description": "Brief chapter notes, quick formulas list, and revision exercises.", "icon": "BookOpen"},
                    {"title": "Flexible Slot Timings", "description": "Book exam sessions according to your school and routine convenience.", "icon": "Clock"},
                    {"title": "Expert Board Examiner Grading", "description": "Constructive feedback and correction remarks by actual board papers evaluators.", "icon": "Check"}
                ]
            },
            "courses": {
                "title": "Fees and Schedule Details [Class 10 & 12]",
                "courses_list": [
                    {"name": "Class X ICSE Mock Test Program (Pre-Board & Full Mock)", "duration": "Class 10", "target": "ICSE Board Mock Prep", "features": ["Fees: Rs. 15,000/- for full 5 subjects pack", "Single Subject Option: Rs. 3,500/-", "Covering English, Maths, Science, and Socials"]},
                    {"name": "Class XII ISC Mock Test Program (Full Mock Series)", "duration": "Class 12", "target": "ISC Board Mock Prep", "features": ["Fees: Rs. 18,000/- for full 5 subjects pack", "Detailed answer scripts with corrections", "Physics, Chemistry, Maths, Biology, and Computer"]}
                ]
            },
            "faq": {
                "title": "Why Pathfinder's Mock Test?",
                "faqs_list": [
                    {"question": "Are WBBSE, CBSE, and ICSE mock tests designed separately?", "answer": "Yes, mock tests are engineered by separate expert panels matching each board's latest syllabus blueprints and grading structures."},
                    {"question": "Who evaluates the mock exam papers?", "answer": "Every mock exam is graded by senior professors with extensive board evaluation experience to replicate official marking patterns."}
                ]
            },
            "contact": {
                "title": "Register Now for ICSE & ISC Mock Test Programme",
                "email_recipient": "icse-mock@pathfinder.edu.in"
            }
        },

        # 3. Key to Success Book (Slug: key-to-success)
        {
            "title": "Key to Success Book Promotion",
            "slug": "key-to-success",
            "is_live": True,
            "meta_title": "Key to Success Book | Pathfinder Venture",
            "meta_description": "Pre-order Key to Success, the ultimate guide for board exams, JEE & NEET prep strategies, revision notes, and toppers' insights.",
            "meta_keywords": "Key to Success book, board exam strategies, JEE NEET tips, rankers guide",
            "hero": {
                "title": "Key to Success Guide",
                "title_highlight": "Admissions & Pre-order Open",
                "description": "A practical guide book packed with strategies, insights, and real-world lessons to help students achieve academic excellence and personal growth. Success isn't luck—it's a skill you can learn.",
                "bg_image_url": "https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
                "primary_btn_text": "Pre-Order Book",
                "secondary_btn_text": "Download Chapter 1"
            },
            "legacy": {
                "title": "Guided by Board Toppers",
                "subtitle": "Curated with insights from Board toppers and National engineering/medical rankers",
                "milestones": [
                    {"year": "2023", "title": "Devdutta Majhi Quote", "description": "“Key to Success gave me a clear path... it felt like a teacher guiding me at home.”", "icon": "Users"}
                ]
            },
            "toppers": {
                "title": "Insights Shared by AIR Toppers",
                "toppers_list": [
                    {"name": "Devdutta Majhi", "score": "Madhyamik Topper", "rank": "AIR 1 JEE Main", "exam": "JEE 2024", "image_url": "/images/spotlight/1.png"}
                ]
            },
            "features": {
                "title": "What You Will Learn From the BOOK",
                "features_list": [
                    {"title": "Exam Strategy", "description": "Proven strategies to tackle high-weightage topics and structure revision.", "icon": "Target"},
                    {"title": "Scoring Techniques", "description": "Step-by-step methods to write flawless answers that score maximum marks.", "icon": "Award"},
                    {"title": "Model Answers", "description": "Full analysis of past years' question papers with board-examiner solved answers.", "icon": "CheckCircle"},
                    {"title": "Time Management", "description": "Highly efficient routines to optimize study schedules and review syllabus fast.", "icon": "Clock"}
                ]
            },
            "courses": {
                "title": "Pre-Order Book Packages",
                "courses_list": [
                    {"name": "Standard Print Copy", "duration": "Physical Book", "target": "Deliver to Doorstep", "features": ["Price: Rs. 499/- only", "Includes 350+ solved MCQs", "Free access to online Chapter 1 notes"]},
                    {"name": "Premium Prep Bundle", "duration": "Physical Book + Online Video Solutions", "target": "Complete Topper Access", "features": ["Price: Rs. 999/- only", "Includes video guide walk-throughs", "Free sample mock tests access included"]}
                ]
            },
            "faq": {
                "title": "Discover The Book Details",
                "faqs_list": [
                    {"question": "Who is this book designed for?", "answer": "It is curated for students appearing in WBBSE, CBSE, ICSE boards and JEE/NEET competitive examinations."},
                    {"question": "How do I receive the free topper's notes?", "answer": "Pre-ordering today unlocks the premium PDF toppers' notes immediately via email."}
                ]
            },
            "contact": {
                "title": "Pre-Order Now & Get AIR 1 Topper's Notes Free!",
                "email_recipient": "book@pathfinder.edu.in"
            }
        },

        # 4. Madhyamik Mock Test Programme (Slug: madhyamik-mock-test-program)
        {
            "title": "Madhyamik Mock Test Programme",
            "slug": "madhyamik-mock-test-program",
            "is_live": True,
            "meta_title": "Madhyamik Mock Test Programme | Pathfinder",
            "meta_description": "Excel in West Bengal Board Madhyamik exams with standard mock papers, detailed reviews, and toppers tips.",
            "meta_keywords": "Madhyamik mock test, WBBSE prep, West Bengal Board class 10, board exam coaching",
            "hero": {
                "title": "Madhyamik Mock Test Programme",
                "title_highlight": "West Bengal Board",
                "description": "The right guidance leads to the right results. Excel in your WBBSE Madhyamik Board exams with curated mock papers, detailed evaluations, and topper guidelines.",
                "bg_image_url": "https://images.pexels.com/photos/2292854/pexels-photo-2292854.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
                "primary_btn_text": "Apply Now",
                "secondary_btn_text": "Book Test"
            },
            "legacy": {
                "title": "Our Madhyamik Success",
                "subtitle": "Decades of top ranks in WBBSE board examinations",
                "milestones": [
                    {"year": "2023", "title": "Rank 1 WBBSE", "description": "Our student achieved the state Rank 1 in Madhyamik.", "icon": "Trophy"}
                ]
            },
            "toppers": {
                "title": "Pathfinder Madhyamik Achievers",
                "toppers_list": [
                    {"name": "Ananya Sreemany", "score": "98.4% Madhyamik", "rank": "Rank 3", "exam": "WBBSE 2025", "image_url": "/images/spotlight/2.png"}
                ]
            },
            "features": {
                "title": "Pathfinder Advantage for Madhyamik",
                "features_list": [
                    {"title": "WBBSE Board Standard Mock Papers", "description": "Take simulated exams following the WBBSE blueprint and pattern.", "icon": "Laptop"},
                    {"title": "Detailed Performance Evaluation", "description": "Get in-depth analysis pointing out weaknesses and correction guidelines.", "icon": "TrendingUp"},
                    {"title": "Sample Paper Solves", "description": "Access fully solved worksheets and video guides for standard subjects.", "icon": "BookOpen"},
                    {"title": "Topper Mentorship Seminars", "description": "Direct guidance and scoring strategies from previous year rankers.", "icon": "Users"}
                ]
            },
            "courses": {
                "title": "Madhyamik Mock Test Programs",
                "courses_list": [
                    {"name": "Madhyamik Full Mock Test Pack", "duration": "Class 10", "target": "WBBSE Board Prep", "features": ["Price: Rs. 8,000/-", "Includes all 7 compulsory subjects", "Full grading reviews and feedback"]},
                    {"name": "Madhyamik Crash Course + Mock Pack", "duration": "Class 10", "target": "WBBSE Board Prep", "features": ["Price: Rs. 12,000/-", "Includes revision lectures and modules", "Free doubt solving sessions access"]}
                ]
            },
            "faq": {
                "title": "Why take the Madhyamik Mock Test?",
                "faqs_list": [
                    {"question": "Are WBBSE, CBSE, and ICSE mock tests designed separately?", "answer": "Yes, mock tests are engineered by separate expert panels matching each board's latest syllabus blueprints and grading structures."},
                    {"question": "Who evaluates the mock exam papers?", "answer": "Every mock exam is graded by senior professors with extensive board evaluation experience to replicate official marking patterns."}
                ]
            },
            "contact": {
                "title": "Apply for Madhyamik Mock Test Programme",
                "email_recipient": "madhyamik-mock@pathfinder.edu.in"
            }
        },

        # 5. General Mock Test Program Hub (Slug: mock-test-program)
        {
            "title": "Pathfinder Mock Test Program",
            "slug": "mock-test-program",
            "is_live": True,
            "meta_title": "Pathfinder Mock Test Program | Madhyamik, ICSE, CBSE",
            "meta_description": "Boost your board preparation with Pathfinder's comprehensive Mock Test Program. Madhyamik, ICSE, CBSE modules.",
            "meta_keywords": "Pathfinder mock test, board exam preparation, Madhyamik mock, ICSE mock, CBSE mock",
            "hero": {
                "title": "Pathfinder Mock Test Program",
                "title_highlight": "Madhyamik, ICSE, CBSE",
                "description": "Every rank is possible when you dare to dream big! Choose your school board and preparation level to jumpstart your mock test series and secure admission to India's top colleges.",
                "bg_image_url": "https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
                "primary_btn_text": "Apply Now",
                "secondary_btn_text": "View Schedule"
            },
            "legacy": {
                "title": "Decades of Board Excellence",
                "subtitle": "Unlocking ultimate ranks and top scores across WBBSE, CBSE, and ICSE boards",
                "milestones": [
                    {"year": "1991", "title": "Foundation", "description": "Launched mock test evaluation panels with WBBSE standard papers.", "icon": "Calendar"},
                    {"year": "2010", "title": "National Boards", "description": "Expanded to CBSE and ICSE mock evaluation packages.", "icon": "Trophy"}
                ]
            },
            "toppers": {
                "title": "Pathfinder Board Achievers",
                "toppers_list": [
                    {"name": "Devdutta Majhi", "score": "Rank 1 Madhyamik", "rank": "AIR 1", "exam": "Madhyamik 2023", "image_url": "/images/spotlight/1.png"},
                    {"name": "Sreeja Paul", "score": "99.4% ICSE", "rank": "AIR 2", "exam": "ICSE 2025", "image_url": "/images/spotlight/3.png"}
                ]
            },
            "features": {
                "title": "Pathfinder Advantage",
                "features_list": [
                    {"title": "Comprehensive Test Schedules", "description": "Curated unit, quarterly, and full-length board mocks.", "icon": "Clock"},
                    {"title": "Analytical Scorecard Dashboard", "description": "Detailed answers keys, marks distribution, and performance stats.", "icon": "Laptop"},
                    {"title": "24/7 Academic Support", "description": "Doubt clearing support on the Pathfinder app within minutes.", "icon": "Target"},
                    {"title": "Scholarship Opportunities", "description": "High scores secure direct fee waivers on classroom coaching courses.", "icon": "Award"}
                ]
            },
            "courses": {
                "title": "Choose Your Board Test Track",
                "courses_list": [
                    {"name": "CBSE Class X / XII Mock Test Track", "duration": "Class 10 & 12", "target": "CBSE Board Track", "features": ["Includes Unit and Pre-board mock papers", "Complete answer sheets corrected by experts", "Video solution tutorials access"]},
                    {"name": "ICSE / ISC Class X / XII Mock Test Track", "duration": "Class 10 & 12", "target": "ICSE Board Track", "features": ["Dedicated mock tests matching ICSE/ISC blueprints", "Personal feedback from board examiners", "Subject-specific scoring workshops"]},
                    {"name": "Madhyamik WBBSE Mock Test Track", "duration": "Class 10", "target": "West Bengal Board Track", "features": ["Full syllabus mock exam modules", "Grades and correction notes shared", "Bengali and English medium support"]}
                ]
            },
            "faq": {
                "title": "General Mock Program FAQs",
                "faqs_list": [
                    {"question": "Are WBBSE, CBSE, and ICSE mock tests designed separately?", "answer": "Yes, mock tests are engineered by separate expert panels matching each board's latest syllabus blueprints and grading structures."},
                    {"question": "Who evaluates the mock exam papers?", "answer": "Every mock exam is graded by senior professors with extensive board evaluation experience to replicate official marking patterns."}
                ]
            },
            "contact": {
                "title": "Apply for Pathfinder Mock Test Program",
                "email_recipient": "mocktests@pathfinder.edu.in"
            }
        }
    ]
    
    for p in pages:
        doc = CustomPage(
            title=p["title"],
            slug=p["slug"],
            is_live=p["is_live"],
            meta_title=p["meta_title"],
            meta_description=p["meta_description"],
            meta_keywords=p["meta_keywords"],
            hero=p["hero"],
            legacy=p["legacy"],
            toppers=p["toppers"],
            features=p["features"],
            courses=p["courses"],
            faq=p["faq"],
            contact=p["contact"],
            created_at=datetime.datetime.utcnow(),
            updated_at=datetime.datetime.utcnow()
        )
        doc.save()
        print(f"Created/updated page: {p['title']} ({p['slug']})")

if __name__ == '__main__':
    seed_image_pages()
