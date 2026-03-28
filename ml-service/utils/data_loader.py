"""
Health AI Platform - Data Loader
Utilities for loading and processing health datasets
"""

from typing import Dict, Any, List, Optional
import json
import csv


class DataLoader:
    """
    Data loading utilities for health datasets
    """
    
    def __init__(self):
        pass
    
    def load_json(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Load data from JSON file
        
        Args:
            file_path: Path to JSON file
            
        Returns:
            List of data records
        """
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
                return data if isinstance(data, list) else [data]
        except FileNotFoundError:
            raise FileNotFoundError(f"File not found: {file_path}")
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON format: {str(e)}")
    
    def load_csv(self, file_path: str, delimiter: str = ',') -> List[Dict[str, Any]]:
        """
        Load data from CSV file
        
        Args:
            file_path: Path to CSV file
            delimiter: CSV delimiter character
            
        Returns:
            List of dictionaries (one per row)
        """
        try:
            with open(file_path, 'r', newline='') as f:
                reader = csv.DictReader(f, delimiter=delimiter)
                return list(reader)
        except FileNotFoundError:
            raise FileNotFoundError(f"File not found: {file_path}")
    
    def save_json(self, data: List[Dict[str, Any]], file_path: str, 
                  indent: int = 2) -> bool:
        """
        Save data to JSON file
        
        Args:
            data: Data to save
            file_path: Output file path
            indent: JSON indentation level
            
        Returns:
            True if successful
        """
        try:
            with open(file_path, 'w') as f:
                json.dump(data, f, indent=indent)
            return True
        except Exception as e:
            raise IOError(f"Failed to save file: {str(e)}")
    
    def save_csv(self, data: List[Dict[str, Any]], file_path: str,
                 fieldnames: List[str] = None) -> bool:
        """
        Save data to CSV file
        
        Args:
            data: Data to save
            file_path: Output file path
            fieldnames: Column names (auto-detected if None)
            
        Returns:
            True if successful
        """
        try:
            if not data:
                raise ValueError("No data to save")
            
            if fieldnames is None:
                fieldnames = list(data[0].keys())
            
            with open(file_path, 'w', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(data)
            return True
        except Exception as e:
            raise IOError(f"Failed to save file: {str(e)}")
    
    def filter_data(self, data: List[Dict[str, Any]], 
                   conditions: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Filter data based on conditions
        
        Args:
            data: Input data
            conditions: Dictionary of field-value conditions
            
        Returns:
            Filtered data
        """
        filtered = []
        for record in data:
            match = True
            for key, value in conditions.items():
                if record.get(key) != value:
                    match = False
                    break
            if match:
                filtered.append(record)
        return filtered
    
    def split_data(self, data: List[Dict[str, Any]], 
                  train_ratio: float = 0.8,
                  shuffle: bool = True) -> tuple:
        """
        Split data into training and testing sets
        
        Args:
            data: Input data
            train_ratio: Ratio for training set (0-1)
            shuffle: Whether to shuffle before splitting
            
        Returns:
            Tuple of (train_data, test_data)
        """
        import random
        
        if shuffle:
            data = data.copy()
            random.shuffle(data)
        
        split_idx = int(len(data) * train_ratio)
        return data[:split_idx], data[split_idx:]
    
    def validate_data(self, data: List[Dict[str, Any]],
                     required_fields: List[str]) -> Dict[str, Any]:
        """
        Validate data has required fields
        
        Args:
            data: Input data
            required_fields: List of required field names
            
        Returns:
            Validation report
        """
        report = {
            'valid': True,
            'total_records': len(data),
            'missing_fields': [],
            'invalid_records': []
        }
        
        for i, record in enumerate(data):
            missing = [field for field in required_fields if field not in record]
            if missing:
                report['valid'] = False
                report['missing_fields'].extend(missing)
                report['invalid_records'].append(i)
        
        report['missing_fields'] = list(set(report['missing_fields']))
        return report
    
    def aggregate_data(self, data: List[Dict[str, Any]],
                      group_by: str,
                      aggregations: Dict[str, str]) -> List[Dict[str, Any]]:
        """
        Aggregate data by grouping
        
        Args:
            data: Input data
            group_by: Field to group by
            aggregations: Dictionary of {field: aggregation_function}
                         Supported: 'sum', 'avg', 'min', 'max', 'count'
            
        Returns:
            Aggregated data
        """
        groups = {}
        
        for record in data:
            key = record.get(group_by)
            if key not in groups:
                groups[key] = []
            groups[key].append(record)
        
        result = []
        for key, records in groups.items():
            agg_record = {group_by: key}
            
            for field, func in aggregations.items():
                values = [r.get(field) for r in records if r.get(field) is not None]
                
                if not values:
                    agg_record[field] = None
                elif func == 'sum':
                    agg_record[field] = sum(values)
                elif func == 'avg':
                    agg_record[field] = sum(values) / len(values)
                elif func == 'min':
                    agg_record[field] = min(values)
                elif func == 'max':
                    agg_record[field] = max(values)
                elif func == 'count':
                    agg_record[field] = len(values)
            
            result.append(agg_record)
        
        return result