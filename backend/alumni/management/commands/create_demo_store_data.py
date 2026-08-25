from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Create demo store data: a T-shirt product and shipping options'

    def handle(self, *args, **options):
        from alumni.models import Product, ShippingOption

        created = []

        # Create demo product
        tshirt, t_created = Product.objects.get_or_create(
            slug='old-toms-tshirt',
            defaults={
                'title': 'Old Toms Class of 2016 T-Shirt',
                'description': 'Official Old Toms 2016 T-shirt. 100% cotton. Available in multiple sizes.',
                'price': '60.00',
                'stock': 100,
            }
        )
        if t_created:
            created.append(f'Product: {tshirt.title}')

        # Shipping options
        pickup, p_created = ShippingOption.objects.get_or_create(
            name='Pickup - Main Campus',
            defaults={'price': '0.00', 'is_pickup': True},
        )
        if p_created:
            created.append('ShippingOption: Pickup - Main Campus')

        delivery, d_created = ShippingOption.objects.get_or_create(
            name='Standard Delivery',
            defaults={'price': '15.00', 'is_pickup': False},
        )
        if d_created:
            created.append('ShippingOption: Standard Delivery')

        if created:
            self.stdout.write(self.style.SUCCESS('Created demo store data:'))
            for c in created:
                self.stdout.write(self.style.SUCCESS(f' - {c}'))
        else:
            self.stdout.write('Demo store data already exists.')
