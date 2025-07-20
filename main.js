let pyodideReady = false;
let pyodide = null;
async function loadPyodideAndPackages() {
  pyodide = await loadPyodide(); 
  await pyodide.loadPackage("micropip");
  await pyodide.runPythonAsync(`
def interpret_minilang(code):
    stack = []
    output = []
    tokens = code.strip().split()
    if not tokens:
        return "Error: Code is empty. Please write something."
    try:
        for token in tokens:
            if token.isdigit():
                stack.append(int(token))
            elif token == '+':
                if len(stack) < 2:
                    return "Error: '+' requires 2 numbers. Try '5 3 + print'"
                b = stack.pop()
                a = stack.pop()
                stack.append(a + b)
            elif token == '-':
                if len(stack) < 2:
                    return "Error: '-' requires 2 numbers. Try '8 2 - print'"
                b = stack.pop()
                a = stack.pop()
                stack.append(a - b)
            elif token == '*':
                if len(stack) < 2:
                    return "Error: '*' requires 2 numbers. Try '4 5 * print'"
                b = stack.pop()
                a = stack.pop()
                stack.append(a * b)
            elif token == '/':
                if len(stack) < 2:
                    return "Error: '/' requires 2 numbers. Try '10 2 / print'"
                b = stack.pop()
                a = stack.pop()
                if b == 0:
                    return "Error: Division by zero is not allowed."
                stack.append(a // b)
            elif token == 'print':
                if not stack:
                    return "Error: Nothing to print. Try pushing numbers first."
                output.append(str(stack[-1]))
            else:
                return f"Error: Unknown token '{token}'. Valid commands: + - * / print"
        return "\\n".join(output) if output else "Code ran, but nothing was printed. Use 'print'."
    except Exception as e:
        return "Error: " + str(e)
  `);
  pyodideReady = true;
}
loadPyodideAndPackages();
document.getElementById("runBtn").addEventListener("click", async () => {
  if (!pyodideReady) {
    document.getElementById("output").textContent = "Loading Python environment...";
    return;
  }
  const code = document.getElementById("codeInput").value;
  try {
    await pyodide.globals.set("code", code);
    await pyodide.runPythonAsync("result = interpret_minilang(code)");
    const output = pyodide.globals.get("result");
    document.getElementById("output").textContent = output;
  } catch (err) {
    document.getElementById("output").textContent =
      "Unexpected Error: " + err.message;
  }
});