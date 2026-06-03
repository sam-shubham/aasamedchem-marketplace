export function CyberLoader({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Loading" role="status">
            <style>{`
 @keyframes pulse-ring {
 0%, 100% { opacity: 0.15; transform: scale(0.8); }
 50% { opacity: 1; transform: scale(1); }
 }
 @keyframes spin-slow {
 from { transform: rotate(0deg); }
 to { transform: rotate(360deg); }
 }
 @keyframes spin-fast {
 from { transform: rotate(0deg); }
 to { transform: rotate(-360deg); }
 }
 @keyframes dash-offset {
 0% { stroke-dashoffset: 140; }
 50% { stroke-dashoffset: 35; }
 100% { stroke-dashoffset: 140; }
 }
 @keyframes dot-pulse {
 0%, 100% { opacity: 0.3; r: 1.5; }
 50% { opacity: 1; r: 2.5; }
 }
 `}</style>

            {/* Outer slow ring */}
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1.5" strokeDasharray="44 132" style={{ transformOrigin: '32px 32px', animation: 'spin-slow 3s linear infinite' }} />

            {/* Middle fast ring */}
            <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="1" strokeDasharray="28 110" style={{ transformOrigin: '32px 32px', animation: 'spin-fast 1.8s linear infinite' }} />

            {/* Inner pulsing ring */}
            <circle cx="32" cy="32" r="16" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.6" style={{ transformOrigin: '32px 32px', animation: 'spin-slow 5s linear infinite reverse' }} />

            {/* Center dot */}
            <circle cx="32" cy="32" r="3" fill="currentColor" style={{ animation: 'dot-pulse 1.2s ease-in-out infinite' }} />

            {/* Crosshair corners */}
            <path d="M30 20 L32 16 L34 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" style={{ animation: 'dash-offset 2s ease-in-out infinite' }} />
            <path d="M44 30 L48 32 L44 34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" style={{ animation: 'dash-offset 2s ease-in-out infinite 0.3s' }} />
            <path d="M34 44 L32 48 L30 44" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" style={{ animation: 'dash-offset 2s ease-in-out infinite 0.6s' }} />
            <path d="M20 34 L16 32 L20 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" style={{ animation: 'dash-offset 2s ease-in-out infinite 0.9s' }} />
        </svg>
    );
}
