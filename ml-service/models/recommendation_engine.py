"""
Health AI Platform - Recommendation Engine
Generates personalized workout, meal, and health recommendations
"""

from typing import Dict, Any, List
import random


class RecommendationEngine:
    """
    Recommendation engine that provides personalized health suggestions
    based on user preferences, goals, and restrictions
    """
    
    version = "1.0.0"
    
    # Sample workout database
    WORKOUTS = [
        {"id": 1, "name": "Morning Yoga", "duration_min": 30, "difficulty": "beginner", "type": "flexibility"},
        {"id": 2, "name": "HIIT Cardio", "duration_min": 20, "difficulty": "intermediate", "type": "cardio"},
        {"id": 3, "name": "Strength Training", "duration_min": 45, "difficulty": "intermediate", "type": "strength"},
        {"id": 4, "name": "Walking", "duration_min": 30, "difficulty": "beginner", "type": "cardio"},
        {"id": 5, "name": "Pilates", "duration_min": 40, "difficulty": "beginner", "type": "flexibility"},
        {"id": 6, "name": "Running", "duration_min": 30, "difficulty": "intermediate", "type": "cardio"},
        {"id": 7, "name": "Weight Lifting", "duration_min": 60, "difficulty": "advanced", "type": "strength"},
        {"id": 8, "name": "Swimming", "duration_min": 45, "difficulty": "intermediate", "type": "cardio"},
    ]
    
    # Sample meal database
    MEALS = [
        {"id": 1, "name": "Oatmeal with Berries", "type": "breakfast", "calories": 350, "protein_g": 12},
        {"id": 2, "name": "Grilled Chicken Salad", "type": "lunch", "calories": 450, "protein_g": 35},
        {"id": 3, "name": "Salmon with Vegetables", "type": "dinner", "calories": 550, "protein_g": 40},
        {"id": 4, "name": "Greek Yogurt Parfait", "type": "breakfast", "calories": 300, "protein_g": 18},
        {"id": 5, "name": "Quinoa Bowl", "type": "lunch", "calories": 400, "protein_g": 15},
        {"id": 6, "name": "Turkey Wrap", "type": "dinner", "calories": 480, "protein_g": 30},
        {"id": 7, "name": "Smoothie Bowl", "type": "breakfast", "calories": 320, "protein_g": 14},
        {"id": 8, "name": "Pasta Primavera", "type": "dinner", "calories": 520, "protein_g": 18},
    ]
    
    # Health tips database
    HEALTH_TIPS = [
        "Drink at least 8 glasses of water daily",
        "Take short breaks every hour if you have a desk job",
        "Practice deep breathing for stress management",
        "Get 7-9 hours of quality sleep each night",
        "Include fruits and vegetables in every meal",
        "Stretch for 5 minutes after waking up",
        "Limit screen time before bedtime",
        "Walk at least 10,000 steps daily",
        "Practice gratitude journaling",
        "Maintain good posture throughout the day"
    ]
    
    def __init__(self):
        self.model_loaded = False
        self._load_model()
    
    def _load_model(self):
        """Load or initialize the recommendation engine"""
        self.model_loaded = True
    
    def generate(self, user_id: str, preferences: Dict[str, Any] = None,
                 health_goals: List[str] = None,
                 dietary_restrictions: List[str] = None) -> Dict[str, Any]:
        """
        Generate personalized recommendations
        
        Args:
            user_id: User identifier
            preferences: User preferences (difficulty, duration, etc.)
            health_goals: List of health goals
            dietary_restrictions: List of dietary restrictions
            
        Returns:
            Dictionary with workouts, meals, and health_tips
        """
        if not self.model_loaded:
            raise RuntimeError("Model not loaded")
        
        preferences = preferences or {}
        health_goals = health_goals or []
        dietary_restrictions = dietary_restrictions or []
        
        # Generate recommendations
        workouts = self._recommend_workouts(preferences, health_goals)
        meals = self._recommend_meals(preferences, dietary_restrictions)
        tips = self._recommend_health_tips(health_goals)
        
        return {
            "workouts": workouts,
            "meals": meals,
            "health_tips": tips
        }
    
    def _recommend_workouts(self, preferences: Dict[str, Any],
                           health_goals: List[str]) -> List[Dict[str, Any]]:
        """Recommend workouts based on preferences and goals"""
        recommended = []
        
        # Filter by difficulty if specified
        difficulty = preferences.get('difficulty')
        filtered_workouts = self.WORKOUTS
        if difficulty:
            filtered_workouts = [w for w in self.WORKOUTS if w['difficulty'] == difficulty]
        
        # Prioritize based on health goals
        if 'weight_loss' in health_goals:
            cardio_workouts = [w for w in filtered_workouts if w['type'] == 'cardio']
            recommended.extend(cardio_workouts[:2])
        
        if 'muscle_gain' in health_goals:
            strength_workouts = [w for w in filtered_workouts if w['type'] == 'strength']
            recommended.extend(strength_workouts[:2])
        
        if 'flexibility' in health_goals:
            flexibility_workouts = [w for w in filtered_workouts if w['type'] == 'flexibility']
            recommended.extend(flexibility_workouts[:2])
        
        # Fill remaining slots with random selections
        while len(recommended) < 3 and filtered_workouts:
            workout = random.choice(filtered_workouts)
            if workout not in recommended:
                recommended.append(workout)
        
        # If still empty, return some default workouts
        if not recommended:
            recommended = self.WORKOUTS[:3]
        
        return recommended[:3]
    
    def _recommend_meals(self, preferences: Dict[str, Any],
                        dietary_restrictions: List[str]) -> List[Dict[str, Any]]:
        """Recommend meals based on preferences and restrictions"""
        recommended = []
        
        filtered_meals = self.MEALS
        
        # Filter by dietary restrictions
        if 'vegetarian' in dietary_restrictions:
            # In production, would have proper vegetarian filtering
            filtered_meals = [m for m in self.MEALS if 'chicken' not in m['name'].lower() 
                             and 'turkey' not in m['name'].lower()
                             and 'salmon' not in m['name'].lower()]
        
        if 'low_protein' in dietary_restrictions:
            filtered_meals = [m for m in filtered_meals if m['protein_g'] < 25]
        
        if 'high_protein' in dietary_restrictions:
            filtered_meals = [m for m in filtered_meals if m['protein_g'] >= 25]
        
        # Get one meal from each type if possible
        for meal_type in ['breakfast', 'lunch', 'dinner']:
            type_meals = [m for m in filtered_meals if m['type'] == meal_type]
            if type_meals:
                recommended.append(random.choice(type_meals))
        
        # If we don't have enough, add more from filtered list
        while len(recommended) < 3 and filtered_meals:
            meal = random.choice(filtered_meals)
            if meal not in recommended:
                recommended.append(meal)
        
        # If still empty, return defaults
        if not recommended:
            recommended = self.MEALS[:3]
        
        return recommended[:3]
    
    def _recommend_health_tips(self, health_goals: List[str]) -> List[str]:
        """Recommend health tips based on goals"""
        tips = []
        
        # Select tips relevant to goals
        goal_keywords = {
            'weight_loss': ['water', 'walk', 'screen'],
            'stress_management': ['breathing', 'gratitude', 'sleep'],
            'general_health': ['fruits', 'vegetables', 'posture', 'stretch']
        }
        
        for goal in health_goals:
            if goal in goal_keywords:
                keywords = goal_keywords[goal]
                for tip in self.HEALTH_TIPS:
                    if any(kw in tip.lower() for kw in keywords):
                        if tip not in tips:
                            tips.append(tip)
        
        # Fill remaining with general tips
        for tip in self.HEALTH_TIPS:
            if tip not in tips:
                tips.append(tip)
            if len(tips) >= 5:
                break
        
        return tips[:5]
    
    def get_workout_plan(self, days_per_week: int = 5,
                        difficulty: str = 'intermediate') -> List[Dict[str, Any]]:
        """Generate a weekly workout plan"""
        plan = []
        
        for day in range(days_per_week):
            workout = random.choice([w for w in self.WORKOUTS if w['difficulty'] == difficulty])
            plan.append({
                "day": day + 1,
                "workout": workout
            })
        
        return plan
    
    def get_meal_plan(self, days: int = 7,
                     dietary_restrictions: List[str] = None) -> List[Dict[str, Any]]:
        """Generate a meal plan for specified days"""
        dietary_restrictions = dietary_restrictions or []
        plan = []
        
        for day in range(days):
            day_meals = self._recommend_meals({}, dietary_restrictions)
            plan.append({
                "day": day + 1,
                "meals": day_meals
            })
        
        return plan