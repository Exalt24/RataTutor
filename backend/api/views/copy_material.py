from .imports import status, APIView, Response
from django.shortcuts import get_object_or_404

from api.models import (
    Material,
    Attachment,
    Note,
    FlashcardSet,
    Flashcard,
    Quiz,
    QuizQuestion,
)

from api.serializers import MaterialSerializer


def get_unique_title(owner, base_title):
    existing_titles = set(
        Material.objects.filter(owner=owner)
        .values_list('title', flat=True)
    )
    if base_title not in existing_titles:
        return base_title

    counter = 1
    new_title = f"{base_title} (Copy)"
    while new_title in existing_titles:
        new_title = f"{base_title} (Copy {counter})"
        counter += 1
    return new_title


class CopyMaterialView(APIView):
    """
    POST /api/materials/<int:material_id>/copy/
    - Only public Materials can be copied.
    - Creates a brand-new Material owned by request.user,
      then duplicates attachments, notes, flashcard sets (and cards),
      quizzes, and quiz questions.
    """
    def post(self, request, material_id=None):
        # 1) Lookup the source material
        source = get_object_or_404(Material, id=material_id)

        # 2) Ensure it's public
        if not getattr(source, "public", False):
            return Response(
                {"detail": "Cannot copy a non-public Material."},
                status=status.HTTP_403_FORBIDDEN
            )

        # 3) Generate unique title for new Material to avoid duplicates
        unique_title = get_unique_title(request.user, source.title)

        # 4) Create a new Material instance (owned by current user)
        #    Copy title, description, status but force pinned=False, public=False.
        new_material = Material.objects.create(
            owner=request.user,
            title=unique_title,
            description=source.description,
            status=source.status,
            pinned=False,
            public=False
        )

        # 5) Duplicate attachments (physically copy each file)
        for attachment in source.attachments.all():
            orig_file = attachment.file
            orig_file.open("rb")
            new_attach = Attachment(material=new_material)
            new_attach.file.save(
                orig_file.name.split("/")[-1],  # keep same filename
                orig_file.file,                 # file-like object
                save=True
            )
            orig_file.close()

        # 6) Duplicate notes (including title and description)
        for note in source.notes.all():
            Note.objects.create(
                material=new_material,
                title=note.title,
                description=note.description,
                content=note.content
            )

        # 7) Duplicate flashcard sets and their nested flashcards
        for flashcard_set in source.flashcard_sets.all():
            new_set = FlashcardSet.objects.create(
                material=new_material,
                title=flashcard_set.title,
                description=flashcard_set.description
            )
            for card in flashcard_set.cards.all():
                Flashcard.objects.create(
                    flashcard_set=new_set,
                    question=card.question,
                    answer=card.answer
                )

        # 8) Duplicate quizzes and their questions
        for quiz in source.quizzes.all():
            new_quiz = Quiz.objects.create(
                material=new_material,
                title=quiz.title,
                description=quiz.description
            )
            for q in quiz.questions.all():
                QuizQuestion.objects.create(
                    quiz=new_quiz,
                    question_text=q.question_text,
                    choices=q.choices,
                    correct_answer=q.correct_answer
                )

        # 9) Serialize and return the newly created Material
        serializer = MaterialSerializer(new_material, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
