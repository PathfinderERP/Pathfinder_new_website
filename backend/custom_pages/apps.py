from django.apps import AppConfig


class CustomPagesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'custom_pages'
    verbose_name = 'Custom Pages Management'

    def ready(self):
        """Import signals when the app is ready"""
        import custom_pages.signals
