from django.core.management.base import BaseCommand
from blog.models import BlogPost
import random
import datetime
import uuid

class Command(BaseCommand):
    help = 'Populates the database with 10 random blog posts'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating 10 random blog posts...')

        categories = ['Academic', 'Career', 'Lifestyle', 'News', 'Tips']
        authors = ['John Doe', 'Jane Smith', 'Pathfinder Admin', 'Education Expert']
        
        # Placeholder images suitable for education/blog context
        images = [
            'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
            'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80',
            'https://images.unsplash.com/photo-1427504494785-3a9ca28497b1?w=800&q=80',
            'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80',
            'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
            'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80',
            'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80',
            'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80'
        ]

        def generate_lorem(words):
            lorem_words = [
                "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", 
                "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", 
                "magna", "aliqua", "ut", "enim", "ad", "minim", "veniam", "quis", "nostrud", 
                "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea", 
                "commodo", "consequat", "duis", "aute", "irure", "dolor", "in", "reprehenderit", 
                "in", "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla", 
                "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", 
                "sunt", "in", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", 
                "est", "laborum"
            ]
            return " ".join(random.choice(lorem_words) for _ in range(words))

        for i in range(10):
            title = f"Pathfinder Blog Post {i+1}: {generate_lorem(5).title()}"
            content = generate_lorem(200)
            excerpt = generate_lorem(30)
            
            # Ensure at least some are featured (e.g., 40% chance)
            is_featured = random.random() < 0.4
            
            # Ensure mostly true, allowing a few inactive for testing
            is_active = random.random() < 0.9

            post = BlogPost(
                title=title,
                content=content,
                excerpt=excerpt,
                category=random.choice(categories),
                author=random.choice(authors),
                read_time=f"{random.randint(3, 10)} min read",
                image_url=random.choice(images),
                is_featured=is_featured,
                is_active=is_active,
                published_date=datetime.datetime.utcnow(),
                created_at=datetime.datetime.utcnow(),
                updated_at=datetime.datetime.utcnow()
            )
            post.save()
            self.stdout.write(self.style.SUCCESS(f'Successfully created post: "{title}"'))

        self.stdout.write(self.style.SUCCESS('Finished creating 10 random blog posts'))
