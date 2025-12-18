# -*- coding: utf-8 -*-
"""
Test logowania przez Clerk i CRUD operacji
"""
from playwright.sync_api import sync_playwright
import os
import time
import json
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

SCREENSHOT_DIR = "K:/SSSAAAAAAS dzialajacy/test_screenshots"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

def safe_print(text):
    try:
        print(str(text).encode('ascii', 'ignore').decode('ascii'))
    except:
        print("[encoding error]")

with sync_playwright() as p:
    # Uruchom browser bez headless zeby widziec co sie dzieje
    browser = p.chromium.launch(headless=False, slow_mo=500)
    context = browser.new_context()
    page = context.new_page()

    # Przechwytuj requesty API
    api_requests = []
    def handle_request(request):
        if '/api/' in request.url:
            api_requests.append({
                'url': request.url,
                'method': request.method,
                'headers': dict(request.headers)
            })
    page.on('request', handle_request)

    # Przechwytuj responses
    api_responses = []
    def handle_response(response):
        if '/api/' in response.url:
            try:
                body = response.json() if 'json' in response.headers.get('content-type', '') else response.text()
            except:
                body = '[could not read body]'
            api_responses.append({
                'url': response.url,
                'status': response.status,
                'body': body
            })
    page.on('response', handle_response)

    print("Navigating to http://localhost:3006...")
    page.goto('http://localhost:3006', timeout=60000)

    print("Waiting for page to load...")
    page.wait_for_timeout(5000)

    # Screenshot
    page.screenshot(path=f'{SCREENSHOT_DIR}/03_login_page.png', full_page=True)
    print(f"Screenshot: {SCREENSHOT_DIR}/03_login_page.png")
    print(f"Current URL: {page.url}")

    # Czekaj na formularz logowania Clerk
    print("\nLooking for Clerk login form...")
    page.wait_for_timeout(3000)

    # Sprawdz czy jestesmy na stronie logowania
    if '/auth' in page.url or page.locator('.cl-signIn').count() > 0:
        print("Found login page!")

        # Znajdz input email
        email_input = page.locator('input[type="email"], input[name="identifier"]').first
        if email_input.count() > 0:
            print("Found email input, filling...")
            email_input.fill('tomaszpasiekauk@gmail.com')
            page.wait_for_timeout(1000)
            page.screenshot(path=f'{SCREENSHOT_DIR}/04_email_filled.png')

            # Kliknij continue
            continue_btn = page.locator('button:has-text("Continue"), button[type="submit"]').first
            if continue_btn.count() > 0:
                print("Clicking continue...")
                continue_btn.click()
                page.wait_for_timeout(2000)
                page.screenshot(path=f'{SCREENSHOT_DIR}/05_after_continue.png')

    # Czekaj na zaladowanie
    page.wait_for_timeout(5000)
    page.screenshot(path=f'{SCREENSHOT_DIR}/06_final_state.png', full_page=True)
    print(f"Final URL: {page.url}")

    # Pokaz przechwycone API requesty
    print(f"\n=== API Requests ({len(api_requests)}) ===")
    for req in api_requests[:10]:
        safe_print(f"  {req['method']} {req['url']}")

    print(f"\n=== API Responses ({len(api_responses)}) ===")
    for resp in api_responses[:10]:
        safe_print(f"  [{resp['status']}] {resp['url']}")
        if isinstance(resp['body'], dict):
            safe_print(f"       {str(resp['body'])[:100]}")

    # Trzymaj otwarty 30 sekund do manualnej inspekcji
    print("\nBrowser will stay open for 30 seconds for manual inspection...")
    page.wait_for_timeout(30000)

    browser.close()
    print("\nTest complete!")
