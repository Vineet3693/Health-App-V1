"""
Health AI Platform - ML Service API Routes
Defines all API endpoints for ML predictions and insights
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import logging

from models.health_predictor import HealthPredictor
from models.food_recognition import FoodRecognizer
from models.sleep_analyzer import SleepAnalyzer
from models.recommendation_engine import RecommendationEngine
from utils.feature_extractor import FeatureExtractor
from utils.data_loader import DataLoader

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize models (in production, load pre-trained models)
health_predictor = HealthPredictor()
food_recognizer = FoodRecognizer()
sleep_analyzer = SleepAnalyzer()
recommendation_engine = RecommendationEngine()
feature_extractor = FeatureExtractor()


# Request/Response Models
class HealthDataInput(BaseModel):
    age: int = Field(..., ge=0, le=120)
    gender: str = Field(..., pattern="^(male|female|other)$")
    weight: float = Field(..., gt=0)
    height: float = Field(..., gt=0)
    heart_rate: Optional[int] = Field(None, ge=30, le=250)
    blood_pressure_systolic: Optional[int] = Field(None, ge=70, le=250)
    blood_pressure_diastolic: Optional[int] = Field(None, ge=40, le=150)
    steps: Optional[int] = Field(None, ge=0)
    sleep_hours: Optional[float] = Field(None, ge=0, le=24)
    calories_intake: Optional[int] = Field(None, ge=0)


class HealthPredictionResponse(BaseModel):
    health_score: float
    risk_factors: List[str]
    recommendations: List[str]
    predicted_conditions: List[Dict[str, Any]]


class FoodImageResponse(BaseModel):
    food_name: str
    confidence: float
    calories: int
    nutrients: Dict[str, float]
    serving_size: str


class SleepDataInput(BaseModel):
    duration_hours: float
    quality_score: Optional[float] = None
    deep_sleep_minutes: Optional[int] = None
    rem_sleep_minutes: Optional[int] = None
    awakenings: Optional[int] = None


class SleepAnalysisResponse(BaseModel):
    quality_rating: str
    score: float
    insights: List[str]
    recommendations: List[str]


class RecommendationRequest(BaseModel):
    user_id: str
    preferences: Optional[Dict[str, Any]] = None
    health_goals: Optional[List[str]] = None
    dietary_restrictions: Optional[List[str]] = None


class RecommendationResponse(BaseModel):
    workouts: List[Dict[str, Any]]
    meals: List[Dict[str, Any]]
    health_tips: List[str]


# Endpoints
@router.post("/predict/health", response_model=HealthPredictionResponse)
async def predict_health(data: HealthDataInput):
    """
    Predict health score and potential risks based on user vitals
    """
    try:
        features = feature_extractor.extract_health_features(data.dict())
        prediction = health_predictor.predict(features)
        
        return HealthPredictionResponse(
            health_score=prediction["health_score"],
            risk_factors=prediction["risk_factors"],
            recommendations=prediction["recommendations"],
            predicted_conditions=prediction["conditions"]
        )
    except Exception as e:
        logger.error(f"Health prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process health prediction")


@router.post("/recognize/food")
async def recognize_food(file: UploadFile = File(...)):
    """
    Recognize food from uploaded image and provide nutritional information
    """
    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        contents = await file.read()
        result = food_recognizer.recognize(contents)
        
        return FoodImageResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Food recognition error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to recognize food")


@router.post("/analyze/sleep", response_model=SleepAnalysisResponse)
async def analyze_sleep(data: SleepDataInput):
    """
    Analyze sleep patterns and provide insights
    """
    try:
        analysis = sleep_analyzer.analyze(data.dict())
        
        return SleepAnalysisResponse(
            quality_rating=analysis["quality_rating"],
            score=analysis["score"],
            insights=analysis["insights"],
            recommendations=analysis["recommendations"]
        )
    except Exception as e:
        logger.error(f"Sleep analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to analyze sleep data")


@router.post("/recommend", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    """
    Get personalized workout, meal, and health recommendations
    """
    try:
        recommendations = recommendation_engine.generate(
            user_id=request.user_id,
            preferences=request.preferences or {},
            health_goals=request.health_goals or [],
            dietary_restrictions=request.dietary_restrictions or []
        )
        
        return RecommendationResponse(**recommendations)
    except Exception as e:
        logger.error(f"Recommendation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate recommendations")


@router.get("/models/status")
async def get_models_status():
    """
    Get status of all ML models
    """
    return {
        "health_predictor": {"status": "loaded", "version": health_predictor.version},
        "food_recognizer": {"status": "loaded", "version": food_recognizer.version},
        "sleep_analyzer": {"status": "loaded", "version": sleep_analyzer.version},
        "recommendation_engine": {"status": "loaded", "version": recommendation_engine.version}
    }


@router.post("/batch/predict")
async def batch_predict(data: List[HealthDataInput]):
    """
    Batch prediction for multiple users
    """
    try:
        results = []
        for item in data:
            features = feature_extractor.extract_health_features(item.dict())
            prediction = health_predictor.predict(features)
            results.append({
                "input": item.dict(),
                "prediction": prediction
            })
        return {"results": results, "count": len(results)}
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process batch predictions")