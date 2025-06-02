from .imports import status, APIView, Response
from django.shortcuts import get_object_or_404

from api.models import (
    Material,
    Attachment,
    Note,
    Flashcard,
    Quiz,
    QuizQuestion,
)
from api.serializers import MaterialSerializer


class CopyMaterialView(APIView):
    """
    POST /api/materials/<int:material_id>/copy/
    - Only public Materials can be copied.
    - Creates a brand‐new Material owned by request.user, 
      then duplicates attachments, notes, flashcards, quizzes, and quiz questions.
    """
    def post(self, request, material_id=None):
        # 1) Lookup the source material
        source = get_object_or_404(Material, id=material_id)

        # 2) Ensure it's public
        if not getattr(source, "public", False):
            return Response(
                {"detail": "Cannot copy a non‐public Material."},
                status=status.HTTP_403_FORBIDDEN
            )

        # 3) Create a new Material instance (owned by current user)
        #    We copy title, description, status but force pinned=False, public=False.
        new_material = Material.objects.create(
            owner=request.user,
            title=source.title,
            description=source.description,
            status=source.status,
            pinned=False,
            public=False
        )

        # 4) Duplicate attachments (physically copy each file)
        for attachment in source.attachments.all():
            # Open original file
            orig_file = attachment.file
            orig_file.open("rb")
            # Save to new Attachment under new_material
            new_attach = Attachment(material=new_material)
            new_attach.file.save(
                orig_file.name.split("/")[-1],  # keep same filename
                orig_file.file,                 # file‐like object
                save=True
            )
            orig_file.close()

        # 5) Duplicate notes
        for note in source.notes.all():
            Note.objects.create(
                material=new_material,
                content=note.content
            )

        # 6) Duplicate flashcards
        for fc in source.flashcards.all():
            Flashcard.objects.create(
                material=new_material,
                question=fc.question,
                answer=fc.answer
            )

        # 7) Duplicate quizzes and their questions
        for quiz in source.quizzes.all():
            new_quiz = Quiz.objects.create(
                material=new_material,
                title=quiz.title
            )
            for q in quiz.questions.all():
                QuizQuestion.objects.create(
                    quiz=new_quiz,
                    question_text=q.question_text,
                    choices=q.choices,
                    correct_answer=q.correct_answer
                )

        # 8) Serialize and return the newly created Material
        serializer = MaterialSerializer(new_material, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
