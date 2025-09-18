from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.urls import reverse


class Category(models.Model):
    slug = models.SlugField(verbose_name='Slug category', unique=True, max_length=100, blank=False, null=True)
    name = models.CharField(verbose_name='Category name', max_length=10)
    
    class Meta:
        db_table = 'category'
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        ordering = ['name']
    
    
    def __str__(self):
        return f'Category {self.name}'
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug == slugify(self.name)
        super().save(*args, **kwargs)

    
class Product(models.Model):
    
    name = models.CharField(verbose_name='Product Name', max_length=100)
    price = models.DecimalField(verbose_name='Product price', max_digits=10, decimal_places=2)
    url = models.URLField(unique=True, max_length=255, verbose_name="Product url")
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    
    category = models.ForeignKey(
        Category,
        null=True,
        blank=True, 
        related_name='posts',
        on_delete=models.SET_NULL
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='posts'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'posts'
        verbose_name = 'Post'
        verbose_name_plural = 'Posts'
        ordering = ['-created_at']
        
        
    def __str__(self):
        return self.title
    
    