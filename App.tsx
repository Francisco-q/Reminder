"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Bell, Calendar, CheckCircle, Circle, Clock, Pill, Plus } from "lucide-react"
import { useEffect, useState } from "react"

interface Medication {
    id: string
    name: string
    dosage: string
    frequency: string
    times: string[]
    notes?: string
    color: string
}

interface DailySchedule {
    medicationId: string
    time: string
    taken: boolean
    takenAt?: string
}

const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500", "bg-indigo-500"]

export default function MedicationReminder() {
    const [medications, setMedications] = useState<Medication[]>([])
    const [dailySchedule, setDailySchedule] = useState<DailySchedule[]>([])
    const [isAddingMedication, setIsAddingMedication] = useState(false)
    const [currentTime, setCurrentTime] = useState(new Date())
    const { toast } = useToast()

    // Cargar datos del localStorage
    useEffect(() => {
        const savedMedications = localStorage.getItem("medications")
        const savedSchedule = localStorage.getItem("dailySchedule")
        const today = new Date().toDateString()
        const savedDate = localStorage.getItem("scheduleDate")

        if (savedMedications) {
            setMedications(JSON.parse(savedMedications))
        }

        // Si es un nuevo día, resetear el horario
        if (savedSchedule && savedDate === today) {
            setDailySchedule(JSON.parse(savedSchedule))
        } else {
            // Generar nuevo horario para hoy
            if (savedMedications) {
                const meds = JSON.parse(savedMedications)
                generateDailySchedule(meds)
            }
        }
    }, [])

    // Actualizar hora actual cada minuto
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 60000)
        return () => clearInterval(timer)
    }, [])

    // Verificar alarmas
    useEffect(() => {
        const checkAlarms = () => {
            const now = new Date()
            const currentTimeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

            dailySchedule.forEach((item) => {
                if (item.time === currentTimeStr && !item.taken) {
                    const medication = medications.find((m) => m.id === item.medicationId)
                    if (medication) {
                        toast({
                            title: "¡Hora de tomar tu medicamento!",
                            description: `${medication.name} - ${medication.dosage}`,
                        })

                        // Notificación del navegador si está disponible
                        if ("Notification" in window && Notification.permission === "granted") {
                            new Notification(`Medicamento: ${medication.name}`, {
                                body: `Es hora de tomar ${medication.dosage}`,
                                icon: "/placeholder.svg?height=64&width=64",
                            })
                        }
                    }
                }
            })
        }

        checkAlarms()
    }, [currentTime, dailySchedule, medications, toast])

    // Solicitar permisos de notificación
    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission()
        }
    }, [])

    const generateDailySchedule = (meds: Medication[]) => {
        const schedule: DailySchedule[] = []
        meds.forEach((med) => {
            med.times.forEach((time) => {
                schedule.push({
                    medicationId: med.id,
                    time,
                    taken: false,
                })
            })
        })
        schedule.sort((a, b) => a.time.localeCompare(b.time))
        setDailySchedule(schedule)
        localStorage.setItem("dailySchedule", JSON.stringify(schedule))
        localStorage.setItem("scheduleDate", new Date().toDateString())
    }

    const addMedication = (medicationData: Omit<Medication, "id" | "color">) => {
        const newMedication: Medication = {
            ...medicationData,
            id: Date.now().toString(),
            color: colors[medications.length % colors.length],
        }

        const updatedMedications = [...medications, newMedication]
        setMedications(updatedMedications)
        localStorage.setItem("medications", JSON.stringify(updatedMedications))

        // Regenerar horario diario
        generateDailySchedule(updatedMedications)
        setIsAddingMedication(false)

        toast({
            title: "Medicamento agregado",
            description: `${newMedication.name} ha sido agregado a tu lista`,
        })
    }

    const toggleMedicationTaken = (medicationId: string, time: string) => {
        const updatedSchedule = dailySchedule.map((item) => {
            if (item.medicationId === medicationId && item.time === time) {
                return {
                    ...item,
                    taken: !item.taken,
                    takenAt: !item.taken ? new Date().toLocaleTimeString() : undefined,
                }
            }
            return item
        })

        setDailySchedule(updatedSchedule)
        localStorage.setItem("dailySchedule", JSON.stringify(updatedSchedule))

        const medication = medications.find((m) => m.id === medicationId)
        if (medication) {
            const action = updatedSchedule.find((s) => s.medicationId === medicationId && s.time === time)?.taken
                ? "marcado como tomado"
                : "desmarcado"
            toast({
                title: `Medicamento ${action}`,
                description: `${medication.name} a las ${time}`,
            })
        }
    }

    const getTodayProgress = () => {
        const total = dailySchedule.length
        const taken = dailySchedule.filter((item) => item.taken).length
        return { taken, total, percentage: total > 0 ? (taken / total) * 100 : 0 }
    }

    const getUpcomingMedications = () => {
        const now = new Date()
        const currentTimeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

        return dailySchedule.filter((item) => !item.taken && item.time >= currentTimeStr).slice(0, 3)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
                        <Pill className="h-8 w-8 text-blue-600" />
                        Recordatorio de Medicamentos
                    </h1>
                    <p className="text-gray-600">Mantén tu salud al día con recordatorios inteligentes</p>
                </div>

                {/* Progress Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Progreso de Hoy
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-green-600">
                                    {getTodayProgress().taken}/{getTodayProgress().total}
                                </p>
                                <p className="text-sm text-gray-600">Medicamentos tomados</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-semibold">{getTodayProgress().percentage.toFixed(0)}%</p>
                                <p className="text-sm text-gray-600">Completado</p>
                            </div>
                        </div>
                        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${getTodayProgress().percentage}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue="today" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="today">Hoy</TabsTrigger>
                        <TabsTrigger value="medications">Medicamentos</TabsTrigger>
                        <TabsTrigger value="upcoming">Próximos</TabsTrigger>
                    </TabsList>

                    {/* Horario de Hoy */}
                    <TabsContent value="today" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Horario de Hoy</h2>
                            <p className="text-sm text-gray-600">
                                {new Date().toLocaleDateString("es-ES", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </p>
                        </div>

                        <div className="space-y-3">
                            {dailySchedule.length === 0 ? (
                                <Card>
                                    <CardContent className="text-center py-8">
                                        <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600">No hay medicamentos programados para hoy</p>
                                        <p className="text-sm text-gray-500 mt-2">Agrega medicamentos para comenzar</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                dailySchedule.map((item, index) => {
                                    const medication = medications.find((m) => m.id === item.medicationId)
                                    if (!medication) return null

                                    return (
                                        <Card key={index} className={`border-l-4 ${medication.color} ${item.taken ? "bg-green-50" : ""}`}>
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleMedicationTaken(item.medicationId, item.time)}
                                                            className="p-1"
                                                        >
                                                            {item.taken ? (
                                                                <CheckCircle className="h-6 w-6 text-green-600" />
                                                            ) : (
                                                                <Circle className="h-6 w-6 text-gray-400" />
                                                            )}
                                                        </Button>
                                                        <div>
                                                            <h3 className={`font-semibold ${item.taken ? "line-through text-gray-500" : ""}`}>
                                                                {medication.name}
                                                            </h3>
                                                            <p className={`text-sm ${item.taken ? "text-gray-400" : "text-gray-600"}`}>
                                                                {medication.dosage}
                                                            </p>
                                                            {item.taken && item.takenAt && (
                                                                <p className="text-xs text-green-600">Tomado a las {item.takenAt}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge variant={item.taken ? "secondary" : "default"}>
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            {item.time}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })
                            )}
                        </div>
                    </TabsContent>

                    {/* Lista de Medicamentos */}
                    <TabsContent value="medications" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Mis Medicamentos</h2>
                            <Dialog open={isAddingMedication} onOpenChange={setIsAddingMedication}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Agregar Medicamento
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Agregar Nuevo Medicamento</DialogTitle>
                                        <DialogDescription>Completa la información del medicamento y sus horarios</DialogDescription>
                                    </DialogHeader>
                                    <AddMedicationForm onAdd={addMedication} />
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="grid gap-4">
                            {medications.length === 0 ? (
                                <Card>
                                    <CardContent className="text-center py-8">
                                        <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600">No tienes medicamentos registrados</p>
                                        <Button className="mt-4" onClick={() => setIsAddingMedication(true)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Agregar tu primer medicamento
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                medications.map((medication) => (
                                    <Card key={medication.id} className={`border-l-4 ${medication.color}`}>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Pill className="h-5 w-5" />
                                                {medication.name}
                                            </CardTitle>
                                            <CardDescription>{medication.dosage}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <p className="text-sm">
                                                    <strong>Frecuencia:</strong> {medication.frequency}
                                                </p>
                                                <div>
                                                    <p className="text-sm font-medium mb-2">Horarios:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {medication.times.map((time, index) => (
                                                            <Badge key={index} variant="outline">
                                                                <Clock className="h-3 w-3 mr-1" />
                                                                {time}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                {medication.notes && (
                                                    <p className="text-sm text-gray-600">
                                                        <strong>Notas:</strong> {medication.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    {/* Próximos Medicamentos */}
                    <TabsContent value="upcoming" className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            <h2 className="text-xl font-semibold">Próximos Medicamentos</h2>
                        </div>

                        <div className="space-y-3">
                            {getUpcomingMedications().length === 0 ? (
                                <Card>
                                    <CardContent className="text-center py-8">
                                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                        <p className="text-gray-600">¡Excelente! No tienes más medicamentos pendientes por hoy</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                getUpcomingMedications().map((item, index) => {
                                    const medication = medications.find((m) => m.id === item.medicationId)
                                    if (!medication) return null

                                    return (
                                        <Card key={index} className={`border-l-4 ${medication.color}`}>
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Bell className="h-5 w-5 text-orange-500" />
                                                        <div>
                                                            <h3 className="font-semibold">{medication.name}</h3>
                                                            <p className="text-sm text-gray-600">{medication.dosage}</p>
                                                        </div>
                                                    </div>
                                                    <Badge>
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {item.time}
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

function AddMedicationForm({ onAdd }: { onAdd: (medication: Omit<Medication, "id" | "color">) => void }) {
    const [name, setName] = useState("")
    const [dosage, setDosage] = useState("")
    const [frequency, setFrequency] = useState("")
    const [times, setTimes] = useState<string[]>([])
    const [notes, setNotes] = useState("")
    const [newTime, setNewTime] = useState("")

    const addTime = () => {
        if (newTime && !times.includes(newTime)) {
            setTimes([...times, newTime].sort())
            setNewTime("")
        }
    }

    const removeTime = (timeToRemove: string) => {
        setTimes(times.filter((time) => time !== timeToRemove))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (name && dosage && frequency && times.length > 0) {
            onAdd({
                name,
                dosage,
                frequency,
                times,
                notes: notes || undefined,
            })
            // Reset form
            setName("")
            setDosage("")
            setFrequency("")
            setTimes([])
            setNotes("")
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="name">Nombre del Medicamento</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="ej. Ibuprofeno" required />
            </div>

            <div>
                <Label htmlFor="dosage">Dosis</Label>
                <Input
                    id="dosage"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="ej. 400mg"
                    required
                />
            </div>

            <div>
                <Label htmlFor="frequency">Frecuencia</Label>
                <Select value={frequency} onValueChange={setFrequency} required>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona la frecuencia" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Una vez al día">Una vez al día</SelectItem>
                        <SelectItem value="Dos veces al día">Dos veces al día</SelectItem>
                        <SelectItem value="Tres veces al día">Tres veces al día</SelectItem>
                        <SelectItem value="Cuatro veces al día">Cuatro veces al día</SelectItem>
                        <SelectItem value="Cada 8 horas">Cada 8 horas</SelectItem>
                        <SelectItem value="Cada 12 horas">Cada 12 horas</SelectItem>
                        <SelectItem value="Según necesidad">Según necesidad</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label>Horarios</Label>
                <div className="flex gap-2 mt-2">
                    <Input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
                    <Button type="button" onClick={addTime} variant="outline">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {times.map((time) => (
                        <Badge key={time} variant="secondary" className="cursor-pointer" onClick={() => removeTime(time)}>
                            {time} ×
                        </Badge>
                    ))}
                </div>
            </div>

            <div>
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="ej. Tomar con comida"
                />
            </div>

            <Button type="submit" className="w-full" disabled={!name || !dosage || !frequency || times.length === 0}>
                Agregar Medicamento
            </Button>
        </form>
    )
}
