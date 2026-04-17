'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * ScrollRevealText — Splits text into individual words or characters
 * and "lights them up" based on scroll position. Inspired by high-end
 * landing pages like CRED.
 */
export const ScrollRevealText = ({ 
  text, 
  className = '', 
  style = {},
  threshold = 0.5
}: { 
  text: string, 
  className?: string, 
  style?: React.CSSProperties,
  threshold?: number
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how far through the viewport the element is
      // 0 = just entered bottom, 1 = reached top
      const scrollProgress = 1 - (rect.top / windowHeight);
      const clampedProgress = Math.max(0, Math.min(1.5, scrollProgress));
      
      setProgress(clampedProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const words = text.split(' ');

  return (
    <div 
      ref={containerRef} 
      className={className} 
      style={{ 
        ...style,
        display: 'inline-block',
        lineHeight: 1.2
      }}
    >
      {words.map((word, i) => {
        // Calculate the opacity for each word based on overall scroll progress
        // Each word lights up sequentially
        const wordThreshold = (i / words.length) * 0.5 + 0.2;
        const opacity = Math.min(1, Math.max(0.15, (progress - wordThreshold) * 4));
        
        return (
          <span 
            key={i} 
            style={{ 
              opacity, 
              display: 'inline-block', 
              marginRight: '0.25em',
              transition: 'opacity 0.1s ease-out'
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
