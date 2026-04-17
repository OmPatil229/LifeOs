import React, { useRef, useEffect, useCallback } from 'react';
import { useLifeStore, TimeLayer } from '../../store/useLifeStore';
import { DayCardContent, WeekCardContent, MonthCardContent, YearCardContent } from './TimeCards';

// Define layers in logical left-to-right order
const LAYERS: TimeLayer[] = ['day', 'week', 'month', 'year'];

export const TimeLayerStack = () => {
  const { activeTimeLayer, setActiveTimeLayer } = useLifeStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);

  /**
   * Sync scroll position when clicking tabs (activeTimeLayer change)
   */
  useEffect(() => {
    if (!scrollContainerRef.current || isProgrammaticScroll.current) return;

    const layerIndex = LAYERS.indexOf(activeTimeLayer);
    const container = scrollContainerRef.current;
    const cardWidth = container.offsetWidth;

    isProgrammaticScroll.current = true;
    container.scrollTo({
      left: layerIndex * cardWidth,
      behavior: 'smooth'
    });

    // Reset the flag after animation
    const timer = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 600); // slightly longer than smooth scroll duration

    return () => clearTimeout(timer);
  }, [activeTimeLayer]);

  /**
   * Detect scroll position to update active tab in header
   */
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || isProgrammaticScroll.current) return;

    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.offsetWidth;
    const gap = 24;
    
    // Calculate which index we are closest to, accounting for the gap
    const index = Math.round(scrollLeft / (cardWidth + gap));
    if (index >= 0 && index < LAYERS.length) {
      const newLayer = LAYERS[index];
      if (newLayer !== activeTimeLayer) {
        setActiveTimeLayer(newLayer);
      }
    }
  }, [activeTimeLayer, setActiveTimeLayer]);

  return (
    <div 
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="no-scrollbar"
      style={{ 
        display: 'flex',
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        scrollBehavior: 'smooth',
        width: '100%',
        height: '100%',
        gap: '24px',
        padding: '10px 0',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {LAYERS.map((layer) => {
        const isActive = layer === activeTimeLayer;

        return (
          <div
            key={layer}
            style={{
              flex: '0 0 100%',
              scrollSnapAlign: 'center',
              minHeight: '600px',
              background: 'var(--surface-1)',
              borderRadius: '24px',
              border: isActive ? '1px solid var(--white)' : '1px solid var(--border)',
              boxShadow: isActive 
                ? '0 30px 60px rgba(0,0,0,0.6), 0 0 40px rgba(255,255,255,0.02)' 
                : '0 10px 30px rgba(0,0,0,0.3)',
              padding: '40px',
              transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              opacity: isActive ? 1 : 0.4,
              transform: isActive ? 'scale(1)' : 'scale(0.95)',
              overflow: 'hidden'
            }}
          >
            <div style={{ maxWidth: '1040px', margin: '0 auto', height: '100%', pointerEvents: isActive ? 'auto' : 'none' }}>
              {layer === 'day' && <DayCardContent />}
              {layer === 'week' && <WeekCardContent />}
              {layer === 'month' && <MonthCardContent />}
              {layer === 'year' && <YearCardContent />}
            </div>
          </div>
        );
      })}
    </div>
  );
};
