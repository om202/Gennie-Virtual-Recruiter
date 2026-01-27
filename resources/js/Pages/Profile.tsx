import { useState } from 'react'
import { Head, useForm, router, Link } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import {
    User,
    Building2,
    Mail,
    Globe,
    Mic,
    Clock,
    Bell,
    Palette,
    Upload,
    Save,
    Loader2,
    ArrowLeft
} from 'lucide-react'
import { toast } from 'sonner'

interface Voice {
    id: string
    name: string
    description: string
}

interface ProfileProps {
    auth: {
        user: {
            id: number
            name: string
            email: string
            avatar: string | null
            phone: string | null
            company_name: string | null
            company_logo: string | null
            company_description: string | null
            company_industry: string | null
            company_website: string | null
            default_voice_id: string | null
            default_interview_duration: number
            default_greeting_message: string | null
            timezone: string
            notify_interview_completed: boolean
            notify_high_score: boolean
            high_score_threshold: number
            notification_frequency: string
            notify_scheduled_reminders: boolean
            thank_you_message: string | null
        }
    }
    voices: Voice[]
    industries: string[]
    timezones: Record<string, string>
}

export default function Profile({ auth, voices, industries, timezones }: ProfileProps) {
    const user = auth.user

    // Account Form
    const accountForm = useForm({
        name: user.name || '',
        phone: user.phone || '',
    })

    // Company Form
    const companyForm = useForm({
        company_name: user.company_name || '',
        company_description: user.company_description || '',
        company_industry: user.company_industry || '',
        company_website: user.company_website || '',
    })

    // Interview Preferences Form
    const interviewForm = useForm({
        default_voice_id: user.default_voice_id || 'alloy',
        default_interview_duration: user.default_interview_duration || 30,
        default_greeting_message: user.default_greeting_message || '',
        timezone: user.timezone || 'America/New_York',
    })

    // Notifications Form
    const notificationsForm = useForm({
        notify_interview_completed: user.notify_interview_completed,
        notify_high_score: user.notify_high_score,
        high_score_threshold: user.high_score_threshold || 80,
        notification_frequency: user.notification_frequency || 'instant',
        notify_scheduled_reminders: user.notify_scheduled_reminders,
    })

    // Branding Form
    const brandingForm = useForm({
        thank_you_message: user.thank_you_message || '',
    })

    const [logoUploading, setLogoUploading] = useState(false)

    const handleAccountSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        accountForm.put('/profile/account', {
            onSuccess: () => toast.success('Account information updated'),
        })
    }

    const handleCompanySubmit = (e: React.FormEvent) => {
        e.preventDefault()
        companyForm.put('/profile/company', {
            onSuccess: () => toast.success('Company settings updated'),
        })
    }

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setLogoUploading(true)
        const formData = new FormData()
        formData.append('logo', file)

        router.post('/profile/logo', formData, {
            onSuccess: () => {
                toast.success('Logo uploaded successfully')
                setLogoUploading(false)
            },
            onError: () => {
                toast.error('Failed to upload logo')
                setLogoUploading(false)
            },
        })
    }

    const handleInterviewSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        interviewForm.put('/profile/interview-preferences', {
            onSuccess: () => toast.success('Interview preferences updated'),
        })
    }

    const handleNotificationsSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        notificationsForm.put('/profile/notifications', {
            onSuccess: () => toast.success('Notification settings updated'),
        })
    }

    const handleBrandingSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        brandingForm.put('/profile/branding', {
            onSuccess: () => toast.success('Branding settings updated'),
        })
    }

    return (
        <div className="min-h-screen bg-muted/50 pb-20">
            <Head title="Settings" />

            <div className="max-w-4xl mx-auto py-8 md:pt-12 px-4 space-y-6">
                {/* Back Button */}
                <div>
                    <Link href="/dashboard">
                        <Button variant="ghost" className="pl-0 gap-2 hover:bg-transparent hover:underline">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary">Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your account, company, and interview preferences
                    </p>
                </div>

                {/* Account Information */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Account Information</CardTitle>
                                <CardDescription>Your personal details</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAccountSubmit} className="space-y-4">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="h-full w-full object-cover"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <User className="h-8 w-8 text-primary" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={accountForm.data.name}
                                        onChange={e => accountForm.setData('name', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={accountForm.data.phone}
                                        onChange={e => accountForm.setData('phone', e.target.value)}
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    Email: {user.email} (managed by Google)
                                </span>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={accountForm.processing}>
                                    {accountForm.processing ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Company Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Company Settings</CardTitle>
                                <CardDescription>Your organization details shown to candidates</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCompanySubmit} className="space-y-4">
                            {/* Company Logo */}
                            <div className="space-y-2">
                                <Label>Company Logo</Label>
                                <div className="flex items-center gap-4">
                                    <div className="h-20 w-20 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted/50">
                                        {user.company_logo ? (
                                            <img
                                                src={`/storage/${user.company_logo}`}
                                                alt="Company Logo"
                                                className="h-full w-full object-contain"
                                            />
                                        ) : (
                                            <Building2 className="h-8 w-8 text-muted-foreground/50" />
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="logo-upload" className="cursor-pointer">
                                            <div className="flex items-center gap-2 px-4 py-2 rounded-md border hover:bg-muted transition-colors">
                                                {logoUploading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Upload className="h-4 w-4" />
                                                )}
                                                <span>Upload Logo</span>
                                            </div>
                                        </Label>
                                        <input
                                            id="logo-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleLogoUpload}
                                            disabled={logoUploading}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            PNG, JPG up to 2MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="company_name">Company Name</Label>
                                    <Input
                                        id="company_name"
                                        value={companyForm.data.company_name}
                                        onChange={e => companyForm.setData('company_name', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company_industry">Industry</Label>
                                    <Select
                                        value={companyForm.data.company_industry}
                                        onValueChange={value => companyForm.setData('company_industry', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select industry" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {industries.map(industry => (
                                                <SelectItem key={industry} value={industry}>
                                                    {industry}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="company_website">Website</Label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="company_website"
                                        className="pl-10"
                                        placeholder="https://yourcompany.com"
                                        value={companyForm.data.company_website}
                                        onChange={e => companyForm.setData('company_website', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="company_description">Company Description</Label>
                                <Textarea
                                    id="company_description"
                                    placeholder="Brief description of your company for candidates..."
                                    rows={3}
                                    value={companyForm.data.company_description}
                                    onChange={e => companyForm.setData('company_description', e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={companyForm.processing}>
                                    {companyForm.processing ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Interview Preferences */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Mic className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Interview Preferences</CardTitle>
                                <CardDescription>Default settings for new interviews</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleInterviewSubmit} className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="default_voice_id">AI Voice</Label>
                                    <Select
                                        value={interviewForm.data.default_voice_id}
                                        onValueChange={value => interviewForm.setData('default_voice_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select voice" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {voices.map(voice => (
                                                <SelectItem key={voice.id} value={voice.id}>
                                                    <div className="flex flex-col">
                                                        <span>{voice.name}</span>
                                                        <span className="text-xs text-muted-foreground">{voice.description}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="timezone">Timezone</Label>
                                    <Select
                                        value={interviewForm.data.timezone}
                                        onValueChange={value => interviewForm.setData('timezone', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select timezone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(timezones).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Default Interview Duration</Label>
                                    <span className="text-sm font-medium">{interviewForm.data.default_interview_duration} min</span>
                                </div>
                                <Slider
                                    value={[interviewForm.data.default_interview_duration]}
                                    onValueChange={([value]) => interviewForm.setData('default_interview_duration', value)}
                                    min={5}
                                    max={60}
                                    step={5}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>5 min</span>
                                    <span>60 min</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="default_greeting_message">Default Greeting Message</Label>
                                <Textarea
                                    id="default_greeting_message"
                                    placeholder="Hi! I'm Gennie, your AI interviewer. Welcome to..."
                                    rows={3}
                                    value={interviewForm.data.default_greeting_message}
                                    onChange={e => interviewForm.setData('default_greeting_message', e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    This message will be spoken at the start of each interview
                                </p>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={interviewForm.processing}>
                                    {interviewForm.processing ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Bell className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Notification Settings</CardTitle>
                                <CardDescription>How and when you want to be notified</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleNotificationsSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-lg border">
                                    <div className="space-y-0.5">
                                        <Label>Interview Completed</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Get notified when a candidate completes an interview
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notificationsForm.data.notify_interview_completed}
                                        onCheckedChange={checked => notificationsForm.setData('notify_interview_completed', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-lg border">
                                    <div className="space-y-0.5">
                                        <Label>High Score Alerts</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Get notified when a candidate scores above threshold
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notificationsForm.data.notify_high_score}
                                        onCheckedChange={checked => notificationsForm.setData('notify_high_score', checked)}
                                    />
                                </div>

                                {notificationsForm.data.notify_high_score && (
                                    <div className="pl-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label>Score Threshold</Label>
                                            <span className="text-sm font-medium">{notificationsForm.data.high_score_threshold}%</span>
                                        </div>
                                        <Slider
                                            value={[notificationsForm.data.high_score_threshold]}
                                            onValueChange={([value]) => notificationsForm.setData('high_score_threshold', value)}
                                            min={50}
                                            max={100}
                                            step={5}
                                            className="w-full"
                                        />
                                    </div>
                                )}

                                <div className="flex items-center justify-between p-4 rounded-lg border">
                                    <div className="space-y-0.5">
                                        <Label>Scheduled Interview Reminders</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Reminder before scheduled interviews
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notificationsForm.data.notify_scheduled_reminders}
                                        onCheckedChange={checked => notificationsForm.setData('notify_scheduled_reminders', checked)}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label>Notification Frequency</Label>
                                <Select
                                    value={notificationsForm.data.notification_frequency}
                                    onValueChange={value => notificationsForm.setData('notification_frequency', value)}
                                >
                                    <SelectTrigger className="w-full sm:w-[250px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="instant">Instant (Real-time)</SelectItem>
                                        <SelectItem value="daily">Daily Digest</SelectItem>
                                        <SelectItem value="weekly">Weekly Summary</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={notificationsForm.processing}>
                                    {notificationsForm.processing ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Branding & Customization */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Palette className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Branding & Customization</CardTitle>
                                <CardDescription>Customize the candidate experience</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleBrandingSubmit} className="space-y-6">

                            <div className="space-y-2">
                                <Label htmlFor="thank_you_message">Thank You Message</Label>
                                <Textarea
                                    id="thank_you_message"
                                    placeholder="Thank you for taking the time to interview with us! We'll be in touch soon..."
                                    rows={4}
                                    value={brandingForm.data.thank_you_message}
                                    onChange={e => brandingForm.setData('thank_you_message', e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Shown to candidates after completing their interview
                                </p>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={brandingForm.processing}>
                                    {brandingForm.processing ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Coming Soon - API & Integrations */}
                <Card className="opacity-60">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                    <Globe className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <CardTitle>API & Integrations</CardTitle>
                                    <CardDescription>Connect with ATS and other tools</CardDescription>
                                </div>
                            </div>
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">
                                Coming Soon
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            API keys, webhooks, and integrations with Greenhouse, Lever, and other ATS platforms will be available soon.
                        </p>
                    </CardContent>
                </Card>

                {/* Billing & Subscription */}
                <Card className="hover:border-primary/50 transition-colors">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle>Billing & Subscription</CardTitle>
                                    <CardDescription>Manage your plan and usage</CardDescription>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            View your current plan, interview usage, and billing history. Upgrade or downgrade your subscription.
                        </p>
                        <Link href="/subscription">
                            <Button variant="outline" className="gap-2">
                                <Clock className="h-4 w-4" />
                                Manage Subscription
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
