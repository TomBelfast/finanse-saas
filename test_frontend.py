# -*- coding: utf-8 -*-
"""Test frontend - check insurances and loans loading"""
from playwright.sync_api import sync_playwright
import json

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False, slow_mo=300)
    context = browser.new_context()
    page = context.new_page()

    # Capture API responses
    api_responses = []
    def handle_response(response):
        if '/api/' in response.url:
            try:
                body = response.json() if 'json' in response.headers.get('content-type', '') else None
            except:
                body = None
            api_responses.append({
                'url': response.url,
                'status': response.status,
                'body': body
            })
    page.on('response', handle_response)

    # Capture console errors
    console_errors = []
    def handle_console(msg):
        if msg.type == 'error':
            console_errors.append(msg.text)
    page.on('console', handle_console)

    print("Opening app...")
    page.goto('http://localhost:3006', timeout=60000)
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(3000)

    print(f"Current URL: {page.url}")

    # Check if we're on login page
    if '/auth' in page.url or page.locator('.cl-signIn').count() > 0:
        print("On login page - need to log in first")
        page.screenshot(path='K:/SSSAAAAAAS dzialajacy/test_screenshots/frontend_login.png')
    else:
        print("Logged in! Checking pages...")

        # Navigate to Insurances
        print("\n=== Navigating to Insurances ===")
        page.goto('http://localhost:3006/insurances', timeout=30000)
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)
        page.screenshot(path='K:/SSSAAAAAAS dzialajacy/test_screenshots/insurances_page.png')

        # Navigate to Loans
        print("\n=== Navigating to Loans ===")
        page.goto('http://localhost:3006/loans', timeout=30000)
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)
        page.screenshot(path='K:/SSSAAAAAAS dzialajacy/test_screenshots/loans_page.png')

        # Navigate to Subscriptions
        print("\n=== Navigating to Subscriptions ===")
        page.goto('http://localhost:3006/subscriptions', timeout=30000)
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)
        page.screenshot(path='K:/SSSAAAAAAS dzialajacy/test_screenshots/subscriptions_page.png')

    print("\n=== API Responses ===")
    for resp in api_responses:
        print(f"[{resp['status']}] {resp['url']}")
        if resp['body']:
            body_str = str(resp['body'])[:200]
            print(f"    Body: {body_str}")

    print("\n=== Console Errors ===")
    for err in console_errors:
        print(f"  ERROR: {err[:200]}")

    page.wait_for_timeout(5000)
    browser.close()
    print("\nDone!")
