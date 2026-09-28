import {
  CalendarRange, Package, Wrench, ShieldAlert, MapPin, CheckSquare,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function CapabilitiesSection() {
  const capabilities = [
    {
      title: 'Expedition Logistics',
      desc: 'Coordinate scientific mission windows, operational constraints, and multi-station readiness.',
      icon: CalendarRange,
      link: '/control-tower',
      cta: 'Open Control Tower',
    },
    {
      title: 'Cargo & Transport',
      desc: 'Track multi-modal cargo consignments, air and maritime transit legs, and supply manifests.',
      icon: Package,
      link: '/cargo',
      cta: 'Explore Cargo',
    },
    {
      title: 'Assets & Equipment',
      desc: 'Monitor station generators, life support equipment, inventory runways, and maintenance state.',
      icon: Wrench,
      link: '/assets',
      cta: 'View Assets',
    },
    {
      title: 'Incident Response',
      desc: 'Capture operational disruptions, evaluate severity, and coordinate mitigation workflows.',
      icon: ShieldAlert,
      link: '/incidents',
      cta: 'Review Incidents',
    },
    {
      title: 'Station Locations',
      desc: 'Inspect Antarctic station hierarchies, geographic waypoints, and logistical supply hubs.',
      icon: MapPin,
      link: '/locations',
      cta: 'Inspect Locations',
    },
    {
      title: 'Decision Support',
      desc: 'Review deterministic replan recommendations and record mandatory human approvals.',
      icon: CheckSquare,
      link: '/control-tower',
      cta: 'View Decision Queue',
    },
  ];

  return (
    <section id="capabilities" className="py-20 lg:py-28 bg-canvas border-b border-border relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold block mb-2">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            Engineered for extreme expedition logistics.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-foreground-secondary leading-relaxed">
            Six functional operational modules mapped directly into the CRYOS application architecture.
          </p>
        </div>

        {/* 6 Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <Link
                key={cap.title}
                to={cap.link}
                className="group relative p-6 rounded-xl bg-surface border border-border transition-all duration-200 hover:-translate-y-1 hover:border-accent/50 hover:shadow-theme-md flex flex-col justify-between overflow-hidden"
              >
                {/* Subtle top accent line on hover */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />

                <div>
                  <div className="w-10 h-10 rounded-lg bg-surface-elevated border border-border text-accent flex items-center justify-center mb-4 group-hover:bg-accent/10 transition-colors">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>

                  <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                    {cap.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
                    {cap.desc}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-accent">
                  <span>{cap.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
