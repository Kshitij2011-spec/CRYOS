import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Menu, X, ArrowRight, Radio } from 'lucide-react';
import { ThemeToggle } from '../../../lib/theme/ThemeToggle';

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Detect scroll to adjust backdrop elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard accessibility: Escape closes mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header
      ref={navRef}
      className={`sticky top-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-canvas/90 backdrop-blur-md border-b border-border shadow-theme-sm'
          : 'bg-canvas/80 backdrop-blur-sm border-b border-border/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Wordmark */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg p-1"
          >
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center text-accent group-hover:bg-accent/20 transition-colors">
              <Compass className="w-4 h-4 animate-pulse-slow" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-wider text-foreground">
                  CRYOS
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-surface border border-border text-foreground-muted">
                  Ops
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-widest text-foreground-muted font-medium -mt-1 hidden sm:inline">
                Polar Expedition Logistics
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links — Only Real Targets */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            <a
              href="#overview"
              className="px-3.5 py-1.5 text-xs font-medium text-foreground-secondary hover:text-foreground hover:bg-surface-elevated rounded-md transition-colors"
            >
              Overview
            </a>
            <a
              href="#how-it-works"
              className="px-3.5 py-1.5 text-xs font-medium text-foreground-secondary hover:text-foreground hover:bg-surface-elevated rounded-md transition-colors"
            >
              How It Works
            </a>
            <a
              href="#capabilities"
              className="px-3.5 py-1.5 text-xs font-medium text-foreground-secondary hover:text-foreground hover:bg-surface-elevated rounded-md transition-colors"
            >
              Capabilities
            </a>
            <Link
              to="/control-tower"
              className="px-3.5 py-1.5 text-xs font-medium text-foreground-secondary hover:text-foreground hover:bg-surface-elevated rounded-md transition-colors"
            >
              Control Tower
            </Link>
          </nav>

          {/* Right Actions: Theme Toggle + Open Control Tower CTA */}
          <div className="hidden sm:flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/control-tower"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-accent text-canvas hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all shadow-sm group"
            >
              <Radio className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Open Control Tower</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="p-2 rounded-lg border border-border bg-surface text-foreground-secondary hover:text-foreground hover:bg-surface-elevated focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-down Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-border bg-surface px-4 py-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150 shadow-theme-md">
          <nav className="space-y-1" aria-label="Mobile Navigation">
            <a
              href="#overview"
              onClick={closeMenu}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-surface-elevated"
            >
              Overview
            </a>
            <a
              href="#how-it-works"
              onClick={closeMenu}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-surface-elevated"
            >
              How It Works
            </a>
            <a
              href="#capabilities"
              onClick={closeMenu}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-surface-elevated"
            >
              Capabilities
            </a>
            <Link
              to="/control-tower"
              onClick={closeMenu}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-surface-elevated"
            >
              Control Tower
            </Link>
          </nav>

          <div className="border-t border-border pt-3">
            <Link
              to="/control-tower"
              onClick={closeMenu}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold bg-accent text-canvas hover:bg-accent/90 transition-colors shadow-sm"
            >
              <Radio className="w-4 h-4" />
              <span>Open Control Tower</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
