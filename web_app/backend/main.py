from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import datetime
import random
import smtplib
import math
from email.message import EmailMessage
import os
from dotenv import load_dotenv
from email_template import get_otp_email_html, get_otp_email_text, get_brute_force_email_html, get_brute_force_email_text

load_dotenv()

# --- Trusted office/home locations (global fallback) ---
# Each user has their own trusted locations stored in the frontend DB.
# If user_trusted_locations is NOT passed in the evaluate payload,
# no location check is done (the DB-side already flagged it).

def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

def is_trusted_location(lat, lon, trusted_locs):
    """Check if lat/lon is within 200km of any location in trusted_locs list."""
    if not trusted_locs:
        return True  # no list provided — skip location check
    if not lat and not lon:
        return True
    return any(haversine_km(lat, lon, t['lat'], t['lon']) <= 200 for t in trusted_locs)


app = FastAPI()

# --- NEW: OTP Storage & Email Config ---
active_otps = {}

SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "neurometric.alert@gmail.com")
SENDER_PASSWORD = os.environ.get("SENDER_PASSWORD", "1234")

def send_otp_email(target_email: str, otp: str, username: str = "User"):
    msg = EmailMessage()
    msg.set_content(get_otp_email_text(otp, username))
    msg.add_alternative(get_otp_email_html(otp, username), subtype='html')
    msg['Subject'] = '🔐 NeurometricShield: Verification Code Required'
    msg['From'] = SENDER_EMAIL
    msg['To'] = target_email

    try:
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"OTP {otp} sent successfully to {target_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.soc_connections: list[WebSocket] = []

    async def connect_soc(self, websocket: WebSocket):
        await websocket.accept()
        self.soc_connections.append(websocket)

    def disconnect_soc(self, websocket: WebSocket):
        self.soc_connections.remove(websocket)

    async def broadcast_to_soc(self, message: dict):
        for connection in self.soc_connections:
            await connection.send_json(message)

manager = ConnectionManager()

# --- 1. LIVE TRACKING ENDPOINT ---
@app.websocket("/ws/tracking")
async def websocket_tracking_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()

            # Handle logout signal separately
            if data.get("type") == "LOGOUT_SIGNAL":
                logout_event = {
                    "type": "SESSION_ENDED",
                    "username": data.get("username", "Unknown"),
                    "ip_address": data.get("ip_address", ""),
                    "os": data.get("os", ""),
                    "resolution": data.get("resolution", ""),
                    "time": datetime.datetime.now().strftime("%H:%M:%S"),
                    "risk_status": "Session Ended",
                    "color": "#64748b"
                }
                await manager.broadcast_to_soc(logout_event)
                continue

            data["time"] = datetime.datetime.now().strftime("%H:%M:%S")
            data["type"] = "LIVE_UPDATE"
            data["risk_status"] = "Monitoring..."
            data["color"] = "#d97706" # Orange color for monitoring
            data["protocol"] = "TCP"
            # Preserve bytes_sent and bytes_received from client
            if "bytes_sent" not in data:
                data["bytes_sent"] = 0
            if "bytes_received" not in data:
                data["bytes_received"] = 0
            
            await manager.broadcast_to_soc(data)
    except WebSocketDisconnect:
        pass

# --- 2. FINAL EVALUATION ENDPOINT ---
class CustomThresholds(BaseModel):
    bot_mouse_velocity: float = 3000
    bot_keystroke_delay: float = 0.05
    suspicious_attempts: int = 4      # OTP triggered at this many attempts
    brute_force_attempts: int = 6     # Brute-force critical at this many attempts
    high_data_mb: float = 50

class LoginPayload(BaseModel):
    username: str
    ip_address: str
    lat: float
    lon: float
    os: str
    resolution: str
    avg_keystroke_delay: float
    mouse_velocity: float
    tab_switch_count: int
    bytes_sent: int
    bytes_received: int = 0
    active_processes: str = ""
    attempts: int
    login_attempts_override: int
    email: str | None = "nischalsharma2037@gmail.com"
    custom_thresholds: CustomThresholds | None = None
    # Per-user trusted locations for location-risk check (fetched from DB by prototype)
    user_trusted_locations: list | None = None

@app.post("/api/evaluate")
async def evaluate_login(payload: LoginPayload):
    current_time = datetime.datetime.now().strftime("%H:%M:%S")
    
    full_record = payload.dict() 
    full_record["time"] = current_time
    full_record["type"] = "FINAL_EVALUATION"
    full_record["protocol"] = "HTTPS (POST)"

    # Use custom thresholds from payload if provided, otherwise use defaults
    t = payload.custom_thresholds or CustomThresholds()
    
    # AI EVALUATION LOGIC WITH ADAPTIVE MFA
    is_bot = payload.avg_keystroke_delay < t.bot_keystroke_delay or payload.mouse_velocity > t.bot_mouse_velocity
    is_hacker = any(tool in payload.active_processes for tool in ["Tor", "Wireshark", "nmap", "Burp", "Hydra", "Metasploit", "Netcat"])
    has_excessive_attempts = payload.attempts >= t.suspicious_attempts or payload.login_attempts_override >= t.suspicious_attempts
    is_brute_force = payload.attempts >= t.brute_force_attempts or payload.login_attempts_override >= t.brute_force_attempts
    is_distracted = "Slack" in payload.active_processes or payload.tab_switch_count > 2
    bytes_sent_mb = payload.bytes_sent / (1024 * 1024)
    is_high_data = bytes_sent_mb >= t.high_data_mb

    # Priority: brute force / high data first (definite MFA), then suspicious attempts, then bot/hacker
    if is_brute_force or is_high_data:
        full_record["risk_status"] = "WARNING (MFA Triggered)"
        full_record["color"] = "#f59e0b"
        action = "mfa_required"
        otp = str(random.randint(100000, 999999))
        active_otps[payload.username] = otp
        send_otp_email(payload.email, otp, payload.username)
    elif has_excessive_attempts:
        full_record["risk_status"] = "WARNING (MFA Triggered)"
        full_record["color"] = "#f59e0b"
        action = "mfa_required"
        otp = str(random.randint(100000, 999999))
        active_otps[payload.username] = otp
        send_otp_email(payload.email, otp, payload.username)
    elif is_bot or is_hacker:
        full_record["risk_status"] = "CRITICAL ANOMALY (Blocked)"
        full_record["color"] = "#dc2626"
        action = "blocked"
    elif is_distracted:
        # Distracted = warning but not blocked or OTP required
        full_record["risk_status"] = "WARNING (Distracted User)"
        full_record["color"] = "#f59e0b"
        action = "mfa_required"
    else:
        full_record["risk_status"] = "SAFE (Authenticated)"
        full_record["color"] = "#16a34a"
        action = "success"

    # Location trust check — use user's own trusted locations if provided
    is_unknown_location = not is_trusted_location(payload.lat, payload.lon, payload.user_trusted_locations or [])
    if is_unknown_location:
        full_record["risk_status"] = str(full_record.get("risk_status", "")) + " | UNKNOWN_LOCATION"

    await manager.broadcast_to_soc(full_record)
    return {"status": action, "message": "Evaluation complete"}

# --- NEW: OTP Verification Endpoint ---
class VerifyPayload(BaseModel):
    username: str
    otp: str
    ip_address: str = "Verified"
    lat: float = 0.0
    lon: float = 0.0
    os: str = "Unknown"
    resolution: str = "Unknown"
    avg_keystroke_delay: float = 0.0
    mouse_velocity: float = 0.0
    tab_switch_count: int = 0
    active_processes: str = "Identity Confirmed"
    bytes_sent: int = 0
    protocol: str = "HTTPS"
    attempts: int = 1

@app.post("/api/verify-otp")
async def verify_otp(payload: VerifyPayload):
    # Check if user has an active OTP and if it matches
    if payload.username in active_otps and str(active_otps[payload.username]) == payload.otp:
        del active_otps[payload.username] # Clear the OTP so it can't be reused
        
        # Broadcast to SOC that they passed
        await manager.broadcast_to_soc({
            "time": datetime.datetime.now().strftime("%H:%M:%S"),
            "username": payload.username,
            "type": "FINAL_EVALUATION",
            "risk_status": "MFA PASSED (Authenticated)",
            "color": "#16a34a",
            "lat": payload.lat, "lon": payload.lon, "ip_address": payload.ip_address, 
            "os": payload.os, "resolution": payload.resolution, 
            "protocol": payload.protocol, "bytes_sent": payload.bytes_sent, 
            "avg_keystroke_delay": payload.avg_keystroke_delay, "mouse_velocity": payload.mouse_velocity, 
            "tab_switch_count": payload.tab_switch_count, "active_processes": payload.active_processes,
            "attempts": payload.attempts
        })
        return {"status": "success"}
        return {"status": "failed", "message": "Invalid OTP"}

class AlertPayload(BaseModel):
    email: str
    username: str
    attempts: int

@app.post("/api/alert-brute-force")
async def alert_brute_force(payload: AlertPayload):
    msg = EmailMessage()
    msg.set_content(get_brute_force_email_text(payload.attempts, payload.username))
    msg.add_alternative(get_brute_force_email_html(payload.attempts, payload.username), subtype='html')
    msg['Subject'] = '🚨 NeurometricShield: Critical Security Alert (Brute Force Detected)'
    msg['From'] = SENDER_EMAIL
    msg['To'] = payload.email

    try:
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"Brute force alert sent successfully to {payload.email}")
        return {"status": "success"}
    except Exception as e:
        print(f"Failed to send alert email: {e}")
        return {"status": "error"}


@app.websocket("/ws/soc")
async def websocket_soc_endpoint(websocket: WebSocket):
    await manager.connect_soc(websocket)
    try:
        while True:
            await websocket.receive_text() 
    except WebSocketDisconnect:
        manager.disconnect_soc(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)