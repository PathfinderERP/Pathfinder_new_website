import os
import sys
import django
from datetime import datetime

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'contact_backend.settings')
django.setup()

from blog.models import BlogPost

def seed_blog_posts():
    posts = [
        {
            "title": "Mastering JEE 2026: A Comprehensive 2-Year Roadmap",
            "excerpt": "Learn how to balance Class 11 & 12 syllabus while maintaining peak performance in competitive exams. Our experts share the secret sauce to JEE success.",
            "content": "JEE preparation requires a marathon mindset. Over the next two years, consistency will be your greatest ally. Start with strong conceptual clarity in Class 11 topics as they form the backbone of JEE Advanced.",
            "category": "JEE",
            "author": "Dr. S. Mukherjee",
            "read_time": "8 min read",
            "image_url": "https://pub-7c94e07c9acb46369c7f4fa8eb00e4cb.r2.dev/blog/jee_strategy.png",
            "is_featured": True
        },
        {
            "title": "NEET Preparation: Why NCERT is your Ultimate Bible",
            "excerpt": "90% of NEET Biology comes directly from NCERT. Discover the right way to read and memorize every line of your textbooks for a 700+ score.",
            "content": "The importance of NCERT in NEET cannot be overstated. Every diagram, summary, and even the points mentioned in tables are potential questions. Make it a habit to revise Biology NCERT at least 10 times before the exam.",
            "category": "NEET",
            "author": "Prof. A. Ray",
            "read_time": "6 min read",
            "image_url": "https://pub-7c94e07c9acb46369c7f4fa8eb00e4cb.r2.dev/blog/neet_success.png",
            "is_featured": False
        },
        {
            "title": "Top 5 Habits of Highly Successful Students",
            "excerpt": "Success leaves clues. We analyzed our top toppers from the last 5 years and found these consistent habits that set them apart.",
            "content": "Habits define our future. 1. Early morning revision. 2. Regular mock testing. 3. Meticulous doubt solving. 4. Balanced diet and sleep. 5. Digital minimalism.",
            "category": "Study Tips",
            "author": "Mani Singh",
            "read_time": "5 min read",
            "image_url": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800",
            "is_featured": False
        },
        {
            "title": "Starting Early: The Benefits of Foundation Courses",
            "excerpt": "Why Class 8 is the perfect time to start your competitive journey without the pressure of boards. Build your analytical foundation today.",
            "content": "Foundation courses are the building blocks of a successful career. By starting in Class 8, students develop analytical thinking and problem-solving skills that give them a massive edge in Class 11.",
            "category": "Foundation",
            "author": "R. Sharma",
            "read_time": "7 min read",
            "image_url": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800",
            "is_featured": False
        }
    ]

    for post_data in posts:
        # Check if already exists by title
        if not BlogPost.objects(title=post_data['title']).first():
            post = BlogPost(**post_data)
            post.save()
            print(f"✅ Created: {post.title}")
        else:
            print(f"⏩ Skipped (Already exists): {post_data['title']}")

if __name__ == "__main__":
    seed_blog_posts()
