from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import BlogPost, Comment, Like
from .serializers import BlogPostSerializer, CommentSerializer
from alumni.permissions import IsOwnerOrAdmin

class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    lookup_field = 'slug'
    owner_field = 'author'

    def get_queryset(self):
        if self.request.user.is_staff:
            return BlogPost.objects.all()

        if self.request.user.is_authenticated:
            return BlogPost.objects.filter(
                Q(is_published=True) | Q(author=self.request.user)
            )

        return BlogPost.objects.filter(is_published=True)

    def perform_create(self, serializer):
        if self.request.user.is_staff:
            serializer.save(author=self.request.user)
        else:
            serializer.save(author=self.request.user, is_published=False)

    def perform_update(self, serializer):
        if self.request.user.is_staff:
            serializer.save()
        else:
            serializer.save(is_published=serializer.instance.is_published)

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'comments']:
            permission_classes = [permissions.AllowAny]
        elif self.action == 'create':
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsOwnerOrAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, slug=None):
        post = self.get_object()
        like, created = Like.objects.get_or_create(post=post, user=request.user)
        
        if not created:
            like.delete()
            return Response({'status': 'unliked', 'likes_count': post.likes.count()}, status=status.HTTP_200_OK)
        
        return Response({'status': 'liked', 'likes_count': post.likes.count()}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def comments(self, request, slug=None):
        post = self.get_object()
        comments = post.comments.filter(parent=None)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    owner_field = 'author'

    def get_queryset(self):
        queryset = Comment.objects.all()
        if self.request.user.is_staff:
            return queryset

        if self.request.user.is_authenticated:
            return queryset.filter(
                Q(post__is_published=True) | Q(author=self.request.user)
            )

        return queryset.filter(post__is_published=True)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        elif self.action == 'create':
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [IsOwnerOrAdmin]
        return [permission() for permission in permission_classes]
