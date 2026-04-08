'use client';

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, User, Settings } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Главная', href: '/' },
  { icon: Package, label: 'Треки', href: '/tracks' },
  { icon: User, label: 'Профиль', href: '/profile' },
];

export function BottomNav() {
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
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            to="/admin"
            className="flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:text-primary"
          >
            <Settings className="h-6 w-6" />
            <span className="text-xs">Админ</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
