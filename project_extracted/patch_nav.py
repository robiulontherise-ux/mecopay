import re

with open('src/components/Navbar.tsx', 'r') as f:
    text = f.read()

nav_old = """              <span className="font-black tracking-tight text-base sm:text-lg text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200" style={siteSettings?.primary_color ? { backgroundImage: `linear-gradient(to right, white, ${siteSettings.primary_color})` } : {}}>
                {siteSettings?.site_name || 'RSG SHOP'}
              </span>"""

nav_new = """              <span
                className={`font-black tracking-tight ${
                  siteSettings?.site_name_size === 'small' ? 'text-sm sm:text-base' : 
                  siteSettings?.site_name_size === 'large' ? 'text-xl sm:text-2xl' : 
                  'text-base sm:text-lg'
                }`}
                style={{
                  color: siteSettings?.site_name_color || 'transparent',
                  backgroundImage: siteSettings?.site_name_color ? 'none' : (siteSettings?.primary_color ? `linear-gradient(to right, white, ${siteSettings.primary_color})` : 'linear-gradient(to right, white, #e2e8f0)'),
                  WebkitBackgroundClip: siteSettings?.site_name_color ? 'unset' : 'text',
                  backgroundClip: siteSettings?.site_name_color ? 'unset' : 'text'
                }}
              >
                {siteSettings?.site_name || 'RSG SHOP'}
              </span>"""

text = text.replace(nav_old, nav_new)
with open('src/components/Navbar.tsx', 'w') as f:
    f.write(text)

