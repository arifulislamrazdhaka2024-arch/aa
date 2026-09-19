import React, { useState } from 'react';
import { User, Lock, ArrowRight, ShieldCheck, Briefcase, Sparkles, Phone, Globe, Eye, EyeOff } from 'lucide-react';
import { UserAccount, SystemConfig, UserRole } from '../types';

interface LoginScreenProps {
  config: SystemConfig;
  users: UserAccount[];
  onLoginSuccess: (user: UserAccount) => void;
  onLanguageToggle: () => void;
  language: 'en' | 'bn';
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  config,
  users,
  onLoginSuccess,
  onLanguageToggle,
  language,
}) => {
  const { loginUI, contacts } = config;
  const [selectedRole, setSelectedRole] = useState<UserRole>(loginUI.defaultRole || 'CEO');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Background style classes
  const getBackgroundStyle = () => {
    switch (loginUI.backgroundStyle) {
      case 'glassmorphism':
        return 'bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950';
      case 'clean-corporate':
        return 'bg-slate-900';
      case 'cyber-mesh':
        return 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-slate-950 to-black';
      case 'dark-tech':
      default:
        return 'bg-[#0b1120] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const inputId = userId.trim().toLowerCase();
    const matchedUser = users.find(u => u.userId.toLowerCase() === inputId);

    if (!matchedUser) {
      setError(
        language === 'bn'
          ? 'ইউজার আইডি পাওয়া যায়নি। অনুগ্রহ করে সঠিক আইডি লিখুন।'
          : 'User ID not found in system storage.'
      );
      return;
    }

    if (matchedUser.password !== password) {
      setError(
        language === 'bn'
          ? 'ভুল পাসওয়ার্ড! অনুগ্রহ করে আবার চেষ্টা করুন।'
          : 'Incorrect password. Access denied.'
      );
      return;
    }

    // If role toggle is visible and employee role is picked, check match or allow role switch
    if (loginUI.showRoleToggle && selectedRole !== matchedUser.role) {
      if (matchedUser.role === 'EMPLOYEE' && selectedRole === 'CEO') {
        setError(
          language === 'bn'
            ? 'এই অ্যাকাউন্টে সিইও এক্সেস নেই। এটি একটি স্টাফ অ্যাকাউন্ট।'
            : 'Access restricted: This account does not possess CEO Super Admin privileges.'
        );
        return;
      }
    }

    onLoginSuccess(matchedUser);
  };

  // Quick helper to fill CEO login if exists
  const ceoUser = users.find(u => u.role === 'CEO');
  const employeeUsers = users.filter(u => u.role === 'EMPLOYEE');

  return (
    <div className={`min-h-screen w-full flex flex-col justify-between relative overflow-hidden ${getBackgroundStyle()} text-white select-none`}>
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Bar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          {config.invoiceSettings?.brandingLogos?.headerLogoUrl || loginUI.logoUrl ? (
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 p-0.5 flex items-center justify-center overflow-hidden shadow-md">
              <img
                src={config.invoiceSettings?.brandingLogos?.headerLogoUrl || loginUI.logoUrl}
                alt="Logo"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-extrabold text-white shadow-md shadow-blue-500/30">
              IT
            </div>
          )}
          <span className="font-bold text-sm tracking-wide text-slate-200">
            {contacts.companyName || 'Intelligent Technician'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onLanguageToggle}
            type="button"
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-md mx-auto px-4 py-6 z-10">
        <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle top brand line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400"></div>

          {/* Logo & Header */}
          <div className="text-center mb-6">
            {loginUI.logoUrl ? (
              <div className="w-20 h-20 mx-auto mb-3.5 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 p-1 flex items-center justify-center shadow-lg">
                <img src={loginUI.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div className="w-16 h-16 mx-auto mb-3.5 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 flex items-center justify-center shadow-xl shadow-blue-600/30 text-white font-extrabold text-2xl border border-blue-400/30">
                IT
              </div>
            )}

            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {loginUI.title || 'Intelligent Technician'}
            </h1>
            <p className="text-xs font-medium text-blue-400 mt-1">
              {loginUI.subtitle || 'Industrial Electronics & Smart Engineering'}
            </p>
            {loginUI.tagline && (
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs mx-auto">
                {loginUI.tagline}
              </p>
            )}
          </div>

          {/* Welcome Greeting Banner */}
          {loginUI.welcomeGreeting && (
            <div className="mb-5 p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/40 text-center">
              <p className="text-xs text-blue-200 font-medium flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>{loginUI.welcomeGreeting}</span>
              </p>
            </div>
          )}

          {/* Role Selection Tabs (Show/Hide via CEO Config) */}
          {loginUI.showRoleToggle && (
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mb-5">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('CEO');
                  if (ceoUser) setUserId(ceoUser.userId);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  selectedRole === 'CEO'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{language === 'bn' ? 'সিইও পোর্টাল' : 'CEO Super Admin'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('EMPLOYEE');
                  if (employeeUsers.length > 0) setUserId(employeeUsers[0].userId);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  selectedRole === 'EMPLOYEE'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>{language === 'bn' ? 'স্টাফ পোর্টাল' : 'Employee Staff'}</span>
              </button>
            </div>
          )}

          {/* Error notification */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'bn' ? 'ইউজার আইডি' : 'User ID'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder={selectedRole === 'CEO' ? (ceoUser ? ceoUser.userId : 'Enter CEO ID') : 'Enter Employee ID'}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono transition-all"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/90 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <span>{language === 'bn' ? 'সুরক্ষিত লগইন' : 'Secure Login'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Credential Helper Pill for Convenience */}
          {ceoUser && (
            <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
              <p className="text-[11px] text-slate-400">
                {language === 'bn' ? 'সিস্টেম সিইও অ্যাকাউন্ট:' : 'System CEO Account ID:'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setUserId(ceoUser.userId);
                    setSelectedRole('CEO');
                  }}
                  className="text-blue-400 font-mono font-bold hover:underline"
                >
                  {ceoUser.userId}
                </button>
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer Support Info */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 z-10 gap-2">
        <div className="flex items-center gap-2">
          <span>{contacts.companyName}</span>
          <span>•</span>
          <span>{contacts.officeAddress}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            {contacts.primaryPhone}
          </span>
          <a
            href={contacts.websiteUrl}
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline"
          >
            {contacts.websiteUrl.replace('https://', '')}
          </a>
        </div>
      </footer>
    </div>
  );
};
