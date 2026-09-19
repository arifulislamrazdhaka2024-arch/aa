import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sliders,
  Package,
  History,
  LogOut,
  Download,
  Globe,
  Palette,
  ExternalLink,
  ShieldCheck,
  User as UserIcon,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { UserAccount, SystemConfig } from '../types';
import { THEME_PALETTES, DICTIONARY } from '../data/initialData';

interface NavbarProps {
  currentUser: UserAccount;
  config: SystemConfig;
  activeTab: 'new-invoice' | 'invoices-list' | 'inventory' | 'master-control';
  setActiveTab: (tab: 'new-invoice' | 'invoices-list' | 'inventory' | 'master-control') => void;
  onThemeSelect: (themeId: string) => void;
  onLanguageToggle: () => void;
  onLogout: () => void;
  onOpenQuickInvoice?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  config,
  activeTab,
  setActiveTab,
  onThemeSelect,
  onLanguageToggle,
  onLogout,
}) => {
  const isCeo = currentUser.role === 'CEO';
  const lang = config.language;
  const t = DICTIONARY[lang];

  // PWA install prompt handler
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        lang === 'bn'
          ? 'ওয়েব অ্যাপটি ইনস্টল করতে আপনার ব্রাউজারের মেন্যু থেকে "Install App" অথবা "Add to Home screen" নির্বাচন করুন।'
          : 'To install Intelligent Technician as a standalone app, open your browser menu (⋮) and tap "Install App" or "Add to Home Screen".'
      );
    }
  };

  const currentTheme = THEME_PALETTES.find(t => t.id === config.activeThemeId) || THEME_PALETTES[0];

  return (
    <header className="no-print bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Top Branding Link */}
          <div className="flex items-center gap-3">
            {config.invoiceSettings?.brandingLogos?.headerLogoUrl || config.loginUI.logoUrl ? (
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 p-1 flex items-center justify-center overflow-hidden shadow-md transition-transform hover:scale-105">
                <img
                  src={config.invoiceSettings?.brandingLogos?.headerLogoUrl || config.loginUI.logoUrl}
                  alt="Logo"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-md text-base transition-transform hover:scale-105"
                style={{ backgroundColor: currentTheme.primary }}
              >
                IT
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight hidden sm:inline">
                  {config.contacts.companyName || 'Intelligent Technician'}
                </span>
                <span className="font-extrabold text-white text-base tracking-tight sm:hidden">
                  IntelTech
                </span>
                {isCeo && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    CEO MASTER
                  </span>
                )}
              </div>
              <a
                href={config.contacts.websiteUrl || 'https://intelligenttechnician.bd'}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1"
              >
                <span>{config.contacts.websiteUrl ? config.contacts.websiteUrl.replace(/^https?:\/\//, '') : 'intelligenttechnician.bd'}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          {/* Main Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('new-invoice')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'new-invoice'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{t.newInvoice}</span>
            </button>

            <button
              onClick={() => setActiveTab('invoices-list')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'invoices-list'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>{t.salesLogs}</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>{t.inventory}</span>
            </button>

            {/* CEO MASTER CONTROL BUTTON (Strictly for CEO) */}
            {isCeo && (
              <button
                onClick={() => setActiveTab('master-control')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'master-control'
                    ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-md shadow-amber-600/30'
                    : 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>{t.masterControl}</span>
              </button>
            )}
          </nav>

          {/* Right Action Tools: PWA, Theme, Bilingual, User */}
          <div className="flex items-center gap-2">
            {/* Download App (PWA) Button */}
            <button
              type="button"
              onClick={handleInstallClick}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
              title="Install Intelligent Technician PWA on desktop/mobile"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>{t.downloadApp}</span>
            </button>

            {/* Quick Theme Selector Dropdown */}
            {isCeo && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowThemeMenu(!showThemeMenu)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                  title="Quick Theme Selector"
                >
                  <Palette className="w-4 h-4" style={{ color: currentTheme.accent }} />
                </button>

                {showThemeMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50">
                    <div className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
                      <span>100+ Theme Palettes</span>
                      <button
                        onClick={() => {
                          setActiveTab('master-control');
                          setShowThemeMenu(false);
                        }}
                        className="text-[10px] text-blue-400 hover:underline"
                      >
                        All Themes
                      </button>
                    </div>
                    <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
                      {THEME_PALETTES.slice(0, 30).map(palette => (
                        <button
                          key={palette.id}
                          onClick={() => {
                            onThemeSelect(palette.id);
                            setShowThemeMenu(false);
                          }}
                          className={`w-9 h-9 rounded-xl border-2 transition-transform hover:scale-110 flex items-center justify-center ${
                            palette.id === config.activeThemeId ? 'border-white scale-105' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: palette.primary }}
                          title={palette.name}
                        >
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.accent }} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bilingual Switcher */}
            <button
              onClick={onLanguageToggle}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>{t.bilingualToggle}</span>
            </button>

            {/* Current User Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-white truncate max-w-[130px]">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                  {isCeo ? (
                    <span className="text-amber-400 font-bold">CEO</span>
                  ) : (
                    <span className="text-indigo-400 font-semibold">Technician</span>
                  )}
                </p>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/50 transition-colors"
                title={t.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800/80 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('new-invoice')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
              activeTab === 'new-invoice' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t.newInvoice}</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices-list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
              activeTab === 'invoices-list' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{t.salesLogs}</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
              activeTab === 'inventory' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>{t.inventory}</span>
          </button>

          {isCeo && (
            <button
              onClick={() => setActiveTab('master-control')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                activeTab === 'master-control' ? 'bg-amber-600 text-white' : 'text-amber-400'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{t.masterControl}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
