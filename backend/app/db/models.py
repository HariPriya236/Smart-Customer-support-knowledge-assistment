import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base

def generate_uuid():
    return str(uuid.uuid4())

class DBUser(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="Support Agent") # Admin, Support Agent, Viewer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DBDocument(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=False)
    doc_category = Column(String(100), default="General Knowledge")
    chunk_count = Column(Integer, default=0)
    status = Column(String(50), default="processed")
    uploaded_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class DBQuery(Base):
    __tablename__ = "queries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    original_query = Column(Text, nullable=False)
    optimized_query = Column(Text, nullable=True)
    detected_category = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    responses = relationship("DBResponse", back_populates="query", cascade="all, delete-orphan")

class DBResponse(Base):
    __tablename__ = "responses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    query_id = Column(String(36), ForeignKey("queries.id", ondelete="CASCADE"), nullable=False)
    llm_provider = Column(String(50), nullable=False)
    generated_answer = Column(Text, nullable=False)
    confidence_score = Column(Float, default=0.0)
    is_escalated = Column(Boolean, default=False)
    escalation_reason = Column(Text, nullable=True)
    citations = Column(JSON, default=list)
    agent_trace = Column(JSON, default=list)
    execution_time_ms = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    query = relationship("DBQuery", back_populates="responses")
    feedback = relationship("DBFeedback", back_populates="response", cascade="all, delete-orphan")

class DBFeedback(Base):
    __tablename__ = "feedback"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    response_id = Column(String(36), ForeignKey("responses.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    rating = Column(Integer, nullable=True)
    is_helpful = Column(Boolean, nullable=True)
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    response = relationship("DBResponse", back_populates="feedback")

class DBAnalytics(Base):
    __tablename__ = "analytics"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    metric_date = Column(DateTime, default=datetime.utcnow)
    total_queries = Column(Integer, default=0)
    avg_confidence = Column(Float, default=0.0)
    escalation_rate = Column(Float, default=0.0)
    avg_response_time_ms = Column(Float, default=0.0)
    satisfaction_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
