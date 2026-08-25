import os


os.environ['DEBUG'] = 'true'
os.environ['SECRET_KEY'] = 'test-only-secret-key-long-enough-for-hs256-tests'
os.environ['ALLOWED_HOSTS'] = 'testserver,localhost'
os.environ['EMAIL_BACKEND'] = 'django.core.mail.backends.locmem.EmailBackend'
os.environ['EMAIL_USE_TLS'] = 'false'
os.environ['EMAIL_USE_SSL'] = 'false'
os.environ['EVENT_REGISTRATION_THROTTLE_RATE'] = '5/hour'
os.environ['LOGIN_THROTTLE_RATE'] = '10/minute'
os.environ['ACCOUNT_REGISTRATION_THROTTLE_RATE'] = '5/hour'

from .settings import *  # noqa: F403


# Keep automated tests isolated from the local MySQL database and its users.
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}
