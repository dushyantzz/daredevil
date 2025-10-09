'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Video, PlaySquare, FolderOpen, BarChart2, Database, MessageCircle, Eye, Brain } from "lucide-react"

export function HeaderNav() {
  const pathname = usePathname()

  const navItems = [
    // Core forensic analysis features - positioned first
    { href: "/pages/ufdr-analysis", icon: Database, label: "UFDR Analysis" },
    { href: "/pages/ufdr-3d-visualization", icon: Eye, label: "3D Visualization" },
    { href: "/pages/ufdr-3d-visualization-gnn", icon: Brain, label: "GNN Analysis" },
    { href: "/pages/nlp-query-interface", icon: MessageCircle, label: "NLP Query" },
    // Secondary features - positioned after
    { href: "/pages/upload", icon: Video, label: "Upload" },
    { href: "/pages/realtimeStreamPage", icon: PlaySquare, label: "Realtime" },
    { href: "/pages/saved-videos", icon: FolderOpen, label: "Library" },
    { href: "/pages/statistics", icon: BarChart2, label: "Statistics" },
  ]

  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center gap-2 px-3 h-[42px] rounded-full
              font-medium text-sm uppercase tracking-wide
              transition-all duration-300 ease-out whitespace-nowrap
              ${isActive
                ? 'bg-white text-black'
                : 'bg-transparent text-white hover:bg-white hover:text-black'
              }
            `}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span className="whitespace-nowrap">{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
