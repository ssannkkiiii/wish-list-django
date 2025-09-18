from django.contrib import admin
from django.utils.html import format_html

from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'slug')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('name',)
    list_display_links = ('name',)



@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'price', 'category', 'user', 'created_at', 'image_preview')
    list_filter = ('category', 'user', 'created_at')
    search_fields = ('name', 'url', 'user__username', 'category__name')
    readonly_fields = ('image_preview', 'created_at', 'updated_at')
    autocomplete_fields = ('category', 'user')
    ordering = ('-created_at',)

    fieldsets = (
        (None, {
            'fields': ('name', 'price', 'url', 'image', 'image_preview')
        }),
        ('Відношення', {
            'fields': ('category', 'user')
        }),
        ('Час', {
            'fields': ('created_at', 'updated_at')
        }),
    )

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 120px; max-width: 180px; object-fit: contain;" />', obj.image.url)
        return "(нема зображення)"
    image_preview.short_description = 'Превʼю зображення'
