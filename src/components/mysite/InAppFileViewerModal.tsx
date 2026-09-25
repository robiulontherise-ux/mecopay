import React, { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, Maximize2, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface InAppFileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName?: string;
}

export default function InAppFileViewerModal({
  isOpen,
  onClose,
  fileUrl,
  fileName
}: InAppFileViewerModalProps) {
  const [zoom, setZoom] = useState(100);

  if (!isOpen || !fileUrl) return null;

  const cleanUrl = fileUrl.trim();
  const urlLower = cleanUrl.toLowerCase();
  const isImage = /\.(jpeg|jpg|png|webp|gif|svg)(\?.*)?$/i.test(urlLower);
  const isPdf = /\.pdf(\?.*)?$/i.test(urlLower);
  const isEml = /\.eml(\?.*)?$/i.test(urlLower);

  const displayName = fileName || cleanUrl.split('/').pop()?.split('?')[0] || 'Attachment';

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = cleanUrl;
    a.download = displayName;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              {isImage ? <ImageIcon className="w-4 h-4" /> : isPdf ? <FileText className="w-4 h-4 text-rose-400" /> : <FileText className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate max-w-md" title={displayName}>
                {displayName}
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                {isImage ? 'Image Preview' : isPdf ? 'Adobe PDF Document' : isEml ? 'Raw Email Container (.eml)' : 'Document Attachment'}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {isImage && (
              <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
                <button
                  onClick={() => setZoom((z) => Math.max(50, z - 25))}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-semibold text-slate-300 px-1">{zoom}%</span>
                <button
                  onClick={() => setZoom((z) => Math.min(250, z + 25))}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10"
              title="Download File"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors ml-1"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-slate-950/50 min-h-[300px]">
          {isImage ? (
            <div className="max-w-full max-h-full flex items-center justify-center transition-transform duration-150">
              <img
                src={cleanUrl}
                alt={displayName}
                style={{ transform: `scale(${zoom / 100})` }}
                className="max-h-[72vh] max-w-full object-contain rounded-xl shadow-2xl transition-transform origin-center"
              />
            </div>
          ) : isPdf ? (
            <div className="w-full h-[74vh] rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-inner">
              <iframe
                src={`${cleanUrl}#toolbar=1&navpanes=0`}
                title={displayName}
                className="w-full h-full border-0"
              />
            </div>
          ) : (
            <div className="text-center p-8 max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">{displayName}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  MecoPay Secure Storage-এ সুরক্ষিত সংরক্ষিত রয়েছে। আপনি সরাসরি ফাইলটি ডাউনলোড করতে পারেন অথবা আপনার কম্পিউটারের ডিফল্ট ভিউয়ারে দেখতে পারেন।
                </p>
              </div>
              <button
                onClick={handleDownload}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/10"
              >
                <Download className="w-4 h-4" />
                Download Attachment File
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
