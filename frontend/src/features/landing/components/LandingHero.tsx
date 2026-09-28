import { Link } from 'react-router-dom';
import { ArrowRight, Radio, Compass, ShieldCheck } from 'lucide-react';

export function LandingHero() {
  return (
    <section id="overview" className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Background Subtle Polar Gradient */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] pointer-events-none opacity-30 dark:opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--color-primary)_0%,_transparent_70%)]"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-foreground-secondary text-xs font-medium tracking-wide">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-accent font-semibold">
                Antarctic Operations Platform
              </span>
            </div>

            <div className="space-y-4">
              <div className="text-sm font-mono uppercase tracking-widest text-foreground-muted">
                CRYOS
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] font-sans">
                See the mission.<br />
                Understand the impact.<br />
                <span className="bg-gradient-to-r from-foreground via-foreground to-accent bg-clip-text text-transparent">
                  Act with confidence.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-foreground-secondary leading-relaxed max-w-xl font-normal">
                CRYOS connects expedition logistics, station operations, assets,
                constraints and decision support into one operational view.
              </p>
            </div>

            {/* Real Functional CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                to="/control-tower"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-sm font-semibold bg-accent text-canvas hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all shadow-theme-sm group"
              >
                <Radio className="w-4 h-4" aria-hidden="true" />
                <span>Open Control Tower</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg text-sm font-semibold border border-border bg-surface text-foreground hover:bg-surface-elevated hover:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all shadow-theme-sm"
              >
                <span>Explore how it works ↓</span>
              </a>
            </div>

            {/* Principles Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-foreground-muted">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-status-success" aria-hidden="true" />
                <span>Deterministic Constraint Engine</span>
              </div>
              <span className="text-border">•</span>
              <div className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-accent" aria-hidden="true" />
                <span>Human-Approved Action</span>
              </div>
            </div>
          </div>

          {/* Right Column: ONE Strong Antarctic Visual */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Outer Shell */}
              <div className="relative rounded-2xl overflow-hidden border border-border bg-surface shadow-theme-md">
                {/* Hero Image Container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                  <img
                    src="/antarctic-hero.jpg"
                    alt="Antarctic research station on snow shelf with tracked vehicles and communications equipment"
                    className="w-full h-full object-cover object-center scale-[1.01] hover:scale-[1.03] transition-transform duration-700 ease-out"
                    loading="eager"
                  />

                  {/* Gradient overlays for light/dark contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-transparent to-slate-950/40 pointer-events-none" />

                  {/* Top Bar Label inside Image */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-200">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/70 backdrop-blur-md border border-white/10 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      <span>BHARATI & MAITRI SECTOR</span>
                    </div>
                    <div className="text-[10px] tracking-wider uppercase font-mono px-2 py-0.5 rounded bg-slate-950/70 backdrop-blur-md text-slate-300 border border-white/10">
                      ILLUSTRATIVE POLAR OPERATIONS VIEW
                    </div>
                  </div>

                  {/* Bottom Image Overlay: Restrained Telemetry Caption */}
                  <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/10 text-white">
                    <div className="flex items-center justify-between text-xs pb-1.5 border-b border-white/10">
                      <span className="font-semibold tracking-wide text-slate-100 font-mono">
                        POLAR COORDINATES: 69°24′S 76°11′E
                      </span>
                      <span className="font-mono text-[11px] text-cyan-300">
                        SCHEMATIC
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1.5 text-slate-300 font-mono">
                      <span>Maritime & Air Corridors</span>
                      <span className="text-emerald-400">Status: Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
