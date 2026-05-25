from rest_framework import serializers
from django.contrib.auth.models import User
from .models import BlogPost, Comment, Like

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']

class CommentSerializer(serializers.ModelSerializer):
    author_details = UserSerializer(source='author', read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'author_details', 'content', 'parent', 'replies', 'created_at']
        read_only_fields = ['author', 'created_at']

    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True).data
        return []

class BlogPostSerializer(serializers.ModelSerializer):
    author_details = UserSerializer(source='author', read_only=True)
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)
    likes_count = serializers.IntegerField(source='likes.count', read_only=True)
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'author', 'author_details', 
            'content', 'image', 'created_at', 'updated_at', 'is_published',
            'comments_count', 'likes_count', 'is_liked'
        ]
        read_only_fields = ['author', 'slug', 'created_at', 'updated_at']

    def get_is_liked(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated:
            return obj.likes.filter(user=user).exists()
        return False
