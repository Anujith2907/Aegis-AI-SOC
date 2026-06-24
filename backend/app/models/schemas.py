from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any

# ===== AUTH SCHEMAS =====
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: Optional[str] = "analyst"  # admin, analyst, viewer

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    createdAt: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

# ===== THREATS AND INCIDENTS SCHEMAS =====
class TimelineEvent(BaseModel):
    time: str
    event: str
    type: str  # info, warning, critical

class ShapFeature(BaseModel):
    feature: str
    value: float
    impact: float
    description: str

class SimilarIncident(BaseModel):
    id: str
    title: str
    threatType: str
    severity: str
    similarity: float
    resolutionMethod: str
    recoveryDuration: str
    successRate: float
    date: str

class ThreatDetectionResult(BaseModel):
    id: str
    threatType: str
    confidence: float
    severity: str
    riskScore: float
    affectedAssets: List[str]
    timestamp: str
    sourceIP: str
    destinationIP: str
    protocol: str
    bytesTransferred: int
    duration: int
    attackTimeline: List[TimelineEvent]
    businessImpact: str
    priorityLevel: int

class RootCauseAnalysis(BaseModel):
    summary: str
    shapFeatures: List[ShapFeature]
    decisionPath: List[str]
    investigationInsights: List[str]

class ThreatCluster(BaseModel):
    id: str
    label: str
    x: float
    y: float
    group: str
    size: float

class IncidentCreate(BaseModel):
    title: str
    threatType: str
    severity: str
    sourceIP: str
    affectedSystems: int
    riskScore: float

class IncidentResponse(BaseModel):
    id: str
    title: str
    threatType: str
    severity: str
    status: str  # open, investigating, contained, resolved
    timestamp: str
    sourceIP: str
    affectedSystems: int
    assignedTo: Optional[str] = None
    riskScore: float

# ===== COPILOT SCHEMAS =====
class MessageHistoryItem(BaseModel):
    role: str  # user, assistant
    content: str

class CopilotChatRequest(BaseModel):
    message: str
    history: List[MessageHistoryItem]

class CopilotChatResponse(BaseModel):
    response: str
    timestamp: str

# ===== RESPONSE SCHEMAS =====
class ResponseTriggerRequest(BaseModel):
    incidentId: str
    actions: List[str]

class ActionStatus(BaseModel):
    id: str
    type: str
    status: str  # pending, running, completed, failed
    description: str
    timestamp: str

class ResponseTriggerResponse(BaseModel):
    incidentId: str
    status: str
    actionsExecuted: List[ActionStatus]

# ===== REPORTS SCHEMAS =====
class ReportGenerateRequest(BaseModel):
    incidentId: str
    type: str  # executive, technical, forensic

class ReportGenerateResponse(BaseModel):
    id: str
    title: str
    generatedAt: str
    executiveSummary: str
    incidentTimeline: str
    rootCauseAnalysis: str
    impactAssessment: str
    mitigationPlan: str
    preventionStrategy: str
