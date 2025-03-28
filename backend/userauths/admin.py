from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import User, Profile

class ProfileInline(admin.StackedInline):

    model = Profile
    extra = 0

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ("email", "user_unique_id", "is_active", "is_staff")
    list_filter = ("is_active", "is_staff", "date_joined")
    search_fields = ("email", "user_unique_id")
    ordering = ("-date_joined",)
    readonly_fields = ("user_unique_id", "date_joined")  # Prevent manual editing of user_unique_id

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("user_unique_id", "username","first_name", "last_name")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important Dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "password", "confirm_password", "is_active", "is_staff"),
        }),
    )

    inlines = [ProfileInline]
    
admin.site.register(User, CustomUserAdmin)

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    """ Separate Profile admin with optimized list display """
    list_display = ("user",)
    search_fields = ("user__email", "user__user_unique_id")
    readonly_fields = ("date_created",)


