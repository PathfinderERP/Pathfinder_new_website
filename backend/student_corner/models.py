from mongoengine import Document, fields
from datetime import datetime

class StudentCornerItem(Document):
    CATEGORY_CHOICES = (
        ('Study Materials', 'Study Materials'),
        ('All India', 'All India'),
        ('Foundation', 'Foundation'),
        ('Olympiads', 'Olympiads'),
        ('Boards', 'Boards'),
        ('Timetables', 'Timetables'),
        ('Stationery', 'Stationery'),
        ('Merchandise', 'Merchandise'),
        ('Notes', 'Notes'),
        ('Others', 'Others')
    )
    
    category = fields.StringField(required=True)
    free_delivery = fields.BooleanField(default=False)
    custom_category = fields.StringField(required=False)
    name = fields.StringField(required=True, max_length=255)
    description = fields.StringField()
    price = fields.FloatField(required=True)
    discount = fields.FloatField(default=0.0)
    discounted_price = fields.FloatField(default=0.0)
    rating = fields.FloatField(default=0.0, min_value=0.0, max_value=5.0)
    tags = fields.ListField(fields.StringField(max_length=50))
    image_url = fields.StringField()
    
    # Book specific fields
    board = fields.StringField(max_length=50) 
    custom_board = fields.StringField(max_length=50) 
    class_level = fields.StringField(max_length=50) 
    custom_class_level = fields.StringField(max_length=50) 
    course_type = fields.StringField(max_length=50) 
    custom_course_type = fields.StringField(max_length=50) 
    is_popular = fields.BooleanField(default=False) 

    unique_id = fields.StringField(unique=True)
    created_by = fields.StringField()
    updated_by = fields.StringField()

    created_at = fields.DateTimeField(default=datetime.utcnow)
    updated_at = fields.DateTimeField()

    meta = {
        'collection': 'student_corner_items',
        'ordering': ['-created_at']
    }

    def save(self, *args, **kwargs):
        # Calculate discounted price
        if self.price is None:
             self.price = 0.0
        if self.discount is None:
             self.discount = 0.0

        if not self.unique_id:
            import uuid
            self.unique_id = f"SC-{uuid.uuid4().hex[:8].upper()}"

        if self.discount > 0:
            discount_amount = (self.price * self.discount) / 100
            self.discounted_price = round(self.price - discount_amount, 2)
        else:
            self.discounted_price = self.price

        # Only set updated_at if the item already exists (Update)
        if self.pk:
            self.updated_at = datetime.utcnow()
            
        return super(StudentCornerItem, self).save(*args, **kwargs)

class StudentCornerOrder(Document):
    """Model to track student corner item purchases"""
    user_id = fields.StringField(required=True)
    full_name = fields.StringField()
    email = fields.StringField()
    phone = fields.StringField()
    
    # List of items purchased
    items = fields.ListField(fields.DictField()) # {item_id, name, price, quantity}
    
    total_amount = fields.FloatField(required=True)
    payment_id = fields.StringField()
    payment_status = fields.StringField(default='completed', choices=['pending', 'completed', 'failed'])
    
    delivery_address = fields.DictField() # {area, school, board, etc.}
    
    created_at = fields.DateTimeField(default=datetime.utcnow)
    status = fields.StringField(default='processing', choices=['processing', 'shipped', 'delivered', 'cancelled'])
    
    meta = {
        'collection': 'student_corner_orders',
        'indexes': ['user_id', 'email', 'payment_id'],
        'ordering': ['-created_at']
    }
