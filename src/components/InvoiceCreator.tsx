import React, { useState } from 'react';
import {
  FileText,
  User,
  Phone,
  MapPin,
  Plus,
  Trash2,
  Scan,
  Printer,
  Save,
  CheckCircle2,
  Barcode,
  Calendar,
  CreditCard,
  Percent,
  HelpCircle,
} from 'lucide-react';
import {
  Invoice,
  InvoiceItem,
  Product,
  SystemConfig,
  UserAccount,
  WatermarkStatus,
  DiscountFormat,
  InvoiceBottomNote,
} from '../types';

interface InvoiceCreatorProps {
  config: SystemConfig;
  products: Product[];
  currentUser: UserAccount;
  onSaveInvoice: (invoice: Invoice, shouldPrintImmediately?: boolean) => void;
  language: 'en' | 'bn';
  onOpenScanner: (targetItemIndex?: number) => void;
  scannedCodeBuffer?: { code: string; matchedProduct?: Product } | null;
  clearScannedBuffer?: () => void;
}

export const InvoiceCreator: React.FC<InvoiceCreatorProps> = ({
  config,
  products,
  currentUser,
  onSaveInvoice,
  language,
  onOpenScanner,
  scannedCodeBuffer,
  clearScannedBuffer,
}) => {
  const isCeo = currentUser.role === 'CEO';
  const canDiscount = isCeo || Boolean(currentUser.permissions?.canApplyDiscount);
  const canEditPrice = isCeo || Boolean(currentUser.permissions?.canEditProductPrice);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerDeliveryAddress, setCustomerDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<Invoice['paymentMethod']>('Cash');
  const [paymentStatus, setPaymentStatus] = useState<WatermarkStatus>('PAID');

  // Items
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'item-1',
      productId: products[0]?.id || '',
      productName: products[0]?.name || 'Industrial Service & Technical Supply',
      category: products[0]?.category || 'Electronics',
      model: products[0]?.model || 'STD-01',
      serialNumber: products[0]?.serialNumbers?.[0] || 'SN-882190',
      warranty: products[0]?.warrantyPeriod || '1 Year Official Warranty',
      quantity: 1,
      unitPrice: products[0]?.unitPrice || 15000,
      total: products[0]?.unitPrice || 15000,
    },
  ]);

  // Financials
  const [discountType, setDiscountType] = useState<DiscountFormat>(
    config.invoiceSettings?.discountFormat || 'fixed'
  );
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [vatPercentage, setVatPercentage] = useState<number>(
    config.invoiceSettings?.vatPercentage || 5
  );
  const [aitPercentage, setAitPercentage] = useState<number>(
    config.invoiceSettings?.aitPercentage || 0
  );
  const [paidAmount, setPaidAmount] = useState<number>(0);

  // Custom Extra fields
  const [extraFields, setExtraFields] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    (config.invoiceSettings?.customExtraFields || []).forEach(f => {
      initial[f.id] = f.value || '';
    });
    return initial;
  });

  // Bottom Custom Notes
  const [bottomNotes, setBottomNotes] = useState<InvoiceBottomNote[]>([
    {
      id: 'note-1',
      title: 'Special Site Inspection Note',
      content: 'System tested under 100% full electrical load. All calibration parameters verified by Lead Engineer.',
    },
  ]);

  // React to scanned barcode buffer from external scanner
  React.useEffect(() => {
    if (scannedCodeBuffer) {
      const { code, matchedProduct } = scannedCodeBuffer;
      if (matchedProduct) {
        // Add as item
        const newItem: InvoiceItem = {
          id: 'item_' + Date.now(),
          productId: matchedProduct.id,
          productName: matchedProduct.name,
          category: matchedProduct.category,
          model: matchedProduct.model,
          serialNumber: code,
          warranty: matchedProduct.warrantyPeriod,
          quantity: 1,
          unitPrice: matchedProduct.unitPrice,
          total: matchedProduct.unitPrice,
        };
        setItems(prev => [...prev, newItem]);
      } else {
        // Assign to last item's serial number or append empty item
        setItems(prev => {
          if (prev.length > 0) {
            const updated = [...prev];
            updated[updated.length - 1].serialNumber = code;
            return updated;
          }
          return prev;
        });
      }
      clearScannedBuffer?.();
    }
  }, [scannedCodeBuffer, clearScannedBuffer]);

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  const discountAmount =
    discountType === 'percentage'
      ? Math.round((subtotal * discountValue) / 100)
      : discountValue;

  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const vatAmount = Math.round((afterDiscount * vatPercentage) / 100);
  const aitAmount = Math.round((afterDiscount * aitPercentage) / 100);
  const grandTotal = afterDiscount + vatAmount + aitAmount;
  const dueAmount = Math.max(0, grandTotal - paidAmount);

  // Auto update paid amount to match grand total if status is PAID
  React.useEffect(() => {
    if (paymentStatus === 'PAID') {
      setPaidAmount(grandTotal);
    } else if (paymentStatus === 'DUE') {
      setPaidAmount(0);
    }
  }, [paymentStatus, grandTotal]);

  const handleProductSelect = (index: number, productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    setItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        productId: prod.id,
        productName: prod.name,
        category: prod.category,
        model: prod.model,
        warranty: prod.warrantyPeriod,
        unitPrice: prod.unitPrice,
        total: prod.unitPrice * updated[index].quantity,
        serialNumber: prod.serialNumbers[0] || '',
      };
      return updated;
    });
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const safeQty = Math.max(1, qty);
    setItems(prev => {
      const updated = [...prev];
      updated[index].quantity = safeQty;
      updated[index].total = updated[index].unitPrice * safeQty;
      return updated;
    });
  };

  const handlePriceChange = (index: number, price: number) => {
    if (!canEditPrice) return;
    const safePrice = Math.max(0, price);
    setItems(prev => {
      const updated = [...prev];
      updated[index].unitPrice = safePrice;
      updated[index].total = safePrice * updated[index].quantity;
      return updated;
    });
  };

  const addItemRow = () => {
    const newItem: InvoiceItem = {
      id: 'item_' + Date.now(),
      productName: '',
      category: 'General Parts',
      model: '',
      serialNumber: '',
      warranty: '1 Year Warranty',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setItems(prev => [...prev, newItem]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const addBottomNote = () => {
    setBottomNotes(prev => [
      ...prev,
      {
        id: 'note_' + Date.now(),
        title: 'Custom Note ' + (prev.length + 1),
        content: '',
      },
    ]);
  };

  const removeBottomNote = (id: string) => {
    setBottomNotes(prev => prev.filter(n => n.id !== id));
  };

  const handleCreateInvoice = (shouldPrint: boolean) => {
    if (!customerName.trim()) {
      alert(language === 'bn' ? 'অনুগ্রহ করে গ্রাহকের নাম লিখুন।' : 'Please enter customer / company name.');
      return;
    }

    const newInvoice: Invoice = {
      id: 'inv_' + Date.now(),
      invoiceNumber: 'IT-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000),
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      customerAddress: customerAddress.trim(),
      customerDeliveryAddress: customerDeliveryAddress.trim() || customerAddress.trim(),
      createdByUserId: currentUser.userId,
      createdByName: currentUser.name,
      createdByRole: currentUser.role,
      items: items.filter(it => it.productName.trim().length > 0),
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      vatPercentage,
      vatAmount,
      aitPercentage,
      aitAmount,
      grandTotal,
      paidAmount,
      dueAmount,
      paymentStatus,
      paymentMethod,
      extraFields,
      bottomNotes,
      qrPayload: `${config.invoiceSettings.qrVerificationPrefix}`,
    };

    onSaveInvoice(newInvoice, shouldPrint);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">
                {language === 'bn' ? 'নতুন অফিসিয়াল ইনভয়েস তৈরি' : 'Create Official Tax Invoice'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'bn'
                  ? 'গ্রাহকের তথ্য, পণ্য নির্বাচন ও ইউএসবি বা ক্যামেরা দিয়ে সিরিয়াল নম্বর (S/N) স্ক্যান করুন'
                  : 'Fast billing, serial number verification, dynamic discounts, and print generation.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onOpenScanner()}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Scan className="w-4 h-4 text-blue-400" />
            <span>{language === 'bn' ? 'সিরিয়াল (S/N) স্ক্যান' : 'Scan Serial'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleCreateInvoice(false)}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>{language === 'bn' ? 'সিস্টেমে সেভ করুন' : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleCreateInvoice(true)}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'bn' ? 'সংরক্ষণ ও সরাসরি প্রিন্ট' : 'Save & Print Invoice'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Customer Info & Payment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <User className="w-4 h-4 text-blue-400" />
            <span>Customer & Delivery Site Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Client / Company Full Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="e.g. Apex Industrial Systems Ltd."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Customer Mobile / Phone
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="+880 17..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Client Email Address
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                placeholder="billing@client.com"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Billing Office Address
              </label>
              <input
                type="text"
                value={customerAddress}
                onChange={e => setCustomerAddress(e.target.value)}
                placeholder="Plot #42, Industrial Zone, Dhaka"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Delivery / Project Site Location (if different)
            </label>
            <input
              type="text"
              value={customerDeliveryAddress}
              onChange={e => setCustomerDeliveryAddress(e.target.value)}
              placeholder="Leave blank if same as billing address"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Payment & Watermark Status Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Payment Channel & Status</span>
            </h3>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Payment Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['PAID', 'DUE', 'PARTIAL', 'CANCELLED'] as WatermarkStatus[]).map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setPaymentStatus(status)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                        paymentStatus === status
                          ? status === 'PAID'
                            ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                            : status === 'DUE'
                            ? 'bg-red-600/30 border-red-500 text-red-300'
                            : status === 'PARTIAL'
                            ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                            : 'bg-slate-700 border-slate-600 text-slate-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="Cash">Cash on Delivery (COD)</option>
                  <option value="bKash">bKash Merchant</option>
                  <option value="Nagad">Nagad Enterprise</option>
                  <option value="Bank Transfer">Direct Bank Electronic Transfer (BEFTN/RTGS)</option>
                  <option value="Cheque">Corporate Account Payee Cheque</option>
                  <option value="Credit Card">Credit / Debit Card POS</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick info note */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <Barcode className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>USB OTG Hardware barcode scanners trigger automatic insertion anywhere on this screen.</span>
          </div>
        </div>
      </div>

      {/* CUSTOM EXTRA FIELDS (Preloaded from CEO settings) */}
      {(config.invoiceSettings?.customExtraFields || []).filter(f => f.enabled).length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <span>Enterprise Extra Fields</span>
            <span className="text-[10px] font-normal text-slate-400">(Configured by CEO)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {(config.invoiceSettings?.customExtraFields || [])
              .filter(f => f.enabled)
              .map(field => (
                <div key={field.id}>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">{field.label}</label>
                  <input
                    type="text"
                    value={extraFields[field.id] ?? field.value}
                    onChange={e =>
                      setExtraFields({
                        ...extraFields,
                        [field.id]: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* PRODUCTS & SERIAL NUMBERS TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Barcode className="w-4 h-4 text-blue-400" />
            <span>Invoice Products, Rates & Serial Numbers (S/N)</span>
          </h3>

          <button
            type="button"
            onClick={addItemRow}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item Row</span>
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-3"
            >
              {/* Product selector dropdown or custom name */}
              <div className="flex-1 w-full space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
                      Select From Catalog or Type Item Description
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={item.productId || ''}
                        onChange={e => handleProductSelect(idx, e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none max-w-[180px]"
                      >
                        <option value="">-- Catalog --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={item.productName}
                        onChange={e => {
                          const updated = [...items];
                          updated[idx].productName = e.target.value;
                          setItems(updated);
                        }}
                        placeholder="Product / Service description"
                        className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
                      Model / Cat
                    </label>
                    <input
                      type="text"
                      value={item.model}
                      onChange={e => {
                        const updated = [...items];
                        updated[idx].model = e.target.value;
                        setItems(updated);
                      }}
                      placeholder="Model #"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* S/N and Warranty Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">
                      S/N:
                    </span>
                    <input
                      type="text"
                      value={item.serialNumber}
                      onChange={e => {
                        const updated = [...items];
                        updated[idx].serialNumber = e.target.value;
                        setItems(updated);
                      }}
                      placeholder="Scan or enter Serial #"
                      className="flex-1 px-3 py-1 bg-slate-900 border border-slate-700 rounded-xl text-xs text-blue-300 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => onOpenScanner(idx)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg"
                      title="Scan Serial with Camera or USB Barcode Scanner"
                    >
                      <Scan className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">
                      Warranty:
                    </span>
                    <input
                      type="text"
                      value={item.warranty}
                      onChange={e => {
                        const updated = [...items];
                        updated[idx].warranty = e.target.value;
                        setItems(updated);
                      }}
                      placeholder="e.g. 1 Year Replacement"
                      className="flex-1 px-3 py-1 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* Quantity, Unit Price & Subtotal */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Qty</span>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e => handleQuantityChange(idx, Number(e.target.value))}
                    className="w-16 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white text-center font-bold"
                  />
                </div>

                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Unit Rate (৳)</span>
                  <input
                    type="number"
                    min="0"
                    disabled={!canEditPrice}
                    value={item.unitPrice}
                    onChange={e => handlePriceChange(idx, Number(e.target.value))}
                    className={`w-28 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white text-right font-mono font-bold ${
                      !canEditPrice ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  />
                </div>

                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Total (৳)</span>
                  <span className="w-28 block px-3 py-1.5 bg-slate-900/50 border border-slate-800 rounded-xl text-xs text-white text-right font-mono font-bold">
                    {item.total.toLocaleString()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => removeItemRow(idx)}
                  disabled={items.length <= 1}
                  className="p-2 text-red-400 hover:text-red-300 disabled:opacity-30 rounded-xl hover:bg-slate-800 transition-colors mt-4 md:mt-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FINANCIAL SUMMARY & UNLIMITED BOTTOM NOTES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Unlimited Custom Bottom Notes */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Unlimited Custom Bottom Notes / Pre-print Instructions</span>
            </h3>
            <button
              type="button"
              onClick={addBottomNote}
              className="px-3 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Note</span>
            </button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {bottomNotes.map((note, idx) => (
              <div key={note.id} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={note.title}
                    onChange={e => {
                      const updated = [...bottomNotes];
                      updated[idx].title = e.target.value;
                      setBottomNotes(updated);
                    }}
                    placeholder="Note Heading"
                    className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-bold w-3/4"
                  />
                  <button
                    type="button"
                    onClick={() => removeBottomNote(note.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={note.content}
                  onChange={e => {
                    const updated = [...bottomNotes];
                    updated[idx].content = e.target.value;
                    setBottomNotes(updated);
                  }}
                  placeholder="Detailed note, serial verification comment, or delivery clause..."
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Totals & Calculations Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white pb-2 border-b border-slate-800">
            Invoice Financial Summary
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>Subtotal</span>
              <span className="font-mono font-bold text-sm text-white">৳ {subtotal.toLocaleString()}</span>
            </div>

            {/* Discount Form */}
            <div className="flex items-center justify-between gap-3 p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-slate-300">Discount:</span>
                <select
                  disabled={!canDiscount}
                  value={discountType}
                  onChange={e => setDiscountType(e.target.value as DiscountFormat)}
                  className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                >
                  <option value="fixed">Fixed BDT (৳)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  disabled={!canDiscount}
                  value={discountValue}
                  onChange={e => setDiscountValue(Number(e.target.value))}
                  className="w-24 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono text-right"
                />
                <span className="font-mono text-emerald-400 font-bold min-w-[70px] text-right">
                  - ৳ {discountAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* VAT */}
            <div className="flex items-center justify-between gap-3 p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-slate-300">VAT (%):</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={vatPercentage}
                  onChange={e => setVatPercentage(Number(e.target.value))}
                  className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono text-center"
                />
              </div>
              <span className="font-mono text-slate-300 font-bold">+ ৳ {vatAmount.toLocaleString()}</span>
            </div>

            {/* AIT */}
            <div className="flex items-center justify-between gap-3 p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-slate-300">AIT Advance Income Tax (%):</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={aitPercentage}
                  onChange={e => setAitPercentage(Number(e.target.value))}
                  className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono text-center"
                />
              </div>
              <span className="font-mono text-slate-300 font-bold">+ ৳ {aitAmount.toLocaleString()}</span>
            </div>

            {/* Grand Total */}
            <div className="flex items-center justify-between pt-2 border-t-2 border-blue-500/40 text-base font-extrabold text-white">
              <span>Grand Total</span>
              <span className="font-mono text-xl text-blue-400">৳ {grandTotal.toLocaleString()}</span>
            </div>

            {/* Paid & Due */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Paid Amount (৳)</label>
                <input
                  type="number"
                  min="0"
                  value={paidAmount}
                  onChange={e => setPaidAmount(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono font-bold"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Due Balance (৳)</span>
                <span className={`block text-sm font-mono font-bold pt-1 ${dueAmount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  ৳ {dueAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
