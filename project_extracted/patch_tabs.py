import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

# Add AppWindow icon
import_pattern = r'import \{([\s\S]*?)ShieldCheck,'
text = re.sub(import_pattern, r'import {\1ShieldCheck, Box, UploadCloud, FolderGit2, ', text)

# Add tab button
tab_pattern = r"""            <button
              onClick=\{\(\) => setActiveTab\('site-settings'\)\}
              className=\{`px-3 py-1\.5 rounded-lg text-xs font-semibold flex items-center gap-1\.5 transition-all whitespace-nowrap \$\{
                activeTab === 'site-settings'
                  \? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600\/30'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              \}`\}
            >
              <svg xmlns="http://www\.w3\.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19\.4 15a1\.65 1\.65 0 0 0 \.33 1\.82l\.06\.06a2 2 0 0 1 0 2\.83 2 2 0 0 1-2\.83 0l-\.06-\.06a1\.65 1\.65 0 0 0-1\.82-\.33 1\.65 1\.65 0 0 0-1 1\.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-\.09A1\.65 1\.65 0 0 0 9 19\.4a1\.65 1\.65 0 0 0-1\.82\.33l-\.06\.06a2 2 0 0 1-2\.83 0 2 2 0 0 1 0-2\.83l\.06-\.06a1\.65 1\.65 0 0 0 \.33-1\.82 1\.65 1\.65 0 0 0-1\.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h\.09A1\.65 1\.65 0 0 0 4\.6 9a1\.65 1\.65 0 0 0-\.33-1\.82l-\.06-\.06a2 2 0 0 1 0-2\.83 2 2 0 0 1 2\.83 0l\.06\.06a1\.65 1\.65 0 0 0 1\.82\.33H9a1\.65 1\.65 0 0 0 1-1\.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v\.09a1\.65 1\.65 0 0 0 1 1\.51 1\.65 1\.65 0 0 0 1\.82-\.33l\.06-\.06a2 2 0 0 1 2\.83 0 2 2 0 0 1 0 2\.83l-\.06\.06a1\.65 1\.65 0 0 0-\.33 1\.82V9a1\.65 1\.65 0 0 0 1\.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-\.09a1\.65 1\.65 0 0 0-1\.51 1z"></path></svg>
              <span>Settings</span>
            </button>"""

tab_new = """            <button
              onClick={() => setActiveTab('site-settings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'site-settings'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              <span>Settings</span>
            </button>
            <button
              onClick={() => setActiveTab('apps')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'apps'
                  ? 'bg-fuchsia-600 text-white shadow-sm shadow-fuchsia-600/30'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span className="flex items-center gap-1">App Hosting <span className="px-1.5 py-0.5 bg-fuchsia-500/20 text-fuchsia-300 rounded text-[10px] ml-1 uppercase">Beta</span></span>
            </button>"""

text = re.sub(tab_pattern, tab_new, text)

# Insert the TAB content
tab_content = """        {/* TAB: APP HOSTING (BaaS) */}
        {activeTab === 'apps' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Box className="w-5 h-5 text-fuchsia-400" />
                  App Hosting & BaaS (Cloudflare + Supabase)
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Allow clients to upload their compiled frontend projects (React, Next.js, HTML/JS ZIP files). 
                  They get a unique project ID to connect with your Supabase BaaS, and their uploaded files will be served via Cloudflare Workers.
                </p>
              </div>
              <button
                onClick={() => alert('New App Creation flow will go here!')}
                className="px-4 py-2.5 rounded-xl text-sm font-bold bg-fuchsia-600 hover:bg-fuchsia-500 text-white flex items-center gap-2 shadow-md shadow-fuchsia-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Project</span>
              </button>
            </div>

            {/* Empty State / Coming Soon Mockup */}
            <div className="grid lg:grid-cols-2 gap-6">
              
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <FolderGit2 className="w-32 h-32 text-fuchsia-500" />
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2 relative z-10">Upload Compiled Frontend</h3>
                <p className="text-sm text-slate-400 mb-6 relative z-10 max-w-sm">
                  Clients upload their `dist` or `out` folder as a ZIP file. The system stores it in Supabase Storage.
                </p>

                <div className="border-2 border-dashed border-slate-700 bg-slate-800/50 rounded-xl p-8 text-center relative z-10 flex flex-col items-center justify-center hover:bg-slate-800/80 hover:border-fuchsia-500/50 transition-all cursor-pointer">
                  <UploadCloud className="w-10 h-10 text-slate-400 mb-3 group-hover:text-fuchsia-400 transition-colors" />
                  <p className="text-sm font-medium text-slate-200">Drag & Drop project ZIP here</p>
                  <p className="text-xs text-slate-500 mt-1">or click to browse</p>
                  
                  <button className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold transition-colors">
                    Select ZIP File
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-4">Hosted Projects</h3>
                
                <div className="flex-1 border border-slate-800 bg-slate-950/50 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                  <Box className="w-12 h-12 text-slate-700 mb-3" />
                  <h4 className="text-slate-300 font-semibold text-sm">No projects hosted yet</h4>
                  <p className="text-xs text-slate-500 max-w-[250px] mt-2">
                    Create a project and generate a Project ID for a client so they can connect their frontend.
                  </p>
                </div>
              </div>

            </div>
            
            <div className="bg-fuchsia-950/30 border border-fuchsia-900/50 rounded-2xl p-5">
              <h4 className="text-sm font-bold text-fuchsia-300 mb-2">Supabase BaaS API (For Clients)</h4>
              <p className="text-xs text-fuchsia-200/70 mb-4">
                Clients can use your Supabase instance to store their data using their Project ID.
              </p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <pre className="text-xs text-slate-300 overflow-x-auto">
{`// Example Client Next.js Connection
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
export const supabase = createClient(supabaseUrl, supabaseKey)

// Client saves their app data to your BaaS
await supabase.from('client_app_data').insert([
  { project_id: 'client-project-123', payload: { ... } }
])`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SITE SETTINGS */}"""

text = text.replace('{/* TAB 5: SITE SETTINGS */}', tab_content)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

