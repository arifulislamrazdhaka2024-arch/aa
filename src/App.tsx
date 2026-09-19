import React, { useState, useEffect } from 'react';
import {
  SystemConfig,
  UserAccount,
  Product,
  Invoice,
  WatermarkStatus,
} from './types';
import {
  loadSystemConfig,
  saveSystemConfig,
  loadUsers,
  saveUsers,
  loadProducts,
  saveProducts,
  loadInvoices,
  saveInvoices,
  applyTheme,
  applyThemeAndTypography,
  deepMergeConfig,
} from './utils/storage';
import { InitialSetupModal } from './components/InitialSetupModal';
import { LoginScreen } from './components/LoginScreen';
import { Navbar } from './components/Navbar';
import { MasterControlPanel } from './components/MasterControlPanel';
import { InvoiceCreator } from './components/InvoiceCreator';
import { InvoiceList } from './components/InvoiceList';
import { InventoryManager } from './components/InventoryManager';
import { InvoicePrintView } from './components/InvoicePrintView';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';

export default function App() {
  const [config, setConfig] = useState<SystemConfig>(() => loadSystemConfig());
  const [users, setUsers] = useState<UserAccount[]>(() => loadUsers());
  const [products, setProducts] = useState<Product[]>(() => loadProducts());
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadInvoices());

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [activeTab, setActiveTab] = useState<
    'new-invoice' | 'invoices-list' | 'inventory' | 'master-control' | 'print-view'
  >('new-invoice');

  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);

  // Scanner modal state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedBuffer, setScannedBuffer] = useState<{
    code: string;
    matchedProduct?: Product;
  } | null>(null);

  // Apply theme dynamically on boot & config changes
  useEffect(() => {
    applyThemeAndTypography(config);
  }, [config.activeThemeId, config.enterpriseTheme, config.activeFontFamily, config.typography, config.language]);

  // Handle Initial Setup Completed by CEO
  const handleInitialSetupComplete = (ceoUser: UserAccount, updatedConfig: Partial<SystemConfig>) => {
    const mergedConfig: SystemConfig = deepMergeConfig(config, {
      ...updatedConfig,
      isInitialized: true,
    });
    saveSystemConfig(mergedConfig);
    setConfig(mergedConfig);

    const updatedUsers = [ceoUser];
    saveUsers(updatedUsers);
    setUsers(updatedUsers);

    setCurrentUser(ceoUser);
    setActiveTab('master-control');
  };

  // Handle Login
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    if (user.role === 'CEO') {
      setActiveTab('master-control');
    } else {
      setActiveTab('new-invoice');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('new-invoice');
  };

  // Handle Config Update from Master Control Panel
  const handleSaveConfig = (newConfig: SystemConfig) => {
    saveSystemConfig(newConfig);
    setConfig(newConfig);
  };

  // Handle Users Update from Master Control Panel
  const handleSaveUsers = (newUsers: UserAccount[]) => {
    saveUsers(newUsers);
    setUsers(newUsers);
  };

  // Handle Products Update
  const handleSaveProducts = (newProducts: Product[]) => {
    saveProducts(newProducts);
    setProducts(newProducts);
  };

  // Handle Invoice Creation
  const handleSaveInvoice = (newInvoice: Invoice, shouldPrintImmediately = false) => {
    const updated = [newInvoice, ...invoices];
    saveInvoices(updated);
    setInvoices(updated);

    if (shouldPrintImmediately) {
      setSelectedInvoiceForPrint(newInvoice);
      setActiveTab('print-view');
    } else {
      setActiveTab('invoices-list');
    }
  };

  // Handle Invoice Delete
  const handleDeleteInvoice = (id: string) => {
    const updated = invoices.filter(inv => inv.id !== id);
    saveInvoices(updated);
    setInvoices(updated);
  };

  // Handle Invoice Status Update
  const handleUpdateInvoiceStatus = (id: string, newStatus: WatermarkStatus) => {
    const updated = invoices.map(inv => {
      if (inv.id === id) {
        return {
          ...inv,
          paymentStatus: newStatus,
          paidAmount: newStatus === 'PAID' ? inv.grandTotal : newStatus === 'DUE' ? 0 : inv.paidAmount,
          dueAmount: newStatus === 'PAID' ? 0 : newStatus === 'DUE' ? inv.grandTotal : inv.dueAmount,
        };
      }
      return inv;
    });
    saveInvoices(updated);
    setInvoices(updated);
  };

  // Language Toggle
  const handleLanguageToggle = () => {
    const nextLang = config.language === 'en' ? 'bn' : 'en';
    const updated = { ...config, language: nextLang as 'en' | 'bn' };
    saveSystemConfig(updated);
    setConfig(updated);
  };

  // Theme Select
  const handleThemeSelect = (themeId: string) => {
    const updated = { ...config, activeThemeId: themeId };
    saveSystemConfig(updated);
    setConfig(updated);
  };

  // Barcode Scan Handler
  const handleScanCode = (code: string) => {
    const matched = products.find(
      p =>
        p.code.toLowerCase() === code.toLowerCase() ||
        p.serialNumbers.some(sn => sn.toLowerCase() === code.toLowerCase()) ||
        p.model.toLowerCase() === code.toLowerCase()
    );

    setScannedBuffer({ code, matchedProduct: matched });
    setIsScannerOpen(false);

    if (activeTab !== 'new-invoice') {
      setActiveTab('new-invoice');
    }
  };

  // STEP 1: If system has never been configured, force Initial Setup Modal (Zero Default Password Rule)
  if (!config.isInitialized) {
    return (
      <InitialSetupModal
        onComplete={handleInitialSetupComplete}
        language={config.language}
      />
    );
  }

  // STEP 2: If not logged in, render dynamic CEO-customizable Login Screen
  if (!currentUser) {
    return (
      <LoginScreen
        config={config}
        users={users}
        onLoginSuccess={handleLogin}
        onLanguageToggle={handleLanguageToggle}
        language={config.language}
      />
    );
  }

  // STEP 3: If viewing a printed invoice / PDF output
  if (activeTab === 'print-view' && selectedInvoiceForPrint) {
    return (
      <InvoicePrintView
        invoice={selectedInvoiceForPrint}
        config={config}
        language={config.language}
        onBack={() => setActiveTab('invoices-list')}
      />
    );
  }

  // STEP 4: Authenticated Master Portal
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Dynamic Global Navbar */}
      <Navbar
        currentUser={currentUser}
        config={config}
        activeTab={activeTab === 'print-view' ? 'invoices-list' : activeTab}
        setActiveTab={setActiveTab}
        onThemeSelect={handleThemeSelect}
        onLanguageToggle={handleLanguageToggle}
        onLogout={handleLogout}
      />

      {/* Main Portal Viewports */}
      <main className="flex-1 pb-16">
        {activeTab === 'new-invoice' && (
          <InvoiceCreator
            config={config}
            products={products}
            currentUser={currentUser}
            onSaveInvoice={handleSaveInvoice}
            language={config.language}
            onOpenScanner={() => setIsScannerOpen(true)}
            scannedCodeBuffer={scannedBuffer}
            clearScannedBuffer={() => setScannedBuffer(null)}
          />
        )}

        {activeTab === 'invoices-list' && (
          <InvoiceList
            invoices={invoices}
            currentUser={currentUser}
            language={config.language}
            onViewInvoice={inv => {
              setSelectedInvoiceForPrint(inv);
              setActiveTab('print-view');
            }}
            onDeleteInvoice={handleDeleteInvoice}
            onUpdateStatus={handleUpdateInvoiceStatus}
            onOpenCreate={() => setActiveTab('new-invoice')}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryManager
            products={products}
            onSaveProducts={handleSaveProducts}
            currentUser={currentUser}
            language={config.language}
            onOpenScanner={() => setIsScannerOpen(true)}
          />
        )}

        {activeTab === 'master-control' && (
          <>
            {currentUser.role === 'CEO' ? (
              <MasterControlPanel
                config={config}
                onSaveConfig={handleSaveConfig}
                users={users}
                onSaveUsers={handleSaveUsers}
                currentUser={currentUser}
                language={config.language}
              />
            ) : (
              <div className="max-w-2xl mx-auto my-12 p-8 bg-slate-900 border border-red-500/30 rounded-3xl text-center space-y-3">
                <h3 className="text-xl font-bold text-red-400">Access Denied</h3>
                <p className="text-sm text-slate-400">
                  Master Control Panel is strictly restricted to CEO Authorized Personnel.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('new-invoice')}
                  className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Return to Invoice Desk
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Multi-Source Camera & Hardware Barcode Scanner Modal */}
      {isScannerOpen && (
        <BarcodeScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScanComplete={handleScanCode}
          products={products}
          language={config.language}
        />
      )}
    </div>
  );
}
