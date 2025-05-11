from django.contrib import admin
from api import models
from django.utils.html import format_html

# # Common admin settings
class BaseAdmin(admin.ModelAdmin):
    list_per_page = 25
    save_on_top = True
    
    def __init__(self, model, admin_site):
        super().__init__(model, admin_site)
        # Set date hierarchy based on model fields
        if hasattr(model, 'date'):
            self.date_hierarchy = 'date'
        elif hasattr(model, 'created_at'):
            self.date_hierarchy = 'created_at'

# Teacher Admin
@admin.register(models.Teacher)
class TeacherAdmin(BaseAdmin):
    list_display = ('full_name', 'user', 'country', 'courses_count', 'students_count')
    search_fields = ('full_name', 'user__username', 'country')
    readonly_fields = ('full_name',)
    fieldsets = (
        ('Personal Info', {
            'fields': ('user', 'full_name', 'image', 'country')
        }),
        ('Bio & About', {
            'fields': (
                'bio', 'about')
        }),
        ('Social Media', {
            'fields': ('personal_website', 'facebook', 'twitter', 
                      'instagram', 'linkedIn', 'telegram', 'youtube'),
            # 'classes': ('collapse',)
        }),
    )

    def courses_count(self, obj):
        return obj.courses().count()
    courses_count.short_description = 'Courses'

    def students_count(self, obj):
        return obj.students().count()
    students_count.short_description = 'Students'

# Category Admin
@admin.register(models.Category)
class CategoryAdmin(BaseAdmin):
    list_display = ('title', 'active', 'course_count', 'slug')
    list_filter = ('active',)
    search_fields = ('title',)
    prepopulated_fields = {'slug': ('title',)}
    actions = ['activate_categories', 'deactivate_categories']

    def activate_categories(self, request, queryset):
        queryset.update(active=True)
    activate_categories.short_description = "Activate selected categories"

    def deactivate_categories(self, request, queryset):
        queryset.update(active=False)
    deactivate_categories.short_description = "Deactivate selected categories"

# Course Admin
@admin.register(models.Course)
class CourseAdmin(BaseAdmin):
    list_display = ('title', 'teacher', 'category', 'price', 'platform_status', 'featured', 'average_rating_display')
    list_filter = ('platform_status', 'teacher_course_status', 'featured', 'category', 'language', 'level')
    search_fields = ('title', 'description', 'teacher__full_name')
    readonly_fields = ('course_id', 'average_rating_display', 'rating_count', 'created_at', 'updated_at')
    filter_horizontal = ()
    prepopulated_fields = {'slug': ('title',)}
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('title', 'category', 'teacher', 'description', 'price')
        }),
        ('Media', {
            'fields': ('image', 'file')
        }),
        ('Details', {
            'fields': ('language', 'level', 'featured', 'rating')
        }),
        ('Status', {
            'fields': ('platform_status', 'teacher_course_status')
        }),
        ('Metadata', {
            'fields': ('course_id', 'slug', 'created_at', 'updated_at',),
            # 'classes': ('collapse',)
        }),
    )

    def average_rating_display(self, obj):
        return obj.average_rating() or "No ratings yet"
    average_rating_display.short_description = 'Avg Rating'


# Variant Admin
class VariantItemInline(admin.TabularInline):
    model = models.VariantItem
    extra = 1
    readonly_fields = ('content_duration', 'variant_item_id')

@admin.register(models.Variant)
class VariantAdmin(BaseAdmin):
    list_display = ('title', 'course', 'items_count','module')
    search_fields = ('title', 'course__title')
    inlines = [VariantItemInline]
    
    def items_count(self, obj):
        return obj.items().count()
    items_count.short_description = 'Items'

# VariantItem Admin
@admin.register(models.VariantItem)
class VariantItemAdmin(BaseAdmin):
    list_display = ('title', 'variant', 'course', 'preview', 'content_duration',)
    list_filter = ('preview', 'variant__course')
    search_fields = ('title', 'variant__title', 'variant__course__title')
    readonly_fields = ('content_duration', 'variant_item_id')
    
    def course(self, obj):
        return obj.variant.course
    course.short_description = 'Course'

# Q&A Admin
class QuestionAnswerMessageInline(admin.TabularInline):
    model = models.Question_Answer_Message
    extra = 1
    readonly_fields = ('qam_id', 'date')

@admin.register(models.Question_Answer)
class QuestionAnswerAdmin(BaseAdmin):
    list_display = ('title', 'course', 'user', 'message_count', 'date')
    search_fields = ('title', 'course__title', 'user__username')
    inlines = [QuestionAnswerMessageInline]
    
    def message_count(self, obj):
        return obj.messages().count()
    message_count.short_description = 'Messages'

# Cart Admin
@admin.register(models.Cart)
class CartAdmin(BaseAdmin):
    list_display = ('cart_id','user', 'course', 'price', 'total', 'date')
    list_filter = ('date',)
    search_fields = ('user__username', 'course__title')
    
    fieldsets = (
        ('Basic Info',{
            'fields': ('user', 'course', 'country','price','tax_fee', 'total', 'date',)
            }),
            ('Metadata', {
            'fields': ('cart_id',)
        }),
    )

# Order Admin
class CartOrderItemInline(admin.TabularInline):
    model = models.CartOrderItem
    extra = 0
    readonly_fields = ('oid', 'price', 'total')

@admin.register(models.CartOrder)
class CartOrderAdmin(BaseAdmin):
    list_display = ('oid', 'student', 'payment_status', 'total', 'date')
    list_filter = ('payment_status', 'date')
    search_fields = ('oid', 'student__username', 'email')
    readonly_fields = ('oid', 'stripe_session_id')
    inlines = [CartOrderItemInline]
    fieldsets = (
        ('Order Info', {
            'fields': ('oid', 'student', 'payment_status', 'stripe_session_id')
        }),
        ('Financials', {
            'fields': ('sub_total', 'tax_fee', 'total', 'initial_total', 'saved')
        }),
        ('Customer Info', {
            'fields': ('full_name', 'email', 'country'),
            # 'classes': ('collapse',)
        }),
    )

# Certificate Admin
@admin.register(models.Certificate)
class CertificateAdmin(BaseAdmin):
    list_display = ('course', 'user', 'certificate_id', 'date')
    search_fields = ('course__title', 'user__username', 'certificate_id')
    readonly_fields = ('certificate_id',)

# Enrolled Course Admin
@admin.register(models.EnrolledCourse)
class EnrolledCourseAdmin(BaseAdmin):
    list_display = ('course', 'user', 'teacher', 'enrollment_id', 'date')
    search_fields = ('course__title', 'user__username', 'teacher__full_name')
    readonly_fields = ('enrollment_id',)
    list_filter = ('date',)
    
    

# Review Admin
@admin.register(models.Review)
class ReviewAdmin(BaseAdmin):
    list_display = ('course', 'user', 'rating', 'active', 'date')
    list_filter = ('rating', 'active', 'date')
    search_fields = ('course__title', 'user__username', 'review')
    list_editable = ('active',)

# Notification Admin
@admin.register(models.Notification)
class NotificationAdmin(BaseAdmin):
    list_display = ('type', 'user', 'teacher', 'seen', 'date')
    list_filter = ('type', 'seen', 'date')
    search_fields = ('user__username', 'teacher__full_name')
    list_editable = ('seen',)

# Coupon Admin
@admin.register(models.Coupon)
class CouponAdmin(BaseAdmin):
    list_display = ('code', 'teacher', 'discount', 'active', 'used_by_count')
    list_filter = ('active', 'teacher')
    search_fields = ('code', 'teacher__full_name')
    filter_horizontal = ('used_by',)
    
    def used_by_count(self, obj):
        return obj.used_by.count()
    used_by_count.short_description = 'Used By'

# Other simple models
@admin.register(models.CompletedLesson)
class CompletedLessonAdmin(BaseAdmin):
    list_display = ('course', 'user', 'variant_item', 'date')
    search_fields = ('course__title', 'user__username')

@admin.register(models.Note)
class NoteAdmin(BaseAdmin):
    list_display = ('title', 'user', 'course', 'date')
    search_fields = ('title', 'user__username', 'course__title')

@admin.register(models.Wishlist)
class WishlistAdmin(BaseAdmin):
    list_display = ('user', 'course')
    search_fields = ('user__username', 'course__title')

@admin.register(models.Country)
class CountryAdmin(BaseAdmin):
    list_display = ('name', 'tax_rate', 'active')
    list_editable = ('tax_rate', 'active')
    search_fields = ('name',)


# admin.site.register(models.Teacher)
# admin.site.register(models.Category)
# admin.site.register(models.Course)
# admin.site.register(models.Variant)
# admin.site.register(models.VariantItem)
# admin.site.register(models.Question_Answer)
# admin.site.register(models.Question_Answer_Message)
# admin.site.register(models.Cart)
# admin.site.register(models.CartOrder)
# admin.site.register(models.CartOrderItem)
# admin.site.register(models.Certificate)
# admin.site.register(models.CompletedLesson)
# admin.site.register(models.EnrolledCourse)
# admin.site.register(models.Note)
# admin.site.register(models.Review)
# admin.site.register(models.Notification)
# admin.site.register(models.Coupon)
# admin.site.register(models.Wishlist)
# admin.site.register(models.Country)
