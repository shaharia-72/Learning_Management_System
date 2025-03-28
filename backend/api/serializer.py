from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from userauths.models import User, Profile
from django.contrib.auth.password_validation import validate_password



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
            password=validated_data['password'] 
        )
        
        return user
        