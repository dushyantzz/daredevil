/** Type declarations for Three.js / React Three Fiber JSX elements */
import '@react-three/fiber'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      instancedMesh: any
      mesh: any
      sphereGeometry: any
      meshStandardMaterial: any
      meshBasicMaterial: any
    }
  }
}

export {}

