"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { initializeSampleData } from "@/lib/mock-data"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Initialize sample data on app load
    initializeSampleData()

    // Check if user is logged in
    const user = sessionStorage.getItem("user")
    if (user) {
      const parsedUser = JSON.parse(user)
      // Route Admin users to admin dashboard
      if (parsedUser.role === "Admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    } else {
      router.push("/login")
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto mb-4 animate-pulse" />
        <p className="text-slate-600">Chargement...</p>
      </div>
    </div>
  )
}
