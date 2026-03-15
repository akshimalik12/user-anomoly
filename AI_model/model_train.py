import pandas as pd
import numpy as np
import joblib
import os
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler, OrdinalEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense
from tensorflow.keras.optimizers import Adam

# Create folder for saved models
if not os.path.exists('models'):
    os.makedirs('models')

print("=== 1. TRAINING LOGIN MODULE (Isolation Forest) ===")
# Load Data
df_login = pd.read_csv("log_login_500users.csv")

# Feature Engineering: Extract Hour from timestamp
# We convert the string timestamp to actual datetime objects
df_login['timestamp'] = pd.to_datetime(df_login['timestamp'])
df_login['hour'] = df_login['timestamp'].dt.hour

# Features to use
features_login = ['hour', 'country', 'os', 'auth_method', 'login_status', 'resolution']
X_login = df_login[features_login]

# Preprocessing: Convert text (Country, OS) to numbers
preprocessor_login = ColumnTransformer(
    transformers=[
        ('cat', OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1), 
         ['country', 'os', 'auth_method', 'login_status', 'resolution'])
    ],
    remainder='passthrough' # Keep 'hour' as is
)

# Pipeline: Encode -> Train Isolation Forest
model_login = Pipeline([
    ('preprocessor', preprocessor_login),
    ('model', IsolationForest(n_estimators=100, contamination=0.03, random_state=42))
])

model_login.fit(X_login)
joblib.dump(model_login, 'models/login_pipeline.pkl')
print(">> Login Model Saved.")


print("\n=== 2. TRAINING BEHAVIOR MODULE (Autoencoder) ===")
# Load Data
df_behav = pd.read_csv("log_behavior_500users.csv")
features_behav = ['mouse_velocity_px_sec', 'avg_keystroke_delay', 'session_entropy', 'tab_switch_count']
X_behav = df_behav[features_behav].values

# Scaling: Neural Networks strictly require 0-1 scaling
scaler_behav = StandardScaler()
X_behav_scaled = scaler_behav.fit_transform(X_behav)

# Define Autoencoder Architecture
input_dim = X_behav_scaled.shape[1]
input_layer = Input(shape=(input_dim,))
encoder = Dense(2, activation="relu")(input_layer) # Compress to 2 features
decoder = Dense(input_dim, activation="linear")(encoder) # Expand back

autoencoder = Model(inputs=input_layer, outputs=decoder)
autoencoder.compile(optimizer=Adam(learning_rate=0.01), loss='mse')

# Train
autoencoder.fit(X_behav_scaled, X_behav_scaled, epochs=20, batch_size=32, verbose=0)

# Calculate "Threshold" (The Maximum Error allowed before we call it an anomaly)
# We find the error on normal data, and set the limit slightly higher
reconstructions = autoencoder.predict(X_behav_scaled)
mse = np.mean(np.power(X_behav_scaled - reconstructions, 2), axis=1)
threshold = np.percentile(mse, 95) # 95th percentile is the cutoff

# Save Model, Scaler, and Threshold
autoencoder.save('models/behavior_autoencoder.h5')
joblib.dump(scaler_behav, 'models/behavior_scaler.pkl')
joblib.dump(threshold, 'models/behavior_threshold.pkl')
print(f">> Behavior Model Saved. (Anomaly Threshold MSE: {threshold:.4f})")


print("\n=== 3. TRAINING NETWORK MODULE (Isolation Forest) ===")
# Load Data
df_net = pd.read_csv("log_network_500users.csv")
features_net = ['bytes_sent', 'destination_port', 'protocol', 'packet_loss_rate']
X_net = df_net[features_net]

# Preprocessing: Encode 'protocol' (TCP/UDP)
preprocessor_net = ColumnTransformer(
    transformers=[
        ('cat', OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1), ['protocol'])
    ],
    remainder='passthrough'
)

model_net = Pipeline([
    ('preprocessor', preprocessor_net),
    ('model', IsolationForest(n_estimators=100, contamination=0.03, random_state=42))
])

model_net.fit(X_net)
joblib.dump(model_net, 'models/network_pipeline.pkl')
print(">> Network Model Saved.")
print("\nALL SYSTEMS GO. Ready for testing.")