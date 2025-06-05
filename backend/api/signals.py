from django.db.models.signals import pre_delete
from django.dispatch import receiver
from django.conf import settings
from .models import Attachment
import cloudinary.uploader
import logging
import os

logger = logging.getLogger(__name__)

@receiver(pre_delete, sender=Attachment)
def delete_attachment_file(sender, instance, **kwargs):
    """
    Delete the file when an Attachment instance is deleted.
    Handles both local storage (dev) and Cloudinary (prod).
    """
    if instance.file:
        try:
            # Check if we're using Cloudinary storage
            is_using_cloudinary = 'cloudinary_storage' in settings.DEFAULT_FILE_STORAGE
            
            if is_using_cloudinary:
                # Cloudinary deletion logic
                public_id = instance.file.name
                
                if public_id.startswith('attachments/'):
                    public_id = public_id[12:]  # Remove 'attachments/' prefix
                if '.' in public_id:
                    public_id = public_id.rsplit('.', 1)[0]  # Remove file extension
                
                result = cloudinary.uploader.destroy(public_id, resource_type="auto")
                
                if result.get('result') == 'ok':
                    logger.info(f"Successfully deleted file from Cloudinary: {public_id}")
                else:
                    logger.warning(f"Cloudinary deletion result: {result}")
            else:
                # Local file deletion logic
                if instance.file.path and os.path.isfile(instance.file.path):
                    os.remove(instance.file.path)
                    logger.info(f"Successfully deleted local file: {instance.file.path}")
                
        except Exception as e:
            logger.error(f"Error deleting file: {e}")
            # Don't raise the exception - allow model deletion to continue