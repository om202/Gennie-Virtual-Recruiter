// Shared utility for consistent badge colors across the app

export const getInterviewTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
        screening: 'bg-primary/10 text-primary',
        technical: 'bg-primary/10 text-primary',
        behavioral: 'bg-success/10 text-success',
        final: 'bg-warning/10 text-warning',
    }
    return colors[type] || 'bg-muted text-muted-foreground'
}

export const getDifficultyLevelColor = (level: string): string => {
    const colors: Record<string, string> = {
        entry: 'bg-success/10 text-success',
        mid: 'bg-warning/10 text-warning',
        senior: 'bg-destructive/10 text-destructive',
        executive: 'bg-primary/10 text-primary',
    }
    return colors[level] || 'bg-muted text-muted-foreground'
}
