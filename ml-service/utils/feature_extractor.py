"""
Health AI Platform - Feature Extractor
Extracts and processes features from raw health data
"""

from typing import Dict, Any, List
import math


class FeatureExtractor:
    """
    Feature extraction utilities for health data preprocessing
    """
    
    def __init__(self):
        pass
    
    def extract_health_features(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract features from health data
        
        Args:
            data: Raw health data dictionary
            
        Returns:
            Dictionary with extracted features
        """
        features = {}
        
        # Basic demographics
        features['age'] = data.get('age', 30)
        features['gender'] = self._encode_gender(data.get('gender', 'other'))
        
        # Physical metrics
        weight = data.get('weight', 70)
        height = data.get('height', 1.7)
        features['weight'] = weight
        features['height'] = height
        features['bmi'] = self._calculate_bmi(weight, height)
        features['bmi_category'] = self._categorize_bmi(features['bmi'])
        
        # Vital signs
        features['heart_rate'] = data.get('heart_rate')
        features['blood_pressure_systolic'] = data.get('blood_pressure_systolic')
        features['blood_pressure_diastolic'] = data.get('blood_pressure_diastolic')
        
        if features['blood_pressure_systolic'] and features['blood_pressure_diastolic']:
            features['mean_arterial_pressure'] = self._calculate_map(
                features['blood_pressure_systolic'],
                features['blood_pressure_diastolic']
            )
            features['pulse_pressure'] = (
                features['blood_pressure_systolic'] - 
                features['blood_pressure_diastolic']
            )
        
        # Lifestyle metrics
        features['steps'] = data.get('steps')
        features['sleep_hours'] = data.get('sleep_hours')
        features['calories_intake'] = data.get('calories_intake')
        
        # Derived features
        features['activity_level'] = self._categorize_activity(features['steps'])
        features['sleep_quality'] = self._categorize_sleep(features['sleep_hours'])
        
        return features
    
    def _encode_gender(self, gender: str) -> int:
        """Encode gender as numeric value"""
        encoding = {'male': 0, 'female': 1, 'other': 2}
        return encoding.get(gender.lower(), 2)
    
    def _calculate_bmi(self, weight: float, height: float) -> float:
        """Calculate Body Mass Index"""
        if height <= 0:
            return 0
        return round(weight / (height ** 2), 2)
    
    def _categorize_bmi(self, bmi: float) -> str:
        """Categorize BMI value"""
        if bmi < 18.5:
            return "underweight"
        elif bmi < 25:
            return "normal"
        elif bmi < 30:
            return "overweight"
        else:
            return "obese"
    
    def _calculate_map(self, systolic: int, diastolic: int) -> float:
        """Calculate Mean Arterial Pressure"""
        return round(diastolic + (systolic - diastolic) / 3, 2)
    
    def _categorize_activity(self, steps: int) -> str:
        """Categorize activity level based on daily steps"""
        if steps is None:
            return "unknown"
        elif steps < 5000:
            return "sedentary"
        elif steps < 7500:
            return "low_active"
        elif steps < 10000:
            return "active"
        else:
            return "highly_active"
    
    def _categorize_sleep(self, hours: float) -> str:
        """Categorize sleep quality based on duration"""
        if hours is None:
            return "unknown"
        elif hours < 6:
            return "poor"
        elif hours < 7:
            return "fair"
        elif hours <= 9:
            return "good"
        else:
            return "excessive"
    
    def normalize_features(self, features: Dict[str, Any],
                          reference_ranges: Dict[str, tuple] = None) -> Dict[str, float]:
        """
        Normalize features to 0-1 scale
        
        Args:
            features: Dictionary of features
            reference_ranges: Optional custom reference ranges
            
        Returns:
            Dictionary with normalized features
        """
        default_ranges = {
            'age': (0, 100),
            'weight': (30, 200),
            'height': (1.0, 2.5),
            'bmi': (15, 40),
            'heart_rate': (40, 200),
            'sleep_hours': (0, 12),
            'steps': (0, 20000)
        }
        
        ranges = reference_ranges or default_ranges
        normalized = {}
        
        for key, value in features.items():
            if key in ranges and value is not None:
                min_val, max_val = ranges[key]
                normalized[key] = (value - min_val) / (max_val - min_val)
                normalized[key] = max(0, min(1, normalized[key]))
            elif isinstance(value, (int, float)):
                normalized[key] = value
        
        return normalized
    
    def extract_time_series_features(self, data_points: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Extract features from time series data
        
        Args:
            data_points: List of sequential data points
            
        Returns:
            Dictionary with aggregated features
        """
        if not data_points:
            return {}
        
        # Extract numerical columns
        numerical_features = {}
        for key in data_points[0].keys():
            values = [d.get(key) for d in data_points if d.get(key) is not None]
            if values and all(isinstance(v, (int, float)) for v in values):
                numerical_features[key] = values
        
        # Calculate statistics
        features = {}
        for key, values in numerical_features.items():
            features[f'{key}_mean'] = sum(values) / len(values)
            features[f'{key}_min'] = min(values)
            features[f'{key}_max'] = max(values)
            features[f'{key}_std'] = self._calculate_std(values)
            
            # Trend calculation
            if len(values) > 1:
                features[f'{key}_trend'] = values[-1] - values[0]
        
        return features
    
    def _calculate_std(self, values: List[float]) -> float:
        """Calculate standard deviation"""
        if len(values) < 2:
            return 0
        mean = sum(values) / len(values)
        variance = sum((x - mean) ** 2 for x in values) / (len(values) - 1)
        return round(math.sqrt(variance), 4)