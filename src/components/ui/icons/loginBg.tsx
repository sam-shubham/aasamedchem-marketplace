const LoginBg = () => {
    // Two families of smooth S-curves.
    // Each line starts spread across the left edge,
    // gently curves through the canvas, and fades out toward the right.
    // NO hard focal / pinch point — just natural ribbon flow.

    const wavesTop = [
        // [d, gradId, strokeWidth]
        ['M-40 60  C 80 120 160 240 280 310 C 380 368 460 360 680 340', 'lg0', 1.6],
        ['M-40 100 C 80 158 158 272 278 342 C 378 398 458 390 680 372', 'lg0', 1.4],
        ['M-40 140 C 80 196 156 304 276 374 C 376 428 456 420 680 404', 'lg1', 1.2],
        ['M-40 180 C 80 234 154 336 274 406 C 374 458 454 452 680 436', 'lg1', 1.05],
        ['M-40 220 C 80 272 152 368 272 438 C 372 488 452 484 680 468', 'lg2', 0.9],
        ['M-40 260 C 80 310 150 400 270 470 C 370 518 450 516 680 500', 'lg2', 0.75],
        ['M-40 300 C 80 348 148 432 268 502 C 368 548 448 548 680 532', 'lg3', 0.6],
        ['M-40 340 C 80 386 146 464 266 532 C 366 576 446 578 680 564', 'lg3', 0.48],
        ['M-40 380 C 80 418 144 494 264 560 C 364 602 444 608 680 594', 'lg3', 0.36],
        ['M-40 420 C 80 450 142 522 262 586 C 362 626 442 636 680 622', 'lg4', 0.26],
        ['M-40 460 C 80 482 140 550 260 612 C 360 650 440 662 680 650', 'lg4', 0.2],
    ];

    const wavesBot = [
        // Mirror family — from lower-left, curve up-right
        ['M-40 840 C 80 780 160 660 280 590 C 380 532 460 540 680 560', 'lg0', 1.6],
        ['M-40 800 C 80 742 158 628 278 558 C 378 502 458 508 680 528', 'lg0', 1.4],
        ['M-40 760 C 80 704 156 596 276 526 C 376 472 456 476 680 496', 'lg1', 1.2],
        ['M-40 720 C 80 666 154 564 274 494 C 374 442 454 444 680 464', 'lg1', 1.05],
        ['M-40 680 C 80 628 152 532 272 462 C 372 412 452 412 680 432', 'lg2', 0.9],
        ['M-40 640 C 80 590 150 500 270 430 C 370 382 450 380 680 400', 'lg2', 0.75],
        ['M-40 600 C 80 552 148 468 268 400 C 368 354 448 350 680 370', 'lg3', 0.6],
        ['M-40 560 C 80 516 146 438 266 372 C 366 328 446 322 680 342', 'lg3', 0.48],
        ['M-40 520 C 80 480 144 408 264 344 C 364 302 444 296 680 316', 'lg3', 0.36],
        ['M-40 480 C 80 446 142 380 262 318 C 362 278 442 270 680 290', 'lg4', 0.26],
        ['M-40 440 C 80 412 140 352 260 292 C 360 254 440 246 680 266', 'lg4', 0.2],
    ];

    const dots = [
        [18, 160, 2.2, 0.7],
        [22, 640, 2.0, 0.65],
        [180, 290, 1.4, 0.35],
        [200, 610, 1.3, 0.32],
        [90, 420, 1.6, 0.28],
    ];

    return (
        <div className="absolute inset-0 overflow-hidden bg-(--color-background)">
            <svg className="w-full h-full" viewBox="0 0 680 900" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                <defs>
                    <clipPath id="lgbg-clip">
                        <rect width="680" height="900" />
                    </clipPath>

                    {/* Soft left-edge ambient — no hard splash */}
                    <radialGradient id="lgbg-ambL" cx="0%" cy="50%" r="52%">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="var(--color-background)" stopOpacity="0" />
                    </radialGradient>

                    {/* Very faint center warmth */}
                    <radialGradient id="lgbg-ambC" cx="18%" cy="50%" r="38%">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="var(--color-background)" stopOpacity="0" />
                    </radialGradient>

                    {/* Dot grid */}
                    <pattern id="lgbg-dots" width="36" height="36" patternUnits="userSpaceOnUse">
                        <circle cx="18" cy="18" r="0.7" fill="var(--color-muted-foreground)" fillOpacity="0.045" />
                    </pattern>

                    {/* Line gradients — userSpaceOnUse so opacity is x-position based */}
                    <linearGradient id="lgbg-lg0" gradientUnits="userSpaceOnUse" x1="-40" y1="0" x2="680" y2="0">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0" />
                        <stop offset="4%" stopColor="var(--color-primary)" stopOpacity="0.82" />
                        <stop offset="28%" stopColor="var(--color-primary)" stopOpacity="0.5" />
                        <stop offset="58%" stopColor="var(--color-primary)" stopOpacity="0.14" />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                    </linearGradient>

                    <linearGradient id="lgbg-lg1" gradientUnits="userSpaceOnUse" x1="-40" y1="0" x2="680" y2="0">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0" />
                        <stop offset="4%" stopColor="var(--color-primary)" stopOpacity="0.58" />
                        <stop offset="26%" stopColor="var(--color-primary)" stopOpacity="0.32" />
                        <stop offset="55%" stopColor="var(--color-primary)" stopOpacity="0.07" />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                    </linearGradient>

                    <linearGradient id="lgbg-lg2" gradientUnits="userSpaceOnUse" x1="-40" y1="0" x2="680" y2="0">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0" />
                        <stop offset="4%" stopColor="var(--color-primary)" stopOpacity="0.36" />
                        <stop offset="24%" stopColor="var(--color-primary)" stopOpacity="0.17" />
                        <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="0.03" />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                    </linearGradient>

                    <linearGradient id="lgbg-lg3" gradientUnits="userSpaceOnUse" x1="-40" y1="0" x2="680" y2="0">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0" />
                        <stop offset="4%" stopColor="var(--color-primary)" stopOpacity="0.2" />
                        <stop offset="22%" stopColor="var(--color-primary)" stopOpacity="0.08" />
                        <stop offset="44%" stopColor="var(--color-primary)" stopOpacity="0.01" />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                    </linearGradient>

                    <linearGradient id="lgbg-lg4" gradientUnits="userSpaceOnUse" x1="-40" y1="0" x2="680" y2="0">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0" />
                        <stop offset="4%" stopColor="var(--color-primary)" stopOpacity="0.1" />
                        <stop offset="20%" stopColor="var(--color-primary)" stopOpacity="0.03" />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                    </linearGradient>

                    {/* Top/bottom edge fade */}
                    <linearGradient id="lgbg-vfade" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-background)" stopOpacity="1" />
                        <stop offset="11%" stopColor="var(--color-background)" stopOpacity="0" />
                        <stop offset="89%" stopColor="var(--color-background)" stopOpacity="0" />
                        <stop offset="100%" stopColor="var(--color-background)" stopOpacity="1" />
                    </linearGradient>

                    {/* Vignette */}
                    <radialGradient id="lgbg-vig" cx="50%" cy="50%" r="74%">
                        <stop offset="0%" stopColor="var(--color-background)" stopOpacity="0" />
                        <stop offset="100%" stopColor="var(--color-background)" stopOpacity="0.52" />
                    </radialGradient>
                </defs>

                {/* Base layers */}
                <rect width="680" height="900" fill="var(--color-background)" />
                <rect width="680" height="900" fill="url(#lgbg-ambL)" />
                <rect width="680" height="900" fill="url(#lgbg-ambC)" />
                <rect width="680" height="900" fill="url(#lgbg-dots)" />

                <g clipPath="url(#lgbg-clip)">
                    {/* Upper ribbon — fans from upper-left, curves down toward right */}
                    {wavesTop.map(([d, grad, sw], i) => (
                        <path key={`t${i}`} d={String(d)} fill="none" stroke={`url(#lgbg-${grad})`} strokeWidth={sw} />
                    ))}

                    {/* Lower ribbon — fans from lower-left, curves up toward right */}
                    {wavesBot.map(([d, grad, sw], i) => (
                        <path key={`b${i}`} d={String(d)} fill="none" stroke={`url(#lgbg-${grad})`} strokeWidth={sw} />
                    ))}

                    {/* Accent dots */}
                    {dots.map(([cx, cy, r, op], i) => (
                        <circle key={i} cx={cx} cy={cy} r={r} fill="var(--color-primary)" fillOpacity={op} />
                    ))}

                    <rect width="680" height="900" fill="url(#lgbg-vfade)" />
                    <rect width="680" height="900" fill="url(#lgbg-vig)" />
                </g>
            </svg>
        </div>
    );
};

export default LoginBg;
