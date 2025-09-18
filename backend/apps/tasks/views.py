from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

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
            qs = qs.order_by(ordering)

        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ProductDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.select_related('user', 'category').all()
    permission_classes = [IsAuthorOrReadOnly]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH', 'POST'):
            return ProductCreateUpdateSerializer
        return ProductDetailSerializer

    def perform_update(self, serializer):
        serializer.save(user=self.get_object().user)

    def perform_destroy(self, instance):
        instance.delete()
