import os
import sys
import django
import datetime

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'contact_backend.settings')
django.setup()

from custom_pages.models import CustomPage


def seed_custom_pages():
    pages = [
        # ── 1. JEE Coaching in Kolkata ──────────────────────────────────────
        {
            "title": "JEE Coaching in Kolkata",
            "slug": "jee-coaching-in-kolkata",
            "is_live": True,
            "meta_title": "Best JEE Coaching in Kolkata | Pathfinder",
            "meta_description": "Join Pathfinder, Eastern India's most trusted JEE coaching institute. Expert faculty, proven results, 30+ years of legacy.",
            "meta_keywords": "JEE coaching Kolkata, IIT JEE preparation, JEE Main Advanced",
            "hero": {
                "title": "Crack IIT-JEE with",
                "title_highlight": "Pathfinder Excellence",
                "description": "Eastern India's most trusted institute for JEE Main & Advanced. 30 years of proven results.",
                "bg_image_url": "https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            },
            "legacy": {
                "title": "Our JEE Legacy",
                "subtitle": "Decades of excellence in engineering entrance preparation",
                "milestones": [
                    {"year": "1991", "title": "Foundation", "description": "Pathfinder began its JEE coaching journey with a vision to nurture engineering talent in Eastern India", "icon": "Calendar"},
                    {"year": "2005", "title": "First IIT AIR-1", "description": "Our student secured All India Rank 1 in IIT-JEE for the first time", "icon": "Trophy"},
                    {"year": "2015", "title": "Digital Expansion", "description": "Launched online test series and digital study material for JEE aspirants", "icon": "TrendingUp"},
                    {"year": "2020", "title": "100 IITians", "description": "Crossed the milestone of 100 IIT selections in a single year", "icon": "Target"},
                    {"year": "Present", "title": "Leadership", "description": "Guided by top IIT alumni faculty, shaping the future of JEE aspirants across Eastern India", "icon": "Users"}
                ]
            },
            "toppers": {
                "title": "JEE Top Achievers",
                "toppers_list": [
                    {"name": "Sourav Basak", "score": "Score: 99.5%ile", "rank": "AIR 45", "exam": "JEE Advanced 2025", "image_url": "/images/spotlight/1.png"},
                    {"name": "Riya Chatterjee", "score": "Score: 99.2%ile", "rank": "AIR 112", "exam": "JEE Advanced 2025", "image_url": "/images/spotlight/2.png"},
                    {"name": "Aniket Das", "score": "Score: 98.8%ile", "rank": "AIR 210", "exam": "JEE Advanced 2024", "image_url": "/images/spotlight/3.png"},
                    {"name": "Priya Sen", "score": "Score: 99.7%ile", "rank": "AIR 33", "exam": "JEE Main 2025", "image_url": "/images/spotlight/1.png"}
                ]
            },
            "features": {
                "title": "Why Choose Pathfinder for JEE?",
                "features_list": [
                    {"title": "IIT Alumni Faculty", "description": "Learn directly from IITians who cracked the exam themselves", "icon": "GraduationCap"},
                    {"title": "Advanced Problem Sets", "description": "10,000+ curated problems ranked by difficulty for systematic preparation", "icon": "BookOpen"},
                    {"title": "Live Mock Tests", "description": "Real-time CBT mock tests with instant analytics and rank prediction", "icon": "Laptop"},
                    {"title": "Doubt Resolution", "description": "24/7 doubt solving via app with response within 2 hours guaranteed", "icon": "MessageCircle"},
                    {"title": "Rank Booster Batches", "description": "Special intensive batches for students targeting Top 100 AIR", "icon": "TrendingUp"},
                    {"title": "Board Integration", "description": "Seamlessly prepare for both Boards and JEE without compromise", "icon": "Target"}
                ]
            },
            "courses": {
                "title": "JEE Training Programs",
                "courses_list": [
                    {"name": "JEE 2-Year Classroom Program", "duration": "2 Years", "target": "Class 10 Passed / Class 11 Students", "features": ["1000+ Hours of Classes", "Board Preparation Support", "500+ Mock Tests", "Personalized Mentoring"]},
                    {"name": "JEE 1-Year Crash Course", "duration": "1 Year", "target": "Class 12 Students / Droppers", "features": ["Intensive Daily Classes", "300 Full-Length Mocks", "Rapid Revision Modules", "1-on-1 Doubt Sessions"]},
                    {"name": "JEE Online Hybrid Program", "duration": "Flexible", "target": "All JEE Aspirants", "features": ["Live + Recorded Classes", "App-Based Learning", "Weekly Live Doubt Sessions", "AI-Powered Progress Tracking"]}
                ]
            },
            "centers": {
                "title": "JEE Coaching Centers in Kolkata",
                "centers_list": [
                    {"name": "Park Street Center", "address": "12, Park Street, Kolkata - 700016", "phone": "+91 98300 11111"},
                    {"name": "Howrah Center", "address": "45, GT Road, Howrah - 711101", "phone": "+91 98300 22222"},
                    {"name": "Gariahat Center", "address": "123, Rashbehari Avenue, Kolkata - 700029", "phone": "+91 98300 12345"},
                    {"name": "Salt Lake Center", "address": "Block AE-332, Sector 1, Salt Lake, Kolkata - 700064", "phone": "+91 98300 67890"}
                ]
            },
            "faq": {
                "title": "JEE Coaching FAQs",
                "faqs_list": [
                    {"question": "When should I start JEE preparation?", "answer": "Ideally, start in Class 11. However, even a focused 1-year preparation in Class 12 can yield excellent results with the right coaching."},
                    {"question": "What is the difference between JEE Main and JEE Advanced?", "answer": "JEE Main is the qualifying exam for NITs and IIITs, while JEE Advanced is for admission to IITs. You need to clear JEE Main first to appear for Advanced."},
                    {"question": "How many mock tests should I give before the exam?", "answer": "We recommend at least 50+ full-length mocks and 200+ chapter-wise tests for optimal preparation."},
                    {"question": "Does Pathfinder provide hostel facilities?", "answer": "Yes, we have tie-ups with verified PG accommodations near all major center locations."}
                ]
            },
            "contact": {
                "title": "Book Your Free JEE Counselling Session",
                "email_recipient": "jee@pathfinder.edu.in"
            }
        },

        # ── 2. WBJEE Coaching in Kolkata ─────────────────────────────────────
        {
            "title": "WBJEE Coaching in Kolkata",
            "slug": "wbjee-coaching-in-kolkata",
            "is_live": True,
            "meta_title": "Best WBJEE Coaching in Kolkata | Pathfinder",
            "meta_description": "Ace WBJEE with Pathfinder's expert coaching. Dedicated faculty, comprehensive study material, and proven success record.",
            "meta_keywords": "WBJEE coaching Kolkata, West Bengal JEE, engineering entrance exam",
            "hero": {
                "title": "Master WBJEE with",
                "title_highlight": "Pathfinder's Proven Method",
                "description": "West Bengal's most trusted coaching for WBJEE engineering entrance. Expert WBJEE-specific faculty, 30 years of results.",
                "bg_image_url": "https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            },
            "legacy": {
                "title": "Our WBJEE Journey",
                "subtitle": "Leading West Bengal engineering aspirants to success",
                "milestones": [
                    {"year": "1995", "title": "WBJEE Launch", "description": "Dedicated WBJEE batch launched to cater to West Bengal engineering aspirants", "icon": "Calendar"},
                    {"year": "2008", "title": "100% Results", "description": "Achieved 100% selection rate in WBJEE for our classroom batch", "icon": "Trophy"},
                    {"year": "2016", "title": "State Rank 1", "description": "Pathfinder student secures State Rank 1 in WBJEE", "icon": "Target"},
                    {"year": "Present", "title": "Bengal's Best", "description": "Consistently producing top 10 state ranks in WBJEE every year", "icon": "TrendingUp"}
                ]
            },
            "toppers": {
                "title": "WBJEE Top Achievers",
                "toppers_list": [
                    {"name": "Debayan Roy", "score": "Score: 98.9%ile", "rank": "State Rank 3", "exam": "WBJEE 2025", "image_url": "/images/spotlight/2.png"},
                    {"name": "Ankita Pal", "score": "Score: 99.1%ile", "rank": "State Rank 1", "exam": "WBJEE 2024", "image_url": "/images/spotlight/3.png"},
                    {"name": "Rahul Biswas", "score": "Score: 98.5%ile", "rank": "State Rank 7", "exam": "WBJEE 2025", "image_url": "/images/spotlight/1.png"}
                ]
            },
            "features": {
                "title": "Why Pathfinder for WBJEE?",
                "features_list": [
                    {"title": "WBJEE-Specific Curriculum", "description": "Syllabus and question patterns tailored exclusively for WBJEE", "icon": "BookOpen"},
                    {"title": "Bengali Medium Support", "description": "Study material and classes available in both Bengali and English", "icon": "Globe"},
                    {"title": "State-Level Mock Tests", "description": "WBJEE-pattern mock tests with state-level rank comparison", "icon": "Laptop"},
                    {"title": "Affordable Fees", "description": "Premium coaching at fees accessible to all sections of society", "icon": "DollarSign"}
                ]
            },
            "courses": {
                "title": "WBJEE Training Programs",
                "courses_list": [
                    {"name": "WBJEE 2-Year Integrated Program", "duration": "2 Years", "target": "Class 11 Students", "features": ["Board + WBJEE Preparation", "500+ Hours Classes", "Bi-Weekly Mock Tests", "Study Material Included"]},
                    {"name": "WBJEE 1-Year Target Program", "duration": "1 Year", "target": "Class 12 / Droppers", "features": ["Intensive Coaching", "WBJEE Mock Test Series", "Chapter-Wise Revision", "Previous Year Papers"]}
                ]
            },
            "centers": {
                "title": "WBJEE Coaching Centers",
                "centers_list": [
                    {"name": "Gariahat Center", "address": "123, Rashbehari Avenue, Kolkata - 700029", "phone": "+91 98300 12345"},
                    {"name": "Barasat Center", "address": "76, Jessore Road, Barasat, Kolkata - 700124", "phone": "+91 98300 33333"},
                    {"name": "Durgapur Center", "address": "City Centre, Durgapur, West Bengal - 713216", "phone": "+91 98300 44444"}
                ]
            },
            "faq": {
                "title": "WBJEE Frequently Asked Questions",
                "faqs_list": [
                    {"question": "What subjects are tested in WBJEE?", "answer": "WBJEE tests Mathematics, Physics, and Chemistry. Mathematics carries higher weightage compared to Physics and Chemistry."},
                    {"question": "Can I apply for both WBJEE and JEE Main together?", "answer": "Yes! Many students prepare for both simultaneously. Our integrated programs are designed to cover both syllabi efficiently."},
                    {"question": "What colleges can I get with WBJEE?", "answer": "WBJEE gives access to top colleges like Jadavpur University, IIEST Shibpur, and all NITs in West Bengal."}
                ]
            },
            "contact": {
                "title": "Book Your Free WBJEE Career Counselling",
                "email_recipient": "wbjee@pathfinder.edu.in"
            }
        },

        # ── 3. Foundation Courses for Class 8-10 ─────────────────────────────
        {
            "title": "Foundation Courses for Class 8 to 10",
            "slug": "foundation-courses-class-8-10",
            "is_live": False,
            "meta_title": "Foundation Courses Class 8-10 | Pathfinder Kolkata",
            "meta_description": "Build a strong academic foundation from Class 8. Pathfinder's foundation program prepares students for IIT-JEE and NEET from an early age.",
            "meta_keywords": "foundation course Kolkata, class 8 9 10 coaching, early NEET JEE preparation",
            "hero": {
                "title": "Start Early,",
                "title_highlight": "Win Big",
                "description": "Build the analytical mindset for IIT-JEE & NEET from Class 8. The earlier you start, the higher you soar.",
                "bg_image_url": "https://images.pexels.com/photos/301926/pexels-photo-301926.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            },
            "legacy": {
                "title": "Foundation Program Legacy",
                "subtitle": "Nurturing India's future doctors and engineers from Class 8",
                "milestones": [
                    {"year": "2000", "title": "Program Launch", "description": "Foundation Program launched for Class 8-9 students to build early competitive exam foundations", "icon": "Calendar"},
                    {"year": "2010", "title": "1000 Alumni", "description": "1000+ foundation batch alumni cracked IIT-JEE and NEET", "icon": "Users"},
                    {"year": "2018", "title": "NTSE Excellence", "description": "50+ students cleared NTSE Stage II in a single year", "icon": "Trophy"},
                    {"year": "Present", "title": "Holistic Approach", "description": "Balanced curriculum combining board excellence and competitive exam readiness", "icon": "Target"}
                ]
            },
            "toppers": {
                "title": "Foundation Program Success Stories",
                "toppers_list": [
                    {"name": "Arjun Mukherjee", "score": "Score: 720/720", "rank": "AIR 1", "exam": "NEET 2025 (Foundation Batch 2021)", "image_url": "/images/spotlight/1.png"},
                    {"name": "Sneha Ghosh", "score": "Score: 99.8%ile", "rank": "AIR 23", "exam": "JEE Advanced 2025 (Foundation Batch 2021)", "image_url": "/images/spotlight/2.png"},
                    {"name": "Rohan Saha", "score": "Stage II Qualified", "rank": "NTSE Scholar", "exam": "NTSE 2024", "image_url": "/images/spotlight/3.png"}
                ]
            },
            "features": {
                "title": "Why Foundation Matters?",
                "features_list": [
                    {"title": "Concept-First Approach", "description": "Deep conceptual understanding rather than rote learning from the very beginning", "icon": "BookOpen"},
                    {"title": "OLYMPIAD Preparation", "description": "Special training for Science Olympiad, Math Olympiad, and NTSE", "icon": "Trophy"},
                    {"title": "Board + Competitive", "description": "Simultaneous preparation for school boards and entrance exams", "icon": "Target"},
                    {"title": "Small Batch Size", "description": "Maximum 20 students per batch for personalized attention", "icon": "Users"}
                ]
            },
            "courses": {
                "title": "Foundation Programs",
                "courses_list": [
                    {"name": "Class 8 Foundation Program", "duration": "1 Year", "target": "Class 7 Passed Students", "features": ["Math, Science & Mental Ability", "Olympiad Preparation", "Board Excellence Support", "Monthly Progress Reports"]},
                    {"name": "Class 9-10 Foundation Program", "duration": "2 Years", "target": "Class 8 Passed Students", "features": ["NTSE & Olympiad Training", "Board Exam Preparation", "Competitive Exam Basics", "Regular Mock Tests"]},
                    {"name": "Pre-Medical/Pre-Engineering Combo", "duration": "2 Years", "target": "Class 9 Students", "features": ["Early NEET/JEE Exposure", "Science Special Focus", "Critical Thinking Development", "Performance Analytics"]}
                ]
            },
            "centers": {
                "title": "Foundation Course Centers",
                "centers_list": [
                    {"name": "Gariahat Center", "address": "123, Rashbehari Avenue, Kolkata - 700029", "phone": "+91 98300 12345"},
                    {"name": "Salt Lake Center", "address": "Block AE-332, Sector 1, Salt Lake, Kolkata - 700064", "phone": "+91 98300 67890"}
                ]
            },
            "faq": {
                "title": "Foundation Program FAQs",
                "faqs_list": [
                    {"question": "At what age should a student join Foundation courses?", "answer": "The ideal time to join is Class 8 (age 13-14). Starting early gives students 4+ years of structured preparation before appearing for NEET/JEE."},
                    {"question": "Will Foundation classes hamper school performance?", "answer": "No! Our Foundation program is designed to complement school education. Students consistently score above 90% in board exams."},
                    {"question": "Are there scholarships available for the Foundation program?", "answer": "Yes, we conduct a scholarship entrance test every year. Top performers get up to 100% fee waiver."}
                ]
            },
            "contact": {
                "title": "Enquire About Foundation Courses",
                "email_recipient": "foundation@pathfinder.edu.in"
            }
        },

        # ── 4. NEET Dropper Batch ─────────────────────────────────────────────
        {
            "title": "NEET Dropper Batch Kolkata",
            "slug": "neet-dropper-batch-kolkata",
            "is_live": True,
            "meta_title": "NEET Dropper Batch 2025-26 | Pathfinder Kolkata",
            "meta_description": "Dedicated NEET dropper batch with intensive coaching, daily revision, and full mock test series. Make your drop year count with Pathfinder.",
            "meta_keywords": "NEET dropper batch Kolkata, NEET repeater coaching, NEET 2026 preparation",
            "hero": {
                "title": "Turn Your Drop Year into",
                "title_highlight": "Your Success Story",
                "description": "Dedicated NEET dropper coaching with proven intensity, strategy, and results. 600+ droppers cracked NEET last year from Pathfinder.",
                "bg_image_url": "https://images.pexels.com/photos/5428836/pexels-photo-5428836.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            },
            "legacy": {
                "title": "Dropper Batch Success Record",
                "subtitle": "Hundreds of droppers have transformed their fate with Pathfinder",
                "milestones": [
                    {"year": "2010", "title": "Batch Started", "description": "Dedicated NEET dropper batch launched with specialized study methodology", "icon": "Calendar"},
                    {"year": "2018", "title": "200+ Selections", "description": "200+ dropper batch students selected in MBBS in a single year", "icon": "Trophy"},
                    {"year": "2022", "title": "AIR Under 100", "description": "Dropper batch student achieves AIR 78 in NEET after dropping for 1 year", "icon": "Target"},
                    {"year": "2025", "title": "600+ Cracked", "description": "Record 600+ dropper students cracked NEET 2025 from Pathfinder", "icon": "TrendingUp"}
                ]
            },
            "toppers": {
                "title": "Dropper Batch Champions",
                "toppers_list": [
                    {"name": "Meghna Sarkar", "score": "Score: 710/720", "rank": "AIR 78", "exam": "NEET 2025 (Dropper Batch)", "image_url": "/images/spotlight/2.png"},
                    {"name": "Tushar Mondal", "score": "Score: 695/720", "rank": "AIR 312", "exam": "NEET 2025 (Dropper Batch)", "image_url": "/images/spotlight/1.png"},
                    {"name": "Sanchari Das", "score": "Score: 688/720", "rank": "AIR 489", "exam": "NEET 2024 (Dropper Batch)", "image_url": "/images/spotlight/3.png"}
                ]
            },
            "features": {
                "title": "What Makes Our Dropper Batch Special?",
                "features_list": [
                    {"title": "Intensive Daily Schedule", "description": "8 hours of structured daily learning with mandatory revision sessions", "icon": "Clock"},
                    {"title": "Personalized Weak Area Focus", "description": "Individual analysis of previous attempt to target specific weak areas", "icon": "Target"},
                    {"title": "100+ Full Mock Tests", "description": "Comprehensive NEET-pattern mock test series with detailed performance analytics", "icon": "Laptop"},
                    {"title": "Psychology & Motivation", "description": "Regular counselling sessions to maintain mental health and exam confidence", "icon": "Heart"},
                    {"title": "Hostel Facilities Available", "description": "Safe and comfortable hostel near coaching center for outstation students", "icon": "Home"},
                    {"title": "Previous Year Deep Dive", "description": "Exhaustive analysis of last 20 years NEET question papers, chapter-wise", "icon": "BookOpen"}
                ]
            },
            "courses": {
                "title": "Dropper Batch Programs",
                "courses_list": [
                    {"name": "NEET Dropper Intensive Batch", "duration": "10 Months", "target": "NEET Aspirants (2nd Attempt)", "features": ["8 Hours Daily Classes", "100+ Full Mock Tests", "Bi-weekly Parent Meetings", "Individual Counselling"]},
                    {"name": "NEET Dropper Weekend Batch", "duration": "10 Months", "target": "Working Students / Home Learners", "features": ["Weekend Intensive Classes", "Online Study Material", "60+ Mock Tests", "Doubt Sessions via App"]}
                ]
            },
            "centers": {
                "title": "Dropper Batch Centers",
                "centers_list": [
                    {"name": "Gariahat Main Center", "address": "123, Rashbehari Avenue, Kolkata - 700029", "phone": "+91 98300 12345"},
                    {"name": "Park Street Center", "address": "12, Park Street, Kolkata - 700016", "phone": "+91 98300 55555"}
                ]
            },
            "faq": {
                "title": "NEET Dropper Batch FAQs",
                "faqs_list": [
                    {"question": "How is the dropper batch different from a regular NEET batch?", "answer": "Dropper batches are more intensive with longer daily hours, individual performance tracking, and psychology sessions to keep students motivated throughout the year."},
                    {"question": "How many attempts can I give for NEET?", "answer": "As per current NTA guidelines, there is no restriction on the number of NEET attempts. Students can appear as many times as needed."},
                    {"question": "I scored 450 in my first attempt. Can I reach 650+ in one year?", "answer": "Absolutely! With dedicated effort and our structured program, students regularly improve by 150-200 marks in their dropper year."},
                    {"question": "Are there separate batches based on previous scores?", "answer": "Yes, we have tiered batches — Basic (300-450), Intermediate (450-580), and Advanced (580+) — to ensure targeted preparation."}
                ]
            },
            "contact": {
                "title": "Enrol in Dropper Batch — Limited Seats!",
                "email_recipient": "dropper@pathfinder.edu.in"
            }
        }
    ]

    print("\n[*] Seeding Custom Pages...\n")
    created, skipped = 0, 0
    for page_data in pages:
        if CustomPage.objects(slug=page_data["slug"]).first():
            print(f"  [SKIP]  Already exists: {page_data['title']}")
            skipped += 1
        else:
            page = CustomPage(**page_data)
            page.save()
            live_status = "LIVE" if page_data["is_live"] else "Draft"
            print(f"  [OK]  Created [{live_status}]: {page_data['title']} -> /{page_data['slug']}")
            created += 1

    print(f"\n[Done] {created} page(s) created, {skipped} skipped.\n")


if __name__ == "__main__":
    seed_custom_pages()
