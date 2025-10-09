"use client"

import Link from "next/link"
import Beams from "@/components/Beams"
import AnimatedText from "@/components/animated-text"
import { Brain, Network, Search } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0" style={{ width: '100%', height: '100%' }}>
        <Beams
          beamWidth={2}
          beamHeight={15}
          beamNumber={12}
          lightColor="#ffffff"
          speed={2}
          noiseIntensity={1.75}
          scale={0.2}
          rotation={-35}
        />
      </div>

      <div className="z-10 flex flex-col md:flex-row items-center justify-between w-full max-w-6xl px-6 gap-8">
        {/* Left side with logo and name */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6 md:w-1/2">
          <h1 className="text-6xl font-bold mb-2 text-white">Invesicore AI</h1>
          <p className="text-xl text-gray-300 max-w-lg">
            Advanced AI-powered security surveillance and forensic analysis platform with UFDR data processing capabilities
          </p>
          <AnimatedText />
          <Link
            href="/sign-in"
            className="inline-block px-8 py-3 mt-6 bg-white text-black rounded-md text-xl font-semibold transition-all duration-300 ease-in-out hover:bg-gray-100"
          >
            Get Started
          </Link>
        </div>

        {/* Right side with explanation */}
        <div className="md:w-1/2 bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-white/10">
          <h2 className="text-2xl font-semibold mb-4 text-white">Why Choose Invesicore AI?</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-white">GNN-Powered Alias Resolution</h3>
                <p className="text-gray-400 text-sm">Advanced Graph Neural Network algorithms automatically resolve aliases and detect hidden relationships across multiple devices with &gt;95% accuracy.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Network className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-white">3D Network Visualization</h3>
                <p className="text-gray-400 text-sm">Interactive 3D network graphs reveal complex relationships between entities, making forensic analysis intuitive and comprehensive.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Search className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-white">Natural Language Queries</h3>
                <p className="text-gray-400 text-sm">Ask questions about UFDR forensic data in plain English using our RAG-powered AI assistant for instant insights.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-400">
            Trusted by law enforcement agencies, forensic analysts, and security professionals worldwide for advanced digital investigation capabilities.
          </div>
        </div>
      </div>
    </main>
  )
}