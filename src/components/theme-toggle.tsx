'use client';

import { SunIcon, MoonIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, resolvedTheme, setTheme } = useTheme();

    const current = resolvedTheme || theme || 'system';
    const isDark = current === 'dark';
    const Icon = isDark ? MoonIcon : SunIcon;
    const label = isDark ? 'Dark' : 'Light';

    return (
        <Button variant="ghost" size="sm" className={className} aria-label="Toggle theme" onClick={() => setTheme(isDark ? 'light' : 'dark')}>
            <Icon className="size-4" />
            <span className="ml-2 text-sm capitalize">{label}</span>
        </Button>
    );
}

export default ThemeToggle;
