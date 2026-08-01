import React, { useEffect, useRef } from 'react';

interface VinylRecordProps {
  isPlaying?: boolean;
  className?: string;
  size?: number;
}

export const VinylRecord: React.FC<VinylRecordProps> = ({
  isPlaying = false,
  className = '',
  size = 280,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const rotationRef = useRef<number>(0);
  const lastTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // 360 degrees per 10 seconds -> 0.036 deg/ms
    const SPEED_DEG_PER_MS = 0.036;

    const animate = (now: number) => {
      if (lastTimeRef.current !== null) {
        const delta = now - lastTimeRef.current;
        rotationRef.current = (rotationRef.current + delta * SPEED_DEG_PER_MS) % 360;
        if (svgRef.current) {
          svgRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
        }
      }
      lastTimeRef.current = now;
      if (isPlaying) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    if (isPlaying) {
      lastTimeRef.current = performance.now();
      animFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      lastTimeRef.current = null;
      // Persist the exact rotationRef.current angle on the DOM!
      if (svgRef.current) {
        svgRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
      }
    }

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Volumetric Soft Purple Ambient Glow & Rim Light */}
      <div
        className={`absolute inset-[-12px] rounded-full bg-gradient-to-tr from-purple-500/50 via-fuchsia-600/40 to-purple-800/50 blur-2xl transition-opacity duration-1000 pointer-events-none ${
          isPlaying ? 'opacity-95 animate-pulse' : 'opacity-40'
        }`}
      />

      {/* Floating Vinyl Record SVG */}
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox="0 0 500 500"
        className="relative z-10 w-full h-full drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)]"
        style={{
          willChange: 'transform',
          transform: `rotate(${rotationRef.current}deg)`,
        }}
      >
        <defs>
          {/* Vibrant Royal Purple Luxury Center Label Gradient */}
          <linearGradient id="centerLabelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E9D5FF" />
            <stop offset="35%" stopColor="#C084FC" />
            <stop offset="70%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#7E22CE" />
          </linearGradient>

          {/* Glass Specular Gloss Sheen */}
          <linearGradient id="glassGloss" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Vibrant Purple Edge Rim Light Gradient */}
          <linearGradient id="rimLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F3E8FF" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#C084FC" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#7E22CE" stopOpacity="0.9" />
          </linearGradient>

          {/* High-End Deep Black Radial Vinyl Base */}
          <radialGradient id="vinylBase" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#08090C" />
            <stop offset="55%" stopColor="#111319" />
            <stop offset="85%" stopColor="#0B0C10" />
            <stop offset="97%" stopColor="#161822" />
            <stop offset="100%" stopColor="#060709" />
          </radialGradient>

          {/* Subdued Glow Filter */}
          <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Blue-Purple Rim Light Ring */}
        <circle cx="250" cy="250" r="247" fill="none" stroke="url(#rimLight)" strokeWidth="3" opacity="0.95" />

        {/* Deep Black High-End Vinyl Body */}
        <circle cx="250" cy="250" r="245" fill="url(#vinylBase)" />

        {/* Micro Concentric Audiophile Grooves */}
        {Array.from({ length: 34 }).map((_, i) => {
          const r = 88 + i * 4.5;
          const opacity = (i % 4 === 0 ? 0.38 : i % 2 === 0 ? 0.22 : 0.12);
          return (
            <circle
              key={i}
              cx="250"
              cy="250"
              r={r}
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.8"
              strokeOpacity={opacity}
              strokeDasharray={i % 5 === 0 ? '160 10 80 6' : i % 3 === 0 ? '110 14' : 'none'}
            />
          );
        })}

        {/* Dynamic Specular Light Sheen Flares (Conical Refraction Optics) */}
        <path
          d="M 250 250 L 50 75 A 245 245 0 0 1 125 45 Z"
          fill="url(#glassGloss)"
          opacity="0.25"
        />
        <path
          d="M 250 250 L 450 425 A 245 245 0 0 1 375 455 Z"
          fill="url(#glassGloss)"
          opacity="0.2"
        />
        <path
          d="M 250 250 L 375 45 A 245 245 0 0 1 450 75 Z"
          fill="url(#glassGloss)"
          opacity="0.3"
        />
        <path
          d="M 250 250 L 125 455 A 245 245 0 0 1 50 425 Z"
          fill="url(#glassGloss)"
          opacity="0.2"
        />

        {/* Inner Record Boundary Ring */}
        <circle cx="250" cy="250" r="86" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.3" />
        <circle cx="250" cy="250" r="82" fill="#090a0d" />

        {/* Minimal Luxury Blue-Purple Gradient Center Label (No text, No logos) */}
        <circle cx="250" cy="250" r="74" fill="url(#centerLabelGrad)" filter="url(#subtleGlow)" />
        <circle cx="250" cy="250" r="74" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.4" />

        {/* Glassmorphism Inner Sheen on Center Label */}
        <path
          d="M 176 250 A 74 74 0 0 1 324 250 Z"
          fill="url(#glassGloss)"
          opacity="0.4"
        />

        {/* Center Spindle Hole & Precision Glass Ring */}
        <circle cx="250" cy="250" r="22" fill="#07080b" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.5" />
        <circle cx="250" cy="250" r="14" fill="#000000" />
        <circle cx="250" cy="250" r="9" fill="url(#glassGloss)" opacity="0.75" />
      </svg>
    </div>
  );
};
