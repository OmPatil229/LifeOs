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
  variant?: 'primary' | 'secondary' | 'outline',
  className?: string,
  id?: string
}) => {
  const baseStyles = "px-8 py-4 rounded-full font-bold transition-all duration-300 flex items-center justify-center gap-2 tracking-tight";
  
  const variants = {
    primary: "bg-white text-black hover:bg-gray-200 shadow-xl",
    secondary: "bg-gray-900 text-white hover:bg-black border border-white/10",
    outline: "bg-transparent text-white border border-white/20 hover:border-white hover:bg-white/5"
  };

  return (
    <button 
      id={id}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={{
        fontSize: '15px',
        letterSpacing: '-0.01em'
      }}
    >
      {children}
    </button>
  );
};
