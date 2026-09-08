const fs = require('fs');
let content = fs.readFileSync('src/components/payment-hub/PaymentLinks.tsx', 'utf8');

const oldBlock = `                    (() => {
                      const b = brands.find(br => br.id === selectedBrandId);
                      if (!b) return null;
                      
                      const links = [];
                      if (b.website_url) {
                        links.push(<button key="web" onClick={() => setRedirectLink(b.website_url)} className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors border border-slate-700">Primary Website</button>);
                      }
                      if (b?.redirect_links?.allow_telegram) {
                        links.push(<button key="tg" onClick={() => setRedirectLink('https://t.me/')} className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[#0088cc] rounded-full transition-colors border border-slate-700">Telegram</button>);
                      }
                      if (b?.redirect_links?.allow_whatsapp) {
                        links.push(<button key="wa" onClick={() => setRedirectLink('https://wa.me/')} className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[#25D366] rounded-full transition-colors border border-slate-700">WhatsApp</button>);
                      }
                      if (b?.redirect_links?.allow_facebook) {
                        links.push(<button key="fb" onClick={() => setRedirectLink('https://facebook.com/')} className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[#1877F2] rounded-full transition-colors border border-slate-700">Facebook</button>);
                      }
                      if (b?.redirect_links?.allow_youtube) {
                        links.push(<button key="yt" onClick={() => setRedirectLink('https://youtube.com/')} className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[#FF0000] rounded-full transition-colors border border-slate-700">YouTube</button>);
                      }
                      if (b?.redirect_links?.allow_tally) {
                        links.push(<button key="tally" onClick={() => setRedirectLink('https://tally.so/r/')} className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors border border-slate-700">Tally Form</button>);
                      }
                      if (b?.redirect_links?.allow_drive) {
                        links.push(<button key="drive" onClick={() => setRedirectLink('https://drive.google.com/')} className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-full transition-colors border border-slate-700">Google Drive/PDF</button>);
                      }
                      
                      return links.length > 0 ? (
                        <>
                          <span className="text-xs text-slate-500 py-1.5">Quick fill:</span>
                          {links}
                        </>
                      ) : (
                        <span className="text-xs text-slate-500">No quick links configured in Brand settings.</span>
                      );
                    })()`;

const newBlock = `                    (() => {
                      const b = brands.find(br => br.id === selectedBrandId);
                      if (!b) return null;
                      
                      const links = [];
                      if (b.website_url) {
                        links.push(<button key="web" onClick={() => setRedirectLink(b.website_url)} className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors border border-slate-700">Primary Website</button>);
                      }
                      if (b?.redirect_links?.telegram_link) {
                        links.push(<button key="tg" onClick={() => setRedirectLink(b.redirect_links.telegram_link)} className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[#0088cc] rounded-full transition-colors border border-slate-700">Telegram</button>);
                      }
                      if (b?.redirect_links?.facebook_link) {
                        links.push(<button key="fb" onClick={() => setRedirectLink(b.redirect_links.facebook_link)} className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[#1877F2] rounded-full transition-colors border border-slate-700">Facebook</button>);
                      }
                      if (b?.redirect_links?.tally_link) {
                        links.push(<button key="tally" onClick={() => setRedirectLink(b.redirect_links.tally_link)} className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors border border-slate-700">Tally Form</button>);
                      }
                      if (b?.redirect_links?.drive_link) {
                        links.push(<button key="drive" onClick={() => setRedirectLink(b.redirect_links.drive_link)} className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-full transition-colors border border-slate-700">Google Drive</button>);
                      }
                      
                      return links.length > 0 ? (
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="text-xs text-slate-500">Quick fill:</span>
                          {links}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">No platform links configured in Brand settings.</span>
                      );
                    })()`;

if(content.includes(oldBlock)) {
  content = content.replace(oldBlock, newBlock);
  console.log("Patched PaymentLinks UI successfully.");
} else {
  console.log("Could not find oldBlock. Trying regex.");
  const rx = /\(\(\) => \{\s*const b = brands\.find[\s\S]*?No quick links configured in Brand settings\.<\/span>\s*\);\s*\}\)\(\)/;
  if (content.match(rx)) {
    content = content.replace(rx, newBlock);
    console.log("Patched via regex");
  } else {
    console.log("Failed completely.");
  }
}

fs.writeFileSync('src/components/payment-hub/PaymentLinks.tsx', content);
