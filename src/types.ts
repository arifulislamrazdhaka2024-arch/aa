export type UserRole = 'CEO' | 'EMPLOYEE';

export interface EmployeePermissions {
  canCreateInvoice: boolean;
  canScanBarcode: boolean;
  canApplyDiscount: boolean;
  canViewLogs: boolean;
  canEditProductPrice: boolean;
}

export interface UserAccount {
  id: string;
  userId: string;
  name: string;
  email: string;
  mobile: string;
  password: string; // Plain/hashed simulation for localStorage enterprise control
  role: UserRole;
  designation: string;
  createdAt: string;
  permissions?: EmployeePermissions;
  avatarUrl?: string;
}

export type BackgroundStyle = 'glassmorphism' | 'dark-tech' | 'clean-corporate' | 'cyber-mesh';

export interface LoginUIConfig {
  logoUrl: string;
  title: string;
  subtitle: string;
  tagline: string;
  backgroundStyle: BackgroundStyle;
  welcomeGreeting: string;
  showRoleToggle: boolean;
  defaultRole: UserRole;
}

export interface CorporateContacts {
  companyName: string;
  primaryPhone: string;
  techSupportPhone: string;
  emergencyHotline: string;
  whatsAppSupport: string;
  emailAddress: string;
  officeAddress: string;
  websiteUrl: string;
  binNumber: string;
  tradeLicense: string;
}

export type HeaderLayout = 'modern-banner' | 'classic-executive' | 'minimal-split' | 'corporate-dual';
export type LogoPosition = 'left' | 'center' | 'right';
export type LogoSize = 'small' | 'medium' | 'large';
export type DiscountFormat = 'fixed' | 'percentage';
export type WatermarkStatus = 'PAID' | 'DUE' | 'PARTIAL' | 'CANCELLED' | 'NONE';

export interface CustomExtraField {
  id: string;
  label: string;
  value: string;
  enabled: boolean;
  showOnPrint: boolean;
}

export interface InvoiceBottomNote {
  id: string;
  title: string;
  content: string;
}

export interface BrandingLogos {
  headerLogoUrl: string;       // Menu & Header & Profile Logo
  invoiceLogoUrl: string;      // Main Invoice Print Logo
  watermarkLogoUrl: string;    // PDF / Print Watermark Logo
  footerLogoUrl: string;       // Footer / Bottom Logo
}

export interface SignatureConfig {
  ceoName: string;
  ceoTitle: string;
  ceoSignatureImage?: string; // base64 or url
  showCeoSignature: boolean;
  showCustomerSignature: boolean;
  customerSignatureLabel: string;
  showPreparedBySignature: boolean;
  preparedByLabel: string;
  // Left and Right custom signatures for flexible invoice layouts
  leftSignatureLabel?: string;  // e.g., "Authorized Authority" or customer/officer
  rightSignatureLabel?: string; // e.g., "CEO / Manager"
  leftSignatureImage?: string;
  rightSignatureImage?: string;
}

export interface InvoiceCustomization {
  invoiceTitle: string;
  headerLayout: HeaderLayout;
  logoPosition: LogoPosition;
  logoSize: LogoSize;
  showLogo: boolean;
  billToLabel: string;
  shipToLabel: string;
  showSerialNumber: boolean;
  showModelCategory: boolean;
  showWarranty: boolean;
  showBrand: boolean;
  discountFormat: DiscountFormat;
  defaultDiscountValue: number;
  vatPercentage: number;
  aitPercentage: number;
  showVatCalculation: boolean;
  showAitCalculation: boolean;
  showWatermark: boolean;
  dynamicQrEnabled: boolean;
  qrVerificationPrefix: string;
  termsAndConditions: string[];
  footerText: string;
  signatureConfig: SignatureConfig;
  customExtraFields: CustomExtraField[];
  brandingLogos?: BrandingLogos;
  watermarkOpacity?: number; // percentage 5-50%
  watermarkText?: string;
  showFooterLogo?: boolean;
  showDigitalSignature?: boolean;
  glassmorphismEnabled?: boolean;
  dualCurrencyEnabled?: boolean;
  barcodeScannerSupport?: boolean;
}

export interface ThemePalette {
  id: string;
  name: string;
  category: 'Corporate' | 'Executive' | 'Cyber' | 'Royal' | 'Nature' | 'Vibrant' | 'Minimal' | 'Prestige';
  primary: string;
  hover: string;
  light: string;
  accent: string;
  textOnPrimary: string;
}

export interface TypographyConfig {
  englishFont: string;
  banglaFont: string;
  fontSize: 'compact' | 'normal' | 'large';
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  unitPrice: number;
  stockCount: number;
  warrantyPeriod: string; // e.g. "1 Year Official Warranty", "6 Months Replacement"
  serialNumbers: string[];
  imageUrl?: string;
  description?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  productId?: string;
  productName: string;
  category: string;
  model: string;
  serialNumber: string;
  warranty: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  dueDate: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  customerDeliveryAddress?: string;
  createdByUserId: string;
  createdByName: string;
  createdByRole: UserRole;
  items: InvoiceItem[];
  subtotal: number;
  discountType: DiscountFormat;
  discountValue: number;
  discountAmount: number;
  vatPercentage: number;
  vatAmount: number;
  aitPercentage: number;
  aitAmount: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: WatermarkStatus;
  paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer' | 'Cheque' | 'Credit Card';
  extraFields: Record<string, string>; // fieldId -> value
  bottomNotes: InvoiceBottomNote[];
  notes?: string;
  qrPayload: string;
}

export interface SystemConfig {
  isInitialized: boolean;
  loginUI: LoginUIConfig;
  contacts: CorporateContacts;
  invoiceSettings: InvoiceCustomization;
  activeThemeId: string;
  typography: TypographyConfig;
  language: 'en' | 'bn';
  enterpriseTheme?:
    | 'theme-dark'
    | 'theme-light'
    | 'theme-corporate'
    | 'theme-emerald'
    | 'theme-gold'
    | 'theme-cyberpunk'
    | 'theme-purple'
    | 'theme-midnight';
  activeFontFamily?: string;
  darkLightToggleEnabled?: boolean;
  systemFeatures100?: Record<string, boolean>;
}
