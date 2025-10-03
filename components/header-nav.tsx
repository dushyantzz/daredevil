import Link from "next/link"
import { Video, PlaySquare, FolderOpen, BarChart2, Database, MessageCircle } from "lucide-react"
import { Button } from "./ui/button"

export function HeaderNav() {
  return (
    <div className="flex items-center gap-4">
      <Button asChild variant="ghost" size="sm" className="font-medium">
        <Link href="/pages/upload" className="flex items-center gap-2">
          <Video className="h-4 w-4" />
          <span>Upload</span>
        </Link>
      </Button>
      <Button asChild variant="ghost" size="sm" className="font-medium">
        <Link href="/pages/realtimeStreamPage" className="flex items-center gap-2">
          <PlaySquare className="h-4 w-4" />
          <span>Realtime</span>
        </Link>
      </Button>
      <Button asChild variant="ghost" size="sm" className="font-medium">
        <Link href="/pages/saved-videos" className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4" />
          <span>Library</span>
        </Link>
      </Button>
      <Button asChild variant="ghost" size="sm" className="font-medium">
        <Link href="/pages/statistics" className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4" />
          <span>Statistics</span>
        </Link>
      </Button>
      <Button asChild variant="ghost" size="sm" className="font-medium">
        <Link href="/pages/ufdr-analysis" className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          <span>UFDR Analysis</span>
        </Link>
      </Button>
      <Button asChild variant="ghost" size="sm" className="font-medium">
        <Link href="/pages/nlp-query-interface" className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          <span>NLP Query</span>
        </Link>
      </Button>
    </div>
  )
}
