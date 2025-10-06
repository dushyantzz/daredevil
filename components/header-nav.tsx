'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Video, PlaySquare, FolderOpen, BarChart2, Database, MessageCircle, Eye } from "lucide-react"

export function HeaderNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/pages/upload", icon: Video, label: "Upload" },
    { href: "/pages/realtimeStreamPage", icon: PlaySquare, label: "Realtime" },
    { href: "/pages/saved-videos", icon: FolderOpen, label: "Library" },
    { href: "/pages/statistics", icon: BarChart2, label: "Statistics" },
    { href: "/pages/ufdr-analysis", icon: Database, label: "UFDR Analysis" },
    { href: "/pages/ufdr-3d-visualization", icon: Eye, label: "3D Visualization" },
    { href: "/pages/nlp-query-interface", icon: MessageCircle, label: "NLP Query" },
  ]

  return (
    <div className="flex items-center gap-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center gap-2 px-4 h-[42px] rounded-full
              font-medium text-sm uppercase tracking-wide
              transition-all duration-300 ease-out
              ${isActive
                ? 'bg-white text-black'
                : 'bg-transparent text-white hover:bg-white hover:text-black'
              }
            `}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
