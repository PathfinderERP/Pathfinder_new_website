from mongoengine import Document, fields
import datetime

class CustomPage(Document):
    """
    Configuration and content for custom landing pages
    """
    title = fields.StringField(required=True)
    slug = fields.StringField(required=True, unique=True)
    is_live = fields.BooleanField(default=False)
    
    # Meta / SEO
    meta_title = fields.StringField()
    meta_description = fields.StringField()
    meta_keywords = fields.StringField()
    
    # Page Section Content (flexible DictFields to represent layout data)
    hero = fields.DictField(default={
        "title": "Born in Bengal. Built for the Best.",
        "title_highlight": "NEET Prep",
        "description": "From Class 6 to IIT/AIIMS — mentorship, rigor, and results at scale.",
        "bg_image_url": "https://images.pexels.com/photos/3985154/pexels-photo-3985154.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
    })
    
    legacy = fields.DictField(default={
        "title": "Our Legacy",
        "milestones": [
            {
                "year": "1991",
                "title": "Foundation",
                "description": "Pathfinder established with a vision to provide quality competitive exam training",
                "icon": "Calendar"
            },
            {
                "year": "2000s",
                "title": "Expansion",
                "description": "Grew to 40+ centers across Eastern India",
                "icon": "TrendingUp"
            },
            {
                "year": "2024",
                "title": "AIR 1 Achievement",
                "description": "Student achieves perfect 720/720 score in NEET",
                "icon": "Target"
            },
            {
                "year": "Present",
                "title": "Leadership",
                "description": "Guided by Chairman Debdutta Sreemany to shape the future of medical aspirants",
                "icon": "Users"
            }
        ]
    })
    
    toppers = fields.DictField(default={
        "title": "Top Achievers",
        "toppers_list": [
            {
                "name": "Adrita Mahata",
                "score": "Score: 99.8%",
                "rank": "AIR 2",
                "exam": "NEET 2025",
                "image_url": "/images/spotlight/1.png"
            },
            {
                "name": "Chandrachur Sen",
                "score": "Score: 100%",
                "rank": "AIR 1",
                "exam": "NEET 2024",
                "image_url": "/images/spotlight/2.png"
            },
            {
                "name": "Pranami Halder",
                "score": "Score: 99.2%",
                "rank": "AIR 8",
                "exam": "NEET 2025",
                "image_url": "/images/spotlight/3.png"
            }
        ]
    })
    
    features = fields.DictField(default={
        "title": "Why Choose Pathfinder for NEET?",
        "features_list": [
            {
                "title": "Expert Faculty",
                "description": "Learn from senior professors and top subject matter experts",
                "icon": "GraduationCap"
            },
            {
                "title": "Comprehensive Material",
                "description": "Exhaustive study packages aligned with NCERT & NTA patterns",
                "icon": "BookOpen"
            },
            {
                "title": "CBT Test Series",
                "description": "Live computer-based tests simulating the real exam environment",
                "icon": "Laptop"
            },
            {
                "title": "Personal Mentorship",
                "description": "One-on-one doubt clearing sessions and regular performance tracking",
                "icon": "Target"
            }
        ]
    })
    
    courses = fields.DictField(default={
        "title": "NEET Training Programs",
        "courses_list": [
            {
                "name": "NEET 1-Year Classroom Program",
                "duration": "1 Year",
                "target": "Class 12 Passed Students",
                "features": ["350+ Hours of Live Classes", "Daily Practice Problems (DPP)", "All India Test Series (AITS)"]
            },
            {
                "name": "NEET 2-Year Integrated Classroom Program",
                "duration": "2 Years",
                "target": "Class 10 Passed / Class 11 Students",
                "features": ["700+ Hours of Classes", "Board Preparation Support", "Personalized Mentoring"]
            }
        ]
    })
    
    centers = fields.DictField(default={
        "title": "NEET Coaching Centers in Kolkata",
        "centers_list": [
            {
                "name": "Gariahat Center",
                "address": "123, Rashbehari Avenue, Kolkata - 700029",
                "phone": "+91 98300 12345"
            },
            {
                "name": "Salt Lake Center",
                "address": "Block AE-332, Sector 1, Salt Lake, Kolkata - 700064",
                "phone": "+91 98300 67890"
            }
        ]
    })
    
    faq = fields.DictField(default={
        "title": "Frequently Asked Questions",
        "faqs_list": [
            {
                "question": "What is the qualification required to join NEET coaching?",
                "answer": "Students studying in class 11, 12, or class 12 pass-outs are eligible to enroll in our NEET coaching programs."
            },
            {
                "question": "Does Pathfinder provide study materials and test series?",
                "answer": "Yes, we provide standard NCERT-aligned printed study packages, daily practice problems, and an interactive All India Mock Test Series."
            }
        ]
    })
    
    contact = fields.DictField(default={
        "title": "Book Your Free Career Counselling",
        "email_recipient": "admissions@pathfinder.edu.in"
    })
    
    # Metadata
    created_at = fields.DateTimeField(default=datetime.datetime.utcnow)
    updated_at = fields.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'custom_pages',
        'ordering': ['-created_at']
    }

    def save(self, *args, **kwargs):
        self.updated_at = datetime.datetime.utcnow()
        return super(CustomPage, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.slug})"
