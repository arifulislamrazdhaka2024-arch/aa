import { SystemConfig, UserAccount, Product, Invoice } from '../types';
import { DEFAULT_SYSTEM_CONFIG, INITIAL_PRODUCTS, THEME_PALETTES } from '../data/initialData';

const STORAGE_KEYS = {
  CONFIG: 'inteltech_config_v2',
  USERS: 'inteltech_users_v2',
  PRODUCTS: 'inteltech_products_v2',
  INVOICES: 'inteltech_invoices_v2',
  SESSION: 'inteltech_session_v2',
};

// Helper to deep merge system configuration ensuring all nested objects and arrays exist
export function deepMergeConfig(base: SystemConfig, override: any): SystemConfig {
  if (!override || typeof override !== 'object') return base;
  return {
    ...base,
    ...override,
    loginUI: {
      ...base.loginUI,
      ...(override.loginUI || {}),
    },
    contacts: {
      ...base.contacts,
      ...(override.contacts || {}),
    },
    invoiceSettings: {
      ...base.invoiceSettings,
      ...(override.invoiceSettings || {}),
      signatureConfig: {
        ...base.invoiceSettings?.signatureConfig,
        ...(override.invoiceSettings?.signatureConfig || {}),
      },
      brandingLogos: {
        headerLogoUrl: '',
        invoiceLogoUrl: '',
        watermarkLogoUrl: '',
        footerLogoUrl: '',
        ...(base.invoiceSettings?.brandingLogos || {}),
        ...(override.invoiceSettings?.brandingLogos || {}),
      },
      customExtraFields: Array.isArray(override.invoiceSettings?.customExtraFields)
        ? override.invoiceSettings.customExtraFields
        : (base.invoiceSettings?.customExtraFields || []),
      termsAndConditions: Array.isArray(override.invoiceSettings?.termsAndConditions)
        ? override.invoiceSettings.termsAndConditions
        : (base.invoiceSettings?.termsAndConditions || []),
    },
    typography: {
      ...base.typography,
      ...(override.typography || {}),
    },
  };
}

// System Configuration
export function loadSystemConfig(): SystemConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) return DEFAULT_SYSTEM_CONFIG;
    const parsed = JSON.parse(raw);
    return deepMergeConfig(DEFAULT_SYSTEM_CONFIG, parsed);
  } catch (e) {
    console.error('Failed to load system config, falling back to defaults', e);
    return DEFAULT_SYSTEM_CONFIG;
  }
}

export function saveSystemConfig(config: SystemConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    applyThemeAndTypography(config);
  } catch (e) {
    console.error('Failed to save system config', e);
  }
}

// User Accounts
export function loadUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load users', e);
    return [];
  }
}

export function saveUsers(users: UserAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users', e);
  }
}

// Session
export function getStoredSession(): UserAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function saveSession(user: UserAccount | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  } catch (e) {
    console.error('Failed to save session', e);
  }
}

// Products / Inventory
export function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_PRODUCTS;
  }
}

export function saveProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save products', e);
  }
}

// Invoices
export function loadInvoices(): Invoice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveInvoices(invoices: Invoice[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  } catch (e) {
    console.error('Failed to save invoices', e);
  }
}

export function applyTheme(themeId: string): void {
  const currentConfig = loadSystemConfig();
  applyThemeAndTypography({ ...currentConfig, activeThemeId: themeId });
}

// Dynamic Theme & Typography Injection
export function applyThemeAndTypography(config: SystemConfig): void {
  const theme = THEME_PALETTES.find(t => t.id === config.activeThemeId) || THEME_PALETTES[0];
  const root = document.documentElement;

  // Apply CSS Variables
  root.style.setProperty('--brand-primary', theme.primary);
  root.style.setProperty('--brand-primary-hover', theme.hover);
  root.style.setProperty('--brand-accent', theme.accent);
  root.style.setProperty('--brand-light', theme.light);
  root.style.setProperty('--brand-text-on-primary', theme.textOnPrimary);

  // Apply Enterprise Theme Classes on body
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
  const activeEnterpriseTheme = config.enterpriseTheme || 'theme-dark';
  document.body.classList.add(activeEnterpriseTheme);
  try {
    localStorage.setItem('selectedTheme', activeEnterpriseTheme);
  } catch (e) {
    // ignore
  }

  // Apply Fonts
  const isBangla = config.language === 'bn';
  const targetFont =
    config.activeFontFamily ||
    (isBangla ? config.typography.banglaFont : config.typography.englishFont);

  root.style.setProperty('--app-font', targetFont);
  root.style.setProperty('--font-active', targetFont);
  document.body.style.fontFamily = targetFont;
  try {
    localStorage.setItem('selectedFont', targetFont);
  } catch (e) {
    // ignore
  }
}

// Backup & Restore
export function exportSystemBackup(): string {
  const payload = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    config: loadSystemConfig(),
    users: loadUsers(),
    products: loadProducts(),
    invoices: loadInvoices(),
  };
  return JSON.stringify(payload, null, 2);
}

export function importSystemBackup(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.config) saveSystemConfig(data.config);
    if (data.users && Array.isArray(data.users)) saveUsers(data.users);
    if (data.products && Array.isArray(data.products)) saveProducts(data.products);
    if (data.invoices && Array.isArray(data.invoices)) saveInvoices(data.invoices);
    return true;
  } catch (e) {
    console.error('Failed to parse backup JSON', e);
    return false;
  }
}
