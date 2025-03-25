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
        uuidb64 = request.data.get("uuidb64")
        otp = request.data.get("otp")
        new_password = request.data.get("password")
        
        if not all([uuidb64, otp, new_password]):
            return Response({"message": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)
        
        if User and User.otp and secrets.compare_digest(str(User.otp), str(otp)):
            User.set_password(new_password)
            User.otp = None  
            User.last_password_reset = now()  
            User.save()

            logger.info(f"Password changed for user {User.id} at {now()}")

            return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)

        return Response({"message": "Invalid OTP or user not found"}, status=status.HTTP_400_BAD_REQUEST)