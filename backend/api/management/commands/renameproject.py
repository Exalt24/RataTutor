import os
import glob
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'Renames the Project'

    def add_arguments(self, parser):
        parser.add_argument('old', nargs='+', type=str, help="current project name")
        parser.add_argument('new', nargs='+', type=str, help="new project name")

    def handle(self, *args, **options):
        old = options["old"][0]
        new = options["new"][0]

        base = str(settings.BASE_DIR)
        projectfiles = []
        managefile = os.path.join(base, "manage.py")
        projectfiles.append(managefile)
        projectfiles += glob.glob(os.path.join(base, old, "*.py"))
        projectfiles += glob.glob(os.path.join(base, old, "**", "*.py"))
        
        self.stdout.write(self.style.SUCCESS(f'Renaming project from {old} to {new}'))
        self.stdout.write(f'Found {len(projectfiles)} files to process')
        
        for pythonfile in projectfiles:
            try:
                # Try UTF-8 encoding first
                with open(pythonfile, 'r', encoding='utf-8') as file:
                    filedata = file.read()
                
                # Only replace text if it's a text file we could read
                if old in filedata:
                    filedata = filedata.replace(old, new)
                    
                    with open(pythonfile, 'w', encoding='utf-8') as file:
                        file.write(filedata)
                    self.stdout.write(f'Updated {pythonfile}')
                    
            except UnicodeDecodeError:
                try:
                    # Try again with latin-1 which can read any byte values
                    with open(pythonfile, 'r', encoding='latin-1') as file:
                        filedata = file.read()
                    
                    if old in filedata:
                        filedata = filedata.replace(old, new)
                        with open(pythonfile, 'w', encoding='latin-1') as file:
                            file.write(filedata)
                        self.stdout.write(f'Updated {pythonfile} (latin-1 encoding)')
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f'Skipping {pythonfile}: {str(e)}'))
                    continue
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Skipping {pythonfile}: {str(e)}'))
                continue
                
        # Rename the directory
        try:
            os.rename(os.path.join(base, old), os.path.join(base, new))
            self.stdout.write(self.style.SUCCESS(f'Renamed directory {old} to {new}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Failed to rename directory: {str(e)}'))
            
        self.stdout.write(self.style.SUCCESS(f'Project renamed from {old} to {new}'))
        self.stdout.write(self.style.WARNING(f'Please update any imports or references manually if needed!'))