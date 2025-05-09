"use client"

import { useCallback } from "react"
import Particles from "react-particles"
import type { Engine } from "tsparticles-engine"
import { loadSlim } from "tsparticles-slim"

export default function ParticleBackground() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine)
  }, [])

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        background: {
          color: {
            value: "transparent",
          },
        },
        fpsLimit: 30, // Reduced from 120 to 30 for better performance
        interactivity: {
          events: {
            onClick: {
              enable: false,
              mode: "push",
            },
            onHover: {
              enable: true,
              mode: "repulse",
            },
            resize: true,
          },
          modes: {
            push: {
              quantity: 2, // Reduced from 4
            },
            repulse: {
              distance: 100, // Reduced from 200
              duration: 0.2, // Reduced from 0.4
            },
          },
        },
        particles: {
          color: {
            value: ["#9C27B0", "#3B82F6", "#EC4899"],
          },
          links: {
            color: "#ffffff",
            distance: 150, // Reduced from 200
            enable: true,
            opacity: 0.2, // Reduced from 0.3
            width: 1,
          },
          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "bounce",
            },
            random: false,
            speed: 0.5, // Reduced from 0.8
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 1200, // Increased from 1000 to reduce particle count
            },
            value: 30, // Reduced from 60
          },
          opacity: {
            value: 0.2, // Reduced from 0.3
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 1, max: 3 }, // Reduced max from 5 to 3
          },
        },
        detectRetina: true,
      }}
    />
  )
}

