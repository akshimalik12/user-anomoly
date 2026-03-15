import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
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

print("=== LOADING UNIFIED DATASETS ===")
# Load all three datasets
df_login = pd.read_csv("log_login_500users.csv")
df_behav = pd.read_csv("log_behavior_500users.csv")
df_net = pd.read_csv("log_network_500users.csv")

# Extract the "Answer Key" (Ground Truth Labels)
# 0 = Normal Human, 1 = Hacker/Bot
y_true = df_login['is_anomaly'].values 

# We do an 80/20 Train-Test Split. 
# We use random_state=42 so all 3 modules split the exact same way.
split_config = {'test_size': 0.2, 'random_state': 42, 'stratify': y_true}

print(f"Total Records: {len(y_true)}")
print(f"Training on 80%, Testing on 20%...\n")


# ==========================================
# 1. LOGIN MODULE: One-Class SVM
# ==========================================
print("--- [1/3] Evaluating Login Module (OCSVM) ---")
df_login['timestamp'] = pd.to_datetime(df_login['timestamp'])
df_login['hour'] = df_login['timestamp'].dt.hour
X_login = df_login[['hour', 'country', 'os', 'auth_method', 'login_status', 'resolution']]

X_train_log, X_test_log, y_train_log, y_test_log = train_test_split(X_login, y_true, **split_config)

preprocessor_login = ColumnTransformer(
    transformers=[('cat', OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1), 
         ['country', 'os', 'auth_method', 'login_status', 'resolution'])], 
    remainder='passthrough'
)

model_login = Pipeline([
    ('preprocessor', preprocessor_login),
    ('scaler', StandardScaler()), 
    ('model', OneClassSVM(kernel='rbf', gamma='scale', nu=0.03)) 
])

# Train ONLY on X_train
model_login.fit(X_train_log)

# Test on X_test
preds_login = model_login.predict(X_test_log)
# OCSVM outputs 1 (Normal) and -1 (Anomaly). We map this to 0 and 1 to match our Answer Key.
preds_login_mapped = np.where(preds_login == 1, 0, 1)

print("Login Module Accuracy:", accuracy_score(y_test_log, preds_login_mapped))
print(classification_report(y_test_log, preds_login_mapped, target_names=["Normal (0)", "Attack (1)"]))


# ==========================================
# 2. BEHAVIOR MODULE: Deep Autoencoder
# ==========================================
print("\n--- [2/3] Evaluating Behavior Module (Deep Autoencoder) ---")
features_behav = ['mouse_velocity_px_sec', 'avg_keystroke_delay', 'session_entropy', 'tab_switch_count']
X_behav = df_behav[features_behav].values

X_train_beh, X_test_beh, y_train_beh, y_test_beh = train_test_split(X_behav, y_true, **split_config)

scaler_behav = StandardScaler()
X_train_beh_scaled = scaler_behav.fit_transform(X_train_beh)
X_test_beh_scaled = scaler_behav.transform(X_test_beh)

# Build Model
input_dim = X_train_beh_scaled.shape[1]
input_layer = Input(shape=(input_dim,))
x = Dense(16, activation="relu")(input_layer)
x = BatchNormalization()(x)
x = Dropout(0.2)(x)
x = Dense(8, activation="relu")(x)
bottleneck = Dense(4, activation="relu")(x)
x = Dense(8, activation="relu")(bottleneck)
x = BatchNormalization()(x)
x = Dropout(0.2)(x)
x = Dense(16, activation="relu")(x)
output_layer = Dense(input_dim, activation="linear")(x)

deep_autoencoder = Model(inputs=input_layer, outputs=output_layer)
deep_autoencoder.compile(optimizer=Adam(learning_rate=0.005), loss='mse')
early_stop = EarlyStopping(monitor='loss', patience=3, restore_best_weights=True)

# Train on X_train
deep_autoencoder.fit(X_train_beh_scaled, X_train_beh_scaled, epochs=50, batch_size=32, callbacks=[early_stop], verbose=0)

# Calculate threshold using X_train
train_reconstructions = deep_autoencoder.predict(X_train_beh_scaled, verbose=0)
train_mse = np.mean(np.power(X_train_beh_scaled - train_reconstructions, 2), axis=1)
threshold_behav = np.percentile(train_mse, 95) 

# Predict on X_test
test_reconstructions = deep_autoencoder.predict(X_test_beh_scaled, verbose=0)
test_mse = np.mean(np.power(X_test_beh_scaled - test_reconstructions, 2), axis=1)

# If MSE > threshold, it's an anomaly (1). Else normal (0).
preds_beh_mapped = np.where(test_mse > threshold_behav, 1, 0)

print("Behavior Module Accuracy:", accuracy_score(y_test_beh, preds_beh_mapped))
print(classification_report(y_test_beh, preds_beh_mapped, target_names=["Normal (0)", "Attack (1)"]))


# ==========================================
# 3. NETWORK MODULE: Gaussian Mixture Model
# ==========================================
print("\n--- [3/3] Evaluating Network Module (GMM) ---")
X_net = df_net[['bytes_sent', 'destination_port', 'protocol', 'packet_loss_rate']]

X_train_net, X_test_net, y_train_net, y_test_net = train_test_split(X_net, y_true, **split_config)

preprocessor_net = ColumnTransformer(
    transformers=[('cat', OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1), ['protocol'])], 
    remainder='passthrough'
)

model_net = Pipeline([
    ('preprocessor', preprocessor_net),
    ('scaler', StandardScaler()),
    ('model', GaussianMixture(n_components=3, covariance_type='full', random_state=42))
])

# Train on X_train
model_net.fit(X_train_net)

# Calculate threshold using X_train (lowest 3% probability)
train_log_probs = model_net.score_samples(X_train_net)
threshold_net = np.percentile(train_log_probs, 3) 

# Predict on X_test
test_log_probs = model_net.score_samples(X_test_net)

# If log probability is lower than threshold, it's an anomaly (1). Else normal (0).
preds_net_mapped = np.where(test_log_probs < threshold_net, 1, 0)

print("Network Module Accuracy:", accuracy_score(y_test_net, preds_net_mapped))
print(classification_report(y_test_net, preds_net_mapped, target_names=["Normal (0)", "Attack (1)"]))

# Save everything so your API can use them
joblib.dump(model_login, 'models/login_ocsvm_pipeline.pkl')
deep_autoencoder.save('models/behavior_deep_ae.h5')
joblib.dump(scaler_behav, 'models/behavior_deep_scaler.pkl')
joblib.dump(threshold_behav, 'models/behavior_deep_threshold.pkl')
joblib.dump(model_net, 'models/network_gmm_pipeline.pkl')
joblib.dump(threshold_net, 'models/network_gmm_threshold.pkl')

print("\n=== EVALUATION COMPLETE & MODELS SAVED ===")