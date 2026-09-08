const fs = require('fs');
let content = fs.readFileSync('src/components/payment-hub/PaymentLinks.tsx', 'utf8');

const regex = /\(\(\) => \{\s*const b = brands\.find[\s\S]*?No platform links configured in Brand settings\.<\/span>\s*\);\s*\}\)\(\)/;

const newBlock = `                    (() => {
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
                    })()`;

if(content.match(regex)) {
  content = content.replace(regex, newBlock);
  console.log("Patched PaymentLinks successfully.");
} else {
  console.log("Failed to match PaymentLinks.");
}

fs.writeFileSync('src/components/payment-hub/PaymentLinks.tsx', content);
