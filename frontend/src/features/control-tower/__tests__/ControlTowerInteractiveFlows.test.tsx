import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppLayout } from '../../../app/AppLayout';
import { ControlTowerPage } from '../ControlTowerPage';
import { AntarcticRouteNetwork } from '../components/AntarcticRouteNetwork';
import { renderWithProviders } from '../../../test-utils';
import { apiClient } from '../../../lib/api/client';
import type { ControlTowerOverview } from '../../../lib/types/api';

vi.mock('../../../lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
  buildQuery: vi.fn((params) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
    }
    const str = q.toString();
    return str ? `?${str}` : '';
  }),
}));

const mockOverview: ControlTowerOverview = {
  total_expeditions: 1,
  expeditions: [
    {
      expedition_id: 'exp-1',
      code: 'EXP-45',
      name: '45th Indian Antarctic Expedition',
      season: '2026-2027',
      lifecycle_status: 'ACTIVE',
      readiness_state: 'READY',
      total_missions: 1,
      ready_missions_count: 1,
      at_risk_missions_count: 0,
      blocked_missions_count: 0,
      active_incidents_count: 0,
      active_hard_constraint_violations_count: 0,
      pending_replans_count: 0,
      pending_approvals_count: 0,
      latest_events: [],
      blockers: [],
      warnings: [],
      unknown_requirements: [],
      data_provenance: 'DERIVED',
      generated_at: '2026-09-19T10:00:00Z',
    },
  ],
  total_missions: 1,
  missions_by_readiness: { READY: 1 },
  missions_by_status: { ACTIVE: 1 },
  active_incidents_count: 0,
  critical_constraints_violated_count: 0,
  pending_replans_count: 0,
  pending_recommendations_count: 0,
  pending_approvals_count: 0,
  offline_sync_summary: {},
  recent_operational_events: [],
  data_provenance: 'DERIVED',
  generated_at: '2026-09-19T10:00:00Z',
};

const mockEvents = [
  {
    event_id: 'ev-1',
    event_type: 'MissionApproved',
    entity_type: 'MISSION',
    entity_id: 'msn-1',
    previous_state: 'PROPOSED',
    new_state: 'APPROVED',
    occurred_at: '2026-09-19T09:30:00Z',
    source: 'API',
    actor_id: 'usr-ops',
    location_id: null,
    correlation_id: 'cor-99',
    evidence: { rationale: 'Nominal conditions' },
    data_provenance: 'DERIVED',
  },
  {
    event_id: 'ev-2',
    event_type: 'CargoConsignmentDispatched',
    entity_type: 'CARGO_CONSIGNMENT',
    entity_id: 'c-100',
    previous_state: 'STAGED',
    new_state: 'IN_TRANSIT',
    occurred_at: '2026-09-19T08:10:00Z',
    source: 'FIELD',
    actor_id: 'usr-field',
    location_id: 'CPT',
    correlation_id: 'cor-100',
    evidence: { temperature_deg_c: -22.4 },
    data_provenance: 'MEASURED',
  },
];

const mockDecisions = {
  expedition_id: 'exp-1',
  total_pending_replans: 0,
  total_pending_recommendations: 0,
  total_pending_approvals: 0,
  pending_approvals: [],
  pending_recommendations: [],
  pending_replans: [],
  data_provenance: 'DERIVED',
  generated_at: '2026-09-19T10:00:00Z',
};

describe('Control Tower Interactive Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    vi.mocked(apiClient.get).mockImplementation(async (path: string) => {
      if (path === '/control-tower/overview' || path === '/control-tower/overview/fast') return mockOverview;
      if (path === '/control-tower/expeditions/exp-1') return mockOverview.expeditions[0];
      if (path.startsWith('/control-tower/expeditions/exp-1/missions')) return [];
      if (path.startsWith('/control-tower/expeditions/exp-1/constraints')) return [];
      if (path.startsWith('/control-tower/expeditions/exp-1/events')) return mockEvents;
      if (path.startsWith('/control-tower/expeditions/exp-1/decisions')) return mockDecisions;
      if (path.startsWith('/control-tower/expeditions/exp-1/audit')) return [];
      if (path.startsWith('/locations')) return [];
      if (path.startsWith('/transport/legs')) return [];
      if (path.startsWith('/cargo/consignments')) return [];
      if (path.startsWith('/assets')) return [];
      return null;
    });
  });

  it('verifies sidebar collapsible behavior, localStorage persistence, and logo link to /', async () => {
    const user = userEvent.setup();

    const { rerender } = renderWithProviders(
      <AppLayout>
        <div>Content</div>
      </AppLayout>,
      { initialRoute: '/control-tower' },
    );

    // Initial state: expanded (~240px)
    const aside = screen.getByRole('navigation', { name: /main navigation/i }).closest('aside');
    expect(aside).toHaveClass('w-[240px]');
    expect(screen.getByText('Polar Expedition Logistics')).toBeInTheDocument();

    // Check CRYOS Logo link points to '/'
    const logoLinks = screen.getAllByRole('link', { name: /go to cryos home/i });
    expect(logoLinks[0]).toHaveAttribute('href', '/');

    // Click collapse toggle button (ChevronLeft)
    const collapseBtn = screen.getByRole('button', { name: /collapse sidebar/i });
    await user.click(collapseBtn);

    // After collapse: width is 72px and persisted in localStorage
    expect(aside).toHaveClass('w-[72px]');
    expect(localStorage.getItem('cryos-sidebar-collapsed')).toBe('true');

    // Re-render (simulating refresh with stored preference)
    rerender(
      <AppLayout>
        <div>Content</div>
      </AppLayout>,
    );
    expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeInTheDocument();

    // Expand back
    const expandBtn = screen.getByRole('button', { name: /expand sidebar/i });
    await user.click(expandBtn);
    expect(localStorage.getItem('cryos-sidebar-collapsed')).toBe('false');
  });

  it('verifies AntarcticRouteNetwork schematic projection, selection, and filters', async () => {
    const user = userEvent.setup();

    renderWithProviders(<AntarcticRouteNetwork legs={[]} />);

    // Header & honest provenance notice
    expect(screen.getByText('Antarctic Route Network')).toBeInTheDocument();
    expect(
      screen.getByText(/SCHEMATIC POLAR PROJECTION/i),
    ).toBeInTheDocument();

    // Nodes rendered on map and in route cards
    expect(screen.getAllByText('Bharati Station').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Maitri Station').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Cape Town').length).toBeGreaterThanOrEqual(1);

    // Click a route card in live movements list
    const karaAuroraCard = screen.getByText('MV Kara Aurora');
    await user.click(karaAuroraCard);

    // "Clear selection" button appears
    const clearBtn = await screen.findByRole('button', { name: /clear route selection/i });
    expect(clearBtn).toBeInTheDocument();

    // Click "Clear selection"
    await user.click(clearBtn);
    expect(screen.queryByRole('button', { name: /clear route selection/i })).not.toBeInTheDocument();

    // Test filters
    const routeSelect = screen.getByLabelText(/filter routes by activity/i);
    await user.selectOptions(routeSelect, 'ACTIVE');

    const modeSelect = screen.getByLabelText(/filter routes by mode/i);
    await user.selectOptions(modeSelect, 'VESSEL');

    // Reset button
    const resetBtn = screen.getByRole('button', { name: /reset route filters/i });
    await user.click(resetBtn);
    expect(routeSelect).toHaveValue('ALL');
  });

  it('verifies Activity Log compact preview, expand modal, search, filters, and ESC dismissal', async () => {
    const user = userEvent.setup();

    renderWithProviders(<ControlTowerPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Recent operational changes')).toBeInTheDocument();
      expect(screen.getByText('MissionApproved')).toBeInTheDocument();
    });

    // Default: compact card with preview
    const viewActivityBtn = screen.getByRole('button', { name: /view activity/i });
    expect(viewActivityBtn).toHaveAttribute('aria-expanded', 'false');

    // Expand activity dialog
    await user.click(viewActivityBtn);

    // Overlay dialog is open
    const dialog = screen.getByRole('dialog', { name: /activity & operational event log/i });
    expect(dialog).toBeInTheDocument();

    // Within dialog: filter controls
    const entityFilter = within(dialog).getByLabelText(/filter events by entity type/i);
    expect(entityFilter).toBeInTheDocument();

    const searchInput = within(dialog).getByPlaceholderText(/search event type/i);
    await user.type(searchInput, 'MissionApproved');

    // Test deep audit inspection accordion
    const detailsButtons = within(dialog).getAllByRole('button', { name: /show evidence & details/i });
    await user.click(detailsButtons[0]);
    expect(within(dialog).getByText(/correlation: cor-99/i)).toBeInTheDocument();

    // Press Escape key to close dialog
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /activity & operational event log/i })).not.toBeInTheDocument();
    });
  });

  it('verifies compact empty state when pending decisions count is zero', async () => {
    renderWithProviders(<ControlTowerPage />);

    await waitFor(() => {
      expect(screen.getByText('No pending approvals')).toBeInTheDocument();
      expect(screen.getByText('There are no operator approvals currently waiting for review.')).toBeInTheDocument();
    });
  });

  it('verifies Quick Jump dropdown and section anchors on Control Tower', async () => {
    window.history.pushState({}, '', '/control-tower');
    renderWithProviders(
      <AppLayout>
        <ControlTowerPage />
      </AppLayout>,
    );

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /jump to section/i })).toBeInTheDocument();
    });

    // Check that all real section anchors exist in the DOM
    expect(document.getElementById('overview')).toBeInTheDocument();
    expect(document.getElementById('attention')).toBeInTheDocument();
    expect(document.getElementById('routes')).toBeInTheDocument();
    expect(document.getElementById('missions')).toBeInTheDocument();
    expect(document.getElementById('constraints')).toBeInTheDocument();
    expect(document.getElementById('decisions')).toBeInTheDocument();
    expect(document.getElementById('activity')).toBeInTheDocument();
  });
});
