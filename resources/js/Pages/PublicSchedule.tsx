import { Head } from '@inertiajs/react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Loader2, Globe, CheckCircle, Clock, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface Props {
    candidate?: {
        id: string
        name: string
        email: string
    }
    job?: {
        title: string
        company_name: string
        location?: string
    }
    interview?: {
        id: string
        duration_minutes: number
        interview_type?: string
    }
    existingSchedule?: {
        id: string
        scheduled_at: string
        status: string
    } | null
    token: string
    timezones: Record<string, string>
    recruiterTimezone: string
    error?: string
}

export default function PublicSchedule({ candidate, job, interview, existingSchedule, token, timezones, recruiterTimezone, error }: Props) {
    const [date, setDate] = useState<Date | undefined>(
        existingSchedule?.scheduled_at ? new Date(existingSchedule.scheduled_at) : undefined
    )

    const existingTime = existingSchedule?.scheduled_at
        ? new Date(existingSchedule.scheduled_at)
        : undefined

    const [hour, setHour] = useState(
        existingTime ? existingTime.getHours().toString().padStart(2, '0') : '09'
    )
    const [minute, setMinute] = useState(
        existingTime ? existingTime.getMinutes().toString().padStart(2, '0') : '00'
    )

    const [processing, setProcessing] = useState(false)
    const [success, setSuccess] = useState(false)

    // Auto-detect browser timezone for display
    const [browserTimezone, setBrowserTimezone] = useState<string>('')
    useEffect(() => {
        setBrowserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
    }, [])

    if (error) {
        return (
            <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
                <Head title="Scheduling Unavailable" />
                <Card className="max-w-md w-full">
                    <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                            <Clock className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Scheduling Unavailable</h2>
                        <p className="text-muted-foreground">{error}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
                <Head title="Interview Scheduled" />
                <Card className="max-w-md w-full">
                    <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-6 w-6 text-emerald-600" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Interview Scheduled!</h2>
                        <p className="text-muted-foreground mb-4">
                            Check your email for confirmation and the interview link.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            You can close this page now.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!date) {
            toast.error('Please select a date')
            return
        }

        setProcessing(true)

        try {
            const scheduledAt = new Date(date)
            scheduledAt.setHours(parseInt(hour), parseInt(minute))

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''

            const response = await fetch(`/schedule/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    scheduled_at: scheduledAt.toISOString(),
                }),
            })

            const data = await response.json()

            if (data.success) {
                setSuccess(true)
                toast.success(data.message)
            } else {
                toast.error(data.error || 'Failed to schedule interview')
            }
        } catch (err) {
            toast.error('An error occurred. Please try again.')
        } finally {
            setProcessing(false)
        }
    }

    const timezoneLabel = timezones[recruiterTimezone] || recruiterTimezone

    return (
        <div className="min-h-screen bg-muted/50">
            <Head title={`Schedule Interview - ${job?.title ?? 'Interview'}`} />

            <div className="max-w-2xl mx-auto py-8 md:pt-12 px-4 space-y-6">
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-2">
                        <Briefcase className="h-7 w-7 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Schedule Your Interview
                    </h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Pick a convenient time for your AI screening interview with <strong>{job?.company_name}</strong>
                    </p>
                </div>

                {/* Job Info Card */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Briefcase className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold">{job?.title}</h3>
                                <p className="text-sm text-muted-foreground">{job?.company_name}</p>
                                {job?.location && (
                                    <p className="text-sm text-muted-foreground">{job.location}</p>
                                )}
                                {interview?.duration_minutes && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Duration: {interview.duration_minutes} minutes
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Scheduling Card */}
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Date & Time</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Mobile: Stacked Layout */}
                            <div className="md:hidden space-y-4">
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !date && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={setDate}
                                                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label>Time</Label>
                                    <div className="flex items-center gap-2">
                                        <Select value={hour} onValueChange={setHour}>
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Hour" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 16 }, (_, i) => {
                                                    const hourNum = i + 7
                                                    const h = hourNum.toString().padStart(2, '0')
                                                    const display = hourNum < 12 ? `${hourNum} AM` : hourNum === 12 ? '12 PM' : `${hourNum - 12} PM`
                                                    return (
                                                        <SelectItem key={h} value={h}>
                                                            {display}
                                                        </SelectItem>
                                                    )
                                                })}
                                            </SelectContent>
                                        </Select>
                                        <span className="text-muted-foreground">:</span>
                                        <Select value={minute} onValueChange={setMinute}>
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Min" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
                                                    <SelectItem key={m} value={m}>
                                                        {m}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Desktop: Side by Side Layout */}
                            <div className="hidden md:grid md:grid-cols-2 md:gap-6">
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                                        className="rounded-md border w-fit"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Time</Label>
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center gap-2">
                                            <Select value={hour} onValueChange={setHour}>
                                                <SelectTrigger className="flex-1">
                                                    <SelectValue placeholder="Hour" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.from({ length: 16 }, (_, i) => {
                                                        const hourNum = i + 7
                                                        const h = hourNum.toString().padStart(2, '0')
                                                        const display = hourNum < 12 ? `${hourNum} AM` : hourNum === 12 ? '12 PM' : `${hourNum - 12} PM`
                                                        return (
                                                            <SelectItem key={h} value={h}>
                                                                {display}
                                                            </SelectItem>
                                                        )
                                                    })}
                                                </SelectContent>
                                            </Select>
                                            <span className="text-muted-foreground">:</span>
                                            <Select value={minute} onValueChange={setMinute}>
                                                <SelectTrigger className="flex-1">
                                                    <SelectValue placeholder="Min" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
                                                        <SelectItem key={m} value={m}>
                                                            {m}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {date && (
                                            <p className="text-sm text-muted-foreground">
                                                Selected: {format(new Date(`2000-01-01T${hour}:${minute}`), 'h:mm a')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Timezone Indicator */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-3">
                                <Globe className="h-4 w-4" />
                                <span>
                                    Times are in <strong>{timezoneLabel}</strong>
                                    {browserTimezone && browserTimezone !== recruiterTimezone && (
                                        <span className="text-xs ml-1">(Your timezone: {browserTimezone})</span>
                                    )}
                                </span>
                            </div>

                            {/* Submit Button */}
                            <Button type="submit" className="w-full" size="lg" disabled={processing || !date}>
                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {existingSchedule ? 'Reschedule Interview' : 'Schedule Interview'}
                            </Button>
                        </CardContent>
                    </Card>
                </form>

                {/* Candidate Info Footer */}
                <p className="text-center text-sm text-muted-foreground">
                    Scheduling for <strong>{candidate?.email}</strong>
                </p>
            </div>
        </div>
    )
}
