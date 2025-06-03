from .imports import status, serializers, APIView, Response
from django.shortcuts import get_object_or_404

from api.models import Material, Quiz
from api.serializers import QuizSerializer, QuizQuestionSerializer
from api.services.ai_service import generate_quiz_from_material

class QuizGenerationSerializer(serializers.Serializer):
    num_questions = serializers.IntegerField(
        min_value=1,
        max_value=20,
        default=5,
        help_text="How many multiple-choice questions to generate (1–20)."
    )

class QuizGenerationView(APIView):
    def post(self, request, material_id=None):
        material = get_object_or_404(Material, id=material_id)

        serializer_in = QuizGenerationSerializer(data=request.data)
        serializer_in.is_valid(raise_exception=True)
        num_q = serializer_in.validated_data["num_questions"]

        try:
            # AI returns dict with 'title', 'description', 'questions' keys
            result = generate_quiz_from_material(material, num_q)
        except Exception as e:
            return Response(
                {"detail": f"Quiz generation failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        quiz = Quiz.objects.create(
            material=material,
            title=result["title"],
            description=result["description"],
            public=False
        )

        for qd in result["questions"]:
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

        output = QuizSerializer(quiz, context={"request": request})
        return Response(output.data, status=status.HTTP_201_CREATED)
