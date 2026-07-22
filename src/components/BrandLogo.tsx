import React from "react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "icon" | "horizontal";
  theme?: "light" | "dark";
  showTagline?: boolean;
  className?: string;
}

export default function BrandLogo({
  size = "md",
  variant = "full",
  theme = "dark",
  showTagline = true,
  className = ""
}: BrandLogoProps) {
  // Container sizes with 16-20dp rounded corners
  const iconSizes = {
    sm: "w-8 h-8 rounded-xl",
    md: "w-11 h-11 rounded-2xl",
    lg: "w-16 h-16 rounded-2xl",
    xl: "w-24 h-24 rounded-3xl"
  };

  const svgIconSizes = {
    sm: 20,
    md: 28,
    lg: 40,
    xl: 60
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
    xl: "text-2xl"
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Premium Hexagon Adaptive Logo Container */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 ${
          theme === "dark"
            ? "bg-[#0B1220] border border-[#243353]"
            : "bg-gradient-to-tr from-[#2563EB] to-[#1D4ED8] border border-blue-400/30"
        }`}
      >
        {/* Soft Ambient Glow */}
        <div className="absolute inset-0 rounded-2xl bg-[#2563EB]/10 blur-xs pointer-events-none" />

        {/* Premium Hexagon SVG with Wrench & Gear */}
        <svg
          width={svgIconSizes[size]}
          height={svgIconSizes[size]}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 filter drop-shadow-md"
        >
          <defs>
            {/* Royal Blue Gradient */}
            <linearGradient id="royalBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="60%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>

            {/* Dark Navy Gradient */}
            <linearGradient id="darkNavyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#18233C" />
              <stop offset="100%" stopColor="#0B1220" />
            </linearGradient>

            {/* Metallic White Highlight */}
            <linearGradient id="whiteHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>
          </defs>

          {/* Outer Hexagon Shell */}
          <path
            d="M24 3L42 13.4V34.6L24 45L6 34.6V13.4L24 3Z"
            fill={theme === "dark" ? "url(#royalBlueGrad)" : "url(#whiteHighlight)"}
            opacity={theme === "dark" ? "0.2" : "0.25"}
          />

          {/* Precision Hexagon Border */}
          <path
            d="M24 5L40 14.25V33.75L24 43L8 33.75V14.25L24 5Z"
            stroke={theme === "dark" ? "#2563EB" : "#FFFFFF"}
            strokeWidth="2"
            strokeLinejoin="round"
            fill={theme === "dark" ? "url(#darkNavyGrad)" : "url(#royalBlueGrad)"}
          />

          {/* Outer Gear Teeth on Hexagon Vertices */}
          <circle cx="24" cy="5" r="1.5" fill="#3B82F6" />
          <circle cx="40" cy="14.25" r="1.5" fill="#3B82F6" />
          <circle cx="40" cy="33.75" r="1.5" fill="#3B82F6" />
          <circle cx="24" cy="43" r="1.5" fill="#3B82F6" />
          <circle cx="8" cy="33.75" r="1.5" fill="#3B82F6" />
          <circle cx="8" cy="14.25" r="1.5" fill="#3B82F6" />

          {/* Center Gear Ring */}
          <circle
            cx="24"
            cy="24"
            r="10"
            stroke="url(#whiteHighlight)"
            strokeWidth="2.5"
            strokeDasharray="4 2"
            fill="none"
          />

          {/* Modern Crossed Wrench & Spark Icon */}
          <path
            d="M17.5 30.5L22 26M26 22L30.5 17.5M31.8 15.2C32.4 13.8 32.1 12.1 30.9 10.9C29.6 9.6 27.8 9.4 26.4 10.1L28.2 11.9L26.1 14L24.3 12.2C25 13.6 24.8 15.4 23.5 16.7C22.3 17.9 20.6 18.2 19.2 17.6L17.5 19.3L19.6 21.4L17.5 23.5L15.4 21.4L13.7 23.1C13 24.5 13.3 26.2 14.5 27.5C15.8 28.8 17.6 29 19 28.3L17.2 26.5L19.3 24.4L21.1 26.2C20.4 27.6 20.7 29.3 21.9 30.6C23.1 31.8 24.9 32.1 26.3 31.4L30.5 35.6C31.1 36.2 32.1 36.2 32.7 35.6C33.3 35 33.3 34 32.7 33.4L28.5 29.2C29.2 27.8 28.9 26.1 27.7 24.8L26 23.1L23.9 25.2L21.8 23.1L23.9 21L22.2 19.3L17.5 24"
            fill="url(#whiteHighlight)"
          />

          {/* Center Precision Spark Dot */}
          <circle cx="24" cy="24" r="2" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1" />
        </svg>
      </div>

      {/* Brand Name & Tagline */}
      {variant !== "icon" && (
        <div className="flex flex-col">
          <div className={`font-extrabold tracking-tight flex items-center gap-1.5 ${textSizes[size]}`}>
            <span className={theme === "dark" ? "text-white" : "text-[#0B1220]"}>Auto Parts</span>
            <span className="text-white font-bold uppercase tracking-wider text-[0.7em] px-2 py-0.5 rounded-lg bg-[#2563EB] shadow-sm">
              Market
            </span>
          </div>

          {showTagline && (
            <span
              className={`text-[10px] font-semibold tracking-widest uppercase mt-0.5 ${
                theme === "dark" ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Verified Spare Parts
            </span>
          )}
        </div>
      )}
    </div>
  );
}

