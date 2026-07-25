from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    workouts = relationship("Workout", back_populates="owner", cascade="all, delete-orphan")

class Workout(Base):
    __tablename__ = "workouts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id")) # YENİ EKLENDİ
    card_type = Column(String, index=True)
    date = Column(DateTime, default=datetime.now)
    
    owner = relationship("User", back_populates="workouts") # YENİ EKLENDİ
    exercises = relationship("Exercise", back_populates="workout", cascade="all, delete-orphan")

class Exercise(Base):
    __tablename__ = "exercises"
    id = Column(Integer, primary_key=True, index=True)
    workout_id = Column(Integer, ForeignKey("workouts.id"))
    name = Column(String, index=True)
    
    workout = relationship("Workout", back_populates="exercises")
    sets_data = relationship("ExerciseSet", back_populates="exercise", cascade="all, delete-orphan")

class ExerciseSet(Base):
    __tablename__ = "exercise_sets"
    id = Column(Integer, primary_key=True, index=True)
    exercise_id = Column(Integer, ForeignKey("exercises.id"))
    set_number = Column(Integer)
    reps = Column(Integer, default=0)
    weight = Column(Float, default=0.0)
    
    exercise = relationship("Exercise", back_populates="sets_data")