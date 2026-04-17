'use client';

import React from 'react';

/**
 * LuxuryButton — A high-contrast, minimalist button designed for 
 * the refined luxury aesthetic.
 */
export const LuxuryButton = ({ 
  children, 
  onClick, 
  variant = 'primary',
  className = '',
  id
}: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  variant?: 'primary' | 'secondary' | 'outline' | 'accent',
  className?: string,
  id?: string
}) => {
  const baseStyles = "px-8 py-4 rounded-md font-bold transition-all duration-400 flex items-center justify-center gap-2 tracking-tight";
  
  const variants = {
    primary: "bg-white text-black hover:bg-gray-200 shadow-xl",
    secondary: "bg-gray-900 text-white hover:bg-black border border-white/10",
    outline: "bg-transparent text-white border border-white/20 hover:border-white hover:bg-white/5",
    accent: "bg-indigo-500 text-white hover:bg-indigo-600 shadow-[0_0_20px_rgba(165,180,252,0.3)]"
  };

  return (
    <button 
      id={id}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={{
        fontSize: '14px',
        letterSpacing: '0.04em',
        fontFamily: 'var(--font-serif)',
        textTransform: 'uppercase'
      }}
    >
      {children}
    </button>
  );
};
