Set WshShell = CreateObject("WScript.Shell")
scriptPath = "C:\Users\Thanutheb\Desktop\Final-Project\run_project.ps1"
cmd = "powershell -NoProfile -ExecutionPolicy Bypass -File """ & scriptPath & """"
WshShell.Run cmd, 0, False
