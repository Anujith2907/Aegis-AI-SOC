import os
import pickle
import numpy as np
from typing import List, Dict, Any

def get_threat_clusters() -> List[Dict[str, Any]]:
    """
    Computes/retrieves PCA reduced coordinates for clustering representation.
    """
    path_historical = os.path.join(os.path.dirname(__file__), "models", "historical_data.pkl")
    path_scaler = os.path.join(os.path.dirname(__file__), "models", "scaler.pkl")
    path_pca = os.path.join(os.path.dirname(__file__), "models", "pca.pkl")
    path_kmeans = os.path.join(os.path.dirname(__file__), "models", "kmeans.pkl")
    
    # Simple check if files are available
    if not all(os.path.exists(p) for p in [path_historical, path_scaler, path_pca, path_kmeans]):
        # Run training to generate them
        try:
            from app.ml.trainer import train_and_save_models
            train_and_save_models()
        except Exception as e:
            print(f"Error training models for clustering: {e}")
            return get_mock_clusters()
            
    try:
        with open(path_historical, 'rb') as f:
            df = pickle.load(f)
        with open(path_scaler, 'rb') as f:
            scaler = pickle.load(f)
        with open(path_pca, 'rb') as f:
            pca = pickle.load(f)
        with open(path_kmeans, 'rb') as f:
            kmeans = pickle.load(f)
            
        # Get raw features
        cols = ['packet_rate', 'unique_src_ips', 'payload_size_avg', 'protocol_udp', 'protocol_tcp', 'protocol_icmp', 'dst_port_variance', 'duration_seconds', 'bytes_per_second']
        X = df[cols].values
        X_scaled = scaler.transform(X)
        
        # Apply PCA & Kmeans
        X_pca = pca.transform(X_scaled)
        labels = kmeans.predict(X_scaled)
        
        threat_classes = ['DDoS', 'Brute Force', 'Malware', 'Port Scan', 'Unauthorized Access', 'Normal Traffic']
        groups = ['ddos', 'brute-force', 'malware', 'port-scan', 'insider', 'normal']
        
        clusters = []
        # Sample ~100 records for UI plot to avoid sending thousands of points
        step = max(1, len(df) // 120)
        sampled_indices = range(0, len(df), step)
        
        for idx in sampled_indices:
            x_coord = float(X_pca[idx, 0])
            y_coord = float(X_pca[idx, 1])
            threat_idx = int(df.iloc[idx]['threat_label'])
            label = threat_classes[threat_idx]
            
            # Map index to group names compatible with front-end store
            group = groups[threat_idx] if threat_idx < len(groups) else 'normal'
            
            # Scatter coordinates should be nicely bounded
            clusters.append({
                "id": f"c-{idx}",
                "label": label,
                "x": round(x_coord, 3),
                "y": round(y_coord, 3),
                "group": group,
                "size": float(5 + abs(x_coord) * 2 + abs(y_coord) * 2) # Size based on distance from origin
            })
        return clusters
        
    except Exception as e:
        print(f"Error in clustering pipeline: {e}. Returning mock clusters.")
        return get_mock_clusters()

def get_mock_clusters() -> List[Dict[str, Any]]:
    # Fallback mock dataset compatible with frontend
    np.random.seed(42)
    groups = ['ddos', 'malware', 'brute-force', 'port-scan', 'insider']
    labels = ['DDoS', 'Malware', 'Brute Force', 'Port Scan', 'Insider Anomaly']
    clusters = []
    
    # 18 DDoS
    for i in range(18):
        clusters.append({
            "id": f"d{i}",
            "label": "DDoS",
            "x": float(-3 + np.random.randn() * 0.8),
            "y": float(2 + np.random.randn() * 0.8),
            "group": "ddos",
            "size": float(5 + np.random.uniform(5, 15))
        })
    # 15 Malware
    for i in range(15):
        clusters.append({
            "id": f"m{i}",
            "label": "Malware",
            "x": float(3 + np.random.randn() * 0.8),
            "y": float(2 + np.random.randn() * 0.8),
            "group": "malware",
            "size": float(5 + np.random.uniform(5, 17))
        })
    # 12 Brute force
    for i in range(12):
        clusters.append({
            "id": f"b{i}",
            "label": "Brute Force",
            "x": float(-3 + np.random.randn() * 0.8),
            "y": float(-2 + np.random.randn() * 0.8),
            "group": "brute-force",
            "size": float(4 + np.random.uniform(4, 12))
        })
    # 10 Port scan
    for i in range(10):
        clusters.append({
            "id": f"p{i}",
            "label": "Port Scan",
            "x": float(3 + np.random.randn() * 0.8),
            "y": float(-2 + np.random.randn() * 0.8),
            "group": "port-scan",
            "size": float(3 + np.random.uniform(3, 9))
        })
    # 8 Insider
    for i in range(8):
        clusters.append({
            "id": f"ins{i}",
            "label": "Insider",
            "x": float(0 + np.random.randn() * 0.5),
            "y": float(0 + np.random.randn() * 0.5),
            "group": "insider",
            "size": float(4 + np.random.uniform(4, 13))
        })
    return clusters
