import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Layout,
  PhoneCall,
  Printer,
  KeyRound,
  Palette,
  Database,
  Save,
  Upload,
  Plus,
  Trash2,
  Check,
  UserPlus,
  Shield,
  Eye,
  Type,
  FileSignature,
  FileText,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Image as ImageIcon,
  Stamp,
  Crown,
  Search,
  QrCode,
  Barcode,
  RefreshCw,
} from 'lucide-react';
import {
  SystemConfig,
  UserAccount,
  ThemePalette,
  HeaderLayout,
  LogoPosition,
  LogoSize,
  DiscountFormat,
  CustomExtraField,
} from '../types';
import { THEME_PALETTES, GOOGLE_FONTS_EN, GOOGLE_FONTS_BN, DEFAULT_SYSTEM_CONFIG } from '../data/initialData';
import { exportSystemBackup, importSystemBackup, deepMergeConfig } from '../utils/storage';
import {
  ENTERPRISE_THEMES,
  ENTERPRISE_FONTS,
  ENTERPRISE_100_FEATURES,
  getDefault100FeaturesState,
} from '../data/enterpriseFeatures';

interface MasterControlPanelProps {
  config: SystemConfig;
  onSaveConfig: (updated: SystemConfig) => void;
  users: UserAccount[];
  onSaveUsers: (users: UserAccount[]) => void;
  currentUser: UserAccount;
  language: 'en' | 'bn';
}

type TabKey =
  | 'enterprise-matrix'
  | 'invoice-design'
  | 'login-ui'
  | 'contacts'
  | 'credentials'
  | 'theme-typography'
  | 'backup';

const SwitchToggle: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}> = ({ checked, onChange, id }) => (
  <label className="relative inline-block w-11 h-6 cursor-pointer select-none">
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      className="sr-only peer"
    />
    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:bg-[var(--accent-color,#2563eb)] transition-colors after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-transform peer-checked:after:translate-x-5 shadow-inner"></div>
  </label>
);

export const MasterControlPanel: React.FC<MasterControlPanelProps> = ({
  config,
  onSaveConfig,
  users,
  onSaveUsers,
  currentUser,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('enterprise-matrix');
  const [formData, setFormData] = useState<SystemConfig>(() => {
    return deepMergeConfig(DEFAULT_SYSTEM_CONFIG, config);
  });
  const [usersList, setUsersList] = useState<UserAccount[]>(() => {
    return JSON.parse(JSON.stringify(users || []));
  });

  useEffect(() => {
    setFormData(deepMergeConfig(DEFAULT_SYSTEM_CONFIG, config));
  }, [config]);

  useEffect(() => {
    setUsersList(JSON.parse(JSON.stringify(users || [])));
  }, [users]);
  const [selectedThemeCategory, setSelectedThemeCategory] = useState<string>('All');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 100+ Enterprise Matrix States
  const [searchFeatureQuery, setSearchFeatureQuery] = useState('');
  const [selectedFeatureCategory, setSelectedFeatureCategory] = useState<string>('All');
  const [saveStatusMsg, setSaveStatusMsg] = useState(
    language === 'bn' ? 'সকল পরিবর্তন লাইভ কার্যকর হচ্ছে' : 'All changes active live in system'
  );

  const handleEnterpriseThemeChange = (
    themeId:
      | 'theme-dark'
      | 'theme-light'
      | 'theme-corporate'
      | 'theme-emerald'
      | 'theme-gold'
      | 'theme-cyberpunk'
      | 'theme-purple'
      | 'theme-midnight'
  ) => {
    setFormData(prev => ({
      ...prev,
      enterpriseTheme: themeId,
    }));
    document.body.classList.remove(
      'theme-dark',
      'theme-light',
      'theme-corporate',
      'theme-emerald',
      'theme-gold',
      'theme-cyberpunk',
      'theme-purple',
      'theme-midnight'
    );
    document.body.classList.add(themeId);
    try {
      localStorage.setItem('selectedTheme', themeId);
    } catch (e) {}
  };

  const handleEnterpriseFontChange = (fontFamily: string) => {
    setFormData(prev => ({
      ...prev,
      activeFontFamily: fontFamily,
    }));
    document.documentElement.style.setProperty('--app-font', fontFamily);
    document.body.style.fontFamily = fontFamily;
    try {
      localStorage.setItem('selectedFont', fontFamily);
    } catch (e) {}
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('invoice-preview');
    if (!element) return;
    const opt = {
      margin: 0.5,
      filename: 'Invoice_Intelligent_Technician.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };
    const win = window as any;
    if (win.html2pdf) {
      win.html2pdf().set(opt).from(element).save();
    } else {
      window.print();
    }
  };

  const handleToggle100Feature = (featureId: string) => {
    setFormData(prev => {
      const current = prev.systemFeatures100 || getDefault100FeaturesState();
      return {
        ...prev,
        systemFeatures100: {
          ...current,
          [featureId]: !current[featureId],
        },
      };
    });
  };

  const handleBulkFeatures100 = (enabled: boolean) => {
    const updated: Record<string, boolean> = {};
    ENTERPRISE_100_FEATURES.forEach(f => {
      updated[f.id] = enabled;
    });
    setFormData(prev => ({
      ...prev,
      systemFeatures100: updated,
    }));
  };

  const handleResetFeatures100 = () => {
    setFormData(prev => ({
      ...prev,
      systemFeatures100: getDefault100FeaturesState(),
    }));
  };

  const handleSaveAllSettings = () => {
    onSaveConfig(formData);
    setSaveSuccess(true);
    setSaveStatusMsg(
      language === 'bn' ? 'সবকিছু সফলভাবে সেভ হয়েছে! ✓' : 'All Settings Saved Successfully! ✓'
    );
    setTimeout(() => {
      setSaveSuccess(false);
      setSaveStatusMsg(
        language === 'bn' ? 'সকল পরিবর্তন লাইভ কার্যকর হচ্ছে' : 'All changes active live in system'
      );
    }, 3000);
  };

  // New staff state
  const [newStaff, setNewStaff] = useState({
    userId: '',
    name: '',
    email: '',
    mobile: '',
    password: '',
    designation: 'Service Engineer',
    canCreateInvoice: true,
    canScanBarcode: true,
    canApplyDiscount: false,
    canViewLogs: true,
    canEditProductPrice: false,
  });
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);

  // CEO Credentials update
  const ceoAccount = usersList.find(u => u.role === 'CEO') || currentUser;
  const [ceoForm, setCeoForm] = useState({
    userId: ceoAccount.userId,
    name: ceoAccount.name,
    email: ceoAccount.email,
    mobile: ceoAccount.mobile,
    password: ceoAccount.password,
  });

  const handleCommitConfig = () => {
    onSaveConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (base64: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          callback(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Staff Management
  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.userId.trim() || !newStaff.password.trim()) {
      alert('User ID and Password are required');
      return;
    }

    const created: UserAccount = {
      id: 'staff-' + Date.now(),
      userId: newStaff.userId.trim().toLowerCase(),
      name: newStaff.name.trim() || 'Staff Technician',
      email: newStaff.email.trim(),
      mobile: newStaff.mobile.trim(),
      password: newStaff.password.trim(),
      role: 'EMPLOYEE',
      designation: newStaff.designation.trim() || 'Service Technician',
      createdAt: new Date().toISOString(),
      permissions: {
        canCreateInvoice: newStaff.canCreateInvoice,
        canScanBarcode: newStaff.canScanBarcode,
        canApplyDiscount: newStaff.canApplyDiscount,
        canViewLogs: newStaff.canViewLogs,
        canEditProductPrice: newStaff.canEditProductPrice,
      },
    };

    const updated = [...usersList, created];
    setUsersList(updated);
    onSaveUsers(updated);
    setShowAddStaffModal(false);
    setNewStaff({
      userId: '',
      name: '',
      email: '',
      mobile: '',
      password: '',
      designation: 'Service Engineer',
      canCreateInvoice: true,
      canScanBarcode: true,
      canApplyDiscount: false,
      canViewLogs: true,
      canEditProductPrice: false,
    });
  };

  const handleDeleteStaff = (id: string) => {
    if (confirm('Are you sure you want to delete this staff account?')) {
      const updated = usersList.filter(u => u.id !== id);
      setUsersList(updated);
      onSaveUsers(updated);
    }
  };

  const handleUpdateCeoProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = usersList.map(u => {
      if (u.role === 'CEO') {
        return {
          ...u,
          userId: ceoForm.userId.trim(),
          name: ceoForm.name.trim(),
          email: ceoForm.email.trim(),
          mobile: ceoForm.mobile.trim(),
          password: ceoForm.password.trim(),
        };
      }
      return u;
    });
    setUsersList(updated);
    onSaveUsers(updated);

    // Also update invoice signature name if matched
    setFormData(prev => ({
      ...prev,
      contacts: {
        ...prev.contacts,
        primaryPhone: ceoForm.mobile.trim(),
        emailAddress: ceoForm.email.trim(),
      },
      invoiceSettings: {
        ...prev.invoiceSettings,
        signatureConfig: {
          ...prev.invoiceSettings.signatureConfig,
          ceoName: ceoForm.name.trim(),
        },
      },
    }));

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Custom Extra Fields helper
  const addExtraField = () => {
    const newField: CustomExtraField = {
      id: 'field_' + Date.now(),
      label: 'New Custom Field',
      value: '',
      enabled: true,
      showOnPrint: true,
    };
    setFormData(prev => ({
      ...prev,
      invoiceSettings: {
        ...prev.invoiceSettings,
        customExtraFields: [...(prev.invoiceSettings?.customExtraFields || []), newField],
      },
    }));
  };

  const removeExtraField = (id: string) => {
    setFormData(prev => ({
      ...prev,
      invoiceSettings: {
        ...prev.invoiceSettings,
        customExtraFields: (prev.invoiceSettings?.customExtraFields || []).filter(f => f.id !== id),
      },
    }));
  };

  // Terms and conditions helper
  const addTerm = () => {
    setFormData(prev => ({
      ...prev,
      invoiceSettings: {
        ...prev.invoiceSettings,
        termsAndConditions: [
          ...(prev.invoiceSettings?.termsAndConditions || []),
          'New warranty term or policy rule.',
        ],
      },
    }));
  };

  const removeTerm = (index: number) => {
    setFormData(prev => ({
      ...prev,
      invoiceSettings: {
        ...prev.invoiceSettings,
        termsAndConditions: (prev.invoiceSettings?.termsAndConditions || []).filter((_, i) => i !== index),
      },
    }));
  };

  // Themes list filtered
  const categories = ['All', 'Corporate', 'Executive', 'Cyber', 'Royal', 'Nature', 'Vibrant', 'Minimal', 'Prestige'];
  const filteredThemes = selectedThemeCategory === 'All'
    ? THEME_PALETTES
    : THEME_PALETTES.filter(t => t.category === selectedThemeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-lg">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">
                {language === 'bn' ? 'সিইও মাস্টার কন্ট্রোল প্যানেল' : 'CEO Master Control Panel'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 uppercase">
                100% Dynamic Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'bn'
                ? 'লগইন স্ক্রিন, কর্পোরেট কন্টাক্ট, প্রিন্টেড ইনভয়েস, কর্মী এক্সেস ও ১০০+ থিম সম্পূর্ণ আপনার নিয়ন্ত্রণে।'
                : 'Absolute freedom over every pixel, text, number, signature, print layout, credentials, and 100+ themes.'}
            </p>
          </div>
        </div>

        {/* Global Save Button */}
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-bold animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              {language === 'bn' ? 'সফলভাবে সংরক্ষিত!' : 'Changes Saved Live!'}
            </span>
          )}
          <button
            onClick={handleCommitConfig}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{language === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save All Settings Live'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {[
          { key: 'enterprise-matrix', icon: Crown, label: language === 'bn' ? '👑 ১০০+ মাস্টার কন্ট্রোল' : '👑 100+ Master Matrix' },
          { key: 'invoice-design', icon: Printer, label: language === 'bn' ? 'প্রিন্টেড ইনভয়েস ডিজাইন' : 'Printed Invoice & PDF' },
          { key: 'login-ui', icon: Layout, label: language === 'bn' ? 'লগইন ও ব্র্যান্ডিং UI' : 'Login & First Impression' },
          { key: 'contacts', icon: PhoneCall, label: language === 'bn' ? 'কর্পোরেট কন্টাক্ট ও ফোন' : 'Contact & Official Nos' },
          { key: 'credentials', icon: KeyRound, label: language === 'bn' ? 'ইউজার আইডি ও কর্মী পরিচালনা' : 'Credentials & Staff Accounts' },
          { key: 'theme-typography', icon: Palette, label: language === 'bn' ? '১০০+ থিম ও টাইপোগ্রাফি' : '100+ Themes & Typography' },
          { key: 'backup', icon: Database, label: language === 'bn' ? 'ডাটা ব্যাকআপ ও রিস্টোর' : 'Backup & Restore' },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 0: 👑 CEO MASTER CONTROL PANEL - ENTERPRISE EDITION ================= */}
      {activeTab === 'enterprise-matrix' && (
        <div className="space-y-6">
          {/* Header Panel */}
          <div className="bg-[var(--card-bg,#151c2c)] border border-[var(--border-color,#1e293b)] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div>
              <h1 className="m-0 text-2xl font-black flex items-center gap-2.5 text-[var(--text-main,#f8fafc)]">
                <span className="text-amber-400">👑</span>
                <span>{language === 'bn' ? 'CEO Master Control Panel' : 'CEO Master Control Panel'}</span>
              </h1>
              <p className="mt-1 text-xs text-[var(--text-muted,#94a3b8)]">
                {language === 'bn'
                  ? '১০০+ ফুল কন্ট্রোল অপশন সহ ইনস্ট্যান্ট থিম ও ফন্ট চেঞ্জার'
                  : 'Instant live theme & font changer with 100+ full enterprise control switches'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                id="status-badge"
                className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>
                  {language === 'bn' ? '● System Active' : '● System Active'} (
                  {
                    Object.values(formData.systemFeatures100 || getDefault100FeaturesState()).filter(
                      Boolean
                    ).length
                  }
                  /100)
                </span>
              </span>
            </div>
          </div>

          {/* Dual Panel Layout: Left = CEO Master Control Panel, Right = Live Printable Invoice Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: 👑 CEO Master Control Panel */}
            <div className="bg-[var(--card-bg,#151c2c)] border border-[var(--border,#1e293b)] rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-[var(--border,#1e293b)] pb-3">
                <h2 className="m-0 text-lg font-black text-[var(--accent,#2563eb)] flex items-center gap-2">
                  <span>👑</span>
                  <span>CEO Master Control Panel</span>
                </h2>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                  Enterprise v2.0
                </span>
              </div>

              {/* 1. Unique Themes */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-main,#f8fafc)] mb-1.5">
                  🎨 {language === 'bn' ? 'সিস্টেম ও ইনভয়েস থিম সিলেক্ট করুন:' : 'Select System & Invoice Theme:'}
                </label>
                <select
                  id="themeSelect"
                  value={formData.enterpriseTheme || 'theme-dark'}
                  onChange={e => handleEnterpriseThemeChange(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[var(--border,#1e293b)] bg-black/20 text-[var(--text-main,#f8fafc)] text-xs font-medium focus:border-blue-500 outline-none transition-colors"
                >
                  {ENTERPRISE_THEMES.map(theme => (
                    <option key={theme.id} value={theme.id} className="bg-slate-900 text-white">
                      {theme.name} {language === 'bn' ? `(${theme.banglaName})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Bangla & English Fonts */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-main,#f8fafc)] mb-1.5">
                  🔤 {language === 'bn' ? 'ফন্ট স্টাইল (বাংলা ও ইংরেজি - লাইভ চেঞ্জ):' : 'Font Style (Bangla & English - Live Change):'}
                </label>
                <select
                  id="fontSelect"
                  value={formData.activeFontFamily || "'Inter', 'Hind Siliguri', sans-serif"}
                  onChange={e => handleEnterpriseFontChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--border,#1e293b)] bg-black/20 text-[var(--text-main,#f8fafc)] text-xs font-medium focus:border-blue-500 outline-none transition-colors"
                >
                  <optgroup label={language === 'bn' ? 'বাংলা ফন্টসমূহ (Bangla Fonts)' : 'Bangla Fonts'}>
                    {ENTERPRISE_FONTS.filter(f => f.category === 'Bangla').map(font => (
                      <option key={font.value} value={font.value} className="bg-slate-900 text-white">
                        {font.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label={language === 'bn' ? 'English Fonts (ইংরেজি ফন্ট)' : 'English Fonts'}>
                    {ENTERPRISE_FONTS.filter(f => f.category === 'English').map(font => (
                      <option key={font.value} value={font.value} className="bg-slate-900 text-white">
                        {font.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label={language === 'bn' ? 'Universal / Hybrid' : 'Universal / Hybrid'}>
                    {ENTERPRISE_FONTS.filter(f => f.category === 'Universal').map(font => (
                      <option key={font.value} value={font.value} className="bg-slate-900 text-white">
                        {font.label}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* 3. Signature Control */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-main,#f8fafc)] mb-1.5">
                  ✍️ {language === 'bn' ? 'সিগনেচার সেটিং (ম্যানুয়াল টাইপ):' : 'Signature Setting (Manual Type):'}
                </label>
                <input
                  type="text"
                  id="leftSigInput"
                  value={
                    formData.invoiceSettings.signatureConfig.leftSignatureLabel ||
                    formData.invoiceSettings.signatureConfig.customerSignatureLabel ||
                    'Authorized Signature'
                  }
                  placeholder={language === 'bn' ? 'বাম সিগনেচার' : 'Left Signature'}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      invoiceSettings: {
                        ...prev.invoiceSettings,
                        signatureConfig: {
                          ...prev.invoiceSettings.signatureConfig,
                          leftSignatureLabel: e.target.value,
                          customerSignatureLabel: e.target.value,
                        },
                      },
                    }))
                  }
                  className="w-full p-2.5 rounded-xl border border-[var(--border,#1e293b)] bg-black/20 text-[var(--text-main,#f8fafc)] text-xs outline-none"
                />
                <input
                  type="text"
                  id="rightSigInput"
                  value={
                    formData.invoiceSettings.signatureConfig.rightSignatureLabel ||
                    formData.invoiceSettings.signatureConfig.ceoName ||
                    'CEO / Managing Director'
                  }
                  placeholder={language === 'bn' ? 'ডান সিগনেচার' : 'Right Signature'}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      invoiceSettings: {
                        ...prev.invoiceSettings,
                        signatureConfig: {
                          ...prev.invoiceSettings.signatureConfig,
                          rightSignatureLabel: e.target.value,
                          ceoName: e.target.value,
                        },
                      },
                    }))
                  }
                  className="w-full p-2.5 rounded-xl border border-[var(--border,#1e293b)] bg-black/20 text-[var(--text-main,#f8fafc)] text-xs outline-none mt-2"
                />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <label className="p-2 border border-dashed border-[var(--border,#1e293b)] hover:border-blue-500 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-center bg-black/10">
                    <FileSignature className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[11px] text-[var(--text-muted,#94a3b8)] font-medium">
                      {language === 'bn' ? 'বাম স্বাক্ষর আপলোড' : 'Upload Left Sig'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e =>
                        handleImageUpload(e, base64 =>
                          setFormData(prev => ({
                            ...prev,
                            invoiceSettings: {
                              ...prev.invoiceSettings,
                              signatureConfig: {
                                ...prev.invoiceSettings.signatureConfig,
                                leftSignatureImage: base64,
                              },
                            },
                          }))
                        )
                      }
                    />
                  </label>
                  <label className="p-2 border border-dashed border-[var(--border,#1e293b)] hover:border-blue-500 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-center bg-black/10">
                    <Stamp className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] text-[var(--text-muted,#94a3b8)] font-medium">
                      {language === 'bn' ? 'CEO সিল/স্বাক্ষর' : 'Upload CEO Seal'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e =>
                        handleImageUpload(e, base64 =>
                          setFormData(prev => ({
                            ...prev,
                            invoiceSettings: {
                              ...prev.invoiceSettings,
                              signatureConfig: {
                                ...prev.invoiceSettings.signatureConfig,
                                rightSignatureImage: base64,
                                ceoSignatureImage: base64,
                              },
                            },
                          }))
                        )
                      }
                    />
                  </label>
                </div>
              </div>

              {/* 4. PDF Controls */}
              <div className="pt-2 border-t border-[var(--border,#1e293b)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-main,#f8fafc)]">
                    {language === 'bn' ? 'PDF ওয়াটারমার্ক অন/অফ' : 'PDF Watermark On/Off'}
                  </span>
                  <SwitchToggle
                    id="wmToggle"
                    checked={formData.invoiceSettings.showWatermark}
                    onChange={v =>
                      setFormData(prev => ({
                        ...prev,
                        invoiceSettings: { ...prev.invoiceSettings, showWatermark: v },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-main,#f8fafc)]">
                    {language === 'bn' ? 'ইনভয়েসে ডিজিটাল সিগনেচার' : 'Show Digital Signature'}
                  </span>
                  <SwitchToggle
                    checked={formData.invoiceSettings.showDigitalSignature ?? true}
                    onChange={v =>
                      setFormData(prev => ({
                        ...prev,
                        invoiceSettings: { ...prev.invoiceSettings, showDigitalSignature: v },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-main,#f8fafc)]">
                    {language === 'bn' ? 'প্রিন্ট ইনভয়েসে লোগো দেখান' : 'Show Logo on Print'}
                  </span>
                  <SwitchToggle
                    checked={formData.invoiceSettings.showLogo}
                    onChange={v =>
                      setFormData(prev => ({
                        ...prev,
                        invoiceSettings: { ...prev.invoiceSettings, showLogo: v },
                      }))
                    }
                  />
                </div>

                <div className="pt-1">
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted,#94a3b8)] mb-1">
                    <span>{language === 'bn' ? 'ওয়াটারমার্ক অপাসিটি (%)' : 'Watermark Opacity (%)'}</span>
                    <span className="font-mono text-blue-400 font-bold">
                      {formData.invoiceSettings.watermarkOpacity ?? 15}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={50}
                    step={1}
                    value={formData.invoiceSettings.watermarkOpacity ?? 15}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        invoiceSettings: {
                          ...prev.invoiceSettings,
                          watermarkOpacity: parseInt(e.target.value) || 15,
                        },
                      }))
                    }
                    className="w-full accent-blue-600 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* PDF Download Button */}
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="w-full py-3 px-4 bg-[var(--accent,#2563eb)] hover:opacity-95 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <FileText className="w-4 h-4" />
                <span>{language === 'bn' ? '📄 PDF ডাউনলোড করুন (১ ক্লিকে)' : '📄 Download PDF (1-Click)'}</span>
              </button>
            </div>

            {/* Card 2: 📄 লাইভ ইনভয়েস প্রিভিউ */}
            <div className="bg-[var(--card-bg,#151c2c)] border border-[var(--border,#1e293b)] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[var(--border,#1e293b)] pb-3 mb-4">
                  <h2 className="m-0 text-lg font-black text-[var(--accent,#2563eb)] flex items-center gap-2">
                    <span>📄</span>
                    <span>{language === 'bn' ? 'লাইভ ইনভয়েস প্রিভিউ' : 'Live Printable Invoice Preview'}</span>
                  </h2>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    Live WYSIWYG
                  </span>
                </div>

                {/* The Invoice Preview Box */}
                <div
                  id="invoice-preview"
                  className="rounded-xl p-6 sm:p-7 relative overflow-hidden transition-all duration-300 shadow-inner border border-slate-200/20"
                  style={{
                    backgroundColor: 'var(--invoice-bg, #ffffff)',
                    color: 'var(--invoice-text, #0f172a)',
                    fontFamily: 'var(--app-font, inherit)',
                  }}
                >
                  {/* Watermark */}
                  {formData.invoiceSettings.showWatermark && (
                    <div
                      id="watermarkText"
                      className="watermark absolute pointer-events-none select-none text-center font-black uppercase tracking-widest"
                      style={{
                        top: '35%',
                        left: '10%',
                        right: '10%',
                        fontSize: '38px',
                        color: 'rgba(0, 0, 0, 0.08)',
                        opacity: (formData.invoiceSettings.watermarkOpacity ?? 15) / 100,
                        transform: 'rotate(-30deg)',
                      }}
                    >
                      {formData.invoiceSettings.watermarkText || 'INTELLIGENT TECHNICIAN'}
                    </div>
                  )}

                  {/* Header */}
                  <div
                    className="flex justify-between items-center pb-3 border-b-2"
                    style={{ borderColor: 'var(--accent, #2563eb)' }}
                  >
                    <div>
                      <h1
                        className="m-0 text-xl sm:text-2xl font-black tracking-tight"
                        style={{ color: 'var(--accent, #2563eb)' }}
                      >
                        INVOICE
                      </h1>
                      <p className="m-0 mt-0.5 text-xs opacity-70 font-mono">
                        {language === 'bn' ? 'ইনভয়েস নং:' : 'Invoice No:'} #IT-2026-001
                      </p>
                    </div>
                    <div className="text-right">
                      <strong className="text-sm sm:text-base font-bold block">
                        {formData.contacts?.companyName || 'ইন্টেলিজেন্ট টেকনিশিয়ান'}
                      </strong>
                      <span className="text-xs opacity-75 block">
                        {formData.contacts?.officeAddress || 'ঢাকা, বাংলাদেশ'}
                      </span>
                    </div>
                  </div>

                  {/* Items Table */}
                  <table className="w-full mt-5 border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b text-left" style={{ borderColor: 'var(--border, #1e293b)' }}>
                        <th className="py-2 font-bold">{language === 'bn' ? 'বিবরণ (Item)' : 'Item Description'}</th>
                        <th className="py-2 text-center font-bold">{language === 'bn' ? 'পরিমাণ' : 'Qty'}</th>
                        <th className="py-2 text-right font-bold">{language === 'bn' ? 'মূল্য' : 'Price'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-dashed" style={{ borderColor: 'var(--border, #1e293b)' }}>
                        <td className="py-2.5">
                          <p className="font-semibold m-0">সফটওয়্যার ডেভেলপমেন্ট সার্ভিস</p>
                          <span className="text-[10px] opacity-60">Custom Software & Management Portal</span>
                        </td>
                        <td className="py-2.5 text-center font-mono">১</td>
                        <td className="py-2.5 text-right font-mono font-bold">৳ ৫০,০০০</td>
                      </tr>
                      <tr className="border-b border-dashed" style={{ borderColor: 'var(--border, #1e293b)' }}>
                        <td className="py-2.5">
                          <p className="font-semibold m-0">মাস্টার কন্ট্রোল প্যানেল সেটিং</p>
                          <span className="text-[10px] opacity-60">Full Enterprise System Configuration</span>
                        </td>
                        <td className="py-2.5 text-center font-mono">১</td>
                        <td className="py-2.5 text-right font-mono font-bold">৳ ১০,০০০</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Total Due */}
                  <div
                    className="mt-4 pt-3 border-t flex justify-end items-center gap-3 text-sm sm:text-base font-bold"
                    style={{ borderColor: 'var(--border, #1e293b)' }}
                  >
                    <span>{language === 'bn' ? 'মোট বকেয়া:' : 'Total Due:'}</span>
                    <span className="text-lg sm:text-xl font-mono font-black" style={{ color: 'var(--accent, #2563eb)' }}>
                      ৳ ৬০,০০০
                    </span>
                  </div>

                  {/* Signatures */}
                  <div className="mt-12 flex justify-between items-end gap-6 text-xs text-center">
                    <div className="w-[45%] flex flex-col items-center">
                      {formData.invoiceSettings.signatureConfig.leftSignatureImage && (
                        <img
                          src={formData.invoiceSettings.signatureConfig.leftSignatureImage}
                          alt="Left Sig"
                          className="h-10 object-contain mb-1"
                        />
                      )}
                      <div
                        id="leftSigText"
                        className="w-full pt-1.5 border-t border-dashed font-semibold"
                        style={{ borderColor: 'var(--border, #1e293b)' }}
                      >
                        {formData.invoiceSettings.signatureConfig.leftSignatureLabel ||
                          formData.invoiceSettings.signatureConfig.customerSignatureLabel ||
                          'Authorized Signature'}
                      </div>
                    </div>

                    <div className="w-[45%] flex flex-col items-center">
                      {formData.invoiceSettings.signatureConfig.ceoSignatureImage && (
                        <img
                          src={formData.invoiceSettings.signatureConfig.ceoSignatureImage}
                          alt="CEO Sig"
                          className="h-10 object-contain mb-1"
                        />
                      )}
                      <div
                        id="rightSigText"
                        className="w-full pt-1.5 border-t border-dashed font-semibold"
                        style={{ borderColor: 'var(--border, #1e293b)' }}
                      >
                        {formData.invoiceSettings.signatureConfig.rightSignatureLabel ||
                          formData.invoiceSettings.signatureConfig.ceoName ||
                          'CEO / Managing Director'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Footer Actions */}
              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[var(--border,#1e293b)]">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow"
                >
                  <FileText className="w-4 h-4" />
                  <span>{language === 'bn' ? '১ ক্লিকে PDF ডাউনলোড' : '1-Click PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
                >
                  <Printer className="w-4 h-4" />
                  <span>{language === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Controls Grid: Features Switch + 100+ Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Section 5: Dynamic 100+ Feature Matrix (Bulk Controls) - Spans 2 columns on lg */}
            <div className="bg-[var(--card-bg,#151c2c)] border border-[var(--border-color,#1e293b)] rounded-2xl p-5 shadow-lg col-span-1 md:col-span-2 lg:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color,#1e293b)] pb-3 mb-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-[var(--accent-color,#2563eb)] flex items-center gap-2 m-0">
                    <span>⚡</span>
                    <span>
                      {language === 'bn'
                        ? '৫. অ্যাডভান্সড ১০০+ সিস্টেম সেটিংস'
                        : '5. Advanced 100+ System Feature Matrix'}
                    </span>
                  </h3>

                  {/* Bulk toggle buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleBulkFeatures100(true)}
                      className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                    >
                      {language === 'bn' ? 'সব অন (All ON)' : 'All ON'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkFeatures100(false)}
                      className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                    >
                      {language === 'bn' ? 'সব অফ (All OFF)' : 'All OFF'}
                    </button>
                    <button
                      type="button"
                      onClick={handleResetFeatures100}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                    >
                      {language === 'bn' ? 'ডিফল্ট (Reset)' : 'Reset'}
                    </button>
                  </div>
                </div>

                {/* Search & Category Filter */}
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchFeatureQuery}
                      onChange={e => setSearchFeatureQuery(e.target.value)}
                      placeholder={
                        language === 'bn' ? '১০০টি ফিচারের মধ্যে খুঁজুন...' : 'Search in 100+ features...'
                      }
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--border-color,#1e293b)] bg-slate-950/60 text-[var(--text-main,#f8fafc)] text-xs outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    {['All', 'Sales', 'Accounting', 'Inventory', 'Automation', 'Security', 'Print'].map(
                      cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedFeatureCategory(cat)}
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors whitespace-nowrap cursor-pointer ${
                            selectedFeatureCategory === cat
                              ? 'bg-blue-600 text-white shadow'
                              : 'bg-slate-800/80 text-slate-400 hover:text-white'
                          }`}
                        >
                          {cat}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Dynamic 100 Features Grid */}
                <div className="max-h-[440px] overflow-y-auto pr-2 space-y-1.5 divide-y divide-dashed divide-[var(--border-color,#1e293b)]">
                  {ENTERPRISE_100_FEATURES.filter(item => {
                    const matchCategory =
                      selectedFeatureCategory === 'All' || item.category === selectedFeatureCategory;
                    const q = searchFeatureQuery.toLowerCase().trim();
                    const matchQuery =
                      !q ||
                      item.title.toLowerCase().includes(q) ||
                      item.banglaTitle.toLowerCase().includes(q) ||
                      item.index.toString() === q;
                    return matchCategory && matchQuery;
                  }).map(feature => {
                    const isEnabled =
                      formData.systemFeatures100?.[feature.id] ?? feature.defaultEnabled;
                    return (
                      <div
                        key={feature.id}
                        className="flex items-center justify-between py-2 px-1 hover:bg-white/[0.02] rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2.5 pr-2">
                          <span className="text-[10px] font-mono font-bold text-slate-500 w-6">
                            #{feature.index}
                          </span>
                          <div>
                            <p className="text-xs font-medium text-[var(--text-main,#f8fafc)]">
                              {language === 'bn' ? feature.banglaTitle : feature.title}
                            </p>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                              {feature.category}
                            </span>
                          </div>
                        </div>

                        <SwitchToggle
                          id={feature.id}
                          checked={isEnabled}
                          onChange={() => handleToggle100Feature(feature.id)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Save Bar */}
          <div className="sticky bottom-4 z-30 bg-[var(--card-bg,#151c2c)] border border-[var(--accent-color,#2563eb)] rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 backdrop-blur-lg">
            <div className="flex items-center gap-2">
              <strong className="text-xs text-[var(--text-main,#f8fafc)]">
                {language === 'bn' ? 'স্ট্যাটাস:' : 'Status:'}
              </strong>
              <span
                id="saveStatus"
                className={`text-xs font-semibold ${
                  saveSuccess ? 'text-emerald-400' : 'text-[var(--text-muted,#94a3b8)]'
                }`}
              >
                {saveStatusMsg}
              </span>
            </div>
            <button
              type="button"
              onClick={handleSaveAllSettings}
              className="w-full sm:w-auto px-6 py-3 bg-[var(--accent-color,#2563eb)] hover:opacity-90 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>{language === 'bn' ? 'এক ক্লিকে সেভ করুন 💾' : 'Save All Settings in One Click 💾'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 1: PRINTED INVOICE & PDF DESIGN ================= */}
      {activeTab === 'invoice-design' && (
        <div className="space-y-6">
          {/* MASTER LOGO & SIGNATURE CONTROLLER (Integrated Corporate Branding Panel) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Master Logo & Signature Controller</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Central Hub
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    লোগো ও অফিসিয়াল স্বাক্ষরের কেন্দ্রীয় নিয়ন্ত্রণ প্যানেল (ইনভয়েস, হেডার ও ওয়াটারমার্ক)
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* SECTION A: MASTER LOGO CONTROLLER */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-200 pb-1 border-b border-slate-800/80">
                  <ImageIcon className="w-4 h-4 text-blue-400" />
                  <span>১. লোগো কন্ট্রোলার (Master Logos)</span>
                </div>

                {/* 1. Header & Menu Logo */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-semibold text-white block">
                        ক. মেনু ও হেডার লোগো (Header & Menu Logo)
                      </label>
                      <span className="text-[11px] text-slate-400">
                        লগইন স্ক্রিন ও সিস্টেমের প্রধান নেভিগেশন বারে প্রদর্শিত হবে
                      </span>
                    </div>
                    {formData.invoiceSettings?.brandingLogos?.headerLogoUrl || formData.loginUI.logoUrl ? (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded-md">
                        সক্রিয় (Active)
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">No Image</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-16 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center p-1 overflow-hidden shrink-0">
                      {formData.invoiceSettings?.brandingLogos?.headerLogoUrl || formData.loginUI.logoUrl ? (
                        <img
                          src={formData.invoiceSettings?.brandingLogos?.headerLogoUrl || formData.loginUI.logoUrl}
                          alt="Header Logo"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-500 font-bold">IT</span>
                      )}
                    </div>

                    <div className="flex-1 flex flex-wrap items-center gap-2">
                      <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>লোগো আপলোড</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e =>
                            handleImageUpload(e, base64 => {
                              setFormData({
                                ...formData,
                                loginUI: { ...formData.loginUI, logoUrl: base64 },
                                invoiceSettings: {
                                  ...formData.invoiceSettings,
                                  brandingLogos: {
                                    headerLogoUrl: base64,
                                    invoiceLogoUrl: formData.invoiceSettings?.brandingLogos?.invoiceLogoUrl || '',
                                    watermarkLogoUrl: formData.invoiceSettings?.brandingLogos?.watermarkLogoUrl || '',
                                    footerLogoUrl: formData.invoiceSettings?.brandingLogos?.footerLogoUrl || '',
                                  },
                                },
                              });
                            })
                          }
                        />
                      </label>
                      {(formData.invoiceSettings?.brandingLogos?.headerLogoUrl || formData.loginUI.logoUrl) && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              loginUI: { ...formData.loginUI, logoUrl: '' },
                              invoiceSettings: {
                                ...formData.invoiceSettings,
                                brandingLogos: {
                                  headerLogoUrl: '',
                                  invoiceLogoUrl: formData.invoiceSettings?.brandingLogos?.invoiceLogoUrl || '',
                                  watermarkLogoUrl: formData.invoiceSettings?.brandingLogos?.watermarkLogoUrl || '',
                                  footerLogoUrl: formData.invoiceSettings?.brandingLogos?.footerLogoUrl || '',
                                },
                              },
                            })
                          }
                          className="p-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-xl text-xs border border-red-500/30"
                          title="রিমুভ করুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Invoice Print Main Logo */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-semibold text-white block">
                        খ. ইনভয়েস প্রধান লোগো (Invoice Print Logo)
                      </label>
                      <span className="text-[11px] text-slate-400">
                        প্রিন্ট ও পিডিএফ ক্যাশ মেমোর শীর্ষে প্রদর্শিত হবে
                      </span>
                    </div>
                    {formData.invoiceSettings?.brandingLogos?.invoiceLogoUrl || formData.loginUI.logoUrl ? (
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold rounded-md">
                        যুক্ত আছে
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">No Image</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-16 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center p-1 overflow-hidden shrink-0">
                      {formData.invoiceSettings?.brandingLogos?.invoiceLogoUrl || formData.loginUI.logoUrl ? (
                        <img
                          src={formData.invoiceSettings?.brandingLogos?.invoiceLogoUrl || formData.loginUI.logoUrl}
                          alt="Invoice Logo"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-500 font-bold">INV</span>
                      )}
                    </div>

                    <div className="flex-1 flex flex-wrap items-center gap-2">
                      <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>আপলোড ইনভয়েস লোগো</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e =>
                            handleImageUpload(e, base64 => {
                              setFormData({
                                ...formData,
                                invoiceSettings: {
                                  ...formData.invoiceSettings,
                                  brandingLogos: {
                                    headerLogoUrl: formData.invoiceSettings?.brandingLogos?.headerLogoUrl || '',
                                    invoiceLogoUrl: base64,
                                    watermarkLogoUrl: formData.invoiceSettings?.brandingLogos?.watermarkLogoUrl || '',
                                    footerLogoUrl: formData.invoiceSettings?.brandingLogos?.footerLogoUrl || '',
                                  },
                                },
                              });
                            })
                          }
                        />
                      </label>
                      {formData.invoiceSettings?.brandingLogos?.invoiceLogoUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              invoiceSettings: {
                                ...formData.invoiceSettings,
                                brandingLogos: {
                                  headerLogoUrl: formData.invoiceSettings?.brandingLogos?.headerLogoUrl || '',
                                  invoiceLogoUrl: '',
                                  watermarkLogoUrl: formData.invoiceSettings?.brandingLogos?.watermarkLogoUrl || '',
                                  footerLogoUrl: formData.invoiceSettings?.brandingLogos?.footerLogoUrl || '',
                                },
                              },
                            })
                          }
                          className="p-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-xl text-xs border border-red-500/30"
                          title="রিমুভ করুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Watermark Logo */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-semibold text-white block">
                        গ. ওয়াটারমার্ক লোগো (Invoice Background Watermark)
                      </label>
                      <span className="text-[11px] text-slate-400">
                        ইনভয়েসের ব্যাকগ্রাউন্ডে হাল্কা জলছাপ হিসেবে বসবে
                      </span>
                    </div>
                    {formData.invoiceSettings?.brandingLogos?.watermarkLogoUrl ? (
                      <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold rounded-md">
                        জলছাপ রেডি
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">None</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-16 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center p-1 overflow-hidden shrink-0">
                      {formData.invoiceSettings?.brandingLogos?.watermarkLogoUrl ? (
                        <img
                          src={formData.invoiceSettings?.brandingLogos?.watermarkLogoUrl}
                          alt="Watermark Logo"
                          className="max-h-full max-w-full object-contain opacity-40 grayscale"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-500 font-bold">WM</span>
                      )}
                    </div>

                    <div className="flex-1 flex flex-wrap items-center gap-2">
                      <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>আপলোড ওয়াটারমার্ক লোগো</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e =>
                            handleImageUpload(e, base64 => {
                              setFormData({
                                ...formData,
                                invoiceSettings: {
                                  ...formData.invoiceSettings,
                                  brandingLogos: {
                                    headerLogoUrl: formData.invoiceSettings?.brandingLogos?.headerLogoUrl || '',
                                    invoiceLogoUrl: formData.invoiceSettings?.brandingLogos?.invoiceLogoUrl || '',
                                    watermarkLogoUrl: base64,
                                    footerLogoUrl: formData.invoiceSettings?.brandingLogos?.footerLogoUrl || '',
                                  },
                                },
                              });
                            })
                          }
                        />
                      </label>
                      {formData.invoiceSettings?.brandingLogos?.watermarkLogoUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              invoiceSettings: {
                                ...formData.invoiceSettings,
                                brandingLogos: {
                                  headerLogoUrl: formData.invoiceSettings?.brandingLogos?.headerLogoUrl || '',
                                  invoiceLogoUrl: formData.invoiceSettings?.brandingLogos?.invoiceLogoUrl || '',
                                  watermarkLogoUrl: '',
                                  footerLogoUrl: formData.invoiceSettings?.brandingLogos?.footerLogoUrl || '',
                                },
                              },
                            })
                          }
                          className="p-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-xl text-xs border border-red-500/30"
                          title="রিমুভ করুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. Footer Logo */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-semibold text-white block">
                        ঘ. ফুটার লোগো (Footer / Bottom Logo)
                      </label>
                      <span className="text-[11px] text-slate-400">
                        ইনভয়েসের নিচে ফুটারে প্রদর্শিত হবে
                      </span>
                    </div>
                    {formData.invoiceSettings?.brandingLogos?.footerLogoUrl ? (
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold rounded-md">
                        যুক্ত আছে
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">None</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-16 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center p-1 overflow-hidden shrink-0">
                      {formData.invoiceSettings?.brandingLogos?.footerLogoUrl ? (
                        <img
                          src={formData.invoiceSettings?.brandingLogos?.footerLogoUrl}
                          alt="Footer Logo"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-500 font-bold">FT</span>
                      )}
                    </div>

                    <div className="flex-1 flex flex-wrap items-center gap-2">
                      <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>আপলোড ফুটার লোগো</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e =>
                            handleImageUpload(e, base64 => {
                              setFormData({
                                ...formData,
                                invoiceSettings: {
                                  ...formData.invoiceSettings,
                                  brandingLogos: {
                                    headerLogoUrl: formData.invoiceSettings?.brandingLogos?.headerLogoUrl || '',
                                    invoiceLogoUrl: formData.invoiceSettings?.brandingLogos?.invoiceLogoUrl || '',
                                    watermarkLogoUrl: formData.invoiceSettings?.brandingLogos?.watermarkLogoUrl || '',
                                    footerLogoUrl: base64,
                                  },
                                },
                              });
                            })
                          }
                        />
                      </label>
                      {formData.invoiceSettings?.brandingLogos?.footerLogoUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              invoiceSettings: {
                                ...formData.invoiceSettings,
                                brandingLogos: {
                                  headerLogoUrl: formData.invoiceSettings?.brandingLogos?.headerLogoUrl || '',
                                  invoiceLogoUrl: formData.invoiceSettings?.brandingLogos?.invoiceLogoUrl || '',
                                  watermarkLogoUrl: formData.invoiceSettings?.brandingLogos?.watermarkLogoUrl || '',
                                  footerLogoUrl: '',
                                },
                              },
                            })
                          }
                          className="p-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-xl text-xs border border-red-500/30"
                          title="রিমুভ করুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION B: MASTER SIGNATURE CONTROLLER */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-200 pb-1 border-b border-slate-800/80">
                  <Stamp className="w-4 h-4 text-amber-400" />
                  <span>২. সিগনেচার কন্ট্রোলার (Master Signatures)</span>
                </div>

                {/* 1. Left Signature (বাম পাশের স্বাক্ষর) */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-semibold text-white block">
                        ক. বাম পাশের স্বাক্ষর ও পদবি (Left Signature & Title)
                      </label>
                      <span className="text-[11px] text-slate-400">
                        অনুমোদিত কর্তৃপক্ষ / প্রস্তুতকারী কর্মকর্তার স্বাক্ষর
                      </span>
                    </div>
                    {formData.invoiceSettings.signatureConfig.leftSignatureImage ? (
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold rounded-md">
                        স্বাক্ষর ইমেজ আছে
                      </span>
                    ) : null}
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">পদবি / টেক্সট লেবেল</label>
                    <input
                      type="text"
                      value={
                        formData.invoiceSettings.signatureConfig.leftSignatureLabel ??
                        formData.invoiceSettings.signatureConfig.customerSignatureLabel ??
                        'Authorized Authority'
                      }
                      onChange={e =>
                        setFormData({
                          ...formData,
                          invoiceSettings: {
                            ...formData.invoiceSettings,
                            signatureConfig: {
                              ...formData.invoiceSettings.signatureConfig,
                              leftSignatureLabel: e.target.value,
                              customerSignatureLabel: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Authorized Authority / Customer Signature"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-20 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center p-1 overflow-hidden shrink-0">
                      {formData.invoiceSettings.signatureConfig.leftSignatureImage ? (
                        <img
                          src={formData.invoiceSettings.signatureConfig.leftSignatureImage}
                          alt="Left Sign"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">No image</span>
                      )}
                    </div>

                    <div className="flex-1 flex flex-wrap items-center gap-2">
                      <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>আপলোড স্বাক্ষর (ছবি)</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e =>
                            handleImageUpload(e, base64 => {
                              setFormData({
                                ...formData,
                                invoiceSettings: {
                                  ...formData.invoiceSettings,
                                  signatureConfig: {
                                    ...formData.invoiceSettings.signatureConfig,
                                    leftSignatureImage: base64,
                                  },
                                },
                              });
                            })
                          }
                        />
                      </label>
                      {formData.invoiceSettings.signatureConfig.leftSignatureImage && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              invoiceSettings: {
                                ...formData.invoiceSettings,
                                signatureConfig: {
                                  ...formData.invoiceSettings.signatureConfig,
                                  leftSignatureImage: '',
                                },
                              },
                            })
                          }
                          className="p-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-xl text-xs border border-red-500/30"
                          title="স্বাক্ষর মুছুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Right Signature (ডান পাশের স্বাক্ষর) */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-semibold text-white block">
                        খ. ডান পাশের স্বাক্ষর ও নাম (Right Signature & CEO/Manager)
                      </label>
                      <span className="text-[11px] text-slate-400">
                        সিইও / প্রধান কর্মকর্তার স্বাক্ষর ও সিলমোহর
                      </span>
                    </div>
                    {formData.invoiceSettings.signatureConfig.rightSignatureImage ||
                    formData.invoiceSettings.signatureConfig.ceoSignatureImage ? (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded-md">
                        স্বাক্ষর ইমেজ আছে
                      </span>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">নাম / লেবেল</label>
                      <input
                        type="text"
                        value={
                          formData.invoiceSettings.signatureConfig.rightSignatureLabel ??
                          formData.invoiceSettings.signatureConfig.ceoName
                        }
                        onChange={e =>
                          setFormData({
                            ...formData,
                            invoiceSettings: {
                              ...formData.invoiceSettings,
                              signatureConfig: {
                                ...formData.invoiceSettings.signatureConfig,
                                rightSignatureLabel: e.target.value,
                                ceoName: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="Engineer MD Ariful Islam"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">পদবি (Designation)</label>
                      <input
                        type="text"
                        value={formData.invoiceSettings.signatureConfig.ceoTitle}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            invoiceSettings: {
                              ...formData.invoiceSettings,
                              signatureConfig: {
                                ...formData.invoiceSettings.signatureConfig,
                                ceoTitle: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="Chief Executive Officer"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-20 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center p-1 overflow-hidden shrink-0">
                      {formData.invoiceSettings.signatureConfig.rightSignatureImage ||
                      formData.invoiceSettings.signatureConfig.ceoSignatureImage ? (
                        <img
                          src={
                            formData.invoiceSettings.signatureConfig.rightSignatureImage ||
                            formData.invoiceSettings.signatureConfig.ceoSignatureImage
                          }
                          alt="Right Sign"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">No image</span>
                      )}
                    </div>

                    <div className="flex-1 flex flex-wrap items-center gap-2">
                      <label className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>আপলোড ডান স্বাক্ষর</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e =>
                            handleImageUpload(e, base64 => {
                              setFormData({
                                ...formData,
                                invoiceSettings: {
                                  ...formData.invoiceSettings,
                                  signatureConfig: {
                                    ...formData.invoiceSettings.signatureConfig,
                                    rightSignatureImage: base64,
                                    ceoSignatureImage: base64,
                                  },
                                },
                              });
                            })
                          }
                        />
                      </label>
                      {(formData.invoiceSettings.signatureConfig.rightSignatureImage ||
                        formData.invoiceSettings.signatureConfig.ceoSignatureImage) && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              invoiceSettings: {
                                ...formData.invoiceSettings,
                                signatureConfig: {
                                  ...formData.invoiceSettings.signatureConfig,
                                  rightSignatureImage: '',
                                  ceoSignatureImage: '',
                                },
                              },
                            })
                          }
                          className="p-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-xl text-xs border border-red-500/30"
                          title="স্বাক্ষর মুছুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Middle Signature (মাঝের স্বাক্ষর - Prepared By / Service Engineer) */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-semibold text-white block">
                        গ. মাঝের স্বাক্ষর (Service Engineer / Prepared By)
                      </label>
                      <span className="text-[11px] text-slate-400">
                        ইনভয়েস প্রস্তুতকারী প্রকৌশলী বা কর্মকর্তার স্বাক্ষর ব্লক
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">পদবি / টেক্সট লেবেল</label>
                    <input
                      type="text"
                      value={formData.invoiceSettings.signatureConfig.preparedByLabel}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          invoiceSettings: {
                            ...formData.invoiceSettings,
                            signatureConfig: {
                              ...formData.invoiceSettings.signatureConfig,
                              preparedByLabel: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Authorized Officer / Service Engineer"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Header Layout & Title */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
                <Printer className="w-4 h-4 text-blue-400" />
                <span>Invoice Header & Branding Layout</span>
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Official Invoice Title</label>
                <input
                  type="text"
                  value={formData.invoiceSettings.invoiceTitle}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      invoiceSettings: { ...formData.invoiceSettings, invoiceTitle: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Header Layout Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['modern-banner', 'classic-executive', 'minimal-split', 'corporate-dual'] as HeaderLayout[]).map(layout => (
                    <button
                      key={layout}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          invoiceSettings: { ...formData.invoiceSettings, headerLayout: layout },
                        })
                      }
                      className={`p-2.5 rounded-xl text-[11px] font-bold border transition-all text-center capitalize ${
                        formData.invoiceSettings.headerLayout === layout
                          ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {layout.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Logo Position</label>
                  <select
                    value={formData.invoiceSettings.logoPosition}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        invoiceSettings: { ...formData.invoiceSettings, logoPosition: e.target.value as LogoPosition },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="left">Left Aligned</option>
                    <option value="center">Centered</option>
                    <option value="right">Right Aligned</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Logo Print Size</label>
                  <select
                    value={formData.invoiceSettings.logoSize}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        invoiceSettings: { ...formData.invoiceSettings, logoSize: e.target.value as LogoSize },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="small">Compact (48px)</option>
                    <option value="medium">Standard (64px)</option>
                    <option value="large">Prominent (88px)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.invoiceSettings.showLogo}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        invoiceSettings: { ...formData.invoiceSettings, showLogo: e.target.checked },
                      })
                    }
                    className="rounded border-slate-700 bg-slate-950 text-blue-600"
                  />
                  <span>Show Company Logo on Invoice</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.invoiceSettings.showWatermark}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        invoiceSettings: { ...formData.invoiceSettings, showWatermark: e.target.checked },
                      })
                    }
                    className="rounded border-slate-700 bg-slate-950 text-blue-600"
                  />
                  <span>Enable Payment Status Watermark (PAID / DUE)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.invoiceSettings.dynamicQrEnabled}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        invoiceSettings: { ...formData.invoiceSettings, dynamicQrEnabled: e.target.checked },
                      })
                    }
                    className="rounded border-slate-700 bg-slate-950 text-blue-600"
                  />
                  <span>Dynamic QR Code Validation on Print</span>
                </label>
              </div>
            </div>

            {/* Column 2: Invoice Columns, Tax & Discount Rules */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Columns, Tax & Discount Rules</span>
              </h3>

              <div>
                <p className="text-xs font-semibold text-slate-300 mb-2">Print Columns Visibility</p>
                <div className="space-y-2">
                  <label className="flex items-center justify-between text-xs text-slate-300 p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span>Serial Number (S/N) Column</span>
                    <input
                      type="checkbox"
                      checked={formData.invoiceSettings.showSerialNumber}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          invoiceSettings: { ...formData.invoiceSettings, showSerialNumber: e.target.checked },
                        })
                      }
                      className="rounded text-blue-600 bg-slate-900"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs text-slate-300 p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span>Model / Category Column</span>
                    <input
                      type="checkbox"
                      checked={formData.invoiceSettings.showModelCategory}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          invoiceSettings: { ...formData.invoiceSettings, showModelCategory: e.target.checked },
                        })
                      }
                      className="rounded text-blue-600 bg-slate-900"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs text-slate-300 p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span>Warranty Period Text Column</span>
                    <input
                      type="checkbox"
                      checked={formData.invoiceSettings.showWarranty}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          invoiceSettings: { ...formData.invoiceSettings, showWarranty: e.target.checked },
                        })
                      }
                      className="rounded text-blue-600 bg-slate-900"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Discount Format</label>
                  <select
                    value={formData.invoiceSettings.discountFormat}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        invoiceSettings: { ...formData.invoiceSettings, discountFormat: e.target.value as DiscountFormat },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="fixed">Fixed BDT (৳)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Default VAT Rate (%)</label>
                  <input
                    type="number"
                    value={formData.invoiceSettings.vatPercentage}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        invoiceSettings: { ...formData.invoiceSettings, vatPercentage: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">QR Verification URL Prefix</label>
                <input
                  type="text"
                  value={formData.invoiceSettings.qrVerificationPrefix}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      invoiceSettings: { ...formData.invoiceSettings, qrVerificationPrefix: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Bill To / Ship To Custom Labels</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.invoiceSettings.billToLabel}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        invoiceSettings: { ...formData.invoiceSettings, billToLabel: e.target.value },
                      })
                    }
                    placeholder="Bill To Label"
                    className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                  <input
                    type="text"
                    value={formData.invoiceSettings.shipToLabel}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        invoiceSettings: { ...formData.invoiceSettings, shipToLabel: e.target.value },
                      })
                    }
                    placeholder="Ship To Label"
                    className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Column 3: Signatures & Authority */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
                <FileSignature className="w-4 h-4 text-amber-400" />
                <span>CEO Authorized Signatures & Seals</span>
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">CEO Authorized Signatory</label>
                <input
                  type="text"
                  value={formData.invoiceSettings.signatureConfig.ceoName}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      invoiceSettings: {
                        ...formData.invoiceSettings,
                        signatureConfig: {
                          ...formData.invoiceSettings.signatureConfig,
                          ceoName: e.target.value,
                        },
                      },
                    })
                  }
                  placeholder="Engineer MD Ariful Islam"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">CEO Title / Designation</label>
                <input
                  type="text"
                  value={formData.invoiceSettings.signatureConfig.ceoTitle}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      invoiceSettings: {
                        ...formData.invoiceSettings,
                        signatureConfig: {
                          ...formData.invoiceSettings.signatureConfig,
                          ceoTitle: e.target.value,
                        },
                      },
                    })
                  }
                  placeholder="Chief Executive Officer & Chief Engineer"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Upload Digital Signature Image (Optional)
                </label>
                <div className="flex items-center gap-3">
                  {formData.invoiceSettings.signatureConfig.ceoSignatureImage ? (
                    <div className="w-24 h-12 bg-white rounded-lg p-1 border border-slate-600 flex items-center justify-center">
                      <img
                        src={formData.invoiceSettings.signatureConfig.ceoSignatureImage}
                        alt="Signature"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 italic">No image uploaded (using clean text font)</div>
                  )}

                  <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs cursor-pointer flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Sign</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e =>
                        handleImageUpload(e, base64 => {
                          setFormData({
                            ...formData,
                            invoiceSettings: {
                              ...formData.invoiceSettings,
                              signatureConfig: {
                                ...formData.invoiceSettings.signatureConfig,
                                ceoSignatureImage: base64,
                              },
                            },
                          });
                        })
                      }
                    />
                  </label>

                  {formData.invoiceSettings.signatureConfig.ceoSignatureImage && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          invoiceSettings: {
                            ...formData.invoiceSettings,
                            signatureConfig: {
                              ...formData.invoiceSettings.signatureConfig,
                              ceoSignatureImage: '',
                            },
                          },
                        })
                      }
                      className="text-red-400 hover:text-red-300 text-xs p-1"
                      title="Remove signature image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.invoiceSettings.signatureConfig.showCeoSignature}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        invoiceSettings: {
                          ...formData.invoiceSettings,
                          signatureConfig: {
                            ...formData.invoiceSettings.signatureConfig,
                            showCeoSignature: e.target.checked,
                          },
                        },
                      })
                    }
                    className="rounded border-slate-700 bg-slate-950 text-blue-600"
                  />
                  <span>Show CEO Authorized Signature Block</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.invoiceSettings.signatureConfig.showPreparedBySignature}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        invoiceSettings: {
                          ...formData.invoiceSettings,
                          signatureConfig: {
                            ...formData.invoiceSettings.signatureConfig,
                            showPreparedBySignature: e.target.checked,
                          },
                        },
                      })
                    }
                    className="rounded border-slate-700 bg-slate-950 text-blue-600"
                  />
                  <span>Show Prepared By / Technician Signature Block</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.invoiceSettings.signatureConfig.showCustomerSignature}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        invoiceSettings: {
                          ...formData.invoiceSettings,
                          signatureConfig: {
                            ...formData.invoiceSettings.signatureConfig,
                            showCustomerSignature: e.target.checked,
                          },
                        },
                      })
                    }
                    className="rounded border-slate-700 bg-slate-950 text-blue-600"
                  />
                  <span>Show Customer Acceptance Signature & Seal Block</span>
                </label>
              </div>
            </div>
          </div>

          {/* Bottom Section: Custom Extra Fields & Terms and Conditions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Custom Extra Fields */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>Custom Extra Invoice Fields</span>
                </h3>
                <button
                  type="button"
                  onClick={addExtraField}
                  className="px-3 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Field</span>
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Add enterprise fields such as Engineer Name, Project Name, Delivery Date, Vehicle No., PO Number, etc.
              </p>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {(formData.invoiceSettings?.customExtraFields || []).map((field, idx) => (
                  <div key={field.id} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-3">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={field.label}
                        onChange={e => {
                          const updated = [...(formData.invoiceSettings?.customExtraFields || [])];
                          if (updated[idx]) {
                            updated[idx] = { ...updated[idx], label: e.target.value };
                            setFormData({
                              ...formData,
                              invoiceSettings: { ...formData.invoiceSettings, customExtraFields: updated },
                            });
                          }
                        }}
                        placeholder="Field Name (e.g. Vehicle #)"
                        className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      />
                      <input
                        type="text"
                        value={field.value}
                        onChange={e => {
                          const updated = [...(formData.invoiceSettings?.customExtraFields || [])];
                          if (updated[idx]) {
                            updated[idx] = { ...updated[idx], value: e.target.value };
                            setFormData({
                              ...formData,
                              invoiceSettings: { ...formData.invoiceSettings, customExtraFields: updated },
                            });
                          }
                        }}
                        placeholder="Default Value"
                        className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                    <label className="flex items-center gap-1 text-[11px] text-slate-400">
                      <input
                        type="checkbox"
                        checked={field.showOnPrint}
                        onChange={e => {
                          const updated = [...(formData.invoiceSettings?.customExtraFields || [])];
                          if (updated[idx]) {
                            updated[idx] = { ...updated[idx], showOnPrint: e.target.checked };
                            setFormData({
                              ...formData,
                              invoiceSettings: { ...formData.invoiceSettings, customExtraFields: updated },
                            });
                          }
                        }}
                        className="rounded text-blue-600 bg-slate-900"
                      />
                      <span>Print</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => removeExtraField(field.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms and Conditions (Line-by-line) */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Terms & Conditions & Warranty Policy</span>
                </h3>
                <button
                  type="button"
                  onClick={addTerm}
                  className="px-3 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line</span>
                </button>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {(formData.invoiceSettings?.termsAndConditions || []).map((term, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-xs font-mono text-slate-500 pt-1.5">{idx + 1}.</span>
                    <textarea
                      rows={2}
                      value={term}
                      onChange={e => {
                        const updated = [...(formData.invoiceSettings?.termsAndConditions || [])];
                        if (updated[idx] !== undefined) {
                          updated[idx] = e.target.value;
                          setFormData({
                            ...formData,
                            invoiceSettings: { ...formData.invoiceSettings, termsAndConditions: updated },
                          });
                        }
                      }}
                      className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeTerm(idx)}
                      className="text-red-400 hover:text-red-300 p-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Invoice Footer Note</label>
                <input
                  type="text"
                  value={formData.invoiceSettings.footerText}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      invoiceSettings: { ...formData.invoiceSettings, footerText: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: LOGIN & BRANDING UI ================= */}
      {activeTab === 'login-ui' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Layout className="w-4 h-4 text-blue-400" />
              <span>Login Screen & First Impression Elements</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Application Brand Title</label>
              <input
                type="text"
                value={formData.loginUI.title}
                onChange={e =>
                  setFormData({
                    ...formData,
                    loginUI: { ...formData.loginUI, title: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Subtitle / Department</label>
              <input
                type="text"
                value={formData.loginUI.subtitle}
                onChange={e =>
                  setFormData({
                    ...formData,
                    loginUI: { ...formData.loginUI, subtitle: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Tagline / Mission</label>
              <input
                type="text"
                value={formData.loginUI.tagline}
                onChange={e =>
                  setFormData({
                    ...formData,
                    loginUI: { ...formData.loginUI, tagline: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Welcome Greetings Banner</label>
              <input
                type="text"
                value={formData.loginUI.welcomeGreeting}
                onChange={e =>
                  setFormData({
                    ...formData,
                    loginUI: { ...formData.loginUI, welcomeGreeting: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Login Background Visual Style</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'dark-tech', label: 'Dark Tech Circuit' },
                  { id: 'glassmorphism', label: 'Glassmorphic Blur' },
                  { id: 'clean-corporate', label: 'Clean Corporate Solid' },
                  { id: 'cyber-mesh', label: 'Cyber Gradient Mesh' },
                ].map(style => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        loginUI: { ...formData.loginUI, backgroundStyle: style.id as any },
                      })
                    }
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                      formData.loginUI.backgroundStyle === style.id
                        ? 'bg-blue-600/30 border-blue-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.loginUI.showRoleToggle}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      loginUI: { ...formData.loginUI, showRoleToggle: e.target.checked },
                    })
                  }
                  className="rounded border-slate-700 bg-slate-950 text-blue-600"
                />
                <span>Show CEO vs. Employee Quick Toggle Buttons on Login</span>
              </label>
            </div>
          </div>

          {/* Logo Management */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Custom Logo (Upload / URL)</span>
              </h3>

              <div className="mt-4 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-950/60">
                {formData.loginUI.logoUrl ? (
                  <div className="relative group">
                    <img
                      src={formData.loginUI.logoUrl}
                      alt="Logo Preview"
                      className="h-28 object-contain rounded-xl p-2 bg-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          loginUI: { ...formData.loginUI, logoUrl: '' },
                        })
                      }
                      className="absolute -top-2 -right-2 p-1.5 bg-red-600 text-white rounded-full shadow hover:bg-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-2">
                      <Layout className="w-8 h-8" />
                    </div>
                    <p className="text-xs text-slate-300 font-semibold">No custom logo loaded</p>
                    <p className="text-[11px] text-slate-500">Displays modern "IT" monogram by default</p>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-3">
                  <label className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-2 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Upload Logo Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e =>
                        handleImageUpload(e, base64 => {
                          setFormData({
                            ...formData,
                            loginUI: { ...formData.loginUI, logoUrl: base64 },
                          });
                        })
                      }
                    />
                  </label>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-medium text-slate-300 mb-1">Or paste Logo Direct URL</label>
                <input
                  type="text"
                  value={formData.loginUI.logoUrl}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      loginUI: { ...formData.loginUI, logoUrl: e.target.value },
                    })
                  }
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="p-4 bg-blue-950/30 border border-blue-900/40 rounded-2xl">
              <p className="text-xs text-blue-300 leading-relaxed">
                Tip: Transparent PNG logos with width of 200px to 400px provide optimal clarity on both dark terminals and white printable invoices.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: CONTACTS & CORPORATE NUMBERS ================= */}
      {activeTab === 'contacts' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>All Contact, Hotline & Corporate Numbers (100% Dynamic)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Every phone number and address edited here immediately synchronizes with the login page, top header, and official printed invoice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Company Official Name</label>
              <input
                type="text"
                value={formData.contacts.companyName}
                onChange={e =>
                  setFormData({
                    ...formData,
                    contacts: { ...formData.contacts, companyName: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Primary Contact Number</label>
              <input
                type="text"
                value={formData.contacts.primaryPhone}
                onChange={e =>
                  setFormData({
                    ...formData,
                    contacts: { ...formData.contacts, primaryPhone: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Technical Support Line</label>
              <input
                type="text"
                value={formData.contacts.techSupportPhone}
                onChange={e =>
                  setFormData({
                    ...formData,
                    contacts: { ...formData.contacts, techSupportPhone: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Emergency Hotline (24/7)</label>
              <input
                type="text"
                value={formData.contacts.emergencyHotline}
                onChange={e =>
                  setFormData({
                    ...formData,
                    contacts: { ...formData.contacts, emergencyHotline: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">WhatsApp Support Line</label>
              <input
                type="text"
                value={formData.contacts.whatsAppSupport}
                onChange={e =>
                  setFormData({
                    ...formData,
                    contacts: { ...formData.contacts, whatsAppSupport: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Corporate Email Address</label>
              <input
                type="email"
                value={formData.contacts.emailAddress}
                onChange={e =>
                  setFormData({
                    ...formData,
                    contacts: { ...formData.contacts, emailAddress: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Central Office Address</label>
              <input
                type="text"
                value={formData.contacts.officeAddress}
                onChange={e =>
                  setFormData({
                    ...formData,
                    contacts: { ...formData.contacts, officeAddress: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Website URL</label>
              <input
                type="text"
                value={formData.contacts.websiteUrl}
                onChange={e =>
                  setFormData({
                    ...formData,
                    contacts: { ...formData.contacts, websiteUrl: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">VAT / Tax BIN Number</label>
              <input
                type="text"
                value={formData.contacts.binNumber}
                onChange={e =>
                  setFormData({
                    ...formData,
                    contacts: { ...formData.contacts, binNumber: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Trade License Number</label>
              <input
                type="text"
                value={formData.contacts.tradeLicense}
                onChange={e =>
                  setFormData({
                    ...formData,
                    contacts: { ...formData.contacts, tradeLicense: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: CREDENTIALS & STAFF MANAGEMENT ================= */}
      {activeTab === 'credentials' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CEO Own Credentials Form */}
            <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>CEO Master Credentials (Instant Update)</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Change your CEO User ID, Master Password, Mobile Number, and Authorized Signatory Name at any time.
              </p>

              <form onSubmit={handleUpdateCeoProfile} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">CEO Full Signatory Name</label>
                  <input
                    type="text"
                    required
                    value={ceoForm.name}
                    onChange={e => setCeoForm({ ...ceoForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">CEO User ID *</label>
                    <input
                      type="text"
                      required
                      value={ceoForm.userId}
                      onChange={e => setCeoForm({ ...ceoForm, userId: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Master Password *</label>
                    <input
                      type="text"
                      required
                      value={ceoForm.password}
                      onChange={e => setCeoForm({ ...ceoForm, password: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Mobile / WhatsApp</label>
                    <input
                      type="text"
                      value={ceoForm.mobile}
                      onChange={e => setCeoForm({ ...ceoForm, mobile: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">CEO Official Email</label>
                    <input
                      type="email"
                      value={ceoForm.email}
                      onChange={e => setCeoForm({ ...ceoForm, email: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update CEO Credentials</span>
                </button>
              </form>
            </div>

            {/* Employee / Staff Accounts Directory */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-blue-400" />
                  <span>Staff & Employee Accounts</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Staff Account</span>
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {usersList.filter(u => u.role === 'EMPLOYEE').length === 0 ? (
                  <div className="p-8 text-center text-slate-500 bg-slate-950/50 rounded-2xl">
                    <p className="text-xs">No employee accounts created yet.</p>
                    <p className="text-[11px] mt-1">Click "New Staff Account" to authorize a technician.</p>
                  </div>
                ) : (
                  usersList.filter(u => u.role === 'EMPLOYEE').map(emp => (
                    <div key={emp.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{emp.name}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                              ID: {emp.userId}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{emp.designation} • {emp.mobile}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteStaff(emp.id)}
                          className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-slate-800 transition-colors"
                          title="Delete staff"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Password & Permissions summary */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px]">
                        <span className="text-slate-500 font-mono">Pass: {emp.password}</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${emp.permissions?.canApplyDiscount ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                            {emp.permissions?.canApplyDiscount ? 'Discount Allowed' : 'No Discount'}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] ${emp.permissions?.canEditProductPrice ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'}`}>
                            {emp.permissions?.canEditProductPrice ? 'Edit Price' : 'Fixed Price'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-400" />
              <span>Provision New Employee / Staff</span>
            </h3>

            <form onSubmit={handleCreateStaff} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Staff Full Name *</label>
                <input
                  type="text"
                  required
                  value={newStaff.name}
                  onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                  placeholder="e.g. Md. Hasan Ali"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Staff User ID *</label>
                  <input
                    type="text"
                    required
                    value={newStaff.userId}
                    onChange={e => setNewStaff({ ...newStaff, userId: e.target.value })}
                    placeholder="hasan01"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Password *</label>
                  <input
                    type="text"
                    required
                    value={newStaff.password}
                    onChange={e => setNewStaff({ ...newStaff, password: e.target.value })}
                    placeholder="tech123"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Designation</label>
                  <input
                    type="text"
                    value={newStaff.designation}
                    onChange={e => setNewStaff({ ...newStaff, designation: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Mobile No</label>
                  <input
                    type="text"
                    value={newStaff.mobile}
                    onChange={e => setNewStaff({ ...newStaff, mobile: e.target.value })}
                    placeholder="+880 18..."
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                  Access Permissions (Employee Restraints)
                </p>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newStaff.canCreateInvoice}
                    onChange={e => setNewStaff({ ...newStaff, canCreateInvoice: e.target.checked })}
                    className="rounded text-blue-600 bg-slate-900"
                  />
                  <span>Can Create Invoices</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newStaff.canScanBarcode}
                    onChange={e => setNewStaff({ ...newStaff, canScanBarcode: e.target.checked })}
                    className="rounded text-blue-600 bg-slate-900"
                  />
                  <span>Can Use Barcode Scanner</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newStaff.canApplyDiscount}
                    onChange={e => setNewStaff({ ...newStaff, canApplyDiscount: e.target.checked })}
                    className="rounded text-blue-600 bg-slate-900"
                  />
                  <span>Permit Applying Custom Discounts</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= TAB 5: 100+ THEMES & TYPOGRAPHY ================= */}
      {activeTab === 'theme-typography' && (
        <div className="space-y-6">
          {/* Typography Engine */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Type className="w-4 h-4 text-purple-400" />
              <span>Typography Engine (English & Bangla Google Fonts)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  English Font Family (Display & UI)
                </label>
                <select
                  value={formData.typography.englishFont}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      typography: { ...formData.typography, englishFont: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                >
                  {GOOGLE_FONTS_EN.map(f => (
                    <option key={f.id || f.family || f.name} value={f.family}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Bangla Font Family (বাংলা ফন্ট)
                </label>
                <select
                  value={formData.typography.banglaFont}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      typography: { ...formData.typography, banglaFont: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                >
                  {GOOGLE_FONTS_BN.map(f => (
                    <option key={f.id || f.family || f.name} value={f.family}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 100+ Theme Color Palettes Engine */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-blue-400" />
                  <span>100+ Curated Theme Color Palettes</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Select any palette for instant live preview and flawless synchronization with the Printed Invoice & PDF.
                </p>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedThemeCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedThemeCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Palettes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredThemes.map(palette => {
                const isSelected = formData.activeThemeId === palette.id;
                return (
                  <button
                    key={palette.id}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, activeThemeId: palette.id });
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                      isSelected
                        ? 'border-blue-400 bg-slate-800/90 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-8 h-8 rounded-xl shadow-md flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ backgroundColor: palette.primary }}
                      >
                        IT
                      </div>
                      <div className="flex-1 flex gap-1">
                        <div className="h-6 flex-1 rounded-md" style={{ backgroundColor: palette.primary }} />
                        <div className="h-6 w-4 rounded-md" style={{ backgroundColor: palette.accent }} />
                      </div>
                    </div>

                    <p className="text-xs font-bold text-white truncate">{palette.name}</p>
                    <p className="text-[10px] text-slate-400">{palette.category}</p>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px]">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 6: BACKUP & DATA MANAGEMENT ================= */}
      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Export System Backup (JSON)</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export all system configurations, 100% customized printed invoice layouts, staff credentials, product catalog, and invoice sales logs into a portable JSON backup file.
            </p>
            <button
              type="button"
              onClick={() => {
                const json = exportSystemBackup();
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `intelligent-technician-backup-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
              }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <Database className="w-4 h-4" />
              <span>Download Full Backup JSON</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Upload className="w-4 h-4 text-blue-400" />
              <span>Restore System from JSON</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload a previously exported JSON backup file to instantly restore all settings, credentials, products, and sales logs.
            </p>
            <label className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>Import Backup JSON File</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = event => {
                      const text = event.target?.result as string;
                      if (importSystemBackup(text)) {
                        alert('System restored successfully! Refreshing...');
                        window.location.reload();
                      } else {
                        alert('Invalid backup JSON file.');
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
