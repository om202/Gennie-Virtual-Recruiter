import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Loader2, Globe } from 'lucide-react'
import { Link } from '@inertiajs/react'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useForm } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Candidate {
    id: string
    name: string
    email: string
}

interface Interview {
    id: string
    job_title: string
    interview_type?: string
    company_name?: string
}

interface Schedule {
    id: string
    interview_id: string
    candidate_id: string
    scheduled_at: string
}

interface ScheduleFormProps {
    schedule?: Schedule | null
    interviewId?: string | null
    candidates: Candidate[]
    interviews: Interview[]
    onSuccess: () => void
    onCancel: () => void
    timezoneLabel?: string
}

export function ScheduleForm({ schedule, interviewId, candidates, interviews, onSuccess, onCancel, timezoneLabel }: ScheduleFormProps) {
    const isEditing = !!schedule

    // Parse schedule date/time if editing
    const scheduledDate = schedule?.scheduled_at ? new Date(schedule.scheduled_at) : undefined
    const scheduledTime = scheduledDate
        ? `${scheduledDate.getHours().toString().padStart(2, '0')}:${scheduledDate.getMinutes().toString().padStart(2, '0')}`
        : '09:00'

    const { data, setData, post, put, processing, errors, reset, transform } = useForm({
        interview_id: schedule?.interview_id || interviewId || '',
        candidate_id: schedule?.candidate_id || '',
        date: scheduledDate,
        time: scheduledTime,
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!data.date) return

        transform((data) => {
            const [hours, minutes] = data.time.split(':').map(Number)
            const scheduledAt = new Date(data.date!)
            scheduledAt.setHours(hours, minutes)

            return {
                ...data,
                scheduled_at: scheduledAt.toISOString(),
            }
        })

        if (isEditing && schedule) {
            put(`/schedules/${schedule.id}`, {
                onSuccess: () => {
                    onSuccess()
                },
            })
        } else {
            post('/schedules', {
                onSuccess: () => {
                    reset()
                    onSuccess()
                },
            })
        }
    }

    // Filter interviews if an ID is pre-selected
    const selectedInterview = interviews.find(i => i.id === (data.interview_id || interviewId))

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Interview Selection */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Interview Details</CardTitle>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold bg-muted px-2 py-1 rounded">Step 1</span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Interview</Label>
                        {interviewId ? (
                            <div className="p-2 border rounded-md bg-muted/50 text-sm font-medium">
                                {selectedInterview?.job_title || 'Unknown Interview'}
                            </div>
                        ) : (
                            <Select
                                value={data.interview_id}
                                onValueChange={(val) => setData('interview_id', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select interview" />
                                </SelectTrigger>
                                <SelectContent>
                                    {interviews.map((interview) => (
                                        <SelectItem key={interview.id} value={interview.id}>
                                            {interview.job_title}
                                            {interview.interview_type && ` - ${interview.interview_type.charAt(0).toUpperCase() + interview.interview_type.slice(1)} Round`}
                                            {interview.company_name && ` - ${interview.company_name}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {errors.interview_id && <p className="text-sm text-destructive">{errors.interview_id}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Candidate</Label>
                        <Select
                            value={data.candidate_id}
                            onValueChange={(val) => setData('candidate_id', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select candidate" />
                            </SelectTrigger>
                            <SelectContent>
                                {candidates.map((candidate) => (
                                    <SelectItem key={candidate.id} value={candidate.id}>
                                        {candidate.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.candidate_id && <p className="text-sm text-destructive">{errors.candidate_id}</p>}
                    </div>
                </CardContent>
            </Card>

            {/* Section 2: Schedule Details */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Schedule Details</CardTitle>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold bg-muted px-2 py-1 rounded">Step 2</span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
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
                                            !data.date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {data.date ? format(data.date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={data.date}
                                        onSelect={(date: Date | undefined) => setData('date', date)}
                                        disabled={(date: Date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Time</Label>
                            <input
                                type="time"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={data.time}
                                onChange={(e) => setData('time', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Desktop: Side by Side Layout */}
                    <div className="hidden md:grid md:grid-cols-2 md:gap-6">
                        {/* Date Column */}
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Calendar
                                mode="single"
                                selected={data.date}
                                onSelect={(date: Date | undefined) => setData('date', date)}
                                disabled={(date: Date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                className="rounded-md border w-fit"
                            />
                            {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
                        </div>

                        {/* Time Column */}
                        <div className="space-y-2">
                            <Label>Time</Label>
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-2">
                                    <Select
                                        value={data.time.split(':')[0]}
                                        onValueChange={(hour) => setData('time', `${hour}:${data.time.split(':')[1]}`)}
                                    >
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Hour" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 24 }, (_, i) => {
                                                const hour = i.toString().padStart(2, '0')
                                                const display = i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`
                                                return (
                                                    <SelectItem key={hour} value={hour}>
                                                        {display}
                                                    </SelectItem>
                                                )
                                            })}
                                        </SelectContent>
                                    </Select>
                                    <span className="text-muted-foreground">:</span>
                                    <Select
                                        value={data.time.split(':')[1]}
                                        onValueChange={(minute) => setData('time', `${data.time.split(':')[0]}:${minute}`)}
                                    >
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Min" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['00', '15', '30', '45'].map(minute => (
                                                <SelectItem key={minute} value={minute}>
                                                    {minute}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Selected: {data.time ? format(new Date(`2000-01-01T${data.time}`), 'h:mm a') : 'Not set'}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Timezone Indicator */}
            {timezoneLabel && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-3">
                    <Globe className="h-4 w-4" />
                    <span>Times are in <strong>{timezoneLabel}</strong></span>
                    <span className="text-muted-foreground/60">•</span>
                    <Link href="/profile" className="text-primary hover:underline">
                        Change timezone
                    </Link>
                </div>
            )}

            {/* Footer Actions */}
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} className="bg-background">
                    Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Schedule Interview
                </Button>
            </div>
        </form>
    )
}
