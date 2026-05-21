import os
from typing import Optional
import webview
from dotenv import load_dotenv
from backend.core.api import API
from backend.core.llm import LLMClient
from backend.utils.helpers import center_window, get_gui, get_resource

load_dotenv()

webview.settings['DRAG_REGION_DIRECT_TARGET_ONLY'] = True

main_window: Optional[webview.Window] = None

APP_NAME: str = os.getenv("APP_NAME", "ExpensesTracker")
APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")
DEV_MODE: bool = os.getenv("DEV_MODE", "true").lower() == "true"
DEV_URL: str = os.getenv("DEV_URL", "http://localhost:5173")

USE_OLLAMA: bool = os.getenv("USE_OLLAMA", "true").lower() == "true"
OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "phi3")
NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY", "")
NVIDIA_MODEL: str = os.getenv("NVIDIA_MODEL", "qwen/qwen3-coder-480b-a35b-instruct")


def on_loaded() -> None:
    center_window(main_window, 900, 600)
    main_window.show()


def on_closing() -> bool:
    return True


if __name__ == "__main__":
    llm = LLMClient(
        use_ollama=USE_OLLAMA,
        ollama_model=OLLAMA_MODEL,
        nvidia_model=NVIDIA_MODEL,
        nvidia_api_key=NVIDIA_API_KEY,
    )
    api = API(llm_client=llm)

    url = DEV_URL if DEV_MODE else f"file:///{get_resource('interface/index.html').replace(chr(92), '/')}"

    main_window = webview.create_window(
        APP_NAME,
        url=url,
        js_api=api,
        width=900,
        height=600,
        resizable=False,
        frameless=True,
        easy_drag=False,
        hidden=True,
        background_color='#0a0a0a',
    )

    main_window.events.loaded += on_loaded
    main_window.events.closing += on_closing

    webview.start(gui=get_gui(), debug=DEV_MODE)
