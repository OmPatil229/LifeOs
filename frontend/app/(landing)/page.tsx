'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import './landing.css';

import {
  ArrowRight, ChevronDown, Sparkles, Shield,
  CheckCircle, Check, Play, Zap,
  Layers, Target, Clock, PenTool, BarChart3, Brain
} from 'lucide-react';
import { ScrollRevealText } from '../../components/ui/ScrollRevealText';
import { LuxuryButton } from '../../components/ui/LuxuryButton';
import { GlowCard } from '../../components/ui/GlowCard';


/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  accentClass: string;
  bgClass: string;
}

interface Step {
  number: string;
  title: string;
  description: string;
}

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

const FEATURES: Feature[] = [
  {
    icon: Layers,
    title: 'Visual Time Cards',
    description: 'A beautiful way to see your path. From years to days, your life is organized in a clear, nested stack.',
    accentClass: 'feature-accent-purple',
    bgClass: 'feature-bg-purple',
  },
  {
    icon: Target,
    title: 'Peace of Mind',
    description: 'Keep your goals in sight without the stress. See your progress and stay aligned with what truly matters.',
    accentClass: 'feature-accent-teal',
    bgClass: 'feature-bg-teal',
  },
  {
    icon: Clock,
    title: 'Perfect Daily Flow',
    description: 'A schedule that moves with you. LifeOS understands your energy and adapts to your day naturally.',
    accentClass: 'feature-accent-pink',
    bgClass: 'feature-bg-pink',
  },
  {
    icon: PenTool,
    title: 'Mindful Journaling',
    description: 'A gentle space for your thoughts. Understand your moods, track your energy, and find your calm.',
    accentClass: 'feature-accent-blue',
    bgClass: 'feature-bg-blue',
  },
  {
    icon: BarChart3,
    title: 'Clear Perspective',
    description: 'No more guessing. See your patterns clearly and understand where your time goes with simple, honest data.',
    accentClass: 'feature-accent-orange',
    bgClass: 'feature-bg-orange',
  },
  {
    icon: Brain,
    title: 'Guided Growth',
    description: 'Unlock insights about your habits and routines. It\'s like having a personal coach for your daily life.',
    accentClass: 'feature-accent-green',
    bgClass: 'feature-bg-green',
  },
];

const STEPS: Step[] = [
  {
    number: '01',
    title: 'Define Your Stack',
    description: 'Set your annual vision, monthly milestones, and weekly cycles. LifeOS builds the hierarchy automatically.',
  },
  {
    number: '02',
    title: 'Execute & Track',
    description: 'Work through adaptive daily timelines. Log focus sessions, journal entries, and habit completions.',
  },
  {
    number: '03',
    title: 'Evolve & Adapt',
    description: 'The adaptive engine detects patterns, calculates drift, and rewires your schedule for maximum output.',
  },
];

const STATS = [
  { value: 2847, suffix: '+', label: 'Waitlist Members' },
  { value: 94, suffix: '%', label: 'Goal Completion Rate' },
  { value: 12, suffix: 'hrs', label: 'Avg. Time Saved / Week' },
  { value: 4.9, suffix: '/5', label: 'Beta User Rating' },
];

/* ═══════════════════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════════════════ */

/**
 * Custom hook for scroll-triggered reveal animations.
 * Uses IntersectionObserver to detect when elements enter the viewport.
 */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    const el = ref.current;
    if (el) {
      const reveals = el.querySelectorAll('.reveal');
      reveals.forEach((r) => observer.observe(r));
    }

    return () => observer.disconnect();
  }, []);

  return ref;
}

/**
 * Custom hook for animated counting.
 * Increments from 0 to target value when visible.
 */
function useCountUp(target: number, isVisible: boolean, duration = 2000) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = Date.now();
    const isFloat = !Number.isInteger(target);

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic

      const currentValue = isFloat
        ? parseFloat((target * eased).toFixed(1))
        : Math.floor(target * eased);

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, target, duration]);

  return count;
}

/**
 * Custom hook for scroll-driven parallax effects.
 * Returns a progress value (0 → 1) based on element position in viewport.
 * Used to create smooth scale, opacity, and translate transforms on scroll.
 */
function useScrollParallax() {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    let ticking = false;

    const update = () => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;

      // progress: 0 = element just entered bottom, 1 = element at top
      const rawProgress = 1 - (rect.top / windowH);
      const progress = Math.max(0, Math.min(rawProgress, 2));

      // Entry animation: scale up from 0.92 → 1, fade in, slide up from 60px
      if (progress < 1) {
        const t = Math.max(0, progress);
        const eased = 1 - Math.pow(1 - t, 3);
        setStyle({
          opacity: eased,
          transform: `translateY(${(1 - eased) * 60}px) scale(${0.92 + eased * 0.08})`,
        });
      } else {
        // Subtle parallax drift after fully visible
        const overscroll = progress - 1;
        setStyle({
          opacity: 1,
          transform: `translateY(${-overscroll * 20}px) scale(1)`,
        });
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update(); // initial
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return { ref, style };
}

/**
 * Custom hook for hero parallax — fades and scales out the hero
 * as user scrolls down, creating a cinematic depth effect.
 */
function useHeroParallax() {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    let ticking = false;

    const update = () => {
      const scrollY = window.scrollY;
      const windowH = window.innerHeight;
      const progress = Math.min(scrollY / (windowH * 0.8), 1);

      // Hero fades and scales slightly as you scroll past
      const eased = progress * progress; // easeIn for gradual start
      setStyle({
        opacity: 1 - eased * 0.7,
        transform: `translateY(${scrollY * 0.3}px) scale(${1 - eased * 0.05})`,
        filter: `blur(${eased * 4}px)`,
      });

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return { ref, style };
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

/**
 * Navigation bar with scroll-aware transparency.
 */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { token } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
      <a href="#" className="nav-logo">
        <span className="nav-logo-icon">OS</span>
        LifeOS
      </a>

      <ul className="nav-links">
        <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features'); }}>Features</a></li>
        <li><a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollTo('how-it-works'); }}>The Way</a></li>
        {token ? (
          <li><Link href="/dashboard" className="nav-cta">Dashboard</Link></li>
        ) : (
          <>
            <li><Link href="/login">Sign In</Link></li>
            <li>
              <Link href="/register" className="nav-cta">
                Get Early Access
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}


/**
 * Animated background with floating gradient orbs and grid overlay.
 */
function AnimatedBackground() {
  return (
    <>
      <div className="hero-bg-mesh">
        <div className="mesh-orb mesh-orb-1" />
        <div className="mesh-orb mesh-orb-2" />
        <div className="mesh-orb mesh-orb-3" />
      </div>
      <div className="grid-overlay" />
    </>
  );
}

/**
 * Hero section with animated title, subtitle, CTA buttons,
 * and scroll-driven parallax that fades/scales/blurs as user scrolls.
 */
function HeroSection() {
  const { ref: heroRef, style: heroStyle } = useHeroParallax();
  const { token } = useAuthStore();
  const router = useRouter();

  return (
    <section className="hero-section" id="hero">
      <div ref={heroRef} style={{ ...heroStyle, willChange: 'transform, opacity, filter' }} className="hero-inner">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          {token ? 'welcome back' : 'membership open'}
        </div>

        <h1 className="hero-title">
          life, <br />
          <span className="hero-title-gradient">in flow.</span>
        </h1>

        <div style={{ maxWidth: 800, margin: '0 auto 60px' }}>
          <ScrollRevealText 
            text="The all-in-one space to organize your goals, focus your days, and find your calm in the chaos. Beautifully designed for real living."
            className="hero-subtitle"
            style={{ margin: 0, animation: 'none' }}
          />
        </div>

        <div className="hero-cta-group" style={{ justifyContent: 'center' }}>
          {token ? (
            <LuxuryButton
              onClick={() => router.push('/dashboard')}
              id="hero-go-dashboard"
            >
              Enter Dashboard <ArrowRight size={18} />
            </LuxuryButton>
          ) : (
            <LuxuryButton
              onClick={() => router.push('/register')}
              id="hero-join-waitlist"
            >
              Get Early Access <ArrowRight size={18} />
            </LuxuryButton>
          )}
          
          <LuxuryButton
            variant="outline"
            onClick={() => {
              const el = document.getElementById('features');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Explore <ChevronDown size={18} />
          </LuxuryButton>
        </div>

        <div className="hero-visual" style={{ opacity: 0.8 }}>
           <div style={{ padding: '40px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 120, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }} />
                <Play size={24} style={{ fill: 'white' }} />
                <div style={{ width: 320, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Feature card component with icon, title, and description.
 */
function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const Icon = feature.icon;
  return (
    <GlowCard className="feature-card reveal" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ padding: '48px' }}>
        <div className="feature-icon" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px' }}>
          <Icon size={24} style={{ color: 'white' }} />
        </div>
        <h3 className="feature-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', letterSpacing: '-0.02em' }}>{feature.title}</h3>
        <p className="feature-desc" style={{ fontSize: '15px', opacity: 0.6 }}>{feature.description}</p>
      </div>
    </GlowCard>
  );
}

/**
 * Scroll-animated section wrapper — applies parallax scale/fade/slide
 * effects driven by scroll position for a cinematic feel.
 */
function ScrollSection({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  const { ref: parallaxRef, style: parallaxStyle } = useScrollParallax();
  const revealRef = useScrollReveal();

  // Merge both refs
  const mergedRef = useCallback((node: HTMLDivElement | null) => {
    (parallaxRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    (revealRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  }, [parallaxRef, revealRef]);

  return (
    <div
      ref={mergedRef}
      className={className}
      id={id}
      style={{ ...parallaxStyle, willChange: 'transform, opacity' }}
    >
      {children}
    </div>
  );
}

/**
 * Features grid section showcasing all LifeOS capabilities.
 */
function FeaturesSection() {
  return (
    <ScrollSection className="landing-section scroll-section" id="features">
      <div className="section-label reveal">
        <span className="section-label-line" />
        CAPABILITIES
      </div>
      <h2 className="section-title reveal">
        Designed for <span className="hero-title-gradient">Clarity</span>
      </h2>
      <p className="section-subtitle reveal">
        Everything you need to manage your life in sync. Simple to start, powerful to grow with.
      </p>

      <div className="features-grid">
        {FEATURES.map((feature, i) => (
          <FeatureCard key={feature.title} feature={feature} index={i} />
        ))}
      </div>
    </ScrollSection>
  );
}

/**
 * How It Works — 3-step visual process.
 */
function HowItWorksSection() {
  return (
    <ScrollSection className="landing-section scroll-section" id="how-it-works">
      <div style={{ textAlign: 'center', marginBottom: 160 }}>
        <div className="section-label" style={{ justifyContent: 'center' }}>
          <span className="section-label-line" />
          methodology
        </div>
        <h2 className="section-title" style={{ margin: '0 auto 40px', textAlign: 'center' }}>
          the path to <br /><span className="hero-title-gradient">synchrony.</span>
        </h2>
        <ScrollRevealText 
          text="LifeOS turns chaos into clarity through a simple, adaptive loop designed for peak human performance."
          className="section-subtitle"
          style={{ margin: '0 auto', textAlign: 'center' }}
        />
      </div>

      <div className="steps-container">
        {STEPS.map((step, i) => (
          <div key={step.number} className="step-card reveal">
            <div className="step-number" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', fontFamily: 'var(--font-serif)' }}>{step.number}</div>
            <h3 className="step-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '24px' }}>{step.title}</h3>
            <p className="step-desc" style={{ opacity: 0.6 }}>{step.description}</p>
          </div>
        ))}
      </div>
    </ScrollSection>
  );
}

/**
 * Individual stat counter with animation.
 */
function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const count = useCountUp(value, isVisible);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="stat-item" ref={ref}>
      <div className="stat-value">{count}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

/**
 * Stats bar with animated counters.
 */
function StatsSection() {
  return (
    <ScrollSection className="stats-section scroll-section" id="stats">
      <div className="stats-grid">
        {STATS.map((stat) => (
          <StatCounter key={stat.label} {...stat} />
        ))}
      </div>
    </ScrollSection>
  );
}

/**
 * Waitlist CTA section with working email capture form.
 * Submits to /api/waitlist and shows success/error feedback.
 */
function WaitlistSection() {
  const { ref: parallaxRef, style: parallaxStyle } = useScrollParallax();
  const revealRef = useScrollReveal();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);

  const mergedRef = useCallback((node: HTMLDivElement | null) => {
    (parallaxRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    (revealRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  }, [parallaxRef, revealRef]);

  // Fetch current waitlist count on mount
  useEffect(() => {
    fetch('/api/waitlist')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setWaitlistCount(data.count + 2847);
        }
      })
      .catch(() => { /* silently fail */ });
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === 'loading') return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
        if (data.position) {
          setWaitlistCount(2847 + data.position);
        }
      } else {
        setStatus('error');
        setMessage(data.message);
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }, [email, status]);

  return (
    <section
      className="cta-section scroll-section"
      id="waitlist"
      ref={mergedRef}
      style={{ ...parallaxStyle, willChange: 'transform, opacity' }}
    >
      <div className="cta-glow-ring" />

      <div className="section-label reveal">
        <Sparkles size={14} />
        EARLY ACCESS
      </div>

      <h2 className="section-title reveal" style={{ textAlign: 'center', margin: '0 auto 20px' }}>
        Find Your <span className="hero-title-gradient">Sync.</span>
      </h2>

      <p className="section-subtitle reveal" style={{ textAlign: 'center', margin: '0 auto 48px' }}>
        Join thousands of people organizing their lives with LifeOS. 
        Secure your spot today and get early access to a more organized you.
      </p>

      <form className="waitlist-form reveal" onSubmit={handleSubmit} style={{ 
        background: 'rgba(255,255,255,0.02)', 
        padding: '12px', 
        borderRadius: '16px', 
        border: '1px solid var(--border)',
        maxWidth: '540px',
        margin: '0 auto'
      }}>
        <input
          type="email"
          className="luxury-input"
          placeholder="your email address"
          style={{ 
            flex: 1,
            background: 'transparent', 
            border: 'none',
            fontSize: '16px',
            paddingLeft: '24px'
          }}
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (status !== 'idle') setStatus('idle'); }}
          required
          disabled={status === 'loading'}
          id="waitlist-email-input"
        />
        <LuxuryButton
          variant="primary"
          className={status === 'success' ? 'success' : ''}
          id="waitlist-submit-button"
        >
          {status === 'loading' ? 'Saving...' : status === 'success' ? <><Check size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Success</> : 'Join Waitlist'}
        </LuxuryButton>
      </form>

      {message && (
        <p className={`waitlist-message ${status === 'success' ? 'success' : 'error'}`}>
          {message}
        </p>
      )}

      {waitlistCount !== null && (
        <p className="waitlist-count reveal">
          <Shield size={14} style={{ verticalAlign: 'middle', marginRight: 6, opacity: 0.5 }} />
          <strong>{waitlistCount.toLocaleString()}</strong> people already on the list
        </p>
      )}

      <div className="reveal" style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 24, color: 'var(--landing-text-dim)', fontSize: 13 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <CheckCircle size={14} style={{ color: '#22c55e' }} /> No spam, ever
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <CheckCircle size={14} style={{ color: '#22c55e' }} /> Unsubscribe anytime
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <CheckCircle size={14} style={{ color: '#22c55e' }} /> Founding member pricing
        </span>
      </div>
    </section>
  );
}

/**
 * Footer with branding and links.
 */
function Footer() {
  return (
    <footer className="landing-footer">
      <div className="footer-brand">
        <Zap size={16} style={{ color: 'var(--accent-primary)' }} />
        LifeOS
      </div>

      <ul className="footer-links">
        <li><a href="#features">Features</a></li>
        <li><a href="#how-it-works">The Way</a></li>
        <li><a href="#waitlist">Early Access</a></li>
        <li><a href="/dashboard">View Dashboard</a></li>
      </ul>

      <span className="footer-copy">
        © {new Date().getFullYear()} LifeOS. All rights reserved.
      </span>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */

/**
 * LifeOS Landing Page — Full-screen marketing page.
 *
 * Features:
 * - Animated mesh gradient background
 * - Scroll-driven parallax animations (hero fades/blurs, sections scale-in)
 * - Scroll-triggered reveal animations via IntersectionObserver
 * - Dashboard mockup preview
 * - Feature showcase grid
 * - How It Works 3-step process
 * - Animated stats counters
 * - Working waitlist email capture
 * - SEO-optimized structure
 */
export default function LandingPage() {
  return (
    <div className="landing-page">
      <AnimatedBackground />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
      <WaitlistSection />
      <Footer />
    </div>
  );
}
