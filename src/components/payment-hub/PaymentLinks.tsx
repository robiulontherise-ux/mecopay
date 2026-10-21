import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../lib/toast';
import { showConfirm } from '../../lib/confirm';
import { Copy, ExternalLink, Edit, Trash2, Plus, X } from 'lucide-react';
import type { SharedDashboardPageContext } from '../shared-dashboard/types';

interface PaymentLinksProps {
  brands: any[];
  sharedContext?: SharedDashboardPageContext;
}

export default function PaymentLinks({ brands, sharedContext }: PaymentLinksProps) {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const isSharedReadOnly = Boolean(sharedContext && !sharedContext.actions.includes('edit'));

  // Form State
  const [editId, setEditId] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [redirectLink, setRedirectLink] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  const [customFields, setCustomFields] = useState<any[]>([
    { name: 'Name', type: 'text', required: true },
    { name: 'Email', type: 'email', required: true },
    { name: 'Phone', type: 'tel', required: true }
  ]);

  const verifySharedAccess = async (action: 'view' | 'edit') => {
    if (!sharedContext) return;
    const { data, error } = await supabase.rpc('has_dashboard_page_access', {
      p_client_id: sharedContext.clientId,
      p_brand_id: sharedContext.brandId,
      p_page_key: 'payment_links',
      p_action: action,
    });
    if (error) throw error;
    if (data !== true) throw new Error(`Active shared ${action} access for Payment Links was not verified.`);
  };

  const fetchLinks = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setErrorMessage('');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required.');
      await verifySharedAccess('view');

      let query = supabase
        .from('payment_links')
        .select('*')
        .eq('user_id', sharedContext?.clientId || user.id);
      if (sharedContext) query = query.eq('brand_id', sharedContext.brandId);
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setLinks(data || []);
      return true;
    } catch (err: any) {
      console.error(err);
      const message = err?.message || 'Failed to load payment links.';
      setErrorMessage(message);
      showToast(message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sharedContext) setSelectedBrandId(sharedContext.brandId);
    else if (brands.length > 0 && !selectedBrandId) setSelectedBrandId(brands[0].id);
    void fetchLinks();
  }, [brands, sharedContext?.clientId, sharedContext?.brandId]);

  const handleCreateOrUpdate = async () => {
    if (!title || !amount || !selectedBrandId) {
      showToast("Please fill all fields!", 'error');
      return;
    }

    if (sharedContext && selectedBrandId !== sharedContext.brandId) {
      showToast('Only the shared brand can be used for Payment Links.', 'error');
      return;
    }

    // Validation for redirectLink based on allowed domains for this brand
    const selectedBrand = brands.find(b => b.id === selectedBrandId);
    if (selectedBrand && redirectLink) {
      const rl = redirectLink.toLowerCase();
      let isValid = false;

      // If it matches primary website
      if (selectedBrand.website_url && rl.includes(selectedBrand.website_url.toLowerCase().replace(/^https?:\/\//, ''))) isValid = true;
      if (selectedBrand.redirect_links?.allow_telegram && rl.includes('t.me/')) isValid = true;
      if (selectedBrand.redirect_links?.allow_facebook && rl.includes('facebook.com/')) isValid = true;
      if (selectedBrand.redirect_links?.allow_tally && rl.includes('tally.so/')) isValid = true;
      if (selectedBrand.redirect_links?.allow_drive && (rl.includes('drive.google.com/') || rl.includes('docs.google.com/'))) isValid = true;

      if (!isValid) {
        showToast("The provided link domain is not allowed. Please check Brand settings or use a valid allowed platform.", "error");
        return;
      }
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required.');
      await verifySharedAccess('edit');
      const ownerId = sharedContext?.clientId || user.id;
      const brandId = sharedContext?.brandId || selectedBrandId;

      const payload = {
        user_id: ownerId,
        brand_id: brandId,
        product_name: title,
        price: parseFloat(amount),
        product_image: imageUrl || 'https://i.postimg.cc/qqKpCcqV/BCO-3cfd8d70-7be6-4f9d-bcbe-c113f06c17da.png',
        redirect_link: redirectLink,
        payment_note: paymentNote,
        custom_fields: customFields
      };

      if (editId) {
        let updateQuery = supabase.from('payment_links').update(payload)
          .eq('id', editId)
          .eq('user_id', ownerId)
          .eq('brand_id', brandId);
        const { error } = await updateQuery;
        if (error) throw error;
      } else {
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);
        const { error } = await supabase.from('payment_links').insert({ ...payload, slug });
        if (error) throw error;
      }

      setIsCreating(false);
      const refreshed = await fetchLinks();
      if (!refreshed) return;
      showToast(editId ? "Updated successfully!" : "Created successfully!", "success");
    } catch (err: any) {
      console.error("Create error:", err);
      const message = err?.message || 'Failed to save payment link.';
      setErrorMessage(message);
      showToast(message, "error");
    }
  };

  const openCreateForm = () => {
    setIsCreating(true);
    setEditId('');
    setTitle('');
    setAmount('');
    setImageUrl('');
    setRedirectLink('');
    setPaymentNote('');
    if (brands.length > 0) setSelectedBrandId(brands[0].id);
    setCustomFields([
      { name: 'Name', type: 'text', required: true },
      { name: 'Email', type: 'email', required: true },
      { name: 'Phone', type: 'tel', required: true }
    ]);
  };

  const handleEditClick = (link: any) => {
    setIsCreating(true);
    setEditId(link.id);
    setTitle(link.product_name);
    setAmount(link.price.toString());
    setImageUrl(link.product_image || '');
    setSelectedBrandId(link.brand_id);
    setRedirectLink(link.redirect_link || '');
    setPaymentNote(link.payment_note || '');
    if (link.custom_fields && Array.isArray(link.custom_fields) && link.custom_fields.length > 0) {
      setCustomFields(link.custom_fields);
    } else {
      setCustomFields([
        { name: 'Name', type: 'text', required: true },
        { name: 'Phone', type: 'tel', required: true }
      ]);
    }
  };

  const addCustomField = () => {
    setCustomFields([...customFields, { name: '', type: 'text', required: true }]);
  };

  const updateCustomField = (index: number, key: string, value: any) => {
    const updated = [...customFields];
    updated[index][key] = value;
    setCustomFields(updated);
  };

  const removeCustomField = (index: number) => {
    const updated = [...customFields];
    updated.splice(index, 1);
    setCustomFields(updated);
  };

  const copyToClipboard = (slug: string) => {
    const url = `${window.location.origin}/pay/${slug}`;
    navigator.clipboard.writeText(url);
    showToast("Copied!", "success");
  };

  const handleDeleteLink = async (id: string) => {
    if (sharedContext && !sharedContext.actions.includes('edit')) {
      showToast('This shared Payment Links page is view-only.', 'error');
      return;
    }
    const res = await showConfirm({
      msg: "Are you sure you want to delete this payment link? Your past transaction records will be kept safe.",
      requireType: "delete"
    });
    if (res && res.confirmed) {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Authentication required.');
        await verifySharedAccess('edit');
        const ownerId = sharedContext?.clientId || user.id;
        const linkBrandId = sharedContext?.brandId || links.find(link => link.id === id)?.brand_id;
        if (!linkBrandId) throw new Error('Could not determine the payment link brand.');
        // Step 1: Detach the link from existing invoices so records are kept but link can be deleted
        const { error: invoiceError } = await supabase.from('invoices')
          .update({ payment_link_id: null })
          .eq('payment_link_id', id)
          .eq('user_id', ownerId)
          .eq('brand_id', linkBrandId);
        if (invoiceError) throw invoiceError;

        // Step 2: Delete the link itself
        const { error } = await supabase.from('payment_links')
          .delete()
          .eq('id', id)
          .eq('user_id', ownerId)
          .eq('brand_id', linkBrandId);

        if (error) throw error;

        setLinks(links.filter(l => l.id !== id));
        showToast("Deleted successfully!", "success");
      } catch (err: any) {
        const message = err?.message || 'Failed to delete payment link.';
        setErrorMessage(message);
        showToast(message, "error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Payment Links</h2>
        {!isCreating && !isSharedReadOnly && (
          <button
            onClick={openCreateForm}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
          >
            + Create Link
          </button>
        )}
      </div>
      {errorMessage && (
        <div role="alert" className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
          {errorMessage}
        </div>
      )}

      {!isCreating ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col h-[calc(100vh-250px)] min-h-[400px] w-full">
<div className="overflow-auto flex-1 relative">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#0f1523] text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">PRODUCT</th>
                  <th className="px-6 py-4">BRAND</th>
                  <th className="px-6 py-4">PAYMENT LINK / PRICE</th>
                  <th className="px-6 py-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
                ) : links.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No payment links created yet. Click "Create Link" to setup.
                    </td>
                  </tr>
                ) : (
                  links.map(link => {
                    const brandObj = brands.find(b => b.id === link.brand_id);
                    return (
                      <tr key={link.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {(link.product_image && link.product_image.trim() !== '') ? (
                              <img src={link.product_image} alt={link.product_name} className="w-10 h-10 rounded-lg object-cover bg-slate-800" />
                            ) : (
                              <img src="https://i.postimg.cc/qqKpCcqV/BCO-3cfd8d70-7be6-4f9d-bcbe-c113f06c17da.png" alt="Default Product" className="w-10 h-10 rounded-lg object-cover bg-slate-800" />
                            )}
                            <div className="font-bold text-white text-base truncate max-w-[120px] sm:max-w-[200px] md:max-w-xs">{link.product_name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {brandObj?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-emerald-400 font-bold mb-1">৳ {link.price}</div>
                          <div className="text-xs text-slate-500 font-mono bg-slate-900 px-2 py-1 rounded inline-block">
                            /{link.slug}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => copyToClipboard(link.slug)}
                              className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                              title="Copy Link"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <a
                              href={`/pay/${link.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
                              title="Open Link"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            {!isSharedReadOnly && <>
                              <button
                                onClick={() => handleEditClick(link)}
                                className="p-2 text-slate-400 hover:text-amber-400 transition-colors"
                                title="Edit Link"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteLink(link.id)}
                                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                                title="Delete Link"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
</div>
</div>
      ) : (
        <div>
          <button
            onClick={() => { setIsCreating(false); showToast("Cancelled", "error"); }}
            className="text-slate-400 hover:text-white mb-6 text-sm flex items-center gap-2"
          >
            ← Back to Payment Links
          </button>

          <div className="bg-[#1a2234] border border-slate-800 rounded-xl p-6 mb-8 max-w-2xl">
            <h3 className="text-xl font-bold text-white mb-6">{editId ? 'Edit Payment Link' : 'Create New Payment Link'}</h3>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Product Name *</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 focus:outline-none" placeholder="e.g. Premium Plan" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Price (BDT) *</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 focus:outline-none" placeholder="0.00" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Brand *</label>
                    <select value={selectedBrandId} onChange={e => setSelectedBrandId(e.target.value)} disabled={Boolean(sharedContext)} className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70">
                    {Array.isArray(brands) && brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Image URL</label>
                  <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 focus:outline-none" placeholder="https://..." />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Payment Note (max 500 character)</label>
                <textarea
                  placeholder="Any special instruction or details for the customer..."
                  maxLength={500}
                  rows={4}
                  value={paymentNote}
                  onChange={e => setPaymentNote(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 focus:outline-none placeholder-slate-600 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-[#0ea5e9] font-bold mb-4">Customer Input Fields</h4>

                <div className="space-y-3">
                  {customFields.map((field, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => updateCustomField(idx, 'name', e.target.value)}
                        placeholder="Field Name (e.g. Name)"
                        className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                      />
                      <select
                        value={field.type}
                        onChange={(e) => updateCustomField(idx, 'type', e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="text">text</option>
                        <option value="email">email</option>
                        <option value="tel">tel</option>
                        <option value="number">number</option>
                      </select>
                      <button
                        onClick={() => removeCustomField(idx)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={addCustomField}
                    className="text-[#0ea5e9] hover:text-blue-400 font-medium text-sm flex items-center gap-1 mt-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add New Field
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm text-slate-300">Redirect Link (after payment)</label>
                </div>

                {brands.find(b => b.id === selectedBrandId) && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {                                        (() => {
                      const b = brands.find(br => br.id === selectedBrandId);
                      if (!b) return null;

                      const links = [];
                      if (b.website_url) {
                        links.push(<button key="web" onClick={() => setRedirectLink(b.website_url)} className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors border border-slate-700">Primary Website</button>);
                      }
                      if (b?.redirect_links?.allow_telegram) {
                        links.push(<button key="tg" onClick={() => setRedirectLink('https://t.me/')} className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[#0088cc] rounded-full transition-colors border border-slate-700">Telegram</button>);
                      }
                      if (b?.redirect_links?.allow_facebook) {
                        links.push(<button key="fb" onClick={() => setRedirectLink('https://facebook.com/')} className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[#1877F2] rounded-full transition-colors border border-slate-700">Facebook</button>);
                      }
                      if (b?.redirect_links?.allow_tally) {
                        links.push(<button key="tally" onClick={() => setRedirectLink('https://tally.so/r/')} className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors border border-slate-700">Tally Form</button>);
                      }
                      if (b?.redirect_links?.allow_drive) {
                        links.push(<button key="drive" onClick={() => setRedirectLink('https://drive.google.com/')} className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-full transition-colors border border-slate-700">Google Drive/PDF</button>);
                      }

                      return links.length > 0 ? (
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="text-xs text-slate-500">Quick fill:</span>
                          {links}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">No platforms configured in Brand settings.</span>
                      );
                    })()}
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Paste any URL here (e.g. Website, Telegram Group, PDF link)"
                  value={redirectLink}
                  onChange={e => setRedirectLink(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 focus:outline-none placeholder-slate-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
                <button onClick={() => { setIsCreating(false); showToast("Cancelled", "error"); }} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={handleCreateOrUpdate} className="bg-[#0ea5e9] hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold transition-colors">
                  {editId ? 'Update Link' : 'Save Link'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
