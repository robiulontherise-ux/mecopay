import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Purchase, Post, SiteSettings } from '../types';
import { Package, Lock, ExternalLink, PlayCircle, Loader2 } from 'lucide-react';

interface CustomerPortalProps {
  user: any;
  siteSettings: SiteSettings | null;
}

export default function CustomerPortal({ user, siteSettings }: CustomerPortalProps) {
  const [activeTab, setActiveTab] = useState<'physical' | 'digital'>('physical');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [embeddedPageId, setEmbeddedPageId] = useState<string | null>(null);
  const [embeddedContent, setEmbeddedContent] = useState<Post | null>(null);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    if (user && siteSettings?.client_id) {
      loadPurchases();
    }
  }, [user, siteSettings]);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('purchases')
        .select(`
          *,
          post:post_id (*)
        `)
        .eq('customer_id', user.id)
        .eq('client_id', siteSettings!.client_id);

      if (siteSettings?.brand_id) {
        query = query.or(`brand_id.eq.${siteSettings.brand_id},brand_id.is.null`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
        
      if (error) throw error;
      setPurchases(data || []);
      
      // Auto-switch to digital tab if latest purchase is digital
      if (data && data.length > 0) {
        if (data[0].post?.product_type === 'digital') {
          setActiveTab('digital');
        }
      }
    } catch (err) {
      console.error('Error loading purchases:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEmbedded = async (pageId: string) => {
    if (embeddedPageId === pageId) {
      // Toggle off
      setEmbeddedPageId(null);
      setEmbeddedContent(null);
      return;
    }
    
    setEmbeddedPageId(pageId);
    setContentLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', pageId)
        .maybeSingle();
      if (error) throw error;
      setEmbeddedContent(data);
    } catch (err) {
      console.error('Error loading page content:', err);
    } finally {
      setContentLoading(false);
    }
  };

  const physicalPurchases = purchases.filter(p => p.post?.product_type === 'physical' || p.post?.product_type === 'just_form');
  const digitalPurchases = purchases.filter(p => p.post?.product_type === 'digital');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your orders and access your content</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('physical')}
          className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'physical' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Package className="w-4 h-4" />
          My Orders ({physicalPurchases.length})
        </button>
        <button
          onClick={() => setActiveTab('digital')}
          className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'digital' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Lock className="w-4 h-4" />
          My Access ({digitalPurchases.length})
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : activeTab === 'physical' ? (
        // PHYSICAL ORDERS
        <div className="space-y-4">
          {physicalPurchases.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
              You haven't purchased any physical products yet.
            </div>
          ) : (
            physicalPurchases.map(purchase => (
              <div key={purchase.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col md:flex-row md:items-center gap-4">
                {purchase.post?.thumbnail && (
                  <img src={purchase.post.thumbnail} alt="" className="w-16 h-16 object-cover rounded-lg bg-gray-100" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{purchase.post?.title || 'Unknown Product'}</h3>
                  <p className="text-sm text-gray-500">Ordered on {new Date(purchase.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col md:items-end gap-1">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    purchase.fulfillment_status === 'delivered' ? 'bg-green-100 text-green-700' :
                    purchase.fulfillment_status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {purchase.fulfillment_status.toUpperCase()}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">৳{purchase.amount}</span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        // DIGITAL ACCESS
        <div className="space-y-4">
          {digitalPurchases.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
              You don't have access to any digital products yet.
            </div>
          ) : (
            digitalPurchases.map(purchase => {
              const buttons = purchase.post?.digital_settings?.buttons || [];
              const isPaid = purchase.payment_status === 'paid';
              
              return (
                <div key={purchase.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                    {purchase.post?.thumbnail && (
                      <img src={purchase.post.thumbnail} alt="" className="w-16 h-16 object-cover rounded-lg bg-gray-100" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{purchase.post?.title || 'Unknown Product'}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {isPaid ? 'ACCESS GRANTED' : 'PAYMENT PENDING'}
                        </span>
                        <p className="text-sm text-gray-500">Added {new Date(purchase.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {isPaid && buttons.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {buttons.map((btn, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleOpenEmbedded(btn.page_id)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center gap-2 ${
                              embeddedPageId === btn.page_id 
                                ? 'bg-gray-100 text-gray-700 border border-gray-200' 
                                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-transparent'
                            }`}
                          >
                            <PlayCircle className="w-4 h-4" />
                            {btn.label || 'View Content'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Embedded Content View */}
                  {buttons.some(b => b.page_id === embeddedPageId) && (
                    <div className="border-t border-gray-100 bg-gray-50 p-6 animate-in slide-in-from-top-2">
                      {contentLoading ? (
                        <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
                      ) : embeddedContent ? (
                        <div className="prose prose-sm md:prose-base max-w-none prose-indigo">
                          <h2 className="!mt-0 !mb-4">{embeddedContent.title}</h2>
                          {embeddedContent.format_type === 'code' ? (
                            <pre className="bg-slate-900 text-white p-4 rounded-lg overflow-x-auto">
                              <code>{embeddedContent.content}</code>
                            </pre>
                          ) : (
                            <div dangerouslySetInnerHTML={{ __html: embeddedContent.content }} />
                          )}
                        </div>
                      ) : (
                        <div className="text-red-500 text-center py-4">Content not found.</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
