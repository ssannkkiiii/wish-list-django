from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, NotFound
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.core.cache import cache
from .cache_utils import (
    cache_products_list, get_cached_products_list,
    cache_categories_list, get_cached_categories_list,
    invalidate_user_cache
)

from .models import Category, Product
from .serializers import (
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductCreateUpdateSerializer
)
from .permissions import IsAuthorOrReadOnly


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name']
    ordering = ['name']

    def list(self, request, *args, **kwargs):
        # Try to get cached data first
        cached_data = get_cached_categories_list()
        if cached_data:
            return Response(cached_data)
        
        # If not cached, get data from database
        response = super().list(request, *args, **kwargs)
        
        # Cache the response data
        cache_categories_list(response.data)
        
        return response

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        if response.status_code == 201:
            # Invalidate categories cache when new category is created
            cache.delete('categories_list')
        return response


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'


class ProductList(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'category__name']
    ordering_fields = ['created_at', 'updated_at', 'name', 'price']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateUpdateSerializer
        return ProductListSerializer

    def get_queryset(self):
        qs = Product.objects.select_related('user', 'category').all()

        q = self.request.query_params.get('q')
        if q:
            qs = qs.filter(
                Q(name__icontains=q) |
                Q(url__icontains=q) |
                Q(category__name__icontains=q) |
                Q(user__username__icontains=q)
            )

        ordering = self.request.query_params.get('ordering')
        if ordering:
            # Validate ordering field to prevent SQL injection
            allowed_fields = ['created_at', 'updated_at', 'name', 'price', '-created_at', '-updated_at', '-name', '-price']
            if ordering in allowed_fields:
                qs = qs.order_by(ordering)

        return qs

    def list(self, request, *args, **kwargs):
        # Create cache key based on filters
        filters = {
            'q': request.query_params.get('q', ''),
            'category': request.query_params.get('category', ''),
            'ordering': request.query_params.get('ordering', '-created_at')
        }
        
        # Try to get cached data first
        cached_data = get_cached_products_list(request.user.id, filters)
        if cached_data:
            return Response(cached_data)
        
        # If not cached, get data from database
        response = super().list(request, *args, **kwargs)
        
        # Cache the response data
        cache_products_list(request.user.id, filters, response.data)
        
        return response

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        # Invalidate user's product cache
        invalidate_user_cache(self.request.user.id)


class ProductDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.select_related('user', 'category').all()
    permission_classes = [IsAuthorOrReadOnly]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH', 'POST'):
            return ProductCreateUpdateSerializer
        return ProductDetailSerializer

    def perform_update(self, serializer):
        serializer.save()
        # Invalidate user's product cache
        invalidate_user_cache(self.request.user.id)

    def perform_destroy(self, instance):
        user_id = instance.user.id
        instance.delete()
        # Invalidate user's product cache
        invalidate_user_cache(user_id)
