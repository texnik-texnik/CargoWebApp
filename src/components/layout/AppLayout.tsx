'use client';

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { Header } from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    // Проверяем, запущено ли в Telegram
    const tg = (window as any).Telegram?.WebApp;
    setIsTelegram(!!tg);
    
    if (tg) {
      tg.ready();
      tg.expand();
      
      // Применяем тему Telegram
      document.documentElement.style.setProperty(
        '--tg-theme-bg-color',
        tg.themeParams.bg_color || '#ffffff'
      );
    }
  }, []);

  // Скрываем навигацию на странице админа
  const hideNav = pathname?.startsWith('/admin');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-20 pt-16">
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
