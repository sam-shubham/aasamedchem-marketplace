/**
 * Validates that a string is a valid email address.
 */
export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validates password strength (minimum 8 chars, at least one letter and one number).
 */
export function isStrongPassword(password: string): boolean {
    return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
}

/**
 * Validates that a string is not empty after trimming.
 */
export function isNonEmpty(value: string): boolean {
    return value.trim().length > 0;
}

/**
 * Validates that a value falls within a numeric range.
 */
export function isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
}
