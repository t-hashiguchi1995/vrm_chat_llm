from typing import AsyncGenerator, Optional
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
from langchain.memory import ConversationBufferWindowMemory
from ..core.config import get_settings

settings = get_settings()

class LLMService:
    def __init__(self):
        self.llm = ChatOpenAI(
            model_name=settings.LLM_MODEL_NAME,
            temperature=settings.LLM_TEMPERATURE,
            max_tokens=settings.LLM_MAX_TOKENS,
            streaming=True
        )
        self.memory = ConversationBufferWindowMemory(k=5)
        self.system_message = SystemMessage(
            content="あなたはVRMアバターとして、ユーザーと自然な会話を行うAIアシスタントです。"
            "親しみやすく、フレンドリーな口調で会話してください。"
        )

    async def generate_response(
        self,
        user_message: str,
        conversation_id: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        """
        Stream the assistant response token-by-token.
        """
        # 1️⃣ Build the prompt -------------------------------------------------
        messages = [self.system_message, *self.memory.chat_memory.messages]
        human_msg = HumanMessage(content=user_message)
        messages.append(human_msg)
        self.memory.chat_memory.messages.append(human_msg)

        # 2️⃣ Stream from the LLM ---------------------------------------------
        try:
            async for chunk in self.llm.astream(messages):
                choice = chunk.choices[0]
                delta = choice.delta
                if getattr(delta, "content", None):
                    yield delta.content
        except Exception as e:
            yield f"エラーが発生しました: {str(e)}"

    def get_conversation_history(self, conversation_id: Optional[str] = None) -> list:
        """
        会話履歴を取得します。
        """
        return self.memory.chat_memory.messages

    def clear_conversation_history(self, conversation_id: Optional[str] = None):
        """
        会話履歴をクリアします。
        """
        self.memory.clear() 