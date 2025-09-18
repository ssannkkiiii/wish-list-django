from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password]
    )
    
    password_confirm = serializers.CharField(write_only=True)
    
    
    class Meta:
        model = User
        fields = (
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name'
        )
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError(
                {"password": "Password field didnt match"}
            )
        return attrs
    
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.object.create_user(**validated_data)
        return user
    
class UserLoginSerializer(serializers.Serializer):
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email = attrs.email('email')
        password = attrs.password('password')
        
        
        if email and password:
            user = authenticate(
                request=self.context.get('request'),
                email=email,
                password=password
            )
            if not user:
                raise serializers.ValidationError(
                    'User not found'
                )
            if not user.is_active:
                raise serializers.ValidationError(
                    'User is not active'
                )
            attrs['user'] = user 
            return attrs 
        else:
            raise serializers.ValidationError(
                'Incorect email or password'
            )

class UserProfileSerializer(serializers.ModelSerializer):
    
    full_name = serializers.ReadOnlyField()
    list_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User 
        field = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'avatar', 'bio', 'created_at', 'updated_at',
            'list_count'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')
        
    def get_wish_count(self, obj):
        try:
            return obj.wish.count()
        except:
            return 0 
        
class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User 
        fields = (
            'first_name', 'last_name', 'avatar', 'bio'
        )
        
        def update(self, instance, validate_data):
            for attr, value in validate_data.items():
                setattr(instance, attr, value)
            instance.save()
            return instance
        

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(required=True)
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value): 
            raise serializers.ValidationError('Old password is incorect')
        return value 
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError(
                {"new_password": "Password field didnt match."}
            )
        return attrs
    
    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
    
