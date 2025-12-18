# -*- coding: utf-8 -*-
"""
Rekonesans strony - poczekaj na Clerk i strona logowania
"""
from playwright.sync_api import sync_playwright
import os
import time
import sys

# Fix encoding issues on Windows
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

SCREENSHOT_DIR = "K:/SSSAAAAAAS dzialajacy/test_screenshots"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

def safe_print(text):
    try:
        print(text.encode('ascii', 'ignore').decode('ascii'))
    except:
        print("[encoding error]")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # Przechwytuj console logi
    console_logs = []
    page.on("console", lambda msg: console_logs.append(f"[{msg.type}]: {msg.text}"))

    # Przejdz do aplikacji
    print("Navigating to http://localhost:3006...")
    page.goto('http://localhost:3006', timeout=60000)

    # Czekaj na zaladowanie Clerk - szukaj elementow logowania lub dashboard
    print("Waiting for Clerk to load...")

    # Czekaj max 30 sekund na znikniecie spinnera lub pojawienie sie tresci
    for i in range(30):
        time.sleep(1)
        # Sprawdz czy jest strona logowania lub dashboard
        url = page.url
        print(f"  [{i+1}s] URL: {url}")

        # Sprawdz czy jest jakas tresc (nie tylko spinner)
        body_text = page.locator('body').text_content() or ''
        if len(body_text.strip()) > 10:
            safe_print(f"  Found content: {body_text[:100]}...")
            break

        # Sprawdz konkretne elementy
        if page.locator('.cl-signIn-root').count() > 0:
            print("  Found Clerk SignIn form!")
            break
        if page.locator('[data-testid="sign-in"]').count() > 0:
            print("  Found sign-in element!")
            break
        if '/auth' in url:
            print("  Redirected to auth page!")
            break
        if '/home' in url:
            print("  Redirected to home page!")
            break

    page.wait_for_load_state('networkidle', timeout=10000)

    # Screenshot
    page.screenshot(path=f'{SCREENSHOT_DIR}/02_after_clerk.png', full_page=True)
    print(f"\nScreenshot saved: {SCREENSHOT_DIR}/02_after_clerk.png")
    print(f"Final URL: {page.url}")

    # Zapisz HTML
    html_content = page.content()
    with open(f'{SCREENSHOT_DIR}/02_after_clerk.html', 'w', encoding='utf-8') as f:
        f.write(html_content)

    # Znajdz elementy
    buttons = page.locator('button').all()
    print(f"\nFound {len(buttons)} buttons:")
    for i, btn in enumerate(buttons[:15]):
        try:
            text = btn.text_content() or btn.get_attribute('aria-label') or 'no-text'
            safe_print(f"  {i+1}. {text[:60]}")
        except:
            pass

    inputs = page.locator('input').all()
    print(f"\nFound {len(inputs)} inputs:")
    for i, inp in enumerate(inputs[:15]):
        try:
            name = inp.get_attribute('name') or inp.get_attribute('placeholder') or inp.get_attribute('id') or 'no-name'
            inp_type = inp.get_attribute('type') or 'text'
            safe_print(f"  {i+1}. [{inp_type}] {name}")
        except:
            pass

    # Pokaz ostatnie logi
    print(f"\nLast console logs:")
    for log in console_logs[-20:]:
        safe_print(f"  {log[:100]}")

    browser.close()
    print("\nReconnaissance complete!")
