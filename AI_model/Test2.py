import pandas as pd
import numpy as np
import joblib
import os
from sklearn.svm import OneClassSVM
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler, OrdinalEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense, Dropout, BatchNormalization
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping

if not os.path.exists('models'):
    os.makedirs('models')

print("=== 1. LOGIN MODULE: One-Class SVM ===")
df_login = pd.read_csv("log_login_500users.csv")
df_login['timestamp'] = pd.to_datetime(df_login['timestamp'])
df_login['hour'] = df_login['timestamp'].dt.hour
X_login = df_login[['hour', 'country', 'os', 'auth_method', 'login_status', 'resolution']]

preprocessor_login = ColumnTransformer(
    transformers=[
        ('cat', OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1), 
         ['country', 'os', 'auth_method', 'login_status', 'resolution'])
    ], remainder='passthrough'
)

# OCSVM requires scaled data, so we add StandardScaler to the pipeline
model_login = Pipeline([
    ('preprocessor', preprocessor_login),
    ('scaler', StandardScaler()), 
    # nu=0.03 means we expect 3% anomalies. rbf kernel handles complex non-linear boundaries.
    ('model', OneClassSVM(kernel='rbf', gamma='scale', nu=0.03)) 
])

model_login.fit(X_login)
joblib.dump(model_login, 'models/login_ocsvm_pipeline.pkl')
print(">> Login Model (OCSVM) Saved.")


print("\n=== 2. BEHAVIOR MODULE: Deep Autoencoder ===")
df_behav = pd.read_csv("log_behavior_500users.csv")
features_behav = ['mouse_velocity_px_sec', 'avg_keystroke_delay', 'session_entropy', 'tab_switch_count']
X_behav = df_behav[features_behav].values

scaler_behav = StandardScaler()
X_behav_scaled = scaler_behav.fit_transform(X_behav)

# Deep Neural Network Architecture
input_dim = X_behav_scaled.shape[1]
input_layer = Input(shape=(input_dim,))

# Encoder (Deep layers with Batch Normalization for stability)
x = Dense(16, activation="relu")(input_layer)
x = BatchNormalization()(x)
x = Dropout(0.2)(x) # Drops 20% of neurons randomly to prevent overfitting
x = Dense(8, activation="relu")(x)

# The Bottleneck (Latent Space)
bottleneck = Dense(4, activation="relu")(x)

# Decoder
x = Dense(8, activation="relu")(bottleneck)
x = BatchNormalization()(x)
x = Dropout(0.2)(x)
x = Dense(16, activation="relu")(x)
output_layer = Dense(input_dim, activation="linear")(x)

deep_autoencoder = Model(inputs=input_layer, outputs=output_layer)
deep_autoencoder.compile(optimizer=Adam(learning_rate=0.005), loss='mse')

# Early Stopping: Stops training if the model stops improving, prevents overfitting
early_stop = EarlyStopping(monitor='loss', patience=3, restore_best_weights=True)

deep_autoencoder.fit(
    X_behav_scaled, X_behav_scaled, 
    epochs=50, # More epochs because we have Early Stopping
    batch_size=32, 
    callbacks=[early_stop],
    verbose=0
)

reconstructions = deep_autoencoder.predict(X_behav_scaled)
mse = np.mean(np.power(X_behav_scaled - reconstructions, 2), axis=1)
threshold_behav = np.percentile(mse, 95) # Top 5% error = Anomaly

deep_autoencoder.save('models/behavior_deep_ae.h5')
joblib.dump(scaler_behav, 'models/behavior_deep_scaler.pkl')
joblib.dump(threshold_behav, 'models/behavior_deep_threshold.pkl')
print(f">> Deep Autoencoder Saved. (Anomaly Threshold MSE: {threshold_behav:.4f})")


print("\n=== 3. NETWORK MODULE: Gaussian Mixture Model (GMM) ===")
df_net = pd.read_csv("log_network_500users.csv")
X_net = df_net[['bytes_sent', 'destination_port', 'protocol', 'packet_loss_rate']]

preprocessor_net = ColumnTransformer(
    transformers=[
        ('cat', OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1), ['protocol'])
    ], remainder='passthrough'
)

# GMM works best with scaled data
model_net = Pipeline([
    ('preprocessor', preprocessor_net),
    ('scaler', StandardScaler()),
    # n_components=3 assumes 3 types of normal traffic (e.g. streaming, browsing, idle)
    ('model', GaussianMixture(n_components=3, covariance_type='full', random_state=42))
])

model_net.fit(X_net)

# GMM outputs log-probabilities. We find the probability of all training data
# and set the anomaly threshold at the lowest 3% probability.
log_probs = model_net.score_samples(X_net)
threshold_net = np.percentile(log_probs, 3) 

joblib.dump(model_net, 'models/network_gmm_pipeline.pkl')
joblib.dump(threshold_net, 'models/network_gmm_threshold.pkl')
print(f">> Network Model (GMM) Saved. (Log-Prob Threshold: {threshold_net:.2f})")
print("\n=== ADVANCED TRAINING COMPLETE ===")