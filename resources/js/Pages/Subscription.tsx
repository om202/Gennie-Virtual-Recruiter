import { Head, Link, router } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
    CreditCard,
    Clock,
    TrendingUp,
    Check,
    ArrowLeft,
    AlertTriangle,
    Zap,
    Building2,
    Crown,
} from 'lucide-react'
import { toast } from 'sonner'

interface Plan {
    slug: string
    name: string
    description: string
    price_monthly: number
    price_formatted: string
    minutes_included: number
    overage_rate: number
    overage_rate_formatted: string
    is_free_trial: boolean
    is_enterprise: boolean
}

interface UsageStats {
    plan: {
        slug: string
        name: string
        price_formatted: string
        minutes_included: number
        overage_rate: number
        overage_rate_formatted: string
    } | null
    usage: {
        minutes_used: number
        minutes_included: number
        minutes_remaining: number
        percentage_used: number
        overage_minutes: number
        overage_cost_cents: number
        overage_cost_formatted: string
    }
    period: {
        started_at: string | null
        ends_at: string | null
    }
    recent_usage: Array<{
        id: number
        minutes: string
        cost: string
        recorded_at: string
    }>
}

interface SubscriptionProps {
    auth: {
        user: {
            id: number
            name: string
            email: string
        }
    }
    usageStats: UsageStats
    plans: Plan[]
}

export default function Subscription({ usageStats, plans }: SubscriptionProps) {
    const currentPlanSlug = usageStats.plan?.slug || 'free_trial'
    const isFreeTrial = currentPlanSlug === 'free_trial'
    const isOverLimit = usageStats.usage.minutes_remaining <= 0 && isFreeTrial

    const handleUpgrade = (planSlug: string) => {
        if (planSlug === 'enterprise') {
            toast.info('Please contact sales for Enterprise pricing.')
            return
        }

        router.post('/subscription/upgrade', { plan_slug: planSlug }, {
            onSuccess: () => toast.success('Plan upgraded successfully!'),
            onError: () => toast.error('Failed to upgrade plan. Payment integration coming soon.'),
        })
    }

    const getPlanIcon = (slug: string) => {
        switch (slug) {
            case 'free_trial': return <Clock className="h-5 w-5" />
            case 'starter': return <Zap className="h-5 w-5" />
            case 'growth': return <TrendingUp className="h-5 w-5" />
            case 'pro': return <Crown className="h-5 w-5" />
            case 'enterprise': return <Building2 className="h-5 w-5" />
            default: return <CreditCard className="h-5 w-5" />
        }
    }

    return (
        <div className="min-h-screen bg-muted/50 pb-20">
            <Head title="Subscription & Billing" />

            <div className="max-w-5xl mx-auto py-8 md:pt-12 px-4 space-y-6">
                {/* Back Button */}
                <div>
                    <Link href="/profile">
                        <Button variant="ghost" className="pl-0 gap-2 hover:bg-transparent hover:underline">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Settings
                        </Button>
                    </Link>
                </div>

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary">Subscription & Billing</h1>
                    <p className="text-muted-foreground">
                        Manage your plan and track your interview usage
                    </p>
                </div>

                {/* Usage Warning */}
                {isOverLimit && (
                    <Card className="border-destructive bg-destructive/5">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-destructive">Free Trial Exhausted</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        You have used all your free trial minutes. Upgrade to continue conducting interviews.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Current Plan & Usage */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Current Plan */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    {getPlanIcon(currentPlanSlug)}
                                </div>
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        {usageStats.plan?.name || 'Free Trial'}
                                        {isFreeTrial && (
                                            <Badge variant="secondary" className="text-xs">Trial</Badge>
                                        )}
                                    </CardTitle>
                                    <CardDescription>
                                        {usageStats.plan?.price_formatted || 'Free'}/month
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Minutes Used</span>
                                    <span className="font-medium">
                                        {usageStats.usage.minutes_used} / {usageStats.usage.minutes_included} min
                                    </span>
                                </div>
                                <Progress
                                    value={usageStats.usage.percentage_used}
                                    className={usageStats.usage.percentage_used >= 80 ? 'bg-destructive/20' : ''}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="text-center p-3 rounded-lg bg-muted/50">
                                    <p className="text-2xl font-bold text-primary">
                                        {usageStats.usage.minutes_remaining}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Minutes Remaining</p>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-muted/50">
                                    <p className="text-2xl font-bold text-primary">
                                        {usageStats.plan?.overage_rate_formatted || '—'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Minute Rate</p>
                                </div>
                            </div>

                            {usageStats.usage.overage_minutes > 0 && (
                                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                        Extra: {usageStats.usage.overage_minutes} min ({usageStats.usage.overage_cost_formatted})
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Usage */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Recent Usage</CardTitle>
                            <CardDescription>Your last 10 interview sessions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {usageStats.recent_usage.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No interview sessions yet. Start interviewing to see usage here.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {usageStats.recent_usage.map((record) => (
                                        <div
                                            key={record.id}
                                            className="flex items-center justify-between py-2 border-b last:border-0"
                                        >
                                            <div className="text-sm">
                                                <p className="font-medium">{record.minutes}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(record.recorded_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Badge variant="outline">{record.cost}</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Available Plans */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Available Plans</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {plans.filter(p => !p.is_free_trial).map((plan) => {
                            const isCurrent = plan.slug === currentPlanSlug
                            const isPopular = plan.slug === 'growth'

                            return (
                                <Card
                                    key={plan.slug}
                                    className={`relative flex flex-col ${isCurrent ? 'border-primary shadow-md' : ''} ${isPopular ? 'border-primary shadow-lg scale-[1.02]' : ''}`}
                                >
                                    {isPopular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                                            <Badge>Most Popular</Badge>
                                        </div>
                                    )}
                                    <CardHeader>
                                        <CardTitle>{plan.name}</CardTitle>
                                        <div className="pt-4">
                                            {plan.is_enterprise ? (
                                                <div className="text-3xl font-bold">Custom</div>
                                            ) : (
                                                <div>
                                                    <span className="text-3xl font-bold">{plan.price_formatted}</span>
                                                    <span className="text-muted-foreground">/mo</span>
                                                </div>
                                            )}
                                        </div>
                                        <CardDescription className="pt-2">
                                            {plan.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <ul className="space-y-3 text-sm">
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-primary shrink-0" />
                                                <span>{plan.is_enterprise ? 'Custom pricing' : `${plan.minutes_included} minutes/mo`}</span>
                                            </li>
                                            {!plan.is_enterprise && (
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-primary shrink-0" />
                                                    <span>{plan.overage_rate_formatted}</span>
                                                </li>
                                            )}
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-primary shrink-0" />
                                                <span>Unlimited interviews</span>
                                            </li>
                                        </ul>
                                    </CardContent>
                                    <CardContent className="pt-0">
                                        <Button
                                            className="w-full"
                                            variant={isCurrent ? 'outline' : isPopular ? 'default' : 'outline'}
                                            disabled={isCurrent}
                                            onClick={() => handleUpgrade(plan.slug)}
                                        >
                                            {isCurrent ? 'Current Plan' : plan.is_enterprise ? 'Contact Sales' : 'Upgrade'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>

                {/* Payment Notice */}
                <Card className="bg-muted/30">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <CreditCard className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                            <div>
                                <p className="font-medium">Payment Integration Coming Soon</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Real payment processing with Stripe will be available soon. For now, plan upgrades are simulated for testing purposes.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
