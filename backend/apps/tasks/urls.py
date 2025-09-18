from django.urls import path
from . import views

urlpatterns += [
    path('categories/', views.CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<slug:slug>/', views.CategoryDetailView.as_view(), name='category-detail'),
    
    path('products/', views.ProductList.as_view(), name='product-list-create'),
    path('products/<int:pk>/', views.ProductDetail.as_view(), name='product-detail'),
]