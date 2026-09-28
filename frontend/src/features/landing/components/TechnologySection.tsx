import { Code, Database, Server, Layers, Cpu, Compass } from 'lucide-react';

export function TechnologySection() {
  const stack = [
    {
      category: 'Frontend Core',
      tech: 'React 19 + TypeScript',
      desc: 'Type-safe component architecture with strict functional contracts.',
      icon: Code,
    },
    {
      category: 'UI & Styling',
      tech: 'Tailwind CSS + Lucide',
      desc: 'High-contrast polar design system with light/dark persistence.',
      icon: Layers,
    },
    {
      category: 'Data Management',
      tech: 'TanStack Query (React Query)',
      desc: 'Server-state caching, background revalidation & optimistic updates.',
      icon: Compass,
    },
    {
      category: 'Backend Engine',
      tech: 'FastAPI + Python 3.13',
      desc: 'Asynchronous API endpoints with strict Pydantic v2 schemas.',
      icon: Server,
    },
    {
      category: 'Database Foundation',
      tech: 'PostgreSQL + Supabase',
      desc: 'Relational data model with immutable audit events & PostGIS spatial topology.',
      icon: Database,
    },
    {
      category: 'Local Resilience',
      tech: 'IndexedDB Store & Forward',
      desc: 'Local outbox queuing and replay engine for degraded connectivity.',
      icon: Cpu,
    },
  ];

  return (
    <section id="technology" className="py-20 lg:py-28 bg-canvas relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold block mb-2">
            Engineering Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            Built on a robust, honest technology stack.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-foreground-secondary leading-relaxed">
            No heavy game engines or unnecessary distributed clusters. CRYOS utilizes a disciplined modular monolith
            optimized for deterministic computation and extreme field durability.
          </p>
        </div>

        {/* Tech Stack Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stack.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.category}
                className="p-6 rounded-xl bg-surface border border-border hover:border-accent/40 hover:shadow-theme-md transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-elevated border border-border flex items-center justify-center text-accent">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-foreground-muted">
                    {item.category}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-foreground mb-1">
                  {item.tech}
                </h3>
                <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
