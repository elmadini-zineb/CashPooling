"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Repeat, Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import type { PeriodicityType, PeriodicityUnit } from "@/lib/types"

export interface ContractPeriodicityValue {
  periodicityType: PeriodicityType
  frequency?: number
  unit?: PeriodicityUnit
  executionTime?: string
  // Paramètres spécifiques par type
  dailyInterval?: number
  weeklyInterval?: number
  weekDays?: string[] // ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
  monthlyInterval?: number
  monthlyDay?: number // 1-31
  // Plage de récurrence (Outlook-like)
  recurrenceStartDate?: Date
  recurrenceEndType?: "none" | "after-occurrences" | "on-date" // "none" by default
  recurrenceEndOccurrences?: number
  recurrenceEndDate?: Date
}

interface ContractPeriodicityPanelProps {
  value: ContractPeriodicityValue
  onChange: (value: ContractPeriodicityValue) => void
  error?: string
}

const periodicityLabels: Record<Exclude<PeriodicityType, "REAL_TIME">, string> = {
  DAILY: "Quotidienne",
  WEEKLY: "Hebdomadaire",
  MONTHLY: "Mensuelle",
  CUSTOM: "Personnalisée",
}

const weekDaysOptions = [
  { value: "MON", label: "Lun" },
  { value: "TUE", label: "Mar" },
  { value: "WED", label: "Mer" },
  { value: "THU", label: "Jeu" },
  { value: "FRI", label: "Ven" },
  { value: "SAT", label: "Sam" },
  { value: "SUN", label: "Dim" },
]

export function ContractPeriodicityPanel({ value, onChange, error }: ContractPeriodicityPanelProps) {
  const handleTypeChange = (periodicityType: PeriodicityType) => {
    const nextValue: ContractPeriodicityValue = {
      ...value,
      periodicityType: periodicityType as Exclude<PeriodicityType, "REAL_TIME">,
    }

    // Initialize default values for the new type
    if (periodicityType === "DAILY") {
      nextValue.dailyInterval = nextValue.dailyInterval || 1
    } else if (periodicityType === "WEEKLY") {
      nextValue.weeklyInterval = nextValue.weeklyInterval || 1
      nextValue.weekDays = nextValue.weekDays || ["MON", "FRI"]
    } else if (periodicityType === "MONTHLY") {
      nextValue.monthlyInterval = nextValue.monthlyInterval || 1
      nextValue.monthlyDay = nextValue.monthlyDay || 1
    } else if (periodicityType === "CUSTOM") {
      nextValue.frequency = nextValue.frequency || 1
      nextValue.unit = nextValue.unit || "DAY"
    }

    // Initialize recurrence range if not set
    if (!nextValue.recurrenceStartDate) {
      nextValue.recurrenceStartDate = new Date()
    }
    if (!nextValue.recurrenceEndType) {
      nextValue.recurrenceEndType = "none"
    }

    onChange(nextValue)
  }

  const handleDailyIntervalChange = (interval: number) => {
    onChange({ ...value, dailyInterval: interval > 0 ? interval : undefined })
  }

  const handleWeeklyIntervalChange = (interval: number) => {
    onChange({ ...value, weeklyInterval: interval > 0 ? interval : undefined })
  }

  const handleWeekDayToggle = (day: string) => {
    const weekDays = value.weekDays || []
    const newWeekDays = weekDays.includes(day)
      ? weekDays.filter((d) => d !== day)
      : [...weekDays, day]
    onChange({ ...value, weekDays: newWeekDays.length > 0 ? newWeekDays : undefined })
  }

  const handleMonthlyIntervalChange = (interval: number) => {
    onChange({ ...value, monthlyInterval: interval > 0 ? interval : undefined })
  }

  const handleMonthlyDayChange = (day: number) => {
    onChange({ ...value, monthlyDay: day >= 1 && day <= 31 ? day : undefined })
  }

  const handleCustomFrequencyChange = (frequency: number) => {
    onChange({ ...value, frequency: frequency > 0 ? frequency : undefined })
  }

  const handleCustomUnitChange = (unit: PeriodicityUnit) => {
    onChange({ ...value, unit })
  }

  const handleExecutionTimeChange = (executionTime: string) => {
    onChange({ ...value, executionTime: executionTime || undefined })
  }

  const handleStartDateChange = (date: Date | undefined) => {
    onChange({ ...value, recurrenceStartDate: date })
  }

  const handleEndTypeChange = (endType: "none" | "after-occurrences" | "on-date") => {
    const nextValue: ContractPeriodicityValue = {
      ...value,
      recurrenceEndType: endType,
    }
    if (endType !== "after-occurrences") {
      nextValue.recurrenceEndOccurrences = undefined
    }
    if (endType !== "on-date") {
      nextValue.recurrenceEndDate = undefined
    }
    onChange(nextValue)
  }

  const handleEndOccurrencesChange = (occurrences: number) => {
    onChange({ ...value, recurrenceEndOccurrences: occurrences > 0 ? occurrences : undefined })
  }

  const handleEndDateChange = (date: Date | undefined) => {
    onChange({ ...value, recurrenceEndDate: date })
  }

  // Ensure we have at least weekly as default if no type selected
  const displayType = (value.periodicityType === "REAL_TIME" ? "WEEKLY" : value.periodicityType) as Exclude<
    PeriodicityType,
    "REAL_TIME"
  >

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Repeat className="w-5 h-5 text-slate-700" />
          <CardTitle>Exécution Périodicité</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Type Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">
            Type d'exécution <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={displayType}
            onValueChange={(newValue) => handleTypeChange(newValue as Exclude<PeriodicityType, "REAL_TIME">)}
            className="grid gap-3 sm:grid-cols-4"
          >
            {(Object.keys(periodicityLabels) as Exclude<PeriodicityType, "REAL_TIME">[]).map((type) => (
              <label
                key={type}
                htmlFor={`periodicity-${type}`}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-900 transition hover:border-slate-300"
              >
                <RadioGroupItem value={type} id={`periodicity-${type}`} className="border-slate-300 bg-white text-slate-900 shadow-sm" />
                <span>{periodicityLabels[type]}</span>
              </label>
            ))}
          </RadioGroup>
        </div>

        {/* SECTION A: Paramètres de récurrence */}
        <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Paramètres de récurrence</h3>

          {displayType === "DAILY" ? (
            <div className="space-y-2">
              <Label htmlFor="daily-interval" className="text-sm">
                Tous les <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="daily-interval"
                  type="number"
                  min={1}
                  value={value.dailyInterval ?? ""}
                  onChange={(event) => handleDailyIntervalChange(Number(event.target.value))}
                  placeholder="Ex: 1"
                  className="w-24"
                />
                <span className="text-sm text-slate-700">jour(s)</span>
              </div>
            </div>
          ) : displayType === "WEEKLY" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="weekly-interval" className="text-sm">
                  Toutes les <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="weekly-interval"
                    type="number"
                    min={1}
                    value={value.weeklyInterval ?? ""}
                    onChange={(event) => handleWeeklyIntervalChange(Number(event.target.value))}
                    placeholder="Ex: 1"
                    className="w-24"
                  />
                  <span className="text-sm text-slate-700">semaine(s)</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">
                  Jours de la semaine <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {weekDaysOptions.map((day) => (
                    <label
                      key={day.value}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition hover:border-blue-300"
                    >
                      <Checkbox
                        checked={value.weekDays?.includes(day.value) ?? false}
                        onCheckedChange={() => handleWeekDayToggle(day.value)}
                        className="border-slate-300"
                      />
                      <span className="text-slate-700">{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          ) : displayType === "MONTHLY" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="monthly-interval" className="text-sm">
                  Tous les <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="monthly-interval"
                    type="number"
                    min={1}
                    value={value.monthlyInterval ?? ""}
                    onChange={(event) => handleMonthlyIntervalChange(Number(event.target.value))}
                    placeholder="Ex: 1"
                    className="w-24"
                  />
                  <span className="text-sm text-slate-700">mois</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly-day" className="text-sm">
                  Le <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={String(value.monthlyDay ?? 1)}
                  onValueChange={(newValue) => handleMonthlyDayChange(Number(newValue))}
                >
                  <SelectTrigger id="monthly-day">
                    <SelectValue placeholder="Sélectionner le jour..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={String(day)}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : displayType === "CUSTOM" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="custom-frequency" className="text-sm">
                  Fréquence <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="custom-frequency"
                  type="number"
                  min={1}
                  value={value.frequency ?? ""}
                  onChange={(event) => handleCustomFrequencyChange(Number(event.target.value))}
                  placeholder="Ex: 3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-unit" className="text-sm">
                  Unité <span className="text-red-500">*</span>
                </Label>
                <Select value={value.unit ?? ""} onValueChange={(newValue) => handleCustomUnitChange(newValue as PeriodicityUnit)}>
                  <SelectTrigger id="custom-unit">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAY">Jours</SelectItem>
                    <SelectItem value="WEEK">Semaines</SelectItem>
                    <SelectItem value="MONTH">Mois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}
        </div>

        {/* Execution Time - Optional */}
        <div className="space-y-2">
          <Label htmlFor="execution-time" className="text-sm">
            Heure d'exécution (optionnel)
          </Label>
          <Input
            id="execution-time"
            type="time"
            value={value.executionTime ?? ""}
            onChange={(event) => handleExecutionTimeChange(event.target.value)}
          />
          <p className="text-xs text-slate-500">Laissez vide pour exécuter à la première fenêtre de traitement disponible.</p>
        </div>

        {/* SECTION B: Plage de récurrence (Outlook-like) */}
        <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Plage de récurrence</h3>

          {/* Start Date */}
          <div className="space-y-2">
            <Label className="text-sm">
              Date de début <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-900 transition hover:border-slate-300">
                  <div className="flex items-center justify-between">
                    <span>
                      {value.recurrenceStartDate
                        ? format(new Date(value.recurrenceStartDate), "dd MMMM yyyy", { locale: fr })
                        : "Sélectionner une date..."}
                    </span>
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={value.recurrenceStartDate ? new Date(value.recurrenceStartDate) : undefined}
                  onSelect={handleStartDateChange}
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date Options */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Date de fin</Label>
            <RadioGroup
              value={value.recurrenceEndType ?? "none"}
              onValueChange={(newValue) => handleEndTypeChange(newValue as "none" | "after-occurrences" | "on-date")}
              className="space-y-3"
            >
              {/* No end date */}
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition hover:border-slate-300">
                <RadioGroupItem value="none" id="end-none" className="border-slate-300 bg-white text-slate-900 shadow-sm" />
                <span className="text-sm text-slate-900">Aucune date de fin</span>
              </label>

              {/* End after N occurrences */}
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <label className="flex cursor-pointer items-center gap-3">
                  <RadioGroupItem value="after-occurrences" id="end-occurrences" className="border-slate-300 bg-white text-slate-900 shadow-sm" />
                  <span className="text-sm text-slate-900">Fin après</span>
                  <Input
                    type="number"
                    min={1}
                    value={value.recurrenceEndOccurrences ?? ""}
                    onChange={(event) => handleEndOccurrencesChange(Number(event.target.value))}
                    placeholder="Ex: 10"
                    className="ml-auto w-20"
                    disabled={value.recurrenceEndType !== "after-occurrences"}
                  />
                  <span className="text-sm text-slate-900">occurrence(s)</span>
                </label>
              </div>

              {/* End on specific date */}
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <label className="flex cursor-pointer items-center gap-3">
                  <RadioGroupItem value="on-date" id="end-date" className="border-slate-300 bg-white text-slate-900 shadow-sm" />
                  <span className="text-sm text-slate-900">Fin le</span>
                </label>
                <div className="mt-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        disabled={value.recurrenceEndType !== "on-date"}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-900 transition hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center justify-between">
                          <span>
                            {value.recurrenceEndDate
                              ? format(new Date(value.recurrenceEndDate), "dd MMMM yyyy", { locale: fr })
                              : "Sélectionner une date..."}
                          </span>
                          <CalendarIcon className="w-4 h-4 text-slate-400" />
                        </div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={value.recurrenceEndDate ? new Date(value.recurrenceEndDate) : undefined}
                        onSelect={handleEndDateChange}
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </CardContent>
    </Card>
  )
}
