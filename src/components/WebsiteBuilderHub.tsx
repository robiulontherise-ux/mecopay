import React, { useState, useEffect } from 'react';
import { Globe, UploadCloud, ArrowRight, Code, Box, FolderGit2, Loader2 } from 'lucide-react';
import MySiteApp from '../mysite/App';
import { supabase } from '../lib/supabase';

export default function WebsiteBuilderHub({ user }) {
  const [activeView, setActiveView] = useState('hub'); // 'hub', 'brand_selection', 'no_code', 'upload'
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeView === 'brand_selection') {
      const fetchBrands = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('brands')
            .select('id, name')
            .eq('user_id', user?.id);
          
          if (!error && data) {
            setBrands(data);
            if (data.length > 0) setSelectedBrand(data[0].id);
          }
        } catch (error) {
          console.error("Error fetching brands:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchBrands();
    }
  }, [activeView, user?.id]);

  const handleConfirmCreate = async () => {
    if (!selectedBrand || !user?.email) return;
    
    setIsLoading(true);
    try {
      // Check if row already exists
      const { data: existingData } = await supabase
        .from('site_settings')
        .select('id')
        .eq('client_id', user.id)
        .single();
      
      let error;

      if (existingData) {
        // Update
        const result = await supabase.from('site_settings').update({
          brand_id: selectedBrand,
          owner_email: user.email,
          project_type: 'create',
        }).eq('client_id', user.id);
        error = result.error;
      } else {
        // Insert
        const result = await supabase.from('site_settings').insert({
          id: 'default',
          client_id: user.id, // Primary linking key
          brand_id: selectedBrand,
          owner_email: user.email,
          project_type: 'create',
          site_name: 'My No-Code Site',
          site_logo: '',
          primary_color: '#3b82f6',
          text_size: 'medium',
          show_default_home: true,
          default_home_content: 'Welcome to my site!',
        });
        error = result.error;
      }

      if (error) throw error;
      
      alert("Website backend initialized successfully!");
      
      // Successfully registered the project type, move to GitHub CMS code
      setActiveView('no_code');
    } catch (error) {
      console.error("Error saving site_settings:", error);
      alert(`Failed to initialize website creation: ${error.message || 'Unknown database error'}. Please check RLS policies.`);
    } finally {
      setIsLoading(false);
    }
  };

  if (activeView === 'no_code') {
    return (
      <div className="h-[calc(100vh-100px)] overflow-y-auto w-full -mx-4 sm:mx-0 bg-slate-950 rounded-xl">
        <MySiteApp builderUser={user} />
      </div>
    );
  }

  if (activeView === 'brand_selection') {
    return (
      <div className="max-w-2xl mx-auto">
        <button onClick={() => setActiveView('hub')} className="text-slate-400 hover:text-white mb-6 flex items-center gap-2">
          &larr; Back to Options
        </button>
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col items-center text-center">
          <Globe className="w-12 h-12 text-cyan-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Select Your Brand</h2>
          <p className="text-slate-400 mb-8">
            Choose the brand you want to create this website for. This will link your new No-Code site to your brand settings.
          </p>

          {isLoading ? (
            <div className="flex justify-center p-6"><Loader2 className="w-8 h-8 text-cyan-500 animate-spin" /></div>
          ) : (
            <div className="w-full max-w-md text-left">
              <label className="block text-sm font-medium text-slate-300 mb-2">Select Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
              >
                {brands.length === 0 && <option value="">No brands found - please create one first</option>}
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>

              <button
                disabled={!selectedBrand || isLoading}
                onClick={handleConfirmCreate}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold transition-all flex justify-center items-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm & Open Builder'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeView === 'upload') {
    return (
      <div className="max-w-4xl mx-auto">
        <button onClick={() => setActiveView('hub')} className="text-slate-400 hover:text-white mb-6 flex items-center gap-2">
          &larr; Back to Options
        </button>
        
        {/* The Hosted Projects UI copied exactly from GitHub logic */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <Box className="w-6 h-6 text-blue-400" />
            Upload Custom Backend (Hosted Projects)
          </h3>
          <p className="text-sm text-slate-400 mb-6 max-w-3xl">
            Upload your WordPress or Laravel source code (.zip). The system stores it in Supabase Storage and we will automatically route the domain to a dedicated Oracle Cloud VPS.
          </p>
          
          <div className="flex-1 border-2 border-dashed border-slate-700 bg-slate-950/50 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-slate-900/80 hover:border-blue-500/50 transition-all cursor-pointer group">
            <FolderGit2 className="w-12 h-12 text-slate-600 mb-3 group-hover:text-blue-400 transition-colors" />
            <h4 className="text-slate-300 font-semibold text-base mb-1">Drag & Drop project ZIP here</h4>
            <p className="text-sm text-slate-500">or click to browse (Max 500MB)</p>
            <button className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20">
              Select ZIP File
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-3">Website Builder Hub</h1>
        <p className="text-slate-400 max-w-2xl text-lg">
          Choose how you want to build your platform. Use our lightning-fast No-Code builder hosted on Cloudflare, or upload your own custom backend infrastructure.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Option 1: No-Code */}
        <div 
          onClick={() => setActiveView('brand_selection')}
          className="bg-slate-900 border border-slate-800 p-8 rounded-2xl cursor-pointer hover:border-cyan-500/50 hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.15)] transition-all group"
        >
          <div className="w-14 h-14 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Globe className="w-7 h-7 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Build No-Code Website
          </h2>
          <p className="text-slate-400 mb-6 line-clamp-3">
            Create a professional storefront in minutes. Zero coding required. Hosted instantly on our global Cloudflare Edge network for infinite scalability.
          </p>
          <div className="flex items-center text-cyan-400 font-medium group-hover:gap-2 transition-all">
            Start Building <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        {/* Option 2: Upload */}
        <div 
          onClick={() => setActiveView('upload')}
          className="bg-slate-900 border border-slate-800 p-8 rounded-2xl cursor-pointer hover:border-blue-500/50 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)] transition-all group"
        >
          <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Code className="w-7 h-7 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Upload Custom Backend</h2>
          <p className="text-slate-400 mb-6 line-clamp-3">
            Already have a WordPress or Laravel site? Upload your .zip file. We'll automatically route the domain to a dedicated Oracle Cloud VPS.
          </p>
          <div className="flex items-center text-blue-400 font-medium group-hover:gap-2 transition-all">
            Upload .zip File <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
