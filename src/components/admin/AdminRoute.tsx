import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase/client';

interface AdminRouteProps {
  children: React.ReactNode;
}

// Список телефонов администраторов
const ADMIN_PHONES = [
  '+992900017456',
];

export default function AdminRoute({ children }: AdminRouteProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  async function checkAdminAccess() {
    try {
      const savedUser = localStorage.getItem('user');
      if (!savedUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const parsed = JSON.parse(savedUser);
      const phone = parsed.phone;

      // Проверяем телефон в списке админов
      if (ADMIN_PHONES.includes(phone)) {
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      // Проверяем роль в базе данных
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('phone', phone)
        .single();

      if (error || !data || data.role !== 'admin') {
        setIsAdmin(false);
      } else {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      setIsAdmin(false);
    }
    finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Проверка доступа...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
