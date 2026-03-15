#!/usr/bin/env python3
"""
UFDR 3D Visualization Processor
Creates interactive 3D visualizations from UFDR forensic data.
Output: JSON to stdout for the frontend 3D viewer.
"""

import json
import sys
import os
import math
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple
import numpy as np
from collections import defaultdict, Counter

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def load_ufdr_data(file_path: str) -> Dict[str, Any]:
    """Load UFDR data from JSON file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(json.dumps({"error": f"Failed to load UFDR data: {str(e)}"}))
        sys.exit(1)

def parse_timestamp(timestamp_str: str) -> datetime:
    """Parse timestamp string to datetime object"""
    try:
        # Handle various timestamp formats
        formats = [
            "%Y-%m-%dT%H:%M:%SZ",
            "%Y-%m-%dT%H:%M:%S.%fZ",
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%d"
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(timestamp_str, fmt)
            except ValueError:
                continue
        
        # Fallback to current time
        return datetime.now()
    except Exception:
        return datetime.now()

def extract_location_coords(location: str) -> Tuple[float, float]:
    """Extract coordinates from location string (simplified geocoding)"""
    # Simplified coordinate mapping for demo purposes
    location_map = {
        'new york': (40.7128, -74.0060),
        'los angeles': (34.0522, -118.2437),
        'chicago': (41.8781, -87.6298),
        'boston': (42.3601, -71.0589),
        'seattle': (47.6062, -122.3321),
        'central park': (40.7829, -73.9654),
        'downtown la': (34.0522, -118.2437),
        'chicago office': (41.8781, -87.6298),
        'boston restaurant': (42.3601, -71.0589),
        'seattle waterfront': (47.6062, -122.3321),
        'conference room a': (40.7128, -74.0060),
        'lab': (34.0522, -118.2437),
        'office': (41.8781, -87.6298),
        'virtual': (0, 0)
    }
    
    location_lower = location.lower() if location else ''
    
    for key, coords in location_map.items():
        if key in location_lower:
            return coords
    
    # Default to random coordinates if location not found
    return (np.random.uniform(-90, 90), np.random.uniform(-180, 180))

def generate_communication_network_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate 3D network visualization data for communications"""
    network_data = {
        'nodes': [],
        'links': [],
        'metadata': {
            'totalContacts': 0,
            'totalInteractions': 0,
            'platforms': set()
        }
    }
    
    # Collect all unique contacts
    contacts = set()
    interactions = defaultdict(lambda: defaultdict(int))
    platforms = set()
    
    # Process chats
    for chat in data.get('chats', []):
        contact = chat.get('contact', 'Unknown')
        platform = chat.get('platform', 'Unknown')
        contacts.add(contact)
        platforms.add(platform)
        interactions[contact][platform] += 1
        network_data['metadata']['totalInteractions'] += 1
    
    # Process calls
    for call in data.get('calls', []):
        contact = call.get('contact', 'Unknown')
        contacts.add(contact)
        interactions[contact]['Phone'] += 1
        network_data['metadata']['totalInteractions'] += 1
    
    # Create nodes (contacts) with 3D positions
    contact_positions = {}
    for i, contact in enumerate(contacts):
        # Create circular arrangement in 3D space
        angle = (2 * math.pi * i) / len(contacts)
        radius = 10
        x = radius * math.cos(angle)
        y = radius * math.sin(angle)
        z = np.random.uniform(-5, 5)  # Random height
        
        contact_positions[contact] = (x, y, z)
        
        # Calculate interaction volume (size of node)
        total_interactions = sum(interactions[contact].values())
        size = max(5, min(50, total_interactions * 2))
        
        network_data['nodes'].append({
            'id': contact,
            'x': x,
            'y': y,
            'z': z,
            'size': size,
            'totalInteractions': total_interactions,
            'platforms': list(interactions[contact].keys())
        })
    
    # Create links between contacts (if they have common platforms)
    for contact1 in contacts:
        for contact2 in contacts:
            if contact1 != contact2:
                common_platforms = set(interactions[contact1].keys()) & set(interactions[contact2].keys())
                if common_platforms:
                    pos1 = contact_positions[contact1]
                    pos2 = contact_positions[contact2]
                    
                    network_data['links'].append({
                        'source': contact1,
                        'target': contact2,
                        'sourcePos': pos1,
                        'targetPos': pos2,
                        'strength': len(common_platforms),
                        'platforms': list(common_platforms)
                    })
    
    network_data['metadata']['totalContacts'] = len(contacts)
    network_data['metadata']['platforms'] = list(platforms)
    
    return network_data

def generate_temporal_activity_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate 3D temporal visualization data"""
    temporal_data = {
        'timeline': [],
        'activity_peaks': [],
        'metadata': {
            'timeRange': {},
            'totalEvents': 0,
            'activityTypes': []
        }
    }
    
    all_events = []
    
    # Process chats
    for chat in data.get('chats', []):
        timestamp = parse_timestamp(chat.get('timestamp', ''))
        all_events.append({
            'timestamp': timestamp,
            'type': 'chat',
            'platform': chat.get('platform', 'Unknown'),
            'contact': chat.get('contact', 'Unknown'),
            'location': chat.get('location', 'Unknown'),
            'intensity': 1
        })
    
    # Process calls
    for call in data.get('calls', []):
        timestamp = parse_timestamp(call.get('timestamp', ''))
        duration = call.get('duration', 0)
        intensity = min(10, duration / 60)  # Normalize call duration
        
        all_events.append({
            'timestamp': timestamp,
            'type': 'call',
            'contact': call.get('contact', 'Unknown'),
            'location': call.get('location', 'Unknown'),
            'duration': duration,
            'intensity': intensity
        })
    
    # Sort events by timestamp
    all_events.sort(key=lambda x: x['timestamp'])
    
    if all_events:
        temporal_data['metadata']['timeRange'] = {
            'start': all_events[0]['timestamp'].isoformat(),
            'end': all_events[-1]['timestamp'].isoformat()
        }
    
    # Group events by hour and create 3D timeline
    hourly_activity = defaultdict(list)
    for event in all_events:
        hour_key = event['timestamp'].replace(minute=0, second=0, microsecond=0)
        hourly_activity[hour_key].append(event)
    
    # Create 3D timeline points
    for hour, events in hourly_activity.items():
        # Calculate 3D position
        hour_of_day = hour.hour
        day_of_week = hour.weekday()
        
        x = hour_of_day * 2  # Hour position
        y = day_of_week * 5  # Day position
        z = len(events) * 0.5  # Activity height
        
        # Calculate activity intensity
        total_intensity = sum(event.get('intensity', 1) for event in events)
        avg_intensity = total_intensity / len(events) if events else 0
        
        temporal_data['timeline'].append({
            'timestamp': hour.isoformat(),
            'x': x,
            'y': y,
            'z': z,
            'eventCount': len(events),
            'intensity': avg_intensity,
            'events': events[:10]  # Limit to first 10 events for performance
        })
        
        # Identify activity peaks
        if len(events) > np.mean([len(hourly_activity[h]) for h in hourly_activity]) * 1.5:
            temporal_data['activity_peaks'].append({
                'timestamp': hour.isoformat(),
                'x': x,
                'y': y,
                'z': z,
                'peakIntensity': len(events),
                'events': events[:5]
            })
    
    temporal_data['metadata']['totalEvents'] = len(all_events)
    temporal_data['metadata']['activityTypes'] = list(set(event['type'] for event in all_events))
    
    return temporal_data

def generate_spatial_analysis_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate 3D spatial visualization data"""
    spatial_data = {
        'locations': [],
        'movement_path': [],
        'heatmap_points': [],
        'metadata': {
            'totalLocations': 0,
            'geographicSpread': {},
            'activityTypes': []
        }
    }
    
    location_activity = defaultdict(list)
    movement_points = []
    
    # Process all location-based events
    for chat in data.get('chats', []):
        location = chat.get('location', '')
        if location:
            coords = extract_location_coords(location)
            timestamp = parse_timestamp(chat.get('timestamp', ''))
            
            location_activity[location].append({
                'type': 'chat',
                'timestamp': timestamp,
                'platform': chat.get('platform', 'Unknown'),
                'contact': chat.get('contact', 'Unknown')
            })
            
            movement_points.append({
                'timestamp': timestamp,
                'location': location,
                'coords': coords,
                'activity_type': 'chat'
            })
    
    for call in data.get('calls', []):
        location = call.get('location', '')
        if location:
            coords = extract_location_coords(location)
            timestamp = parse_timestamp(call.get('timestamp', ''))
            
            location_activity[location].append({
                'type': 'call',
                'timestamp': timestamp,
                'contact': call.get('contact', 'Unknown'),
                'duration': call.get('duration', 0)
            })
            
            movement_points.append({
                'timestamp': timestamp,
                'location': location,
                'coords': coords,
                'activity_type': 'call'
            })
    
    # Create location nodes with 3D positions
    for location, activities in location_activity.items():
        coords = extract_location_coords(location)
        
        # Convert lat/lng to 3D coordinates (simplified projection)
        x = coords[1] * 0.1  # Longitude -> X
        y = coords[0] * 0.1  # Latitude -> Y
        z = len(activities) * 2  # Activity volume -> Z
        
        # Calculate activity intensity
        total_intensity = sum(
            act.get('duration', 1) if act['type'] == 'call' else 1 
            for act in activities
        )
        
        spatial_data['locations'].append({
            'name': location,
            'x': x,
            'y': y,
            'z': z,
            'latitude': coords[0],
            'longitude': coords[1],
            'activityCount': len(activities),
            'intensity': total_intensity,
            'activities': activities[:10]  # Limit for performance
        })
        
        # Create heatmap points
        for activity in activities:
            spatial_data['heatmap_points'].append({
                'x': x + np.random.uniform(-1, 1),
                'y': y + np.random.uniform(-1, 1),
                'z': z + np.random.uniform(-0.5, 0.5),
                'intensity': activity.get('duration', 1) if activity['type'] == 'call' else 1,
                'activity_type': activity['type'],
                'timestamp': activity['timestamp'].isoformat()
            })
    
    # Sort movement points by timestamp and create path
    movement_points.sort(key=lambda x: x['timestamp'])
    
    for i, point in enumerate(movement_points):
        coords = point['coords']
        x = coords[1] * 0.1
        y = coords[0] * 0.1
        z = i * 0.1  # Time progression in Z
        
        spatial_data['movement_path'].append({
            'x': x,
            'y': y,
            'z': z,
            'timestamp': point['timestamp'].isoformat(),
            'location': point['location'],
            'activity_type': point['activity_type'],
            'path_index': i
        })
    
    spatial_data['metadata']['totalLocations'] = len(location_activity)
    spatial_data['metadata']['activityTypes'] = list(set(
        act['type'] for activities in location_activity.values() for act in activities
    ))
    
    return spatial_data

def generate_data_flow_visualization(data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate 3D data flow visualization"""
    flow_data = {
        'data_streams': [],
        'volume_nodes': [],
        'flow_connections': [],
        'metadata': {
            'totalDataVolume': 0,
            'dataTypes': [],
            'flowPatterns': []
        }
    }
    
    # Calculate data volumes
    total_chat_volume = len(data.get('chats', []))
    total_call_duration = sum(call.get('duration', 0) for call in data.get('calls', []))
    total_image_size = sum(img.get('size', 0) for img in data.get('images', []))
    total_video_duration = sum(vid.get('duration', 0) for vid in data.get('videos', []))
    total_app_data = sum(app.get('dataSize', 0) for app in data.get('appData', []))
    
    # Create volume nodes for different data types
    data_types = [
        {'name': 'Chats', 'volume': total_chat_volume, 'color': '#FF6B6B'},
        {'name': 'Calls', 'volume': total_call_duration, 'color': '#4ECDC4'},
        {'name': 'Images', 'volume': total_image_size, 'color': '#45B7D1'},
        {'name': 'Videos', 'volume': total_video_duration, 'color': '#96CEB4'},
        {'name': 'App Data', 'volume': total_app_data, 'color': '#FFEAA7'}
    ]
    
    for i, data_type in enumerate(data_types):
        angle = (2 * math.pi * i) / len(data_types)
        radius = 15
        
        x = radius * math.cos(angle)
        y = radius * math.sin(angle)
        z = 0
        
        # Scale node size based on volume
        volume_scale = max(1, min(20, math.log10(data_type['volume'] + 1)))
        
        flow_data['volume_nodes'].append({
            'id': data_type['name'],
            'x': x,
            'y': y,
            'z': z,
            'volume': data_type['volume'],
            'size': volume_scale,
            'color': data_type['color']
        })
    
    # Create central hub
    flow_data['volume_nodes'].append({
        'id': 'Central Hub',
        'x': 0,
        'y': 0,
        'z': 0,
        'volume': sum(dt['volume'] for dt in data_types),
        'size': 15,
        'color': '#DDA0DD'
    })
    
    # Create flow connections from data types to central hub
    for data_type in data_types:
        flow_data['flow_connections'].append({
            'source': data_type['name'],
            'target': 'Central Hub',
            'flow_rate': data_type['volume'],
            'color': data_type['color']
        })
    
    # Create data streams (time-based flow)
    all_events = []
    
    # Add chat events
    for chat in data.get('chats', []):
        all_events.append({
            'timestamp': parse_timestamp(chat.get('timestamp', '')),
            'type': 'chat',
            'volume': 1,
            'platform': chat.get('platform', 'Unknown')
        })
    
    # Add call events
    for call in data.get('calls', []):
        all_events.append({
            'timestamp': parse_timestamp(call.get('timestamp', '')),
            'type': 'call',
            'volume': call.get('duration', 0) / 60,  # Convert to minutes
            'contact': call.get('contact', 'Unknown')
        })
    
    # Sort events by timestamp
    all_events.sort(key=lambda x: x['timestamp'])
    
    # Create time-based flow visualization
    for i, event in enumerate(all_events[:100]):  # Limit for performance
        t = i / len(all_events) if all_events else 0
        angle = t * 2 * math.pi
        
        x = 8 * math.cos(angle)
        y = 8 * math.sin(angle)
        z = t * 20 - 10  # Time progression
        
        flow_data['data_streams'].append({
            'x': x,
            'y': y,
            'z': z,
            'volume': event['volume'],
            'type': event['type'],
            'timestamp': event['timestamp'].isoformat(),
            'flow_index': i
        })
    
    flow_data['metadata']['totalDataVolume'] = sum(dt['volume'] for dt in data_types)
    flow_data['metadata']['dataTypes'] = [dt['name'] for dt in data_types]
    
    return flow_data

def generate_comprehensive_visualization(data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate comprehensive 3D visualization combining all aspects"""
    comprehensive_data = {
        'communication_network': generate_communication_network_data(data),
        'temporal_activity': generate_temporal_activity_data(data),
        'spatial_analysis': generate_spatial_analysis_data(data),
        'data_flow': generate_data_flow_visualization(data),
        'metadata': {
            'generated_at': datetime.now().isoformat(),
            'data_summary': {
                'total_chats': len(data.get('chats', [])),
                'total_calls': len(data.get('calls', [])),
                'total_images': len(data.get('images', [])),
                'total_videos': len(data.get('videos', [])),
                'total_apps': len(data.get('appData', [])),
                'total_size': data.get('metadata', {}).get('totalSize', 'Unknown')
            }
        }
    }
    
    return comprehensive_data

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python ufdr_3d_visualizer.py <ufdr_file_path> [visualization_type]"}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    visualization_type = sys.argv[2] if len(sys.argv) > 2 else 'comprehensive'
    
    # Load UFDR data
    ufdr_data = load_ufdr_data(file_path)
    
    # Generate visualization data based on type
    if visualization_type == 'communication_network':
        result = generate_communication_network_data(ufdr_data)
    elif visualization_type == 'temporal':
        result = generate_temporal_activity_data(ufdr_data)
    elif visualization_type == 'spatial':
        result = generate_spatial_analysis_data(ufdr_data)
    elif visualization_type == 'data_flow':
        result = generate_data_flow_visualization(ufdr_data)
    else:  # comprehensive
        result = generate_comprehensive_visualization(ufdr_data)
    
    # Add data points count for API response
    if 'dataPoints' not in result:
        result['dataPoints'] = sum([
            len(result.get('nodes', [])),
            len(result.get('links', [])),
            len(result.get('timeline', [])),
            len(result.get('locations', [])),
            len(result.get('volume_nodes', []))
        ])
    
    # Output JSON result
    print(json.dumps(result, indent=2, default=str))

if __name__ == '__main__':
    main()

