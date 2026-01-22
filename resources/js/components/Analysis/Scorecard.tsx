import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle, TrendingUp, TrendingDown } from "lucide-react"

interface AnalysisResult {
    score: number
    summary: string
    key_pros: string[]
    key_cons: string[]
    recommendation: 'Strong Hire' | 'Hire' | 'Weak Hire' | 'Reject'
}

interface ScorecardProps {
    result: AnalysisResult | null
    status: 'pending' | 'processing' | 'completed' | 'failed'
}

export function Scorecard({ result, status }: ScorecardProps) {
    if (status === 'pending' || status === 'processing') {
        return (
            <Card className="bg-muted/30 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
                    <p className="text-muted-foreground">AI Analysis in progress...</p>
                    <p className="text-xs text-muted-foreground mt-1">Generating scores and summary</p>
                </CardContent>
            </Card>
        )
    }

    if (status === 'failed' || !result) {
        return (
            <Card className="bg-red-50/50 border-red-200">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center text-red-600">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p>Analysis Generation Failed</p>
                </CardContent>
            </Card>
        )
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600 bg-green-50 border-green-200"
        if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200"
        return "text-red-600 bg-red-50 border-red-200"
    }

    const getRecommendationBadge = (rec: string) => {
        const styles: Record<string, string> = {
            'Strong Hire': 'bg-green-100 text-green-800 hover:bg-green-100',
            'Hire': 'bg-green-100 text-green-800 hover:bg-green-100',
            'Weak Hire': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
            'Reject': 'bg-red-100 text-red-800 hover:bg-red-100',
        }
        return <Badge className={`${styles[rec] || ''} text-sm px-3 py-1`}>{rec}</Badge>
    }

    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-muted/20 pb-4 border-b">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            Interview Analysis
                            {getRecommendationBadge(result.recommendation)}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Use this automated assessment to guide your decision.
                        </CardDescription>
                    </div>
                    <div className={`flex flex-col items-center justify-center h-16 w-16 rounded-full border-4 ${getScoreColor(result.score)} font-bold text-xl`}>
                        {result.score}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">

                {/* Summary */}
                <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2 uppercase tracking-wider">Executive Summary</h4>
                    <p className="text-sm leading-relaxed">{result.summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pros */}
                    <div>
                        <h4 className="flex items-center gap-2 font-semibold text-sm text-green-700 mb-3">
                            <TrendingUp className="h-4 w-4" />
                            Key Strengths
                        </h4>
                        <ul className="space-y-2">
                            {result.key_pros.map((pro, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <span>{pro}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Cons */}
                    <div>
                        <h4 className="flex items-center gap-2 font-semibold text-sm text-red-700 mb-3">
                            <TrendingDown className="h-4 w-4" />
                            Areas for Improvement
                        </h4>
                        <ul className="space-y-2">
                            {result.key_cons.map((con, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                    <span>{con}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
