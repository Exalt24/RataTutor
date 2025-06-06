from .imports import generics, status, Response, IsAuthenticatedOrReadOnly, APIView, serializers
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from ..models import AIConversation, Material, FlashcardSet, Flashcard, Quiz, QuizQuestion, Note
from ..serializers import (
    AIConversationSerializer, 
    FlashcardSetSerializer, 
    FlashcardSerializer,
    QuizSerializer,
    QuizQuestionSerializer,
    NoteSerializer,
    FlashcardGenerationSerializer,
    NoteGenerationSerializer,
    QuizGenerationSerializer,
)
from api.services.ai_service import (
    generate_ai_response_with_context,
    generate_ai_response,
    update_conversation_summary,
    generate_flashcards_from_material,
    generate_notes_from_material,
    generate_quiz_from_material,
)

# ===== CONVERSATION VIEWS =====

class CreateConversationView(generics.CreateAPIView):
    """
    POST /api/conversations/create/
    {
      "material": <id>,
      "last_user_message": "<initial prompt>"
    }
    """
    queryset = AIConversation.objects.all()
    serializer_class = AIConversationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ConversationChatView(generics.GenericAPIView):
    """
    POST /api/conversations/{pk}/chat/
    {
      "prompt": "<user's message to AI>"
    }
    """
    queryset = AIConversation.objects.all()
    serializer_class = AIConversationSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, pk=None):
        conv = get_object_or_404(AIConversation, pk=pk)

        # 🔐 Only allow chat if user owns the conversation
        if conv.user != request.user:
            return Response({"error": "Not your conversation."}, status=status.HTTP_403_FORBIDDEN)

        prompt = request.data.get("prompt", "").strip()
        if not prompt:
            return Response({"error": "Missing prompt"}, status=status.HTTP_400_BAD_REQUEST)

        # 1) Save the user's message
        conv.last_user_message = prompt
        conv.addToMessage()

        # ✅ 2) Smart summary management - update if needed
        summary_updated = update_conversation_summary(conv)
        if summary_updated:
            print(f"📝 Updated conversation summary for conversation {conv.id}")

        # ✅ 3) Get AI reply using smart context management
        try:
            ai_reply = generate_ai_response_with_context(conv, prompt)
        except Exception as e:
            # ✅ Fallback to legacy method if smart context fails
            print(f"⚠️ Smart context failed, falling back to legacy: {e}")
            try:
                material = conv.material
                if material and material.attachments.exists():
                    from api.services.ai_service import generate_ai_response_for_material
                    ai_reply = generate_ai_response_for_material(material, prompt)
                else:
                    ai_reply = generate_ai_response(prompt)
            except Exception as fallback_error:
                return Response(
                    {"error": f"AI service failed: {str(fallback_error)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        # 4) Append AI reply to conversation
        assistant_msg = {
            "role": "assistant",
            "content": ai_reply,
            "timestamp": timezone.now().isoformat()
        }
        msgs = conv.messages if isinstance(conv.messages, list) else []
        msgs.append(assistant_msg)
        conv.messages = msgs
        
        # ✅ Keep legacy context for backward compatibility + track messages
        conv.context += f"\n assistant: {assistant_msg['content']}"
        conv.messages_since_summary += 1
        
        conv.save()

        # ✅ 5) Enhanced response with context info
        response_data = {
            "user_message": prompt,
            "ai_response": ai_reply,
            "messages": conv.messages,
            "conversation_topic": conv.detect_conversation_topic(),
            "messages_since_summary": conv.messages_since_summary,
        }
        
        # Include summary info if available (useful for debugging)
        if conv.summary_context:
            response_data["summary_preview"] = conv.summary_context[:100] + "..." if len(conv.summary_context) > 100 else conv.summary_context

        return Response(response_data, status=status.HTTP_200_OK)


class RetrieveConversationView(generics.RetrieveAPIView):
    """
    GET /api/conversations/{pk}/
    Returns the full AIConversation, including its messages array.
    """
    queryset = AIConversation.objects.all()
    serializer_class = AIConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        if obj.user != self.request.user:
            raise PermissionDenied("You do not have permission to view this conversation.")
        return obj


# ===== GENERATION VIEWS =====

class FlashcardGenerationView(APIView):
    """
    POST /api/materials/{material_id}/generate-flashcards/
    {
      "num_cards": 5,
      "specific_attachments": [1, 2, 3]  // optional - specific attachment IDs
    }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, material_id=None):
        # Get material and check ownership
        material = get_object_or_404(Material, id=material_id)
        if material.owner != request.user:
            return Response(
                {"error": "You don't have permission to generate flashcards for this material."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Validate input
        serializer_in = FlashcardGenerationSerializer(data=request.data)
        serializer_in.is_valid(raise_exception=True)
        num_cards = serializer_in.validated_data["num_cards"]
        
        # ✅ Get specific attachments if provided
        specific_attachments = request.data.get('specific_attachments', None)
        if specific_attachments:
            print(f"🎯 Generating flashcards from {len(specific_attachments)} specific attachments")
        else:
            print(f"📁 Generating flashcards from all attachments in material")

        try:
            # ✅ Generate flashcards from AI
            result = generate_flashcards_from_material(material, num_cards, specific_attachments)
        except Exception as e:
            return Response(
                {"detail": f"Flashcard generation failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # ✅ FIX: Use serializer to handle unique titles properly
        try:
            # ✅ Validate and improve title if needed
            title = result["title"].strip()
            if not title or title.lower() in ['flashcards', 'cards', 'study cards']:
                title = f"{material.title} - Flashcards"
            
            flashcard_data = {
                "material": material.id,
                "title": title,
                "description": result["description"],
                "public": False,
                "flashcards": result["flashcards"]  # Use the nested flashcards
            }
            
            serializer = FlashcardSetSerializer(
                data=flashcard_data,
                context={"request": request}
            )
            serializer.is_valid(raise_exception=True)
            flashcard_set = serializer.save()

            return Response(
                FlashcardSetSerializer(flashcard_set, context={"request": request}).data, 
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            # ✅ Better error handling for unique constraint violations
            if "unique" in str(e).lower():
                return Response(
                    {"detail": "A flashcard set with a similar title already exists. The system automatically created a unique title."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(
                {"detail": f"Failed to save flashcards: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class NoteGenerationView(APIView):
    """
    POST /api/materials/{material_id}/generate-notes/
    {
      "specific_attachments": [1, 2, 3]  // optional - specific attachment IDs
    }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, material_id=None):
        # Get material and check ownership
        material = get_object_or_404(Material, id=material_id)
        if material.owner != request.user:
            return Response(
                {"error": "You don't have permission to generate notes for this material."},
                status=status.HTTP_403_FORBIDDEN
            )

        # ✅ Get specific attachments if provided
        specific_attachments = request.data.get('specific_attachments', None)
        if specific_attachments:
            print(f"🎯 Generating comprehensive note from {len(specific_attachments)} specific attachments")
        else:
            print(f"📁 Generating comprehensive note from all attachments in material")

        try:
            # ✅ Generate notes from AI
            result = generate_notes_from_material(material, specific_attachments)
        except Exception as e:
            return Response(
                {"detail": f"Note generation failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # ✅ Use serializer (already was doing this correctly)
        try:
            # ✅ Validate and improve title if needed
            title = result.get('title', '').strip()
            if not title or title.lower() in ['notes', 'study notes', 'study guide', 'summary']:
                title = f"{material.title} - Study Notes"
            
            note_data = {
                "material": material.id,
                "title": title,
                "description": result.get("description", ""),
                "content": result.get("content", ""),
                "public": False
            }
            
            serializer = NoteSerializer(
                data=note_data,
                context={"request": request}
            )
            serializer.is_valid(raise_exception=True)
            note_obj = serializer.save()
            
            # Return single note object (not an array)
            return Response(NoteSerializer(note_obj, context={"request": request}).data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            # ✅ Better error handling for unique constraint violations
            if "unique" in str(e).lower():
                return Response(
                    {"detail": "A note with a similar title already exists. The system automatically created a unique title."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(
                {"detail": f"Failed to save note: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class QuizGenerationView(APIView):
    """
    POST /api/materials/{material_id}/generate-quiz/
    {
      "num_questions": 5,
      "specific_attachments": [1, 2, 3]  // optional - specific attachment IDs
    }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, material_id=None):
        # Get material and check ownership
        material = get_object_or_404(Material, id=material_id)
        if material.owner != request.user:
            return Response(
                {"error": "You don't have permission to generate a quiz for this material."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Validate input
        serializer_in = QuizGenerationSerializer(data=request.data)
        serializer_in.is_valid(raise_exception=True)
        num_q = serializer_in.validated_data["num_questions"]
        
        # ✅ Get specific attachments if provided
        specific_attachments = request.data.get('specific_attachments', None)
        if specific_attachments:
            print(f"🎯 Generating quiz from {len(specific_attachments)} specific attachments")
        else:
            print(f"📁 Generating quiz from all attachments in material")

        try:
            # ✅ Generate quiz from AI
            result = generate_quiz_from_material(material, num_q, specific_attachments)
        except Exception as e:
            return Response(
                {"detail": f"Quiz generation failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # ✅ FIX: Use serializer to handle unique titles properly
        try:
            # ✅ Validate and improve title if needed
            title = result["title"].strip()
            if not title or title.lower() in ['quiz', 'test', 'exam', 'questions']:
                title = f"{material.title} - Quiz"
            
            quiz_data = {
                "material": material.id,
                "title": title,
                "description": result["description"],
                "public": False,
                "questions": result["questions"]  # Use nested questions
            }
            
            serializer = QuizSerializer(
                data=quiz_data,
                context={"request": request}
            )
            serializer.is_valid(raise_exception=True)
            quiz = serializer.save()

            return Response(
                QuizSerializer(quiz, context={"request": request}).data,
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            # ✅ Better error handling for unique constraint violations
            if "unique" in str(e).lower():
                return Response(
                    {"detail": "A quiz with a similar title already exists. The system automatically created a unique title."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(
                {"detail": f"Failed to save quiz: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ===== CONVERSATION MANAGEMENT VIEWS =====

class ConversationListView(generics.ListAPIView):
    """
    GET /api/conversations/
    List all conversations for the authenticated user (one per material)
    """
    serializer_class = AIConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AIConversation.objects.filter(user=self.request.user).select_related('material').order_by('-updated_at')


class GetOrCreateConversationView(generics.GenericAPIView):
    """
    GET /api/materials/{material_id}/conversation/
    Get the conversation for a material (create if doesn't exist)
    """
    serializer_class = AIConversationSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, material_id=None):
        # Check if material exists and user owns it
        material = get_object_or_404(Material, id=material_id)
        if material.owner != request.user:
            return Response(
                {"error": "You don't have permission to access this material's conversation."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            # Try to get existing conversation first
            conversation = AIConversation.objects.get(
                user=request.user,
                material=material
            )
            created = False
            
        except AIConversation.DoesNotExist:
            # Create new conversation if it doesn't exist
            try:
                conversation = AIConversation.objects.create(
                    user=request.user,
                    material=material,
                    messages=[],  # This should work better with explicit creation
                    context='',
                    summary_context='',
                    messages_since_summary=0
                )
                created = True
                
            except Exception as create_error:
                print(f"❌ Error creating conversation: {create_error}")
                
                # Try alternative approach - maybe the messages field is the issue
                try:
                    conversation = AIConversation(
                        user=request.user,
                        material=material,
                        context='',
                        summary_context='',
                        messages_since_summary=0
                    )
                    # Don't set messages field, let it use the model default
                    conversation.save()
                    created = True
                    
                except Exception as fallback_error:
                    print(f"❌ Fallback creation also failed: {fallback_error}")
                    return Response(
                        {
                            "error": "Failed to create conversation", 
                            "details": str(fallback_error)
                        },
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

        except Exception as get_error:
            print(f"❌ Error getting conversation: {get_error}")
            return Response(
                {"error": "Database error", "details": str(get_error)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        serializer = self.get_serializer(conversation)
        response_data = serializer.data
        response_data['is_new'] = created

        return Response(response_data, status=status.HTTP_200_OK)


class ConversationDeleteView(generics.DestroyAPIView):
    """
    DELETE /api/conversations/{pk}/
    Delete a conversation (only if user owns it)
    """
    queryset = AIConversation.objects.all()
    permission_classes = [IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        if obj.user != self.request.user:
            raise PermissionDenied("You do not have permission to delete this conversation.")
        return obj


class ConversationSummaryView(generics.GenericAPIView):
    """
    POST /api/conversations/{pk}/regenerate-summary/
    Manually regenerate the conversation summary
    """
    queryset = AIConversation.objects.all()
    permission_classes = [IsAuthenticated]

    def post(self, request, pk=None):
        conv = get_object_or_404(AIConversation, pk=pk)
        
        if conv.user != request.user:
            return Response({"error": "Not your conversation."}, status=status.HTTP_403_FORBIDDEN)

        try:
            # Force regenerate summary
            summary_updated = update_conversation_summary(conv)
            if summary_updated:
                conv.save()
                return Response({
                    "message": "Summary regenerated successfully",
                    "summary": conv.summary_context,
                    "topic": conv.detect_conversation_topic(),
                    "messages_since_summary": conv.messages_since_summary
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "message": "No summary update needed",
                    "summary": conv.summary_context,
                    "topic": conv.detect_conversation_topic(),
                    "messages_since_summary": conv.messages_since_summary
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            return Response(
                {"error": f"Failed to regenerate summary: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )