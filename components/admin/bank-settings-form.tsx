"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { mockBankSettings } from "@/lib/mock-data"
import { BankSettings } from "@/lib/types"
import { Building2, MapPin, User, Clock, Save } from "lucide-react"
import { toast } from "sonner"

export function BankSettingsForm() {
  const [settings, setSettings] = useState<BankSettings>(mockBankSettings)
  const [isSaving, setIsSaving] = useState(false)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setSettings({
      ...settings,
      [name]: value,
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success("Paramètres de la banque mis à jour avec succès")
    setIsSaving(false)
  }

  const currencies = ["MAD", "EUR", "USD", "GBP"]
  const timezones = [
    "Africa/Casablanca",
    "Africa/Cairo",
    "Europe/Paris",
    "Europe/London",
    "America/New_York",
    "Asia/Dubai",
  ]

  return (
    <div className="space-y-6">
      {/* Main Bank Information */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Building2 className="w-5 h-5 text-blue-600" />
            Informations Bancaires Générales
          </CardTitle>
          <CardDescription className="text-slate-600">
            Gérez les informations principales de votre banque partenaire
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="bankName">Nom de la Banque *</Label>
              <Input
                id="bankName"
                name="bankName"
                value={settings.bankName}
                onChange={handleInputChange}
                placeholder="Ex: Banque CIH"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="bankCode">Code Bancaire *</Label>
              <Input
                id="bankCode"
                name="bankCode"
                value={settings.bankCode}
                onChange={handleInputChange}
                placeholder="Ex: CIHMMA2C"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="swiftCode">Code SWIFT *</Label>
              <Input
                id="swiftCode"
                name="swiftCode"
                value={settings.swiftCode}
                onChange={handleInputChange}
                placeholder="Ex: CIHMMA2CXXX"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="currency">Devise Principale *</Label>
              <Select value={settings.currency} onValueChange={(value) => 
                setSettings({ ...settings, currency: value })
              }>
                <SelectTrigger className="mt-2" id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr} value={curr}>
                      {curr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <User className="w-5 h-5 text-green-600" />
            Informations de Contact Principal
          </CardTitle>
          <CardDescription className="text-slate-600">
            Coordonnées du responsable administratif de la banque
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="mainContactName">Nom du Contact *</Label>
              <Input
                id="mainContactName"
                name="mainContactName"
                value={settings.mainContactName}
                onChange={handleInputChange}
                placeholder="Nom complet"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="mainContactEmail">Email du Contact *</Label>
              <Input
                id="mainContactEmail"
                name="mainContactEmail"
                type="email"
                value={settings.mainContactEmail}
                onChange={handleInputChange}
                placeholder="email@banque.com"
                className="mt-2"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="mainContactPhone">Téléphone du Contact</Label>
              <Input
                id="mainContactPhone"
                name="mainContactPhone"
                type="tel"
                value={settings.mainContactPhone}
                onChange={handleInputChange}
                placeholder="+212 5 xx xx xx xx"
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <MapPin className="w-5 h-5 text-yellow-600" />
            Adresse
          </CardTitle>
          <CardDescription className="text-slate-600">
            Adresse physique de la banque
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="address">Adresse *</Label>
            <Input
              id="address"
              name="address"
              value={settings.address}
              onChange={handleInputChange}
              placeholder="Rue, numéro"
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="city">Ville *</Label>
              <Input
                id="city"
                name="city"
                value={settings.city}
                onChange={handleInputChange}
                placeholder="Casablanca"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="postalCode">Code Postal *</Label>
              <Input
                id="postalCode"
                name="postalCode"
                value={settings.postalCode}
                onChange={handleInputChange}
                placeholder="20000"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="country">Pays *</Label>
              <Input
                id="country"
                name="country"
                value={settings.country}
                onChange={handleInputChange}
                placeholder="Morocco"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="timezone">Fuseau Horaire *</Label>
              <Select value={settings.timezone} onValueChange={(value) => 
                setSettings({ ...settings, timezone: value })
              }>
                <SelectTrigger className="mt-2" id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-slate-900">
            <Clock className="w-5 h-5 text-purple-600" />
            Informations Système
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-slate-600">Date de création</p>
              <p className="text-sm text-slate-900 mt-1">
                {settings.createdAt.toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600">Dernière mise à jour</p>
              <p className="text-sm text-slate-900 mt-1">
                {settings.updatedAt.toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="lg"
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </div>
    </div>
  )
}
