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
import AdminDatabasePage from './pages/AdminDatabasePage';
import AdminArchivePage from './pages/AdminArchivePage';
import AdminPricesPage from './pages/AdminPricesPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminBroadcastPage from './pages/AdminBroadcastPage';
import AIChatPage from './pages/AIChatPage';
import TermsPage from './pages/TermsPage';
import AdminRoute from './components/admin/AdminRoute';

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tracks" element={<TracksPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<AdminRoute><DashboardPage /></AdminRoute>} />
        <Route path="/info" element={<InfoPage />} />
        <Route path="/info/prices" element={<PricesPage />} />
        <Route path="/info/banned" element={<BannedPage />} />
        <Route path="/info/addresses" element={<AddressesPage />} />
        <Route path="/info/terms" element={<TermsPage />} />
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/admin/import" element={<AdminRoute><AdminImportPage /></AdminRoute>} />
        <Route path="/admin/batch-update" element={<AdminRoute><AdminBatchUpdatePage /></AdminRoute>} />
        <Route path="/admin/database" element={<AdminRoute><AdminDatabasePage /></AdminRoute>} />
        <Route path="/admin/archive" element={<AdminRoute><AdminArchivePage /></AdminRoute>} />
        <Route path="/admin/prices" element={<AdminRoute><AdminPricesPage /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
        <Route path="/admin/broadcast" element={<AdminRoute><AdminBroadcastPage /></AdminRoute>} />
        <Route path="/ai-chat" element={<AIChatPage />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
