import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Printer,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  DollarSign,
  TrendingUp,
  Download,
  Calendar,
} from 'lucide-react';
import { Invoice, UserAccount, WatermarkStatus } from '../types';

interface InvoiceListProps {
  invoices: Invoice[];
  currentUser: UserAccount;
  language: 'en' | 'bn';
  onViewInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: WatermarkStatus) => void;
  onOpenCreate: () => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  currentUser,
  language,
  onViewInvoice,
  onDeleteInvoice,
  onUpdateStatus,
  onOpenCreate,
}) => {
  const isCeo = currentUser.role === 'CEO';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Metrics
  const totalRevenue = (invoices || []).reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalPaid = (invoices || []).reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalDue = (invoices || []).reduce((sum, inv) => sum + inv.dueAmount, 0);

  const filteredInvoices = (invoices || []).filter(inv => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.customerPhone && inv.customerPhone.includes(searchTerm)) ||
      (inv.items || []).some(it => it.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || inv.paymentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const exportCSV = () => {
    const headers = ['Invoice No', 'Date', 'Customer', 'Phone', 'Items Count', 'Grand Total', 'Paid', 'Due', 'Status'];
    const rows = (filteredInvoices || []).map(i => [
      i.invoiceNumber,
      new Date(i.createdAt).toLocaleDateString(),
      `"${i.customerName}"`,
      i.customerPhone || '',
      (i.items || []).length,
      i.grandTotal,
      i.paidAmount,
      i.dueAmount,
      i.paymentStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Intelligent_Technician_Invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: WatermarkStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>PAID</span>
          </span>
        );
      case 'DUE':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>DUE</span>
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>PARTIAL</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Total Invoiced Volume</span>
            <span className="text-xl font-extrabold text-white font-mono">৳ {totalRevenue.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 block">{invoices.length} total issued invoices</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Collected Cash / Bank</span>
            <span className="text-xl font-extrabold text-emerald-400 font-mono">৳ {totalPaid.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 block">Settled funds</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Outstanding Due Balance</span>
            <span className="text-xl font-extrabold text-red-400 font-mono">৳ {totalDue.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 block">Pending client settlements</span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={language === 'bn' ? 'ইনভয়েস নং বা গ্রাহক নাম দিয়ে খুঁজুন...' : 'Search Invoice #, Client, S/N...'}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {['ALL', 'PAID', 'DUE', 'PARTIAL', 'CANCELLED'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                  statusFilter === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={exportCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-white">No Invoices Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No matching records for your search filters. Click below to generate your first invoice.
            </p>
            <button
              type="button"
              onClick={onOpenCreate}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Create Invoice Now</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items / S/N</th>
                  <th className="py-3 px-4 text-right">Grand Total (৳)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-blue-400 block">{inv.invoiceNumber}</span>
                      <span className="text-[10px] text-slate-500">By: {inv.createdByName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                      {new Date(inv.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block">{inv.customerName}</span>
                      {inv.customerPhone && (
                        <span className="text-[10px] text-slate-400 font-mono">{inv.customerPhone}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-300 block">{(inv.items || []).length} items</span>
                      <span className="text-[10px] text-slate-500 font-mono truncate max-w-[140px] block">
                        {(inv.items || []).map(i => i.serialNumber).filter(Boolean).join(', ') || 'No S/N'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">
                      <span className="font-bold text-white text-sm">৳ {inv.grandTotal.toLocaleString()}</span>
                      {inv.dueAmount > 0 ? (
                        <span className="text-[10px] text-red-400 block">Due: ৳ {inv.dueAmount.toLocaleString()}</span>
                      ) : (
                        <span className="text-[10px] text-emerald-400 block">Full Paid</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex justify-center">{getStatusBadge(inv.paymentStatus)}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onViewInvoice(inv)}
                          className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="View and Print"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print</span>
                        </button>

                        {isCeo && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Delete this invoice permanently?')) {
                                onDeleteInvoice(inv.id);
                              }
                            }}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
