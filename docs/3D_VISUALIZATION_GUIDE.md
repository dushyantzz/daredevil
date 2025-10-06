# 🎨 UFDR 3D Visualization Guide

## Overview

The new 3D visualization system uses **React Three Fiber** to create stunning, interactive 3D forensic data visualizations with cinematic effects and smooth animations.

---

## 🚀 Features

### 1. **Beautiful 3D Rendering**
- React Three Fiber canvas with WebGL rendering
- PerspectiveCamera with customizable FOV
- Ambient and directional lighting
- Fog effects for depth perception
- Bloom post-processing for glowing effects

### 2. **Interactive Data Visualization**
- Instanced meshes for rendering thousands of data points efficiently
- Color-coded categories (Chat, Call, Image, Video, App, Location)
- Animated network connections between related data points
- Hover tooltips showing data details
- Click to select and focus on specific points

### 3. **Smooth Camera Controls**
- OrbitControls for mouse interaction (zoom, pan, rotate)
- Animated camera transitions using GSAP
- View presets (Top, Side, Isometric, Default)
- Focus animation when selecting data points
- Keyboard shortcuts for quick navigation

### 4. **Visual Enhancements**
- Particle background with 1000+ animated particles
- Animated grid floor
- Glassmorphism UI panels with backdrop blur
- Gradient overlays for cinematic feel
- Smooth transitions and animations

### 5. **Performance Optimizations**
- InstancedMesh for efficient rendering
- Frustum culling for off-screen objects
- Suspense boundaries with loading fallback
- 60fps animations using useFrame hook
- Level of Detail (LOD) ready architecture

---

## 📁 File Structure

```
components/3d-visualization/
├── Scene3D.tsx              # Main canvas setup with lighting and controls
├── DataVisualizer.tsx       # Core 3D data rendering with instanced meshes
├── InteractiveControls.tsx  # Camera animations and keyboard shortcuts
├── FloatingUI.tsx           # HTML overlays and UI panels
├── ParticleBackground.tsx   # Animated particle system
├── LoadingFallback.tsx      # 3D loading animation
└── Animations.tsx           # Reusable animation hooks

app/pages/ufdr-3d-visualization-new/
└── page.tsx                 # Main page integrating all components
```

---

## 🎮 Usage

### Basic Setup

```tsx
import Scene3D from '@/components/3d-visualization/Scene3D'
import DataVisualizer from '@/components/3d-visualization/DataVisualizer'

function MyVisualization() {
  const dataPoints = [
    {
      id: 'point-1',
      position: [0, 0, 0],
      category: 'chat',
      value: 1,
      label: 'Chat with John',
      metadata: { /* ... */ }
    }
  ]

  return (
    <Scene3D>
      <DataVisualizer data={dataPoints} isAnimating={true} />
    </Scene3D>
  )
}
```

### Data Point Format

```typescript
interface DataPoint {
  id: string                          // Unique identifier
  position: [number, number, number]  // 3D coordinates [x, y, z]
  category: string                    // Category for color coding
  value: number                       // Size/importance
  label: string                       // Display name
  metadata?: any                      // Additional data
}
```

### Category Colors

```typescript
const CATEGORY_COLORS = {
  chat: '#3b82f6',      // Blue
  call: '#10b981',      // Green
  image: '#f59e0b',     // Amber
  video: '#ef4444',     // Red
  app: '#8b5cf6',       // Purple
  location: '#ec4899',  // Pink
  default: '#6b7280'    // Gray
}
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `R` | Reset view to default position |
| `F` | Focus on selected data point |
| `E` | Export scene as image |
| Mouse Drag | Rotate camera |
| Mouse Wheel | Zoom in/out |
| Right Click + Drag | Pan camera |

---

## 🎨 Customization

### Change Camera Position

```tsx
<Scene3D cameraPosition={[10, 10, 10]}>
  {/* ... */}
</Scene3D>
```

### Disable Bloom Effect

```tsx
<Scene3D enableBloom={false}>
  {/* ... */}
</Scene3D>
```

### Custom Animation Speed

```tsx
<DataVisualizer 
  data={dataPoints} 
  isAnimating={true}
  animationSpeed={2.0}  // 2x speed
/>
```

### Add Custom Lighting

```tsx
<Scene3D>
  <spotLight position={[5, 5, 5]} intensity={1} />
  <DataVisualizer data={dataPoints} />
</Scene3D>
```

---

## 🔧 Animation Hooks

### useScaleIn

Animate object scaling on mount:

```tsx
import { useScaleIn } from '@/components/3d-visualization/Animations'

function MyObject() {
  const ref = useScaleIn(1.5) // 1.5 second duration
  
  return <mesh ref={ref}>...</mesh>
}
```

### useFloating

Add floating animation:

```tsx
import { useFloating } from '@/components/3d-visualization/Animations'

function FloatingObject() {
  const ref = useFloating(0.5, 1) // amplitude, speed
  
  return <mesh ref={ref}>...</mesh>
}
```

### useRotation

Continuous rotation:

```tsx
import { useRotation } from '@/components/3d-visualization/Animations'

function RotatingObject() {
  const ref = useRotation(1) // speed
  
  return <mesh ref={ref}>...</mesh>
}
```

---

## 🎯 View Presets

### Available Presets

```typescript
type ViewPreset = 'top' | 'side' | 'isometric' | 'default'
```

### Preset Positions

```typescript
const presets = {
  top: { position: [0, 20, 0], target: [0, 0, 0] },
  side: { position: [20, 5, 0], target: [0, 0, 0] },
  isometric: { position: [10, 10, 10], target: [0, 0, 0] },
  default: { position: [0, 5, 10], target: [0, 0, 0] }
}
```

### Trigger View Change

```tsx
const [viewPreset, setViewPreset] = useState<ViewPreset | null>(null)

<InteractiveControls viewPreset={viewPreset} />

<button onClick={() => setViewPreset('top')}>
  Top View
</button>
```

---

## 📊 Performance Tips

### 1. **Use InstancedMesh for Large Datasets**

Already implemented in DataVisualizer for efficient rendering of thousands of points.

### 2. **Enable Frustum Culling**

```tsx
<instancedMesh frustumCulled={true}>
  {/* ... */}
</instancedMesh>
```

### 3. **Limit Network Connections**

The system only creates connections between points within 5 units distance.

### 4. **Use LOD for Complex Geometries**

```tsx
import { Lod } from '@react-three/drei'

<Lod distances={[0, 10, 20]}>
  <mesh geometry={highDetail} />
  <mesh geometry={mediumDetail} />
  <mesh geometry={lowDetail} />
</Lod>
```

### 5. **Optimize Particle Count**

Reduce particle count for lower-end devices:

```tsx
// In ParticleBackground.tsx
const count = isMobile ? 500 : 1000
```

---

## 🎨 Styling

### Glassmorphism Panels

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}
```

### Gradient Overlays

```tsx
<div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-purple-500/10" />
```

---

## 🔌 Integration with Backend

### Parse UFDR Data

```typescript
const parseUFDRData = (data: UFDRData): DataPoint[] => {
  const points: DataPoint[] = []
  
  // Parse chats
  data.chats?.forEach((chat, i) => {
    points.push({
      id: `chat-${i}`,
      position: generatePosition(),
      category: 'chat',
      value: 1,
      label: chat.contact,
      metadata: chat
    })
  })
  
  // Parse other data types...
  
  return points
}
```

### Upload JSON File

```tsx
const handleFileUpload = async (file: File) => {
  const text = await file.text()
  const data = JSON.parse(text)
  const points = parseUFDRData(data)
  setDataPoints(points)
}
```

---

## 🐛 Troubleshooting

### Issue: Canvas is black

**Solution:** Ensure lighting is properly configured:

```tsx
<ambientLight intensity={0.5} />
<directionalLight position={[10, 10, 5]} intensity={1} />
```

### Issue: Poor performance

**Solutions:**
1. Reduce particle count
2. Disable bloom effect
3. Limit number of network connections
4. Use simpler geometries

### Issue: Controls not working

**Solution:** Ensure OrbitControls is inside Canvas:

```tsx
<Canvas>
  <OrbitControls />
</Canvas>
```

---

## 📚 Resources

- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)
- [Three.js Docs](https://threejs.org/docs/)
- [Drei Components](https://github.com/pmndrs/drei)
- [GSAP Animation](https://greensock.com/gsap/)

---

## 🎉 Next Steps

1. **Test with real UFDR data**
2. **Customize colors and styling**
3. **Add more view presets**
4. **Implement export functionality**
5. **Add timeline scrubber**
6. **Create data filtering UI**

---

**Enjoy your beautiful 3D forensic data visualization!** 🚀

