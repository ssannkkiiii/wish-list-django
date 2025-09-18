from rest_framework import serializers
from django.utils.text import slugify
from .models import Category, Product 


class CategorySerializer(serializers.ModelSerializer):
    posts_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'posts_count', 'created_at']
        read_only_fields = ['slug', 'created_at']

    def get_posts_count(self, obj):
        return obj.posts.filter(status='published').count()
    
    def create(self, validated_data):
        validated_data['slug'] = slugify(validated_data['name'])
        return super().create(validated_data)
    
    
class ProductListSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    category = serializers.StringRelatedField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'user', 'category', 'image', 'price'
        ]
        read_only_fields = ['user']


class ProductDetailSerializer(serializers.ModelSerializer):
    user_info = serializers.SerializerMethodField()
    category_info = serializers.SerializerMethodField()
    
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'user', 'user_info', 'category', 'category_info', 'image'
        ]
        read_only_fields = ['user']
        
        def get_user_info(self, obj):
            user = obj.user
            return {
                'id': user.id,
                'username': user.username,
                'full_name': user.full_name,
                'avatar': user.avatar.url if user.avatar else None
            } 
            
        def get_categoy_info(self, obj):
            cat = obj.category
            return {
                'slug': cat.slug,
                'name': cat.name,
            }

class ProductCreateUpdateSerailizer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['name', 'price', 'image', 'category', 'url']
        
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)