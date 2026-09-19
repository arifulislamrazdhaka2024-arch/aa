import React, { useState } from 'react';
import { ShieldAlert, KeyRound, User, Phone, Mail, Building, CheckCircle2, Lock, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount, SystemConfig } from '../types';

interface InitialSetupModalProps {
  onComplete: (ceoAccount: UserAccount, updatedConfig: Partial<SystemConfig>) => void;
  language: 'en' | 'bn';
}

export const InitialSetupModal: React.FC<InitialSetupModalProps> = ({ onComplete, language }) => {
  const [name, setName] = useState('Engineer MD Ariful Islam');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mobile, setMobile] = useState('+880 1711-000000');
  const [email, setEmail] = useState('arifulislamrazdhaka2024@gmail.com');
  const [companyName, setCompanyName] = useState('Intelligent Technician');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userId.trim()) {
      setError(language === 'bn' ? 'অনুগ্রহ করে সিইও ইউজার আইডি লিখুন' : 'Please specify custom CEO User ID');
      return;
    }
    if (password.length < 5) {
      setError(language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৫ অক্ষরের হতে হবে' : 'Master Password must be at least 5 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError(language === 'bn' ? 'পাসওয়ার্ড দুটি মেলেনি!' : 'Passwords do not match');
      return;
    }

    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    const ceoUser: UserAccount = {
      id: 'ceo-root',
      userId: userId.trim(),
      name: name.trim() || 'Engineer MD Ariful Islam',
      email: email.trim(),
      mobile: mobile.trim(),
      password: password,
      role: 'CEO',
      designation: 'Chief Executive Officer & Lead Systems Architect',
      createdAt: new Date().toISOString(),
    };

    onComplete(ceoUser, {
      contacts: {
        companyName: companyName.trim() || 'Intelligent Technician',
        primaryPhone: mobile.trim(),
        techSupportPhone: '+880 1811-222333',
        emergencyHotline: '+880 1911-888999',
        whatsAppSupport: mobile.trim(),
        emailAddress: email.trim(),
        officeAddress: 'Level 7, Technohaven Tower, Motijheel C/A, Dhaka-1000, Bangladesh',
        websiteUrl: 'https://intelligenttechnician.bd',
        binNumber: 'BIN-004589214-0102',
        tradeLicense: 'TRAD/DNCC/049212/2026',
      },
      invoiceSettings: {
        signatureConfig: {
          ceoName: name.trim() || 'Engineer MD Ariful Islam',
          ceoTitle: 'Chief Executive Officer & Chief Engineer',
          showCeoSignature: true,
          showCustomerSignature: true,
          customerSignatureLabel: 'Customer Signature & Official Seal',
          showPreparedBySignature: true,
          preparedByLabel: 'Authorized Officer / Service Engineer',
        }
      } as any
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-blue-500/30 rounded-3xl shadow-[0_0_50px_rgba(30,58,138,0.35)] overflow-hidden my-8">
        {/* Glow Header Banner */}
        <div className="relative bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 md:p-8 text-white border-b border-blue-500/20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            {language === 'bn' ? 'প্রাথমিক সিস্টেম সেটআপ' : 'First-Time System Launch'}
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {language === 'bn' ? 'মাস্টার সিইও অ্যাকাউন্ট তৈরি করুন' : 'Zero-Default-Password Security'}
          </h2>
          <p className="text-xs md:text-sm text-blue-200/80 mt-1.5 leading-relaxed">
            {language === 'bn'
              ? 'নিরাপত্তা নিশ্চিত করতে কোনো ডিফল্ট পাসওয়ার্ড রাখা হয়নি। অনুগ্রহ করে সিইও হিসেবে আপনার নিজস্ব ইউজার আইডি ও পাসওয়ার্ড সেট করুন।'
              : 'Zero developer or hardcoded passwords exist out-of-the-box. Provision your Master CEO User ID & secure credentials now.'}
          </p>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {language === 'bn' ? 'সিইও এর নাম (অনুমোদিত স্বাক্ষরকারী)' : 'CEO Full Name (Signatory)'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Engineer MD Ariful Islam"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {language === 'bn' ? 'কোম্পানির নাম' : 'Enterprise / Company Name'}
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Intelligent Technician"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-900/50 space-y-4">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" />
              {language === 'bn' ? 'সিইও লগইন তথ্য (Master Credentials)' : 'Master CEO Login Credentials'}
            </h4>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {language === 'bn' ? 'কাস্টম সিইও ইউজার আইডি *' : 'Custom CEO User ID *'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. ariful, ceo, admin"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  autoFocus
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {language === 'bn' ? 'মাস্টার পাসওয়ার্ড *' : 'Master Password *'}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {language === 'bn' ? 'পুনরায় পাসওয়ার্ড লিখুন *' : 'Confirm Password *'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 select-none">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0"
              />
              <span>{language === 'bn' ? 'পাসওয়ার্ড প্রদর্শন করুন' : 'Show Passwords'}</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {language === 'bn' ? 'সিইও মোবাইল / হোয়াটসঅ্যাপ' : 'CEO Mobile / WhatsApp'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+880 1711-000000"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {language === 'bn' ? 'সিইও অফিসিয়াল ইমেইল' : 'Official CEO Email'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="arifulislamrazdhaka2024@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{language === 'bn' ? 'সিস্টেম ইনিশিয়ালাইজ ও চালু করুন' : 'Initialize & Launch Master System'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
