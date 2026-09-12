import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

handle_image_old = """  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isContentImage = false) => {"""

handle_image_new = """  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `logo_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('potimg').upload(fileName, file);
      if (uploadError) {
        if (uploadError.message.includes('row-level security policy')) {
          alert("Supabase Storage Error: Your database is blocking uploads. Please make sure the 'potimg' bucket exists and has public insert policies.");
        }
        throw uploadError;
      }
      const { data: publicUrlData } = supabase.storage.from('potimg').getPublicUrl(fileName);
      setSiteLogo(publicUrlData.publicUrl);
    } catch (err) {
      console.error('Logo upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isContentImage = false) => {"""

text = text.replace(handle_image_old, handle_image_new)
with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

