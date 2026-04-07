'use client';

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export function Header() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Проверяем есть ли сохранённый пользователь
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      setUser(tg.initDataUnsafe.user);
    }
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6" />
            <h1 className="text-lg font-bold">Khuroson Cargo</h1>
          </div>
          {user ? (
            <Link to="/profile">
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar className="h-8 w-8 border-2 border-white/20">
                  <AvatarImage src={user.photo_url} alt={user.name || user.first_name} />
                  <AvatarFallback className="bg-white/20 text-sm">
                    {(user.name || user.first_name || '?').charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Badge variant="secondary" className="text-xs">
                  {user.client_id || user.first_name || 'Войти'}
                </Badge>
              </div>
            </Link>
          ) : (
            <Link to="/auth">
              <Button variant="secondary" size="sm">
                <User className="mr-2 h-4 w-4" />
                Войти
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
