import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import App from '../App';
import { createTestQueryClient } from '../../test-utils';
import { apiClient } from '../../lib/api/client';

vi.mock('../../lib/api/client', () => ({
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

describe('App Routing Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.get).mockResolvedValue([]);
  });

  it('renders product Landing Page on root route /', async () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByRole('heading', { level: 1, name: /see the mission/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/CRYOS connects expedition logistics/i),
    ).toBeInTheDocument();
  });

  it('renders Control Tower page directly on /control-tower', async () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/control-tower']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Control Tower' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Operational command center & mission readiness posture'),
    ).toBeInTheDocument();
  });

  it('renders sidebar navigation with prominent Control Tower link on operational routes', async () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/control-tower']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const controlTowerNavLink = screen.getByRole('link', { name: /control tower/i });
    expect(controlTowerNavLink).toBeInTheDocument();
    expect(controlTowerNavLink).toHaveAttribute('href', '/control-tower');
    expect(screen.getByText('CRYOS')).toBeInTheDocument();
  });

  it('preserves existing Track B routes (e.g. /locations)', async () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/locations']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Locations' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Operational facilities, field depots, and logistics nodes'),
    ).toBeInTheDocument();
  });
});
