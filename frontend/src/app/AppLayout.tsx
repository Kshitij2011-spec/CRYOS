import { useState, useEffect, useCallback } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  MapPin, Package, Truck, Activity, Boxes, Wrench,
  AlertOctagon, Radio, Menu, X, ChevronRight,
  PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { OfflineSyncIndicator } from '../features/control-tower/components/OfflineSyncIndicator';
import { OfflineSyncDrawer } from '../features/control-tower/components/OfflineSyncDrawer';
import { useVisitorSession } from '../lib/hooks/useVisitorSession';
import { ThemeToggle } from '../lib/theme/ThemeToggle';

// ─── Navigation config ────────────────────────────────────────────────────────

const COMMAND_NAV_ITEMS = [
  { to: '/control-tower', label: 'Control Tower', Icon: Radio },
];

const LOGISTICS_NAV_ITEMS = [
  { to: '/locations', label: 'Locations',  Icon: MapPin  },
  { to: '/cargo',     label: 'Cargo',      Icon: Package },
  { to: '/transport', label: 'Transport',  Icon: Truck   },
];

const OPERATIONS_NAV_ITEMS = [
  { to: '/inventory', label: 'Inventory',            Icon: Boxes        },
  { to: '/assets',    label: 'Assets & Maintenance', Icon: Wrench       },
  { to: '/incidents', label: 'Incident Response',    Icon: AlertOctagon },
];

// ─── Page title lookup ────────────────────────────────────────────────────────

const PAGE_TITLES: Record<string, { section: string; title: string }> = {
  '/control-tower': { section: 'Operations', title: 'Control Tower' },
  '/locations':     { section: 'Logistics',  title: 'Locations'           },
  '/cargo':         { section: 'Logistics',  title: 'Cargo'               },
  '/transport':     { section: 'Logistics',  title: 'Transport'           },
  '/inventory':     { section: 'Operations', title: 'Inventory'           },
  '/assets':        { section: 'Operations', title: 'Assets & Maintenance'},
  '/incidents':     { section: 'Operations', title: 'Incident Response'   },
};

// ─── Quick Jump Select (Requirement 31) ──────────────────────────────────────

function QuickJumpSelect() {
  const handleJump = (id: string) => {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <label htmlFor="quick-jump-nav" className="sr-only">Jump to page section</label>
      <select
        id="quick-jump-nav"
        aria-label="Jump to section"
        defaultValue=""
        onChange={(e) => {
          handleJump(e.target.value);
          e.target.value = '';
        }}
        className="h-8 text-xs bg-surface border border-[var(--border-color)] text-foreground-secondary hover:text-foreground rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-accent font-medium cursor-pointer transition-colors"
      >
        <option value="" disabled>Jump to ▾</option>
        <option value="overview">Overview</option>
        <option value="attention">Attention</option>
        <option value="routes">Routes</option>
        <option value="missions">Missions</option>
        <option value="constraints">Constraints</option>
        <option value="decisions">Decisions</option>
        <option value="activity">Activity</option>
      </select>
    </div>
  );
}

// ─── NavItem type ─────────────────────────────────────────────────────────────

interface NavItem {
  to: string;
  label: string;
  Icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
}

// ─── NavSection ───────────────────────────────────────────────────────────────

function NavSection({
  label,
  items,
  onNavigate,
  isCollapsed = false,
}: {
  label: string;
  items: NavItem[];
  onNavigate?: () => void;
  isCollapsed?: boolean;
}) {
  return (
    <div>
      {!isCollapsed ? (
        <p className="px-3 mb-1.5 text-[10px] font-medium text-foreground-muted uppercase tracking-[0.07em] select-none">
          {label}
        </p>
      ) : (
        <div className="my-2 border-t border-[var(--border-color)]/60 mx-2" aria-hidden="true" />
      )}
      <div className="space-y-0.5">
        {items.map(({ to, label: itemLabel, Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            title={isCollapsed ? itemLabel : undefined}
            aria-label={isCollapsed ? itemLabel : undefined}
            className={({ isActive }) =>
              `nav-active-bar flex items-center rounded-lg text-sm font-medium transition-all ${
                isCollapsed
                  ? 'justify-center w-10 h-10 mx-auto'
                  : 'gap-3 px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-accent/10 text-accent border border-accent/25 dark:bg-accent/10 dark:text-accent dark:border-accent/20'
                  : 'text-foreground-secondary hover:text-foreground hover:bg-surface-elevated'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-4 h-4 shrink-0 ${isActive ? 'text-accent' : 'text-foreground-muted'}`}
                  aria-hidden="true"
                />
                {!isCollapsed && (
                  <>
                    <span className="truncate">{itemLabel}</span>
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 ml-auto text-accent/50" aria-hidden="true" />
                    )}
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

// ─── Sidebar content ─────────────────────────────────────────────────────────

function SidebarContent({
  onNavigate,
  isCollapsed = false,
  onToggleCollapse,
}: {
  onNavigate?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Top Header with Logo and Top Collapse/Expand Button (Requirements 32-36) */}
      <div
        className={`border-b border-[var(--border-color)] shrink-0 transition-all ${
          isCollapsed
            ? 'py-3 px-2 flex flex-col items-center gap-2'
            : 'py-3 px-4 flex items-center justify-between gap-2'
        }`}
      >
        <Link
          to="/"
          onClick={onNavigate}
          aria-label="Go to CRYOS home"
          title="Go to CRYOS home"
          className="flex items-center gap-2.5 group rounded-lg p-1 hover:bg-surface-elevated transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent min-w-0"
        >
          <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center shrink-0 group-hover:bg-accent/25 transition-colors">
            <Activity className="w-4 h-4 text-accent" aria-hidden="true" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="font-bold text-foreground tracking-tight leading-none text-sm group-hover:text-accent transition-colors">
                CRYOS
              </div>
              <div className="text-[9px] font-medium text-foreground-muted uppercase tracking-[0.07em] mt-1 leading-none truncate">
                Polar Expedition Logistics
              </div>
            </div>
          )}
        </Link>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 rounded-lg border border-[var(--border-color)] bg-surface text-foreground-secondary hover:text-foreground hover:bg-surface-elevated transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent shrink-0"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav
        className={`flex-1 ${isCollapsed ? 'px-1.5' : 'px-3'} py-4 space-y-4 overflow-y-auto`}
        aria-label="Main navigation"
      >
        <NavSection label="Command"    items={COMMAND_NAV_ITEMS}    onNavigate={onNavigate} isCollapsed={isCollapsed} />
        <NavSection label="Logistics"  items={LOGISTICS_NAV_ITEMS}  onNavigate={onNavigate} isCollapsed={isCollapsed} />
        <NavSection label="Operations" items={OPERATIONS_NAV_ITEMS} onNavigate={onNavigate} isCollapsed={isCollapsed} />
      </nav>

      {/* Footer with data provenance indicator (Collapse button moved to top per Requirement 32) */}
      <div className={`p-3 border-t border-[var(--border-color)] flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed ? (
          <div className="text-[10px] text-foreground-muted leading-relaxed">
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-status-success inline-block" />
              <span>Data: [SYNTHETIC/DEMO]</span>
            </span>
          </div>
        ) : (
          <div title="Data: [SYNTHETIC/DEMO]" className="w-2 h-2 rounded-full bg-status-success mx-auto" />
        )}
      </div>
    </div>
  );
}

// ─── AppLayout ────────────────────────────────────────────────────────────────

interface Props {
  children: React.ReactNode;
}

export function AppLayout({ children }: Props) {
  const [isSyncDrawerOpen, setIsSyncDrawerOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Persistent sidebar collapse state (Requirement 14)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cryos-sidebar-collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('cryos-sidebar-collapsed', String(next));
      } catch {}
      return next;
    });
  }, []);

  const location = useLocation();
  useVisitorSession();

  // Close mobile nav on route change
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  // Close mobile nav on ESC
  useEffect(() => {
    if (!isMobileNavOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileNavOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isMobileNavOpen]);

  // Prevent body scroll when mobile nav is open
  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileNavOpen]);

  const pageInfo = PAGE_TITLES[location.pathname] ?? { section: 'CRYOS', title: 'Platform' };
  const closeMobileNav = useCallback(() => setIsMobileNavOpen(false), []);

  return (
    <div className="flex h-screen overflow-hidden bg-canvas text-foreground">

      {/* ── Desktop Sidebar (≥768px) with Collapsible width ────────────── */}
      <aside
        className={`hidden md:flex ${
          isCollapsed ? 'w-[72px]' : 'w-[240px]'
        } shrink-0 border-r border-[var(--border-color)] bg-surface flex-col transition-all duration-200`}
        aria-label="Main navigation"
      >
        <SidebarContent
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleSidebar}
        />
      </aside>

      {/* ── Mobile Nav Overlay ──────────────────────────────────────────── */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          aria-hidden="true"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeMobileNav}
          />

          {/* Drawer */}
          <aside
            className="absolute left-0 top-0 bottom-0 w-[260px] bg-surface border-r border-[var(--border-color)] shadow-theme-md flex flex-col z-50"
            aria-label="Mobile navigation"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)]">
              <Link
                to="/"
                onClick={closeMobileNav}
                className="text-sm font-bold text-foreground tracking-tight hover:text-accent transition-colors"
              >
                CRYOS
              </Link>
              <button
                type="button"
                onClick={closeMobileNav}
                aria-label="Close navigation"
                className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent onNavigate={closeMobileNav} isCollapsed={false} />
            </div>
          </aside>
        </div>
      )}

      {/* ── Main Area ───────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto bg-canvas flex flex-col min-w-0">

        {/* Top bar (Requirement 17: Compact, Operations / Control Tower, Sync + Theme) */}
        <header className="sticky top-0 z-30 h-12 px-4 border-b border-[var(--border-color)] bg-surface/90 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">

          {/* Left: hamburger (mobile) + breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Open navigation menu"
              className="md:hidden p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-elevated transition-colors shrink-0"
            >
              <Menu className="w-4 h-4" aria-hidden="true" />
            </button>

            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm min-w-0">
              <span className="text-foreground-muted hidden sm:block truncate">
                {pageInfo.section}
              </span>
              <span className="text-foreground-muted hidden sm:block opacity-40">/</span>
              <span className="text-foreground font-semibold truncate">
                {pageInfo.title}
              </span>
            </nav>
          </div>

          {/* Right: Quick Jump + sync indicator + theme toggle (Requirement 30 & 31) */}
          <div className="flex items-center gap-2 shrink-0">
            {location.pathname === '/control-tower' && (
              <QuickJumpSelect />
            )}
            <div className="hidden lg:block">
              <OfflineSyncIndicator onOpenDrawer={() => setIsSyncDrawerOpen(true)} showToggle={false} />
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto">
          <div className="px-4 sm:px-6 py-6 max-w-screen-2xl mx-auto">
            {children}
          </div>
        </div>

        {/* Platform-wide Offline Sync Drawer */}
        <OfflineSyncDrawer
          isOpen={isSyncDrawerOpen}
          onClose={() => setIsSyncDrawerOpen(false)}
        />
      </main>
    </div>
  );
}
