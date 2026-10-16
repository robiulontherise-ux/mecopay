import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ShieldCheck, Zap, Rocket, Globe, ArrowRight, Menu, Wallet, Crown, Link as LinkIcon, PlayCircle } from 'lucide-react';
import { getFeatureCopy, getHeroChunks, getSectionCopy, getTickerCopy } from '../lib/marketingLocalization';
import { useLocale } from '../lib/LocaleContext';

const pricingUnavailableTextLanguages = new Set(['khi', 'nzs', 'zib']);

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
  const [pricingMode, setPricingMode] = useState<'nocode' | 'custom'>('nocode');
  const { continent, country: selectedCountry, language, countries, isDetecting: isDetectingContinent, countryData: selectedCountryData, languageOptions: countryLanguageOptions, setCountry: setSelectedCountry, setLanguage } = useLocale();
  const pricingLanguage = pricingUnavailableTextLanguages.has(language) ? 'en' : language;
  const pricingLanguageOptions = countryLanguageOptions.filter((option) => !pricingUnavailableTextLanguages.has(option.value));
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>(['no-code-website']);
  useEffect(() => {
    // Calculate total time needed for the current chunk to finish its animation
    // Duration is 2.0s, delay is 0.5 + lineIndex * 2.0
    // We add 1.0s extra reading time after the last line finishes
    const numLines = getHeroChunks(pricingLanguage)[currentChunk].length;
    const animationTimeMs = (0.5 + (numLines - 1) * 2.0 + 2.0 + 1.0) * 1000;
    
    const timeout = setTimeout(() => {
      setCurrentChunk((prev) => (prev + 1) % textChunks.length);
    }, animationTimeMs);
    
    return () => clearTimeout(timeout);
  }, [currentChunk, pricingLanguage]);

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

  const pricingCatalog = {
    nocode: {
      tier3: [
        { id: 'no-code-website', name: 'No-Code Website Builder', price: 5, available: true, description: 'ই-কমার্স, এডটেক, ব্লগ বা নিউজ সাইট কোনো কোডিং ছাড়াই তৈরি ও publish করুন।', example: 'Example: course seller dashboard থেকে landing page ও product post publish করে।' },
        { id: 'custom-domain', name: 'Custom Domain (2x Speed)', price: 0, available: true, description: 'নিজস্ব domain connect করুন; No-Code user-এর জন্য HTML reference অনুযায়ী domain integration free।', example: 'Example: your store চলে www.acme.com-এ, platform subdomain-এ নয়।' },
        { id: 'capi', name: 'Server-Side Tracking (CAPI)', price: 2, available: true, description: 'Dynamic pay-as-you-go server-side event tracking module।', example: 'Example: campaign conversion event server থেকে ad platform-এ পাঠানো হয়।' },
        { id: 'personal-mfs', name: 'Personal MFS Automation (APK)', price: 2, available: true, description: 'Supported personal MFS payment-এর automated verification workflow।', example: 'Example: personal bKash/Nagad/M-Pesa payment order-এর সঙ্গে verify হয়।' },
        { id: 'local-gateway', name: 'Local Payment Gateway', price: 2, available: true, description: 'Local payment gateway integration for regional customers।', example: 'Example: Bangladesh বা regional buyer local gateway দিয়ে checkout করে।' },
        { id: 'international-gateway', name: 'International Gateway', price: 3, available: true, description: 'Global customer-এর জন্য international payment gateway connection।', example: 'Example: overseas customer international checkout ব্যবহার করে।' },
        { id: 'notifications', name: 'Notification (WhatsApp + SMS/Email)', price: 2, available: true, description: 'Payment/order event-এর customer ও merchant notifications।', example: 'Example: payment success হলে merchant alert এবং customer update পায়।' },
        { id: 'courier', name: 'Courier Auto-Book', price: 2, available: true, description: 'Confirmed order supported courier workflow-এ পাঠানোর automation।', example: 'Example: COD order confirm হলে courier handoff-এর জন্য প্রস্তুত হয়।' },
        { id: 'business-email', name: 'Business Email (Custom Domain)', price: 1, available: true, description: 'নিজস্ব domain-এ branded business email send ও receive করুন।', example: 'Example: sales@acme.com inquiry receive করে, support@acme.com reply করে।' }
      ],
      tier1: [
        { id: 'no-code-website', name: 'No-Code Website Builder', price: 25, available: true, description: 'Premium global market-এর জন্য no-code storefront ও content management।', example: 'Example: global brand code ছাড়াই product catalog publish করে।' },
        { id: 'custom-domain', name: 'Custom Domain (2x Speed)', price: 0, available: true, description: 'Premium tier-এ custom domain integration included।', example: 'Example: branded domain-এ fast storefront চালু হয়।' },
        { id: 'capi', name: 'Server-Side Tracking (CAPI)', price: 10, available: true, description: 'Dynamic server-side conversion tracking module।', example: 'Example: campaign events server-side attribution-এর জন্য পাঠানো হয়।' },
        { id: 'personal-mfs', name: 'Personal MFS Automation (APK)', price: 0, available: false, description: 'এই market tier-এ Personal MFS Automation available নয়।', example: 'N/A for Tier-1.' },
        { id: 'local-gateway', name: 'Local Payment Gateway', price: 10, available: true, description: 'Regional gateway integration for local payment methods।', example: 'Example: local customer regional gateway দিয়ে pay করে।' },
        { id: 'international-gateway', name: 'International Gateway', price: 15, available: true, description: 'Global gateway connection for international customers।', example: 'Example: international buyer card বা supported global method ব্যবহার করে।' },
        { id: 'notifications', name: 'Notification (WhatsApp + SMS/Email)', price: 10, available: true, description: 'Premium notification workflow for payment and order events।', example: 'Example: customer ও merchant দুজনেই real-time status update পায়।' },
        { id: 'courier', name: 'Courier Auto-Book', price: 15, available: true, description: 'Global operation-এর supported delivery workflow automation।', example: 'Example: confirmed order courier processing queue-তে যায়।' },
        { id: 'business-email', name: 'Business Email', price: 5, available: true, description: 'Professional custom-domain email identity for global business।', example: 'Example: hello@yourbrand.com দিয়ে customer communication।' }
      ]
    },
    custom: {
      tier3: [
        { id: 'no-code-website', name: 'No-Code Website Builder', price: 0, available: false, description: 'Existing website থাকলে No-Code Builder charge প্রযোজ্য নয়।', example: 'N/A — আপনার existing website ব্যবহার হবে।' },
        { id: 'custom-domain', name: 'Custom Domain (2x Speed)', price: 1, available: true, description: 'Existing website-এর সঙ্গে নিজের domain ও optimized routing connect করুন।', example: 'Example: existing store চলে shop.acme.com-এ।' },
        { id: 'capi', name: 'Server-Side Tracking (CAPI)', price: 2, available: true, description: 'Existing website-এর server-side tracking integration।', example: 'Example: checkout conversion server থেকে tracking platform-এ যায়।' },
        { id: 'personal-mfs', name: 'Personal MFS Automation (APK)', price: 2, available: true, description: 'Supported personal MFS payment verification workflow।', example: 'Example: personal MFS payment website order-এর সঙ্গে match হয়।' },
        { id: 'local-gateway', name: 'Local Payment Gateway', price: 2, available: true, description: 'Existing website-এ local gateway connection।', example: 'Example: regional customer local method দিয়ে pay করে।' },
        { id: 'international-gateway', name: 'International Gateway', price: 3, available: true, description: 'Existing website-এর জন্য international gateway integration।', example: 'Example: overseas customer global checkout ব্যবহার করে।' },
        { id: 'notifications', name: 'Notification (WhatsApp + SMS/Email)', price: 2, available: true, description: 'Existing checkout-এর payment/order notifications।', example: 'Example: order status customer ও merchant-কে পাঠানো হয়।' },
        { id: 'courier', name: 'Courier Auto-Book', price: 2, available: true, description: 'Existing website order courier workflow-এ পাঠানোর automation।', example: 'Example: paid/COD order courier handoff-এর জন্য তৈরি হয়।' },
        { id: 'business-email', name: 'Business Email', price: 1, available: true, description: 'নিজস্ব domain-এ business email send ও receive করুন।', example: 'Example: support@acme.com customer support reply দেয়।' }
      ],
      tier1: [
        { id: 'no-code-website', name: 'No-Code Website Builder', price: 0, available: false, description: 'Existing website user-এর জন্য No-Code Builder charge নেই।', example: 'N/A — existing website integration ব্যবহার হবে।' },
        { id: 'custom-domain', name: 'Custom Domain (2x Speed)', price: 5, available: true, description: 'Existing global website-এর branded domain connection।', example: 'Example: store.yourbrand.com global storefront address হয়।' },
        { id: 'capi', name: 'Server-Side Tracking (CAPI)', price: 10, available: true, description: 'Dynamic server-side tracking for global campaigns।', example: 'Example: server-side purchase event attribution-এর জন্য পাঠানো হয়।' },
        { id: 'personal-mfs', name: 'Personal MFS Automation (APK)', price: 0, available: false, description: 'এই market tier-এ Personal MFS Automation available নয়।', example: 'N/A for Tier-1.' },
        { id: 'local-gateway', name: 'Local Payment Gateway', price: 10, available: true, description: 'Existing website-এর local gateway integration।', example: 'Example: local market customer regional gateway ব্যবহার করে।' },
        { id: 'international-gateway', name: 'International Gateway', price: 15, available: true, description: 'Existing global website-এর international gateway integration।', example: 'Example: overseas customer supported international method ব্যবহার করে।' },
        { id: 'notifications', name: 'Notification (WhatsApp + SMS/Email)', price: 10, available: true, description: 'Global payment ও order notification workflow।', example: 'Example: payment status customer ও merchant দুজনকে জানানো হয়।' },
        { id: 'courier', name: 'Courier Auto-Book', price: 15, available: true, description: 'Existing website order-এর supported courier automation।', example: 'Example: confirmed order delivery queue-তে যায়।' },
        { id: 'business-email', name: 'Business Email', price: 5, available: true, description: 'Professional custom-domain email for global operations।', example: 'Example: sales@yourbrand.com lead receive করে।' }
      ]
    }
  };
  const pricingTier = continent === 'asia' || continent === 'africa' || continent === 'unknown' ? 'tier3' : 'tier1';
  const continentLabel = { asia: 'Asia', africa: 'Africa', europe: 'Europe', 'north-america': 'North America', 'south-america': 'South America', oceania: 'Oceania', unknown: 'your region' }[continent];
  const buildFeatures = pricingCatalog[pricingMode][pricingTier];
  const selectedFeatures = buildFeatures.filter((feature) => feature.available && selectedFeatureIds.includes(feature.id));
  const monthlyTotal = selectedFeatures.reduce((total, feature) => total + feature.price, 0);
  const planTotal = isYearly ? monthlyTotal * 12 * 0.9 : monthlyTotal;


  useEffect(() => {
    setSelectedFeatureIds(pricingMode === 'nocode' ? ['no-code-website'] : ['custom-domain']);
  }, [pricingMode, continent]);

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
          <Link to="/features" className="hover:text-white transition-colors">Features</Link>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <Link to="/docs" className="hover:text-white transition-colors">Docs</Link>
        </div>
</nav>
      <div className="flex flex-wrap justify-center items-center gap-2 border-b border-neutral-900 bg-neutral-950 px-4 py-3">
        <span className="text-xs font-semibold text-neutral-500">{isDetectingContinent ? 'Detecting location…' : `Country: ${selectedCountryData?.name || continent}`}</span>
        <select aria-label="Country" value={selectedCountry} onChange={(event) => setSelectedCountry(event.target.value)} className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-neutral-200">{countries.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}</select>
        <select aria-label="Language" value={pricingLanguage} onChange={(event) => setLanguage(event.target.value)} className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-neutral-200">{pricingLanguageOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
      </div>

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
              {getHeroChunks(pricingLanguage)[currentChunk] && getHeroChunks(pricingLanguage)[currentChunk].map((line, lineIndex) => {
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

      {/* Build Your Own Plan */}
      <section id="pricing" className="relative z-10 py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-300">Flexible business pricing</div>
          <h2 className="text-3xl md:text-5xl font-black text-white mt-5 mb-4 tracking-tight">Build Your Own Plan</h2>
          <p className="text-neutral-400 text-base md:text-lg">Choose only the services your business needs. Each feature explains what it does and where it fits in your workflow.</p>
          <div className="flex flex-wrap justify-center gap-2 mt-7 mb-3"><button onClick={() => setPricingMode('nocode')} className={`px-4 py-2 rounded-lg text-sm font-bold ${pricingMode === 'nocode' ? 'bg-blue-600 text-white' : 'bg-neutral-900 text-neutral-400'}`}>No-Code Website</button><button onClick={() => setPricingMode('custom')} className={`px-4 py-2 rounded-lg text-sm font-bold ${pricingMode === 'custom' ? 'bg-amber-500 text-white' : 'bg-neutral-900 text-neutral-400'}`}>Custom Website</button></div>
          <div className="flex flex-wrap justify-center items-center gap-2 mb-4"><span className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-4 py-2 text-xs font-semibold text-neutral-300">{isDetectingContinent ? 'Detecting your country…' : `Showing pricing for ${selectedCountryData?.name || continentLabel}`}</span><select aria-label="Country" value={selectedCountry} onChange={(event) => { setSelectedCountry(event.target.value); }} className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs font-semibold text-neutral-200"><option value="">Select country</option>{countries.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}</select><select aria-label="Language" value={pricingLanguage} onChange={(event) => setLanguage(event.target.value)} className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs font-semibold text-neutral-200">{pricingLanguageOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
          <div className="inline-flex items-center p-1 mt-7 bg-neutral-900 border border-neutral-800 rounded-lg relative">
            <button onClick={() => setIsYearly(false)} className={`relative z-10 px-6 py-2 rounded-md text-sm font-medium ${!isYearly ? 'text-white' : 'text-neutral-400 hover:text-white'}`}>Monthly</button>
            <button onClick={() => setIsYearly(true)} className={`relative z-10 px-6 py-2 rounded-md text-sm font-medium ${isYearly ? 'text-white' : 'text-neutral-400 hover:text-white'}`}>Yearly</button>
            <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-neutral-700 rounded-md transition-transform ${isYearly ? 'translate-x-[calc(100%-4px)]' : ''}`}></div>
            <div className="absolute -top-3 -right-4 bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">Save 10%</div>
          </div>
        </div>
        <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
          <div className="grid md:grid-cols-2 gap-4">
            {buildFeatures.map((feature) => {
              const selected = feature.available && selectedFeatureIds.includes(feature.id);
              return <button key={feature.id} disabled={!feature.available} onClick={() => feature.available && setSelectedFeatureIds((current) => selected ? current.filter((id) => id !== feature.id) : [...current, feature.id])} className={`text-left rounded-2xl border p-5 transition-all ${selected ? 'border-blue-500/70 bg-blue-500/10 shadow-lg shadow-blue-950/30' : 'border-neutral-800 bg-neutral-900/70 hover:border-neutral-600'}`}>
                <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center">{(feature as any).icon || '⚡'}</span><span className="font-bold text-white">{feature.name}</span></div><span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${selected ? 'bg-blue-600 border-blue-500 text-white' : 'border-neutral-600 text-transparent'}`}>✓</span></div>
                <p className="text-sm text-neutral-300 mt-4 leading-relaxed">{getFeatureCopy(feature.id, pricingLanguage)[0]}</p>
                <p className="text-xs text-neutral-500 mt-3 leading-relaxed"><strong className="text-neutral-400">Example:</strong> {getFeatureCopy(feature.id, pricingLanguage)[1].replace('Example: ', '')}</p>
                <p className="text-sm text-blue-300 font-bold mt-4">{feature.available ? (feature.price === 0 ? 'FREE' : `$${feature.price}/mo`) : 'N/A'}</p>
              </button>;
            })}
          </div>
          <aside className="lg:sticky lg:top-28 rounded-2xl border border-blue-500/30 bg-gradient-to-b from-blue-950/60 to-neutral-900 p-6">
            <p className="text-xs uppercase tracking-wider text-blue-300 font-bold">Your custom plan</p>
            <h3 className="text-2xl font-black text-white mt-2">{selectedFeatures.length} services selected</h3>
            <div className="my-6 flex items-end gap-2"><span className="text-4xl font-black text-white">${planTotal.toLocaleString()}</span><span className="text-sm text-neutral-400 mb-1">/{isYearly ? 'year' : 'month'}</span></div>
            <div className="space-y-2 border-y border-neutral-800 py-4 mb-6">{selectedFeatures.length ? selectedFeatures.map((feature) => <div key={feature.id} className="flex justify-between gap-3 text-sm"><span className="text-neutral-300">{feature.name}</span><span className="text-neutral-400">${isYearly ? Math.round(feature.price * 12 * 0.9).toLocaleString() : feature.price}</span></div>) : <p className="text-sm text-neutral-500">Select a service to start building your plan.</p>}</div>
            <button onClick={handleGoogleLogin} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors">Start with this plan</button>
            <p className="text-[11px] text-neutral-500 mt-4 leading-relaxed">Illustrative starting prices are shown for planning. Payment processing or third-party usage charges may be separate where applicable.</p>
          </aside>
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
