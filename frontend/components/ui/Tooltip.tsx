import React, { useState } from 'react';

/**
 * Clean, Sophisticated Tooltip Component.
 * Wraps any element and provides a high-contrast label on hover.
 */
export const Tooltip = ({ 
  children, 
  text, 
  position = 'top' 
}: { 
  children: React.ReactNode, 
  text: string, 
  position?: 'top' | 'bottom' | 'left' | 'right' 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return { bottom: '100%', left: '50%', transform: 'translateX(-50%) translateY(-10px)' };
      case 'bottom':
        return { top: '100%', left: '50%', transform: 'translateX(-50%) translateY(10px)' };
      case 'left':
        return { right: '100%', top: '50%', transform: 'translateY(-50%) translateX(-10px)' };
      case 'right':
        return { left: '100%', top: '50%', transform: 'translateY(-50%) translateX(10px)' };
      default:
        return {};
    }
  };

  return (
    <div 
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && text && (
        <div style={{
          position: 'absolute',
          ...getPositionStyles(),
          backgroundColor: 'var(--white)',
          color: 'var(--black)',
          padding: '6px 12px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          zIndex: 1000,
          pointerEvents: 'none',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }} className="caps animate-fade-in">
          {text}
        </div>
      )}
    </div>
  );
};
