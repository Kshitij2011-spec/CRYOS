import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { LandingPage } from '../features/landing/LandingPage';
import { ControlTowerPage } from '../features/control-tower/ControlTowerPage';
import { LocationsPage } from '../features/locations/LocationsPage';
import { CargoPage } from '../features/cargo/CargoPage';
import { TransportPage } from '../features/transport/TransportPage';
import { InventoryPage } from '../features/inventory/InventoryPage';
import { AssetsPage } from '../features/assets/AssetsPage';
import { IncidentsPage } from '../features/incidents/IncidentsPage';

export default function App() {
  return (
    <Routes>
      {/* ── Public Product Landing Page ────────────────────────────────────── */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing" element={<LandingPage />} />

      {/* ── Operational Platform Modules (wrapped in AppLayout) ─────────────── */}
      <Route
        path="/control-tower"
        element={
          <AppLayout>
            <ControlTowerPage />
          </AppLayout>
        }
      />
      <Route
        path="/locations"
        element={
          <AppLayout>
            <LocationsPage />
          </AppLayout>
        }
      />
      <Route
        path="/cargo"
        element={
          <AppLayout>
            <CargoPage />
          </AppLayout>
        }
      />
      <Route
        path="/transport"
        element={
          <AppLayout>
            <TransportPage />
          </AppLayout>
        }
      />
      <Route
        path="/inventory"
        element={
          <AppLayout>
            <InventoryPage />
          </AppLayout>
        }
      />
      <Route
        path="/assets"
        element={
          <AppLayout>
            <AssetsPage />
          </AppLayout>
        }
      />
      <Route
        path="/incidents"
        element={
          <AppLayout>
            <IncidentsPage />
          </AppLayout>
        }
      />

      {/* ── Fallback ───────────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
