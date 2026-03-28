"""
Health AI Platform - Sleep Analyzer Model
Analyzes sleep patterns and provides insights
"""

from typing import Dict, Any, List
from datetime import datetime


class SleepAnalyzer:
    """
    Sleep analysis model that evaluates sleep quality and provides recommendations
    """
    
    version = "1.0.0"
    
    def __init__(self):
        self.model_loaded = False
        self._load_model()
    
    def _load_model(self):
        """Load or initialize the sleep analysis model"""
        # In production: load pre-trained model
        self.model_loaded = True
    
    def analyze(self, sleep_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze sleep data and provide insights
        
        Args:
            sleep_data: Dictionary containing sleep metrics
            
        Returns:
            Dictionary with quality_rating, score, insights, recommendations
        """
        if not self.model_loaded:
            raise RuntimeError("Model not loaded")
        
        duration = sleep_data.get('duration_hours', 7)
        quality_score = sleep_data.get('quality_score')
        deep_sleep = sleep_data.get('deep_sleep_minutes', 90)
        rem_sleep = sleep_data.get('rem_sleep_minutes', 90)
        awakenings = sleep_data.get('awakenings', 2)
        
        # Calculate sleep score
        score = self._calculate_sleep_score(
            duration, quality_score, deep_sleep, rem_sleep, awakenings
        )
        
        # Determine quality rating
        quality_rating = self._get_quality_rating(score)
        
        # Generate insights
        insights = self._generate_insights(
            duration, deep_sleep, rem_sleep, awakenings
        )
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            duration, deep_sleep, rem_sleep, awakenings
        )
        
        return {
            "quality_rating": quality_rating,
            "score": round(score, 2),
            "insights": insights,
            "recommendations": recommendations
        }
    
    def _calculate_sleep_score(self, duration: float, quality_score: float,
                               deep_sleep: int, rem_sleep: int, 
                               awakenings: int) -> float:
        """Calculate overall sleep score (0-100)"""
        score = 0.0
        
        # Duration scoring (optimal: 7-9 hours)
        if 7 <= duration <= 9:
            score += 30
        elif 6 <= duration < 7 or 9 < duration <= 10:
            score += 20
        elif 5 <= duration < 6 or 10 < duration <= 11:
            score += 10
        else:
            score += 5
        
        # Quality score (if provided)
        if quality_score is not None:
            score += (quality_score / 100) * 25
        else:
            score += 15  # Default if not provided
        
        # Deep sleep scoring (optimal: 90-120 minutes)
        if 90 <= deep_sleep <= 120:
            score += 20
        elif 60 <= deep_sleep < 90 or 120 < deep_sleep <= 150:
            score += 15
        else:
            score += 8
        
        # REM sleep scoring (optimal: 90-120 minutes)
        if 90 <= rem_sleep <= 120:
            score += 15
        elif 60 <= rem_sleep < 90 or 120 < rem_sleep <= 150:
            score += 10
        else:
            score += 5
        
        # Awakenings scoring (fewer is better)
        if awakenings == 0:
            score += 10
        elif awakenings <= 2:
            score += 8
        elif awakenings <= 4:
            score += 5
        else:
            score += 2
        
        return min(100, max(0, score))
    
    def _get_quality_rating(self, score: float) -> str:
        """Convert score to quality rating"""
        if score >= 90:
            return "Excellent"
        elif score >= 75:
            return "Good"
        elif score >= 60:
            return "Fair"
        elif score >= 40:
            return "Poor"
        else:
            return "Very Poor"
    
    def _generate_insights(self, duration: float, deep_sleep: int,
                          rem_sleep: int, awakenings: int) -> List[str]:
        """Generate sleep insights based on metrics"""
        insights = []
        
        # Duration insights
        if duration < 6:
            insights.append("You're getting significantly less sleep than recommended")
        elif duration < 7:
            insights.append("Your sleep duration is slightly below optimal")
        elif duration > 9:
            insights.append("You're sleeping longer than average")
        else:
            insights.append("Your sleep duration is within the healthy range")
        
        # Deep sleep insights
        if deep_sleep < 60:
            insights.append("Low deep sleep may affect physical recovery")
        elif deep_sleep > 150:
            insights.append("High deep sleep indicates good physical restoration")
        
        # REM sleep insights
        if rem_sleep < 60:
            insights.append("Low REM sleep may impact memory and mood")
        elif rem_sleep > 150:
            insights.append("Good REM sleep supports cognitive function")
        
        # Awakenings insights
        if awakenings > 4:
            insights.append("Frequent awakenings may indicate sleep disruption")
        elif awakenings > 2:
            insights.append("Moderate awakenings are normal but could be improved")
        
        return insights
    
    def _generate_recommendations(self, duration: float, deep_sleep: int,
                                  rem_sleep: int, awakenings: int) -> List[str]:
        """Generate personalized sleep recommendations"""
        recommendations = []
        
        if duration < 7:
            recommendations.append("Try to go to bed 30 minutes earlier each night")
            recommendations.append("Establish a consistent sleep schedule")
        
        if duration > 9:
            recommendations.append("Consider setting a consistent wake-up time")
        
        if deep_sleep < 90:
            recommendations.append("Exercise regularly to improve deep sleep")
            recommendations.append("Avoid caffeine after 2 PM")
        
        if rem_sleep < 90:
            recommendations.append("Reduce stress through meditation or relaxation")
            recommendations.append("Limit alcohol consumption before bed")
        
        if awakenings > 2:
            recommendations.append("Keep your bedroom cool and dark")
            recommendations.append("Avoid screens 1 hour before bedtime")
            recommendations.append("Consider white noise or earplugs")
        
        # General recommendations if few specific ones
        if len(recommendations) < 3:
            recommendations.append("Maintain a regular sleep-wake cycle")
            recommendations.append("Create a relaxing bedtime routine")
            recommendations.append("Optimize your sleep environment")
        
        return recommendations[:5]
    
    def track_sleep_trend(self, sleep_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze sleep trends over time
        
        Args:
            sleep_history: List of historical sleep data
            
        Returns:
            Dictionary with trend analysis
        """
        if not sleep_history:
            return {"error": "No sleep history provided"}
        
        total_days = len(sleep_history)
        avg_duration = sum(d.get('duration_hours', 7) for d in sleep_history) / total_days
        avg_score = sum(
            self.analyze(d)['score'] for d in sleep_history
        ) / total_days
        
        # Determine trend
        if len(sleep_history) >= 7:
            recent_week = sleep_history[-7:]
            previous_week = sleep_history[:-7][:7]
            
            recent_avg = sum(self.analyze(d)['score'] for d in recent_week) / len(recent_week)
            prev_avg = sum(self.analyze(d)['score'] for d in previous_week) / len(previous_week)
            
            if recent_avg > prev_avg + 5:
                trend = "improving"
            elif recent_avg < prev_avg - 5:
                trend = "declining"
            else:
                trend = "stable"
        else:
            trend = "insufficient_data"
        
        return {
            "total_days": total_days,
            "avg_duration_hours": round(avg_duration, 2),
            "avg_score": round(avg_score, 2),
            "trend": trend
        }