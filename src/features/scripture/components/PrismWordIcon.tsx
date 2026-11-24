import React from 'react';

/**
 * Custom Prism Word emblem: an open Bible whose spine refracts upward
 * into a sapphire-blue & amethyst-purple diamond prism.
 */
export function PrismWordIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="prismBeamGrad" x1="18" y1="3" x2="18" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="55%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="biblePagesGrad" x1="5" y1="20" x2="31" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#C4B5FD" />
        </linearGradient>
      </defs>

      {/* Subtle Prism Light Rays */}
      <path d="M18 3L23.5 11.5L18 18L12.5 11.5L18 3Z" fill="url(#prismBeamGrad)" fillOpacity="0.92" />
      <path d="M18 3L23.5 11.5L18 18L12.5 11.5L18 3Z" stroke="#E0E7FF" strokeWidth="1" strokeOpacity="0.5" />

      {/* Open Bible Pages */}
      <path
        d="M5 19.5C5 18.4 5.9 17.6 7 17.8C10.8 18.4 14.5 19.7 18 22.2C21.5 19.7 25.2 18.4 29 17.8C30.1 17.6 31 18.4 31 19.5V28.5C31 29.4 30.3 30.1 29.4 30.3C25.5 30.9 21.7 31.8 18 33C14.3 31.8 10.5 30.9 6.6 30.3C5.7 30.1 5 29.4 5 28.5V19.5Z"
        stroke="url(#biblePagesGrad)"
        strokeWidth="1.9"
        strokeLinejoin="round"
        fill="#0F172A"
        fillOpacity="0.6"
      />
      <path d="M18 22.2V32.8" stroke="#A78BFA" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
