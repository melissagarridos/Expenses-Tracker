import os
import sys
import platform
import webview
from screeninfo import get_monitors


def get_resource(relative_path: str) -> str:
    base = getattr(sys, '_MEIPASS', os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    return os.path.join(base, relative_path)


def get_gui() -> str:
    system = platform.system()
    if system == "Windows":
        return "edgechromium"
    elif system == "Darwin":
        return "cocoa"
    return "edgechromium"


def center_window(window: webview.Window, width: int, height: int) -> None:
    try:
        monitor = get_monitors()[0]
        x = max(0, (monitor.width - width) // 2)
        y = max(0, (monitor.height - height) // 2)
        window.move(x, y)
    except Exception as e:
        print(f"[CENTER] {e}")
