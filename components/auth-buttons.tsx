'use client'

import Link from "next/link"

interface AuthButtonsProps {
  user?: {
    email?: string
  } | null
  signOutAction?: any
}

export function AuthButtons({ user, signOutAction }: AuthButtonsProps) {
  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-white px-3">Hey, {user.email}!</span>
        <form action={signOutAction}>
          <button
            type="submit"
            className="px-5 h-[42px] rounded-full bg-transparent text-white border-2 border-white hover:bg-white hover:text-black font-medium text-sm uppercase tracking-wide transition-all duration-300 ease-out"
          >
            Sign out
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <Link
        href="/sign-in"
        className="px-5 h-[42px] rounded-full bg-transparent text-white border-2 border-white hover:bg-white hover:text-black font-medium text-sm uppercase tracking-wide transition-all duration-300 ease-out flex items-center justify-center"
      >
        Sign in
      </Link>

      <Link
        href="/sign-up"
        className="px-5 h-[42px] rounded-full bg-white text-black hover:bg-gray-200 font-medium text-sm uppercase tracking-wide transition-all duration-300 ease-out flex items-center justify-center"
      >
        Sign up
      </Link>
    </div>
  )
}

