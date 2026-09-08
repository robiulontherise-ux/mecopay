const fs = require('fs');

let gw = fs.readFileSync('src/components/payment-hub/GatewaySettings.tsx', 'utf-8');

// Add showConfirm import
if (!gw.includes("import { showConfirm }")) {
    gw = gw.replace(/(import { showToast } from '\.\.\/\.\.\/lib\/toast';)/, `$1\nimport { showConfirm } from '../../lib/confirm';`);
}

// 1. Fix the brand selection bug
const useEffectMatch = /useEffect\(\(\) => \{\n\s*if \(brands\.length > 0 && !selectedBrandId\) \{\n\s*setSelectedBrandId\(brands\[0\]\.id\);\n\s*\}\n\s*fetchGateways\(\);\n\s*\}, \[brands\]\);/;
const useEffectReplacement = `useEffect(() => {
    if (brands.length > 0) {
      if (!selectedBrandId || !brands.find(b => b.id === selectedBrandId)) {
        setSelectedBrandId(brands[0].id);
      }
    } else {
      if (selectedBrandId) setSelectedBrandId('');
    }
    fetchGateways();
  }, [brands]);`;

gw = gw.replace(useEffectMatch, useEffectReplacement);

// 2. Change the routing text limit info
gw = gw.replace(
  /\* If primary reaches the monthly limit \(3 Lakh\), the system will auto-route to secondary, then backup numbers\./,
  `* If a number reaches its limit, the system will automatically route to the next available backup number in sequence. When the limit resets, it starts from the primary number again.`
);

// 3. Add Delete Button next to Save button inside Edit Gateway
// First, we need a handleDeleteGateway function
if (!gw.includes("const handleDeleteGateway = async")) {
  const handleSaveMatch = /const handleSave = async \(\) => \{/;
  const handleDeleteStr = `
  const handleDeleteGateway = async () => {
    if (!selectedBrandId || selectedProviders.length === 0) return;
    const provider = selectedProviders[0]; // when editing, there's usually only 1
    
    const res = await showConfirm({
      msg: "Are you sure you want to delete this Gateway? Payment links associated with it might fail to process.",
      requireType: "delete"
    });
    if (!res || !res.confirmed) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase
        .from('payment_numbers')
        .delete()
        .eq('brand_id', selectedBrandId)
        .eq('provider', provider)
        .eq('user_id', user.id);
      
      if (error) throw error;
      showToast("Gateway deleted successfully!", "success");
      setIsCreating(false);
      fetchGateways();
    } catch (e: any) {
      showToast("Failed to delete gateway: " + e.message, "error");
    }
  };
  `;
  gw = gw.replace(handleSaveMatch, handleDeleteStr + '\n  ' + 'const handleSave = async () => {');
}

// Now add the UI button. Find the Save button area:
// <button onClick={handleSave} disabled={isSaving} ...> Save Gateway Credentials </button>
const saveBtnMatch = /<button\s*onClick=\{handleSave\}\s*disabled=\{isSaving\}[\s\S]*?<\/button>/;
const saveBtnReplacement = `<div className="flex gap-4">
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
                    >
                      💾 {isSaving ? 'Saving...' : 'Save Gateway Credentials'}
                    </button>
                    {isCreating && selectedProviders.length === 1 && (
                      <button 
                        onClick={handleDeleteGateway}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-3 px-6 rounded-xl transition-colors border border-red-500/20 flex items-center gap-2"
                      >
                         Delete Gateway
                      </button>
                    )}
                  </div>`;

gw = gw.replace(saveBtnMatch, saveBtnReplacement);

fs.writeFileSync('src/components/payment-hub/GatewaySettings.tsx', gw);
