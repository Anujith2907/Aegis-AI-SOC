import os
import pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import NearestNeighbors
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import xgboost as xgb

# Set random seed for reproducibility
np.random.seed(42)

# Features:
# 0: packet_rate (pps)
# 1: unique_src_ips
# 2: payload_size_avg (bytes)
# 3: protocol_udp (0 or 1)
# 4: protocol_tcp (0 or 1)
# 5: protocol_icmp (0 or 1)
# 6: dst_port_variance
# 7: duration_seconds
# 8: bytes_per_second

THREAT_CLASSES = ['DDoS', 'Brute Force', 'Malware', 'Port Scan', 'Unauthorized Access', 'Normal Traffic']
SEVERITIES = ['low', 'medium', 'high', 'critical']

def generate_synthetic_data(num_samples=2000):
    data = []
    labels = []
    severities = []
    
    for _ in range(num_samples):
        # Choose class
        cls_idx = np.random.choice(len(THREAT_CLASSES), p=[0.25, 0.15, 0.15, 0.20, 0.10, 0.15])
        threat = THREAT_CLASSES[cls_idx]
        
        # Base values
        packet_rate = np.random.uniform(5, 100)
        unique_src_ips = 1
        payload_size_avg = np.random.uniform(40, 1000)
        proto_udp = 0
        proto_tcp = 1
        proto_icmp = 0
        dst_port_variance = np.random.uniform(0, 10)
        duration = np.random.uniform(1, 60)
        bytes_sec = packet_rate * payload_size_avg
        
        # Class-specific adjustments
        if threat == 'DDoS':
            packet_rate = np.random.uniform(20000, 60000)
            unique_src_ips = np.random.randint(1, 5)
            payload_size_avg = np.random.uniform(50, 128)
            proto_udp = np.random.choice([0, 1], p=[0.3, 0.7])
            proto_tcp = 1 - proto_udp
            dst_port_variance = np.random.uniform(0.0, 0.1) # Concentrated targets
            duration = np.random.uniform(100, 600)
            bytes_sec = packet_rate * payload_size_avg * 1.5
            sev = 'critical' if packet_rate > 40000 else 'high'
            
        elif threat == 'Brute Force':
            packet_rate = np.random.uniform(15, 50)
            unique_src_ips = np.random.randint(1, 2)
            payload_size_avg = np.random.uniform(100, 300)
            proto_tcp = 1
            dst_port_variance = 0.0 # Repeated hits on SSH/RDP ports
            duration = np.random.uniform(120, 1200)
            bytes_sec = packet_rate * payload_size_avg
            sev = 'high' if duration > 600 else 'medium'
            
        elif threat == 'Malware':
            packet_rate = np.random.uniform(2, 10)
            unique_src_ips = 1
            payload_size_avg = np.random.uniform(1500, 8000) # Exfiltration payloads
            proto_tcp = 1
            dst_port_variance = np.random.uniform(2, 5)
            duration = np.random.uniform(5, 30)
            bytes_sec = packet_rate * payload_size_avg
            sev = 'critical' if payload_size_avg > 5000 else 'high'
            
        elif threat == 'Port Scan':
            packet_rate = np.random.uniform(500, 2000)
            unique_src_ips = 1
            payload_size_avg = np.random.uniform(20, 64)
            proto_tcp = np.random.choice([0, 1], p=[0.2, 0.8])
            proto_udp = 1 - proto_tcp
            dst_port_variance = np.random.uniform(1000, 5000) # Scans many ports
            duration = np.random.uniform(10, 60)
            bytes_sec = packet_rate * payload_size_avg
            sev = 'medium' if packet_rate > 1000 else 'low'
            
        elif threat == 'Unauthorized Access':
            packet_rate = np.random.uniform(1, 5)
            unique_src_ips = 1
            payload_size_avg = np.random.uniform(200, 1000)
            proto_tcp = 1
            dst_port_variance = np.random.uniform(1, 3)
            duration = np.random.uniform(10, 180)
            bytes_sec = packet_rate * payload_size_avg
            sev = 'high'
            
        else: # Normal Traffic
            packet_rate = np.random.uniform(10, 150)
            unique_src_ips = np.random.randint(1, 20)
            payload_size_avg = np.random.uniform(100, 1500)
            proto_tcp = np.random.choice([0, 1], p=[0.5, 0.5])
            proto_udp = 1 - proto_tcp if proto_tcp == 0 else 0
            proto_icmp = 1 - (proto_tcp + proto_udp)
            dst_port_variance = np.random.uniform(10, 800)
            duration = np.random.uniform(2, 300)
            bytes_sec = packet_rate * payload_size_avg
            sev = 'low'
            
        data.append([
            packet_rate, unique_src_ips, payload_size_avg,
            proto_udp, proto_tcp, proto_icmp,
            dst_port_variance, duration, bytes_sec
        ])
        labels.append(cls_idx)
        severities.append(SEVERITIES.index(sev))
        
    cols = ['packet_rate', 'unique_src_ips', 'payload_size_avg', 'protocol_udp', 'protocol_tcp', 'protocol_icmp', 'dst_port_variance', 'duration_seconds', 'bytes_per_second']
    df = pd.DataFrame(data, columns=cols)
    df['threat_label'] = labels
    df['severity_label'] = severities
    return df

def train_and_save_models():
    # Make sure output directories exist
    os.makedirs(os.path.join("app", "ml", "models"), exist_ok=True)
    
    print("Generating synthetic network incident dataset...")
    df = generate_synthetic_data(num_samples=3000)
    
    X = df.drop(columns=['threat_label', 'severity_label']).values
    y_threat = df['threat_label'].values
    y_sev = df['severity_label'].values
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Split
    X_train, X_test, y_threat_train, y_threat_test, y_sev_train, y_sev_test = train_test_split(
        X_scaled, y_threat, y_sev, test_size=0.2, random_state=42
    )
    
    # 1. XGBoost Classifier (Threat Classification)
    print("Training XGBoost threat classifier...")
    xgb_clf = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        random_state=42,
        eval_metric='mlogloss'
    )
    xgb_clf.fit(X_train, y_threat_train)
    print(f"XGBoost train accuracy: {xgb_clf.score(X_train, y_threat_train):.4f}")
    print(f"XGBoost test accuracy: {xgb_clf.score(X_test, y_threat_test):.4f}")
    
    # 2. Random Forest Classifier (Severity Classification)
    print("Training Random Forest severity classifier...")
    rf_clf = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
    rf_clf.fit(X_train, y_sev_train)
    print(f"RF train accuracy: {rf_clf.score(X_train, y_sev_train):.4f}")
    print(f"RF test accuracy: {rf_clf.score(X_test, y_sev_test):.4f}")
    
    # 3. Decision Tree Classifier (For simple trace paths)
    print("Training Decision Tree classifier...")
    dt_clf = DecisionTreeClassifier(max_depth=5, random_state=42)
    dt_clf.fit(X_train, y_threat_train)
    print(f"DT test accuracy: {dt_clf.score(X_test, y_threat_test):.4f}")
    
    # 4. KNN (Similar Incident Search)
    # We fit KNN on all historical incidents features (in scaled space)
    print("Fitting KNN model for similar incident retrieval...")
    knn = NearestNeighbors(n_neighbors=5, algorithm='auto')
    knn.fit(X_scaled)
    
    # 5. K-Means (Threat Clustering)
    print("Training K-Means clustering...")
    kmeans = KMeans(n_clusters=5, random_state=42)
    kmeans.fit(X_scaled)
    
    # 6. PCA (Dimension Reduction to 2D for plotting)
    print("Fitting PCA model...")
    pca = PCA(n_components=2)
    pca.fit(X_scaled)
    
    # Save the models & scaler
    models = {
        'scaler.pkl': scaler,
        'xgb_model.pkl': xgb_clf,
        'rf_model.pkl': rf_clf,
        'dt_model.pkl': dt_clf,
        'knn_model.pkl': knn,
        'kmeans_model.pkl': kmeans,
        'pca_model.pkl': pca
    }
    
    for filename, obj in models.items():
        filepath = os.path.join("app", "ml", "models", filename)
        with open(filepath, 'wb') as f:
            pickle.dump(obj, f)
        print(f"Saved {filepath}")
        
    # Also save the generated dataset for KNN search matching or similar lookup
    # Add index IDs to the dataset for database similarity reference
    df_with_ids = df.copy()
    df_with_ids['incident_id'] = [f"sim-{i:03d}" for i in range(len(df))]
    # Store titles
    titles = []
    for row in df.itertuples():
        t = THREAT_CLASSES[row.threat_label]
        s = SEVERITIES[row.severity_label]
        titles.append(f"{t} Event — Priority {s.capitalize()}")
    df_with_ids['title'] = titles
    
    dataset_path = os.path.join("app", "ml", "models", "historical_data.pkl")
    with open(dataset_path, 'wb') as f:
        pickle.dump(df_with_ids, f)
    print(f"Saved {dataset_path}")
    print("All models successfully trained and serialized.")

if __name__ == "__main__":
    train_and_save_models()
