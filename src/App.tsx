import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import TracksPage from './pages/TracksPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import InfoPage from './pages/InfoPage';
import PricesPage from './pages/PricesPage';
import BannedPage from './pages/BannedPage';
import AddressesPage from './pages/AddressesPage';
import AdminPage from './pages/AdminPage';
import AdminImportPage from './pages/AdminImportPage';
import AdminBatchUpdatePage from './pages/AdminBatchUpdatePage';
import AIChatPage from './pages/AIChatPage';

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tracks" element={<TracksPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/info" element={<InfoPage />} />
        <Route path="/info/prices" element={<PricesPage />} />
        <Route path="/info/banned" element={<BannedPage />} />
        <Route path="/info/addresses" element={<AddressesPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/import" element={<AdminImportPage />} />
        <Route path="/admin/batch-update" element={<AdminBatchUpdatePage />} />
        <Route path="/ai-chat" element={<AIChatPage />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
