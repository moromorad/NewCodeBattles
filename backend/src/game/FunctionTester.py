import multiprocessing
import traceback

def _worker(user_code, func_name, test_cases, return_dict):
    """
    Worker process that executes the user code.
    """
    try:
        # Preamble setup
        namespace = {}
        safe_globals = {
            "__builtins__": {
                "range": range, "len": len, "print": print, "min": min, "max": max,
                "sum": sum, "abs": abs, "all": all, "any": any, "enumerate": enumerate,
                "zip": zip, "sorted": sorted, "list": list, "tuple": tuple,
                "set": set, "dict": dict, "str": str, "ord": ord, "chr": chr,
                "int": int, "float": float, "bool": bool
            }
        }
        
        exec(user_code, safe_globals, namespace)
        
        if func_name not in namespace:
            return_dict["error"] = f"Function '{func_name}' not found."
            return

        func = namespace[func_name]
        results = []

        for idx, (inputs, expected) in enumerate(test_cases, start=1):
            try:
                # inputs is a tuple, so we unpack it
                output = func(*inputs)
                passed = output == expected
                results.append({
                    "test": idx,
                    "input": str(inputs),
                    "expected": str(expected),
                    "output": str(output),
                    "passed": passed
                })
            except Exception as e:
                results.append({
                    "test": idx, 
                    "input": str(inputs), 
                    "expected": str(expected), 
                    "output": None, 
                    "passed": False, 
                    "error": str(e)
                })
        
        return_dict["results"] = results

    except Exception as e:
        return_dict["error"] = f"Execution error: {str(e)}"

def run_user_function(user_code: str, func_name: str, test_cases: list, timeout_seconds=2):
    """
    Runs the user function with a timeout using multiprocessing.
    Safe for Windows.
    """
    manager = multiprocessing.Manager()
    return_dict = manager.dict()
    
    p = multiprocessing.Process(target=_worker, args=(user_code, func_name, test_cases, return_dict))
    p.start()
    p.join(timeout_seconds)

    if p.is_alive():
        p.terminate()
        p.join()
        return [{"error": "Timeout: Execution took too long.", "passed": False}]

    if "error" in return_dict:
        return [{"error": return_dict["error"], "passed": False}]
    
    return return_dict.get("results", [])

if __name__ == "__main__":
    # Test on Windows
    code = """
def add(a, b):
    return a + b
"""
    tests = [((1, 2), 3), ((5, 5), 10)]
    print(run_user_function(code, "add", tests))

    # Test infinite loop
    loop_code = """
def loop(a):
    while True:
        pass
"""
    print(run_user_function(loop_code, "loop", [((1,), 1)]))
