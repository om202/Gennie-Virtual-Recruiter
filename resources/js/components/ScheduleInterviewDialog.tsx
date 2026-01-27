import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useForm } from '@inertiajs/react'

interface Candidate {
    id: string
    name: string
    email: string
}

interface Interview {
    id: string
    job_title: string
}

interface ScheduleInterviewDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    interviewId: string | null
    candidates: Candidate[]
    interviews: Interview[]
}

export function ScheduleInterviewDialog({ open, onOpenChange, interviewId, candidates, interviews }: ScheduleInterviewDialogProps) {
    const { data, setData, post, processing, errors, reset, transform } = useForm({
        interview_id: interviewId || '',
        candidate_id: '',
        date: undefined as Date | undefined,
        time: '09:00',
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

        post('/schedules', {
            onSuccess: () => {
                onOpenChange(false)
                reset()
            },
        })
    }

    // Filter interviews if an ID is pre-selected
    const selectedInterview = interviews.find(i => i.id === (data.interview_id || interviewId))

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Schedule Interview</DialogTitle>
                    <DialogDescription>
                        Set up a time for a candidate to take this interview.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {/* Interview Selection (if not pre-selected) */}
                    <div className="space-y-2">
                        <Label>Interview Template</Label>
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
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {errors.interview_id && <p className="text-sm text-destructive">{errors.interview_id}</p>}
                    </div>

                    {/* Candidate Selection */}
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

                    {/* Date Selection */}
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
                                    // limit to future dates
                                    disabled={(date: Date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
                    </div>

                    {/* Time Selection */}
                    <div className="space-y-2">
                        <Label>Time</Label>
                        <Input
                            type="time"
                            value={data.time}
                            onChange={(e) => setData('time', e.target.value)}
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Schedule
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
