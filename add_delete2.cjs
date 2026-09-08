const fs = require('fs');
let content = fs.readFileSync('src/components/payment-hub/GatewaySettings.tsx', 'utf8');

const target = `<button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
                    >
                      💾 {isSaving ? 'Saving...' : 'Save Gateway Credentials'}
                    </button>`;

const replacement = `{gateways.find(g => g.provider === selectedProvider && g.brand_id === selectedBrandId)?.id && (
                      <button
                        onClick={() => handleDeleteGatewayRow(gateways.find(g => g.provider === selectedProvider && g.brand_id === selectedBrandId)!.id, selectedProvider, selectedBrandId!)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    )}
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
                    >
                      💾 {isSaving ? 'Saving...' : 'Save Gateway Credentials'}
                    </button>`;

if(content.includes('Save Gateway Credentials')) {
  // Let's use string replace using substring
  let newContent = content.replace(/<button[^>]*onClick=\{handleSave\}[^>]*>\s*💾\s*\{\s*isSaving\s*\?\s*'Saving\.\.\.'\s*:\s*'Save Gateway Credentials'\s*\}\s*<\/button>/m, replacement);
  fs.writeFileSync('src/components/payment-hub/GatewaySettings.tsx', newContent);
  console.log("Replaced!");
}

