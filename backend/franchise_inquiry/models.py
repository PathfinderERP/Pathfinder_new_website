from django.db import models

class FranchiseInquiry(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    city = models.CharField(max_length=255)
    experience = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_contacted = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = "Franchise Inquiries"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.city}"
