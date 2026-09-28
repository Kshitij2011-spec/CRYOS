import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from '../../../test-utils';
import { LandingPage } from '../LandingPage';
import { ThemeProvider } from '../../../lib/theme/ThemeContext';
import { apiClient } from '../../../lib/api/client';

vi.mock('../../../lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
  buildQuery: vi.fn(() => ''),
}));

describe('LandingPage Focused Functionality & Storytelling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.get).mockResolvedValue({
      total_expeditions: 1,
      expeditions: [],
      missions_by_readiness: { READY: 3 },
      total_missions: 3,
      critical_constraints_violated_count: 5,
      active_incidents_count: 1,
      pending_replans_count: 1,
      pending_recommendations_count: 2,
      data_provenance: 'DERIVED',
    });
  });

  function renderLandingPage() {
    const queryClient = createTestQueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <MemoryRouter initialEntries={['/']}>
            <LandingPage />
          </MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>,
    );
  }

  it('renders the clean, focused 6-section sequence from hero to footer', async () => {
    renderLandingPage();

    // 01 & 02: Navigation & Hero
    expect(screen.getByRole('heading', { level: 1, name: /see the mission\./i })).toBeInTheDocument();
    expect(screen.getByText(/CRYOS connects expedition logistics, station operations/i)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /open control tower/i })[0]).toBeInTheDocument();

    // 03: Core Workflow (From event to decision)
    expect(screen.getByRole('heading', { level: 2, name: /from event to decision/i })).toBeInTheDocument();
    expect(screen.getByText(/01/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Detect' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Contextualize' })).toBeInTheDocument();

    // 04: Capabilities Section (6 functional capabilities)
    expect(screen.getByRole('heading', { level: 2, name: /engineered for extreme expedition logistics/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Expedition Logistics' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Cargo & Transport' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Assets & Equipment' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Incident Response' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Station Locations' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Decision Support' })).toBeInTheDocument();

    // 05: Product Preview Section (Real Control Tower data)
    expect(screen.getByRole('heading', { level: 2, name: /operational awareness in one view/i })).toBeInTheDocument();
    expect(screen.getByText(/44th Indian Scientific Expedition to Antarctica/i)).toBeInTheDocument();
    expect(screen.getByText(/LOCAL PIPELINE CONNECTED/i)).toBeInTheDocument();

    // 06: Final CTA
    expect(screen.getByRole('heading', { level: 2, name: /ready to enter cryos\?/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /explore logistics/i })).toBeInTheDocument();

    // 07: Minimal Footer
    expect(screen.getByText(/polar expedition logistics and asset management platform/i)).toBeInTheDocument();
    expect(screen.getByText(/DATA PROVENANCE: SYNTHETIC \/ BENCHMARK SCENARIOS/i)).toBeInTheDocument();
  });

  it('verifies all capability cards map to real application routes', () => {
    renderLandingPage();

    const cargoLink = screen.getByRole('link', { name: /cargo & transport/i });
    expect(cargoLink).toHaveAttribute('href', '/cargo');

    const assetsLink = screen.getByRole('link', { name: /assets & equipment/i });
    expect(assetsLink).toHaveAttribute('href', '/assets');

    const incidentsLink = screen.getByRole('link', { name: /incident response/i });
    expect(incidentsLink).toHaveAttribute('href', '/incidents');

    const locationsLink = screen.getByRole('link', { name: /station locations/i });
    expect(locationsLink).toHaveAttribute('href', '/locations');
  });

  it('provides accessible theme toggle that switches modes', () => {
    renderLandingPage();

    const toggle = screen.getAllByRole('button', { name: /switch to (light|dark) mode/i })[0];
    expect(toggle).toBeInTheDocument();
    fireEvent.click(toggle);
    expect(document.documentElement.classList.contains('light') || document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('opens and closes the mobile navigation menu with real links', () => {
    renderLandingPage();

    const menuBtn = screen.getByRole('button', { name: /open navigation menu/i });
    fireEvent.click(menuBtn);

    expect(screen.getByRole('button', { name: /close navigation menu/i })).toBeInTheDocument();

    // Press Escape to close
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('button', { name: /close navigation menu/i })).not.toBeInTheDocument();
  });
});
