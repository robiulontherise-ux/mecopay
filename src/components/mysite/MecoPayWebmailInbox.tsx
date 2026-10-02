import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
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
import { supabase } from '../../lib/supabase';
import InAppFileViewerModal from './InAppFileViewerModal';

interface IncomingEmail {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  body_text: string;
  attachments?: string[] | null;
  created_at: string;
}

interface MecoPayWebmailInboxProps {
  activeDomain: string;
  brandName?: string;
  createdEmails: string[];
}

export default function MecoPayWebmailInbox({
  activeDomain,
  brandName,
  createdEmails
}: MecoPayWebmailInboxProps) {
  const [emails, setEmails] = useState<IncomingEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMailbox, setSelectedMailbox] = useState<string>('all');
  const [activeEmail, setActiveEmail] = useState<IncomingEmail | null>(null);

  // In-App File Viewer Modal State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFileUrl, setViewerFileUrl] = useState('');
  const [viewerFileName, setViewerFileName] = useState('');

  // Fetch Emails from incoming_emails
  const loadEmails = async () => {
    if (!activeDomain) {
      setEmails([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let query = supabase
        .from('incoming_emails')
        .select('*')
        .order('created_at', { ascending: false });

      const cleanDom = activeDomain.trim().toLowerCase();
      if (selectedMailbox && selectedMailbox !== 'all') {
        query = query.ilike('recipient', `%${selectedMailbox}%`);
      } else {
        query = query.or(`recipient.ilike.%@${cleanDom}%,recipient.ilike.%${cleanDom}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching incoming emails:', error);
      } else {
        setEmails(data || []);
        if (data && data.length > 0 && !activeEmail) {
          setActiveEmail(data[0]);
        }
      }
    } catch (err) {
      console.error('Incoming emails error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmails();
  }, [activeDomain, selectedMailbox]);

  // Realtime subscription for incoming emails
  useEffect(() => {
    if (!activeDomain) return;

    const channel = supabase
      .channel(`incoming_emails_realtime_${activeDomain}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'incoming_emails'
        },
        (payload) => {
          const newMsg = payload.new as IncomingEmail;
          if (newMsg.recipient?.toLowerCase().includes(`@${activeDomain.toLowerCase()}`)) {
            setEmails((prev) => [newMsg, ...prev]);
            if (!activeEmail) {
              setActiveEmail(newMsg);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeDomain]);

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
    </div>
  );
}
