"""Ollama AI interaction wrapper for GhostShell."""

import os
from typing import Generator, Optional, List, Dict
import ollama
from ghostshell.personas.ghost import (
    GHOST_SYSTEM_PROMPT,
    PROMPT_EXPLAIN_COMMAND,
    PROMPT_POSSESSION_ALERT,
    PROMPT_HAUNTED_LOGS,
    PROMPT_ASK_GHOST,
)

DEFAULT_MODEL = os.getenv("GHOSTSHELL_MODEL", "gemma2:2b")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")

class GhostAI:
    """Manages prompt engineering and inference with local Ollama models."""

    def __init__(self, model_name: str = DEFAULT_MODEL):
        self.model_name = model_name
        self.client = ollama.Client(host=OLLAMA_HOST)

    def is_available(self) -> bool:
        """Checks if local Ollama daemon is reachable and responding."""
        try:
            self.client.list()
            return True
        except Exception:
            return False

    def get_models(self) -> List[str]:
        """Lists available local models in Ollama."""
        try:
            resp = self.client.list()
            return [m.get("model", m.get("name", "")) for m in resp.get("models", [])]
        except Exception:
            return []

    def stream_chat(self, messages: List[Dict[str, str]]) -> Generator[str, None, None]:
        """Streams response tokens from local Ollama model."""
        try:
            stream = self.client.chat(
                model=self.model_name,
                messages=messages,
                stream=True,
            )
            for chunk in stream:
                content = chunk.get("message", {}).get("content", "")
                if content:
                    yield content
        except Exception as e:
            yield f"\n[The spectral connection faltered: {e}. Ensure `ollama serve` is running in your crypt.]\n"

    def chat_complete(self, messages: List[Dict[str, str]]) -> str:
        """Runs a complete chat completion."""
        try:
            response = self.client.chat(
                model=self.model_name,
                messages=messages,
                stream=False,
            )
            return response.get("message", {}).get("content", "")
        except Exception as e:
            return (
                f"*The phantom cannot speak through the mist:* {e}.\n\n"
                f"Make sure Ollama is active on `{OLLAMA_HOST}` with model `{self.model_name}`."
            )

    def explain_command(self, command: str) -> str:
        """Generates a spooky explanation of a command."""
        user_prompt = PROMPT_EXPLAIN_COMMAND.format(command=command)
        messages = [
            {"role": "system", "content": GHOST_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]
        return self.chat_complete(messages)

    def explain_possession(self, command: str, hazards: List[str]) -> str:
        """Generates a spectral warning for a dangerous command."""
        hazards_text = "\n".join([f"- {h}" for h in hazards]) if hazards else "- Potentially unstable system invocation"
        user_prompt = PROMPT_POSSESSION_ALERT.format(
            command=command,
            hazards_text=hazards_text,
        )
        messages = [
            {"role": "system", "content": GHOST_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]
        return self.chat_complete(messages)

    def narrate_logs(self, sanitized_logs: str) -> str:
        """Turns sanitized logs into a gothic haunting chronicle."""
        user_prompt = PROMPT_HAUNTED_LOGS.format(sanitized_logs=sanitized_logs)
        messages = [
            {"role": "system", "content": GHOST_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]
        return self.chat_complete(messages)

    def ask_ghost(self, question: str, log_context: Optional[str] = None) -> str:
        """Answers user's question about system or logs."""
        context_block = f"Additional spectral context:\n```\n{log_context}\n```" if log_context else ""
        user_prompt = PROMPT_ASK_GHOST.format(
            question=question,
            context_block=context_block,
        )
        messages = [
            {"role": "system", "content": GHOST_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]
        return self.chat_complete(messages)
