import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { CheckCircle2, XCircle, AlertCircle, TrendingUp, TrendingDown, ChevronRight, Loader2 } from "lucide-react"
import { useState } from "react"

interface CriterionScore {
    category: string
    score: number
    weight: number
    assessment: string
    evidence: string[]
}

interface AnalysisResult {
    score: number
    criterion_scores?: CriterionScore[]
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
    const [dialogOpen, setDialogOpen] = useState(false)

    if (status === 'pending' || status === 'processing') {
        return (
            <Card className="bg-muted/30 border-dashed">
                <CardContent className="flex items-center justify-center py-4 gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground">AI Analysis in progress...</span>
                </CardContent>
            </Card>
        )
    }

    if (status === 'failed') {
        // Check if result contains specific error info
        const errorResult = result as { error?: string; reason?: string } | null;
        const errorMessage = errorResult?.error || 'Analysis Generation Failed';
        const errorReason = errorResult?.reason;

        return (
            <Card className="bg-red-50/50 border-red-200">
                <CardContent className="flex flex-col items-center justify-center py-4 gap-2 text-red-600">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-medium">{errorMessage}</span>
                    </div>
                    {errorReason && (
                        <p className="text-sm text-red-500/80 text-center max-w-md">
                            {errorReason}
                        </p>
                    )}
                </CardContent>
            </Card>
        )
    }

    if (!result) {
        return (
            <Card className="bg-red-50/50 border-red-200">
                <CardContent className="flex items-center justify-center py-4 gap-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    <span>No analysis result available</span>
                </CardContent>
            </Card>
        )
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600 bg-green-50 border-green-300"
        if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-300"
        return "text-red-600 bg-red-50 border-red-300"
    }

    const getScoreRingColor = (score: number) => {
        if (score >= 80) return "border-green-400"
        if (score >= 60) return "border-yellow-400"
        return "border-red-400"
    }

    const getRecommendationStyle = (rec: string) => {
        const styles: Record<string, string> = {
            'Strong Hire': 'bg-green-100 text-green-800',
            'Hire': 'bg-green-100 text-green-800',
            'Weak Hire': 'bg-yellow-100 text-yellow-800',
            'Reject': 'bg-red-100 text-red-800',
        }
        return styles[rec] || ''
    }

    return (
        <>
            {/* Compact Score Display */}
            <Card
                className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/50 ${getScoreColor(result.score)}`}
                onClick={() => setDialogOpen(true)}
            >
                <CardContent className="flex items-center justify-between py-4 px-6">
                    <div className="flex items-center gap-4">
                        {/* Score Circle */}
                        <div className={`flex items-center justify-center h-14 w-14 rounded-full border-4 ${getScoreRingColor(result.score)} bg-white font-bold text-xl`}>
                            {result.score}
                        </div>

                        {/* Recommendation & Summary Preview */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">Interview Score</span>
                                <Badge className={`${getRecommendationStyle(result.recommendation)} text-xs`}>
                                    {result.recommendation}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1 max-w-md">
                                {result.summary}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-sm">View Details</span>
                        <ChevronRight className="h-5 w-5" />
                    </div>
                </CardContent>
            </Card>

            {/* Full Analysis Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto p-0">
                    {/* Header Section */}
                    <div className="sticky top-0 bg-muted border-b p-8">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <DialogTitle className="text-2xl font-bold">
                                    Candidate Assessment Report
                                </DialogTitle>
                                <DialogDescription>
                                    AI-powered interview analysis and hiring recommendation
                                </DialogDescription>
                                <Badge className={`${getRecommendationStyle(result.recommendation)} text-sm px-4 py-1.5 mt-3`}>
                                    {result.recommendation}
                                </Badge>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className={`flex flex-col items-center justify-center h-24 w-24 rounded-full border-4 ${getScoreRingColor(result.score)} bg-background shadow-sm`}>
                                    <span className="font-bold text-3xl">{result.score}</span>
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Score</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 space-y-8">
                        {/* Executive Summary */}
                        <div className="bg-muted/50 rounded-lg p-6 border">
                            <h4 className="font-semibold text-base mb-3">
                                Executive Summary
                            </h4>
                            <p className="text-muted-foreground leading-relaxed">{result.summary}</p>
                        </div>

                        {/* Detailed Criterion Scores */}
                        {result.criterion_scores && result.criterion_scores.length > 0 && (
                            <div className="space-y-4">
                                <h4 className="font-semibold text-lg">Evaluation Criteria Breakdown</h4>
                                <div className="space-y-3">
                                    {result.criterion_scores.map((criterion, idx) => {
                                        const percentage = (criterion.score / 100) * 100;
                                        const barColor = criterion.score >= 80 ? 'bg-green-500' : criterion.score >= 60 ? 'bg-yellow-500' : 'bg-orange-500';

                                        return (
                                            <div key={idx} className="bg-muted/30 rounded-lg p-4 border">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-semibold">{criterion.category}</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {criterion.weight}% weight
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl font-bold">{criterion.score}</span>
                                                        <span className="text-sm text-muted-foreground">/100</span>
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="w-full bg-muted rounded-full h-2 mb-3">
                                                    <div
                                                        className={`${barColor} h-2 rounded-full transition-all`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>

                                                {/* Assessment */}
                                                <p className="text-sm text-muted-foreground mb-2">{criterion.assessment}</p>

                                                {/* Evidence */}
                                                {criterion.evidence && criterion.evidence.length > 0 && (
                                                    <div className="mt-2 space-y-1">
                                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Evidence:</span>
                                                        <ul className="space-y-1">
                                                            {criterion.evidence.map((item, i) => (
                                                                <li key={i} className="text-xs text-muted-foreground pl-4 relative before:content-['•'] before:absolute before:left-0">
                                                                    {item}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Strengths & Improvements Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Key Strengths */}
                            <div className="bg-green-50/50 dark:bg-green-950/10 rounded-lg p-6 border">
                                <h4 className="flex items-center gap-2 font-semibold text-base mb-4">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                    Key Strengths
                                </h4>
                                <ul className="space-y-3">
                                    {result.key_pros.map((pro, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm">
                                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                            <span className="text-foreground">{pro}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Areas for Improvement */}
                            <div className="bg-orange-50/50 dark:bg-orange-950/10 rounded-lg p-6 border">
                                <h4 className="flex items-center gap-2 font-semibold text-base mb-4">
                                    <TrendingDown className="h-5 w-5 text-orange-600" />
                                    Areas for Improvement
                                </h4>
                                <ul className="space-y-3">
                                    {result.key_cons.map((con, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm">
                                            <XCircle className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                                            <span className="text-foreground">{con}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Footer Note */}
                        <div className="text-center text-xs text-muted-foreground pt-4 border-t">
                            This assessment was generated by AI and should be used as a guide alongside your own judgment.
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
