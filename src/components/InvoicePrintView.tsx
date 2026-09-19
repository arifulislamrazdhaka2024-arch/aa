import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  Printer,
  Download,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Building,
  Phone,
  Mail,
  Globe,
  MapPin,
} from 'lucide-react';
import { Invoice, SystemConfig, ThemePalette } from '../types';
import { THEME_PALETTES } from '../data/initialData';

interface InvoicePrintViewProps {
  invoice: Invoice;
  config: SystemConfig;
  onBack: () => void;
  language: 'en' | 'bn';
}

export const InvoicePrintView: React.FC<InvoicePrintViewProps> = ({
  invoice,
  config,
  onBack,
  language,
}) => {
  const { invoiceSettings, contacts, activeThemeId } = config;
  const currentTheme = THEME_PALETTES.find(t => t.id === activeThemeId) || THEME_PALETTES[0];
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Generate dynamic QR verification data
  useEffect(() => {
    const payload = `${invoiceSettings.qrVerificationPrefix || 'https://intelligenttechnician.bd/verify?inv='}${invoice.invoiceNumber}&total=${invoice.grandTotal}&status=${invoice.paymentStatus}&client=${encodeURIComponent(invoice.customerName)}`;
    QRCode.toDataURL(payload, {
      width: 140,
      margin: 1,
      color: {
        dark: currentTheme.primary,
        light: '#ffffff',
      },
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR generation error:', err));
  }, [invoice, invoiceSettings, currentTheme]);

  const handlePrint = () => {
    window.print();
  };

  // Watermark styling
  const getWatermarkBadge = () => {
    const watermarkImg = invoiceSettings.brandingLogos?.watermarkLogoUrl;

    if (!invoiceSettings.showWatermark && !watermarkImg) return null;

    const styles: Record<string, { label: string; color: string; border: string; bg: string }> = {
      PAID: { label: 'PAID & VERIFIED', color: '#16a34a', border: '#22c55e', bg: 'rgba(34, 197, 94, 0.08)' },
      DUE: { label: 'PAYMENT DUE', color: '#dc2626', border: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)' },
      PARTIAL: { label: 'PARTIALLY PAID', color: '#d97706', border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' },
      CANCELLED: { label: 'CANCELLED / VOID', color: '#64748b', border: '#94a3b8', bg: 'rgba(148, 163, 184, 0.08)' },
    };

    const s = styles[invoice.paymentStatus] || styles.PAID;
    const opacityVal = (invoiceSettings.watermarkOpacity ?? 15) / 100;

    return (
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0 select-none">
        {/* Custom PDF Watermark Logo if configured */}
        {watermarkImg && invoiceSettings.showWatermark && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none p-12"
            style={{ opacity: opacityVal }}
          >
            <img
              src={watermarkImg}
              alt="Watermark Logo"
              className="max-h-[380px] max-w-[380px] object-contain grayscale"
            />
          </div>
        )}

        {/* Text Status Stamp (if status is not NONE and showWatermark is true) */}
        {invoiceSettings.showWatermark && invoice.paymentStatus !== 'NONE' && (
          <div
            className="transform -rotate-25 border-8 border-dashed rounded-3xl px-12 py-5 text-center font-black tracking-widest text-4xl sm:text-6xl uppercase"
            style={{
              color: s.color,
              borderColor: s.border,
              backgroundColor: s.bg,
              opacity: opacityVal,
            }}
          >
            {s.label}
          </div>
        )}
      </div>
    );
  };

  // Invoice Logo Helper (prefers dedicated invoiceLogoUrl, falls back to loginUI.logoUrl)
  const invoiceLogo = invoiceSettings.brandingLogos?.invoiceLogoUrl || config.loginUI.logoUrl;
  const footerLogo = invoiceSettings.brandingLogos?.footerLogoUrl;

  return (
    <div className="min-h-screen bg-slate-950 py-6 px-3 sm:px-6 flex flex-col items-center">
      {/* Print / Action Control Toolbar (Hidden when printing via .no-print) */}
      <div className="no-print w-full max-w-4xl mb-6 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'bn' ? 'ফিরে যান' : 'Back to Editor'}</span>
          </button>

          <span className="text-xs text-slate-400 font-mono">
            {invoice.invoiceNumber}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'bn' ? 'অফিসিয়াল ইনভয়েস প্রিন্ট করুন' : 'Print Official Invoice / PDF'}</span>
          </button>
        </div>
      </div>

      {/* ================= INVOICE PAPER CANVAS (#print-area) ================= */}
      <div
        id="print-area"
        className="relative w-full max-w-4xl bg-white text-slate-900 shadow-2xl rounded-none sm:rounded-2xl p-6 sm:p-10 border border-slate-200 min-h-[1050px] flex flex-col justify-between"
      >
        {/* Payment Watermark Overlay */}
        {getWatermarkBadge()}

        {/* TOP HEADER SECTION */}
        <div className="relative z-10">
          {/* Layout Variant 1: Modern Banner */}
          {invoiceSettings.headerLayout === 'modern-banner' && (
            <div
              className="p-6 rounded-2xl text-white mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
              style={{ backgroundColor: currentTheme.primary }}
            >
              <div className="flex items-center gap-4">
                {invoiceSettings.showLogo && invoiceLogo && (
                  <div className="bg-white p-1.5 rounded-xl flex items-center justify-center max-w-[80px] max-h-[80px]">
                    <img src={invoiceLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight">{contacts.companyName}</h1>
                  <p className="text-xs opacity-90 font-medium mt-0.5">{contacts.officeAddress}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] opacity-80 mt-1 font-mono">
                    <span>Tel: {contacts.primaryPhone}</span>
                    <span>Support: {contacts.techSupportPhone}</span>
                    <span>Web: {contacts.websiteUrl}</span>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right flex flex-col sm:items-end">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 text-white mb-1">
                  OFFICIAL TAX INVOICE
                </span>
                <span className="text-lg font-black font-mono tracking-wider">{invoice.invoiceNumber}</span>
                <span className="text-xs opacity-80 font-mono">Date: {new Date(invoice.createdAt).toLocaleDateString('en-GB')}</span>
              </div>
            </div>
          )}

          {/* Layout Variant 2: Classic Executive */}
          {invoiceSettings.headerLayout === 'classic-executive' && (
            <div className="border-b-2 pb-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ borderColor: currentTheme.primary }}>
              <div className="flex items-center gap-4">
                {invoiceSettings.showLogo && invoiceLogo && (
                  <div className="p-1 rounded flex items-center justify-center max-w-[80px]">
                    <img src={invoiceLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-black uppercase tracking-tight" style={{ color: currentTheme.primary }}>
                    {contacts.companyName}
                  </h1>
                  <p className="text-xs text-slate-600">{contacts.officeAddress}</p>
                  <p className="text-xs text-slate-500 font-mono">Hotline: {contacts.primaryPhone} | Email: {contacts.emailAddress}</p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <h2 className="text-lg font-black tracking-wider uppercase" style={{ color: currentTheme.primary }}>
                  {invoiceSettings.invoiceTitle}
                </h2>
                <p className="text-sm font-bold font-mono text-slate-800">INV #: {invoice.invoiceNumber}</p>
                <p className="text-xs text-slate-500">Issued: {new Date(invoice.createdAt).toLocaleDateString('en-GB')}</p>
              </div>
            </div>
          )}

          {/* Layout Variant 3: Minimal Split */}
          {(invoiceSettings.headerLayout === 'minimal-split' || invoiceSettings.headerLayout === 'corporate-dual') && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200">
              <div className="flex items-center gap-4">
                {invoiceSettings.showLogo && invoiceLogo && (
                  <div className="p-1 rounded flex items-center justify-center max-w-[70px]">
                    <img src={invoiceLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-black tracking-tight" style={{ color: currentTheme.primary }}>
                    {contacts.companyName}
                  </h1>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm">{contacts.officeAddress}</p>
                  <p className="text-xs text-slate-500 font-mono">Phone: {contacts.primaryPhone} • {contacts.websiteUrl}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left sm:text-right min-w-[200px]">
                <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: currentTheme.primary }}>
                  {invoiceSettings.invoiceTitle}
                </span>
                <span className="text-base font-black font-mono block text-slate-900">{invoice.invoiceNumber}</span>
                <span className="text-xs text-slate-500 block">Date: {new Date(invoice.createdAt).toLocaleDateString('en-GB')}</span>
              </div>
            </div>
          )}

          {/* BILL TO & SHIP TO SECTION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                {invoiceSettings.billToLabel || 'BILL TO (CLIENT / COMPANY)'}
              </span>
              <p className="text-sm font-bold text-slate-900">{invoice.customerName}</p>
              {invoice.customerPhone && (
                <p className="text-xs text-slate-600 font-mono mt-0.5">Phone: {invoice.customerPhone}</p>
              )}
              {invoice.customerEmail && (
                <p className="text-xs text-slate-600 mt-0.5">Email: {invoice.customerEmail}</p>
              )}
              {invoice.customerAddress && (
                <p className="text-xs text-slate-600 mt-0.5">{invoice.customerAddress}</p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  {invoiceSettings.shipToLabel || 'DELIVERY / PROJECT SITE'}
                </span>
                <p className="text-xs text-slate-700">
                  {invoice.customerDeliveryAddress || invoice.customerAddress || 'Same as client billing address.'}
                </p>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span>Payment Mode: <strong className="text-slate-900">{invoice.paymentMethod}</strong></span>
                <span className="font-mono">BIN: {contacts.binNumber}</span>
              </div>
            </div>
          </div>

          {/* CUSTOM EXTRA FIELDS (e.g. Engineer Name, Project Name, PO #) */}
          {(invoiceSettings.customExtraFields || []).filter(f => f.showOnPrint && invoice.extraFields?.[f.id]).length > 0 && (
            <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200 text-xs">
              {(invoiceSettings.customExtraFields || [])
                .filter(f => f.showOnPrint && invoice.extraFields?.[f.id])
                .map(field => (
                  <div key={field.id} className="pr-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">{field.label}</span>
                    <span className="font-semibold text-slate-900 truncate block">
                      {invoice.extraFields?.[field.id]}
                    </span>
                  </div>
                ))}
            </div>
          )}

          {/* PRODUCT ITEMS TABLE */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-white font-bold" style={{ backgroundColor: currentTheme.primary }}>
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  {invoiceSettings.showModelCategory && <th className="py-2.5 px-3">Model / Cat</th>}
                  {invoiceSettings.showSerialNumber && <th className="py-2.5 px-3">Serial No (S/N)</th>}
                  {invoiceSettings.showWarranty && <th className="py-2.5 px-3">Warranty</th>}
                  <th className="py-2.5 px-3 text-center w-14">Qty</th>
                  <th className="py-2.5 px-3 text-right w-24">Rate (৳)</th>
                  <th className="py-2.5 px-3 text-right w-28">Amount (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(invoice.items || []).map((item, idx) => (
                  <tr key={item.id} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                    <td className="py-2.5 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-900 block">{item.productName}</span>
                    </td>
                    {invoiceSettings.showModelCategory && (
                      <td className="py-2.5 px-3 text-slate-600">
                        <span className="font-mono text-[11px] block">{item.model || '—'}</span>
                        <span className="text-[10px] text-slate-400 block">{item.category}</span>
                      </td>
                    )}
                    {invoiceSettings.showSerialNumber && (
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[11px] font-bold text-slate-800">
                          {item.serialNumber || 'N/A'}
                        </span>
                      </td>
                    )}
                    {invoiceSettings.showWarranty && (
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                        {item.warranty || 'Standard Manufacturer'}
                      </td>
                    )}
                    <td className="py-2.5 px-3 text-center font-bold text-slate-900">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-800">{item.unitPrice.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FINANCIAL TOTALS, QR CODE & BOTTOM NOTES */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 mb-6 items-start">
            {/* Left: Dynamic QR Validation Code & Notes */}
            <div className="sm:col-span-7 space-y-4">
              {/* Dynamic QR Code Box */}
              {invoiceSettings.dynamicQrEnabled && qrDataUrl && (
                <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex-shrink-0">
                    <img src={qrDataUrl} alt="QR Validation" className="w-20 h-20" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Instant QR Authenticity Verification
                    </span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      Scan to verify original warranty & seal
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono break-all mt-0.5">
                      {invoiceSettings.qrVerificationPrefix}{invoice.invoiceNumber}
                    </p>
                  </div>
                </div>
              )}

              {/* Bottom Custom Notes */}
              {invoice.bottomNotes && invoice.bottomNotes.length > 0 && (
                <div className="space-y-2">
                  {invoice.bottomNotes.map(n => (
                    <div key={n.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                      <span className="font-bold text-slate-800 block mb-0.5">{n.title}</span>
                      <p className="text-slate-600">{n.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Calculations Summary */}
            <div className="sm:col-span-5 bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-semibold text-slate-900">৳ {invoice.subtotal.toLocaleString()}</span>
              </div>

              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount {invoice.discountType === 'percentage' ? `(${invoice.discountValue}%)` : ''}</span>
                  <span className="font-mono font-bold">- ৳ {invoice.discountAmount.toLocaleString()}</span>
                </div>
              )}

              {invoice.vatAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>VAT ({invoice.vatPercentage}%)</span>
                  <span className="font-mono font-semibold text-slate-900">+ ৳ {invoice.vatAmount.toLocaleString()}</span>
                </div>
              )}

              {invoice.aitAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>AIT ({invoice.aitPercentage}%)</span>
                  <span className="font-mono font-semibold text-slate-900">+ ৳ {invoice.aitAmount.toLocaleString()}</span>
                </div>
              )}

              <div
                className="flex justify-between py-2 border-t-2 text-sm font-extrabold"
                style={{ borderColor: currentTheme.primary, color: currentTheme.primary }}
              >
                <span>Grand Total</span>
                <span className="font-mono text-base">৳ {invoice.grandTotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-slate-700 pt-1 border-t border-slate-200">
                <span>Paid Amount</span>
                <span className="font-mono font-bold text-slate-900">৳ {invoice.paidAmount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-slate-700">
                <span>Due Balance</span>
                <span className={`font-mono font-bold ${invoice.dueAmount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  ৳ {invoice.dueAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* TERMS & CONDITIONS SECTION */}
          {(invoiceSettings.termsAndConditions || []).length > 0 && (
            <div className="border-t border-slate-200 pt-3 mb-6">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Standard Warranty Terms & Service Conditions:
              </span>
              <ol className="list-decimal list-inside space-y-0.5 text-[10px] text-slate-600 leading-relaxed">
                {(invoiceSettings.termsAndConditions || []).map((term, i) => (
                  <li key={i}>{term}</li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* BOTTOM SIGNATURES SECTION */}
        <div className="relative z-10 pt-4 border-t border-slate-200 mt-4">
          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            {/* Customer Signature / Left Signature */}
            {invoiceSettings.signatureConfig.showCustomerSignature && (
              <div className="flex flex-col items-center justify-end h-24">
                {invoiceSettings.signatureConfig.leftSignatureImage && invoiceSettings.showDigitalSignature !== false ? (
                  <div className="h-12 flex items-center justify-center mb-1">
                    <img
                      src={invoiceSettings.signatureConfig.leftSignatureImage}
                      alt="Left Signature"
                      className="max-h-full max-w-[120px] object-contain"
                    />
                  </div>
                ) : null}
                <div className="w-full border-t border-dashed border-slate-400 pt-1.5">
                  <p className="font-bold text-slate-800 text-[11px]">
                    {invoiceSettings.signatureConfig.leftSignatureLabel ||
                      invoiceSettings.signatureConfig.customerSignatureLabel ||
                      'Customer Signature & Seal'}
                  </p>
                  <p className="text-[9px] text-slate-400">Goods received in tested condition</p>
                </div>
              </div>
            )}

            {/* Prepared By / Technician Signature */}
            {invoiceSettings.signatureConfig.showPreparedBySignature && (
              <div className="flex flex-col items-center justify-end h-24">
                <div className="w-full border-t border-dashed border-slate-400 pt-1.5">
                  <p className="font-bold text-slate-800 text-[11px]">
                    {invoice.createdByName || invoiceSettings.signatureConfig.preparedByLabel || 'Service Engineer'}
                  </p>
                  <p className="text-[9px] text-slate-400">Tested & Dispatched By</p>
                </div>
              </div>
            )}

            {/* CEO Authorized Signature / Right Signature */}
            {invoiceSettings.signatureConfig.showCeoSignature && (
              <div className="flex flex-col items-center justify-end h-24">
                {(invoiceSettings.signatureConfig.rightSignatureImage || invoiceSettings.signatureConfig.ceoSignatureImage) &&
                invoiceSettings.showDigitalSignature !== false ? (
                  <div className="h-12 flex items-center justify-center mb-1">
                    <img
                      src={invoiceSettings.signatureConfig.rightSignatureImage || invoiceSettings.signatureConfig.ceoSignatureImage}
                      alt="CEO Signature"
                      className="max-h-full max-w-[120px] object-contain"
                    />
                  </div>
                ) : (
                  <div className="font-serif italic font-bold text-base text-slate-900 h-10 flex items-center justify-center">
                    {invoiceSettings.signatureConfig.ceoName}
                  </div>
                )}
                <div className="w-full border-t border-dashed border-slate-400 pt-1.5">
                  <p className="font-bold text-slate-900 text-[11px]">
                    {invoiceSettings.signatureConfig.rightSignatureLabel || invoiceSettings.signatureConfig.ceoName}
                  </p>
                  <p className="text-[9px] text-slate-500 font-semibold">
                    {invoiceSettings.signatureConfig.ceoTitle}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Logo & Footer note */}
          {((footerLogo && invoiceSettings.showFooterLogo !== false) || invoiceSettings.footerText) && (
            <div className="mt-4 pt-2 border-t border-slate-100 flex flex-col items-center justify-center gap-1.5">
              {footerLogo && invoiceSettings.showFooterLogo !== false && (
                <div className="max-h-8 flex items-center justify-center">
                  <img src={footerLogo} alt="Footer Logo" className="max-h-8 max-w-[140px] object-contain" />
                </div>
              )}
              {invoiceSettings.footerText && (
                <p className="text-center text-[10px] text-slate-400 font-mono">
                  {invoiceSettings.footerText}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
