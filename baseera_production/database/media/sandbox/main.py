from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess
import tempfile
import os
import json

app = FastAPI(title="Baseera Python Sandbox")


class CodeExecutionRequest(BaseModel):
    code: str
    timeout_seconds: int = 10


@app.post("/run")
async def run_code(request: CodeExecutionRequest):
    """
    Executes raw python code in a completely isolated environment and returns the output.
    """
    # Create a temporary file to hold the user's code
    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".py", delete=False
    ) as temp_script:
        temp_script.write(request.code)
        temp_script_path = temp_script.name

    try:
        # Execute the python script using a subprocess
        result = subprocess.run(
            ["python", temp_script_path],
            capture_output=True,
            text=True,
            timeout=request.timeout_seconds,
        )

        output = result.stdout
        error = result.stderr

        # We expect the AI generated code to print valid JSON.
        # If it's valid JSON, we parse it and return it nicely. Otherwise, we return the raw string.
        try:
            parsed_output = json.loads(output) if output else None
        except json.JSONDecodeError:
            parsed_output = output

        return {
            "success": result.returncode == 0,
            "output": parsed_output,
            "error": error if error else None,
        }

    except subprocess.TimeoutExpired:
        raise HTTPException(
            status_code=408,
            detail=f"Execution timed out after {request.timeout_seconds} seconds.",
        )
    finally:
        # Clean up the temporary script
        if os.path.exists(temp_script_path):
            os.remove(temp_script_path)


@app.get("/health")
async def health_check():
    return {"status": "Sandbox is ready"}
