import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * TimeSpentBeaconTracker
 * Tracks user dwell time / engagement time on each route in the React SPA.
 * Sends a non-blocking beacon ping to '/api/capi/ping' on page transitions or tab closing.
 */
export default function TimeSpentBeaconTracker() {
  const location = useLocation();

  useEffect(() => {
    const startTime = Date.now();
    const currentPath = location.pathname;

    const sendPing = () => {
      const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
      if (elapsedSeconds >= 1 && typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const payload = JSON.stringify({
          domain: window.location.hostname,
          path: currentPath,
          time_spent_sec: elapsedSeconds
        });
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/capi/ping', blob);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendPing();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', sendPing);

    return () => {
      sendPing();
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', sendPing);
    };
  }, [location.pathname]);

  return null;
}
