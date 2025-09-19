from django.core.cache import cache
from django.conf import settings
import json
import logging

logger = logging.getLogger(__name__)

def get_cache_key(prefix, *args):
    """Generate a cache key from prefix and arguments."""
    key_parts = [str(prefix)] + [str(arg) for arg in args]
    return ':'.join(key_parts)

def cache_data(key, data, timeout=None):
    """Cache data with optional timeout."""
    if timeout is None:
        timeout = getattr(settings, 'CACHE_TTL', 900)
    
    try:
        cache.set(key, data, timeout)
        logger.debug(f"Data cached with key: {key}")
    except Exception as e:
        logger.error(f"Failed to cache data: {e}")

def get_cached_data(key):
    """Retrieve cached data."""
    try:
        data = cache.get(key)
        if data:
            logger.debug(f"Cache hit for key: {key}")
        else:
            logger.debug(f"Cache miss for key: {key}")
        return data
    except Exception as e:
        logger.error(f"Failed to retrieve cached data: {e}")
        return None

def invalidate_cache_pattern(pattern):
    """Invalidate cache entries matching a pattern."""
    try:
        # This is a simplified version. In production, you might want to use
        # Redis SCAN command for pattern matching
        logger.info(f"Cache invalidation requested for pattern: {pattern}")
    except Exception as e:
        logger.error(f"Failed to invalidate cache pattern: {e}")

def cache_products_list(user_id, filters, data):
    """Cache products list for a user with specific filters."""
    key = get_cache_key('products_list', user_id, hash(str(filters)))
    cache_data(key, data)

def get_cached_products_list(user_id, filters):
    """Get cached products list for a user with specific filters."""
    key = get_cache_key('products_list', user_id, hash(str(filters)))
    return get_cached_data(key)

def cache_categories_list(data):
    """Cache categories list."""
    key = get_cache_key('categories_list')
    cache_data(key, data)

def get_cached_categories_list():
    """Get cached categories list."""
    key = get_cache_key('categories_list')
    return get_cached_data(key)

def invalidate_user_cache(user_id):
    """Invalidate all cache entries for a specific user."""
    patterns = [
        f'products_list:{user_id}:*',
        f'user_profile:{user_id}',
    ]
    
    for pattern in patterns:
        invalidate_cache_pattern(pattern)

def cache_user_profile(user_id, data):
    """Cache user profile data."""
    key = get_cache_key('user_profile', user_id)
    cache_data(key, data)

def get_cached_user_profile(user_id):
    """Get cached user profile data."""
    key = get_cache_key('user_profile', user_id)
    return get_cached_data(key)
