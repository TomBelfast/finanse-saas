"""
Rekonesans strony - screenshot i sprawdzenie DOM
"""
from playwright.sync_api import sync_playwright
import os

SCREENSHOT_DIR = "K:/SSSAAAAAAS dzialajacy/test_screenshots"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # Przechwytuj console logi
    page.on("console", lambda msg: print(f"[CONSOLE {msg.type}]: {msg.text}"))

    # Przejdź do aplikacji
    print("Navigating to http://localhost:3006...")
    page.goto('http://localhost:3006', timeout=30000)
    page.wait_for_load_state('networkidle', timeout=30000)

    # Screenshot strony głównej
    page.screenshot(path=f'{SCREENSHOT_DIR}/01_initial.png', full_page=True)
    print(f"Screenshot saved: {SCREENSHOT_DIR}/01_initial.png")

    # Sprawdź aktualny URL
    print(f"Current URL: {page.url}")

    # Wypisz strukturę DOM
    html_content = page.content()
    with open(f'{SCREENSHOT_DIR}/01_initial.html', 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f"HTML saved: {SCREENSHOT_DIR}/01_initial.html")

    # Znajdź wszystkie przyciski i linki
    buttons = page.locator('button').all()
    print(f"\nFound {len(buttons)} buttons:")
    for i, btn in enumerate(buttons[:10]):
        try:
            text = btn.text_content() or btn.get_attribute('aria-label') or 'no-text'
            print(f"  {i+1}. {text[:50]}")
        except:
            pass

    links = page.locator('a').all()
    print(f"\nFound {len(links)} links:")
    for i, link in enumerate(links[:10]):
        try:
            href = link.get_attribute('href') or 'no-href'
            text = link.text_content() or 'no-text'
            print(f"  {i+1}. {text[:30]} -> {href[:50]}")
        except:
            pass

    # Sprawdź formularze
    inputs = page.locator('input').all()
    print(f"\nFound {len(inputs)} inputs:")
    for i, inp in enumerate(inputs[:10]):
        try:
            name = inp.get_attribute('name') or inp.get_attribute('placeholder') or 'no-name'
            inp_type = inp.get_attribute('type') or 'text'
            print(f"  {i+1}. [{inp_type}] {name}")
        except:
            pass

    browser.close()
    print("\nReconnaissance complete!")
