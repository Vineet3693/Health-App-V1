"""
Health AI Platform - Food Recognition Model
Recognizes food from images and provides nutritional information
"""

from typing import Dict, Any, List
import base64


class FoodRecognizer:
    """
    Food recognition model that identifies food from images
    and provides nutritional information.
    """
    
    version = "1.0.0"
    
    # Sample food database (in production, this would be a trained ML model)
    FOOD_DATABASE = {
        "apple": {
            "calories_per_100g": 52,
            "nutrients": {"carbs": 14, "protein": 0.3, "fat": 0.2, "fiber": 2.4},
            "serving_size": "1 medium (182g)"
        },
        "banana": {
            "calories_per_100g": 89,
            "nutrients": {"carbs": 23, "protein": 1.1, "fat": 0.3, "fiber": 2.6},
            "serving_size": "1 medium (118g)"
        },
        "rice": {
            "calories_per_100g": 130,
            "nutrients": {"carbs": 28, "protein": 2.7, "fat": 0.3, "fiber": 0.4},
            "serving_size": "1 cup cooked (158g)"
        },
        "chicken_breast": {
            "calories_per_100g": 165,
            "nutrients": {"carbs": 0, "protein": 31, "fat": 3.6, "fiber": 0},
            "serving_size": "1 breast (172g)"
        },
        "salad": {
            "calories_per_100g": 33,
            "nutrients": {"carbs": 7, "protein": 2, "fat": 0.4, "fiber": 3},
            "serving_size": "1 bowl (300g)"
        },
        "pizza": {
            "calories_per_100g": 266,
            "nutrients": {"carbs": 33, "protein": 11, "fat": 10, "fiber": 2.3},
            "serving_size": "1 slice (107g)"
        },
        "pasta": {
            "calories_per_100g": 131,
            "nutrients": {"carbs": 25, "protein": 5, "fat": 1.1, "fiber": 1.8},
            "serving_size": "1 cup cooked (140g)"
        },
        "egg": {
            "calories_per_100g": 155,
            "nutrients": {"carbs": 1.1, "protein": 13, "fat": 11, "fiber": 0},
            "serving_size": "1 large (50g)"
        }
    }
    
    def __init__(self):
        self.model_loaded = False
        self._load_model()
    
    def _load_model(self):
        """Load or initialize the food recognition model"""
        # In production: load pre-trained CNN model
        # self.model = tf.keras.models.load_model('models/food_classifier.h5')
        self.model_loaded = True
    
    def recognize(self, image_data: bytes) -> Dict[str, Any]:
        """
        Recognize food from image data
        
        Args:
            image_data: Raw image bytes
            
        Returns:
            Dictionary with food_name, confidence, calories, nutrients, serving_size
        """
        if not self.model_loaded:
            raise RuntimeError("Model not loaded")
        
        # In production, use actual image classification
        # For demo, simulate recognition based on image hash
        food_name = self._classify_image(image_data)
        
        if food_name in self.FOOD_DATABASE:
            food_info = self.FOOD_DATABASE[food_name]
            return {
                "food_name": food_name.replace("_", " ").title(),
                "confidence": 0.92,
                "calories": food_info["calories_per_100g"],
                "nutrients": food_info["nutrients"],
                "serving_size": food_info["serving_size"]
            }
        else:
            # Return generic response for unrecognized food
            return {
                "food_name": "Unknown Food",
                "confidence": 0.3,
                "calories": 100,
                "nutrients": {"carbs": 15, "protein": 5, "fat": 3, "fiber": 1},
                "serving_size": "1 serving (100g)"
            }
    
    def _classify_image(self, image_data: bytes) -> str:
        """
        Classify image to food category
        In production, this would use a trained CNN model
        """
        # Simple hash-based simulation for demo
        image_hash = hash(image_data) % len(self.FOOD_DATABASE)
        food_items = list(self.FOOD_DATABASE.keys())
        return food_items[image_hash]
    
    def get_nutritional_info(self, food_name: str, quantity_g: int = 100) -> Dict[str, Any]:
        """
        Get detailed nutritional information for a food item
        
        Args:
            food_name: Name of the food
            quantity_g: Quantity in grams
            
        Returns:
            Dictionary with nutritional information
        """
        food_key = food_name.lower().replace(" ", "_")
        
        if food_key not in self.FOOD_DATABASE:
            return {"error": "Food not found in database"}
        
        food_info = self.FOOD_DATABASE[food_key]
        multiplier = quantity_g / 100.0
        
        return {
            "food_name": food_name,
            "quantity_g": quantity_g,
            "calories": int(food_info["calories_per_100g"] * multiplier),
            "nutrients": {
                key: round(value * multiplier, 2)
                for key, value in food_info["nutrients"].items()
            }
        }
    
    def search_foods(self, query: str) -> List[Dict[str, Any]]:
        """
        Search for foods matching a query
        
        Args:
            query: Search query string
            
        Returns:
            List of matching foods with basic info
        """
        query_lower = query.lower()
        results = []
        
        for food_key, food_info in self.FOOD_DATABASE.items():
            if query_lower in food_key.replace("_", " "):
                results.append({
                    "name": food_key.replace("_", " ").title(),
                    "calories_per_100g": food_info["calories_per_100g"],
                    "serving_size": food_info["serving_size"]
                })
        
        return results
    
    def add_food_to_database(self, name: str, calories: int, 
                             nutrients: Dict[str, float], 
                             serving_size: str) -> bool:
        """
        Add a new food item to the database
        
        Args:
            name: Food name
            calories: Calories per 100g
            nutrients: Dictionary of nutrient values
            serving_size: Typical serving size description
            
        Returns:
            True if successful
        """
        food_key = name.lower().replace(" ", "_")
        
        self.FOOD_DATABASE[food_key] = {
            "calories_per_100g": calories,
            "nutrients": nutrients,
            "serving_size": serving_size
        }
        
        return True