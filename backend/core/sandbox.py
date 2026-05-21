import ast
import io
import threading
from contextlib import redirect_stdout
from backend.utils.helpers import debug_print

_ALLOWED_AST = {
    ast.Module, ast.Constant, ast.List, ast.Dict, ast.Tuple, ast.Set,
    ast.Name, ast.Load, ast.Store, ast.Del,
    ast.Expr, ast.Call, ast.keyword,
    ast.BinOp, ast.UnaryOp, ast.BoolOp, ast.Compare,
    ast.Add, ast.Sub, ast.Mult, ast.Div, ast.FloorDiv, ast.Mod, ast.Pow,
    ast.USub, ast.UAdd,
    ast.Eq, ast.NotEq, ast.Lt, ast.LtE, ast.Gt, ast.GtE,
    ast.In, ast.NotIn, ast.Is, ast.IsNot,
    ast.And, ast.Or, ast.Not,
    ast.Subscript, ast.Slice, ast.Attribute,
    ast.Assign, ast.AugAssign, ast.Delete,
    ast.If, ast.For, ast.While, ast.Break, ast.Continue,
    ast.Pass, ast.Return,
    ast.FunctionDef, ast.Lambda, ast.arguments, ast.arg,
    ast.ListComp, ast.SetComp, ast.DictComp, ast.GeneratorExp,
    ast.comprehension,
    ast.Try, ast.ExceptHandler, ast.Raise, ast.Assert,
    ast.JoinedStr, ast.FormattedValue,
}

_SAFE_BUILTINS = {
    "True": True, "False": False, "None": None,
    "print": print, "sum": sum, "max": max, "min": min,
    "len": len, "sorted": sorted, "round": round,
    "float": float, "int": int, "str": str, "list": list,
    "dict": dict, "tuple": tuple, "set": set, "bool": bool,
    "range": range, "enumerate": enumerate, "zip": zip,
    "map": map, "filter": filter, "any": any, "all": all,
    "isinstance": isinstance, "abs": abs, "pow": pow,
    "reversed": reversed, "slice": slice,
    "Exception": Exception, "ValueError": ValueError,
    "TypeError": TypeError, "KeyError": KeyError,
    "IndexError": IndexError, "ZeroDivisionError": ZeroDivisionError,
}


def execute(code: str, data: dict, timeout: int = 15) -> str:
    debug_print(f"[SANDBOX] code:\n{code}")
    debug_print(f"[SANDBOX] data keys: {list(data.keys())}")
    for k in data:
        debug_print(f"[SANDBOX] data['{k}'] len={len(data[k])}")

    try:
        tree = ast.parse(code, mode="exec")
    except SyntaxError as e:
        debug_print(f"[SANDBOX] SyntaxError: {e}")
        return f"Error: {e}"

    for node in ast.walk(tree):
        if type(node) not in _ALLOWED_AST:
            debug_print(f"[SANDBOX] blocked AST: {type(node).__name__}")
            return f"Error: bloque no permitido ({type(node).__name__})"
        if isinstance(node, ast.Attribute) and node.attr.startswith("__"):
            debug_print(f"[SANDBOX] blocked dunder: {node.attr}")
            return "Error: acceso a atributos privados no permitido"

    output = io.StringIO()
    result = {"error": None}
    restricted = {"__builtins__": _SAFE_BUILTINS, "data": data}

    def target():
        try:
            with redirect_stdout(output):
                exec(compile(tree, "<sandbox>", "exec"), restricted)
        except Exception as e:
            debug_print(f"[SANDBOX] exec error: {e}")
            result["error"] = str(e)

    thread = threading.Thread(target=target, daemon=True)
    thread.start()
    thread.join(timeout)

    if thread.is_alive():
        debug_print(f"[SANDBOX] timeout")
        return "Error: Timeout"

    if result["error"]:
        return f"Error: {result['error']}"

    result_text = output.getvalue().strip()
    debug_print(f"[SANDBOX] output: {result_text}")
    return result_text
