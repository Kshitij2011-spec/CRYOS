import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export function LandingFooter() {
  const operationalRoutes = [
    { to: '/control-tower', label: 'Control Tower' },
    { to: '/locations', label: 'Locations' },
    { to: '/cargo', label: 'Cargo' },
    { to: '/transport', label: 'Transport' },
    { to: '/inventory', label: 'Inventory' },
    { to: '/assets', label: 'Assets' },
    { to: '/incidents', label: 'Incidents' },
  ];

  const sectionLinks = [
    { href: '#overview', label: 'Overview' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#capabilities', label: 'Capabilities' },
    { href: '#preview', label: 'Product Preview' },
  ];

  return (
    <footer className="border-t border-border bg-surface/80 py-12 text-foreground-secondary transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-border/70">
          {/* Brand & Mandate */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
                <Compass className="w-4 h-4" />
              </div>
              <span className="font-bold text-base tracking-wider text-foreground">
                CRYOS
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-surface-elevated border border-border text-foreground-muted">
                Antarctic Operations
              </span>
            </div>
            <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed max-w-md">
              Integrated Polar Expedition Logistics and Asset Management Platform.
              An operational digital twin connecting stations, supply corridors, assets, and human-approved replanning.
            </p>
            <div className="text-[11px] font-mono text-foreground-muted">
              Built by Team HexaCoders • Smart India Hackathon SIH26062
            </div>
          </div>

          {/* Operational Modules (Only Real Routes) */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-foreground font-semibold mb-3">
              Operational Modules
            </h3>
            <ul className="space-y-2 text-xs">
              {operationalRoutes.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="hover:text-accent transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Page Sections (Only Real Anchors) */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-foreground font-semibold mb-3">
              Navigation
            </h3>
            <ul className="space-y-2 text-xs">
              {sectionLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="hover:text-accent transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Data Honesty Disclaimer & Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-foreground-muted">
          <div>
            &copy; {new Date().getFullYear()} CRYOS Platform. Polar expedition operational state management.
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-warning" />
            <span className="font-mono text-[11px]">
              DATA PROVENANCE: SYNTHETIC / BENCHMARK SCENARIOS
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
