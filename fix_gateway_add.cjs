const fs = require('fs');
let file = 'src/components/payment-hub/GatewaySettings.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the overwrite logic
const oldLogic = `        if (editingId) {
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
        }`;

const newLogic = `        if (editingId) {
          const { error: updateError } = await supabase
            .from('payment_numbers')
            .update(payload)
            .eq('id', editingId);
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
        }`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync(file, content);
