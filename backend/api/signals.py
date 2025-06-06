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
                file_name = instance.file.name
                
                # Handle the public_id construction more robustly
                if file_name.startswith('attachments/'):
                    public_id = file_name[12:]  # Remove 'attachments/' prefix
                else:
                    public_id = file_name
                
                # Remove file extension for Cloudinary
                if '.' in public_id:
                    public_id = public_id.rsplit('.', 1)[0]
                
                # Try different resource types if auto doesn't work
                result = cloudinary.uploader.destroy(public_id, resource_type="auto")
                
                if result.get('result') == 'ok':
                    logger.info(f"Successfully deleted file from Cloudinary: {public_id}")
                elif result.get('result') == 'not found':
                    logger.info(f"File not found in Cloudinary (may have been deleted already): {public_id}")
                else:
                    logger.warning(f"Cloudinary deletion result for {public_id}: {result}")
                    
            else:
                # Local file deletion logic
                if hasattr(instance.file, 'path') and instance.file.path and os.path.isfile(instance.file.path):
                    os.remove(instance.file.path)
                    logger.info(f"Successfully deleted local file: {instance.file.path}")
                else:
                    logger.info(f"Local file not found or no path available: {instance.file.name}")
                
        except Exception as e:
            logger.error(f"Error deleting file for attachment {instance.id}: {e}")
            # Don't raise the exception - allow model deletion to continue