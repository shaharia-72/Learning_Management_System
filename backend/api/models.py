from django.db import models
from django.utils.text import slugify
from django.utils import timezone

from userauths.models import User, Profile
# from shortuuid.django_fields import ShortUUIDField
from moviepy.video.io.VideoFileClip import VideoFileClip

# import moviepy.editor as mp
import shortuuid


import math

LANGUAGE = (
    ("English", "English"),
    ("Bangla", "Bangla"),
    ("Spanish", "Spanish"),
)

LEVEL = (
    ("Beginner","Beginner"),
    ("Intermediate","Intermediate"),
    ("Beginner","Beginner"),
)

TEACHER_STATUS = (
    ("Draft","Draft"),
    ("Disable","Disable"),
    ("Published","Published"),
)

PLATFORM_STATUS = (
    ("Review", "Review"),
    ("Disabled", "Disabled"),
    ("Rejected", "Rejected"),
    ("Draft", "Draft"),
    ("Published", "Published"),
)

RATING = (
    (1, "1 Star"),
    (2, "2 Star"),
    (3, "3 Star"),
    (4, "4 Star"),
    (5, "5 Star"),
)

PAYMENT_STATUS = (
    ("Paid", "Paid"),
    ("Processing", "Processing"),
    ("Failed", "Failed"),
)


NOTI_TYPE = (
    ("New Order", "New Order"),
    ("New Review", "New Review"),
    ("New Course Question", "New Course Question"),
    ("Draft", "Draft"),
    ("Course Published", "Course Published"),
    ("Course Enrollment Completed", "Course Enrollment Completed"),
)

def generate_unique_id():
        return f"LMS-{shortuuid.ShortUUID().random(length=8).upper()}"  

class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.FileField(upload_to="course_file", blank=True, null=True, default="teacher.jpg")
    # user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100)
    bio = models.TextField(max_length=1000, blank=True, null=True)
    personal_website = models.URLField(blank=True, null=True)
    facebook = models.URLField(blank=True, null=True)
    twitter = models.URLField(blank=True, null=True)
    instagram = models.URLField(blank=True, null=True)
    linkedIn = models.URLField(blank=True, null=True)
    telegram = models.URLField(blank=True, null=True)
    youtube = models.URLField(blank=True, null=True)
    about = models.TextField(max_length=1000, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    teacher_id = models.CharField(max_length=12, unique=True, editable=False, default=generate_unique_id)
    
    
    def save(self, *args, **kwargs):
        self.full_name=f"{self.user.first_name} {self.user.last_name}"
        super().save(*args, **kwargs)
        
    def __str__(self):
        return self.full_name
    
    def students(self):
        return CartOrderItem.objects.filter(teacher=self)
    
    def courses(self):
        return Course.objects.filter(teacher=self)
    
    def review(self):
        return Course.objects.filter(teacher=self).count()
    
class Category(models.Model):
    title = models.CharField(max_length=100)
    descriptions = models.TextField(blank=True, null=True)
    active = models.BooleanField(default=True)
    image = models.FileField(upload_to="course_file", blank=True, null=True, default="default.jpg")
    active = models.BooleanField(default=True)
    slug = models.SlugField(unique=True, blank=True, null=True)
    
    class Meta:
        verbose_name_plural = "Category"
        ordering = ['title']
    
    def __str__(self):
        return self.title
    
    def course_count(self):
        return Course.objects.filter(category=self).count()
    
    def save(self, *args, **kwargs):
        if self.slug == "" or self.slug == None:
            self.slug = slugify(self.title) 
        super(Category, self).save(*args, **kwargs)

class Course(models.Model):
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    file = models.FileField(upload_to="course-file", blank=True, null=True)
    image = models.FileField(upload_to="course-file", blank=True, null=True)
    title = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    language = models.CharField(choices=LANGUAGE, default="English", max_length=100)
    level = models.CharField(choices=LEVEL, default="Beginner", max_length=100)
    platform_status = models.CharField(choices=PLATFORM_STATUS, default="Published", max_length=100)
    teacher_course_status = models.CharField(choices=TEACHER_STATUS, default="Published", max_length=100)
    featured = models.BooleanField(default=False)
    course_id = models.CharField(max_length=12, unique=True, editable=False, default=generate_unique_id)
    slug = models.SlugField(unique=True, null=True, blank=True)
    rating = models.IntegerField(choices=RATING, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if self.slug == "" or self.slug == None:
            self.slug = slugify(self.title) + str(self.pk)
        super(Course, self).save(*args, **kwargs)

    def students(self):
        return EnrolledCourse.objects.filter(course=self)
    
    def curriculum(self):
        return Variant.objects.filter(course=self)
    
    def lectures(self):
        return VariantItem.objects.filter(variant__course=self)
    
    def average_rating(self):
        average_rating = Review.objects.filter(course=self, active=True).aggregate(avg_rating=models.Avg('rating'))
        return average_rating['avg_rating']
    
    def rating_count(self):
        return Review.objects.filter(course=self, active=True).count()
    
    def reviews(self):
        return Review.objects.filter(course=self, active=True)

class Variant(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    title = models.CharField(max_length=1000)
    module = models.IntegerField(null=True)
    variant_id = models.CharField(unique=True, max_length=12, default=generate_unique_id, editable=False)
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title
    
    def variant_items(self):
        return VariantItem.objects.filter(variant=self)
    
    def items(self):
        return VariantItem.objects.filter(variant=self)
    
    
class VariantItem(models.Model):
    variant = models.ForeignKey(Variant, on_delete=models.CASCADE, related_name="variant_items")
    title = models.CharField(max_length=1000)
    description = models.TextField(null=True, blank=True)
    file = models.FileField(upload_to="course-file", null=True, blank=True)
    duration = models.DurationField(null=True, blank=True)
    content_duration = models.CharField(max_length=1000, null=True, blank=True)
    preview = models.BooleanField(default=False)
    variant_item_id = models.CharField(unique=True, max_length=12, default=generate_unique_id, editable=False)
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.variant.title} - {self.title}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        if self.file:
            clip = VideoFileClip(self.file.path)
            duration_seconds = clip.duration

            minutes, remainder = divmod(duration_seconds, 60)  

            minutes = math.floor(minutes)
            seconds = math.floor(remainder)

            duration_text = f"{minutes}m {seconds}s"
            self.content_duration = duration_text
            super().save(update_fields=['content_duration'])

class Question_Answer(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=1000, null=True, blank=True)
    qa_id = models.CharField(unique=True, max_length=12, default=generate_unique_id, editable=False)
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.username} - {self.course.title}"
    
    class Meta:
        ordering = ['-date']

    def messages(self):
        return Question_Answer_Message.objects.filter(question=self)
    
    def profile(self):
        return Profile.objects.get(user=self.user)
    
class Question_Answer_Message(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    question = models.ForeignKey(Question_Answer, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    message = models.TextField(null=True, blank=True)
    qam_id = models.CharField(unique=True, max_length=12, default=generate_unique_id, editable=False)
    qa_id = models.CharField(unique=True, max_length=12, default=generate_unique_id, editable=False)
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.username} - {self.course.title}"
    
    class Meta:
        ordering = ['date']

    def profile(self):
        return Profile.objects.get(user=self.user)
    
class Cart(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    price = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    tax_fee = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    total = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    country = models.CharField(max_length=100, null=True, blank=True)
    cart_id = models.CharField(max_length=12, default=generate_unique_id, editable=True)
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.course.title
    
class CartOrder(models.Model):
    student = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    teachers = models.ManyToManyField(Teacher, blank=True)
    sub_total = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    price = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    tax_fee = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    total = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    initial_total = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    saved = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    payment_status = models.CharField(choices=PAYMENT_STATUS, default="Processing", max_length=100)
    full_name = models.CharField(max_length=100, null=True, blank=True)
    email = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    coupons = models.ManyToManyField("api.Coupon", blank=True)
    stripe_session_id = models.CharField(max_length=1000, null=True, blank=True)
    oid = models.CharField(unique=True, max_length=12, default=generate_unique_id, editable=False)
    date = models.DateTimeField(default=timezone.now)


    class Meta:
        ordering = ['-date']
    
    def order_items(self):
        return CartOrderItem.objects.filter(order=self)
    
    def __str__(self):
        return self.oid
    
class CartOrderItem(models.Model):
    order = models.ForeignKey(CartOrder, on_delete=models.CASCADE, related_name="orderitem")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="order_item")
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    tax_fee = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    total = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    initial_total = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    saved = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    coupons = models.ManyToManyField("api.Coupon", blank=True)
    applied_coupon = models.BooleanField(default=False)
    oid = models.CharField(unique=True, max_length=12, default=generate_unique_id, editable=False)
    date = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-date']
    
    def order_id(self):
        return f"Order ID #{self.order.oid}"
    
    def payment_status(self):
        return f"{self.order.payment_status}"
    
    def __str__(self):
        return self.oid
    
class Certificate(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    certificate_id = models.CharField(unique=True, max_length=12, default=generate_unique_id, editable=False)
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.course.title
    
class CompletedLesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    variant_item = models.ForeignKey(VariantItem, on_delete=models.CASCADE)
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.course.title
    
class EnrolledCourse(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True)
    order_item = models.ForeignKey(CartOrderItem, on_delete=models.CASCADE)
    enrollment_id = models.CharField(unique=True, max_length=12, default=generate_unique_id, editable=False)
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.course.title
    
    def lectures(self):
        return VariantItem.objects.filter(variant__course=self.course)
    
    def completed_lesson(self):
        return CompletedLesson.objects.filter(course=self.course, user=self.user)
    
    def curriculum(self):
        return Variant.objects.filter(course=self.course)
    
    def note(self):
        return Note.objects.filter(course=self.course, user=self.user)
    
    def question_answer(self):
        return Question_Answer.objects.filter(course=self.course)
    
    def review(self):
        return Review.objects.filter(course=self.course, user=self.user).first()
    
class Note(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    title = models.CharField(max_length=1000, null=True, blank=True)
    note = models.TextField()
    note_id = models.CharField(unique=True, max_length=12, default=generate_unique_id, editable=False)
    date = models.DateTimeField(default=timezone.now)   

    def __str__(self):
        return self.title
    
class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    review = models.TextField()
    rating = models.IntegerField(choices=RATING, default=None)
    reply = models.CharField(null=True, blank=True, max_length=1000)
    active = models.BooleanField(default=False)
    date = models.DateTimeField(default=timezone.now)   

    def __str__(self):
        return self.course.title
    
    def profile(self):
        return Profile.objects.get(user=self.user)
    
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True)
    order = models.ForeignKey(CartOrder, on_delete=models.SET_NULL, null=True, blank=True)
    order_item = models.ForeignKey(CartOrderItem, on_delete=models.SET_NULL, null=True, blank=True)
    review = models.ForeignKey(Review, on_delete=models.SET_NULL, null=True, blank=True)
    type = models.CharField(max_length=100, choices=NOTI_TYPE)
    seen = models.BooleanField(default=False)
    date = models.DateTimeField(default=timezone.now)  

    def __str__(self):
        return self.type

class Coupon(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True)
    used_by = models.ManyToManyField(User, blank=True)
    code = models.CharField(max_length=50)
    discount = models.IntegerField(default=1)
    active = models.BooleanField(default=False)
    date = models.DateTimeField(default=timezone.now)   

    def __str__(self):
        return self.code
    
class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    
    def __str__(self):
        return str(self.course.title)
    
class Country(models.Model):
    name = models.CharField(max_length=100)
    tax_rate = models.IntegerField(default=5)
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
    
    
    
