import random
import string
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.dispatch import receiver
from django.db.models.signals import post_save



def generate_unique_user_id():
    letters = ''.join(random.choices(string.ascii_uppercase, k=4))
    digits = ''.join(random.choices(string.digits, k=6))
    return f"{letters}-{digits}"


class User(AbstractUser):
    user_unique_id = models.CharField(max_length=11, unique=True, editable=False, default=generate_unique_user_id)
    # username = models.CharField(max_length=20,unique=True)
    email = models.EmailField(unique=True)
    otp = models.CharField(max_length=8, null=True, blank=True)
    # refresh_token = models.CharField(max_length=1000,null=True, blank=True)
    refresh_token = models.TextField(null=True, blank=True)
    last_password_reset = models.DateTimeField(null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email
    
    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.email.split('@')[0]
        super().save(*args, **kwargs)
        
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    first_name = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(max_length=100, null=True, blank=True)
    image = models.ImageField(upload_to="user_profiles/", default="default-user.jpg", null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    about = models.TextField(null=True, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
    instance.profile.save()