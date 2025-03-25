from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import User, Profile

class ProfileInline(admin.StackedInline):
    """ Allows editing Profile within the User admin page """
    model = Profile
    extra = 0  # No extra empty profile forms

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ("email", "user_unique_id", "is_active", "is_staff", "formatted_profile_image")
    list_filter = ("is_active", "is_staff", "date_joined")
    search_fields = ("email", "user_unique_id")
    ordering = ("-date_joined",)
    readonly_fields = ("user_unique_id", "date_joined")  # Prevent manual editing of user_unique_id

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("user_unique_id", "first_name", "last_name")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important Dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "password1", "password2", "is_active", "is_staff"),
        }),
    )

    inlines = [ProfileInline]  # Allows inline Profile editing in User Admin

    def formatted_profile_image(self, obj):
        """ Display a small profile image in UserAdmin """
        if obj.profile.image:
            return format_html('<img src="{}" width="40" height="40" style="border-radius: 50%;" />', obj.profile.image.url)
        return "No Image"
    
    formatted_profile_image.short_description = "Profile Image"

admin.site.register(User, CustomUserAdmin)

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    """ Separate Profile admin with optimized list display """
    list_display = ("user", "country", "formatted_image")
    search_fields = ("user__email", "user__user_unique_id", "country")
    list_filter = ("country",)
    readonly_fields = ("date_created",)

    def formatted_image(self, obj):
        """ Display small profile image in ProfileAdmin """
        if obj.image:
            return format_html('<img src="{}" width="40" height="40" style="border-radius: 50%;" />', obj.image.url)
        return "No Image"
    
    formatted_image.short_description = "Profile Image"
