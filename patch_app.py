import re

with open('src/mysite/App.tsx', 'r') as f:
    content = f.read()

# Fix the user session check
old_session = """  useEffect(() => {
    // Check real Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        if (window.opener && window.location.hash.includes('access_token')) {
          setTimeout(() => window.close(), 500);
        }
      } else {"""

new_session = """  useEffect(() => {
    if (builderUser) {
      setUser(builderUser);
      setAuthLoading(false);
      return;
    }
    // Check real Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        if (window.opener && window.location.hash.includes('access_token')) {
          setTimeout(() => window.close(), 500);
        }
      } else {"""

content = content.replace(old_session, new_session)


old_fetch = """        const fetchSupabaseData = useCallback(async () => {
    try {
      // Fetch settings (Global, so viewers can see it without logging in)
      // 1. Get the current domain the visitor is browsing from
      let currentDomain = window.location.hostname;
      
      // 2. Strict production query (Checks both Custom Domain and Subdomain)
      // Note: If testing locally, you can force a domain like: currentDomain = "mybrand.com";
      const { data: settingsData, error: settingsErr } = await supabase
        .from('site_settings')
        .select('*')
        .or(`domain.eq.${currentDomain},subdomain.eq.${currentDomain}`)
        .limit(1)
        .maybeSingle();"""

new_fetch = """        const fetchSupabaseData = useCallback(async () => {
    try {
      let settingsData = null;
      let targetClientId = null;

      if (builderUser?.id) {
         // In builder mode, load the client's own settings
         targetClientId = builderUser.id;
         const { data, error } = await supabase
           .from('site_settings')
           .select('*')
           .eq('client_id', builderUser.id)
           .limit(1)
           .maybeSingle();
         if (!error && data) settingsData = data;
      } else {
         let currentDomain = window.location.hostname;
         const { data, error } = await supabase
           .from('site_settings')
           .select('*')
           .or(`domain.eq.${currentDomain},subdomain.eq.${currentDomain}`)
           .limit(1)
           .maybeSingle();
         if (!error && data) {
           settingsData = data;
           targetClientId = data.client_id;
         }
      }"""

content = content.replace(old_fetch, new_fetch)

old_cat = """      if (settingsData?.client_id) {
         catQuery = catQuery.eq('client_id', settingsData.client_id);
      }"""
new_cat = """      if (targetClientId) {
         catQuery = catQuery.eq('client_id', targetClientId);
      }"""
content = content.replace(old_cat, new_cat)

old_post = """      if (settingsData?.client_id) {
         postQuery = postQuery.eq('client_id', settingsData.client_id);
      }"""
new_post = """      if (targetClientId) {
         postQuery = postQuery.eq('client_id', targetClientId);
      }"""
content = content.replace(old_post, new_post)


with open('src/mysite/App.tsx', 'w') as f:
    f.write(content)
