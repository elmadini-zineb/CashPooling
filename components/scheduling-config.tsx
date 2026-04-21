"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Clock } from "lucide-react"
import type { SchedulingConfig } from "@/lib/types"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface SchedulingConfigProps {
  config: SchedulingConfig
  onChange: (config: SchedulingConfig) => void
  label?: string
}

export function SchedulingConfigComponent({ config, onChange, label }: SchedulingConfigProps) {
  const handleUpdate = (updates: Partial<SchedulingConfig>) => {
    onChange({ ...config, ...updates })
  }

  return (
    <div className="space-y-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-slate-600" />
        <Label className="text-sm font-semibold text-slate-700">{label || "Fréquence de nivellement"}</Label>
      </div>

      {/* Frequency Selection */}
      <div className="space-y-2">
        <Label htmlFor="frequency" className="text-sm">
          Type de fréquence <span className="text-red-500">*</span>
        </Label>
        <Select
          value={config.frequency}
          onValueChange={(value: any) =>
            handleUpdate({
              frequency: value,
              weeklyDay: undefined,
              monthlyDay: undefined,
              futureDate: undefined,
            })
          }
        >
          <SelectTrigger id="frequency">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Quotidienne</SelectItem>
            <SelectItem value="weekly">Hebdomadaire</SelectItem>
            <SelectItem value="monthly">Mensuelle</SelectItem>
            <SelectItem value="end_of_month">Fin de mois</SelectItem>
            <SelectItem value="future_date">À date future</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Weekly Day Selection */}
      {config.frequency === "weekly" && (
        <div className="space-y-2">
          <Label htmlFor="weeklyDay" className="text-sm">
            Jour de la semaine <span className="text-red-500">*</span>
          </Label>
          <Select
            value={config.weeklyDay?.toString() || ""}
            onValueChange={(value) => handleUpdate({ weeklyDay: Number(value) })}
          >
            <SelectTrigger id="weeklyDay">
              <SelectValue placeholder="Sélectionner un jour..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Lundi</SelectItem>
              <SelectItem value="2">Mardi</SelectItem>
              <SelectItem value="3">Mercredi</SelectItem>
              <SelectItem value="4">Jeudi</SelectItem>
              <SelectItem value="5">Vendredi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Monthly Day Selection */}
      {config.frequency === "monthly" && (
        <div className="space-y-2">
          <Label htmlFor="monthlyDay" className="text-sm">
            Jour du mois <span className="text-red-500">*</span>
          </Label>
          <Select
            value={config.monthlyDay?.toString() || ""}
            onValueChange={(value) => handleUpdate({ monthlyDay: Number(value) })}
          >
            <SelectTrigger id="monthlyDay">
              <SelectValue placeholder="Sélectionner un jour..." />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                <SelectItem key={day} value={day.toString()}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500">Jour 1 à 30 du mois</p>
        </div>
      )}

      {/* Future Date Selection */}
      {config.frequency === "future_date" && (
        <div className="space-y-2">
          <Label className="text-sm">
            Date d'exécution <span className="text-red-500">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {config.futureDate ? (
                  format(config.futureDate, "PPP", { locale: fr })
                ) : (
                  <span className="text-slate-500">Sélectionner une date...</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={config.futureDate}
                onSelect={(date) => handleUpdate({ futureDate: date })}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <p className="text-xs text-slate-500">Exécution unique à cette date</p>
        </div>
      )}

      {/* Execution Time */}
      {config.frequency !== "future_date" && (
        <div className="space-y-2">
          <Label htmlFor="executionTime" className="text-sm">
            Heure d'exécution (optionnel)
          </Label>
          <Input
            id="executionTime"
            type="time"
            value={config.executionTime || ""}
            onChange={(e) => handleUpdate({ executionTime: e.target.value })}
            placeholder="HH:MM"
          />
          <p className="text-xs text-slate-500">Heure à laquelle le nivellement sera exécuté</p>
        </div>
      )}
    </div>
  )
}
