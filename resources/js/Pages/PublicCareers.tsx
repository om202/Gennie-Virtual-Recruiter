import { Head } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    MapPin,
    DollarSign,
    Building2,
    ExternalLink,
    Clock,
    Users
} from 'lucide-react'

interface Job {
    id: string
    title: string
    company_name: string
    location: string | null
    remote_type: string
    employment_type: string
    salary_range: string | null
    description: string | null
    apply_url: string
    created_at: string
}

interface Company {
    name: string
}

interface Props {
    company?: Company
    jobs?: Job[]
    error?: string
}

export default function PublicCareers({ company, jobs, error }: Props) {
    // Error state
    if (error || !company) {
        return (
            <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
                <Head title="Careers" />
                <div className="max-w-md text-center space-y-4">
                    <div className="text-6xl">😔</div>
                    <h1 className="text-2xl font-bold">Page Not Available</h1>
                    <p className="text-muted-foreground">
                        {error || 'This careers page is not available.'}
                    </p>
                </div>
            </div>
        )
    }

    const formatRemoteType = (type: string) => {
        const labels: Record<string, string> = {
            onsite: 'On-site',
            hybrid: 'Hybrid',
            remote: 'Remote',
        }
        return labels[type] || type
    }

    const formatEmploymentType = (type: string) => {
        return type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')
    }

    const getRemoteTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            onsite: 'bg-primary/10 text-primary',
            hybrid: 'bg-purple-500/10 text-purple-700',
            remote: 'bg-green-500/10 text-green-700',
        }
        return colors[type] || 'bg-gray-100 text-gray-800'
    }

    const stripMarkdown = (text: string) => {
        return text
            // Remove headers (# ## ###)
            .replace(/^#+\s+/gm, '')
            // Remove bold (**text** or __text__)
            .replace(/(\*\*|__)(.*?)\1/g, '$2')
            // Remove italic (*text* or _text_)
            .replace(/(\*|_)(.*?)\1/g, '$2')
            // Remove links [text](url)
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
            // Remove inline code `code`
            .replace(/`([^`]+)`/g, '$1')
            // Remove bullet points (- or *)
            .replace(/^[\s]*[-*]\s+/gm, '')
            // Remove numbered lists
            .replace(/^[\s]*\d+\.\s+/gm, '')
            // Remove extra whitespace
            .replace(/\s+/g, ' ')
            .trim()
    }

    return (
        <>
            <Head>
                <title>{`Careers at ${company.name}`}</title>
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <div className="bg-muted/50 text-foreground min-h-screen flex flex-col p-4 pb-16">
                {/* Powered by Gennie */}
                <header className="w-full mt-6 mb-10">
                    <a href="/" className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <span className="text-sm">Powered by</span>
                        <img src="/gennie.png" alt="Gennie" className="h-6 w-6 object-contain" />
                        <span className="font-semibold text-sm text-primary">Gennie Talent</span>
                    </a>
                </header>

                <main className="flex-1 flex flex-col items-center max-w-5xl mx-auto w-full space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <Badge variant="outline" className="px-3 py-1">
                            <Building2 className="h-3 w-3 mr-1" />
                            Careers
                        </Badge>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Join {company.name}
                        </h1>
                        <p className="text-muted-foreground max-w-xl">
                            Explore our open positions and find your next opportunity.
                        </p>
                    </div>

                    {/* Jobs List */}
                    {!jobs || jobs.length === 0 ? (
                        <Card className="w-full border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-medium mb-2">No open positions</h3>
                                <p className="text-muted-foreground text-center">
                                    Check back soon for new opportunities!
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="w-full space-y-4">
                            <p className="text-sm text-muted-foreground">
                                {jobs.length} open position{jobs.length !== 1 ? 's' : ''}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {jobs.map((job) => (
                                    <Card key={job.id} className="hover:shadow-md transition-shadow flex flex-col h-full">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg">{job.title}</CardTitle>
                                            <CardDescription className="flex items-center gap-2">
                                                {job.location && (
                                                    <>
                                                        <MapPin className="h-3 w-3" />
                                                        {job.location}
                                                    </>
                                                )}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex flex-col flex-1 gap-4">
                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="outline" className={getRemoteTypeColor(job.remote_type)}>
                                                    {formatRemoteType(job.remote_type)}
                                                </Badge>
                                                <Badge variant="outline">
                                                    {formatEmploymentType(job.employment_type)}
                                                </Badge>
                                                {job.salary_range && (
                                                    <Badge variant="outline">
                                                        <DollarSign className="h-3 w-3 mr-1" />
                                                        {job.salary_range}
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Description preview */}
                                            {job.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-3">
                                                    {stripMarkdown(job.description)}
                                                </p>
                                            )}

                                            {/* Spacer to push content down */}
                                            <div className="flex-1" />

                                            {/* Posted date */}
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                Posted {job.created_at}
                                            </div>

                                            {/* Apply button */}
                                            <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                                                <Button className="w-full">
                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                    Apply Now
                                                </Button>
                                            </a>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    )
}
