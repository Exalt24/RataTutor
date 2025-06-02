from .imports import status, serializers, APIView, Response
from django.shortcuts import get_object_or_404

from api.models import Material, Quiz
from api.serializers import QuizSerializer, QuizQuestionSerializer
from api.services.ai_service import generate_quiz_from_material

class QuizGenerationSerializer(serializers.Serializer):
    """
    Serializer just to validate the incoming 'num_questions' field.
    """
    num_questions = serializers.IntegerField(
        min_value=1,
        max_value=20,
        default=5,
        help_text="How many multiple-choice questions to generate (1–20)."
    )

class QuizGenerationView(APIView):
    """
    POST /api/materials/<material_id>/generate-quiz/
    {
      "num_questions": 5
    }

    1. Validates num_questions via QuizGenerationSerializer.
    2. Runs generate_quiz_from_material().
    3. Creates Quiz + QuizQuestion objects via serializers.
    4. Returns QuizSerializer(data) with nested questions.
    """
    def post(self, request, material_id=None):
        material = get_object_or_404(Material, id=material_id)

        # 1) Validate num_questions (defaults to 5 if not provided)
        serializer_in = QuizGenerationSerializer(data=request.data)
        serializer_in.is_valid(raise_exception=True)
        num_q = serializer_in.validated_data["num_questions"]

        try:
            # 2) Let the AI produce a list of question dicts
            question_dicts = generate_quiz_from_material(material, num_q)
        except Exception as e:
            return Response(
                {"detail": f"Quiz generation failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # 3) Create a new Quiz record
        quiz = Quiz.objects.create(
            material=material,
            title=f"AI‐Generated Quiz ({num_q} questions)"
        )

        # 4) Validate and create each QuizQuestion via serializer
        for qd in question_dicts:
            q_serializer = QuizQuestionSerializer(
                data={
                    "quiz": quiz.id,
                    "question_text": qd["question_text"],
                    "choices": qd["choices"],
                    "correct_answer": qd["correct_answer"],
                },
                context={"request": request}
            )
            q_serializer.is_valid(raise_exception=True)
            q_serializer.save()

        # 5) Serialize the new Quiz (nested questions) and return
        output = QuizSerializer(quiz, context={"request": request})
        return Response(output.data, status=status.HTTP_201_CREATED)
