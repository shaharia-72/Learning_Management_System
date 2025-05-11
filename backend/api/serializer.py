from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from userauths.models import User, Profile
from django.contrib.auth.password_validation import validate_password
from api import models as api_models


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        return token

class UserSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = User
        fields ='__all__'
    
class ProfileSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Profile
        fields = '__all__'

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True,max_length=20, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True,max_length=20, required=True)
    
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'password', 'confirm_password']
        
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs
    
    def get_username_from_email(self, email):
        base_username = email.split('@')[0].lower()
        counter = 1
        username = base_username
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        return username
    
    def create(self, validated_data):
        email = validated_data['email']
        username = self.get_username_from_email(email)

        user = User.objects.create_user(
            email=email,
            username=username, 
            password=validated_data['password'],
            first_name=validated_data.get('first_name', 'Not set'),  
            last_name=validated_data.get('last_name', 'Not set')    
        )
        
        return user

class TeacherSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = api_models.Teacher
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.Category
        fields = fields = ['id', 'title', 'image', 'slug', 'course_count', 'descriptions']
        
class VariantItemSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = api_models.VariantItem
        fields = '__all__'

class VariantSerializer(serializers.ModelSerializer):
    variant_items = VariantItemSerializer(many = True)
    items = VariantItemSerializer(many = True)
    class Meta:
        model = api_models.Variant
        fields = '__all__'
        
class Question_Answer_MessageSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(many = False)
    class Meta:
        model = api_models.Question_Answer_Message
        fields = '__all__'

class Question_AnswerSerializer(serializers.ModelSerializer):
    messages = Question_Answer_MessageSerializer(many = True)
    profile = ProfileSerializer(many = False)
    class Meta:
        model = api_models.Question_Answer
        fields = '__all__'
        
class CartSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = api_models.Cart
        fields = '__all__'

class CartOrderItemSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = api_models.CartOrderItem
        fields = '__all__'

class CartOrderSerializer(serializers.ModelSerializer):
    order_items = CartOrderItemSerializer(many = True)
    class Meta:
        model = api_models.CartOrder
        fields = '__all__'
class CertificateSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = api_models.Certificate
        fields = '__all__'
class CompletedLessonSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = api_models.CompletedLesson
        fields = '__all__'
class NoteSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = api_models.Note
        fields = '__all__'
class ReviewSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(many=False)

    class Meta:
        fields = '__all__'
        model = api_models.Review

    def __init__(self, *args, **kwargs):
        super(ReviewSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        self.Meta.depth = 0 if request and request.method == "POST" else 3
class NotificationSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = api_models.Notification
        fields = '__all__'
class CouponSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = api_models.Coupon
        fields = '__all__'
class WishlistSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = api_models.Wishlist
        fields = '__all__'
class CountrySerializer(serializers.ModelSerializer):
    
    class Meta:
        model = api_models.Country
        fields = '__all__'

class EnrolledCourseSerializer(serializers.ModelSerializer):
    lectures = VariantItemSerializer(many = True, read_only = True)
    completed_lesson = CompletedLessonSerializer(many=True, read_only=True)
    curriculum = VariantItemSerializer(many = True, read_only = True)
    note = NoteSerializer(many = True, read_only = True)
    question_answer = Question_AnswerSerializer(many = True, read_only = True)
    review = ReviewSerializer(many = True, read_only = True)
    class Meta:
        model = api_models.EnrolledCourse
        fields = [ "course", "user", "teacher", "order_item", "enrollment_id", "date", "lectures", "completed_lesson", "curriculum", "note", "question_answer", "review",]
        
    def __init__(self,*args, **kwargs ):
        super(EnrolledCourseSerializer, self).__init__(*args,**kwargs)
        request = self.context.get("request")
        
        self.Meta.depth = 0 if request and request == "POST" else 3

class CourseSerializer(serializers.ModelSerializer):
    students = EnrolledCourseSerializer(many=True, required=False, read_only=True,)
    curriculum = VariantSerializer(many=True, required=False, read_only=True,)
    lectures = VariantItemSerializer(many=True, required=False, read_only=True,)
    reviews = ReviewSerializer(many=True, read_only=True, required=False)
    class Meta:
        fields = ["id", "category", "teacher", "file", "image", "title", "description", "price", "language", "level", "platform_status", "teacher_course_status", "featured", "course_id", "slug", "students", "curriculum", "lectures", "average_rating", "rating_count", "reviews",]
        model = api_models.Course
    def __init__(self,*args, **kwargs ):
        super(CourseSerializer, self).__init__(*args,**kwargs)
        request = self.context.get("request")
        
        self.Meta.depth = 0 if request and request == "POST" else 3
    
