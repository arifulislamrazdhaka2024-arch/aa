export interface EnterpriseThemeOption {
  id:
    | 'theme-dark'
    | 'theme-light'
    | 'theme-corporate'
    | 'theme-emerald'
    | 'theme-gold'
    | 'theme-cyberpunk'
    | 'theme-purple'
    | 'theme-midnight';
  name: string;
  banglaName: string;
  bg: string;
  card: string;
  accent: string;
  text: string;
  border: string;
}

export const ENTERPRISE_THEMES: EnterpriseThemeOption[] = [
  {
    id: 'theme-dark',
    name: 'Dark Minimalist (Default)',
    banglaName: 'ডার্ক মিনিমালিস্ট (ডিফল্ট)',
    bg: '#0b0f19',
    card: '#151c2c',
    accent: '#2563eb',
    text: '#f8fafc',
    border: '#1e293b',
  },
  {
    id: 'theme-light',
    name: 'Clean Soft Light',
    banglaName: 'ক্লিন সফট লাইট',
    bg: '#f8fafc',
    card: '#ffffff',
    accent: '#2563eb',
    text: '#0f172a',
    border: '#e2e8f0',
  },
  {
    id: 'theme-corporate',
    name: 'Corporate Executive Blue',
    banglaName: 'কর্পোরেট এক্সিকিউটিভ ব্লু',
    bg: '#0f172a',
    card: '#1e293b',
    accent: '#0284c7',
    text: '#f0f9ff',
    border: '#1e293b',
  },
  {
    id: 'theme-emerald',
    name: 'Emerald Green Business',
    banglaName: 'এমারেল্ড গ্রিন বিজনেস',
    bg: '#022c22',
    card: '#064e3b',
    accent: '#10b981',
    text: '#ecfdf5',
    border: '#047857',
  },
  {
    id: 'theme-gold',
    name: 'Royal Luxury Gold',
    banglaName: 'রয়্যাল লাক্সারি গোল্ড',
    bg: '#1c1917',
    card: '#292524',
    accent: '#d97706',
    text: '#fef3c7',
    border: '#44403c',
  },
  {
    id: 'theme-cyberpunk',
    name: 'Cyberpunk Neon Night',
    banglaName: 'সাইবারপাঙ্ক নিয়ন নাইট',
    bg: '#180828',
    card: '#2d0b5a',
    accent: '#f43f5e',
    text: '#fce7f3',
    border: '#4c1d95',
  },
  {
    id: 'theme-purple',
    name: 'Royal Purple VIP',
    banglaName: 'রয়্যাল পার্পল ভিআইপি',
    bg: '#1e1b4b',
    card: '#312e81',
    accent: '#8b5cf6',
    text: '#f5f3ff',
    border: '#4338ca',
  },
  {
    id: 'theme-midnight',
    name: 'Midnight Super AMOLED',
    banglaName: 'মিডনাইট সুপার অ্যামোলেড',
    bg: '#000000',
    card: '#111111',
    accent: '#f43f5e',
    text: '#ffffff',
    border: '#222222',
  },
];

export interface EnterpriseFontOption {
  value: string;
  label: string;
  category: 'Universal' | 'Bangla' | 'English';
}

export const ENTERPRISE_FONTS: EnterpriseFontOption[] = [
  // Bangla Fonts
  {
    value: "'Hind Siliguri', sans-serif",
    label: "Hind Siliguri (ডিফল্ট প্রফেশনাল)",
    category: 'Bangla',
  },
  {
    value: "'SolaimanLipi', sans-serif",
    label: "SolaimanLipi (সোলাইমান লিপি)",
    category: 'Bangla',
  },
  {
    value: "'Anek Bangla', sans-serif",
    label: "Anek Bangla (আধুনিক বোল্ড)",
    category: 'Bangla',
  },
  {
    value: "'Kalpurush', sans-serif",
    label: "Kalpurush (কালপুরুষ)",
    category: 'Bangla',
  },
  {
    value: "'Noto Serif Bengali', serif",
    label: "Noto Serif Bengali (ক্লাসিক ক্লাসিক্যাল)",
    category: 'Bangla',
  },
  {
    value: "'Baloo Da 2', cursive",
    label: "Baloo Da 2 (স্টাইলিশ)",
    category: 'Bangla',
  },
  {
    value: "'Galada', cursive",
    label: "Galada (হেডিং ফন্ট)",
    category: 'Bangla',
  },
  {
    value: "'Mina', sans-serif",
    label: "Mina (ক্লিন লুক)",
    category: 'Bangla',
  },
  {
    value: "'Noto Sans Bengali', sans-serif",
    label: "Noto Sans Bengali (বাংলা প্রমিত)",
    category: 'Bangla',
  },
  {
    value: "'Atma', cursive",
    label: "Atma (আটমা ফন্ট)",
    category: 'Bangla',
  },
  // English Fonts
  {
    value: "'Inter', sans-serif",
    label: "Inter (Modern UI)",
    category: 'English',
  },
  {
    value: "'Poppins', sans-serif",
    label: "Poppins (Clean Corporate)",
    category: 'English',
  },
  {
    value: "'Roboto', sans-serif",
    label: "Roboto (Standard)",
    category: 'English',
  },
  {
    value: "'Montserrat', sans-serif",
    label: "Montserrat (Bold Header)",
    category: 'English',
  },
  {
    value: "'Lato', sans-serif",
    label: "Lato (Clean Corporate)",
    category: 'English',
  },
  // Universal
  {
    value: "'Inter', 'Hind Siliguri', sans-serif",
    label: "Dual Hybrid (Inter + Hind Siliguri)",
    category: 'Universal',
  },
];

export interface EnterpriseFeatureItem {
  id: string;
  index: number;
  title: string;
  banglaTitle: string;
  category: 'Sales' | 'Accounting' | 'Inventory' | 'Automation' | 'Security' | 'Print';
  defaultEnabled: boolean;
}

// 20 Core Feature archetypes repeated across enterprise operations to construct the full 100 matrix
const BASE_FEATURE_PATTERNS = [
  { title: "Auto SMS Notification", bangla: "অটো এসএমএস নোটিফিকেশন", category: "Automation" as const },
  { title: "Email Invoice Sender", bangla: "ইমেইল ইনভয়েস সেন্ডার", category: "Automation" as const },
  { title: "Inventory Stock Sync", bangla: "ইনভেন্টরি স্টক সিঙ্ক", category: "Inventory" as const },
  { title: "Customer Credit Limit", bangla: "কাস্টমার ক্রেডিট লিমিট", category: "Accounting" as const },
  { title: "Payment Gateway (bKash/Nagad)", bangla: "পেমেন্ট গেটওয়ে (bkash/Nagad)", category: "Accounting" as const },
  { title: "Print Preview Mode", bangla: "প্রিন্ট প্রিভিউ মোড", category: "Print" as const },
  { title: "PDF Download Lock", bangla: "পিডিএফ ডাউনলোড লক", category: "Security" as const },
  { title: "Delivery Tracking Code", bangla: "ডেলিভারি ট্র্যাকিং কোড", category: "Sales" as const },
  { title: "Multi-Branch Sync", bangla: "মাল্টি-ব্রাঞ্চ সিঙ্ক", category: "Inventory" as const },
  { title: "Employee Access Permission", bangla: "এমপ্লয়ী অ্যাক্সেস পারমিশন", category: "Security" as const },
  { title: "Invoice Backup (Google Drive)", bangla: "ইনভয়েস ব্যাকআপ (Google Drive)", category: "Automation" as const },
  { title: "Archive System", bangla: "আর্কাইভ সিস্টেম", category: "Sales" as const },
  { title: "Live Chat Widget", bangla: "লাইভ চ্যাট উইজেট", category: "Sales" as const },
  { title: "Custom Watermark Text", bangla: "কাস্টম ওয়াটারমার্ক টেক্সট", category: "Print" as const },
  { title: "Past Due Reminder", bangla: "পাস্ট ডিউ রিমাইন্ডার", category: "Accounting" as const },
  { title: "Auto Currency Converter", bangla: "অটো কারেন্সি কনভার্টার", category: "Accounting" as const },
  { title: "Invoice Notes & Terms", bangla: "ইনভয়েস নোটস ও শর্তাবলী", category: "Sales" as const },
  { title: "Special VAT/Tax Calculator", bangla: "স্পেশাল ট্যাক্স ক্যালকুলেটর", category: "Accounting" as const },
  { title: "Digital Seal (Stamp) Option", bangla: "ডিজিটাল সিল (Stamp) অপশন", category: "Print" as const },
  { title: "Thermal POS Printer Mode", bangla: "থার্মাল প্রিন্টার মোড", category: "Print" as const },
];

export const ENTERPRISE_100_FEATURES: EnterpriseFeatureItem[] = [];

for (let batch = 1; batch <= 5; batch++) {
  BASE_FEATURE_PATTERNS.forEach((base, idx) => {
    const itemIndex = (batch - 1) * 20 + idx + 1;
    if (itemIndex <= 100) {
      const suffix = batch > 1 ? ` (Level ${batch})` : '';
      const bnSuffix = batch > 1 ? ` (স্তর ${batch})` : '';
      ENTERPRISE_100_FEATURES.push({
        id: `feature_${batch}_${idx}`,
        index: itemIndex,
        title: `${base.title}${suffix}`,
        banglaTitle: `${base.bangla}${bnSuffix}`,
        category: base.category,
        defaultEnabled: itemIndex % 2 !== 0, // balanced defaults
      });
    }
  });
}

export function getDefault100FeaturesState(): Record<string, boolean> {
  const map: Record<string, boolean> = {};
  ENTERPRISE_100_FEATURES.forEach(f => {
    map[f.id] = f.defaultEnabled;
  });
  return map;
}
