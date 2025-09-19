from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from .models import Category, Product

User = get_user_model()


class CategoryModelTest(TestCase):
    def setUp(self):
        self.category_data = {
            'name': 'Electronics',
            'description': 'Electronic devices and gadgets'
        }

    def test_create_category(self):
        category = Category.objects.create(**self.category_data)
        self.assertEqual(category.name, self.category_data['name'])
        self.assertEqual(category.slug, 'electronics')
        self.assertTrue(category.slug)

    def test_category_str_representation(self):
        category = Category.objects.create(**self.category_data)
        self.assertEqual(str(category), f'Category {self.category_data["name"]}')

    def test_category_slug_auto_generation(self):
        category = Category.objects.create(name='Test Category')
        self.assertEqual(category.slug, 'test-category')


class ProductModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.category = Category.objects.create(
            name='Electronics',
            description='Electronic devices'
        )
        self.product_data = {
            'name': 'Test Product',
            'price': 99.99,
            'url': 'https://example.com/product',
            'user': self.user,
            'category': self.category
        }

    def test_create_product(self):
        product = Product.objects.create(**self.product_data)
        self.assertEqual(product.name, self.product_data['name'])
        self.assertEqual(product.price, self.product_data['price'])
        self.assertEqual(product.user, self.user)
        self.assertEqual(product.category, self.category)

    def test_product_str_representation(self):
        product = Product.objects.create(**self.product_data)
        self.assertEqual(str(product), self.product_data['name'])

    def test_product_clean_validation(self):
        # Test negative price validation
        product = Product(
            name='Test Product',
            price=-10.00,
            url='https://example.com/product',
            user=self.user
        )
        with self.assertRaises(Exception):  # ValidationError
            product.full_clean()


class CategoryAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.category_url = reverse('category-list-create')
        self.category_data = {
            'name': 'Electronics',
            'description': 'Electronic devices and gadgets'
        }

    def test_create_category_requires_authentication(self):
        response = self.client.post(self.category_url, self.category_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_category_authenticated(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.category_url, self.category_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Category.objects.count(), 1)

    def test_list_categories(self):
        Category.objects.create(**self.category_data)
        response = self.client.get(self.category_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class ProductAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.category = Category.objects.create(
            name='Electronics',
            description='Electronic devices'
        )
        self.product_url = reverse('product-list-create')
        self.product_data = {
            'name': 'Test Product',
            'price': 99.99,
            'url': 'https://example.com/product',
            'category': self.category.id
        }

    def test_create_product_requires_authentication(self):
        response = self.client.post(self.product_url, self.product_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_product_authenticated(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.product_url, self.product_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.count(), 1)

    def test_list_products(self):
        Product.objects.create(
            name='Test Product',
            price=99.99,
            url='https://example.com/product',
            user=self.user,
            category=self.category
        )
        response = self.client.get(self.product_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_product_validation(self):
        self.client.force_authenticate(user=self.user)
        # Test negative price
        invalid_data = self.product_data.copy()
        invalid_data['price'] = -10.00
        response = self.client.post(self.product_url, invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_product_url_validation(self):
        self.client.force_authenticate(user=self.user)
        # Test invalid URL
        invalid_data = self.product_data.copy()
        invalid_data['url'] = 'invalid-url'
        response = self.client.post(self.product_url, invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
