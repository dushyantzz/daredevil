"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export default function MainOptionsRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    const redirectUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      // Redirect to protected page if user is authenticated
      if (user) {
        router.push('/protected')
      } else {
        router.push('/')
      }
    }
    
    redirectUser()
  }, [router])
  
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Redirecting...</h2>
        <p>Please wait while we redirect you to the appropriate page.</p>
      </div>
    </div>
  )
}
