sed -i 's/skipBrowserRedirect: true,/ /' src/mysite/components/LazyAuthModal.tsx
sed -i 's/redirectTo: window.location.origin,/redirectTo: window.location.href,/' src/mysite/components/LazyAuthModal.tsx
sed -i '/if (data?.url) {/,/}/d' src/mysite/components/LazyAuthModal.tsx
sed -i 's/const { data, error }/const { error }/' src/mysite/components/LazyAuthModal.tsx
