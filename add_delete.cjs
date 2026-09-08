const fs = require('fs');
let content = fs.readFileSync('src/components/payment-hub/GatewaySettings.tsx', 'utf8');

const target = `<button
                      onClick={handleSaveGateway}
                      disabled={isSaving}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
                    >
                      💾 {isSaving ? 'Saving...' : 'Save Gateway Credentials'}
                    </button>`;

const existingGwCheck = `const existingGwId = gateways.find(g => g.provider === selectedProvider && g.brand_id === selectedBrandId)?.id;`;

const replacement = `{existingGwId && (
                      <button
                        onClick={() => handleDeleteGatewayRow(existingGwId, selectedProvider, selectedBrandId)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    )}
                    <button
                      onClick={handleSaveGateway}
                      disabled={isSaving}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
                    >
                      💾 {isSaving ? 'Saving...' : 'Save Gateway Credentials'}
                    </button>`;

content = content.replace(target, replacement);

// We need to inject existingGwCheck inside the render function just before the return, or just inside the component.
// But it's easier to just calculate it directly:
content = content.replace('{existingGwId && (', '{gateways.find(g => g.provider === selectedProvider && g.brand_id === selectedBrandId)?.id && (\n                      <button\n                        onClick={() => handleDeleteGatewayRow(gateways.find(g => g.provider === selectedProvider && g.brand_id === selectedBrandId)!.id, selectedProvider, selectedBrandId)}');
content = content.replace('existingGwId, selectedProvider, selectedBrandId', '');

fs.writeFileSync('src/components/payment-hub/GatewaySettings.tsx', content);
