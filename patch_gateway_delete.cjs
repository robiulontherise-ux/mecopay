const fs = require('fs');
let gw = fs.readFileSync('src/components/payment-hub/GatewaySettings.tsx', 'utf-8');

// 1. Rewrite handleDeleteGateway
const oldHandleDeleteStr = /const handleDeleteGateway = async \(\) => \{[\s\S]*?showToast\("Failed to delete gateway: " \+ e\.message, "error"\);\n\s*\}\n\s*\};/;
const newHandleDeleteStr = `const handleDeleteGatewayRow = async (gwId: string, provider: string, brandId: string) => {
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
        .eq('id', gwId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      showToast("Gateway deleted successfully!", "success");
      fetchGateways();
    } catch (e: any) {
      showToast("Failed to delete gateway: " + e.message, "error");
    }
  };`;

gw = gw.replace(oldHandleDeleteStr, newHandleDeleteStr);

// 2. Remove the Delete button from the Modal
const deleteBtnPattern = /\{isCreating && selectedProviders\.length === 1 && \(\s*<button\s*onClick=\{handleDeleteGateway\}\s*className="[^"]*"\s*>\s*Delete Gateway\s*<\/button>\s*\)\}/;
gw = gw.replace(deleteBtnPattern, '');

// 3. Add Delete Button next to Edit Button in the Table
// Look for `<Edit className="w-4 h-4" />\n                            </button>`
const editBtnPattern = /(<Edit className="w-4 h-4" \/>\s*<\/button>)/;
const replacement = `$1\n                            <button className="text-red-400 hover:text-red-300 p-2 ml-1" onClick={() => handleDeleteGatewayRow(gw.id, gw.provider, gw.brand_id)}>\n                              <Trash2 className="w-4 h-4" />\n                            </button>`;
gw = gw.replace(editBtnPattern, replacement);

fs.writeFileSync('src/components/payment-hub/GatewaySettings.tsx', gw);
