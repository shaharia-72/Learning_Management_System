# Generated by Django 5.1.7 on 2025-04-10 10:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0016_alter_variantitem_module'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='variantitem',
            name='module',
        ),
        migrations.AddField(
            model_name='variant',
            name='module',
            field=models.IntegerField(null=True),
        ),
    ]
