import os
import logging

logger = logging.getLogger("cyberguard-rag")

# Seed data for RAG knowledge base
PLAYBOOKS = [
    {
        "title": "DDoS Mitigation Protocol",
        "content": "To mitigate DDoS attacks (especially UDP floods): First, enable BGP flowspec or blackholing for the attacking IP. Next, adjust upstream edge rate limits. Set connection thresholds at the load balancer (e.g. NGINX rate limiting). Route traffic through an enterprise CDN or DDoS scrubbing center (e.g. Cloudflare).",
        "metadata": {"type": "playbook", "threat": "DDoS"}
    },
    {
        "title": "Brute Force SSH/RDP Defense",
        "content": "When detecting brute force attempts on SSH/RDP: Enable Fail2Ban with a threshold of 5 failed attempts in 10 minutes. Change default ports (22 to custom high ports). Disable root password login, forcing SSH keys. Deploy Multi-Factor Authentication (MFA). Null-route persistent malicious source IPs.",
        "metadata": {"type": "playbook", "threat": "Brute Force"}
    },
    {
        "title": "Malware Containment and Cleanup",
        "content": "For malware and ransomware alerts: Isolate the affected host endpoint from the LAN network immediately (disconnect Ethernet/Wi-Fi or disable port on switch). Perform a memory dump for forensic analysis. Terminate malicious parent processes (e.g. PowerShell/script processes). Run full enterprise endpoint scanner (EDR) and restore files from isolated backups.",
        "metadata": {"type": "playbook", "threat": "Malware"}
    },
    {
        "title": "Port Scanning Anomaly Action Plan",
        "content": "Port scan activity indicates target reconnaissance. Inspect perimeter firewalls and close unused ports. Ensure IDS/IPS systems are in blocking mode for the scanning IP. Update firewall access lists to reject the source subnet. Monitor subsequent connections for targeted brute force or exploit payloads.",
        "metadata": {"type": "playbook", "threat": "Port Scan"}
    },
    {
        "title": "Unauthorized Access and Privilege Escalation",
        "content": "On unauthorized access detection: Immediately invalidate all active sessions for the compromised user account. Lock the account credentials. Check IAM policies for unauthorized modifications. Enable strict audit logging. Review IP access records to verify source. Enforce global password reset and MFA.",
        "metadata": {"type": "playbook", "threat": "Unauthorized Access"}
    }
]

class FallbackRetriever:
    """Fast, offline keyword-matching retriever fallback."""
    def __init__(self, documents):
        self.documents = documents

    def retrieve(self, query: str, limit: int = 2) -> list:
        query_words = query.lower().split()
        scored_docs = []
        for doc in self.documents:
            score = 0
            text = (doc["title"] + " " + doc["content"]).lower()
            for word in query_words:
                if word in text:
                    score += 1
            if score > 0:
                scored_docs.append((score, doc))
        
        # Sort by score descending
        scored_docs.sort(key=lambda x: x[0], reverse=True)
        results = [doc for score, doc in scored_docs[:limit]]
        if not results:
            # Return general playbooks if no keyword match
            results = self.documents[:limit]
        return results

# Globals for vector db
vector_store = None
fallback_retriever = FallbackRetriever(PLAYBOOKS)
use_fallback = True

# Try to initialize ChromaDB
try:
    import chromadb
    from chromadb.config import Settings
    from langchain_community.vectorstores import Chroma
    from langchain_huggingface import HuggingFaceEmbeddings
    
    CHROMA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "chromadb")
    os.makedirs(CHROMA_DIR, exist_ok=True)
    
    # Initialize embeddings (HuggingFace all-MiniLM-L6-v2)
    # Cache locally to prevent repeated downloads
    logger.info("Initializing HuggingFaceEmbeddings...")
    embeddings = HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2",
        model_kwargs={'device': 'cpu'}
    )
    
    # Init Chroma Client
    chroma_client = chromadb.PersistentClient(path=CHROMA_DIR)
    
    # Populate documents into Chroma
    texts = [doc["content"] for doc in PLAYBOOKS]
    metadatas = [doc["metadata"] for doc in PLAYBOOKS]
    ids = [f"playbook-{i}" for i in range(len(PLAYBOOKS))]
    
    vector_store = Chroma.from_texts(
        texts=texts,
        embedding=embeddings,
        metadatas=metadatas,
        ids=ids,
        persist_directory=CHROMA_DIR
    )
    logger.info("ChromaDB vector store seeded successfully.")
    use_fallback = False

except Exception as e:
    logger.warning(f"Could not initialize ChromaDB/SentenceTransformers ({e}). Using offline hybrid keyword fallback retriever!")
    use_fallback = True

def retrieve_context(query: str) -> str:
    """
    Retrieves relevant playbook logs to inject as RAG context.
    """
    if use_fallback or vector_store is None:
        docs = fallback_retriever.retrieve(query)
        context = "\n\n".join([f"Source: {d['title']}\n{d['content']}" for d in docs])
        return context
    try:
        results = vector_store.similarity_search(query, k=2)
        context = "\n\n".join([f"Source: RAG Document\n{r.page_content}" for r in results])
        return context
    except Exception as e:
        logger.warning(f"Error searching ChromaDB: {e}")
        docs = fallback_retriever.retrieve(query)
        context = "\n\n".join([f"Source: {d['title']}\n{d['content']}" for d in docs])
        return context
