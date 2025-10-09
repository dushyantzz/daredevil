#!/usr/bin/env python3
"""
GNN-based Alias Resolution and Relationship Detection System
Automatically resolves aliases and suggests hidden, indirect relationships between suspects across multiple devices/UFDRs
"""

import json
import sys
import os
import math
import re
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple, Set
from collections import defaultdict, Counter
import networkx as nx
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import DBSCAN
import hashlib

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

class AliasResolver:
    """Advanced alias resolution using multiple techniques"""
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.phone_patterns = [
            r'\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})',
            r'\+?[0-9]{1,4}[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,4}'
        ]
        self.email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        
    def extract_identifiers(self, text: str) -> Dict[str, List[str]]:
        """Extract various identifiers from text"""
        identifiers = {
            'phones': [],
            'emails': [],
            'usernames': [],
            'names': []
        }
        
        # Extract phone numbers
        for pattern in self.phone_patterns:
            phones = re.findall(pattern, text)
            identifiers['phones'].extend([''.join(phone) for phone in phones])
        
        # Extract emails
        emails = re.findall(self.email_pattern, text)
        identifiers['emails'].extend(emails)
        
        # Extract potential usernames (alphanumeric with underscores/hyphens)
        usernames = re.findall(r'\b[a-zA-Z0-9_-]{3,}\b', text)
        identifiers['usernames'].extend(usernames)
        
        # Extract potential names (Title Case words)
        names = re.findall(r'\b[A-Z][a-z]+ [A-Z][a-z]+\b', text)
        identifiers['names'].extend(names)
        
        return identifiers
    
    def normalize_phone(self, phone: str) -> str:
        """Normalize phone number for comparison"""
        # Remove all non-digit characters
        digits = re.sub(r'\D', '', phone)
        
        # Handle US numbers
        if len(digits) == 11 and digits.startswith('1'):
            return digits[1:]
        elif len(digits) == 10:
            return digits
        
        return digits
    
    def calculate_name_similarity(self, name1: str, name2: str) -> float:
        """Calculate similarity between two names"""
        # Convert to lowercase and split
        words1 = set(name1.lower().split())
        words2 = set(name2.lower().split())
        
        if not words1 or not words2:
            return 0.0
        
        # Jaccard similarity
        intersection = len(words1.intersection(words2))
        union = len(words1.union(words2))
        
        return intersection / union if union > 0 else 0.0
    
    def resolve_aliases(self, entities: List[Dict[str, Any]]) -> Dict[str, List[str]]:
        """Resolve aliases for entities"""
        alias_groups = defaultdict(list)
        processed = set()
        
        for i, entity1 in enumerate(entities):
            if i in processed:
                continue
                
            current_group = [entity1['id']]
            identifiers1 = self.extract_identifiers(entity1.get('content', '') + ' ' + entity1.get('contact', ''))
            
            for j, entity2 in enumerate(entities[i+1:], i+1):
                if j in processed:
                    continue
                    
                identifiers2 = self.extract_identifiers(entity2.get('content', '') + ' ' + entity2.get('contact', ''))
                
                # Check for matching identifiers
                similarity_score = 0.0
                
                # Phone number matching
                phones1 = {self.normalize_phone(p) for p in identifiers1['phones']}
                phones2 = {self.normalize_phone(p) for p in identifiers2['phones']}
                if phones1.intersection(phones2):
                    similarity_score += 0.8
                
                # Email matching
                if identifiers1['emails'] and identifiers2['emails']:
                    if set(identifiers1['emails']).intersection(set(identifiers2['emails'])):
                        similarity_score += 0.9
                
                # Name similarity
                for name1 in identifiers1['names']:
                    for name2 in identifiers2['names']:
                        name_sim = self.calculate_name_similarity(name1, name2)
                        similarity_score += name_sim * 0.6
                
                # Username similarity
                for user1 in identifiers1['usernames']:
                    for user2 in identifiers2['usernames']:
                        if user1.lower() == user2.lower():
                            similarity_score += 0.7
                        elif abs(len(user1) - len(user2)) <= 2:
                            # Check for partial matches
                            if user1.lower() in user2.lower() or user2.lower() in user1.lower():
                                similarity_score += 0.5
                
                # High similarity threshold
                if similarity_score >= 0.7:
                    current_group.append(entity2['id'])
                    processed.add(j)
            
            if len(current_group) > 1:
                # Create alias group
                group_id = f"alias_group_{len(alias_groups)}"
                alias_groups[group_id] = current_group
                processed.add(i)
        
        return dict(alias_groups)

class RelationshipDetector:
    """Detect hidden and indirect relationships using graph analysis"""
    
    def __init__(self):
        self.graph = nx.Graph()
        self.temporal_weights = {}
        self.communication_patterns = {}
        
    def build_interaction_graph(self, data: Dict[str, Any]) -> nx.Graph:
        """Build interaction graph from UFDR data"""
        graph = nx.Graph()
        
        # Add nodes for all contacts
        contacts = set()
        
        # Process chats
        for chat in data.get('chats', []):
            contact = chat.get('contact', 'Unknown')
            platform = chat.get('platform', 'Unknown')
            timestamp = chat.get('timestamp', '')
            location = chat.get('location', 'Unknown')
            
            contacts.add(contact)
            
            # Add node attributes
            if not graph.has_node(contact):
                graph.add_node(contact, 
                             platforms=set(), 
                             locations=set(),
                             interactions=0,
                             first_seen=timestamp,
                             last_seen=timestamp)
            
            # Update node attributes
            graph.nodes[contact]['platforms'].add(platform)
            graph.nodes[contact]['locations'].add(location)
            graph.nodes[contact]['interactions'] += 1
            graph.nodes[contact]['last_seen'] = max(
                graph.nodes[contact]['last_seen'], timestamp
            )
        
        # Process calls
        for call in data.get('calls', []):
            contact = call.get('contact', 'Unknown')
            timestamp = call.get('timestamp', '')
            location = call.get('location', 'Unknown')
            duration = call.get('duration', 0)
            
            contacts.add(contact)
            
            if not graph.has_node(contact):
                graph.add_node(contact, 
                             platforms=set(), 
                             locations=set(),
                             interactions=0,
                             first_seen=timestamp,
                             last_seen=timestamp,
                             call_duration=0)
            
            graph.nodes[contact]['platforms'].add('Phone')
            graph.nodes[contact]['locations'].add(location)
            graph.nodes[contact]['interactions'] += 1
            graph.nodes[contact]['call_duration'] = graph.nodes[contact].get('call_duration', 0) + duration
            graph.nodes[contact]['last_seen'] = max(
                graph.nodes[contact]['last_seen'], timestamp
            )
        
        # Create edges based on shared attributes
        for contact1 in contacts:
            for contact2 in contacts:
                if contact1 != contact2:
                    weight = self.calculate_relationship_weight(
                        graph, contact1, contact2
                    )
                    if weight > 0.1:  # Threshold for creating edge
                        graph.add_edge(contact1, contact2, weight=weight)
        
        return graph
    
    def calculate_relationship_weight(self, graph: nx.Graph, contact1: str, contact2: str) -> float:
        """Calculate relationship weight between two contacts"""
        weight = 0.0
        
        if not graph.has_node(contact1) or not graph.has_node(contact2):
            return weight
        
        node1 = graph.nodes[contact1]
        node2 = graph.nodes[contact2]
        
        # Platform overlap
        platform_overlap = len(node1['platforms'].intersection(node2['platforms']))
        weight += platform_overlap * 0.3
        
        # Location overlap
        location_overlap = len(node1['locations'].intersection(node2['locations']))
        weight += location_overlap * 0.4
        
        # Temporal proximity
        temporal_weight = self.calculate_temporal_proximity(
            node1['last_seen'], node2['last_seen']
        )
        weight += temporal_weight * 0.2
        
        # Interaction frequency similarity
        interaction_ratio = min(node1['interactions'], node2['interactions']) / \
                           max(node1['interactions'], node2['interactions'], 1)
        weight += interaction_ratio * 0.1
        
        return min(weight, 1.0)
    
    def calculate_temporal_proximity(self, timestamp1: str, timestamp2: str) -> float:
        """Calculate temporal proximity between timestamps"""
        try:
            dt1 = datetime.fromisoformat(timestamp1.replace('Z', '+00:00'))
            dt2 = datetime.fromisoformat(timestamp2.replace('Z', '+00:00'))
            
            time_diff = abs((dt1 - dt2).total_seconds())
            
            # Decay function: closer in time = higher weight
            if time_diff < 3600:  # Within 1 hour
                return 1.0
            elif time_diff < 86400:  # Within 1 day
                return 0.8
            elif time_diff < 604800:  # Within 1 week
                return 0.6
            elif time_diff < 2592000:  # Within 1 month
                return 0.4
            else:
                return 0.2
        except:
            return 0.0
    
    def detect_hidden_relationships(self, graph: nx.Graph) -> List[Dict[str, Any]]:
        """Detect hidden relationships using graph analysis"""
        hidden_relationships = []
        
        # Find potential hidden relationships using various metrics
        
        # 1. Common neighbors analysis
        for node in graph.nodes():
            neighbors = list(graph.neighbors(node))
            for neighbor in neighbors:
                # Find common neighbors
                common_neighbors = set(graph.neighbors(node)) & set(graph.neighbors(neighbor))
                
                if len(common_neighbors) > 1:
                    # Calculate relationship strength based on common neighbors
                    strength = len(common_neighbors) / len(set(graph.neighbors(node)) | set(graph.neighbors(neighbor)))
                    
                    hidden_relationships.append({
                        'type': 'common_neighbors',
                        'source': node,
                        'target': neighbor,
                        'strength': strength,
                        'evidence': f"Share {len(common_neighbors)} common contacts: {', '.join(list(common_neighbors)[:3])}",
                        'confidence': min(strength * 2, 1.0)
                    })
        
        # 2. Path analysis - find short paths between seemingly unconnected nodes
        all_pairs = [(u, v) for u in graph.nodes() for v in graph.nodes() if u != v]
        
        for source, target in all_pairs:
            if not graph.has_edge(source, target):
                try:
                    # Find shortest path
                    path = nx.shortest_path(graph, source, target)
                    
                    if len(path) <= 3:  # Short path indicates potential hidden relationship
                        path_strength = 1.0 / len(path)  # Shorter path = stronger relationship
                        
                        hidden_relationships.append({
                            'type': 'short_path',
                            'source': source,
                            'target': target,
                            'strength': path_strength,
                            'evidence': f"Connected via {len(path)-1} degrees: {' -> '.join(path)}",
                            'confidence': path_strength * 0.8
                        })
                except nx.NetworkXNoPath:
                    continue
        
        # 3. Clustering analysis
        communities = self.detect_communities(graph)
        
        for community in communities:
            if len(community) > 2:
                # Find potential connections within community
                for i, node1 in enumerate(community):
                    for node2 in community[i+1:]:
                        if not graph.has_edge(node1, node2):
                            hidden_relationships.append({
                                'type': 'community_member',
                                'source': node1,
                                'target': node2,
                                'strength': 0.6,
                                'evidence': f"Both part of same communication community",
                                'confidence': 0.7
                            })
        
        # Sort by confidence and remove duplicates
        hidden_relationships = list({(r['source'], r['target']): r for r in hidden_relationships}.values())
        hidden_relationships.sort(key=lambda x: x['confidence'], reverse=True)
        
        return hidden_relationships[:20]  # Return top 20
    
    def detect_communities(self, graph: nx.Graph) -> List[List[str]]:
        """Detect communities using clustering algorithms"""
        if len(graph.nodes()) < 3:
            return []
        
        try:
            # Use Louvain community detection
            communities = nx.community.louvain_communities(graph)
            return [list(community) for community in communities]
        except:
            # Fallback to simple clustering based on node attributes
            return self.simple_attribute_clustering(graph)
    
    def simple_attribute_clustering(self, graph: nx.Graph) -> List[List[str]]:
        """Simple clustering based on node attributes"""
        clusters = defaultdict(list)
        
        for node in graph.nodes():
            node_data = graph.nodes[node]
            
            # Create cluster key based on platforms and locations
            platform_key = tuple(sorted(node_data.get('platforms', set())))
            location_key = tuple(sorted(node_data.get('locations', set())))
            cluster_key = (platform_key, location_key)
            
            clusters[cluster_key].append(node)
        
        return [cluster for cluster in clusters.values() if len(cluster) > 1]

class GNNProcessor:
    """Main GNN processor for alias resolution and relationship detection"""
    
    def __init__(self):
        self.alias_resolver = AliasResolver()
        self.relationship_detector = RelationshipDetector()
        
    def process_ufdr_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process UFDR data with GNN analysis"""
        
        # Collect all entities for alias resolution
        entities = []
        
        # Add chat entities
        for chat in data.get('chats', []):
            entities.append({
                'id': f"chat_{chat.get('contact', 'unknown')}_{len(entities)}",
                'type': 'chat',
                'contact': chat.get('contact', ''),
                'content': chat.get('message', ''),
                'platform': chat.get('platform', ''),
                'timestamp': chat.get('timestamp', ''),
                'location': chat.get('location', '')
            })
        
        # Add call entities
        for call in data.get('calls', []):
            entities.append({
                'id': f"call_{call.get('contact', 'unknown')}_{len(entities)}",
                'type': 'call',
                'contact': call.get('contact', ''),
                'content': f"Call duration: {call.get('duration', 0)} seconds",
                'platform': 'Phone',
                'timestamp': call.get('timestamp', ''),
                'location': call.get('location', '')
            })
        
        # Resolve aliases
        alias_groups = self.alias_resolver.resolve_aliases(entities)
        
        # Build interaction graph
        interaction_graph = self.relationship_detector.build_interaction_graph(data)
        
        # Detect hidden relationships
        hidden_relationships = self.relationship_detector.detect_hidden_relationships(interaction_graph)
        
        # Generate 3D visualization data
        visualization_data = self.generate_gnn_visualization_data(
            data, alias_groups, interaction_graph, hidden_relationships
        )
        
        return {
            'alias_groups': alias_groups,
            'hidden_relationships': hidden_relationships,
            'interaction_graph': self.graph_to_dict(interaction_graph),
            'visualization_data': visualization_data,
            'metadata': {
                'total_entities': len(entities),
                'alias_groups_count': len(alias_groups),
                'hidden_relationships_count': len(hidden_relationships),
                'graph_nodes': len(interaction_graph.nodes()),
                'graph_edges': len(interaction_graph.edges()),
                'processing_timestamp': datetime.now().isoformat()
            }
        }
    
    def generate_gnn_visualization_data(self, data: Dict[str, Any], alias_groups: Dict[str, List[str]], 
                                      graph: nx.Graph, hidden_relationships: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate 3D visualization data for GNN analysis"""
        
        visualization = {
            'nodes': [],
            'edges': [],
            'alias_clusters': [],
            'hidden_relationship_indicators': [],
            'community_clusters': []
        }
        
        # Create nodes from graph
        for node in graph.nodes():
            node_data = graph.nodes[node]
            
            # Calculate 3D position (circular layout with some randomization)
            node_index = list(graph.nodes()).index(node)
            angle = (2 * math.pi * node_index) / len(graph.nodes())
            radius = 8 + np.random.uniform(-2, 2)
            
            x = radius * math.cos(angle)
            y = radius * math.sin(angle)
            z = np.random.uniform(-3, 3)
            
            # Determine node size based on interactions
            size = max(5, min(30, node_data.get('interactions', 1) * 2))
            
            # Determine node color based on platforms
            platform_count = len(node_data.get('platforms', set()))
            if platform_count >= 3:
                color = '#FF6B6B'  # Red for highly connected
            elif platform_count >= 2:
                color = '#4ECDC4'  # Teal for moderately connected
            else:
                color = '#45B7D1'  # Blue for basic connections
            
            visualization['nodes'].append({
                'id': node,
                'x': x,
                'y': y,
                'z': z,
                'size': size,
                'color': color,
                'platforms': list(node_data.get('platforms', set())),
                'locations': list(node_data.get('locations', set())),
                'interactions': node_data.get('interactions', 0),
                'call_duration': node_data.get('call_duration', 0)
            })
        
        # Create edges from graph
        for edge in graph.edges(data=True):
            source_pos = next(n for n in visualization['nodes'] if n['id'] == edge[0])
            target_pos = next(n for n in visualization['nodes'] if n['id'] == edge[1])
            
            visualization['edges'].append({
                'source': edge[0],
                'target': edge[1],
                'sourcePos': [source_pos['x'], source_pos['y'], source_pos['z']],
                'targetPos': [target_pos['x'], target_pos['y'], target_pos['z']],
                'weight': edge[2].get('weight', 0.5),
                'type': 'direct_connection'
            })
        
        # Create alias clusters
        for group_id, entity_ids in alias_groups.items():
            if len(entity_ids) > 1:
                # Find nodes for these entities
                cluster_nodes = [n for n in visualization['nodes'] 
                               if any(entity_id in n['id'] for entity_id in entity_ids)]
                
                if cluster_nodes:
                    # Calculate cluster center
                    center_x = sum(n['x'] for n in cluster_nodes) / len(cluster_nodes)
                    center_y = sum(n['y'] for n in cluster_nodes) / len(cluster_nodes)
                    center_z = sum(n['z'] for n in cluster_nodes) / len(cluster_nodes)
                    
                    visualization['alias_clusters'].append({
                        'id': group_id,
                        'center': [center_x, center_y, center_z],
                        'radius': 2.0,
                        'entity_count': len(entity_ids),
                        'entities': entity_ids,
                        'color': '#FFD700'  # Gold for alias clusters
                    })
        
        # Create hidden relationship indicators
        for relationship in hidden_relationships[:10]:  # Limit for performance
            source_node = next((n for n in visualization['nodes'] if n['id'] == relationship['source']), None)
            target_node = next((n for n in visualization['nodes'] if n['id'] == relationship['target']), None)
            
            if source_node and target_node:
                visualization['hidden_relationship_indicators'].append({
                    'source': relationship['source'],
                    'target': relationship['target'],
                    'sourcePos': [source_node['x'], source_node['y'], source_node['z']],
                    'targetPos': [target_node['x'], target_node['y'], target_node['z']],
                    'type': relationship['type'],
                    'strength': relationship['strength'],
                    'confidence': relationship['confidence'],
                    'evidence': relationship['evidence'],
                    'color': '#FF1493'  # Hot pink for hidden relationships
                })
        
        # Create community clusters
        communities = self.relationship_detector.detect_communities(graph)
        for i, community in enumerate(communities):
            if len(community) > 2:
                community_nodes = [n for n in visualization['nodes'] if n['id'] in community]
                
                if community_nodes:
                    center_x = sum(n['x'] for n in community_nodes) / len(community_nodes)
                    center_y = sum(n['y'] for n in community_nodes) / len(community_nodes)
                    center_z = sum(n['z'] for n in community_nodes) / len(community_nodes)
                    
                    visualization['community_clusters'].append({
                        'id': f'community_{i}',
                        'center': [center_x, center_y, center_z],
                        'radius': 3.0,
                        'member_count': len(community),
                        'members': community,
                        'color': '#9370DB'  # Purple for communities
                    })
        
        return visualization
    
    def graph_to_dict(self, graph: nx.Graph) -> Dict[str, Any]:
        """Convert NetworkX graph to dictionary for JSON serialization"""
        return {
            'nodes': [
                {
                    'id': node,
                    'attributes': {
                        'platforms': list(data.get('platforms', set())),
                        'locations': list(data.get('locations', set())),
                        'interactions': data.get('interactions', 0),
                        'call_duration': data.get('call_duration', 0)
                    }
                }
                for node, data in graph.nodes(data=True)
            ],
            'edges': [
                {
                    'source': edge[0],
                    'target': edge[1],
                    'weight': edge[2].get('weight', 0.5)
                }
                for edge in graph.edges(data=True)
            ]
        }

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python gnn_alias_resolver.py <ufdr_file_path>"}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    try:
        # Load UFDR data
        with open(file_path, 'r', encoding='utf-8') as f:
            ufdr_data = json.load(f)
        
        # Process with GNN
        processor = GNNProcessor()
        result = processor.process_ufdr_data(ufdr_data)
        
        # Output JSON result
        print(json.dumps(result, indent=2, default=str))
        
    except Exception as e:
        print(json.dumps({"error": f"GNN processing failed: {str(e)}"}))
        sys.exit(1)

if __name__ == '__main__':
    main()
