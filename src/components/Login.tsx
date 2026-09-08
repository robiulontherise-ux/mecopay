import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ShieldCheck, Zap, Rocket, Globe, ArrowRight, Menu, Wallet, Crown, Link as LinkIcon, PlayCircle } from 'lucide-react';

const textChunks = [
  [
    "MecoPay একটি পূর্ণাঙ্গ ই-কমার্স সলিউশন—",
    "যা একই সাথে শক্তিশালী পেমেন্ট গেটওয়ে",
    "এবং নো-কোড ওয়েবসাইট বিল্ডার।"
  ],
  [
    "নিজস্ব Custom Website বা",
    "আমাদের No-Code ওয়েবসাইটে",
    "API ও Link ব্যবহার করে পেমেন্ট নিন,",
    "এবং Payment Link সোশ্যাল মিডিয়ায় শেয়ার করেও পেমেন্ট নিন।"
  ],
  [
    "কয়েক ক্লিকেই ওয়েবসাইট তৈরি করুন,",
    "ও কাস্টম ডোমেইন অ্যাড করে",
    "ডিজিটাল আইডেন্টিটি তৈরি করুন।"
  ],
  [
    "AI Agent Chatbot এর মাধ্যমে",
    "সোশ্যাল মিডিয়া থেকে স্বয়ংক্রিয় অর্ডার নিন",
    "(নো-কোড ওয়েবসাইট ইউজারদের জন্য)"
  ],
  [
    "আমাদের প্ল্যাটফর্মে কুরিয়ার API অ্যাড করে",
    "১ ক্লিকেই অর্ডার কনফার্মেশন",
    "সরাসরি কুরিয়ারে পাঠান।"
  ]
];

export default function Login() {
  const [isYearly, setIsYearly] = useState(false);
  const [showIframeWarning, setShowIframeWarning] = useState(false);
  const [currentChunk, setCurrentChunk] = useState(0);

  useEffect(() => {
    // Calculate total time needed for the current chunk to finish its animation
    // Duration is 2.0s, delay is 0.5 + lineIndex * 2.0
    // We add 1.0s extra reading time after the last line finishes
    const numLines = textChunks[currentChunk].length;
    const animationTimeMs = (0.5 + (numLines - 1) * 2.0 + 2.0 + 1.0) * 1000;
    
    const timeout = setTimeout(() => {
      setCurrentChunk((prev) => (prev + 1) % textChunks.length);
    }, animationTimeMs);
    
    return () => clearTimeout(timeout);
  }, [currentChunk]);

  const handleGoogleLogin = async () => {
    if (window.self !== window.top) {
      setShowIframeWarning(true);
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          prompt: 'select_account'
        }
      }
    });
    if (error) console.error("Error logging in:", error.message);
  };

  const plans = [
    {
      name: "Free Trial",
      monthlyPrice: 0,
      yearlyPrice: 0,
      icon: <Zap className="w-6 h-6 text-slate-400" />,
      accent: "from-slate-600 to-slate-800",
      features: ["2 Days Validity", "1 Brand", "1 Custom Website Integration or 1 No Code Website Integration", "Unlimited Posts & Products", "Unlimited Payment Links", "Custom Domain Support", "Basic API Access", "Unlimited Transactions"]
    },
    {
      name: "Basic",
      monthlyPrice: 100,
      yearlyPrice: 1080,
      icon: <ShieldCheck className="w-6 h-6 text-blue-400" />,
      accent: "from-blue-500 to-cyan-600",
      features: ["1 Brand", "1 Custom Website Integration or 1 No Code Website Integration", "Unlimited Posts & Products", "Unlimited Payment Links", "Custom Domain Support", "Full API Access", "Unlimited Transactions", "Standard Support"]
    },
    {
      name: "Starter",
      monthlyPrice: 200,
      yearlyPrice: 2160,
      icon: <Rocket className="w-6 h-6 text-indigo-400" />,
      accent: "from-indigo-500 to-purple-600",
      popular: true,
      features: ["2 Brands", "Mix of 2 Custom or No Code Website Integrations", "Unlimited Posts & Products", "Unlimited Payment Links", "Custom Domain Support", "Full API Access", "Unlimited Transactions", "Premium Themes"]
    },
    {
      name: "Pro",
      monthlyPrice: 300,
      yearlyPrice: 3240,
      icon: <Globe className="w-6 h-6 text-pink-400" />,
      accent: "from-pink-500 to-rose-600",
      features: ["3 Brands", "Mix of 3 Custom or No Code Website Integrations", "Unlimited Posts & Products", "Unlimited Payment Links", "Custom Domain Support", "Full API Access", "Unlimited Transactions", "Smart Volume Routing"]
    },
    {
      name: "Scale",
      monthlyPrice: 400,
      yearlyPrice: 4320,
      icon: <Wallet className="w-6 h-6 text-teal-400" />,
      accent: "from-teal-400 to-emerald-600",
      features: ["4 Brands", "Mix of 4 Custom or No Code Website Integrations", "Unlimited Posts & Products", "Unlimited Payment Links", "Custom Domain Support", "Full API Access", "Unlimited Transactions", "Priority Routing"]
    },
    {
      name: "Business",
      monthlyPrice: 500,
      yearlyPrice: 5400,
      icon: <Crown className="w-6 h-6 text-amber-400" />,
      accent: "from-amber-400 to-orange-600",
      features: ["5 Brands", "Mix of 5 Custom or No Code Website Integrations", "Unlimited Posts & Products", "Unlimited Payment Links", "Custom Domain Support", "Full API Access", "Unlimited Transactions", "Dedicated Manager"]
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      
      {/* Subtle Background */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-blue-900/10 to-neutral-950 pointer-events-none"></div>

      {/* Modern Clean Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 flex flex-col items-center px-4 py-3 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
        <div className="w-full max-w-7xl flex items-center justify-between relative">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src="https://i.postimg.cc/gX1nxKHH/logo.png" alt="MecoPay" className="h-8 sm:h-9 w-auto rounded-xl shadow-sm" onError={(e) => { e.currentTarget.src = "https://i.postimg.cc/Zn53D792/Meco-Pay-Logo.png"; }} />
            <span className="text-[18px] sm:text-xl font-bold text-white tracking-tight">MecoPay</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={handleGoogleLogin}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-lg text-sm sm:text-base font-semibold transition-all shadow-sm"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-6 sm:gap-10 mt-3 text-[15px] sm:text-[17px] font-bold text-neutral-300">
          <a href="#home" className="hover:text-white transition-colors">Home</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <Link to="/developers" className="hover:text-white transition-colors">Developers</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative z-10 pt-24 sm:pt-40 pb-20 px-0 sm:px-6 text-center max-w-6xl mx-auto flex flex-col items-center">
        
        {/* Animated Bengali Text */}
        <div className="h-auto min-h-[14rem] sm:min-h-[22rem] md:min-h-[24rem] flex flex-col items-center justify-start sm:justify-center pt-4 sm:pt-0 text-[20px] xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black md:font-extrabold leading-loose md:leading-relaxed mb-12 max-w-7xl mx-auto w-full px-1 sm:px-4 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentChunk}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 flex flex-col items-center justify-start sm:justify-center pt-8 sm:pt-0 space-y-2 md:space-y-4 w-full text-center"
            >
              {textChunks[currentChunk] && textChunks[currentChunk].map((line, lineIndex) => {
                const isLongText = currentChunk === 1 && lineIndex >= 2;
                return (
                <div key={lineIndex} className="relative inline-block py-1 md:py-2 px-1 md:px-2">
                  <motion.span
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 0.8,
                      delay: lineIndex * 0.2,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className={`inline-block relative z-10 text-white font-black md:font-extrabold drop-shadow-md px-1 md:px-2 leading-tight md:leading-relaxed ${isLongText ? 'text-[16px] xs:text-lg sm:text-lg md:text-xl lg:text-2xl mt-0.5' : ''}`}
                  >
                    {line}
                  </motion.span>
                  <motion.div 
                    initial={{ left: 0, width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.0, delay: 0.5 + lineIndex * 2.0, ease: "easeInOut" }}
                    className="absolute top-1 bottom-1 left-0 bg-[#c084fc]/80 z-0 rounded-lg shadow-sm"
                  />
                </div>
              )})}
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-[90%] sm:w-auto">
          <button 
            onClick={handleGoogleLogin}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all shadow-sm group"
          >
            <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
          
          <a 
            href="#" 
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3 rounded-xl text-base font-medium transition-all border border-neutral-800 group"
          >
            <PlayCircle className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="flex flex-col items-start text-left">
               <span className="text-sm leading-tight text-white font-semibold">Watch Video</span>
               <span className="text-[11px] text-neutral-500 font-medium leading-tight mt-0.5">How it works & API</span>
            </span>
          </a>

        </div>
      </section>

      
      {/* Features Section */}
      <section id="features" className="relative z-10 pt-32 pb-16 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center">
        <h2 className="text-4xl md:text-6xl font-black text-white mb-20 tracking-tight text-center">
          Our Service Category
        </h2>

        {/* Tree Diagram */}
        <div className="relative flex flex-col items-center mb-16 w-full max-w-4xl">
          {/* Top Node */}
          <div className="w-5 h-5 rounded-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] z-10 relative"></div>
          
          {/* Branch Lines Container */}
          <div className="relative w-full h-20 sm:h-32 -mt-2">
            {/* SVG lines for branches */}
            <svg className="absolute inset-0 w-full h-full drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                  <polygon points="0 0, 6 2, 0 4" fill="#3b82f6" />
                </marker>
              </defs>
              <path d="M 50 0 L 16.66 96" stroke="#3b82f6" strokeWidth="1.5" fill="none" className="opacity-80" markerEnd="url(#arrowhead)" />
              <path d="M 50 0 L 50 96" stroke="#3b82f6" strokeWidth="1.5" fill="none" className="opacity-80" markerEnd="url(#arrowhead)" />
              <path d="M 50 0 L 83.33 96" stroke="#3b82f6" strokeWidth="1.5" fill="none" className="opacity-80" markerEnd="url(#arrowhead)" />
            </svg>
          </div>

          {/* Leaf Nodes */}
          <div className="flex w-full justify-between items-start pt-2">
            <div className="text-white font-extrabold text-lg sm:text-2xl md:text-3xl lg:text-4xl text-center font-black w-1/3 px-1 drop-shadow-[0_2px_10px_rgba(59,130,246,0.5)]">
              Personal <br/> mfs
            </div>
            <div className="text-white font-extrabold text-lg sm:text-2xl md:text-3xl lg:text-4xl text-center font-black w-1/3 px-1 drop-shadow-[0_2px_10px_rgba(59,130,246,0.5)]">
              Merchant mfs <br/> /Bank/Card
            </div>
            <div className="text-white font-extrabold text-lg sm:text-2xl md:text-3xl lg:text-4xl text-center font-black w-1/3 px-1 drop-shadow-[0_2px_10px_rgba(59,130,246,0.5)]">
              Bangla QR
            </div>
          </div>
        </div>

        {/* Animated Marquee / Scrolling text for Use Cases */}
        <div className="w-screen overflow-hidden bg-neutral-900/50 py-6 border-y border-neutral-800 mb-20 relative">
           <motion.div 
             animate={{ x: ["0%", "-50%"] }} 
             transition={{ ease: "linear", duration: 35, repeat: Infinity }}
             className="flex w-max whitespace-nowrap gap-16"
           >
             <span className="text-xl md:text-3xl font-bold text-neutral-300">১. পার্সোনাল MFS: যাদের Trade License বা TIN Certificate নেই তাদের জন্য। ডিজিটাল ও ফিজিক্যাল প্রোডাক্ট সেল, ফ্রড অর্ডার কমাতে অ্যাডভান্স পেমেন্ট রিসিভ করুন। <span className="mx-8 text-pink-500/50">•</span> ২. মার্চেন্ট MFS/Bank/Card: Trade License ধারীদের জন্য। আনলিমিটেড পেমেন্ট রিসিভ, ডিজিটাল ও ফিজিক্যাল প্রোডাক্ট সেল এবং অ্যাডভান্স পেমেন্ট সিস্টেম। <span className="mx-8 text-pink-500/50">•</span> ৩. বাংলা QR: ফিজিক্যাল শপ বা শোরুমে বাংলা QR দিয়ে পেমেন্ট নিন ও ডিজিটাল হিসাব রাখুন। ফিজিক্যাল শপের পাশাপাশি অনলাইনেও সেল ও আইডেন্টিটি তৈরি করুন। <span className="mx-8 text-pink-500/50">•</span></span>
             <span className="text-xl md:text-3xl font-bold text-neutral-300">১. পার্সোনাল MFS: যাদের Trade License বা TIN Certificate নেই তাদের জন্য। ডিজিটাল ও ফিজিক্যাল প্রোডাক্ট সেল, ফ্রড অর্ডার কমাতে অ্যাডভান্স পেমেন্ট রিসিভ করুন। <span className="mx-8 text-pink-500/50">•</span> ২. মার্চেন্ট MFS/Bank/Card: Trade License ধারীদের জন্য। আনলিমিটেড পেমেন্ট রিসিভ, ডিজিটাল ও ফিজিক্যাল প্রোডাক্ট সেল এবং অ্যাডভান্স পেমেন্ট সিস্টেম। <span className="mx-8 text-pink-500/50">•</span> ৩. বাংলা QR: ফিজিক্যাল শপ বা শোরুমে বাংলা QR দিয়ে পেমেন্ট নিন ও ডিজিটাল হিসাব রাখুন। ফিজিক্যাল শপের পাশাপাশি অনলাইনেও সেল ও আইডেন্টিটি তৈরি করুন। <span className="mx-8 text-pink-500/50">•</span></span>
           </motion.div>
        </div>
        
        {/* Descriptive feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
           <div className="bg-neutral-900/80 p-6 md:p-8 rounded-2xl border border-neutral-800 transition-all hover:border-pink-500/30 hover:bg-neutral-800/80 group">
             <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
               <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
             </div>
             <h3 className="text-2xl md:text-3xl font-black text-white mb-4">আনলিমিটেড স্কেলিং</h3>
             <p className="text-lg text-neutral-400 leading-relaxed">
               যাদের Trade License ও TIN Certificate আছে, তারা মার্চেন্ট MFS, ব্যাংক বা কার্ড দিয়ে লিমিট ছাড়া পেমেন্ট রিসিভ করুন। ডিজিটাল ও ই-কমার্স ব্যবসার জন্য সম্পূর্ণ অটোমেশন।
             </p>
           </div>
           <div className="bg-neutral-900/80 p-6 md:p-8 rounded-2xl border border-neutral-800 transition-all hover:border-pink-500/30 hover:bg-neutral-800/80 group">
             <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
               <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
             </div>
             <h3 className="text-2xl md:text-3xl font-black text-white mb-4">Trade License নেই?</h3>
             <p className="text-lg text-neutral-400 leading-relaxed">
               যাদের Trade License বা TIN Certificate নেই, তারা পার্সোনাল MFS দিয়ে খুব সহজেই পেমেন্ট রিসিভ করা শুরু করুন। আপনার ডিজিটাল আইডেন্টিটি তৈরি করুন ও ই-কমার্স শুরু করুন কোনো ঝামেলা ছাড়াই।
             </p>
           </div>
           <div className="bg-neutral-900/80 p-6 md:p-8 rounded-2xl border border-neutral-800 transition-all hover:border-pink-500/30 hover:bg-neutral-800/80 group">
             <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
               <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
             </div>
             <h3 className="text-2xl md:text-3xl font-black text-white mb-4">ফিজিক্যাল শপ ও অনলাইন</h3>
             <p className="text-lg text-neutral-400 leading-relaxed">
               যাদের ফিজিক্যাল দোকান বা চেম্বার আছে, তারা ডিজিটাল হিসাব রাখার পাশাপাশি অনলাইনেও প্রোডাক্ট সেল করতে পারবেন। সাথে থাকছে বাংলা QR দিয়ে সরাসরি পেমেন্ট নেয়ার সুবিধা।
             </p>
           </div>
        </div>
      </section>

      {/* Pricing Section (Clean & Professional) */}
      <section id="pricing" className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 tracking-tight text-center">
            Scale on your terms
          </h2>
          
          {/* Custom Pill Toggle */}
          <div className="inline-flex items-center p-1 bg-neutral-900 border border-neutral-800 rounded-lg relative">
            <button 
              onClick={() => setIsYearly(false)}
              className={`relative z-10 px-6 py-2 rounded-md text-sm font-medium transition-all duration-300 ${!isYearly ? 'text-white' : 'text-neutral-400 hover:text-white'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setIsYearly(true)}
              className={`relative z-10 px-6 py-2 rounded-md text-sm font-medium transition-all duration-300 ${isYearly ? 'text-white' : 'text-neutral-400 hover:text-white'}`}
            >
              Yearly
            </button>
            <div 
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-neutral-700 rounded-md transition-all duration-300 ease-out shadow-sm ${isYearly ? 'translate-x-[calc(100%-4px)]' : 'translate-x-0'}`}
            ></div>
            
            {/* Minimal Discount Tag */}
            <div className="absolute -top-3 -right-4 bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Save 10%
            </div>
          </div>
        </div>

        {/* Bento/Grid Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, idx) => (
            <div 
              key={idx} 
              className={`relative flex flex-col bg-neutral-900 border ${plan.popular ? 'border-blue-500/50 ring-1 ring-blue-500/20' : 'border-neutral-800'} rounded-2xl p-6 transition-all hover:bg-neutral-800/80`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full shadow-sm">
                  Most Popular
                </div>
              )}
              
              <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center mb-6 border border-neutral-700">
                {plan.icon}
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-3xl font-bold text-white tracking-tight">
                  ৳{isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                </span>
                <span className="text-xs text-neutral-500 font-medium">
                  /{isYearly ? 'yr' : 'mo'}
                </span>
              </div>
              
              <div className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-neutral-300 leading-tight">{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleGoogleLogin}
                className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 group ${
                  plan.popular 
                  ? 'bg-blue-600 text-white hover:bg-blue-500' 
                  : 'bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700'
                }`}
              >
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-950 py-10 text-center mt-12">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8 text-sm font-semibold">
          <a href="/privacy-policy" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">Privacy Policy</a>
          <a href="/terms-conditions" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">Terms & Conditions</a>
          <a href="/refund-policy" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">Refund Policy</a>
          <a href="/anti-fraud" className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl border border-neutral-800 transition-all shadow-sm">Customer Rights & Anti Fraud Policy</a>
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-neutral-500" />
          <span className="text-lg font-bold text-neutral-500">MecoPay</span>
        </div>
        <p className="text-sm text-neutral-600">© {new Date().getFullYear()} MecoPay Framework. All rights reserved.</p>
      </footer>

      {/* Iframe Warning Modal */}
      {showIframeWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl max-w-md w-full shadow-xl relative overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              Security Notice
            </h3>
        <p className="text-neutral-300 text-sm leading-relaxed mb-6">
          Google Login is blocked inside preview frames for your security (Clickjacking protection). 
          <br/><br/>
          Click the button below to open MecoPay in a new tab and complete your login safely.
        </p>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowIframeWarning(false)}
            className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-2.5 rounded-lg transition-colors border border-neutral-700"
          >
            Close
          </button>
          <a 
            href={window.location.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setShowIframeWarning(false)}
            className="flex-1 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm"
          >
            Open in New Tab
          </a>
        </div>
          </div>
        </div>
      )}
    </div>
  );
}
