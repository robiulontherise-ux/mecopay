import React, { useState, useEffect } from 'react';
import { showToast } from '../../lib/toast';
import { supabase } from '../../lib/supabase';
import { Search, Filter, Trash2, Copy, Download, Eye, X, CheckCircle2, ExternalLink } from 'lucide-react';

export default function Invoices({ brands }: { brands: any[] }) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [methodFilter, setMethodFilter] = useState('All Methods');
  
  // Gateways set up by client to populate method filter
  const [clientGateways, setClientGateways] = useState<string[]>([]);
  
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [smsEventData, setSmsEventData] = useState<any>(null);
  const [isLoadingSms, setIsLoadingSms] = useState(false);

  // Selection & Deletion State
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [bulkError, setBulkError] = useState('');

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedInvoiceIds(filteredInvoices.map(inv => inv.id));
    } else {
      setSelectedInvoiceIds([]);
    }
  };

  const handleSelectSingle = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedInvoiceIds(prev => [...prev, id]);
    } else {
      setSelectedInvoiceIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleDeleteSelected = async () => {
    if (deleteInput.toLowerCase() !== 'delete') return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('invoices').delete().in('id', selectedInvoiceIds);
      if (error) throw error;
      setInvoices(prev => prev.filter(inv => !selectedInvoiceIds.includes(inv.id)));
      setSelectedInvoiceIds([]);
      setShowDeleteModal(false);
      setDeleteInput('');
      showToast("Invoices deleted successfully", "success");
    } catch (err: any) {
      console.error(err);
      showToast("Failed to delete invoices", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchGateways();
  }, []);

  const handleViewInvoice = async (inv: any) => {
    setSelectedInvoice(inv);
    setSmsEventData(null);
    
    // Default fallback note
    let metadataObj: any = { note: "No transaction ID provided for this invoice." };
    
    if (inv.trx_id) {
      setIsLoadingSms(true);
      try {
        // Find by extracted trx_id
        const { data } = await supabase.from('sms_events').select('*').ilike('trx_id_extracted', inv.trx_id).maybeSingle();
        
        if (data) {
          metadataObj = data;
        } else {
          metadataObj = { note: "No SMS event found for this transaction ID." };
        }
      } catch (e) {
        console.error("Could not fetch sms_events", e);
        metadataObj = { note: "Could not fetch SMS events. Check permissions or table existence." };
      } finally {
        setIsLoadingSms(false);
      }
    }
    
    // If we have custom metadata saved during manual verify failure, merge it or overwrite note
    if (inv.metadata) {
       metadataObj = { ...metadataObj, ...inv.metadata };
    }
    
    setSmsEventData(metadataObj);
  };

  const fetchGateways = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from('payment_numbers').select('provider').eq('user_id', user.id);
      if (!error && data) {
        const unique = Array.from(new Set(data.map(d => d.provider.toUpperCase())));
        setClientGateways(unique);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: invoicesData, error: invError } = await supabase
        .from('invoices')
        .select(`
          *,
          brand:brands(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (invError) throw invError;

      const { data: linksData, error: linksError } = await supabase
        .from('payment_links')
        .select('id, product_name, redirect_link')
        .eq('user_id', user.id);

      if (linksError) {
        console.error("Failed to fetch payment links for mapping:", linksError);
      }

      const mergedInvoices = (invoicesData || []).map(inv => {
        const linkInfo = (linksData || []).find(l => l.id === inv.payment_link_id);
        return {
          ...inv,
          product_name: inv.product_name || linkInfo?.product_name || 'N/A',
          redirect_link: inv.redirect_link || linkInfo?.redirect_link || ''
        };
      });

      setInvoices(mergedInvoices);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateInvoiceStatus = async (invoiceId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('invoices').update({ status: newStatus }).eq('id', invoiceId);
      if (error) throw error;
      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: newStatus } : inv));
      if (selectedInvoice && selectedInvoice.id === invoiceId) {
        setSelectedInvoice({ ...selectedInvoice, status: newStatus });
      }
      showToast(`Status updated to ${newStatus}!`, "success");

      // 🚀 Trigger Edge Function 'send-notification' automatically when status is 'Completed'
      if (newStatus.toLowerCase() === 'completed') {
        const targetInv = invoices.find(i => i.id === invoiceId) || selectedInvoice;
        if (targetInv) {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            const authHeader = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};

            supabase.functions.invoke('send-notification', {
              body: {
                action: 'send_notification',
                brand_id: targetInv.brand_id,
                customer_phone: targetInv.sender_number || targetInv.customer_phone,
                customer_email: targetInv.customer_email,
                customer_name: targetInv.customer_name || 'Customer',
                amount: targetInv.amount,
                trx_id: targetInv.trx_id,
                product_type: targetInv.product_type || 'digital',
                invoice_no: targetInv.id,
                product_name: targetInv.product_name
              },
              headers: authHeader
            }).then(({ data, error: fnErr }) => {
              if (fnErr) {
                console.warn('Auto notification dispatch error:', fnErr);
              } else if (data?.channel) {
                showToast(`Receipt dispatched via ${data.channel.toUpperCase()}!`, 'success');
              }
            });
          } catch (_e) {}
        }
      }
    } catch (err: any) {
      showToast("Failed to update!", "error");
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    let match = true;
    if (statusFilter === 'Manual Verify') {
      if (inv.status?.toLowerCase() !== 'pending' || !inv.trx_id) {
        match = false;
      }
    } else if (statusFilter !== 'All Status' && inv.status?.toUpperCase() !== statusFilter.toUpperCase()) {
      match = false;
    }
    if (methodFilter !== 'All Methods' && inv.gateway_used?.toUpperCase() !== methodFilter.toUpperCase()) {
      match = false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const searchStr = `${inv.id} ${inv.customer_email} ${inv.customer_name} ${inv.sender_number} ${inv.amount}`.toLowerCase();
      if (!searchStr.includes(term)) {
        match = false;
      }
    }
    return match;
  });



  const handleDownload = (inv: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast("Allow popups to print!", "error");
      return;
    }
    
    const html = `
      <html>
        <head>
          <title>Invoice - ${inv.id}</title>
          <style>
            body { font-family: system-ui, sans-serif; color: #333; line-height: 1.5; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 2px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; }
            .title { font-size: 24px; font-weight: bold; color: #0ea5e9; margin: 0; }
            .subtitle { color: #666; font-size: 14px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 15px; }
            .col { flex: 1; }
            .label { font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 4px; }
            .value { font-size: 16px; font-weight: 500; }
            .table { w-full; border-collapse: collapse; margin-top: 30px; width: 100%; }
            .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
            .table th { background: #f8fafc; font-weight: 600; color: #333; }
            .total { font-size: 20px; font-weight: bold; color: #0ea5e9; text-align: right; margin-top: 20px; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
            .badge-completed { background: #dcfce7; color: #166534; }
            .badge-pending { background: #fee2e2; color: #991b1b; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">${inv.brand?.name || 'MecoPay Merchant'}</h1>
              <div class="subtitle">Invoice #${inv.id}</div>
            </div>
            <div style="text-align: right;">
              <div class="badge ${inv.status?.toLowerCase() === 'completed' ? 'badge-completed' : 'badge-pending'}">${inv.status || 'PENDING'}</div>
              <div class="subtitle" style="margin-top: 8px;">${new Date(inv.created_at).toLocaleString()}</div>
            </div>
          </div>
          
          <div class="row">
            <div class="col">
              <div class="label">Bill To</div>
              <div class="value">${inv.customer_name || 'N/A'}</div>
              <div class="value">${inv.customer_email || ''}</div>
              <div class="value">${inv.customer_phone || ''}</div>
            </div>
            <div class="col">
              <div class="label">Payment Details</div>
              <div class="value">Method: ${inv.gateway_used || 'N/A'}</div>
              <div class="value">Sender: ${inv.sender_number || 'N/A'}</div>
              <div class="value">Txn ID: ${inv.trx_id || 'N/A'}</div>
            </div>
          </div>
          
          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${inv.product_name || 'Payment for Order/Service'}</td>
                <td style="text-align: right;">BDT ${inv.amount}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="total">Total: BDT ${inv.amount}</div>
          
          <div style="margin-top: 60px; font-size: 12px; color: #999; text-align: center;">
            This computer-generated invoice is valid without signature. Please keep it for payment reconciliation.
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    // Use setTimeout to ensure styles are loaded before printing
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Invoice Management</h2>
      </div>

      
      
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 whitespace-nowrap transition-colors">
          <span>+</span> Create Custom Invoice
        </button>
        <div className="flex-1 relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by ID, Email, Name, Sender No, or Amount..." 
            className="w-full bg-slate-900/60 border border-slate-700 text-slate-200 text-sm rounded-lg pl-9 pr-4 py-2.5 focus:border-blue-500 outline-none"
          />
        </div>
        <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg px-4 py-2.5 outline-none hidden sm:block">
          <option>All Methods</option>
          {clientGateways.map(gw => (
            <option key={gw} value={gw}>{gw}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg px-4 py-2.5 outline-none hidden sm:block">
          <option>All Status</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="Manual Verify">Manual Verify</option>
          <option value="Failed">Failed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Cut Invoice">Cut Invoices</option>
        </select>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col h-[calc(100vh-280px)] min-h-[400px] w-full">
        <div className="overflow-auto flex-1 relative">
          <table className="w-full text-left text-sm text-slate-400 min-w-[1000px]">
            <thead className="bg-slate-900 text-slate-300 uppercase font-bold text-xs sticky top-0 z-10">
              <tr>
                <th className="px-4 py-4 w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-700 bg-slate-800 cursor-pointer" 
                    checked={filteredInvoices.length > 0 && selectedInvoiceIds.length === filteredInvoices.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-4 py-4">Sender No</th>
                <th className="px-4 py-4">Customer Email</th>
                <th className="px-4 py-4">Product Name</th>
                <th className="px-4 py-4">Type</th>
                <th className="px-4 py-4">Brand Name</th>
                <th className="px-4 py-4">Method</th>
                <th className="px-4 py-4">Txn ID</th>
                <th className="px-4 py-4">Amount</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center">Loading invoices...</td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center">No invoices found</td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className={`${selectedInvoiceIds.includes(inv.id) ? 'bg-[#00E5FF]/5' : ''} hover:bg-slate-800/20 transition-colors group`}>
                    <td className="px-4 py-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-700 bg-slate-800 cursor-pointer" 
                        checked={selectedInvoiceIds.includes(inv.id)}
                        onChange={(e) => handleSelectSingle(inv.id, e)}
                      />
                    </td>
                    <td className="px-4 py-4 text-white font-medium">{inv.sender_number || 'N/A'}</td>
                    <td className="px-4 py-4">
                      <div>{inv.customer_email || inv.customer_name || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-300 max-w-[150px] truncate" title={inv.product_name || 'N/A'}>{inv.product_name || 'N/A'}</td>
                    <td className="px-4 py-4">
                      {inv.is_full_cod ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          100% COD
                        </span>
                      ) : inv.product_type === 'advance_cod' || (inv.product_type === 'physical' && inv.advance_amount && inv.advance_amount < inv.amount) ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Advance COD
                        </span>
                      ) : inv.product_type === 'physical' || inv.product_type === 'physical_full' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Physical (100% Paid)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          Digital (100% Paid)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">{inv.brand?.name || 'Unknown'}</td>
                    <td className="px-4 py-4 font-bold uppercase text-slate-300">{inv.gateway_used || '-'}</td>
                    <td className="px-4 py-4 font-mono text-xs">{inv.trx_id || '-'}</td>
                    <td className="px-4 py-4 font-bold text-white">৳{inv.amount}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center w-fit gap-1 ${
                        inv.status?.toLowerCase() === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        inv.status?.toLowerCase() === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                        inv.status?.toLowerCase() === 'cut invoice' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                        'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>
                        {inv.status?.toLowerCase() === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                        {inv.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs whitespace-nowrap">
                      {new Date(inv.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/checkout/${inv.payment_link_id}`);
                            showToast("Copied!", "success");
                          }}
                          className="text-indigo-400 hover:text-indigo-300" title="Copy Link"><Copy className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDownload(inv)}
                          className="text-emerald-400 hover:text-emerald-300" title="Download"><Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleViewInvoice(inv)}
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold text-xs"
                        >
                          <Eye className="w-4 h-4" /> View
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInvoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedInvoice(null)}></div>
          
          <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900/50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <Eye className="w-4 h-4 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Invoice Details</h2>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Identity Card */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Invoice Identity</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Invoice ID</p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-slate-200">{selectedInvoice.id}</span>
                        <button onClick={() => {
                          navigator.clipboard.writeText(selectedInvoice.id);
                          showToast("Copied!", "success");
                        }} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700 flex items-center gap-1 hover:bg-slate-700">
                          <Copy className="w-3 h-3"/> Copy
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Status</p>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center w-fit gap-1 ${
                          selectedInvoice.status?.toLowerCase() === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          selectedInvoice.status?.toLowerCase() === 'pending' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                          'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}>
                          {selectedInvoice.status?.toLowerCase() === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                          {selectedInvoice.status?.toUpperCase() || 'PENDING'}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Brand Name</p>
                        <p className="font-bold text-slate-200">{selectedInvoice.brand?.name || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Customer Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Customer Name</p>
                      <p className="font-semibold text-slate-200 text-sm">{selectedInvoice.customer_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Customer Email</p>
                      <p className="font-semibold text-slate-200 text-sm">{selectedInvoice.customer_email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Customer Phone</p>
                      <p className="font-semibold text-slate-200 text-sm">{selectedInvoice.customer_phone || 'No data'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Sender Number</p>
                      <p className="font-semibold text-slate-200 text-sm">{selectedInvoice.sender_number || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 md:col-span-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Order Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Product / Service Name</p>
                      <p className="font-semibold text-slate-200 text-sm">{selectedInvoice.product_name || 'N/A (Form / API Order)'}</p>
                    </div>
                    {selectedInvoice.redirect_link && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Secure Delivery Link (1-Time Access)</p>
                        <a 
                          href={`${window.location.origin}/access/${selectedInvoice.id}`}
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="font-bold text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 w-fit break-all"
                        >
                          {`${window.location.origin}/access/${selectedInvoice.id}`}
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Details */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Financial Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Amount</p>
                      <p className="font-bold text-white text-lg">৳ {selectedInvoice.amount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Currency</p>
                      <p className="font-semibold text-slate-200 text-sm">BDT</p>
                    </div>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Transaction Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Payment Method</p>
                      <p className="font-semibold text-slate-200 text-sm uppercase">{selectedInvoice.gateway_used || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Transaction ID (Txn ID)</p>
                      <p className="font-mono text-slate-200 text-sm">{selectedInvoice.trx_id || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Date</p>
                      <p className="font-semibold text-slate-200 text-sm">
                        {new Date(selectedInvoice.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* JSON Data from SMS Event */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 md:col-span-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">JSON Data (SMS Metadata)</h3>
                  <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 overflow-x-auto">
                    {isLoadingSms ? (
                      <p className="text-sm text-slate-500">Loading SMS data...</p>
                    ) : smsEventData ? (
                      <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap">
                        {JSON.stringify(smsEventData, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-sm text-slate-500">No metadata available.</p>
                    )}
                  </div>
                </div>
                
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 rounded-b-2xl flex justify-between items-center">
              <button onClick={() => setSelectedInvoice(null)} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-colors">
                Close
              </button>
              
              <div className="flex gap-3 items-center">
                {selectedInvoice.status?.toLowerCase() === 'pending' && (
                  <>
                    <button onClick={() => updateInvoiceStatus(selectedInvoice.id, 'Cancelled')} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-colors border border-slate-700">
                      Cancel
                    </button>
                    <button onClick={() => updateInvoiceStatus(selectedInvoice.id, 'Failed')} className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold rounded-lg transition-colors border border-rose-500/20">
                      Mark Failed
                    </button>
                  </>
                )}
                {selectedInvoice.status?.toLowerCase() === 'pending' && selectedInvoice.trx_id && (
                  <button onClick={() => updateInvoiceStatus(selectedInvoice.id, 'Completed')} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors shadow-lg">
                    Verify Manually
                  </button>
                )}
                <button onClick={() => handleDownload(selectedInvoice)} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg">
                  <Download className="w-4 h-4" /> Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white mb-2">Delete Invoices</h3>
              <p className="text-slate-400 text-sm">
                You are about to delete {selectedInvoiceIds.length} invoice(s). This action cannot be undone.
              </p>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Type <span className="text-rose-400 font-bold">delete</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:border-rose-500 transition-colors"
                placeholder="delete"
              />
            </div>
            <div className="p-6 bg-slate-800/50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteInput('');
                }}
                className="px-5 py-2.5 rounded-lg text-slate-300 font-bold hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={deleteInput.toLowerCase() !== 'delete' || isDeleting}
                onClick={handleDeleteSelected}
                className="px-5 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? 'Deleting...' : 'Delete Selected'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedInvoiceIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 border border-slate-700 p-3 sm:p-4 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-4 sm:gap-6 animate-in slide-in-from-bottom-8 fade-in duration-300">
          <div className="flex items-center gap-3">
            <span className="bg-rose-500/20 text-rose-400 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">{selectedInvoiceIds.length}</span>
            <span className="text-slate-200 font-medium whitespace-nowrap">Invoices Selected</span>
          </div>
          
          {bulkError ? (
            <div className="text-rose-400 font-bold text-sm bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 animate-in fade-in zoom-in">
              {bulkError}
            </div>
          ) : (
            <div className="w-px h-8 bg-slate-700 hidden sm:block"></div>
          )}

          <button 
            onClick={() => {
              const invalidSelections = invoices.filter(inv => 
                selectedInvoiceIds.includes(inv.id) && 
                (inv.status?.toLowerCase() === 'completed' || (inv.status?.toLowerCase() === 'pending' && inv.trx_id && inv.trx_id.trim().length > 0))
              );
              
              if (invalidSelections.length > 0) {
                setBulkError("Please unselect 'Completed' and 'Pending (Manual Verify)' invoices before deleting.");
                setTimeout(() => setBulkError(''), 4000);
                return;
              }
              
              setShowDeleteModal(true);
            }}
            className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-500/20 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected
          </button>
        </div>
      )}
    </div>
  );
}