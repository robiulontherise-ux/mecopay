import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

fetch_old = """      const { data: postData, error: postErr } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!postErr && postData) {
        setPosts(postData);
      }
    } catch (err) {"""

fetch_new = """      const { data: postData, error: postErr } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!postErr && postData) {
        setPosts(postData);
      }
      
      const { data: settingsData, error: settingsErr } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'default')
        .single();
        
      if (!settingsErr && settingsData) {
        setSiteSettings(settingsData);
      }
    } catch (err) {"""

text = text.replace(fetch_old, fetch_new)

with open('src/App.tsx', 'w') as f:
    f.write(text)

