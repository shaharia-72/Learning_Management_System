from api import views as api_views
from django.urls import path, re_path
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    path("user/token/", api_views.MyTokenObtainPairView.as_view()),
    path("user/token/refresh/", TokenRefreshView.as_view()),
    path("user/register/", api_views.RegisterView.as_view()),
    # path("user/password-reset/<email>/", api_views.PasswordResetView.as_view()),
    re_path(r'^user/password-reset/(?P<email>[\w\.\+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/$', api_views.PasswordResetView.as_view()),
    path("user/password-change/", api_views.PasswordChangeView.as_view()),
#     path("user/profile/<user_id>/", api_views.ProfileAPIView.as_view()),
#     path("user/change-password/", api_views.ChangePasswordAPIView.as_view()),

    #core items 
    path("course/course-category/", api_views.CourseCategoryView.as_view()),
    path("course/course-list/", api_views.CourseListView.as_view()),
    path("course/course-detail/<slug>/", api_views.CourseDetailView.as_view()),
    path("cart/course-Cart/", api_views.CourseCartView.as_view()),
    path("cart/course-Cart-List/<cart_id>/", api_views.CourseCartListView.as_view()),
    path("cart/course-Cart-List/<cart_id>/<item_id>/", api_views.CourseCartListDeleteView.as_view()),
    path("cart/course-Cart-Statistic/<cart_id>/", api_views.CourseCartStatisticsView.as_view()),
    path("order/course-create-order/", api_views.CreateOrderView.as_view()),
    path("order/course-Check-Out-order/<oid>/", api_views.CheckOutOrderView.as_view()),
    path("coupon/course-coupon-apply/", api_views.couponView.as_view()),

    # payment
    path("payment/strip-checkout/<str:order_oid>/", api_views.StripeCheckOutView.as_view(), name='stripe-checkout')
]

