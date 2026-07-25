from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from pydantic import BaseModel
from typing import List
from datetime import datetime, timedelta
import bcrypt
import models
from database import engine, SessionLocal

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="LOGYM API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- GÜVENLİK VE JWT AYARLARI ---
SECRET_KEY = "logym-gizli-anahtar-degistirilecek"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Böyle bir kullanıcı doğrulanamadı",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

# --- PYDANTIC ŞEMALARI ---
class UserCreate(BaseModel):
    username: str
    password: str

class SetDetailBase(BaseModel):
    set_number: int
    reps: int
    weight: float

class ExerciseBase(BaseModel):
    name: str
    sets_data: List[SetDetailBase]

class WorkoutCreate(BaseModel):
    cardType: str
    date: str
    workoutData: List[ExerciseBase]

class SetResponse(BaseModel):
    set_number: int
    reps: int
    weight: float
    class Config:
        from_attributes = True

class ExerciseResponse(BaseModel):
    name: str
    sets_data: List[SetResponse]
    class Config:
        from_attributes = True

class WorkoutResponse(BaseModel):
    id: int
    card_type: str
    date: datetime
    exercises: List[ExerciseResponse]
    class Config:
        from_attributes = True

# --- API UÇ NOKTALARI ---

@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Bu kullanıcı adı zaten alınmış.")
    
    hashed_password = get_password_hash(user.password)
    new_user = models.User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    return {"message": "Kullanıcı başarıyla oluşturuldu"}

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Kullanıcı adı veya şifre hatalı")
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/workouts")
def create_workout(workout: WorkoutCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_workout = models.Workout(card_type=workout.cardType, user_id=current_user.id)
    db.add(db_workout)
    db.commit()
    db.refresh(db_workout)

    for ex in workout.workoutData:
        db_exercise = models.Exercise(workout_id=db_workout.id, name=ex.name)
        db.add(db_exercise)
        db.commit()
        db.refresh(db_exercise)
        
        for s in ex.sets_data:
            db_set = models.ExerciseSet(
                exercise_id=db_exercise.id,
                set_number=s.set_number,
                reps=s.reps,
                weight=s.weight
            )
            db.add(db_set)
    
    db.commit()
    return {"message": "Başarılı"}

@app.get("/workouts/history", response_model=List[WorkoutResponse])
def get_workout_history(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Workout).filter(models.Workout.user_id == current_user.id).order_by(models.Workout.date.desc()).all()