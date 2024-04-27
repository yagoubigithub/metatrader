import psutil

proc = psutil.Process(6176)

if proc.status() == psutil.STATUS_RUNNING:
    # Zombie process!
    print("running")