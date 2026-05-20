import os
import sys
import json
import platform
import threading
from typing import Optional
import webview
from screeninfo import get_monitors
from core.api import API

webview.settings['DRAG_REGION_DIRECT_TARGET_ONLY'] = True

main_window: Optional[webview.Window] = None
api: Optional[API] = None

APP_NAME: str = "ExpensesTracker"
APP_VERSION: str = "1.0.0"
DEV_MODE: bool = True
DEV_URL: str = "http://localhost:5173"


def get_resource_path(relative_path: str) -> str:
    base: str = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base, relative_path)


def get_gui_backend() -> str:
    system: str = platform.system()
    if system == "Windows":
        return "edgechromium"
    elif system == "Darwin":
        return "cocoa"
    return "edgechromium"


def center_window(window: webview.Window, width: int, height: int) -> None:
    try:
        monitor = get_monitors()[0]
        x: int = max(0, (monitor.width - width) // 2)
        y: int = max(0, (monitor.height - height) // 2)
        window.move(x, y)
    except Exception as e:
        print(f"[CENTER] {e}")


def on_loaded() -> None:
    center_window(main_window, 900, 600)
    main_window.show()


def on_closing() -> bool:
    return True


if __name__ == "__main__":
    api = API()

    url: str = DEV_URL if DEV_MODE else f"file:///{get_resource_path('interface/index.html').replace(chr(92), '/')}"

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

    webview.start(gui=get_gui_backend(), debug=DEV_MODE)