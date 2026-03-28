"""
Health AI Platform - Health Predictor Model
Predicts health scores and potential risk factors
"""

import random
from typing import Dict, Any, List


class HealthPredictor:
    """
    Health prediction model that analyzes user vitals and lifestyle data
    to predict health scores and identify risk factors.
    """
    
    version = "1.0.0"
    
    def __init__(self):
        self.model_loaded = False
        # In production, load pre-trained model here
        self._load_model()
    
    def _load_model(self):
        """Load or initialize the health prediction model"""
        # Placeholder for model loading
        # In production: self.model = joblib.load('models/health_predictor.pkl')
        self.model_loaded = True
    
    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict health score and risk factors based on input features
        
        Args:
            features: Dictionary containing user health data
            
        Returns:
            Dictionary with health_score, risk_factors, recommendations, and conditions
        """
        if not self.model_loaded:
            raise RuntimeError("Model not loaded")
        
        # Calculate health score (in production, use actual model prediction)
        health_score = self._calculate_health_score(features)
        
        # Identify risk factors
        risk_factors = self._identify_risk_factors(features)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(features, risk_factors)
        
        # Predict potential conditions
        conditions = self._predict_conditions(features)
        
        return {
            "health_score": round(health_score, 2),
            "risk_factors": risk_factors,
            "recommendations": recommendations,
            "conditions": conditions
        }
    
    def _calculate_health_score(self, features: Dict[str, Any]) -> float:
        """Calculate overall health score (0-100)"""
        score = 100.0
        
        # Age factor (slight decrease with age)
        age = features.get('age', 30)
        if age > 50:
            score -= min((age - 50) * 0.3, 10)
        
        # BMI factor
        weight = features.get('weight', 70)
        height = features.get('height', 1.7)
        bmi = weight / (height ** 2)
        
        if bmi < 18.5 or bmi > 30:
            score -= abs(bmi - 22) * 2
        elif bmi > 25:
            score -= (bmi - 25) * 1.5
        
        # Heart rate factor
        heart_rate = features.get('heart_rate')
        if heart_rate:
            if heart_rate < 60 or heart_rate > 100:
                score -= min(abs(heart_rate - 80) * 0.3, 15)
        
        # Blood pressure factor
        bp_systolic = features.get('blood_pressure_systolic')
        bp_diastolic = features.get('blood_pressure_diastolic')
        if bp_systolic and bp_diastolic:
            if bp_systolic > 140 or bp_diastolic > 90:
                score -= 10
            elif bp_systolic > 120 or bp_diastolic > 80:
                score -= 5
        
        # Sleep factor
        sleep_hours = features.get('sleep_hours')
        if sleep_hours:
            if sleep_hours < 6 or sleep_hours > 9:
                score -= min(abs(sleep_hours - 7.5) * 3, 15)
        
        # Activity factor
        steps = features.get('steps')
        if steps:
            if steps < 5000:
                score -= 10
            elif steps < 10000:
                score -= 5
            elif steps > 15000:
                score += 2
        
        return max(0, min(100, score))
    
    def _identify_risk_factors(self, features: Dict[str, Any]) -> List[str]:
        """Identify potential health risk factors"""
        risks = []
        
        # BMI risks
        weight = features.get('weight', 70)
        height = features.get('height', 1.7)
        bmi = weight / (height ** 2)
        
        if bmi < 18.5:
            risks.append("Underweight")
        elif bmi > 25:
            risks.append("Overweight" if bmi < 30 else "Obese")
        
        # Heart rate risks
        heart_rate = features.get('heart_rate')
        if heart_rate:
            if heart_rate < 60:
                risks.append("Low heart rate (Bradycardia)")
            elif heart_rate > 100:
                risks.append("High heart rate (Tachycardia)")
        
        # Blood pressure risks
        bp_systolic = features.get('blood_pressure_systolic')
        bp_diastolic = features.get('blood_pressure_diastolic')
        if bp_systolic and bp_diastolic:
            if bp_systolic > 140 or bp_diastolic > 90:
                risks.append("High blood pressure (Hypertension)")
            elif bp_systolic > 120 or bp_diastolic > 80:
                risks.append("Elevated blood pressure")
        
        # Sleep risks
        sleep_hours = features.get('sleep_hours')
        if sleep_hours:
            if sleep_hours < 6:
                risks.append("Insufficient sleep")
            elif sleep_hours > 9:
                risks.append("Excessive sleep")
        
        # Activity risks
        steps = features.get('steps')
        if steps and steps < 5000:
            risks.append("Sedentary lifestyle")
        
        # Age risk
        age = features.get('age', 30)
        if age > 60:
            risks.append("Age-related health risks")
        
        return risks
    
    def _generate_recommendations(self, features: Dict[str, Any], 
                                   risk_factors: List[str]) -> List[str]:
        """Generate personalized health recommendations"""
        recommendations = []
        
        if "Overweight" in risk_factors or "Obese" in risk_factors:
            recommendations.append("Consider a balanced diet with reduced caloric intake")
            recommendations.append("Aim for at least 150 minutes of moderate exercise per week")
        
        if "Underweight" in risk_factors:
            recommendations.append("Increase caloric intake with nutrient-dense foods")
            recommendations.append("Include strength training to build muscle mass")
        
        if "High blood pressure (Hypertension)" in risk_factors:
            recommendations.append("Reduce sodium intake")
            recommendations.append("Practice stress management techniques")
            recommendations.append("Monitor blood pressure regularly")
        
        if "Insufficient sleep" in risk_factors:
            recommendations.append("Establish a consistent sleep schedule")
            recommendations.append("Create a relaxing bedtime routine")
            recommendations.append("Limit screen time before bed")
        
        if "Sedentary lifestyle" in risk_factors:
            recommendations.append("Start with short daily walks")
            recommendations.append("Set hourly movement reminders")
            recommendations.append("Aim for 10,000 steps per day")
        
        if "High heart rate (Tachycardia)" in risk_factors:
            recommendations.append("Practice deep breathing exercises")
            recommendations.append("Limit caffeine and stimulants")
            recommendations.append("Consult a healthcare provider if persistent")
        
        # General recommendations
        if len(recommendations) < 3:
            recommendations.append("Maintain regular health check-ups")
            recommendations.append("Stay hydrated throughout the day")
            recommendations.append("Eat a variety of fruits and vegetables")
        
        return recommendations[:5]  # Return top 5 recommendations
    
    def _predict_conditions(self, features: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Predict potential health conditions with probabilities"""
        conditions = []
        
        # Calculate probabilities based on features
        bmi = features.get('weight', 70) / (features.get('height', 1.7) ** 2)
        
        # Cardiovascular risk
        cv_risk = 0.1
        if features.get('blood_pressure_systolic', 120) > 140:
            cv_risk += 0.2
        if features.get('heart_rate', 80) > 100:
            cv_risk += 0.1
        if bmi > 30:
            cv_risk += 0.15
        
        if cv_risk > 0.15:
            conditions.append({
                "name": "Cardiovascular Disease",
                "probability": round(min(cv_risk, 0.8), 2),
                "severity": "high" if cv_risk > 0.5 else "moderate"
            })
        
        # Diabetes risk
        diabetes_risk = 0.05 + (max(0, bmi - 25) * 0.02)
        if features.get('age', 30) > 45:
            diabetes_risk += 0.1
        
        if diabetes_risk > 0.1:
            conditions.append({
                "name": "Type 2 Diabetes",
                "probability": round(min(diabetes_risk, 0.7), 2),
                "severity": "high" if diabetes_risk > 0.4 else "moderate"
            })
        
        # Sleep disorder risk
        sleep_hours = features.get('sleep_hours', 7)
        sleep_risk = 0.1 if sleep_hours < 6 or sleep_hours > 9 else 0.05
        
        if sleep_risk > 0.08:
            conditions.append({
                "name": "Sleep Disorder",
                "probability": round(sleep_risk, 2),
                "severity": "low"
            })
        
        return sorted(conditions, key=lambda x: x['probability'], reverse=True)
    
    def train(self, training_data: List[Dict[str, Any]]) -> Dict[str, float]:
        """
        Train the model with new data (placeholder for actual training)
        
        Args:
            training_data: List of training samples
            
        Returns:
            Training metrics
        """
        # In production, implement actual training logic
        return {
            "accuracy": 0.85,
            "precision": 0.82,
            "recall": 0.88,
            "f1_score": 0.85
        }