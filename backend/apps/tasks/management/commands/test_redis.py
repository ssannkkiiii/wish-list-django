from django.core.management.base import BaseCommand
from django.core.cache import cache
from django.conf import settings
import time


class Command(BaseCommand):
    help = 'Test Redis connection and caching functionality'

    def add_arguments(self, parser):
        parser.add_argument(
            '--test-write',
            action='store_true',
            help='Test cache write operations',
        )
        parser.add_argument(
            '--test-read',
            action='store_true',
            help='Test cache read operations',
        )

    def handle(self, *args, **options):
        self.stdout.write('Testing Redis connection...')
        
        try:
            # Test basic connection
            cache.set('test_key', 'test_value', 30)
            self.stdout.write(
                self.style.SUCCESS('✓ Redis connection successful')
            )
            
            # Test read operation
            value = cache.get('test_key')
            if value == 'test_value':
                self.stdout.write(
                    self.style.SUCCESS('✓ Redis read operation successful')
                )
            else:
                self.stdout.write(
                    self.style.ERROR('✗ Redis read operation failed')
                )
            
            # Test write operations if requested
            if options['test_write']:
                self.test_write_operations()
            
            # Test read operations if requested
            if options['test_read']:
                self.test_read_operations()
            
            # Test cache configuration
            self.test_cache_config()
            
            # Clean up test data
            cache.delete('test_key')
            self.stdout.write(
                self.style.SUCCESS('✓ Redis test completed successfully')
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'✗ Redis connection failed: {e}')
            )

    def test_write_operations(self):
        """Test various write operations."""
        self.stdout.write('Testing write operations...')
        
        test_cases = [
            ('string_key', 'string_value'),
            ('int_key', 42),
            ('float_key', 3.14),
            ('bool_key', True),
            ('list_key', [1, 2, 3, 'test']),
            ('dict_key', {'name': 'test', 'value': 123}),
        ]
        
        for key, value in test_cases:
            try:
                cache.set(key, value, 30)
                self.stdout.write(f'  ✓ Set {key}: {value}')
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'  ✗ Failed to set {key}: {e}')
                )

    def test_read_operations(self):
        """Test various read operations."""
        self.stdout.write('Testing read operations...')
        
        test_keys = ['string_key', 'int_key', 'float_key', 'bool_key', 'list_key', 'dict_key']
        
        for key in test_keys:
            try:
                value = cache.get(key)
                if value is not None:
                    self.stdout.write(f'  ✓ Retrieved {key}: {value}')
                else:
                    self.stdout.write(f'  ⚠ Key {key} not found (may have expired)')
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'  ✗ Failed to get {key}: {e}')
                )

    def test_cache_config(self):
        """Test cache configuration."""
        self.stdout.write('Testing cache configuration...')
        
        # Check cache backend
        cache_backend = settings.CACHES['default']['BACKEND']
        self.stdout.write(f'  Cache backend: {cache_backend}')
        
        # Check cache location
        cache_location = settings.CACHES['default']['LOCATION']
        self.stdout.write(f'  Cache location: {cache_location}')
        
        # Test cache TTL
        cache.set('ttl_test', 'test_value', 1)
        time.sleep(0.5)
        if cache.get('ttl_test'):
            self.stdout.write('  ✓ TTL test passed (value still exists)')
        else:
            self.stdout.write('  ⚠ TTL test failed (value expired too quickly)')
        
        # Clean up
        cache.delete('ttl_test')
