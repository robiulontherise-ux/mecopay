import React, { useState, useEffect, useRef, useId } from 'react';

interface AutoHeightIframeProps {
  content: string;
  title?: string;
  className?: string;
  minHeight?: number;
}

export const AutoHeightIframe: React.FC<AutoHeightIframeProps> = ({
  content,
  title = 'Interactive Content',
  className = 'w-full border-none bg-transparent block',
  minHeight = 300,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [frameHeight, setFrameHeight] = useState<number>(minHeight);
  const uniqueId = useId().replace(/[^a-zA-Z0-9]/g, '_');

  // Strip prefix code annotations if present
  const cleanContent = content
    .replace(/^<!--\s*CODE:[a-zA-Z0-9_]*\s*-->/i, '')
    .replace(/^<!--\s*LIVE_CODE\s*-->/i, '')
    .trim();

  // Construct iframe HTML with auto-resize script, transparent background, and fluid responsive styles
  const srcDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      max-width: 100%;
      background-color: transparent !important;
      overflow-x: hidden !important;
      -webkit-text-size-adjust: 100%;
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    html::-webkit-scrollbar, body::-webkit-scrollbar {
      display: none;
    }
    img, video, canvas, svg {
      max-width: 100% !important;
      height: auto !important;
    }
    table {
      max-width: 100% !important;
      border-collapse: collapse;
    }
    pre, code {
      white-space: pre-wrap !important;
      word-break: break-word !important;
    }
    /* Fluid containers on all devices */
    [class*="container"], [class*="wrapper"] {
      max-width: 100% !important;
    }
  </style>
</head>
<body>
  ${cleanContent}
  <script>
    (function() {
      var frameId = "${uniqueId}";
      var lastReportedHeight = 0;

      function measureAndSend() {
        try {
          var b = document.body;
          var h = document.documentElement;
          if (!b && !h) return;
          
          var measured = Math.max(
            b ? b.scrollHeight : 0,
            b ? b.offsetHeight : 0,
            h ? h.scrollHeight : 0,
            h ? h.offsetHeight : 0,
            h ? h.clientHeight : 0
          );

          if (measured > 0 && Math.abs(measured - lastReportedHeight) >= 2) {
            lastReportedHeight = measured;
            window.parent.postMessage({
              type: 'MYSITE_IFRAME_RESIZE',
              frameId: frameId,
              height: measured
            }, '*');
          }
        } catch (e) {}
      }

      window.addEventListener('load', measureAndSend);
      document.addEventListener('DOMContentLoaded', measureAndSend);
      window.addEventListener('resize', measureAndSend);

      // Multiple staggered checks to catch async fonts, images, and external scripts
      setTimeout(measureAndSend, 50);
      setTimeout(measureAndSend, 200);
      setTimeout(measureAndSend, 500);
      setTimeout(measureAndSend, 1000);
      setTimeout(measureAndSend, 2000);
      setTimeout(measureAndSend, 4000);

      // DOM observers
      if (window.ResizeObserver && document.body) {
        try {
          var ro = new ResizeObserver(measureAndSend);
          ro.observe(document.body);
          if (document.documentElement) ro.observe(document.documentElement);
        } catch (e) {}
      }

      if (window.MutationObserver && document.body) {
        try {
          var mo = new MutationObserver(measureAndSend);
          mo.observe(document.body, { childList: true, subtree: true, attributes: true });
        } catch (e) {}
      }
    })();
  </script>
</body>
</html>`;

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (
        e.data &&
        e.data.type === 'MYSITE_IFRAME_RESIZE' &&
        e.data.frameId === uniqueId &&
        typeof e.data.height === 'number' &&
        e.data.height > 0
      ) {
        setFrameHeight(e.data.height);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [uniqueId]);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={srcDoc}
      title={title}
      className={className}
      scrolling="no"
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
      style={{
        width: '100%',
        maxWidth: '100%',
        height: `${frameHeight}px`,
        minHeight: `${minHeight}px`,
        border: 'none',
        backgroundColor: 'transparent',
        overflow: 'hidden',
        display: 'block',
      }}
    />
  );
};
