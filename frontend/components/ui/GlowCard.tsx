'use client';

import React, { useRef, useState, useEffect } from 'react';

/**
 * GlowCard — A premium card component with a border-light effect that
 * follows the mouse cursor. 
 */
export const GlowCard = ({ 
  children, 
  className = '', 
  style = {} 
}: { 
  children: React.ReactNode, 
  className?: string, 
  style?: React.CSSProperties 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden glow-card-container ${className}`}
      style={{
        ...style,
        '--mouse-x': `${mousePosition.x}px`,
        '--mouse-y': `${mousePosition.y}px`,
        position: 'relative',
        borderRadius: '18px',
        transition: 'all 0.3s ease',
      } as any}
    >
      {/* The Glow Layer */}
      <div 
        className="glow-overlay"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), var(--accent-soft), transparent 40%)`,
        }}
      />
      
      {/* The Border Glow */}
      <div 
        className="glow-border"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), var(--accent-border), transparent 40%)`,
        }}
      />

      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  );
};
