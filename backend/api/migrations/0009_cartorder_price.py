# Generated by Django 5.1.7 on 2025-04-05 06:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_alter_cart_cart_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='cartorder',
            name='price',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=12),
        ),
    ]
