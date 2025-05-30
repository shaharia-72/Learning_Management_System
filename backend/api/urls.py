from api import views as api_views
from django.urls import path, re_path
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    path("user/token/", api_views.MyTokenObtainPairView.as_view()),
    path("user/token/refresh/", TokenRefreshView.as_view()),
    path("user/register/", api_views.RegisterView.as_view()),
    path("user/password-reset/<email>/", api_views.PasswordResetView.as_view()),
    re_path(r'^user/password-reset/(?P<email>[\w\.\+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/$', api_views.PasswordResetView.as_view()),
    path("user/password-change/", api_views.PasswordChangeView.as_view()),
    path("user/profile/<user_id>/", api_views.ProfileAPIView.as_view()),

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
    path("order/coupon/", api_views.CouponApplyView.as_view()),
    path("coupon/course-coupon-apply/", api_views.couponView.as_view()),

    # payment
    # path("payment/strip-checkout/<str:order_oid>/", api_views.StripeCheckOutView.as_view(), name='stripe-checkout'),
    
    # Student API Endpoints
    path("student/summary/<user_id>/", api_views.StudentSummaryView.as_view()),
    path("student/course-list/<user_id>/", api_views.StudentCourseListView.as_view()),
    path("student/course-detail/<user_id>/<str:enrollment_id>/", api_views.StudentCourseDetailView.as_view()),
    path("student/course-completed/", api_views.StudentCourseCompletedCreateView.as_view()),
    path("student/course-note/<user_id>/<enrollment_id>/", api_views.StudentNoteCreateView.as_view()),
    path("student/course-note-detail/<user_id>/<enrollment_id>/<str:note_id>/", api_views.StudentNoteDetailView.as_view()),
    path("student/rate-course/", api_views.StudentRateCourseCreateView.as_view()),
    path("student/review-detail/<user_id>/<review_id>/", api_views.StudentRateCourseUpdateView.as_view()),
    path("student/wishlist/<user_id>/", api_views.StudentWishListListCreateView.as_view()),
    path("student/question-answer-list-create/<course_id>/", api_views.QuestionAnswerListCreateView.as_view()),
    path("student/question-answer-message-create/", api_views.QuestionAnswerMessageSendView.as_view()),
    
    # Teacher Routes
    path("teacher/summary/<teacher_id>/", api_views.TeacherSummaryView.as_view()),
    path("teacher/course-lists/<teacher_id>/", api_views.TeacherCourseListView.as_view()),
    path("teacher/review-lists/<teacher_id>/", api_views.TeacherReviewListView.as_view()),
    path("teacher/review-detail/<teacher_id>/<review_id>/", api_views.TeacherReviewDetailView.as_view()),
    path("teacher/student-lists/<teacher_id>/", api_views.TeacherStudentsListVIew.as_view({'get': 'list'})),
    path("teacher/all-months-earning/<str:teacher_id>/", api_views.TeacherAllMonthEarningView),
    path("teacher/best-course-earning/<teacher_id>/", api_views.TeacherBestSellingCourseView.as_view({'get': 'list'})),
    path("teacher/course-order-list/<teacher_id>/", api_views.TeacherCourseOrdersListView.as_view()),
    path("teacher/question-answer-list/<teacher_id>/", api_views.TeacherQuestionAnswerListView.as_view()),
    path("teacher/question-answer-message-create/", api_views.QuestionAnswerMessageSendView.as_view()),
    path("teacher/coupon-list/<teacher_id>/", api_views.TeacherCouponListCreateView.as_view()),
    path("teacher/coupon-detail/<teacher_id>/<coupon_id>/", api_views.TeacherCouponDetailView.as_view()),
    path("teacher/notice-list/<teacher_id>/", api_views.TeacherNotificationListView.as_view()),
    path("teacher/notice-detail/<teacher_id>/<noti_id>", api_views.TeacherNotificationDetailView.as_view()),
    path("teacher/course-create/", api_views.CourseCreateView.as_view()),
    path("teacher/course-update/<teacher_id>/<course_id>/", api_views.CourseUpdateView.as_view()),
    path("teacher/course-detail/<slug>/", api_views.TeachCourseDetailView.as_view()),
    path("teacher/course/variant-delete/<variant_id>/<teacher_id>/<course_id>/", api_views.CourseVariantDeleteView.as_view()),
    path("teacher/course/variant-item-delete/<variant_id>/<variant_item_id>/<teacher_id>/<course_id>/", api_views.CourseVariantItemDeleteVIew.as_view()),


    # payment
    path("payment/stripe-checkout/<str:order_oid>/", api_views.StripeCheckoutView.as_view()),
    path("payment/payment-sucess/", api_views.PaymentSuccessView.as_view()),

]

