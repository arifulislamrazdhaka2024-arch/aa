import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Barcode,
  Edit,
  Trash2,
  Shield,
  Tag,
  CheckCircle2,
  Scan,
  AlertCircle,
  X,
  Upload,
} from 'lucide-react';
import { Product, UserAccount } from '../types';

interface InventoryManagerProps {
  products: Product[];
  onSaveProducts: (products: Product[]) => void;
  currentUser: UserAccount;
  language: 'en' | 'bn';
  onOpenScanner: () => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  products,
  onSaveProducts,
  currentUser,
  language,
  onOpenScanner,
}) => {
  const isCeo = currentUser.role === 'CEO';
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Power Electronics');
  const [brand, setBrand] = useState('Intelligent');
  const [model, setModel] = useState('');
  const [unitPrice, setUnitPrice] = useState(0);
  const [stockCount, setStockCount] = useState(1);
  const [warrantyPeriod, setWarrantyPeriod] = useState('1 Year Official Warranty');
  const [serialNumbersText, setSerialNumbersText] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const categories = ['All', ...Array.from(new Set((products || []).map(p => p.category)))];

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setCode('IT-' + Math.floor(1000 + Math.random() * 9000));
    setName('');
    setCategory('Power Electronics');
    setBrand('Intelligent Technician');
    setModel('');
    setUnitPrice(1000);
    setStockCount(10);
    setWarrantyPeriod('1 Year Official Replacement Warranty');
    setSerialNumbersText('');
    setDescription('');
    setImageUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setCode(p.code);
    setName(p.name);
    setCategory(p.category);
    setBrand(p.brand);
    setModel(p.model);
    setUnitPrice(p.unitPrice);
    setStockCount(p.stockCount);
    setWarrantyPeriod(p.warrantyPeriod);
    setSerialNumbersText((p.serialNumbers || []).join(', '));
    setDescription(p.description || '');
    setImageUrl(p.imageUrl || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const snList = serialNumbersText
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (editingProduct) {
      const updated = (products || []).map(p => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            code,
            name,
            category,
            brand,
            model,
            unitPrice: Number(unitPrice),
            stockCount: Number(stockCount),
            warrantyPeriod,
            serialNumbers: snList,
            description,
            imageUrl,
          };
        }
        return p;
      });
      onSaveProducts(updated);
    } else {
      const newProd: Product = {
        id: 'prod-' + Date.now(),
        code,
        name,
        category,
        brand,
        model,
        unitPrice: Number(unitPrice),
        stockCount: Number(stockCount),
        warrantyPeriod,
        serialNumbers: snList,
        description,
        imageUrl,
        createdAt: new Date().toISOString(),
      };
      onSaveProducts([...(products || []), newProd]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(language === 'bn' ? 'আপনি কি নিশ্চিত যে এই পণ্যটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this product?')) {
      onSaveProducts((products || []).filter(p => p.id !== id));
    }
  };

  const filtered = (products || []).filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.serialNumbers || []).some(sn => sn.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">
                {language === 'bn' ? 'ইনভেন্টরি ও প্রোডাক্ট গ্যালারি' : 'Inventory & Product Catalog'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'bn'
                  ? 'পণ্যের স্টক, ইউনিট মূল্য, অফিসিয়াল ওয়ারেন্টি ও সিরিয়াল নম্বর (S/N) তালিকা'
                  : 'Manage unit prices, live stock, warranty schedules, and individual serial numbers (S/N).'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenScanner}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Scan className="w-4 h-4 text-blue-400" />
            <span>{language === 'bn' ? 'বারকোড স্ক্যান' : 'Scan S/N'}</span>
          </button>

          {isCeo && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'bn' ? 'নতুন পণ্য যুক্ত করুন' : 'Add New Product'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={language === 'bn' ? 'নাম, মডেল বা সিরিয়াল নং দিয়ে খুঁজুন...' : 'Search by Name, Model, or Serial #...'}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(product => (
          <div
            key={product.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 shadow-lg flex flex-col justify-between transition-all group"
          >
            <div>
              {/* Image & Category Tag */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {product.category}
                </span>
                <span className="text-xs font-mono text-slate-500">{product.code}</span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                {product.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {product.brand} • Model: <span className="font-mono text-slate-300">{product.model}</span>
              </p>

              {/* Price & Stock Stats */}
              <div className="grid grid-cols-2 gap-2 my-4 p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Unit Price</span>
                  <span className="text-sm font-extrabold text-white">৳ {product.unitPrice.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Available Stock</span>
                  <span className={`text-sm font-bold ${product.stockCount > 5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {product.stockCount} units
                  </span>
                </div>
              </div>

              {/* Warranty Badge */}
              <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-3 bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-700/50">
                <Shield className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="truncate">{product.warrantyPeriod}</span>
              </div>

              {/* Serial Numbers Pill list */}
              {(product.serialNumbers || []).length > 0 && (
                <div className="mb-3">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5 flex items-center gap-1">
                    <Barcode className="w-3 h-3 text-blue-400" />
                    <span>Loaded Serial Numbers (S/N)</span>
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(product.serialNumbers || []).slice(0, 4).map(sn => (
                      <span
                        key={sn}
                        className="px-2 py-0.5 bg-slate-800 rounded text-[10px] font-mono text-slate-300 border border-slate-700"
                      >
                        {sn}
                      </span>
                    ))}
                    {(product.serialNumbers || []).length > 4 && (
                      <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] font-mono text-blue-400">
                        +{(product.serialNumbers || []).length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions (Edit/Delete for CEO only) */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {(product.serialNumbers || []).length} tracked S/N
              </span>

              {isCeo && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(product)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                    title="Edit Product"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Product Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-400" />
                <span>{editingProduct ? 'Edit Product Item' : 'Add New Product to Inventory'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Product Code / SKU *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="e.g. Power Electronics"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Solar Hybrid Inverter 5KW"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Brand</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    placeholder="Brand name"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Model #</label>
                  <input
                    type="text"
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    placeholder="e.g. IP-5500H"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Unit Price (BDT ৳) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={unitPrice}
                    onChange={e => setUnitPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={stockCount}
                    onChange={e => setStockCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Warranty Period Terms *</label>
                <input
                  type="text"
                  required
                  value={warrantyPeriod}
                  onChange={e => setWarrantyPeriod(e.target.value)}
                  placeholder="e.g. 2 Years Full Replacement Warranty"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Serial Numbers (S/N) (Comma or newline separated)
                </label>
                <textarea
                  rows={3}
                  value={serialNumbersText}
                  onChange={e => setSerialNumbersText(e.target.value)}
                  placeholder="INV-2026-001, INV-2026-002, INV-2026-003"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
