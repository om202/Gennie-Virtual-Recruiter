import { Head, Link } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import type { PageProps } from '@/types'

interface UsageRecord {
    id: number
    minutes: string
    recorded_at: string
    candidate_name: string
    job_title: string
}

interface MonthlySummary {
    month: string
    month_label: string
    total_minutes: number
    session_count: number
}

interface UsageHistoryProps extends PageProps {
    history: {
        records: UsageRecord[]
        pagination: {
            current_page: number
            last_page: number
            per_page: number
            total: number
        }
        monthly_summary: MonthlySummary[]
        all_time: {
            total_minutes: number
            total_sessions: number
        }
    }
}

export default function UsageHistory({ history }: UsageHistoryProps) {
    const { records, pagination, monthly_summary, all_time } = history

    return (
        <div className="min-h-screen bg-muted/50 pb-20">
            <Head title="Usage History" />

            <div className="max-w-4xl mx-auto py-8 md:pt-12 px-4 space-y-6">
                {/* Back Button */}
                <div>
                    <Link href="/subscription">
                        <Button variant="ghost" className="pl-0 gap-2 hover:bg-transparent hover:underline">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Subscription
                        </Button>
                    </Link>
                </div>

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary">Usage History</h1>
                    <p className="text-muted-foreground">
                        Complete history of all your interview sessions
                    </p>
                </div>

                {/* All-Time Stats - Only on page 1 */}
                {pagination.current_page === 1 && (
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-primary">{all_time.total_minutes}</p>
                                    <p className="text-sm text-muted-foreground">Total Minutes Used</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-primary">{all_time.total_sessions}</p>
                                    <p className="text-sm text-muted-foreground">Total Interviews</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Monthly Summary */}
                {monthly_summary.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Monthly Breakdown</CardTitle>
                            <CardDescription>Usage by month (last 12 months)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {monthly_summary.map((month) => (
                                    <div
                                        key={month.month}
                                        className="flex items-center justify-between py-2 border-b last:border-0"
                                    >
                                        <span className="font-medium">{month.month_label}</span>
                                        <div className="text-right text-sm">
                                            <span className="font-medium">{month.total_minutes} min</span>
                                            <span className="text-muted-foreground ml-2">
                                                ({month.session_count} sessions)
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* All Records */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">All Sessions</CardTitle>
                        <CardDescription>
                            Showing {records.length} of {pagination.total} sessions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {records.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No interview sessions recorded yet.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {records.map((record) => (
                                    <div
                                        key={record.id}
                                        className="flex items-center justify-between py-2 border-b last:border-0"
                                    >
                                        <div className="text-sm">
                                            <p className="font-medium">{record.candidate_name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {record.job_title}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-sm">{record.minutes}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(record.recorded_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.last_page > 1 && (
                            <div className="flex items-center justify-between mt-6 pt-4 border-t">
                                <p className="text-sm text-muted-foreground">
                                    Page {pagination.current_page} of {pagination.last_page}
                                </p>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/subscription/history?page=${pagination.current_page - 1}`}
                                        preserveScroll
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={pagination.current_page === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </Button>
                                    </Link>
                                    <Link
                                        href={`/subscription/history?page=${pagination.current_page + 1}`}
                                        preserveScroll
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={pagination.current_page === pagination.last_page}
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
