"""Renueva la sesion de NotebookLM usando el perfil persistente.
Si el perfil sigue con sesion de Google valida, no requiere intervencion.
Si cae en la pantalla de login, espera al archivo-senal para capturar."""
import json, time, tempfile, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

STORAGE_PATH = Path.home() / ".notebooklm" / "storage_state.json"
PROFILE_PATH = Path.home() / ".notebooklm" / "browser_profile"
SIGNAL_FILE = Path(tempfile.gettempdir()) / "nlm_save_signal"

SIGNAL_FILE.unlink(missing_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch_persistent_context(
        user_data_dir=str(PROFILE_PATH),
        headless=False,
        channel="chrome",
        args=["--disable-blink-features=AutomationControlled"],
    )
    page = browser.pages[0] if browser.pages else browser.new_page()
    page.goto("https://notebooklm.google.com/", wait_until="domcontentloaded")
    time.sleep(8)
    url = page.url
    print("URL tras cargar:", url, flush=True)

    if "accounts.google.com" in url or "/login" in url:
        print("NECESITA LOGIN MANUAL. Esperando senal...", flush=True)
        deadline = time.time() + 900
        while not SIGNAL_FILE.exists() and time.time() < deadline:
            time.sleep(1)
            if "accounts.google.com" not in page.url and "/login" not in page.url:
                print("Sesion recuperada sola:", page.url, flush=True)
                break
    else:
        print("SESION VALIDA sin intervencion.", flush=True)

    time.sleep(3)
    storage = browser.storage_state()
    STORAGE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(STORAGE_PATH, "w") as f:
        json.dump(storage, f)
    names = [c["name"] for c in storage.get("cookies", [])]
    print("Cookies guardadas:", len(names), flush=True)
    print("SID presente:", "SID" in names, flush=True)
    browser.close()

SIGNAL_FILE.unlink(missing_ok=True)
print("LISTO", flush=True)
