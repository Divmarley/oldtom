from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from .models import BlogPost


class BlogOwnershipTests(APITestCase):
    def setUp(self):
        self.author = User.objects.create_user(
            username='author', password='author-password'
        )
        self.other_user = User.objects.create_user(
            username='other-author', password='other-password'
        )
        self.admin = User.objects.create_user(
            username='editor', password='editor-password', is_staff=True
        )
        self.post = BlogPost.objects.create(
            title='Members Only Draft',
            slug='members-only-draft',
            content='Draft content',
            author=self.author,
            is_published=True,
        )

    def test_author_controls_own_post_but_not_another_users_post(self):
        self.client.force_authenticate(self.other_user)
        response = self.client.patch(
            f'/api/blog/posts/{self.post.slug}/',
            {'title': 'Unauthorized Edit'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.author)
        response = self.client.patch(
            f'/api/blog/posts/{self.post.slug}/',
            {'title': 'Author Edit'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.client.force_authenticate(self.admin)
        response = self.client.patch(
            f'/api/blog/posts/{self.post.slug}/',
            {'title': 'Admin Edit'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_regular_author_posts_are_created_as_drafts(self):
        self.client.force_authenticate(self.author)
        response = self.client.post(
            '/api/blog/posts/',
            {
                'title': 'New Member Post',
                'content': 'Content written by a member',
                'is_published': True,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertFalse(response.data['is_published'])
