// Shared utility for consistent badge colors across the app

export const getInterviewTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
        screening: 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
        technical: 'bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
        behavioral: 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400',
        final: 'bg-orange-500/10 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
    }
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
}

export const getDifficultyLevelColor = (level: string): string => {
    const colors: Record<string, string> = {
        entry: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
        mid: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
        senior: 'bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400',
        executive: 'bg-violet-500/10 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400',
    }
    return colors[level] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
}
