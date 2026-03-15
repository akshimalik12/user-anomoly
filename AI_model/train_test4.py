import pandas as pd
import numpy as np
import joblib
import os

from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler, OrdinalEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense
from tensorflow.keras.optimizers import Adam


if not os.path.exists("models"):
    os.makedirs("models")

print("=== LOADING DATASETS ===")

df_login = pd.read_csv("log_login_500users.csv")
df_behav = pd.read_csv("log_behavior_500users.csv")
df_net = pd.read_csv("log_network_500users.csv")

y_true = df_login["is_anomaly"].values

split_config = {
    "test_size": 0.2,
    "random_state": 42,
    "stratify": y_true
}

print("Splitting data 80/20...\n")

# ==================================================
# 1️⃣ LOGIN MODULE — Isolation Forest
# ==================================================
print("=== TRAINING LOGIN MODULE (Isolation Forest) ===")

df_login['timestamp'] = pd.to_datetime(df_login['timestamp'])
df_login['hour'] = df_login['timestamp'].dt.hour

features_login = ['hour', 'country', 'os',
                  'auth_method', 'login_status', 'resolution']

X_login = df_login[features_login]

X_train_log, X_test_log, y_train_log, y_test_log = train_test_split(
    X_login, y_true, **split_config
)

preprocessor_login = ColumnTransformer(
    transformers=[
        ('cat',
         OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1),
         ['country', 'os', 'auth_method', 'login_status', 'resolution'])
    ],
    remainder='passthrough'
)

model_login = Pipeline([
    ('preprocessor', preprocessor_login),
    ('model', IsolationForest(
        n_estimators=100,
        contamination=0.03,
        random_state=42))
])

model_login.fit(X_train_log)

preds_login = model_login.predict(X_test_log)
preds_login = np.where(preds_login == 1, 0, 1)

print("Login Accuracy:", accuracy_score(y_test_log, preds_login))
print(classification_report(y_test_log, preds_login))

joblib.dump(model_login, "models/login_pipeline.pkl")


# ==================================================
# 2️⃣ BEHAVIOR MODULE — Autoencoder
# ==================================================
print("\n=== TRAINING BEHAVIOR MODULE (Autoencoder) ===")

features_behav = ['mouse_velocity_px_sec',
                  'avg_keystroke_delay',
                  'session_entropy',
                  'tab_switch_count']

X_behav = df_behav[features_behav].values

X_train_beh, X_test_beh, y_train_beh, y_test_beh = train_test_split(
    X_behav, y_true, **split_config
)

scaler_behav = StandardScaler()
X_train_scaled = scaler_behav.fit_transform(X_train_beh)
X_test_scaled = scaler_behav.transform(X_test_beh)

input_dim = X_train_scaled.shape[1]
input_layer = Input(shape=(input_dim,))
encoder = Dense(2, activation="relu")(input_layer)
decoder = Dense(input_dim, activation="linear")(encoder)

autoencoder = Model(inputs=input_layer, outputs=decoder)
autoencoder.compile(optimizer=Adam(0.01), loss="mse")

autoencoder.fit(
    X_train_scaled,
    X_train_scaled,
    epochs=20,
    batch_size=32,
    verbose=0
)

# Threshold from TRAIN only
train_recon = autoencoder.predict(X_train_scaled, verbose=0)
train_mse = np.mean(np.power(X_train_scaled - train_recon, 2), axis=1)
threshold = np.percentile(train_mse, 95)

# Evaluate on TEST
test_recon = autoencoder.predict(X_test_scaled, verbose=0)
test_mse = np.mean(np.power(X_test_scaled - test_recon, 2), axis=1)
preds_beh = np.where(test_mse > threshold, 1, 0)

print("Behavior Accuracy:", accuracy_score(y_test_beh, preds_beh))
print(classification_report(y_test_beh, preds_beh))

autoencoder.save("models/behavior_autoencoder.h5")
joblib.dump(scaler_behav, "models/behavior_scaler.pkl")
joblib.dump(threshold, "models/behavior_threshold.pkl")


# ==================================================
# 3️⃣ NETWORK MODULE — Isolation Forest
# ==================================================
print("\n=== TRAINING NETWORK MODULE (Isolation Forest) ===")

features_net = ['bytes_sent',
                'destination_port',
                'protocol',
                'packet_loss_rate']

X_net = df_net[features_net]

X_train_net, X_test_net, y_train_net, y_test_net = train_test_split(
    X_net, y_true, **split_config
)

preprocessor_net = ColumnTransformer(
    transformers=[
        ('cat',
         OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1),
         ['protocol'])
    ],
    remainder='passthrough'
)

model_net = Pipeline([
    ('preprocessor', preprocessor_net),
    ('model', IsolationForest(
        n_estimators=100,
        contamination=0.03,
        random_state=42))
])

model_net.fit(X_train_net)

preds_net = model_net.predict(X_test_net)
preds_net = np.where(preds_net == 1, 0, 1)

print("Network Accuracy:", accuracy_score(y_test_net, preds_net))
print(classification_report(y_test_net, preds_net))

joblib.dump(model_net, "models/network_pipeline.pkl")

print("\n=== TRAINING + TESTING COMPLETE ===")