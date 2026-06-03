import moment from 'moment-timezone';

/**
 * Formats a date string to a human-readable format.
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options,
    }).format(new Date(date));
}

/**
 * Formats a UTC timestamp as a localized date and time string.
 */
export function formatDateTime(utc_timestamp?: string | Date | null, timezone?: string | null): string {
    if (!utc_timestamp) return '—';

    const displayTimezone = timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
    const formatted = moment.utc(utc_timestamp).tz(displayTimezone);

    if (!formatted.isValid()) {
        return '—';
    }

    return formatted.format('L LT');
}

/**
 * Returns a relative time string (e.g. "2 hours ago").
 */
export function timeAgo(date: string | Date): string {
    const now = Date.now();
    const then = new Date(date).getTime();
    const diffMs = now - then;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 30) return formatDate(date);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
}

/**
 * Checks if a date is in the past.
 */
export function isPast(date: string | Date): boolean {
    return new Date(date).getTime() < Date.now();
}

/**
 * Returns ISO date string for today.
 */
export function today(): string {
    return new Date().toISOString().split('T')[0] ?? '';
}
