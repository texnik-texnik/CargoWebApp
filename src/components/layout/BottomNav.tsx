'use client';

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, User, Settings } from 'lucide-react';
import { useAppLanguage } from '../../hooks/useLanguage';

export function BottomNav() {
  const { t } = useAppLanguage();
  const location = useLocation();
  const pathname = location.pathname;
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      console.log('BottomNav user:', user);
      console.log('is_admin:', user.is_admin, 'role:', user.role);
      setIsAdmin(user.is_admin === true || user.role === 'admin');
    }
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className={`grid h-16 ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'}`}>
        <Link to="/" className={`flex flex-col items-center justify-center gap-1 transition-colors ${pathname === '/' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
          <Home className="h-6 w-6" />
          <span className="text-xs">{t.home}</span>
        </Link>
        <Link to="/tracks" className={`flex flex-col items-center justify-center gap-1 transition-colors ${pathname === '/tracks' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
          <Package className="h-6 w-6" />
          <span className="text-xs">{t.tracks}</span>
        </Link>
        <Link to="/profile" className={`flex flex-col items-center justify-center gap-1 transition-colors ${pathname === '/profile' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
          <User className="h-6 w-6" />
          <span className="text-xs">{t.profile}</span>
        </Link>
        {isAdmin && (
          <Link to="/admin" className="flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:text-primary">
            <Settings className="h-6 w-6" />
            <span className="text-xs">{t.admin}</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
