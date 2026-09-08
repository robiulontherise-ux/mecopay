const fs = require('fs');
let file = 'src/components/payment-hub/GatewaySettings.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldSaveLogic = `  const handleSave = async () => {
    if (!selectedBrandId || selectedProviders.length === 0 || !accountNumber) {
      showToast("Please fill required fields!", 'error');
      return;
    }
    
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      for (const provider of selectedProviders) {
        let error;

        if (editingId) {
          const { error: updateError } = await supabase
            .from('payment_numbers')
            .update({ 
               number: accountNumber,
               brand_id: selectedBrandId
             })
            .eq('id', editingId);
          error = updateError;
        } else {
          const { data: existing } = await supabase
            .from('payment_numbers')
            .select('id')
            .eq('brand_id', selectedBrandId)
            .eq('provider', provider)
            .single();

          if (existing) {
            const { error: updateError } = await supabase
              .from('payment_numbers')
              .update({ 
                 number: accountNumber,
                 brand_id: selectedBrandId
               })
              .eq('id', existing.id);
            error = updateError;
          } else {
            const { error: insertError } = await supabase
              .from('payment_numbers')
              .insert({
                user_id: user.id,
                brand_id: selectedBrandId,
                provider: provider,
                number: accountNumber,
                type: 'personal',
                monthly_volume: 0
              });
            error = insertError;
          }
        }

        if (error) {
          console.error(\`Error saving \${provider}:\`, error);
          throw new Error(\`Failed to save \${provider}\`);
        }
      }

      showToast("Saved successfully!", "success");
      setSelectedProvider(null);
      setSelectedProviders([]);
      setIsCreating(false);
      setEditingId(null);
      fetchGateways();
    } catch (err: any) {
      console.error("Save gateway error:", err);
      showToast("Failed to save!", 'error');
    } finally {
      setIsSaving(false);
    }
  };`;

const newSaveLogic = `  const handleSave = async () => {
    if (!selectedBrandId || selectedProviders.length === 0 || !accountNumber) {
      showToast("Please fill required fields!", 'error');
      return;
    }
    
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      for (const provider of selectedProviders) {
        let error;
        
        const payload = {
          number: accountNumber,
          brand_id: selectedBrandId,
          number_2: secondaryAccountNumber || null,
          additional_numbers: additionalNumbers,
          min_amount: parseFloat(minAmount) || 1,
          max_amount: parseFloat(maxAmount) || 100000,
          provider: provider
        };

        if (editingId) {
          const { error: updateError } = await supabase
            .from('payment_numbers')
            .update(payload)
            .eq('id', editingId);
          error = updateError;
        } else {
          const { data: existing } = await supabase
            .from('payment_numbers')
            .select('id')
            .eq('brand_id', selectedBrandId)
            .eq('provider', provider)
            .single();

          if (existing) {
            const { error: updateError } = await supabase
              .from('payment_numbers')
              .update(payload)
              .eq('id', existing.id);
            error = updateError;
          } else {
            const { error: insertError } = await supabase
              .from('payment_numbers')
              .insert({
                ...payload,
                user_id: user.id,
                type: 'personal',
                monthly_volume: 0
              });
            error = insertError;
          }
        }

        if (error) {
          console.error(\`Error saving \${provider}:\`, error);
          throw new Error(\`Failed to save \${provider}\`);
        }
      }

      showToast("Saved successfully!", "success");
      setSelectedProvider(null);
      setSelectedProviders([]);
      setIsCreating(false);
      setEditingId(null);
      fetchGateways();
    } catch (err: any) {
      console.error("Save gateway error:", err);
      showToast("Failed to save!", 'error');
    } finally {
      setIsSaving(false);
    }
  };`;

content = content.replace(oldSaveLogic, newSaveLogic);
fs.writeFileSync(file, content);
