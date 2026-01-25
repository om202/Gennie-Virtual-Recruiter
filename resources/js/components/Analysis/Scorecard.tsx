import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle, TrendingUp, TrendingDown, ChevronRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

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
    mode?: 'compact' | 'full' // compact shows dialog, full shows direct content
}

export function Scorecard({ result, status, mode = 'compact' }: ScorecardProps) {
    if (status === 'pending' || status === 'processing') {
        return (
            <Card className="border-dashed">
                <CardContent className="flex items-center justify-between py-6 px-6">
                    <div className="flex items-center gap-4">
                        {/* Loading Icon */}
                        <div className="flex items-center justify-center h-16 w-16">
                            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                        </div>

                        {/* Loading Message */}
                        <div className="space-y-2">
                            <h4 className="font-semibold">Analysis in Progress</h4>
                            <p className="text-sm text-muted-foreground">
                                AI is analyzing the interview transcript...
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (status === 'failed') {
        // Check if result contains specific error info
        const errorResult = result as { error?: string; reason?: string } | null;
        const errorMessage = errorResult?.error || 'Analysis Generation Failed';
        const errorReason = errorResult?.reason;
        const isInsufficientData = errorMessage.includes('Insufficient') || errorMessage.includes('insufficient');

        return (
            <Card>
                <CardContent className="flex items-center justify-between py-6 px-6">
                    <div className="flex items-center gap-4">
                        {/* Alert Icon - only show for non-insufficient data errors */}
                        {!isInsufficientData && (
                            <div className="flex items-center justify-center h-16 w-16">
                                <AlertCircle className="h-10 w-10 text-orange-500" />
                            </div>
                        )}

                        {/* Error Message */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{errorMessage}</h4>
                            </div>
                            {errorReason && (
                                <p className="text-sm text-muted-foreground max-w-md">
                                    {errorReason}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!result) {
        return (
            <Card>
                <CardContent className="flex items-center justify-between py-6 px-6">
                    <div className="flex items-center gap-4">
                        {/* Alert Icon */}
                        <div className="flex items-center justify-center h-16 w-16">
                            <AlertCircle className="h-10 w-10 text-orange-500" />
                        </div>

                        {/* Error Message */}
                        <div className="space-y-2">
                            <h4 className="font-semibold">No analysis result available</h4>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }


    const getScoreRingColor = (score: number) => {
        if (score >= 80) return "border-green-500"
        if (score >= 60) return "border-yellow-500"
        return "border-destructive"
    }

    const getRecommendationStyle = (rec: string): string => {
        if (rec === 'Strong Hire' || rec === 'Hire') return 'bg-primary/10 text-primary'
        if (rec === 'Weak Hire') return 'bg-amber-500/10 text-amber-700'
        return 'bg-red-500/10 text-red-700' // Reject
    }

    // Full mode - render content directly without dialog
    if (mode === 'full' && result) {
        return (
            <div className="space-y-6">
                {/* Overall Score Card */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1.5">
                                <CardTitle className="text-2xl">Interview Assessment</CardTitle>
                                <CardDescription className="text-base">
                                    AI-powered evaluation and hiring recommendation
                                </CardDescription>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                {(() => {
                                    const size = 80;
                                    const strokeWidth = 6;
                                    const radius = (size - strokeWidth) / 2;
                                    const circumference = 2 * Math.PI * radius;
                                    const percentage = result.score;
                                    const offset = circumference - (percentage / 100) * circumference;
                                    const strokeColor = result.score >= 80 ? 'stroke-green-500' : result.score >= 60 ? 'stroke-yellow-500' : 'stroke-destructive';

                                    return (
                                        <svg width={size} height={size} className="transform -rotate-90">
                                            {/* Background circle */}
                                            <circle
                                                cx={size / 2}
                                                cy={size / 2}
                                                r={radius}
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={strokeWidth}
                                                className="text-secondary"
                                            />
                                            {/* Progress circle */}
                                            <circle
                                                cx={size / 2}
                                                cy={size / 2}
                                                r={radius}
                                                fill="none"
                                                strokeWidth={strokeWidth}
                                                strokeDasharray={circumference}
                                                strokeDashoffset={offset}
                                                strokeLinecap="round"
                                                className={strokeColor}
                                            />
                                            {/* Score text */}
                                            <text
                                                x="50%"
                                                y="50%"
                                                dominantBaseline="middle"
                                                textAnchor="middle"
                                                transform={`rotate(90 ${size / 2} ${size / 2})`}
                                                className="font-bold fill-current"
                                                style={{ fontSize: '24px' }}
                                            >
                                                {result.score}
                                            </text>
                                        </svg>
                                    );
                                })()}
                                <Badge className={`text-xs ${getRecommendationStyle(result.recommendation)}`}>
                                    {result.recommendation}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground">Summary</h4>
                            <p className="text-sm leading-relaxed">{result.summary}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Detailed Criterion Scores */}
                {result.criterion_scores && result.criterion_scores.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Evaluation Criteria</CardTitle>
                            <CardDescription>
                                Detailed breakdown of performance across key competencies
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {result.criterion_scores.map((criterion, idx) => {
                                const percentage = (criterion.score / 100) * 100;
                                const strokeColor = criterion.score >= 80 ? 'stroke-green-500' : criterion.score >= 60 ? 'stroke-yellow-500' : 'stroke-destructive';
                                const textColor = criterion.score >= 80 ? 'text-green-500' : criterion.score >= 60 ? 'text-yellow-500' : 'text-destructive';

                                // Circle parameters
                                const size = 80;
                                const strokeWidth = 6;
                                const radius = (size - strokeWidth) / 2;
                                const circumference = 2 * Math.PI * radius;
                                const offset = circumference - (percentage / 100) * circumference;

                                return (
                                    <div key={idx} className="space-y-3">
                                        {/* Criterion Header and Circular Progress */}
                                        <div className="flex items-start gap-6">
                                            {/* Circular Progress Bar */}
                                            <div className="flex-shrink-0">
                                                <svg width={size} height={size} className="transform -rotate-90">
                                                    {/* Background circle */}
                                                    <circle
                                                        cx={size / 2}
                                                        cy={size / 2}
                                                        r={radius}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth={strokeWidth}
                                                        className="text-secondary"
                                                    />
                                                    {/* Progress circle */}
                                                    <circle
                                                        cx={size / 2}
                                                        cy={size / 2}
                                                        r={radius}
                                                        fill="none"
                                                        strokeWidth={strokeWidth}
                                                        strokeDasharray={circumference}
                                                        strokeDashoffset={offset}
                                                        strokeLinecap="round"
                                                        className={`${strokeColor} transition-all duration-500`}
                                                    />
                                                    {/* Score text */}
                                                    <text
                                                        x="50%"
                                                        y="50%"
                                                        dominantBaseline="middle"
                                                        textAnchor="middle"
                                                        transform={`rotate(90 ${size / 2} ${size / 2})`}
                                                        className={`${textColor} font-bold`}
                                                        style={{ fontSize: '20px' }}
                                                    >
                                                        {criterion.score}
                                                    </text>
                                                </svg>
                                            </div>

                                            {/* Criterion Details */}
                                            <div className="flex-1 space-y-3">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <h5 className="font-semibold text-lg">{criterion.category}</h5>
                                                        <Badge variant="outline" className="text-xs font-normal">
                                                            {criterion.weight}% weight
                                                        </Badge>
                                                    </div>
                                                    {/* Assessment */}
                                                    <p className="text-sm text-muted-foreground">{criterion.assessment}</p>
                                                </div>

                                                {/* Evidence */}
                                                {criterion.evidence && criterion.evidence.length > 0 && (
                                                    <div className="space-y-2">
                                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Evidence</span>
                                                        <ul className="space-y-1.5">
                                                            {criterion.evidence.map((item, i) => (
                                                                <li key={i} className="text-sm text-muted-foreground pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-muted-foreground/50">
                                                                    {item}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Separator between criteria */}
                                        {idx < result.criterion_scores!.length - 1 && (
                                            <div className="border-t pt-3" />
                                        )}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Key Strengths */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                                Key Strengths
                            </CardTitle>
                            <CardDescription>
                                Notable positive attributes demonstrated
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {result.key_pros.map((pro, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm">
                                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                        <span>{pro}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Areas for Improvement */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <TrendingDown className="h-5 w-5 text-orange-600" />
                                Areas for Improvement
                            </CardTitle>
                            <CardDescription>
                                Opportunities for growth and development
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {result.key_cons.map((con, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm">
                                        <XCircle className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                                        <span>{con}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Footer Note */}
                <Card className="bg-muted/50">
                    <CardContent className="py-4">
                        <p className="text-xs text-center text-muted-foreground">
                            This assessment was generated by AI and should be used as a guide alongside your own judgment.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Check if this is an insufficient data error
    const errorResult = result as { error?: string } | null;
    const isInsufficientData = errorResult?.error && (errorResult.error.includes('Insufficient') || errorResult.error.includes('insufficient'));

    return (
        /* Compact Score Display */
        <Card className={cn(
            "transition-all",
            !isInsufficientData && "hover:shadow-md cursor-pointer"
        )}>
            <CardContent className="flex items-center justify-between py-6 px-6">
                <div className="flex items-center gap-4">
                    {/* Score Circle with Progress */}
                    <div className="flex-shrink-0">
                        {(() => {
                            const size = 64;
                            const strokeWidth = 6;
                            const radius = (size - strokeWidth) / 2;
                            const circumference = 2 * Math.PI * radius;
                            const percentage = result.score;
                            const offset = circumference - (percentage / 100) * circumference;
                            const strokeColor = result.score >= 80 ? 'stroke-green-500' : result.score >= 60 ? 'stroke-yellow-500' : 'stroke-destructive';

                            return (
                                <svg width={size} height={size} className="transform -rotate-90">
                                    {/* Background circle */}
                                    <circle
                                        cx={size / 2}
                                        cy={size / 2}
                                        r={radius}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={strokeWidth}
                                        className="text-secondary"
                                    />
                                    {/* Progress circle */}
                                    <circle
                                        cx={size / 2}
                                        cy={size / 2}
                                        r={radius}
                                        fill="none"
                                        strokeWidth={strokeWidth}
                                        strokeDasharray={circumference}
                                        strokeDashoffset={offset}
                                        strokeLinecap="round"
                                        className={strokeColor}
                                    />
                                    {/* Score text */}
                                    <text
                                        x="50%"
                                        y="50%"
                                        dominantBaseline="middle"
                                        textAnchor="middle"
                                        transform={`rotate(90 ${size / 2} ${size / 2})`}
                                        className="font-bold fill-current"
                                        style={{ fontSize: '20px' }}
                                    >
                                        {result.score}
                                    </text>
                                </svg>
                            );
                        })()}
                    </div>

                    {/* Recommendation & Summary Preview */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold">Interview Score</h4>
                            <Badge className={getRecommendationStyle(result.recommendation)}>
                                {result.recommendation}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1 max-w-md">
                            {result.summary}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-sm font-medium">View Details</span>
                    <ChevronRight className="h-5 w-5" />
                </div>
            </CardContent>
        </Card>
    )
}
