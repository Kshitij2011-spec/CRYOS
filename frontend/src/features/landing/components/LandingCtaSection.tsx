import { Link } from 'react-router-dom';
import { Radio, ArrowRight, Package } from 'lucide-react';

export function LandingCtaSection() {
  return (
    <section className="py-20 lg:py-28 bg-canvas relative overflow-hidden">
      {/* Subtle polar beacon background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] pointer-events-none opacity-25 dark:opacity-15 bg-[radial-gradient(circle,_var(--color-primary)_0%,_transparent_70%)]"
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15] mb-5">
          Ready to enter CRYOS?
        </h2>

        <p className="text-base sm:text-lg text-foreground-secondary max-w-xl mx-auto leading-relaxed mb-8">
          Explore the operational environment and follow expedition activity from overview to decision.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/control-tower"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg text-sm font-semibold bg-accent text-canvas hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all shadow-theme-md group"
          >
            <Radio className="w-4 h-4" />
            <span>Open Control Tower</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/cargo"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-lg text-sm font-semibold border border-border bg-surface text-foreground hover:bg-surface-elevated hover:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all shadow-theme-sm"
          >
            <Package className="w-4 h-4 text-foreground-muted" />
            <span>Explore Logistics</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-8 text-xs text-foreground-muted">
          Preloaded with synthetic benchmark scenarios &bull; Deterministic constraint solver active
        </div>
      </div>
    </section>
  );
}
