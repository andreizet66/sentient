import subprocess
import sys

print("Starting Sentient WebUI ...\n")

try:
    subprocess.check_call([sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8332"])
except KeyboardInterrupt:
    print("\nStopped.")
