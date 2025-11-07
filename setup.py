import os
import sys
import subprocess

print("\n=== Sentient Setup ===")

# confirm Python version
if sys.version_info < (3, 10):
    print("Python 3.10 or higher is required.")
    sys.exit(1)

# install dependencies
print("Installing dependencies from requirements.txt ...")
subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

print("\nSetup complete! You can now start Sentient with:")
print("   python start.py\n")
