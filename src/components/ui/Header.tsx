/**
 * Header Component
 * Feature: 008-i18n-support / US1
 *
 * Application header with language switcher
 */

'use client';

import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '@/hooks/useLanguage';
import Link from 'next/link';

/**
 * Header Component
 *
 * Renders application header with language switcher
 */
export function Header() {
    const { t } = useLanguage();
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <div className="text-lg font-semibold text-gray-900">ウソホントゲーム</div>
        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-2"
          >
            <Link
              href="/games"
              className="inline-flex items-center rounded px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              {t('navigation.managerTop')}
            </Link>
            <Link
              href="/"
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              {t('navigation.playerTop')}
            </Link>
          </nav>
          <LanguageSwitcher />

        </div>
      </div>
    </header>
  );
}
