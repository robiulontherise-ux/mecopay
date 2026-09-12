with open('src/components/PostDetail.tsx', 'r') as f:
    text = f.read()

import re

# Add useEffect and useRef imports if missing
if 'useRef' not in text:
    text = text.replace('import React, { useState } from \'react\';', 'import React, { useState, useEffect, useRef } from \'react\';')

# Add the resize hook inside PostDetail component
hook_insertion = r"  const \[copiedLink, setCopiedLink\] = useState\(false\);"
hook_code = """  const [copiedLink, setCopiedLink] = useState(false);
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

  const srcDocWithResize = post.content ? `${post.content}
<script>
  function sendHeight() {
    window.parent.postMessage({ type: 'resize', height: document.documentElement.scrollHeight }, '*');
  }
  window.onload = sendHeight;
  if (window.ResizeObserver) {
    new ResizeObserver(sendHeight).observe(document.body);
  } else {
    new MutationObserver(sendHeight).observe(document.body, { childList: true, subtree: true, attributes: true });
  }
</script>` : '';
"""
text = re.sub(hook_insertion, hook_code, text)

# Replace the iframe rendering
iframe_regex = r"""                <iframe 
                  srcDoc=\{post\.content\} 
                  className="w-full min-h-\[500px\] border-none bg-transparent rounded-xl overflow-hidden"
                  title=\{post\.title \|\| 'Interactive Content'\}
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                \/>"""
iframe_new = """                <iframe
                  ref={iframeRef}
                  srcDoc={srcDocWithResize}
                  className="w-full border-none bg-transparent rounded-xl overflow-hidden"
                  style={{ minHeight: '300px' }}
                  title={post.title || 'Interactive Content'}
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  scrolling="no"
                />"""
text = re.sub(iframe_regex, iframe_new, text)

# Remove the article padding and borders so it truly looks full width
article_regex = r"""            <article className="p-4 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-200 text-sm leading-relaxed space-y-4 max-w-none overflow-hidden">"""
article_new = """            <article className="w-full text-slate-200 text-sm leading-relaxed max-w-none overflow-hidden">"""
text = re.sub(article_regex, article_new, text)

with open('src/components/PostDetail.tsx', 'w') as f:
    f.write(text)
