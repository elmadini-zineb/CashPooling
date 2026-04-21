"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { mockUsers } from "@/lib/mock-data"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    const user = mockUsers.find((u) => u.email === email && u.password === password)

    if (user) {
      // Store user in session storage for this POC
      sessionStorage.setItem(
        "user",
        JSON.stringify({
          email: user.email,
          name: user.name,
          role: user.role,
        }),
      )
      router.push("/dashboard")
    } else {
      setError("Identifiants incorrects")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-cyan-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">Cash Pooling Manager</CardTitle>
          <CardDescription className="text-base">Connectez-vous pour gérer les souscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email professionnel
              </label>
              <Input
                id="email"
                type="email"
                placeholder="charge.affaires@banque.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Mot de passe
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>

            <div className="pt-4 border-t space-y-4">
              <div>
                <p className="text-sm text-slate-500 text-center mb-2">Comptes de test</p>
                <div className="space-y-2 text-xs">
                  {mockUsers.map((u) => (
                    <div key={u.email} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                      <div>
                        <p className="font-medium text-slate-700">{u.role}</p>
                        <p className="text-slate-500">{u.email}</p>
                      </div>
                      <span className="text-slate-400">123456</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-blue-900 mb-2">Interfaces disponibles :</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li><strong>Chargé de clientèle :</strong> Gestion Cash Pooling (sans tarification)</li>
                  <li><strong>Admin :</strong> Gestion complète + Tarification</li>
                  <li><strong>Client :</strong> Consultation des contrats personnels</li>
                </ul>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
