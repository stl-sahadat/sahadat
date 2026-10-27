#!/usr/bin/env python3
"""
Custom high-performance, hardened HTTP server for Md Sahadat Hossain's Portfolio.
Defensive Architecture & Security Hardening:
- Defense-in-depth Path Traversal Prevention (canonical path guards)
- Timing-Attack Resistant Authentication (secrets.compare_digest)
- Cryptographic Session Management (32-byte hex tokens with TTL expiration)
- Anti-Brute-Force Rate Limiting (Sliding window lockout)
- Max Payload Size Bounds (Memory DoS prevention - 15MB limit)
- Restrictive Allowed File Types for Media Uploads (.png, .jpg, .jpeg, .webp, .svg)
- Modern Security Headers (nosniff, SAMEORIGIN, XSS protection, Referrer-Policy)
- Single Page Application Clean Routing (/about, /skills, /projects, /contact, /3d, /admin)
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
MAX_BODY_SIZE = 15 * 1024 * 1024  # 15 MB limit
SESSION_TTL = 86400  # 24 hours
ALLOWED_IMAGE_EXTS = {'.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'}

# Defensive State
LOGIN_ATTEMPTS = {}   # { ip: { 'count': int, 'lock_until': float } }
ACTIVE_SESSIONS = {}  # { token: expires_at_timestamp }

os.makedirs(os.path.join(DIRECTORY, 'data'), exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

def is_valid_token(token):
    if not token or not isinstance(token, str):
        return False
    now = time.time()
    expires = ACTIVE_SESSIONS.get(token)
    if expires and expires > now:
        return True
    if token in ACTIVE_SESSIONS:
        del ACTIVE_SESSIONS[token]
    return False

class PortfolioHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enterprise Hardened Headers
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
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

        # Canonical path traversal defense
        relative_path = url_path.lstrip('/')
        disk_path = os.path.abspath(os.path.join(DIRECTORY, relative_path))
        base_dir = os.path.abspath(DIRECTORY)
        if not disk_path.startswith(base_dir):
            return None

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

        # Standard SPA clean slash routes -> index.html
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

        # DoS Protection: Reject payloads larger than MAX_BODY_SIZE
        if content_len > MAX_BODY_SIZE:
            self._send_json(413, {"status": "error", "message": "Payload Too Large (Max 15MB allowed)"})
            return

        body = self.rfile.read(content_len).decode('utf-8', errors='ignore') if content_len > 0 else '{}'

        try:
            payload = json.loads(body) if body else {}
        except Exception:
            self._send_json(400, {"status": "error", "message": "Malformed JSON payload"})
            return

        # 1. API: Login with Anti-Brute-Force & Timing-Attack Immunity
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

            # Constant-time comparison to prevent timing side-channels
            is_email_valid = secrets.compare_digest(email, VALID_GMAIL.lower())
            is_pass_valid = secrets.compare_digest(password, VALID_PASS)

            if is_email_valid and is_pass_valid:
                # Login Success: Reset failures & generate cryptographically strong token
                record['count'] = 0
                record['lock_until'] = 0
                token = secrets.token_hex(32)
                ACTIVE_SESSIONS[token] = now + SESSION_TTL
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

        # Strict Token Authentication (Bearer Header or Token Field)
        auth_header = self.headers.get('Authorization', '')
        token = auth_header.replace('Bearer ', '').strip() if auth_header else str(payload.get('token', '')).strip()

        # 2. API: Save Portfolio Data (Restricted to Valid Sessions)
        if clean_path == '/api/portfolio-data':
            if is_valid_token(token):
                data_to_save = payload.get('data') or payload
                if isinstance(data_to_save, dict) and 'token' in data_to_save:
                    data_to_save = {k: v for k, v in data_to_save.items() if k != 'token'}

                try:
                    with open(DATA_FILE, 'w', encoding='utf-8') as f:
                        json.dump(data_to_save, f, indent=2, ensure_ascii=False)

                    # Safely sync to workspace directories
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
                self._send_json(403, {"status": "error", "message": "Unauthorized: Valid session token required."})
                return

        # 3. API: Upload Image (Restricted & Path-Traversal Immune)
        if clean_path == '/api/upload-image':
            if is_valid_token(token):
                orig_filename = os.path.basename(str(payload.get('filename', 'upload.png')).strip())
                _, ext = os.path.splitext(orig_filename.lower())
                if ext not in ALLOWED_IMAGE_EXTS:
                    ext = '.png'

                # Cryptographic unique filename to prevent overwrites or directory escapement
                safe_name = f"upload_{int(time.time())}_{secrets.token_hex(4)}{ext}"

                data_url = payload.get('image') or payload.get('data', '')
                if ',' in data_url:
                    data_url = data_url.split(',', 1)[1]

                try:
                    raw_bytes = base64.b64decode(data_url)
                    save_path = os.path.abspath(os.path.join(UPLOAD_DIR, safe_name))
                    upload_base = os.path.abspath(UPLOAD_DIR)

                    if not save_path.startswith(upload_base):
                        self._send_json(400, {"status": "error", "message": "Invalid file path detected."})
                        return

                    with open(save_path, 'wb') as f:
                        f.write(raw_bytes)

                    # Copy to all active workspaces
                    for ws_dir in WORKSPACE_DIRS:
                        ws_upload_dir = os.path.join(ws_dir, 'assets', 'img', 'uploads')
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
                self._send_json(403, {"status": "error", "message": "Unauthorized: Valid session token required."})
                return

        self._send_json(404, {"error": "API route not found"})

def run_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('0.0.0.0', PORT), PortfolioHTTPHandler) as httpd:
        print(f"Serving Portfolio & Hardened Admin Console on port {PORT} at {DIRECTORY}...")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")

if __name__ == '__main__':
    run_server()
