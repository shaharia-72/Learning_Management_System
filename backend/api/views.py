from decimal import Decimal
import logging
import secrets
from django.shortcuts import render, redirect, get_object_or_404
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.utils.timezone import now

from api import serializer as api_serializer
from api import models as api_models
from userauths.models import User, Profile

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

import random
import requests

logger = logging.getLogger(__name__)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = api_serializer.MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = api_serializer.RegisterSerializer

def generate_random_otp(length=6):
    otp = ''.join(str(random.randint(0, 9)) for _ in range(length))
    return otp


class PasswordResetView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = api_serializer.UserSerializer
    
    def generate_otp_and_token(self, user):
        otp = generate_random_otp()
        refresh_token = str(RefreshToken.for_user(user).access_token)

        user.otp = otp
        user.refresh_token = refresh_token
        user.save(update_fields=["otp", "refresh_token"])

        return otp, refresh_token

    def get_object(self):
        email = self.kwargs["email"]
        # user = User.objects.filter(email=email).first()
        user = get_object_or_404(User,email=email)
        
        otp, refresh_token = self.generate_otp_and_token(user)
        
        frontend_url = settings.FRONTEND_URL or "http://localhost:5173" 
        reset_link = f"{frontend_url}/create-new-password/?otp={otp}&uuidb64={user.pk}&refresh_token={refresh_token}"
        
        self.send_password_reset_email(user, reset_link)
        return user
    
    def send_password_reset_email(self, user, reset_link):
        context = {"link": reset_link, "username": user.username}

        subject = "Password Reset Request"
        text_body = render_to_string("email/password_reset.txt", context)
        html_body = render_to_string("email/password_reset.html", context)

        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=settings.EMAIL_HOST_USER,
            to=[user.email],
        )
        msg.attach_alternative(html_body, "text/html")
        msg.send()
        

class PasswordChangeView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = api_serializer.UserSerializer

    def create(self, request, *args, **kwargs):
        new_password = request.data.get("password")
        otp = request.data.get("otp")
        uuidb64 = request.data.get("uuidb64")

        if not all([uuidb64, otp, new_password]):
            return Response({"message": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(pk=uuidb64)
            print(f"User Found - ID: {user.id}, OTP: {user.otp}")
        except User.DoesNotExist:
            return Response({"message": "User not found"}, status=status.HTTP_400_BAD_REQUEST)

        if secrets.compare_digest(str(user.otp), str(otp)):  
            user.set_password(new_password)
            user.otp = None  
            user.last_password_reset = now()  
            user.save(update_fields=["password", "otp", "last_password_reset"]) 

            logger.info(f"Password changed for user {user.id} at {user.last_password_reset}")
            return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)

        return Response({"message": "Invalid OTP or user not found"}, status=status.HTTP_400_BAD_REQUEST)


class CourseCategoryView(generics.ListAPIView):
    queryset = api_models.Category.objects.filter(active=True)
    serializer_class = api_serializer.CategorySerializer
    permission_classes = [AllowAny]
    
class CourseListView(generics.ListAPIView):
    queryset  = api_models.Course.objects.filter(platform_status="Published", teacher_course_status="Published")
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

class CourseDetailView(generics.RetrieveAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]
    queryset = api_models.Course.objects.filter(platform_status="Published", teacher_course_status="Published")
    
    def get_object(self):
        slug = self.kwargs["slug"]
        course = api_models.Course.objects.get(slug=slug, platform_status="Published", teacher_course_status="Published")
        return course
        
        
class CourseCartView(generics.CreateAPIView):
    queryset = api_models.Cart.objects.all()
    serializer_class = api_serializer.CartSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        course_id = request.data['course_id']
        user_id = request.data['user_id']
        cart_id = request.data['cart_id']
        price = request.data['price']
        country_name = request.data['country_name']
        
        course = api_models.Course.objects.filter(id=course_id).first()
        
        if user_id != 'undefined':
            user = api_models.User.objects.filter(id=user_id).first()
        else:
            user = None
            
        try:
            country_object = api_models.Country.objects.filter(name=country_name).first()
            country = country_object.name
        except:
            country_object = None
            country = 'Bangladesh'
            
        if country_object and not None:
            tax_rate = country_object.tax_rate / 100
        else:
            tax_rate = 5 / 100
        
        cart = api_models.Cart.objects.filter(cart_id = cart_id, course_id = course_id).first()
        
        if cart:
            cart.course = course
            cart.user = user
            cart.price = price
            cart.tax_fee = Decimal(price) * Decimal(tax_rate)
            cart.country = country
            cart.cart_id = cart_id
            cart.total = Decimal(cart.price) + Decimal(cart.tax_fee)
            cart.save()

            return Response({"message": "Cart Updated Successfully"}, status=status.HTTP_200_OK)

        else:
            cart = api_models.Cart()

            cart.course = course
            cart.user = user
            cart.price = price
            cart.tax_fee = Decimal(price) * Decimal(tax_rate)
            cart.country = country
            cart.cart_id = cart_id
            cart.total = Decimal(cart.price) + Decimal(cart.tax_fee)
            cart.save()

            return Response({"message": "Cart Created Successfully"}, status=status.HTTP_201_CREATED)

class CourseCartListView(generics.ListAPIView):
    serializer_class = api_serializer.CartSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        card_id = self.kwargs['cart_id']
        return api_models.Cart.objects.filter(cart_id = card_id)
    
class CourseCartListDeleteView(generics.DestroyAPIView):
    serializer_class = api_serializer.CartSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        cart_id = self.kwargs['cart_id']
        item_id = self.kwargs['item_id']
        
        return get_object_or_404(api_models.Cart,cart_id = cart_id, id = item_id)
    
class CourseCartStatisticsView(generics.RetrieveAPIView):
    serializer_class = api_serializer.CartSerializer
    permission_classes = [AllowAny]
    lookup_field = 'cart_id'
    
    def get_queryset(self):
        cart_id = self.kwargs['cart_id']
        queryset = api_models.Cart.objects.filter(cart_id = cart_id)
        return queryset
    
    def get(self, request, *args, **kwargs):
        
        total_price = 0
        total_tax_fee = 0
        total = 0
        cart_id = self.kwargs['cart_id']
        
        queryset = api_models.Cart.objects.filter(cart_id = cart_id)
        
        for cart in queryset:
            total_price +=float(cart.price)
            total_tax_fee += cart.tax_fee
            total += cart.total
            
        return Response({"total_price": total_price, "total_tax_fee": total_tax_fee, "total": total}, status=status.HTTP_200_OK)
    
    
    