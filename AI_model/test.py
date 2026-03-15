import pandas as pd
import numpy as np
import joblib
from tensorflow.keras.models import load_model

print("=== LOADING SECURITY MODULES ===")
# Load everything
model_login = joblib.load('models/login_pipeline.pkl')
model_net = joblib.load('models/network_pipeline.pkl')

# FIX APPLIED HERE: compile=False
model_behav = load_model('models/behavior_autoencoder.h5', compile=False)
scaler_behav = joblib.load('models/behavior_scaler.pkl')
threshold_behav = joblib.load('models/behavior_threshold.pkl')

print("Models Loaded. Initiating Attack Simulation...\n")

# --- SCENARIO 1: NORMAL USER (The "Green" Zone) ---
normal_payload = {
    'login': pd.DataFrame([{
        'hour': 14, 'country': 'US', 'os': 'Windows', 
        'auth_method': 'Password', 'login_status': 'Success', 'resolution': '1920x1080'
    }]),
    'behavior': np.array([[300, 0.25, 0.8, 5]]), 
    'network': pd.DataFrame([{
        'bytes_sent': 5000, 'destination_port': 443, 'protocol': 'TCP', 'packet_loss_rate': 0.01
    }])
}

# --- SCENARIO 2: THE HACKER (The "Red" Zone) ---
attack_payload = {
    'login': pd.DataFrame([{
        'hour': 3, 'country': 'KP', 'os': 'Bot', 
        'auth_method': 'Password', 'login_status': 'Failed', 'resolution': '800x600'
    }]),
    'behavior': np.array([[6000, 0.005, 0.1, 0]]), 
    'network': pd.DataFrame([{
        'bytes_sent': 50_000_000, 'destination_port': 22, 'protocol': 'UDP', 'packet_loss_rate': 0.0
    }])
}

def predict_risk(payload, name):
    print(f"--- TESTING: {name} ---")
    
    # 1. Login Check
    login_pred = model_login.predict(payload['login'])[0]
    login_res = "SAFE" if login_pred == 1 else "ANOMALY DETECTED"
    print(f"[Login Module]   Result: {login_res}")

    # 2. Behavior Check
    behav_scaled = scaler_behav.transform(payload['behavior'])
    reconstruction = model_behav.predict(behav_scaled)
    # Manual MSE calculation (since we disabled compile)
    mse = np.mean(np.power(behav_scaled - reconstruction, 2))
    
    behav_res = "SAFE" if mse < threshold_behav else f"BOT DETECTED (Error: {mse:.2f})"
    print(f"[Behavior Module] Result: {behav_res}")

    # 3. Network Check
    net_pred = model_net.predict(payload['network'])[0]
    net_res = "SAFE" if net_pred == 1 else "DATA EXFILTRATION DETECTED"
    print(f"[Network Module]  Result: {net_res}")
    print("-" * 30)

# Run Simulations
predict_risk(normal_payload, "Legitimate Employee")
predict_risk(attack_payload, "Malicious Bot Attack")