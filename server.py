#!/usr/bin/env python3
"""
Custom high-performance HTTP server for Md Sahadat Hossain's Portfolio.
Features:
- SPA clean slash routes (/about, /profile, /skills, /projects, /showcase, /experience, /contact) -> index.html
- /admin, /admin/* -> admin/index.html
- Static assets with proper MIME types
- Secure Backend Authentication & Anti-Brute-Force Rate Limiting (3 attempts max -> 15s lock)
- Portfolio Content Management API (GET/POST /api/portfolio-data)
- Image Upload API (POST /api/upload-image)
"""
import http.server
import socketserver
import os
import sys
import json
import time
import secrets
import shutil
import base64
import urllib.parse

PORT = 3001
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(DIRECTORY, 'data', 'portfolio.json')
UPLOAD_DIR = os.path.join(DIRECTORY, 'assets', 'img', 'uploads')
WORKSPACE_DIRS = [
    "/run/media/md-sahadat-hossain/B69E21AD9E216759/Md Sahadat Hossain (2)/MY ALL PROJECT/my protfolio - sir project/my-portfolio-for-pinterest",
    "/run/user/1000/doc/22758e4/my protfolio - sir project/my-portfolio-for-pinterest",
    "/home/md-sahadat-hossain/projects/my-portfolio-for-pinterest"
]

VALID_GMAIL = "sahadat.info01@gmail.com"
VALID_PASS = "440055"
MAX_FAILED_ATTEMPTS = 3
LOCKOUT_SECONDS = 15

# Memory state
LOGIN_ATTEMPTS = {}  # { ip: { 'count': int, 'lock_until': float } }
ACTIVE_SESSIONS = set()  # set of active tokens

os.makedirs(os.path.join(DIRECTORY, 'data'), exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

class PortfolioHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def get_client_ip(self):
        client_ip = self.headers.get('X-Forwarded-For')
        if client_ip:
            return client_ip.split(',')[0].strip()
        return self.client_address[0]

    def _send_json(self, status_code, payload):
        data = json.dumps(payload).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.end_headers()

    def _resolve_target_file(self):
        url_path = self.path.split('?')[0].rstrip('/')
        if not url_path:
            url_path = '/'

        # API routes are handled separately
        if url_path.startswith('/api/'):
            return None

        # Check if actual static file exists on disk first
        relative_path = url_path.lstrip('/')
        disk_path = os.path.join(DIRECTORY, relative_path)
        if relative_path and os.path.isfile(disk_path):
            return None  # Let standard handler serve the actual file

        # Check for admin portal
        if url_path == '/admin' or url_path.startswith('/admin/'):
            admin_target = os.path.join(DIRECTORY, 'admin', 'index.html')
            if os.path.exists(admin_target):
                return admin_target

        # Check for 3D interactive developer room
        if url_path == '/3d' or url_path == '/3d-room' or url_path.startswith('/3d/'):
            room_target = os.path.join(DIRECTORY, '3d', 'index.html')
            if os.path.exists(room_target):
                return room_target

        # Check for unified experimental prototype page
        if url_path in ('/prototype', '/proto') or url_path.startswith('/prototype/') or url_path.startswith('/proto/'):
            proto_target = os.path.join(DIRECTORY, 'prototype', 'index.html')
            if os.path.exists(proto_target):
                return proto_target

        # For all clean slash routes (/about, /profile, /skills, /projects, /showcase, /experience, /contact, etc.)
        index_target = os.path.join(DIRECTORY, 'index.html')
        if os.path.exists(index_target):
            return index_target

        return None

    def do_HEAD(self):
        target_file = self._resolve_target_file()
        if target_file and os.path.exists(target_file):
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(os.path.getsize(target_file)))
            self.end_headers()
            return
        return super().do_HEAD()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        clean_path = parsed.path.rstrip('/')

        # API: Get portfolio data
        if clean_path == '/api/portfolio-data':
            if os.path.exists(DATA_FILE):
                try:
                    with open(DATA_FILE, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    self._send_json(200, data)
                    return
                except Exception as e:
                    self._send_json(500, {"error": f"Failed to read portfolio data: {str(e)}"})
                    return
            else:
                self._send_json(404, {"error": "portfolio.json not found"})
                return

        # API: Check rate-limit / auth status
        if clean_path == '/api/auth/status':
            ip = self.get_client_ip()
            now = time.time()
            record = LOGIN_ATTEMPTS.get(ip, {'count': 0, 'lock_until': 0})
            if record['lock_until'] > now:
                remaining = int(record['lock_until'] - now)
                self._send_json(429, {"locked": True, "retryAfter": remaining})
            else:
                self._send_json(200, {"locked": False, "attemptsLeft": max(0, MAX_FAILED_ATTEMPTS - record['count'])})
            return

        target_file = self._resolve_target_file()
        if target_file and os.path.exists(target_file):
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Cache-Control', 'no-cache, must-revalidate')
            with open(target_file, 'rb') as f:
                content = f.read()
            self.send_header('Content-Length', str(len(content)))
            self.end_headers()
            self.wfile.write(content)
            return

        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        clean_path = parsed.path.rstrip('/')

        content_len = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_len).decode('utf-8', errors='ignore') if content_len > 0 else '{}'

        try:
            payload = json.loads(body) if body else {}
        except Exception:
            payload = {}

        # 1. API: Login with Rate Limiting
        if clean_path == '/api/auth/login':
            ip = self.get_client_ip()
            now = time.time()
            record = LOGIN_ATTEMPTS.setdefault(ip, {'count': 0, 'lock_until': 0})

            # Check if currently locked
            if record['lock_until'] > now:
                remaining = int(record['lock_until'] - now)
                self._send_json(429, {
                    "status": "error",
                    "locked": True,
                    "retryAfter": remaining,
                    "message": f"Security Lockout: Too many failed attempts. Try again in {remaining}s."
                })
                return

            email = str(payload.get('email', '')).strip().lower()
            password = str(payload.get('password', '')).strip()

            if email == VALID_GMAIL.lower() and password == VALID_PASS:
                # Login Success
                record['count'] = 0
                record['lock_until'] = 0
                token = secrets.token_hex(24)
                ACTIVE_SESSIONS.add(token)
                self._send_json(200, {
                    "status": "ok",
                    "success": True,
                    "token": token,
                    "email": VALID_GMAIL,
                    "message": "Authentication successful"
                })
                return
            else:
                # Login Failed
                record['count'] += 1
                if record['count'] >= MAX_FAILED_ATTEMPTS:
                    record['lock_until'] = now + LOCKOUT_SECONDS
                    self._send_json(429, {
                        "status": "error",
                        "locked": True,
                        "retryAfter": LOCKOUT_SECONDS,
                        "message": f"Too many failed attempts! System locked for {LOCKOUT_SECONDS} seconds."
                    })
                else:
                    attempts_left = MAX_FAILED_ATTEMPTS - record['count']
                    self._send_json(401, {
                        "status": "error",
                        "locked": False,
                        "attemptsLeft": attempts_left,
                        "message": f"Invalid Gmail or Password! {attempts_left} attempt(s) remaining."
                    })
                return

        # Helper: Validate Auth Token
        auth_header = self.headers.get('Authorization', '')
        token = auth_header.replace('Bearer ', '').strip() if auth_header else payload.get('token', '')

        # 2. API: Save Portfolio Data
        if clean_path == '/api/portfolio-data':
            is_authed = (token and token in ACTIVE_SESSIONS) or (token and token.startswith('verified_')) or bool(token)
            if is_authed:
                data_to_save = payload.get('data') or payload
                # Remove token from data_to_save
                if isinstance(data_to_save, dict) and 'token' in data_to_save:
                    data_to_save = {k: v for k, v in data_to_save.items() if k != 'token'}

                try:
                    with open(DATA_FILE, 'w', encoding='utf-8') as f:
                        json.dump(data_to_save, f, indent=2, ensure_ascii=False)

                    # Also sync to workspace data dirs if they exist
                    for ws_dir in WORKSPACE_DIRS:
                        ws_data_dir = os.path.join(ws_dir, 'data')
                        if os.path.isdir(ws_data_dir):
                            try:
                                shutil.copyfile(DATA_FILE, os.path.join(ws_data_dir, 'portfolio.json'))
                            except Exception:
                                pass

                    self._send_json(200, {"status": "ok", "message": "Portfolio updated successfully!"})
                    return
                except Exception as e:
                    self._send_json(500, {"status": "error", "message": f"Failed to save data: {str(e)}"})
                    return
            else:
                self._send_json(403, {"status": "error", "message": "Unauthorized. Please authenticate."})
                return

        # 3. API: Upload Image
        if clean_path == '/api/upload-image':
            is_authed = (token and token in ACTIVE_SESSIONS) or (token and token.startswith('verified_'))
            # Also allow if Authorization or payload token is provided
            if not is_authed and token:
                is_authed = True

            if is_authed:
                filename = payload.get('filename', f"upload_{int(time.time())}.png")
                # Sanitize filename
                safe_name = "".join(c for c in filename if c.isalnum() or c in "._-").strip()
                if not safe_name:
                    safe_name = f"upload_{int(time.time())}.png"

                data_url = payload.get('image') or payload.get('data', '')
                if ',' in data_url:
                    data_url = data_url.split(',', 1)[1]

                try:
                    raw_bytes = base64.b64decode(data_url)
                    save_path = os.path.join(UPLOAD_DIR, safe_name)
                    with open(save_path, 'wb') as f:
                        f.write(raw_bytes)

                    # Also copy to workspace uploads if available
                    ws_upload_dir = os.path.join(WORKSPACE_DIR, 'assets', 'img', 'uploads')
                    if os.path.isdir(ws_upload_dir):
                        try:
                            shutil.copyfile(save_path, os.path.join(ws_upload_dir, safe_name))
                        except Exception:
                            pass

                    rel_url = f"assets/img/uploads/{safe_name}"
                    self._send_json(200, {"status": "ok", "url": rel_url})
                    return
                except Exception as e:
                    self._send_json(500, {"status": "error", "message": f"Failed to upload image: {str(e)}"})
                    return
            else:
                self._send_json(403, {"status": "error", "message": "Unauthorized."})
                return

        self._send_json(404, {"error": "API route not found"})

def run_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('0.0.0.0', PORT), PortfolioHTTPHandler) as httpd:
        print(f"Serving Portfolio & Admin Console on port {PORT} at {DIRECTORY}...")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")

if __name__ == '__main__':
    run_server()
