import re

with open('src/components/Home.tsx', 'r') as f:
    text = f.read()

# Add imports
text = text.replace("import React, { useMemo } from 'react';", "import React, { useMemo, useEffect, useRef } from 'react';")

# Add ref and effect inside Home
hook_str = """const Home: React.FC<HomeProps> = ({
  categories,
  posts,
  siteSettings,
  activeCategory,
  searchQuery,
  setSearchQuery,
  onSelectCategory,
  onSelectPost,
  onOpenAuthModal
}) => {"""

hook_new = hook_str + """
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'resize' && iframeRef.current) {
        iframeRef.current.style.height = `${e.data.height}px`;
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
"""

text = text.replace(hook_str, hook_new)

# Add ref to iframe
iframe_old = """              <iframe
                srcDoc={`${siteSettings.default_home_content}<script>"""
iframe_new = """              <iframe
                ref={iframeRef}
                srcDoc={`${siteSettings.default_home_content}<script>"""

text = text.replace(iframe_old, iframe_new)

with open('src/components/Home.tsx', 'w') as f:
    f.write(text)

