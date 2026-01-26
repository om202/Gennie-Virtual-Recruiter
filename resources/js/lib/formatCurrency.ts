// Currency formatting utility using Intl.NumberFormat

export interface FormatCurrencyOptions {
    currency?: string
    locale?: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
}

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string (e.g., "$60,000")
 */
export function formatCurrency(
    amount: number,
    options: FormatCurrencyOptions = {}
): string {
    const {
        currency = 'USD',
        locale = 'en-US',
        minimumFractionDigits = 0,
        maximumFractionDigits = 0,
    } = options

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(amount)
}

/**
 * Format a salary range with period suffix
 * @param min - Minimum salary (optional)
 * @param max - Maximum salary (optional)
 * @param currency - Currency code (default: USD)
 * @param period - Salary period: yearly, monthly, hourly
 * @returns Formatted salary range string
 */
export function formatSalaryRange(
    min: number | null,
    max: number | null,
    currency: string = 'USD',
    period: 'yearly' | 'monthly' | 'hourly' = 'yearly'
): string | null {
    if (!min && !max) return null

    const periodSuffix = period === 'yearly' ? '/yr' : period === 'monthly' ? '/mo' : '/hr'

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    if (min && max) {
        return `${formatAmount(min)} - ${formatAmount(max)}${periodSuffix}`
    }

    if (min) {
        return `${formatAmount(min)}+${periodSuffix}`
    }

    return `Up to ${formatAmount(max!)}${periodSuffix}`
}
