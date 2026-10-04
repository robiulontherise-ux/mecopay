import React, { useState, useEffect } from 'react';
import { 
  Inbox,
  Send,
  Plus,
  X,
  AlertTriangle, 
  Search, 
  RefreshCw, 
  Paperclip, 
  Clock, 
  User, 
  FileText, 
  Image as ImageIcon, 
  Eye, 
  Download, 
  Mail, 
  CheckCircle2, 
  ArrowLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { supabase, supabaseUrl, supabaseAnonKey } from '../../lib/supabase';
import InAppFileViewerModal from './InAppFileViewerModal';

interface IncomingEmail {
  id: string;
  user_id?: string | null;
  brand_id?: string | null;
  sender: string;
  recipient: string;
  subject: string;
  body_text: string;
  attachments?: string[] | null;
  created_at: string;
}

interface MecoPayWebmailInboxProps {
  activeDomain: string;
  brandId?: string;
  brandName?: string;
  createdEmails: string[];
  isEmailServiceActive?: boolean;
}

export default function MecoPayWebmailInbox({
  activeDomain,
  brandId,
  brandName,
  createdEmails,
  isEmailServiceActive = true
}: MecoPayWebmailInboxProps) {
  const [emails, setEmails] = useState<IncomingEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMailbox, setSelectedMailbox] = useState<string>('all');
  const [activeEmail, setActiveEmail] = useState<IncomingEmail | null>(null);
  // Compose Mail Modal State
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeFrom, setComposeFrom] = useState('');
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [composeStatus, setComposeStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });

  // Update default compose from email
  useEffect(() => {
    if (createdEmails && createdEmails.length > 0) {
      setComposeFrom(createdEmails[0]);
    } else if (activeDomain) {
      setComposeFrom('info@' + activeDomain);
    }
  }, [createdEmails, activeDomain]);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailServiceActive) {
      setComposeStatus({ type: 'error', message: 'সার্ভিস Inactive থাকায় ইমেইল পাঠানো সম্ভব নয়!' });
      return;
    }
    if (!composeTo.trim() || !composeSubject.trim()) {
      setComposeStatus({ type: 'error', message: 'Recipient and Subject are required.' });
      return;
    }
    setSendingEmail(true);
    setComposeStatus({ type: 'idle', message: '' });
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setComposeStatus({ type: 'error', message: 'User session not found. Please log in again.' });
        return;
      }

      // Direct Supabase Client insert (100% Cloudflare Pages compatible)
      const { error: insertError } = await supabase
        .from('incoming_emails')
        .insert({
          user_id: user.id,
          brand_id: brandId || null,
          sender: composeFrom,
          recipient: composeTo.trim(),
          subject: composeSubject.trim(),
          body_text: composeBody,
          direction: 'outbound'
        });

      if (insertError) {
        throw insertError;
      }

      setComposeStatus({ type: 'success', message: 'Email sent successfully!' });
      loadEmails();
      setTimeout(() => {
        setComposeOpen(false);
        setComposeSubject('');
        setComposeBody('');
        setComposeStatus({ type: 'idle', message: '' });
      }, 1500);
    } catch (err: any) {
      setComposeStatus({ type: 'error', message: err.message || 'Failed to dispatch email' });
    } finally {
      setSendingEmail(false);
    }
  };

  // In-App File Viewer Modal State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFileUrl, setViewerFileUrl] = useState('');
  const [viewerFileName, setViewerFileName] = useState('');

  // Fetch Emails from incoming_emails
  const loadEmails = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      // Always scope the database query before data reaches the browser.
      // A selected mailbox is identified by its recipient address. For the
      // aggregate view, scope by brand_id (or authenticated user_id fallback).
      let query = supabase
        .from('incoming_emails')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      const hasSelectedMailbox = selectedMailbox && selectedMailbox !== 'all';

      if (hasSelectedMailbox) {
        // Do not additionally require brand_id here: existing inbound rows may
        // have a NULL/legacy brand_id, while the mailbox address is canonical.
        query = query.eq('recipient', selectedMailbox.trim());
      } else if (brandId) {
        query = query.eq('brand_id', brandId);
      } else {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          setEmails([]);
          setActiveEmail(null);
          return;
        }
        query = query.eq('user_id', user.id);
      }

      if (!hasSelectedMailbox && !brandId && activeDomain?.trim()) {
        // When user_id is the scope, keep the domain restriction in the DB too.
        query = query.ilike('recipient', `%${activeDomain.trim().toLowerCase()}%`);
      }

      const { data, error } = await query;
      console.info('[MecoPay Inbox] incoming_emails query response', {
        selectedMailbox,
        brandId: brandId || null,
        activeDomain,
        rowCount: data?.length || 0,
        error
      });
      if (error) throw error;

      const nextEmails: IncomingEmail[] = data || [];
      setEmails(nextEmails);
      setActiveEmail((current) => {
        if (!nextEmails.length) return null;
        return current && nextEmails.some((email) => email.id === current.id)
          ? current
          : nextEmails[0];
      });
    } catch (err: any) {
      console.error('Incoming emails error:', err);
      setFetchError(err?.message || 'Supabase থেকে email data fetch করা যায়নি।');
      setEmails([]);
      setActiveEmail(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmails();
  }, [activeDomain, brandId, selectedMailbox]);

  // Realtime subscription for incoming emails
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    const subscribeToScopedEmails = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled || (!brandId && !user)) return;

      channel = supabase
        .channel(`incoming_emails_realtime_${brandId || user?.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'incoming_emails'
          },
          (payload) => {
            const newMsg = payload.new as IncomingEmail;
            const mailbox = selectedMailbox.trim().toLowerCase();
            const matchesMailbox = selectedMailbox === 'all'
              || newMsg.recipient?.toLowerCase().includes(mailbox);
            const matchesOwner = selectedMailbox !== 'all'
              ? true
              : brandId
                ? newMsg.brand_id === brandId
                : newMsg.user_id === user?.id;
            const matchesDomain = brandId || !activeDomain
              ? true
              : newMsg.recipient?.toLowerCase().includes(activeDomain.trim().toLowerCase());

            if (matchesOwner && matchesMailbox && matchesDomain) {
              setEmails((prev) => {
                if (prev.some((e) => e.id === newMsg.id)) return prev;
                return [newMsg, ...prev];
              });
              setActiveEmail((current) => current || newMsg);
            }
          }
        )
        .subscribe();
    };

    subscribeToScopedEmails();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [activeDomain, brandId, selectedMailbox]);

  // Filtered emails by search
  const filteredEmails = emails.filter((em) => {
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

  const formatEmailDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[620px]">
      {/* Inbox Header Bar */}
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">
                MecoPay Webmail Inbox
              </h3>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Live Sync
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure Cloud Mailbox for <strong className="font-mono text-emerald-400">{activeDomain}</strong>
            </p>
          </div>
        </div>

        {/* Right Header Filters & Refresh */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mailbox Selector */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedMailbox}
              onChange={(e) => setSelectedMailbox(e.target.value)}
              className="bg-transparent text-xs text-white font-medium outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Mailboxes (@{activeDomain})</option>
              {createdEmails.map((em) => (
                <option key={em} value={em} className="bg-slate-900">
                  {em}
                </option>
              ))}
            </select>
          </div>

          {/* Compose Email Button (Disabled if Service is Inactive) */}
          <button
            type="button"
            onClick={() => setComposeOpen(true)}
            disabled={!isEmailServiceActive}
            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 transition-all"
            title={!isEmailServiceActive ? "ইমেইল সার্ভিস Inactive থাকায় সেন্ড ব্লক রয়েছে" : "নতুন মেইল পাঠান"}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Compose Email</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={loadEmails}
            disabled={loading}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-800 rounded-xl transition-all"
            title="Refresh Inbox"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Gmail-like 2-Column Split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Column: Email List (5 cols on lg) */}
        <div className="lg:col-span-5 border-r border-slate-800 flex flex-col bg-slate-950/40">
          {/* Search Box */}
          <div className="p-3 border-b border-slate-800/80">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sender, subject, or message..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Email Items Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 max-h-[560px]">
            {loading ? (
              <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                <span>ইমেইল ডাটা লোড হচ্ছে...</span>
              </div>
            ) : fetchError ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-rose-300">Email data fetch failed</p>
                  <p className="text-xs text-rose-400/80 mt-2 break-words">{fetchError}</p>
                  <button
                    type="button"
                    onClick={loadEmails}
                    className="mt-4 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-700"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : filteredEmails.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                  <Inbox className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">No Emails Found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {searchQuery ? 'আপনার সার্চের সাথে কোনো ইমেইল মেলেনি।' : 'এই ডোমেইন বা মেইলবক্সে এখনো কোনো ইমেইল আসেনি।'}
                  </p>
                </div>
              </div>
            ) : (
              filteredEmails.map((em) => {
                const isSelected = activeEmail?.id === em.id;
                const hasAttachments = Array.isArray(em.attachments) && em.attachments.length > 0;
                const cleanSender = em.sender?.replace(/<.*?>/, '').trim() || em.sender || 'Unknown Sender';

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
                    {/* Sender Initial Avatar */}
                    <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-700/60">
                      {cleanSender.charAt(0).toUpperCase() || 'M'}
                    </div>

                    {/* Content Preview */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`text-xs truncate ${isSelected ? 'font-bold text-white' : 'font-semibold text-slate-200'}`}>
                          {cleanSender}
                        </span>
                        <span className="text-[10px] text-slate-500 whitespace-nowrap">
                          {formatEmailDate(em.created_at)}
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
                          To: {em.recipient}
                        </span>
                        {hasAttachments && (
                          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
                            <Paperclip className="w-3 h-3" />
                            {em.attachments!.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Email Detail View (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col bg-slate-900/30">
          {!activeEmail ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500">
              <Mail className="w-12 h-12 mb-3 text-slate-600" />
              <h4 className="text-base font-bold text-white">Select an Email to Read</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                বামপাশের তালিকা থেকে যেকোনো ইমেইলে ক্লিক করুন পুরো মেসেজ ও এটাচমেন্ট প্রিভিউ দেখতে।
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-y-auto max-h-[600px]">
              
              {/* Email Detail Header */}
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
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                      {activeEmail.sender?.charAt(0).toUpperCase() || 'M'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">
                          {activeEmail.sender}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                        To: <span className="text-emerald-400 font-semibold">{activeEmail.recipient}</span>
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg shrink-0 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Delivery
                  </span>
                </div>
              </div>

              {/* Email Body Content */}
              <div className="p-5 sm:p-6 flex-1 text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap selection:bg-emerald-500/20">
                {activeEmail.body_text ? (
                  activeEmail.body_text
                ) : (
                  <span className="text-slate-500 italic">No plain text content in this email.</span>
                )}
              </div>

              {/* Gmail-style Attachments Card Grid */}
              {Array.isArray(activeEmail.attachments) && activeEmail.attachments.length > 0 && (
                <div className="p-5 border-t border-slate-800 bg-slate-950/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-emerald-400" />
                      Attachments ({activeEmail.attachments.length})
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Click to preview inside MecoPay Dashboard
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {activeEmail.attachments.map((fileUrl, idx) => {
                      const cleanUrl = fileUrl.trim();
                      const lower = cleanUrl.toLowerCase();
                      const isImg = /\.(jpeg|jpg|png|webp|gif|svg)(\?.*)?$/i.test(lower);
                      const isPdf = /\.pdf(\?.*)?$/i.test(lower);
                      const rawFileName = cleanUrl.split('/').pop()?.split('?')[0] || `Attachment_${idx + 1}`;

                      return (
                        <div
                          key={idx}
                          onClick={() => openFileViewer(cleanUrl, rawFileName)}
                          className="group relative bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl overflow-hidden transition-all shadow-md hover:shadow-emerald-500/5 cursor-pointer flex flex-col"
                        >
                          {/* Card Preview Area */}
                          <div className="h-28 bg-slate-950/70 flex items-center justify-center overflow-hidden border-b border-slate-800/80 group-hover:bg-slate-950/90 transition-colors">
                            {isImg ? (
                              <img
                                src={cleanUrl}
                                alt={rawFileName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : isPdf ? (
                              <div className="flex flex-col items-center gap-1.5 text-rose-400">
                                <FileText className="w-9 h-9" />
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 px-2 py-0.5 rounded">
                                  PDF Document
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1.5 text-emerald-400">
                                <FileText className="w-9 h-9" />
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded">
                                  MecoPay Vault File
                                </span>
                              </div>
                            )}

                            {/* Hover Overlay Button */}
                            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <span className="px-3 py-1.5 bg-emerald-500 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg">
                                <Eye className="w-3.5 h-3.5" />
                                Preview
                              </span>
                            </div>
                          </div>

                          {/* Card Footer Info */}
                          <div className="p-2.5 flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-slate-200 truncate" title={rawFileName}>
                              {rawFileName}
                            </span>
                            <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

      </div>

      {/* In-App File Viewer Modal (Opens directly in dashboard, no new tab!) */}
      <InAppFileViewerModal
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        fileUrl={viewerFileUrl}
        fileName={viewerFileName}
      />
    
      {/* Compose Email Modal */}
      {composeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">New Message</h4>
                  <p className="text-[11px] text-slate-400">MecoPay Outbound Delivery Engine</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setComposeOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="p-5 space-y-4">
              {!isEmailServiceActive && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>ইমেইল সার্ভিস Inactive থাকায় বর্তমানে মেইল সেন্ড করা যাবে না।</span>
                </div>
              )}

              {composeStatus.type === 'error' && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{composeStatus.message}</span>
                </div>
              )}

              {composeStatus.type === 'success' && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{composeStatus.message}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">From (প্রেরক)</label>
                <select
                  value={composeFrom}
                  onChange={(e) => setComposeFrom(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-emerald-400 font-mono outline-none"
                >
                  {createdEmails.length > 0 ? (
                    createdEmails.map((em) => (
                      <option key={em} value={em} className="bg-slate-900 text-white">
                        {em}
                      </option>
                    ))
                  ) : (
                    <option value={"info@" + activeDomain} className="bg-slate-900 text-white">
                      info@{activeDomain}
                    </option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">To (প্রাপক)</label>
                <input
                  type="email"
                  required
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="client@example.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Enter email subject"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Message Body</label>
                <textarea
                  rows={5}
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Write your message here..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setComposeOpen(false)}
                  className="px-4 py-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail || !isEmailServiceActive}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 transition-all"
                  title={!isEmailServiceActive ? 'সার্ভিস Inactive থাকায় সেন্ড বন্ধ' : 'Send'}
                >
                  {sendingEmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Send Email</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

</div>
  );
}
