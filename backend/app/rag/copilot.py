import os
import logging
from typing import List, Dict
from app.rag.vector_store import retrieve_context

logger = logging.getLogger("cyberguard-copilot")

# Check Groq configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
MODEL_NAME = os.getenv("LLM_MODEL", "llama3-8b-8192")

async def query_copilot(message: str, history: List[Dict[str, str]]) -> str:
    """
    RAG Copilot:
    1. Retrieve context from vector store
    2. Format prompt with context and history
    3. Query Groq Llama 3 (or fallback to expert rules)
    """
    context = retrieve_context(message)
    
    if not GROQ_API_KEY:
        logger.info("GROQ_API_KEY not found. Using local security expert rule-engine response.")
        return generate_offline_response(message, context)
        
    try:
        from langchain_groq import ChatGroq
        from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
        from langchain_core.messages import HumanMessage, AIMessage
        
        chat = ChatGroq(
            temperature=0.2,
            groq_api_key=GROQ_API_KEY,
            model_name=MODEL_NAME
        )
        
        # Build prompt
        system_prompt = (
            "You are CyberGuard AI Copilot, a senior security operations center (SOC) analyst.\n"
            "Use the provided mitigation playbooks context to answer the user's questions.\n"
            "Keep answers technical, action-oriented, and structured in Markdown.\n\n"
            f"--- PLAYBOOK CONTEXT ---\n{context}\n------------------------\n\n"
            "If the context does not contain relevant information, use your internal security knowledge base."
        )
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}")
        ])
        
        # Format history
        langchain_history = []
        for h in history[-6:]: # Include last 6 messages
            if h["role"] == "user":
                langchain_history.append(HumanMessage(content=h["content"]))
            else:
                langchain_history.append(AIMessage(content=h["content"]))
                
        chain = prompt | chat
        response = await chain.ainvoke({
            "input": message,
            "chat_history": langchain_history
        })
        
        return response.content

    except Exception as e:
        logger.error(f"Error querying Groq Chat model: {e}. Falling back to offline model.")
        return generate_offline_response(message, context)

def generate_offline_response(message: str, context: str) -> str:
    """
    Expert rules system to simulate RAG chatbot responses.
    """
    lower = message.toLowerCase() if hasattr(message, 'toLowerCase') else message.lower()
    
    # Simple templates based on threat categories
    if "ddos" in lower or "volumetric" in lower or "udp flood" in lower:
        return (
            f"### DDoS Attack Mitigation Guide 🛡️\n\n"
            f"Based on the query and the **DDoS Mitigation Playbook** context:\n\n"
            f"1. **Isolate Source**: Deploy edge firewall rule to block `{extract_ip(message) or 'attacker source'}`.\n"
            f"2. **Border Rate Limiting**: Limit traffic rates at boundary switches to 1000 pps.\n"
            f"3. **Upstream Defenses**: Reroute traffic via BGP blackholing to scrub bad packets upstream.\n"
            f"4. **Load Balancer**: Enable syn-cookies and drop connections matching signature parameters.\n\n"
            f"**Playbook Reference Context:**\n> {context.splitlines()[1] if len(context.splitlines()) > 1 else context}"
        )
    elif "malware" in lower or "ransomware" in lower or "virus" in lower or "executable" in lower:
        return (
            f"### Malware Incident Response Plan 🦠\n\n"
            f"Based on the **Malware Containment Playbook**:\n\n"
            f"1. **Contain Host**: Disconnect the affected server/endpoint immediately to prevent lateral traversal.\n"
            f"2. **Process Termination**: Run `taskkill /F` or equivalent on suspicious files and parent command prompts.\n"
            f"3. **Forensics**: Dump physical memory (RAM) using FTK Imager before shutdown.\n"
            f"4. **Clean**: Execute enterprise scans and verify file hash integrity.\n\n"
            f"**Playbook Reference Context:**\n> {context.splitlines()[1] if len(context.splitlines()) > 1 else context}"
        )
    elif "brute force" in lower or "ssh" in lower or "rdp" in lower or "failed login" in lower:
        return (
            f"### Brute Force Counter-Measures 🔑\n\n"
            f"Based on our active playbooks:\n\n"
            f"1. **IP Lockout**: Lock target IP addressing at the edge after 5 failed authentication challenges.\n"
            f"2. **Configuration**: Enforce SSH Key Authentication and restrict password access.\n"
            f"3. **Account Isolation**: Lock affected user accounts temporarily until credentials reset.\n"
            f"4. **Port Forwarding**: Disable generic port forward definitions on perimeter policies.\n\n"
            f"**Context details:**\n{context}"
        )
    elif "scan" in lower or "recon" in lower or "port" in lower:
        return (
            f"### Reconnaissance and Port Scan Action Plan 🔍\n\n"
            f"Reconnaissance detected. Action steps:\n\n"
            f"1. **Block scanner**: Add the scanning IP address to block-all lists at the gateway firewall.\n"
            f"2. **Audit open ports**: Run a local netstat check to ensure only approved ports are exposed.\n"
            f"3. **Log review**: Analyze web logs for directory enumeration payloads (e.g. dirbuster scans).\n\n"
            f"**Context info:**\n{context}"
        )
    else:
        return (
            f"### CyberGuard AI Analyst Response 🤖\n\n"
            f"Greetings. I am here to help you coordinate incident investigations.\n\n"
            f"I have queried our local **Cybersecurity Playbooks vector database**. Here is a relevant excerpt:\n\n"
            f"```text\n{context}\n```\n\n"
            f"How can I help you further? Please specify if you want to mitigate a **DDoS**, **Malware**, **Brute Force**, or **Port Scan** event."
        )

def extract_ip(text: str) -> str:
    import re
    ips = re.findall(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b', text)
    return ips[0] if ips else ""
