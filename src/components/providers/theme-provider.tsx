'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import * as React from 'react';

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
    // next-themes injects a script tag for FOUC prevention — it executes before
    // React hydration, so this warning is a false positive.
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>; // eslint-disable-line react/no-danger
}

export default ThemeProvider;
