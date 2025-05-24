from django.utils import timezone
from decimal import Decimal
import logging
import secrets
from django.http import Http404
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
from rest_framework.exceptions import ValidationError
from django.db import transaction

import random
import requests
import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY


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
        

# class PasswordChangeView(generics.CreateAPIView):
#     permission_classes = [AllowAny]
#     serializer_class = api_serializer.UserSerializer

#     def create(self, request, *args, **kwargs):
#         new_password = request.data.get("password")
#         otp = request.data.get("otp")
#         uuidb64 = request.data.get("uuidb64")

#         if not all([uuidb64, otp, new_password]):
#             return Response({"message": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             user = User.objects.get(pk=uuidb64)
#             print(f"User Found - ID: {user.id}, OTP: {user.otp}")
#         except User.DoesNotExist:
#             return Response({"message": "User not found"}, status=status.HTTP_400_BAD_REQUEST)

#         if secrets.compare_digest(str(user.otp), str(otp)):  
#             user.set_password(new_password)
#             user.otp = None  
#             user.last_password_reset = now()  
#             user.save(update_fields=["password", "otp", "last_password_reset"]) 

#             logger.info(f"Password changed for user {user.id} at {user.last_password_reset}")
#             return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)

#         return Response({"message": "Invalid OTP or user not found"}, status=status.HTTP_400_BAD_REQUEST)

class PasswordChangeView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = api_serializer.UserSerializer

    def create(self, request, *args, **kwargs):
        otp = request.data['otp']
        uuidb64 = request.data['uuidb64']
        password = request.data['password']

        user = User.objects.get(id=uuidb64, otp=otp)
        if user:
            user.set_password(password)
            # user.otp = ""
            user.save()

            return Response({"message": "Password Changed Successfully"}, status=status.HTTP_201_CREATED)
        else:
            return Response({"message": "User Does Not Exists"}, status=status.HTTP_404_NOT_FOUND)


class ProfileAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = api_serializer.ProfileSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user_id = self.kwargs['user_id']
        user = User.objects.get(id=user_id)
        return Profile.objects.get(user=user)

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
    
    
class CreateOrderView(generics.CreateAPIView):
    serializer_class = api_serializer.CartOrderSerializer
    permission_classes = [AllowAny]
    queryset = api_models.CartOrder.objects.all()
    
    def create(self, request, *args, **kwargs):
        data = request.data
        required_fields = ['full_name', 'email', 'country', 'cart_id', 'user_id'] 
        
        for field in required_fields:
            if field not in data:
                raise ValidationError(f"{field} is required.")
        
        full_name = data.get('full_name')
        email = data.get('email')
        country = data.get('country')
        cart_id = data.get('cart_id')
        user_id = data.get('user_id')
        
        user = get_object_or_404(User, id = user_id) if user_id else None
        cart_items = api_models.Cart.objects.filter(cart_id = cart_id)
        
        if not cart_items.exists():
            raise ValidationError("No cart items found.")
        
        order = api_models.CartOrder.objects.create(
            full_name = full_name,
            email = email,
            country = country,
            student = user,
        )
        
        total_price = Decimal("0.00")
        total_tax = Decimal("0.00")
        total_total = Decimal("0.00")
        
        order_items = []
        
        for c in cart_items:
            order_items.append(api_models.CartOrderItem(
                order=order,
                course=c.course,
                price=c.price,
                tax_fee=c.tax_fee,
                total=c.total,
                initial_total=c.total,
                teacher=c.course.teacher
            ))
            
            total_price += Decimal(c.price)
            total_tax += Decimal(c.tax_fee)
            total_total += Decimal(c.total)
            order.teachers.add(c.course.teacher)

        # Bulk create order items
        api_models.CartOrderItem.objects.bulk_create(order_items)

        # Update order totals
        order.sub_total = total_price
        order.tax_fee = total_tax
        order.initial_total = total_total
        order.total = total_total
        order.save()

        return Response({
            "message": "Order Created Successfully",
            "order_oid": order.oid
        }, status=status.HTTP_201_CREATED)
        
class CheckOutOrderView(generics.RetrieveAPIView):
    serializer_class = api_serializer.CartOrderSerializer
    permission_classes = [AllowAny]
    lookup_field = 'oid'
    
    def get_queryset(self):
        oid = self.kwargs['oid']
        return api_models.CartOrder.objects.filter(oid = oid)

# class couponView(generics.CreateAPIView):
#     serializer_class = api_serializer.CouponSerializer
#     permission_classes = [AllowAny]
    
#     def create(self, request, *args, **kwargs):
#         order_oid = request.data['order_oid']
#         coupon_code = request.data['coupon_code']
        
#         order = api_models.CartOrder.objects.filter(oid = order_oid)
#         coupon = api_models.Coupon.objects.filter(code = coupon_code)
        
#         if coupon:
#             order_items = api_models.CartOrderItem.objects.filter(order= order, teacher = coupon.teacher)
#             for i in order_items:
#                 if not coupon in i.coupons.all():
#                     discount = (i.total * coupon.discount) / 100
                    
#                     i.total -= discount
#                     i.initial_total -= discount
#                     i.applied_coupon = True
#                     i.coupons.add(coupon)   
#                     i.saved += discount
                    
#                     order.coupons(coupon)
#                     order.sub_total -= discount
#                     order.initial_total -= discount
#                     order.total  -= discount
#                     order.saved += discount
                    
#                     i.save()
#                     order.save()
#                     return Response({"message": "Coupon activated successfully"}, status=status.HTTP_200_OK)
#                 else:
#                     return Response({"message": "Coupon already applied"}, status=status.HTTP_400_BAD_REQUEST)
#         else:
#             return Response({"message": "Coupon does not exist"}, status=status.HTTP_400_BAD_REQUEST)


class couponView(generics.CreateAPIView):
    serializer_class = api_serializer.CouponSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        order_oid = request.data['order_oid']
        coupon_code = request.data['coupon_code']

        order = api_models.CartOrder.objects.get(oid=order_oid)
        coupon = api_models.Coupon.objects.get(code=coupon_code)

        if coupon:
            order_items = api_models.CartOrderItem.objects.filter(order=order, teacher=coupon.teacher)
            for i in order_items:
                if not coupon in i.coupons.all():
                    discount = i.total * coupon.discount / 100

                    i.total -= discount
                    i.price -= discount
                    i.saved += discount
                    i.applied_coupon = True
                    i.coupons.add(coupon)

                    order.coupons.add(coupon)
                    order.total -= discount
                    order.sub_total -= discount
                    order.saved += discount

                    i.save()
                    order.save()
                    coupon.used_by.add(order.student)
                    return Response({"message": "Coupon Found and Activated", "icon": "success"}, status=status.HTTP_201_CREATED)
                else:
                    return Response({"message": "Coupon Already Applied", "icon": "warning"}, status=status.HTTP_200_OK)
        else:
            return Response({"message": "Coupon Not Found", "icon": "error"}, status=status.HTTP_404_NOT_FOUND)
        
class StripeCheckOutView(generics.CreateAPIView):
    serializer_class = api_serializer.CartOrderSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        order_oid = self.kwargs["order_oid"]  
        try:
            order = api_models.CartOrder.objects.get(oid=order_oid)
        except api_models.CartOrder.DoesNotExist:
            return Response({"message": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            checkout_session = stripe.checkout.Session.create(
                customer_email=order.email,
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'BDT',
                        'product_data': {
                            'name': order.full_name,
                        },
                        'unit_amount': int(order.total * 100),
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=f"{settings.FRONTEND_URL}/payment-success/{order.oid}?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{settings.FRONTEND_URL}/payment-failed"
            )
            print("check_out session ====> ",checkout_session)
            order.stripe_session_id = checkout_session.id
            order.save()

            return redirect(checkout_session.url)

        except stripe.error.StripeError as e:
            return Response({"message": f"Something went wrong. ERROR: {str(e)}"})




# Student API View all hare 

class SearchCourseView(generics.ListAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        query = self.request.GET.get('query', '') 
        return api_models.Course.objects.filter(
            Q(title__icontains=query) | Q(description__icontains=query),  # Added description search
            platform_status="Published", 
            teacher_course_status="Published"
        )


class StudentSummaryView(generics.ListAPIView):
    serializer_class = api_serializer.StudentSummarySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        try:
            user = User.objects.get(id=user_id)
            
            enrolled_courses = api_models.EnrolledCourse.objects.filter(user=user)
            total_courses = enrolled_courses.count()
            completed_lessons = api_models.CompletedLesson.objects.filter(user=user).count()
            achieved_certificates = api_models.Certificate.objects.filter(user=user).count()

            return [{
                "total_courses": total_courses,
                "completed_lessons": completed_lessons,
                "achieved_certificates": achieved_certificates,
            }]
        except User.DoesNotExist:
            return []  

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class StudentCourseListView(generics.ListAPIView):
    serializer_class = api_serializer.EnrolledCourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        try:  # Added error handling
            user = User.objects.get(id=user_id)
            return api_models.EnrolledCourse.objects.filter(user=user)
        except User.DoesNotExist:
            return api_models.EnrolledCourse.objects.none()  # Return empty queryset


class StudentCourseDetailView(generics.RetrieveAPIView):
    serializer_class = api_serializer.EnrolledCourseSerializer
    permission_classes = [AllowAny]
    lookup_field = 'enrollment_id'

    def get_object(self):
        user_id = self.kwargs['user_id']
        enrollment_id = self.kwargs['enrollment_id']

        try:
            user = User.objects.get(id=user_id)
            return api_models.EnrolledCourse.objects.get(user=user, enrollment_id=enrollment_id)
        except (User.DoesNotExist, api_models.EnrolledCourse.DoesNotExist):
            raise Http404("Enrolled course not found")


class StudentCourseCompletedCreateView(generics.CreateAPIView):
    serializer_class = api_serializer.CompletedLessonSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        user_id = request.data.get('user_id')
        course_id = request.data.get('course_id')
        variant_item_id = request.data.get('variant_item_id')
        
        # Validate required fields
        if not all([user_id, course_id, variant_item_id]):
            return Response(
                {"error": "Missing required fields"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(id=user_id)
            course = api_models.Course.objects.get(id=course_id)
            variant_item = api_models.VariantItem.objects.get(variant_item_id=variant_item_id)
            
            # Use get_or_create for better efficiency
            completed_lesson, created = api_models.CompletedLesson.objects.get_or_create(
                user=user, course=course, variant_item=variant_item
            )
            
            if not created:  # If it existed before
                completed_lesson.delete()
                return Response({"message": "Course marked as not completed"})
            
            return Response({"message": "Course marked as completed"})
            
        except (User.DoesNotExist, api_models.Course.DoesNotExist, 
                api_models.VariantItem.DoesNotExist):
            return Response(
                {"error": "One or more objects not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )


class StudentNoteCreateView(generics.ListCreateAPIView):
    serializer_class = api_serializer.NoteSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        enrollment_id = self.kwargs['enrollment_id']

        try:
            user = User.objects.get(id=user_id)
            enrolled = api_models.EnrolledCourse.objects.get(enrollment_id=enrollment_id)
            return api_models.Note.objects.filter(user=user, course=enrolled.course)
        except (User.DoesNotExist, api_models.EnrolledCourse.DoesNotExist):
            return api_models.Note.objects.none()

    def create(self, request, *args, **kwargs):
        user_id = request.data.get('user_id')
        enrollment_id = request.data.get('enrollment_id')
        title = request.data.get('title')
        note = request.data.get('note')
        
        # Validate required fields
        if not all([user_id, enrollment_id, title, note]):
            return Response(
                {"error": "Missing required fields"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(id=user_id)
            enrolled = api_models.EnrolledCourse.objects.get(enrollment_id=enrollment_id)
            
            note_obj = api_models.Note.objects.create(
                user=user, course=enrolled.course, note=note, title=title
            )
            
            # Return created object in response
            serializer = self.get_serializer(note_obj)
            return Response(
                {"message": "Note created successfully", "note": serializer.data}, 
                status=status.HTTP_201_CREATED
            )
        except (User.DoesNotExist, api_models.EnrolledCourse.DoesNotExist):
            return Response(
                {"error": "User or enrolled course not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )


class StudentNoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = api_serializer.NoteSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user_id = self.kwargs['user_id']
        enrollment_id = self.kwargs['enrollment_id']
        note_id = self.kwargs['note_id']

        try:
            user = User.objects.get(id=user_id)
            enrolled = api_models.EnrolledCourse.objects.get(enrollment_id=enrollment_id)
            note = api_models.Note.objects.get(user=user, course=enrolled.course, id=note_id)
            return note
        except (User.DoesNotExist, api_models.EnrolledCourse.DoesNotExist, 
                api_models.Note.DoesNotExist):
            raise Http404("Note not found")


class StudentRateCourseCreateView(generics.CreateAPIView):
    serializer_class = api_serializer.ReviewSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        user_id = request.data.get('user_id')
        course_id = request.data.get('course_id')
        rating = request.data.get('rating')
        review = request.data.get('review')
        
        # Validate required fields
        if not all([user_id, course_id, rating]):
            return Response(
                {"error": "Missing required fields"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Validate rating value
        try:
            rating_value = int(rating)
            if not (1 <= rating_value <= 5):
                return Response(
                    {"error": "Rating must be between 1 and 5"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError):
            return Response(
                {"error": "Rating must be a number"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(id=user_id)
            course = api_models.Course.objects.get(id=course_id)
            
            # Check if user is enrolled in this course
            if not api_models.EnrolledCourse.objects.filter(user=user, course=course).exists():
                return Response(
                    {"error": "User is not enrolled in this course"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
                
            # Check if review already exists
            existing_review = api_models.Review.objects.filter(user=user, course=course).first()
            if existing_review:
                return Response(
                    {"error": "User has already reviewed this course", "review_id": existing_review.id}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            review_obj = api_models.Review.objects.create(
                user=user,
                course=course,
                review=review,
                rating=rating,
                active=True,
            )
            
            serializer = self.get_serializer(review_obj)
            return Response(
                {"message": "Review created successfully", "review": serializer.data}, 
                status=status.HTTP_201_CREATED
            )
        except (User.DoesNotExist, api_models.Course.DoesNotExist):
            return Response(
                {"error": "User or course not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )


class StudentRateCourseUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = api_serializer.ReviewSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user_id = self.kwargs['user_id']
        review_id = self.kwargs['review_id']

        try:
            user = User.objects.get(id=user_id)
            return api_models.Review.objects.get(id=review_id, user=user)
        except (User.DoesNotExist, api_models.Review.DoesNotExist):
            raise Http404("Review not found")
            
    def update(self, request, *args, **kwargs):
        # Validate rating if present
        rating = request.data.get('rating')
        if rating:
            try:
                rating_value = int(rating)
                if not (1 <= rating_value <= 5):
                    return Response(
                        {"error": "Rating must be between 1 and 5"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except (ValueError, TypeError):
                return Response(
                    {"error": "Rating must be a number"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        return super().update(request, *args, **kwargs)


class StudentWishListListCreateView(generics.ListCreateAPIView):
    serializer_class = api_serializer.WishlistSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        try:
            user = User.objects.get(id=user_id)
            return api_models.Wishlist.objects.filter(user=user)
        except User.DoesNotExist:
            return api_models.Wishlist.objects.none()
    
    def create(self, request, *args, **kwargs):
        user_id = request.data.get('user_id')
        course_id = request.data.get('course_id')
        
        # Validate required fields
        if not all([user_id, course_id]):
            return Response(
                {"error": "Missing required fields"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(id=user_id)
            course = api_models.Course.objects.get(id=course_id)

            wishlist, created = api_models.Wishlist.objects.get_or_create(user=user, course=course)
            
            if not created:
                wishlist.delete()
                return Response({"message": "Wishlist Deleted"}, status=status.HTTP_200_OK)
            
            return Response({"message": "Wishlist Created"}, status=status.HTTP_201_CREATED)
        except (User.DoesNotExist, api_models.Course.DoesNotExist):
            return Response(
                {"error": "User or course not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )


class QuestionAnswerListCreateView(generics.ListCreateAPIView):
    serializer_class = api_serializer.Question_AnswerSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        course_id = self.kwargs['course_id']
        try:
            course = api_models.Course.objects.get(id=course_id)
            # Order by most recent first
            return api_models.Question_Answer.objects.filter(course=course).order_by('-date')
        except api_models.Course.DoesNotExist:
            return api_models.Question_Answer.objects.none()
    
    def create(self, request, *args, **kwargs):
        course_id = request.data.get('course_id')
        user_id = request.data.get('user_id')
        title = request.data.get('title')
        message = request.data.get('message')
        
        # Validate required fields
        if not all([course_id, user_id, title, message]):
            return Response(
                {"error": "Missing required fields"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(id=user_id)
            course = api_models.Course.objects.get(id=course_id)
            
            # Check if user is enrolled in this course
            if not api_models.EnrolledCourse.objects.filter(user=user, course=course).exists():
                return Response(
                    {"error": "User is not enrolled in this course"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Use transaction to ensure both objects are created or none
            with transaction.atomic():
                question = api_models.Question_Answer.objects.create(
                    course=course,
                    user=user,
                    title=title
                )

                api_models.Question_Answer_Message.objects.create(
                    course=course,
                    user=user,
                    message=message,
                    question=question
                )
            
            serializer = self.get_serializer(question)
            return Response(
                {"message": "Group conversation Started", "question": serializer.data}, 
                status=status.HTTP_201_CREATED
            )
        except (User.DoesNotExist, api_models.Course.DoesNotExist):
            return Response(
                {"error": "User or course not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )


class QuestionAnswerMessageSendView(generics.CreateAPIView):
    serializer_class = api_serializer.Question_Answer_MessageSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        course_id = request.data.get('course_id')
        qa_id = request.data.get('qa_id')
        user_id = request.data.get('user_id')
        message = request.data.get('message')
        
        # Validate required fields
        if not all([course_id, qa_id, user_id, message]):
            return Response(
                {"error": "Missing required fields"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(id=user_id)
            course = api_models.Course.objects.get(id=course_id)
            question = api_models.Question_Answer.objects.get(qa_id=qa_id)
            
            # Check if user is enrolled in this course or is teacher of the course
            is_enrolled = api_models.EnrolledCourse.objects.filter(user=user, course=course).exists()
            is_teacher = course.teacher == user
            
            if not (is_enrolled or is_teacher):
                return Response(
                    {"error": "You don't have permission to send messages in this conversation"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Check if question belongs to the course
            if question.course != course:
                return Response(
                    {"error": "This question doesn't belong to the specified course"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            message_obj = api_models.Question_Answer_Message.objects.create(
                course=course,
                user=user,
                message=message,
                question=question
            )

            # Update the question's updated_at field
            question.updated_at = timezone.now()
            question.save()

            question_serializer = api_serializer.Question_AnswerSerializer(question)
            message_serializer = api_serializer.Question_Answer_MessageSerializer(message_obj)
            
            return Response({
                "message": "Message Sent", 
                "question": question_serializer.data,
                "new_message": message_serializer.data
            })
        except (User.DoesNotExist, api_models.Course.DoesNotExist, 
                api_models.Question_Answer.DoesNotExist):
            return Response(
                {"error": "One or more objects not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
            
            

from datetime import datetime, timedelta
from django.db.models import Sum
from django.db.models.functions import ExtractMonth
from django.core.files.uploadedfile import InMemoryUploadedFile

# teacher sections 


def strtobool(val: str) -> bool:
    val = val.lower()
    if val in ('yes', 'true', 't', '1'):
        return True
    elif val in ('no', 'false', 'f', '0'):
        return False
    raise ValueError(f"Invalid truth value: {val}")

class TeacherSummaryAPIView(generics.ListAPIView):
    serializer_class = api_serializer.TeacherSummarySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)

        # calculate date range for monthly revenue
        one_month_ago = datetime.today() - timedelta(days=28)

        total_courses = api_models.Course.objects.filter(teacher=teacher).count()
        total_revenue = api_models.CartOrderItem.objects.filter(teacher=teacher, order__payment_status="Paid").aggregate(total_revenue=Sum("price"))['total_revenue'] or 0
        monthly_revenue = api_models.CartOrderItem.objects.filter(teacher=teacher, order__payment_status="Paid", date__gte=one_month_ago).aggregate(total_revenue=Sum("price"))['total_revenue'] or 0

        enrolled_courses = api_models.EnrolledCourse.objects.filter(teacher=teacher)
        unique_student_ids = set()
        students = []

        for course in enrolled_courses:
            if course.user_id not in unique_student_ids:
                user = User.objects.get(id=course.user_id)
                student = {
                    "first_name": user.profile.first_name,
                    "last_name": user.profile.last_name,
                    "date": course.date
                }

                students.append(student)
                unique_student_ids.add(course.user_id)

        return [{
            "total_courses": total_courses,
            "total_revenue": total_revenue,
            "monthly_revenue": monthly_revenue,
            "total_students": len(students),
        }]
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class TeacherCourseListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Course.objects.filter(teacher=teacher)

class TeacherReviewListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.ReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Review.objects.filter(course__teacher=teacher)

class TeacherReviewDetailAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = api_serializer.ReviewSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        teacher_id = self.kwargs['teacher_id']
        review_id = self.kwargs['review_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Review.objects.get(course__teacher=teacher, id=review_id)

class TeacherStudentsListAPIVIew(viewsets.ViewSet):
    
    def list(self, request, teacher_id=None):
        teacher = api_models.Teacher.objects.get(id=teacher_id)

        enrolled_courses = api_models.EnrolledCourse.objects.filter(teacher=teacher)
        unique_student_ids = set()
        students = []

        for course in enrolled_courses:
            if course.user_id not in unique_student_ids:
                user = User.objects.get(id=course.user_id)
                student = {
                    "full_name": user.profile.full_name,
                    "image": user.profile.image.url,
                    "country": user.profile.country,
                    "date": course.date
                }

                students.append(student)
                unique_student_ids.add(course.user_id)

        return Response(students)

@api_view(("GET", ))
def TeacherAllMonthEarningAPIView(request, teacher_id):
    teacher = api_models.Teacher.objects.get(id=teacher_id)
    monthly_earning_tracker = (
        api_models.CartOrderItem.objects
        .filter(teacher=teacher, order__payment_status="Paid")
        .annotate(
            month=ExtractMonth("date")
        )
        .values("month")
        .annotate(
            total_earning=models.Sum("price")
        )
        .order_by("month")
    )

    return Response(monthly_earning_tracker)

class TeacherBestSellingCourseAPIView(viewsets.ViewSet):

    def list(self, request, teacher_id=None):
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        courses_with_total_price = []
        courses = api_models.Course.objects.filter(teacher=teacher)

        for course in courses:
            revenue = course.enrolledcourse_set.aggregate(total_price=models.Sum('order_item__price'))['total_price'] or 0
            sales = course.enrolledcourse_set.count()

            courses_with_total_price.append({
                'course_image': course.image.url,
                'course_title': course.title,
                'revenue': revenue,
                'sales': sales,
            })

        return Response(courses_with_total_price)
    
class TeacherCourseOrdersListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CartOrderItemSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)

        return api_models.CartOrderItem.objects.filter(teacher=teacher)

class TeacherQuestionAnswerListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.Question_AnswerSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Question_Answer.objects.filter(course__teacher=teacher)
    
class TeacherCouponListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.CouponSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Coupon.objects.filter(teacher=teacher)
    
class TeacherCouponDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = api_serializer.CouponSerializer
    permission_classes = [AllowAny]
    
    def get_object(self):
        teacher_id = self.kwargs['teacher_id']
        coupon_id = self.kwargs['coupon_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Coupon.objects.get(teacher=teacher, id=coupon_id)
    
class TeacherNotificationListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.NotificationSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Notification.objects.filter(teacher=teacher, seen=False)
    
class TeacherNotificationDetailAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = api_serializer.NotificationSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        teacher_id = self.kwargs['teacher_id']
        noti_id = self.kwargs['noti_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Notification.objects.get(teacher=teacher, id=noti_id)
    
class CourseCreateAPIView(generics.CreateAPIView):
    querysect = api_models.Course.objects.all()
    serializer_class = api_serializer.CourseSerializer
    permisscion_classes = [AllowAny]

    def perform_create(self, serializer):
        serializer.is_valid(raise_exception=True)
        course_instance = serializer.save()

        variant_data = []
        for key, value in self.request.data.items():
            if key.startswith('variant') and '[variant_title]' in key:
                index = key.split('[')[1].split(']')[0]
                title = value

                variant_dict = {'title': title}
                item_data_list = []
                current_item = {}
                variant_data = []

                for item_key, item_value in self.request.data.items():
                    if f'variants[{index}][items]' in item_key:
                        field_name = item_key.split('[')[-1].split(']')[0]
                        if field_name == "title":
                            if current_item:
                                item_data_list.append(current_item)
                            current_item = {}
                        current_item.update({field_name: item_value})
                    
                if current_item:
                    item_data_list.append(current_item)

                variant_data.append({'variant_data': variant_dict, 'variant_item_data': item_data_list})

        for data_entry in variant_data:
            variant = api_models.Variant.objects.create(title=data_entry['variant_data']['title'], course=course_instance)

            for item_data in data_entry['variant_item_data']:
                preview_value = item_data.get("preview")
                preview = bool(strtobool(str(preview_value))) if preview_value is not None else False

                api_models.VariantItem.objects.create(
                    variant=variant,
                    title=item_data.get("title"),
                    description=item_data.get("description"),
                    file=item_data.get("file"),
                    preview=preview,
                )

    def save_nested_data(self, course_instance, serializer_class, data):
        serializer = serializer_class(data=data, many=True, context={"course_instance": course_instance})
        serializer.is_valid(raise_exception=True)
        serializer.save(course=course_instance) 

class CourseUpdateAPIView(generics.RetrieveUpdateAPIView):
    querysect = api_models.Course.objects.all()
    serializer_class = api_serializer.CourseSerializer
    permisscion_classes = [AllowAny]

    def get_object(self):
        teacher_id = self.kwargs['teacher_id']
        course_id = self.kwargs['course_id']

        teacher = api_models.Teacher.objects.get(id=teacher_id)
        course = api_models.Course.objects.get(course_id=course_id)

        return course
    
    def update(self, request, *args, **kwargs):
        course = self.get_object()
        serializer = self.get_serializer(course, data=request.data)
        serializer.is_valid(raise_exception=True)

        if "image" in request.data and isinstance(request.data['image'], InMemoryUploadedFile):
            course.image = request.data['image']
        elif 'image' in request.data and str(request.data['image']) == "No File":
            course.image = None
        
        if 'file' in request.data and not str(request.data['file']).startswith("http://"):
            course.file = request.data['file']

        if 'category' in request.data['category'] and request.data['category'] != 'NaN' and request.data['category'] != "undefined":
            category = api_models.Category.objects.get(id=request.data['category'])
            course.category = category

        self.perform_update(serializer)
        self.update_variant(course, request.data)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def update_variant(self, course, request_data):
        for key, value in request_data.items():
            if key.startswith("variants") and '[variant_title]' in key:

                index = key.split('[')[1].split(']')[0]
                title = value

                id_key = f"variants[{index}][variant_id]"
                variant_id = request_data.get(id_key)

                variant_data = {'title': title}
                item_data_list = []
                current_item = {}

                for item_key, item_value in request_data.items():
                    if f'variants[{index}][items]' in item_key:
                        field_name = item_key.split('[')[-1].split(']')[0]
                        if field_name == "title":
                            if current_item:
                                item_data_list.append(current_item)
                            current_item = {}
                        current_item.update({field_name: item_value})
                    
                if current_item:
                    item_data_list.append(current_item)

                existing_variant = course.variant_set.filter(id=variant_id).first()

                if existing_variant:
                    existing_variant.title = title
                    existing_variant.save()

                    for item_data in item_data_list[1:]:
                        preview_value = item_data.get("preview")
                        preview = bool(strtobool(str(preview_value))) if preview_value is not None else False

                        variant_item = api_models.VariantItem.objects.filter(variant_item_id=item_data.get("variant_item_id")).first()

                        if not str(item_data.get("file")).startswith("http://"):
                            if item_data.get("file") != "null":
                                file = item_data.get("file")
                            else:
                                file = None
                            
                            title = item_data.get("title")
                            description = item_data.get("description")

                            if variant_item:
                                variant_item.title = title
                                variant_item.description = description
                                variant_item.file = file
                                variant_item.preview = preview
                            else:
                                variant_item = api_models.VariantItem.objects.create(
                                    variant=existing_variant,
                                    title=title,
                                    description=description,
                                    file=file,
                                    preview=preview
                                )
                        
                        else:
                            title = item_data.get("title")
                            description = item_data.get("description")

                            if variant_item:
                                variant_item.title = title
                                variant_item.description = description
                                variant_item.preview = preview
                            else:
                                variant_item = api_models.VariantItem.objects.create(
                                    variant=existing_variant,
                                    title=title,
                                    description=description,
                                    preview=preview
                                )
                        
                        variant_item.save()

                else:
                    new_variant = api_models.Variant.objects.create(
                        course=course, title=title
                    )

                    for item_data in item_data_list:
                        preview_value = item_data.get("preview")
                        preview = bool(strtobool(str(preview_value))) if preview_value is not None else False

                        api_models.VariantItem.objects.create(
                            variant=new_variant,
                            title=item_data.get("title"),
                            description=item_data.get("description"),
                            file=item_data.get("file"),
                            preview=preview,
                        )

    def save_nested_data(self, course_instance, serializer_class, data):
        serializer = serializer_class(data=data, many=True, context={"course_instance": course_instance})
        serializer.is_valid(raise_exception=True)
        serializer.save(course=course_instance) 

class CourseDetailAPIView(generics.RetrieveDestroyAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        course_id = self.kwargs['course_id']
        return api_models.Course.objects.get(course_id=course_id)

class CourseVariantDeleteAPIView(generics.DestroyAPIView):
    serializer_class = api_serializer.VariantSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        variant_id = self.kwargs['variant_id']
        teacher_id = self.kwargs['teacher_id']
        course_id = self.kwargs['course_id']

        print("variant_id ========", variant_id)

        teacher = api_models.Teacher.objects.get(id=teacher_id)
        course = api_models.Course.objects.get(teacher=teacher, course_id=course_id)
        return api_models.Variant.objects.get(id=variant_id)
    
class CourseVariantItemDeleteAPIVIew(generics.DestroyAPIView):
    serializer_class = api_serializer.VariantItemSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        variant_id = self.kwargs['variant_id']
        variant_item_id = self.kwargs['variant_item_id']
        teacher_id = self.kwargs['teacher_id']
        course_id = self.kwargs['course_id']


        teacher = api_models.Teacher.objects.get(id=teacher_id)
        course = api_models.Course.objects.get(teacher=teacher, course_id=course_id)
        variant = api_models.Variant.objects.get(variant_id=variant_id, course=course)
        return api_models.VariantItem.objects.get(variant=variant, variant_item_id=variant_item_id) 