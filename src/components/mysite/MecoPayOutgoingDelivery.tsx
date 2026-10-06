import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Search, 
  RefreshCw, 
  Paperclip, 
  Clock, 
  FileText, 
  Eye, 
  Mail, 
  CheckCircle2, 
  AlertTriangle,
  Inbox
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import InAppFileViewerModal from './InAppFileViewerModal';

interface OutgoingEmail {
  id: string;
  user_id?: string | null;
  brand_id?: string | null;
  sender: string;
  recipient: string;
  subject: string;
  body_text: string;
  direction?: string | null;
  status?: string | null;
  attachments?: string[] | null;
  created_at: string;
}

interface MecoPayOutgoingDeliveryProps {
  activeDomain: string;
  brandId?: string;
  brandName?: string;
}

export default function MecoPayOutgoingDelivery({
  activeDomain,
  brandId,
  brandName
}: MecoPayOutgoingDeliveryProps) {
  const [emails, setEmails] = useState<OutgoingEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEmail, setActiveEmail] = useState<OutgoingEmail | null>(null);

  // File Viewer
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFileUrl, setViewerFileUrl] = useState('');
  const [viewerFileName, setViewerFileName] = useState('');

  const loadSentEmails = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      let query = supabase
        .from('incoming_emails')
        .select('*')
        .or('direction.eq.outbound,status.eq.sent')
        .order('created_at', { ascending: false })
        .limit(100);

      if (brandId) {
        query = query.eq('brand_id', brandId);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          query = query.eq('user_id', user.id);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      const nextList: OutgoingEmail[] = data || [];
      setEmails(nextList);
      setActiveEmail((current) => {
        if (!nextList.length) return null;
        return current && nextList.some((e) => e.id === current.id) ? current : nextList[0];
      });
    } catch (err: any) {
      console.error('Outgoing emails fetch error:', err);
      setFetchError(err?.message || 'সুপাবেস থেকে আউটগোয়িং মেইল ডাটা লোড করা যায়নি।');
      setEmails([]);
      setActiveEmail(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSentEmails();
  }, [activeDomain, brandId]);

  const filtered = emails.filter((em) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (em.sender && em.sender.toLowerCase().includes(q)) ||
      (em.subject && em.subject.toLowerCase().includes(q)) ||
      (em.body_text && em.body_text.toLowerCase().includes(q)) ||
      (em.recipient && em.recipient.toLowerCase().includes(q))
    );
  });

  const openFileViewer = (url: string, name?: string) => {
    setViewerFileUrl(url);
    setViewerFileName(name || url.split('/').pop() || 'Attachment');
    setViewerOpen(true);
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[600px]">
      {/* Header Bar */}
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">
                Outgoing Sent Delivery
              </h3>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Live Outbox
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Sent messages for <strong className="font-mono text-emerald-400">{activeDomain}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipient or subject..."
              className="bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none w-48 sm:w-64"
            />
          </div>

          <button
            onClick={loadSentEmails}
            disabled={loading}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-800 rounded-xl transition-all"
            title="Refresh Sent"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main 2-Column Split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Column: Sent Items List (5 cols) */}
        <div className="lg:col-span-5 border-r border-slate-800 flex flex-col bg-slate-950/40">
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 max-h-[560px]">
            {loading ? (
              <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                <span>আউটগোয়িং মেইল লোড হচ্ছে...</span>
              </div>
            ) : fetchError ? (
              <div className="p-8 text-center space-y-3">
                <AlertTriangle className="w-6 h-6 text-rose-400 mx-auto" />
                <p className="text-xs text-rose-300">{fetchError}</p>
                <button
                  type="button"
                  onClick={loadSentEmails}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-700"
                >
                  Retry
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                  <Send className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">No Outgoing Emails</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {searchQuery ? 'সার্চের সাথে কোনো মেইল মেলেনি।' : 'এখনো কোনো আউটগোয়িং বা সেন্ট ইমেইল পাঠানো হয়নি।'}
                  </p>
                </div>
              </div>
            ) : (
              filtered.map((em) => {
                const isSelected = activeEmail?.id === em.id;
                const hasAttachments = Array.isArray(em.attachments) && em.attachments.length > 0;

                return (
                  <div
                    key={em.id}
                    onClick={() => setActiveEmail(em)}
                    className={`p-3.5 transition-all cursor-pointer select-none flex items-start gap-3 hover:bg-slate-800/40 ${
                      isSelected
                        ? 'bg-emerald-500/10 border-l-4 border-l-emerald-400'
                        : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-800 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-700/60">
                      <Send className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`text-xs truncate ${isSelected ? 'font-bold text-white' : 'font-semibold text-slate-200'}`}>
                          To: {em.recipient}
                        </span>
                        <span className="text-[10px] text-slate-500 whitespace-nowrap">
                          {formatDate(em.created_at)}
                        </span>
                      </div>

                      <h4 className={`text-xs truncate mb-1 ${isSelected ? 'font-bold text-emerald-300' : 'font-medium text-slate-300'}`}>
                        {em.subject || '(No Subject)'}
                      </h4>

                      <p className="text-[11px] text-slate-500 truncate line-clamp-1">
                        {em.body_text || 'No text preview available'}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1">
                        <span className="text-[10px] font-mono text-slate-500 truncate max-w-[150px]">
                          From: {em.sender}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                          Sent
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detail View (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-slate-900/30">
          {!activeEmail ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500">
              <Mail className="w-12 h-12 mb-3 text-slate-600" />
              <h4 className="text-base font-bold text-white">Select a Sent Email</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                বামপাশের তালিকা থেকে যেকোনো পাঠানো ইমেইল ক্লিক করে পূর্ণ বিবরণ দেখুন।
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-y-auto max-h-[600px]">
              {/* Header */}
              <div className="p-5 border-b border-slate-800 bg-slate-950/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-wide leading-snug">
                    {activeEmail.subject || '(No Subject)'}
                  </h2>
                  <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(activeEmail.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 pt-1">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Send className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        From: <span className="font-mono text-emerald-400">{activeEmail.sender}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                        To: <span className="text-slate-200 font-semibold">{activeEmail.recipient}</span>
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Delivered
                  </span>
                </div>
              </div>

              {/* Message Body */}
              <div className="p-6 flex-1 text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans select-text">
                {activeEmail.body_text || '(Empty Body)'}
              </div>

              {/* Attachments */}
              {Array.isArray(activeEmail.attachments) && activeEmail.attachments.length > 0 && (
                <div className="p-5 border-t border-slate-800 bg-slate-950/60 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-emerald-400" />
                    Attachments ({activeEmail.attachments.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {activeEmail.attachments.map((fileUrl, idx) => (
                      <div
                        key={idx}
                        onClick={() => openFileViewer(fileUrl)}
                        className="p-3 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl cursor-pointer flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-slate-300 truncate">Attachment {idx + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <InAppFileViewerModal
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        fileUrl={viewerFileUrl}
        fileName={viewerFileName}
      />
    </div>
  );
}
