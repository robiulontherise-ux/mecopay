import React, { useEffect, useState, useRef } from 'react';
import MySiteApp from '../mysite/App';
import WebsiteBuilderHub from './WebsiteBuilderHub';
import CustomDomainBuy from './mysite/CustomDomainBuy';
import IntegrateCustomDomain from './mysite/IntegrateCustomDomain';
import SmsServiceSettings from './mysite/SmsServiceSettings';
import EmailServiceSettings from './mysite/EmailServiceSettings';
import ServerSideTrackingSettings from './mysite/ServerSideTrackingSettings';
import WebCustomAgent from './mysite/WebCustomAgent';
import SocialCustomAgent from './mysite/SocialCustomAgent';
import Marketplace from './Marketplace';
import HeadlessOrchestrator from './admin/HeadlessOrchestrator';
import FreelancerApplicationsAdmin from './admin/FreelancerApplicationsAdmin';
import FreelancerApplicationSection from './FreelancerApplicationSection';
import FreelancerWorkspace from './FreelancerWorkspace';
import InfluencerWorkspace from './InfluencerWorkspace';
import TeleSalesWorkspace from './TeleSalesWorkspace';
import TeleSalesAccessPanel from './payment-hub/TeleSalesAccessPanel';
import { supabase } from '../lib/supabase';
import { showToast } from '../lib/toast';
import { showConfirm } from '../lib/confirm';
import LocaleSwitcher from './LocaleSwitcher';
import MfaSettings from './MfaSettings';
import GatewaySettings from "./payment-hub/GatewaySettings";
import PaymentLinks from "./payment-hub/PaymentLinks";
import Invoices from "./payment-hub/Invoices";
import CourierService from "./payment-hub/CourierService";
import FullCodService from "./payment-hub/FullCodService";
import DigitalService from "./payment-hub/DigitalService";
import DeveloperDocs from "./DeveloperDocs";
import { downloadWordPressPluginZip } from '../lib/wordpressPluginSource';
import { useNavigate } from 'react-router-dom';
import { Box, FolderGit2, UploadCloud, Lock, Search, LogOut, Upload, ShieldCheck, Key, Plug, CreditCard, LayoutTemplate, Settings, ChevronRight, Menu, X, ChevronDown, CheckCircle2, Zap, Rocket, Globe, Wallet, Crown, Plus, Video, MoreVertical, Copy, Edit, RefreshCw, Trash2, Image as ImageIcon, Save, Info, Download, Smartphone, FileText, ExternalLink, ShieldAlert, Inbox, Book, Sparkles, Link as LinkIcon, ArrowRight, PlayCircle, Camera, Clock, Eye, SwitchCamera, Check } from 'lucide-react';
import { getFeatureCopy, getHeroChunks, getSectionCopy, getTickerCopy } from '../lib/marketingLocalization';
import { useLocale } from '../lib/LocaleContext';
import { getProfileCopy } from '../lib/profileLocalization';
import { ASIA_COUNTRIES, AFRICA_COUNTRIES } from '../lib/countries';

export default function DashboardShell() {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [hmacSecret, setHmacSecret] = useState<string>('');
  const isAdmin = Boolean(user?.email && (user.email === 'robiulontherise@gmail.com' || ((import.meta as any).env.VITE_ADMIN_EMAIL && user.email === (import.meta as any).env.VITE_ADMIN_EMAIL)));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'brand' | 'payments' | 'site' | 'freelancer' | 'influencer' | 'teleSales' | 'admin'>('brand');
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error', id: number} | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<any | null>(null);
  const [confirmInput, setConfirmInput] = useState('');
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent;
      const id = Date.now();
      setToast({ ...customEvent.detail, id });
      setTimeout(() => {
        setToast(prev => prev?.id === id ? null : prev);
      }, 1500);
    };
    window.addEventListener('show-toast', handleToast);
    const handleConfirmRequest = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setConfirmDialog(detail);
      setConfirmInput('');
      if (typeof detail === 'object' && detail.defaultCheckbox !== undefined) {
        setConfirmCheckbox(detail.defaultCheckbox);
      } else {
        setConfirmCheckbox(false);
      }
    };
    window.addEventListener('show-confirm', handleConfirmRequest);
    return () => {
      window.removeEventListener('show-toast', handleToast);
      window.removeEventListener('show-confirm', handleConfirmRequest);
    };
  }, []);
  const [activeSubMenu, setActiveSubMenu] = useState<string>('Profile');

  useEffect(() => {
    setActiveBrandDropdown(null);
    const container = document.getElementById('main-scroll-container');
    if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeSubMenu, activeTab]);

  const [isYearly, setIsYearly] = useState(false);
  const [pricingMode, setPricingMode] = useState<'nocode' | 'custom'>('nocode');
  const { continent, country: selectedCountry, language, countries, isDetecting: isDetectingContinent, countryData: selectedCountryData, languageOptions: countryLanguageOptions, setCountry: setSelectedCountry, setLanguage } = useLocale();
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>(['no-code-website']);
  const profileCopy = getProfileCopy(language);
  // Keep English copy in English, but pass Bengali source copy through the
  // dashboard localization boundary for every selected non-English locale.
  // This makes Profile validation/toast messages follow the same catalog path
  // as pricing and checkout instead of silently falling back to English.
  const profileUiText = (bengali: string, english: string) => language === 'en' ? english : bengali;

  useEffect(() => {
    setSelectedFeatureIds(pricingMode === 'nocode' ? ['no-code-website'] : ['custom-domain']);
  }, [pricingMode, continent]);
  const [showAddFund, setShowAddFund] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [customDevices, setCustomDevices] = useState<string[]>([]);
  const [deviceStatuses, setDeviceStatuses] = useState<any[]>([]);


  const [gatewayNumbers, setGatewayNumbers] = useState<any[]>([]);
  const [newDeviceInput, setNewDeviceInput] = useState<string>('');
  
  // Custom Modal States
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [regenerateInput, setRegenerateInput] = useState('');
  
  const [showDeleteDeviceModal, setShowDeleteDeviceModal] = useState(false);
  const [deleteDeviceInput, setDeleteDeviceInput] = useState('');
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);

  // New device creation attributes
  const [newDeviceBrandId, setNewDeviceBrandId] = useState<string>('');
  const [newDeviceCountry, setNewDeviceCountry] = useState<string>('Bangladesh');

  // Admin country selector for system settings
  const [adminSelectedCountry, setAdminSelectedCountry] = useState<string>('Bangladesh');

  const handleAddDevice = async () => {
    const trimmed = newDeviceInput.trim();
    if (!trimmed) {
      showToast("Please enter a device name", "error");
      return;
    }
    if (customDevices.includes(trimmed)) {
      showToast("Device already exists", "error");
      return;
    }
    if (!user?.id) {
      showToast("User not found", "error");
      return;
    }

    try {
      const res = await fetch('/api/user/add-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          device_name: trimmed,
          brand_id: newDeviceBrandId || (brands[0]?.id ? String(brands[0].id) : null),
          country: newDeviceCountry || 'Bangladesh',
          hmac_secret: hmacSecret || "HMAC_SECRET"
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add device');
      
      setCustomDevices([...customDevices, trimmed]);
      setNewDeviceInput('');
      showToast("Device created and saved!", "success");
    } catch (e: any) {
      console.error(e);
      showToast(e.message || "Failed to add device due to permissions", "error");
    }
  };

  const handleDeleteDevice = (device: string) => {
    setDeviceToDelete(device);
    setDeleteDeviceInput('');
    setShowDeleteDeviceModal(true);
  };

  const confirmDeleteDevice = async () => {
    if (deleteDeviceInput !== 'delete' || !deviceToDelete) return;
    try {
      if (user?.id) {
        await supabase.from('device_status').delete().match({ user_id: user.id, device_id: deviceToDelete });
        await supabase.from('sms_forwarder_settings').delete().match({ user_id: user.id, device_name: deviceToDelete });
      }
      setCustomDevices(prev => prev.filter(d => d !== deviceToDelete));
      setShowDeleteDeviceModal(false);
      setDeviceToDelete(null);
      showToast("Device deleted successfully", "success");
    } catch (error) {
      console.error("Failed to delete device", error);
      showToast("Failed to delete device", "error");
    }
  };

  const handleCopy = (text: string, fieldId: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };



  // Admin Users Real State
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [mockAdminUsers, setMockAdminUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  
  const [adminWarning, setAdminWarning] = useState('');
  
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setAdminWarning('');
    try {
      let foundUsers: any[] = [];

      // 1. First attempt: Call backend API route (bypasses RLS with service role and returns all profiles & KYC files)
      try {
        const res = await fetch('/api/admin/users');
        if (res.ok) {
          const data = await res.json();
          if (data.users && Array.isArray(data.users) && data.users.length > 0) {
            foundUsers = data.users;
          }
        }
      } catch (backendErr) {
        console.warn('Backend admin users fetch:', backendErr);
      }

      // 2. Second attempt: Direct Supabase client query
      if (foundUsers.length === 0) {
        const { data: dbProfiles, error: profErr } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (dbProfiles && dbProfiles.length > 0) {
          foundUsers = dbProfiles.map((p: any) => ({
            id: p.id,
            name: p.name || p.email?.split('@')[0] || 'Client',
            email: p.email,
            phone: p.phone || 'N/A',
            provider: 'Email / OAuth',
            verification: p.verification_status === 'verified'
              ? 'Verified ✓'
              : p.verification_status === 'rejected'
              ? 'Rejected'
              : p.verification_status === 'pending'
              ? 'Pending'
              : 'Unverified',
            verification_status: p.verification_status || (p.nid_number || p.birth_number || p.nid_front_url || p.birth_cert_url ? 'pending' : 'unverified'),
            rejection_reason: p.rejection_reason,
            age_group: p.age_group,
            nid_number: p.nid_number,
            nid_front_url: p.nid_front_url,
            nid_back_url: p.nid_back_url,
            birth_number: p.birth_number,
            birth_cert_url: p.birth_cert_url,
            face_image_url: p.face_image_url,
            website_url: p.website_url,
            social_fb: p.social_fb,
            social_insta: p.social_insta,
            social_li: p.social_li,
            social_yt: p.social_yt,
            joined: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A',
            status: p.status || 'Active'
          }));
        }
      }

      setMockAdminUsers(foundUsers);
    } catch (e) {
      console.error("Error in fetchUsers:", e);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchAdminDevices = async () => {
    try {
      const res = await fetch('/api/admin/devices');
      if (res.ok) {
        const data = await res.json();
        setAllClientDevices(data.devices || []);
      }
    } catch (e) {
      console.error("Failed to fetch admin devices", e);
    }
  };

  useEffect(() => {
    if (activeSubMenu === 'Users' && isAdmin) {
      fetchUsers();
    }
    if (activeSubMenu === 'Sms Forwarder Settings' && isAdmin) {
      fetchAdminDevices();
    }
  }, [activeSubMenu, isAdmin]);
  
  const toggleUserStatus = async (id: string, currentStatus: string) => {
    const isBlocking = currentStatus === 'Active';
    try {
      const nextStatus = isBlocking ? 'Blocked' : 'Active';
      await supabase
        .from('profiles')
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      try {
        await fetch(`/api/admin/users/${id}/${isBlocking ? 'block' : 'unblock'}`, {
          method: 'POST'
        });
      } catch (err) {
        console.warn("Server proxy endpoint sync skipped:", err);
      }

      setMockAdminUsers(users => users.map(u => 
        u.id === id ? { ...u, status: nextStatus } : u
      ));
      showToast(isBlocking ? "ইউজার সফলভাবে ব্লক (Banned) করা হয়েছে" : "ইউজার আনব্লক করা হয়েছে", "success");
    } catch (e) {
      console.error(e);
      showToast("স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে!", "error");
    }
  };

  // Profile States
  const [profileName, setProfileName] = useState<string>('');
  const [profilePhone, setProfilePhone] = useState<string>('');
  const [phoneType, setPhoneType] = useState<'whatsapp' | 'telegram' | 'both'>('whatsapp');
  const [ageGroup, setAgeGroup] = useState<'18_plus' | 'under_18'>('18_plus');
  const [nidNumber, setNidNumber] = useState<string>('');
  const [nidFrontImage, setNidFrontImage] = useState<string>('');
  const [nidBackImage, setNidBackImage] = useState<string>('');
  const [birthNumber, setBirthNumber] = useState<string>('');
  const [birthImage, setBirthImage] = useState<string>('');
  const [faceImage, setFaceImage] = useState<string>('');
  const [isBirthLocked, setIsBirthLocked] = useState(false);
  const [isNidLocked, setIsNidLocked] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState<string>('');
  const [socialFb, setSocialFb] = useState<string>('');
  const [socialInsta, setSocialInsta] = useState<string>('');
  const [socialLi, setSocialLi] = useState<string>('');
  const [socialYt, setSocialYt] = useState<string>('');
  const [isIdentityLocked, setIsIdentityLocked] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'unverified' | 'pending' | 'verified' | 'rejected' | 'banned'>('unverified');
  const [isFreelancer, setIsFreelancer] = useState(false);
  const [isInfluencer, setIsInfluencer] = useState(false);
  const [hasTeleSalesAccess, setHasTeleSalesAccess] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const isDashboardUnlocked = verificationStatus === 'pending' || verificationStatus === 'verified' || isAdmin;

  // Live Camera Capture States
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'birth' | 'nid_front' | 'nid_back' | 'face' | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const liveCameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cameraOpen && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(e => console.warn("Video play error:", e));
    }
  }, [cameraOpen, cameraStream]);

  // Admin KYC Review Modal States
  const [kycModalUser, setKycModalUser] = useState<any | null>(null);
  const [adminRejectInput, setAdminRejectInput] = useState<string>('');
  const [showRejectInputBox, setShowRejectInputBox] = useState(false);
  const [isUpdatingKyc, setIsUpdatingKyc] = useState(false);
  const [previewZoomImage, setPreviewZoomImage] = useState<string | null>(null);

  // Global SMS Forwarder Settings (Sync with backend table sms_forwarder_settings)
  const [forwarderSettings, setForwarderSettings] = useState({
    sender_number: '',
    text_filter: '',
    webhook_edge_url: '',
    headers: '',
    json_payload_template: '',
    project_url: '',
    anon_key: '',
    ws_channel: '',
    heartbeat_edge_url: '',
    dashboard_url: 'https://mecopay.pages.dev/dashboard'
  });
  const [isSavingForwarderSettings, setIsSavingForwarderSettings] = useState(false);
  const [allClientDevices, setAllClientDevices] = useState<any[]>([]);
  
  // Brand States
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [activeBrandDropdown, setActiveBrandDropdown] = useState<string | null>(null);
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [selectedGatewayBrandId, setSelectedGatewayBrandId] = useState<string>('');
  const [gatewayForm, setGatewayForm] = useState({
    bkash_merchant_id: '',
    bkash_app_key: '',
    bkash_app_secret: '',
    nagad_merchant_id: '',
    nagad_public_key: '',
    personal_bkash_no: '',
    personal_nagad_no: '',
    personal_rocket_no: ''
  });
  
  // Mock Brands Data
  
  // Real Brand States
  const [brands, setBrands] = useState<any[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [webhookForm, setWebhookForm] = useState({ brand_id: '', payload_url: '', webhook_secret: '' });
  const [brandForm, setBrandForm] = useState({
    name: '',
    website_url: '',
    allow_telegram: false,
    allow_tally: false,
    allow_facebook: false,
    allow_whatsapp: false,
    allow_drive: false,
    allow_youtube: false,
    logo_url: '',
    support_email: '',
    verify_trx_id: true, verify_phone: false, merchant_api: true, personal_api: false, international_api: false,
    payment_amount_type: 'equal',
    amount_format: 'as_is',
    transaction_fee: '0',
    transaction_fee_type: 'fixed'
  });

  // Fetch Brands from Supabase
  const fetchBrands = async () => {
    setIsLoadingBrands(true);
    try {
      if (user?.id) {
        const { data, error } = await supabase
          .from("brands")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (!error && data) {
          setBrands(data);
        } else {
          setBrands([]);
        }
      } else {
        setBrands([]);
      }
    } catch (err) {
      console.error("Error loading remote brands:", err);
      setBrands([]);
    } finally {
      setIsLoadingBrands(false);
    }
  };

  // Fetch Webhooks from Supabase
  const fetchWebhooks = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from("webhooks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error && data) {
        setWebhooks(data);
      } else {
        setWebhooks([]);
      }
    } catch (err) {
      console.error("Error loading webhooks:", err);
      setWebhooks([]);
    }
  };

  const [isSavingWebhook, setIsSavingWebhook] = useState(false);

  const handleSaveWebhookEndpoint = async () => {
    if (!webhookForm.brand_id) {
      showToast("Please select a brand", "error");
      return;
    }
    if (!webhookForm.payload_url || !webhookForm.payload_url.trim()) {
      showToast("Please enter a Payload URL", "error");
      return;
    }
    const cleanUrl = webhookForm.payload_url.trim();
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      showToast("Payload URL must start with http:// or https://", "error");
      return;
    }

    const selectedBrand = brands.find(b => String(b.id) === String(webhookForm.brand_id));
    const secret = webhookForm.webhook_secret || selectedBrand?.webhook_secret || '';

    setIsSavingWebhook(true);
    try {
      const { data: existing } = await supabase
        .from("webhooks")
        .select("id")
        .eq("brand_id", webhookForm.brand_id)
        .maybeSingle();

      if (existing?.id) {
        const updatePayload: any = {
          payload_url: cleanUrl,
          webhook_secret: secret
        };
        let { error } = await supabase
          .from("webhooks")
          .update(updatePayload)
          .eq("id", existing.id);

        if (error && error.message?.includes("webhook_secret")) {
          const retry = await supabase
            .from("webhooks")
            .update({ payload_url: cleanUrl })
            .eq("id", existing.id);
          error = retry.error;
        }

        if (error) {
          showToast(error.message || "Failed to update webhook endpoint", "error");
        } else {
          showToast("Webhook endpoint updated successfully!", "success");
          fetchWebhooks();
        }
      } else {
        const insertPayload: any = {
          user_id: user?.id,
          brand_id: webhookForm.brand_id,
          payload_url: cleanUrl,
          webhook_secret: secret
        };
        let { error } = await supabase
          .from("webhooks")
          .insert([insertPayload]);

        if (error && error.message?.includes("webhook_secret")) {
          delete insertPayload.webhook_secret;
          const retry = await supabase
            .from("webhooks")
            .insert([insertPayload]);
          error = retry.error;
        }

        if (error) {
          showToast(error.message || "Failed to save webhook endpoint", "error");
        } else {
          showToast("Webhook endpoint saved successfully!", "success");
          fetchWebhooks();
          setWebhookForm(prev => ({ ...prev, payload_url: '' }));
        }
      }
    } catch (err: any) {
      showToast(err.message || "Failed to save endpoint", "error");
    } finally {
      setIsSavingWebhook(false);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    try {
      const { error } = await supabase.from("webhooks").delete().eq("id", id);
      if (!error) {
        showToast("Webhook endpoint deleted successfully", "success");
        fetchWebhooks();
      } else {
        showToast("Failed to delete webhook", "error");
      }
    } catch (err) {
      showToast("Error deleting webhook", "error");
    }
  };

  useEffect(() => {
    fetchBrands();
    fetchWebhooks();
  }, [user, activeSubMenu]);

  // Handle Create / Edit Brand Modal
    const handleOpenCreateBrand = () => {
    setEditingBrandId(null);
    setBrandForm({
      name: '',
      website_url: '',
      allow_telegram: false,
      allow_tally: false,
      allow_facebook: false,
      allow_whatsapp: false,
      allow_drive: false,
      allow_youtube: false,
      logo_url: '',
      support_email: '',
      verify_trx_id: true, verify_phone: false, merchant_api: true, personal_api: false, international_api: false,
      payment_amount_type: 'equal',
      amount_format: 'as_is',
      transaction_fee: '0',
      transaction_fee_type: 'fixed'
    });
    setShowBrandModal(true);
  };

  const handleOpenEditBrand = (brand: any) => {
    setEditingBrandId(brand.id);
    setBrandForm({
      name: brand.name || '',
      website_url: brand.website_url || '',
      allow_telegram: !!brand.redirect_links?.allow_telegram,
      allow_tally: !!brand.redirect_links?.allow_tally,
      allow_facebook: !!brand.redirect_links?.allow_facebook,
      allow_whatsapp: !!brand.redirect_links?.allow_whatsapp,
      allow_drive: !!brand.redirect_links?.allow_drive,
      allow_youtube: !!brand.redirect_links?.allow_youtube,
      logo_url: brand.logo_url || '',
      support_email: brand.support_email || '',
      payment_amount_type: brand.payment_amount_type || 'equal',
      amount_format: brand.amount_format || 'as_is',
      transaction_fee: (brand.transaction_fee || 0).toString(),
      transaction_fee_type: brand.transaction_fee_type || 'fixed',
      verify_trx_id: brand.redirect_links?.verify_trx_id ?? true,
      verify_phone: brand.redirect_links?.verify_phone ?? false,
      merchant_api: (typeof brand.merchant_api === 'boolean') ? brand.merchant_api : (brand.redirect_links?.merchant_api ?? true),
      personal_api: (typeof brand.personal_api === 'boolean') ? brand.personal_api : (brand.redirect_links?.personal_api ?? false),
      international_api: (typeof brand.international_api === 'boolean') ? brand.international_api : (brand.redirect_links?.international_api ?? false)
    });
    setActiveBrandDropdown(null);
    setShowBrandModal(true);
  };

  const handleSaveBrand = async () => {
    if (!brandForm.name.trim()) {
      showToast("Brand Name is required!", "error");
      return;
    }

    const dbPayload = {
      name: brandForm.name.trim(),
      website_url: brandForm.website_url,
      logo_url: brandForm.logo_url,
      support_email: brandForm.support_email,
      payment_amount_type: brandForm.payment_amount_type,
      amount_format: brandForm.amount_format,
      transaction_fee: Number(brandForm.transaction_fee) || 0,
      transaction_fee_type: brandForm.transaction_fee_type,
      personal_api: Boolean(brandForm.personal_api),
      merchant_api: Boolean(brandForm.merchant_api),
      international_api: Boolean(brandForm.international_api),
      redirect_links: {
        allow_telegram: brandForm.allow_telegram,
        allow_tally: brandForm.allow_tally,
        allow_facebook: brandForm.allow_facebook,
        allow_drive: brandForm.allow_drive,
        verify_trx_id: brandForm.verify_trx_id,
        verify_phone: brandForm.verify_phone,
        merchant_api: brandForm.merchant_api,
        personal_api: brandForm.personal_api,
        international_api: brandForm.international_api
      }
    };
    
    let updatedList = [...brands];

    try {
      if (editingBrandId) {
        if (user?.id) {
          try {
            const { data, error } = await supabase
              .from('brands')
              .update(dbPayload)
              .eq('id', editingBrandId)
              .select();
            if (!error && data && data.length > 0) {
              updatedList = brands.map(b => b.id === editingBrandId ? data[0] : b);
              showToast("Updated successfully!", 'success');
              // 🚀 Auto-sync to Cloudflare Edge KV via Edge Function
              supabase.functions.invoke('cloudflare-custom-hostname', {
                body: { action: 'sync_brand', brand_id: editingBrandId }
              }).catch(err => console.warn('Edge KV sync error:', err));
            } else {
              throw new Error(error?.message || "Failed to update brand");
            }
          } catch(e) {
            console.error(e);
            showToast("Failed to update!", 'error');
          }
        }
      } else {
        if (user?.id) {
          try {
            const apiKey = 'mp_live_' + crypto.randomUUID().replace(/-/g, '');
            const webhookSecret = 'whsec_' + crypto.randomUUID().replace(/-/g, '');
            
            const insertPayload = {
              user_id: user.id,
              api_key: apiKey,
              webhook_secret: webhookSecret,
              ...dbPayload
            };
            
            const { data, error } = await supabase
              .from('brands')
              .insert(insertPayload)
              .select();
              
            if (error) {
              console.error("Database error:", error);
              throw new Error(error.message || "Failed to create brand");
            }
            
            if (data && data.length > 0) {
              updatedList = [data[0], ...brands];
              showToast("Created successfully!", "success");
              // 🚀 Auto-sync to Cloudflare Edge KV via Edge Function
              supabase.functions.invoke('cloudflare-custom-hostname', {
                body: { action: 'sync_brand', brand_id: data[0].id }
              }).catch(err => console.warn('Edge KV sync error:', err));
            }
          } catch(e: any) {
            console.error(e);
            showToast("Failed to create!", "error");
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBrands(updatedList);
      setShowBrandModal(false);
      setEditingBrandId(null);
      setBrandForm({
        name: '', website_url: '', allow_telegram: false, allow_tally: false, allow_facebook: false, allow_whatsapp: false, allow_drive: false, allow_youtube: false, logo_url: '', support_email: '', verify_trx_id: true, verify_phone: false, merchant_api: true, personal_api: false, international_api: false,
        payment_amount_type: 'equal', amount_format: 'as_is', transaction_fee: '0', transaction_fee_type: 'fixed'
      });
    }
  };

  // Handle Delete Brand
        const handleDeleteBrand = async (id: string) => {
    const res = await showConfirm({
      msg: "Are you sure you want to delete this brand? Its payment links will be deleted.",
      requireType: "delete",
      checkboxLabel: "Also delete associated Gateways",
      defaultCheckbox: false
      
    });
    
    if (!res || !res.confirmed) return;
    
    try {
      if (user?.id) {
        // 1. Keep invoices safe (detach brand)
        const { error: invErr } = await supabase.from('invoices').update({ brand_id: null }).eq('brand_id', id);
        if (invErr) console.warn("Failed to detach invoices:", invErr);
        
        // 2. Gateway logic
        if (res.checked) {
          const { error: numErr } = await supabase.from('payment_numbers').delete().eq('brand_id', id);
          if (numErr) throw numErr;
        } else {
          // Detach brand from gateway (requires ALTER TABLE payment_numbers ALTER COLUMN brand_id DROP NOT NULL)
          const { error: numErr } = await supabase.from('payment_numbers').update({ brand_id: null }).eq('brand_id', id);
          if (numErr) throw new Error("Database constraint error: Please run the provided SQL in Supabase to allow detaching gateways, or select 'Also delete associated Gateways'.");
        }
        
        // 3. Delete Payment Links under this brand
        const { error: linkErr } = await supabase.from('payment_links').delete().eq('brand_id', id);
        if (linkErr) throw linkErr;
        
        // 4. Finally, delete the brand itself
        const { error: brandErr } = await supabase.from('brands').delete().eq('id', id);
        if (brandErr) throw brandErr;
      }
      
      const filtered = brands.filter(b => b.id !== id);
      setBrands(filtered);
      setActiveBrandDropdown(null);
      showToast("Deleted successfully!", 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || "Failed to delete!", 'error');
    }
  };

  

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (!isMounted) return;
      if (error || !user) {
        console.error('Auth verification failed:', error);
        // Do not force redirect here, let App.tsx routing handle it based on session state
        // Removing the aggressive localstorage clear and window.location.href
        return;
      }
      setUser(user);
      setIsFreelancer(false);
      setIsInfluencer(false);
      setHasTeleSalesAccess(false);
      supabase.rpc('has_tele_sales_access').then(({ data, error: accessError }) => {
        if (isMounted && !accessError) setHasTeleSalesAccess(data === true);
      });
      
      // Fetch hmac_secret from profiles table (with retry for trigger delay)
      const fetchHmac = async (retries = 5) => {
        let lastError = null;
        for (let i = 0; i < retries; i++) {
          // Try with 'id' column
          let { data, error } = await supabase.from('profiles').select('hmac_secret').eq('id', user.id).maybeSingle();
          lastError = error;
          
          if (!data?.hmac_secret) {
             // Fallback: try with 'user_id' column if 'id' didn't work
             const fallback = await supabase.from('profiles').select('hmac_secret').eq('user_id', user.id).maybeSingle();
             if (fallback.data?.hmac_secret) {
               data = fallback.data;
               lastError = fallback.error;
             }
          }

          if (data?.hmac_secret) {
            setHmacSecret(data.hmac_secret);
            return;
          }
          await new Promise(res => setTimeout(res, 1000)); // wait 1s before retry
        }
        console.error("Failed to fetch hmac_secret after retries. Error:", lastError, "User ID:", user.id);
        if (lastError) {
          setHmacSecret(`ERROR_PERMISSION_DENIED`);
          console.error("Supabase Permission Error. Please run GRANT queries in SQL Editor.", lastError);
        } else {
          setHmacSecret('ERROR_ROW_NOT_FOUND');
        }
      };
      fetchHmac();
        
      // Load user profile from Supabase profiles table
      const fetchUserProfile = async () => {
        try {
          const { data: dbProf } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (dbProf && isMounted) {
            setProfileName(dbProf.name || user.user_metadata?.full_name || '');
            setProfilePhone(dbProf.phone || user.user_metadata?.phone || '');
            setPhoneType((user.user_metadata?.phone_type as any) || dbProf.phone_type || 'whatsapp');
            setAgeGroup(dbProf.age_group || user.user_metadata?.age_group || '18_plus');
            setNidNumber(dbProf.nid_number || user.user_metadata?.nid_number || '');
            setNidFrontImage(dbProf.nid_front_url || user.user_metadata?.nid_front_image || '');
            setNidBackImage(dbProf.nid_back_url || user.user_metadata?.nid_back_image || '');
            setBirthNumber(dbProf.birth_number || user.user_metadata?.birth_number || '');
            setBirthImage(dbProf.birth_cert_url || user.user_metadata?.birth_image || '');
            setFaceImage(dbProf.face_image_url || user.user_metadata?.face_image || '');
            setWebsiteUrl(dbProf.website_url || user.user_metadata?.website_url || '');
            setSocialFb(dbProf.social_fb || user.user_metadata?.social_fb || '');
            setSocialInsta(dbProf.social_insta || user.user_metadata?.social_insta || '');
            setSocialLi(dbProf.social_li || user.user_metadata?.social_li || '');
            setSocialYt(dbProf.social_yt || user.user_metadata?.social_yt || '');
            const hasSubmittedDocs = !!(dbProf.nid_number || dbProf.birth_number || dbProf.nid_front_url || dbProf.birth_cert_url || dbProf.face_image_url);
            let vStatus: 'unverified' | 'pending' | 'verified' | 'rejected' = 'unverified';
            if (dbProf.verification_status === 'verified') vStatus = 'verified';
            else if (dbProf.verification_status === 'rejected') vStatus = 'rejected';
            else if (hasSubmittedDocs) vStatus = 'pending';
            else vStatus = 'unverified';
            setVerificationStatus(vStatus as any);
            setIsFreelancer(Boolean(dbProf.is_freelancer));
            setIsInfluencer(Boolean(dbProf.is_influencer));
            setRejectionReason(dbProf.rejection_reason || '');

            const isLocked = vStatus === 'verified';
            setIsIdentityLocked(isLocked);
            setIsBirthLocked(!!dbProf.birth_number);
            setIsNidLocked(!!dbProf.nid_number);

            // If user already submitted documents / verified / pending, unlock into Dashboard
            if (vStatus === 'verified' || vStatus === 'pending') {
              setActiveTab('brand');
              setActiveSubMenu('Dashboard');
            }
            return;
          }
        } catch (e) {
          console.warn("Could not load db profile", e);
        }

        if (isMounted) {
          setIsFreelancer(false);
          setIsInfluencer(false);
          setProfileName(user.user_metadata?.full_name || '');
          setProfilePhone(user.user_metadata?.phone || '');
          setAgeGroup(user.user_metadata?.age_group || '18_plus');
          setNidNumber(user.user_metadata?.nid_number || '');
          setBirthNumber(user.user_metadata?.birth_number || '');
          setWebsiteUrl(user.user_metadata?.website_url || '');
          setSocialFb(user.user_metadata?.social_fb || '');
          setSocialInsta(user.user_metadata?.social_insta || '');
          setSocialLi(user.user_metadata?.social_li || '');
          setSocialYt(user.user_metadata?.social_yt || '');
        }
      };
      fetchUserProfile();
      
      // Fetch user's existing devices from the database
      supabase.from('payment_numbers').select('*, brands(name)').eq('user_id', user.id).then(({ data }) => {
        if (data && isMounted) {
          setGatewayNumbers(data);
        }
      });
      // 1. Fetch devices and auto-sync any existing devices from device_status into sms_forwarder_settings
      Promise.all([
        supabase.from('sms_forwarder_settings').select('*').eq('user_id', user.id),
        supabase.from('device_status').select('*').eq('user_id', user.id)
      ]).then(async ([{ data: fData }, { data: dData }]) => {
        if (!isMounted) return;

        const forwarderDevices = new Set((fData || []).map(d => d.device_name).filter(d => Boolean(d) && d !== '__GLOBAL_CONFIG__'));
        const statusDevices = Array.from(new Set((dData || []).map(d => d.device_id).filter(d => d && d !== 'android-app-1' && d !== 'default-device')));
        
        // Find __GLOBAL_CONFIG__ to use for missing devices
        const globalConfigRow = (fData || []).find(d => d.device_name === '__GLOBAL_CONFIG__');

        // Check if there are any devices in device_status not yet saved in sms_forwarder_settings
        const missingInForwarder = statusDevices.filter(d => !forwarderDevices.has(d));
        if (missingInForwarder.length > 0 && globalConfigRow) {
          for (const dev of missingInForwarder) {
            const hostUrl = globalConfigRow.project_url || '';
            const anonKey = globalConfigRow.anon_key || '';
            const channel = globalConfigRow.ws_channel || '';
            const webEdgeUrl = globalConfigRow.webhook_edge_url || '';
            const userBrandId = brands[0]?.id ? String(brands[0].id) : 'default';
            const genWebhookUrl = `${webEdgeUrl}?user_id=${user.id}&brand_id=${userBrandId}`;
            const genWsUrl = `wss://${hostUrl}/realtime/v1/websocket?apikey=${anonKey}&vsn=1.0.0&channel=${channel}&user_id=${user.id}&brand_id=${userBrandId}&secret=${hmacSecret || ''}&device_id=${encodeURIComponent(dev)}`;

            await supabase.from('sms_forwarder_settings').upsert({
              user_id: user.id,
              device_name: dev,
              brand_id: userBrandId,
              country: globalConfigRow.country || 'Bangladesh',
              hmac_secret: hmacSecret || '',
              sender_number: globalConfigRow.sender_number,
              text_filter: globalConfigRow.text_filter,
              webhook_edge_url: webEdgeUrl,
              headers: globalConfigRow.headers,
              json_payload_template: globalConfigRow.json_payload_template,
              project_url: hostUrl,
              anon_key: anonKey,
              ws_channel: channel,
              dashboard_url: globalConfigRow.dashboard_url || 'https://mecopay.pages.dev/dashboard',
              webhook_url: genWebhookUrl,
              heartbeat_ws_url: genWsUrl,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,device_name' });
          }
        }

        const allDevices = Array.from(new Set([...forwarderDevices, ...statusDevices]));
        setCustomDevices(allDevices);
        if (dData) {
          const activeStatuses = dData.filter(d => d && d.device_id !== 'android-app-1' && d.device_id !== 'default-device');
          setDeviceStatuses(activeStatuses);
        }
      });

      // 1. Fetch global settings from API first (guaranteed live sync)
      fetch('/api/system-settings')
        .then(res => res.json())
        .then(cfg => {
          if (cfg && isMounted) {
            setForwarderSettings(prev => ({
              ...prev,
              sender_number: cfg.sender_number || prev.sender_number,
              text_filter: cfg.text_filter || prev.text_filter,
              webhook_edge_url: cfg.webhook_edge_url || prev.webhook_edge_url,
              headers: cfg.headers || prev.headers,
              json_payload_template: cfg.json_payload_template || prev.json_payload_template,
              project_url: cfg.project_url || prev.project_url,
              anon_key: cfg.anon_key || prev.anon_key,
              ws_channel: cfg.ws_channel || prev.ws_channel,
              heartbeat_edge_url: cfg.heartbeat_edge_url || prev.heartbeat_edge_url,
              dashboard_url: cfg.dashboard_url || prev.dashboard_url
            }));
          }
        })
        .catch(e => console.warn('Could not fetch /api/system-settings', e));

      // 2. Also fetch global SMS Forwarder Settings from Supabase if table is ready
      supabase.from('sms_forwarder_settings').select('*').eq('device_name', '__GLOBAL_CONFIG__').order('updated_at', { ascending: false }).limit(1).maybeSingle().then(({ data, error }) => {
        if (data && isMounted) {
          setForwarderSettings(prev => ({
            ...prev,
            sender_number: data.sender_number || prev.sender_number,
            text_filter: data.text_filter || prev.text_filter,
            webhook_edge_url: data.webhook_edge_url || prev.webhook_edge_url,
            headers: data.headers || prev.headers,
            json_payload_template: data.json_payload_template || prev.json_payload_template,
            project_url: data.project_url || prev.project_url,
            anon_key: data.anon_key || prev.anon_key,
            ws_channel: data.ws_channel || prev.ws_channel,
            heartbeat_edge_url: data.heartbeat_edge_url || prev.heartbeat_edge_url,
            dashboard_url: data.dashboard_url || prev.dashboard_url
          }));
        }
      });
      
      // Only lock identity inputs if the admin has explicitly verified the account
      // Unverified or pending users can freely edit their profile and take photos
      const isVerified = verificationStatus === 'verified';
      setIsIdentityLocked(isVerified);
      
    });
    
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Role approval can happen in a separate admin session while this dashboard stays open.
  // Re-read only the user's role flags on focus/visibility and while the page is active so
  // the Freelancer/Influencer tabs appear without requiring a sign-out or hard reload.
  useEffect(() => {
    const profileId = user?.id;
    if (!profileId) return;
    let isActive = true;
    let warned = false;
    const refreshWorkspaceRoles = async () => {
      if (document.visibilityState === 'hidden') return;
      const { data, error } = await supabase
        .from('profiles')
        .select('is_freelancer,is_influencer')
        .eq('id', profileId)
        .maybeSingle();
      if (!isActive) return;
      if (error) {
        if (!warned) console.warn('Could not refresh workspace role flags:', error.message);
        warned = true;
        return;
      }
      if (data) {
        setIsFreelancer(data.is_freelancer === true);
        setIsInfluencer(data.is_influencer === true);
      }
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') void refreshWorkspaceRoles();
    };
    void refreshWorkspaceRoles();
    window.addEventListener('focus', refreshWorkspaceRoles);
    document.addEventListener('visibilitychange', onVisibilityChange);
    const timer = window.setInterval(() => void refreshWorkspaceRoles(), 15000);
    return () => {
      isActive = false;
      window.clearInterval(timer);
      window.removeEventListener('focus', refreshWorkspaceRoles);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [user?.id]);

  
  const handleRegenerateHmac = () => {
    setShowRegenerateModal(true);
    setRegenerateInput('');
  };

  const confirmRegenerateHmac = async () => {
    if (regenerateInput !== 'regenerate') return;
    try {
      const newSecret = 'sk_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      const { error } = await supabase.from('profiles').update({ hmac_secret: newSecret }).eq('id', user.id);
      if (error) {
        await supabase.from('profiles').update({ hmac_secret: newSecret }).eq('user_id', user.id);
      }
      setHmacSecret(newSecret);
      showToast("Regenerated successfully!", 'success');
      setShowRegenerateModal(false);
    } catch (err) {
      console.error(err);
      showToast("Failed to regenerate!", 'error');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };



  const menuData = {
    brand: {
      title: 'Your MecoPay',
      items: ['Profile', 'Dashboard', 'Service & Billing', 'Brand', 'Webhook Settings', 'Apps', 'WordPress Plugin', 'Documentation Docs'],
    },
    payments: {
      title: 'Payments Hub',
      items: ['Gateway Settings', 'Payment Links', 'Invoices', 'Tele Sales Access', 'Digital Service', 'Full COD Service', 'Courier Service', 'SMS + WhatsApp Service', 'Transactions', 'Transaction Analysis', 'Analytics'],
    },
    site: {
      title: 'My Site',
      items: [
        'Website Builder',
        'Custom Domain Buy',
        'Integrate Custom Domain',
        'Email Service',
        'Server Side Tracking',
        'Web Custom Agent',
        'Social Custom Agent',
        'Marketplace'
      ],
    },
    ...(isFreelancer && {
      freelancer: {
        title: 'Freelancer Workspace',
        items: ['Freelancer Work'],
      }
    }),
    ...(isInfluencer && {
      influencer: {
        title: 'Influencer Workspace',
        items: ['Influencer Profile'],
      }
    }),
    ...(hasTeleSalesAccess && {
      teleSales: {
        title: 'Tele Sales',
        items: ['Tele Sales Invoices'],
      }
    }),
    ...(isAdmin && {
      admin: {
        title: 'Admin Panel',
        items: ['Overview', 'Users', 'Freelancer Applications', 'Sms Forwarder Settings', 'Headless Orchestrator', 'System Settings', 'Reports']
      }
    })
  };

  // Live Camera Controls
  const startLiveCamera = async (target: 'birth' | 'nid_front' | 'nid_back' | 'face') => {
    setCameraTarget(target);
    const facing: 'user' | 'environment' = target === 'face' ? 'user' : 'environment';
    setCameraFacing(facing);
    setCameraOpen(true);
    setCameraLoading(true);
    setCameraError('');

    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
        setCameraStream(null);
      }

      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("আপনার ব্রাউজারে সরাসরি ওয়েবক্যাম সমর্থন পাওয়া যায়নি");
      }

      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      let stream: MediaStream | null = null;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: isMobile ? { facingMode: { ideal: facing } } : true,
          audio: false
        });
      } catch (err1: any) {
        console.warn("First camera attempt failed:", err1);
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        } catch (err2: any) {
          console.warn("Second camera attempt failed:", err2);
          throw err1;
        }
      }

      if (!stream) throw new Error("ক্যামেরা থেকে ভিডিও সিগন্যাল পাওয়া যায়নি");

      setCameraStream(stream);
      setCameraLoading(false);
      setCameraError('');

      setTimeout(() => {
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.warn("Video play error:", e));
        }
      }, 50);
    } catch (err: any) {
      console.warn("Live WebRTC camera error:", err);
      setCameraLoading(false);
      let msg = "ক্যামেরা চালু করা যায়নি।";
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = "ব্রাউজার ক্যামেরা পারমিশন ব্লক করেছে বা আইফ্রেমে ক্যামেরা অ্যাক্সেস নেই। আপনার ব্রাউজারের উপরে ক্যামেরা 'Allow' করুন অথবা নিচের বিকল্প বাটন ব্যবহার করুন।";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = "কোনো সংযুক্ত ক্যামেরা বা ওয়েবক্যাম পাওয়া যায়নি। অনুগ্রহ করে নিচের বাটন দিয়ে সেলফি তুলুন।";
      } else {
        msg = `ক্যামেরা চালু করা যায়নি (${err.message || 'Error'})। নিচের বাটন দিয়ে সরাসরি সেলফি তুলুন বা ফাইল দিন।`;
      }
      setCameraError(msg);
    }
  };

  const stopLiveCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
    setCameraOpen(false);
    setCameraTarget(null);
  };

  const switchCameraFacing = async () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(nextFacing);
    if (cameraTarget) {
      setCameraLoading(true);
      try {
        if (cameraStream) {
          cameraStream.getTracks().forEach(t => t.stop());
          setCameraStream(null);
        }
        let stream: MediaStream | null = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: nextFacing } },
            audio: false
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }
        setCameraStream(stream);
        setCameraLoading(false);
        setTimeout(() => {
          if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.warn("Video play error:", e));
          }
        }, 100);
      } catch (e) {
        setCameraLoading(false);
        console.warn("Could not switch camera", e);
      }
    }
  };

  const capturePhotoFromCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    let width = video.videoWidth || 1280;
    let height = video.videoHeight || 720;
    const maxDim = 1200;
    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);

    // Compress to WebP (~150-250 KB)
    const dataUrl = canvas.toDataURL('image/webp', 0.82);

    if (cameraTarget === 'birth') setBirthImage(dataUrl);
    else if (cameraTarget === 'nid_front') setNidFrontImage(dataUrl);
    else if (cameraTarget === 'nid_back') setNidBackImage(dataUrl);
    else if (cameraTarget === 'face') setFaceImage(dataUrl);

    stopLiveCamera();
    showToast("ছবি সফলভাবে ক্যাপচার হয়েছে!", "success");
  };

  // Fallback Compressed File Upload
  const handleCompressedImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();
    reader.onload = (event) => {
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/webp', 0.82);
          setter(compressedDataUrl);
          showToast("ছবি অপ্টিমাইজ করে লোড করা হয়েছে", "success");
        }
      };
    };
    reader.readAsDataURL(file);
  };

  // Upload image to Supabase kyc_documents Bucket
  const uploadKycImage = async (dataOrUrl: string, prefix: string): Promise<string> => {
    if (!dataOrUrl) return '';
    // If it's already an uploaded http/https URL, keep it
    if (dataOrUrl.startsWith('http://') || dataOrUrl.startsWith('https://')) {
      return dataOrUrl;
    }
    try {
      const res = await fetch(dataOrUrl);
      const blob = await res.blob();
      const filePath = `${user.id}/${prefix}_${Date.now()}.webp`;

      const { error: uploadError } = await supabase.storage
        .from('kyc_documents')
        .upload(filePath, blob, {
          contentType: 'image/webp',
          upsert: false
        });

      if (uploadError) {
        console.error("Storage upload error for " + prefix, uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('kyc_documents')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (err: any) {
      console.error("Failed to upload KYC image", err);
      throw new Error(`${prefix} ছবি আপলোড করা যায়নি: ${err.message || ''}`);
    }
  };

  const handleResetProfile = async () => {
    if (!isAdmin) return;
    if (!(await showConfirm("Admin Action: Are you sure you want to completely reset your profile data to test again?"))) return;
    
    setIsSavingProfile(true);
    setProfileMessage('');
    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          full_name: '', 
          phone: '',
          identity_type: 'nid',
          identity_number: '',
          face_image: '',
          doc_front_image: '',
          doc_back_image: '',
          website_url: '',
          social_fb: '',
          social_insta: '',
          social_li: '',
          social_yt: ''
        }
      });
      if (error) throw error;

      await supabase.from('profiles').update({
        name: '',
        phone: '',
        nid_number: null,
        nid_front_url: null,
        nid_back_url: null,
        birth_number: null,
        birth_cert_url: null,
        face_image_url: null,
        website_url: null,
        social_fb: null,
        social_insta: null,
        social_li: null,
        social_yt: null,
        verification_status: 'pending',
        rejection_reason: null
      }).eq('id', user.id);
      
      setProfileName('');
      setProfilePhone('');
      setAgeGroup('18_plus');
      setNidNumber('');
      setNidFrontImage('');
      setNidBackImage('');
      setBirthNumber('');
      setBirthImage('');
      setFaceImage('');
      setWebsiteUrl('');
      setSocialFb('');
      setSocialInsta('');
      setSocialLi('');
      setSocialYt('');
      setVerificationStatus('pending');
      setRejectionReason('');
      setIsIdentityLocked(false);
      setIsBirthLocked(false);
      setIsNidLocked(false);
      
      setProfileMessage('Profile has been completely reset for testing.');
      showToast('Profile reset successfully', 'success');
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (err: any) {
      setProfileMessage('Error: ' + err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setProfileMessage('');

    try {
      // 1. Mandatory Text Validation
      if (!profileName.trim()) {
        showToast(profileUiText("অনুগ্রহ করে আপনার পূর্ণ নাম প্রদান করুন", "Please provide your full name"), "error");
        setIsSavingProfile(false);
        return;
      }
      if (!profilePhone.trim()) {
        showToast(profileUiText("অনুগ্রহ করে যোগাযোগের নম্বর প্রদান করুন", "Please provide a contact number"), "error");
        setIsSavingProfile(false);
        return;
      }

      // If already verified, allow updating Website, Social Profiles & Contact anytime without re-uploading documents
      if (verificationStatus === 'verified') {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            name: profileName.trim(),
            phone: profilePhone.trim(),
            website_url: websiteUrl.trim() || null,
            social_fb: socialFb.trim() || null,
            social_insta: socialInsta.trim() || null,
            social_li: socialLi.trim() || null,
            social_yt: socialYt.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (updateError) throw updateError;

        await supabase.auth.updateUser({
          data: {
            full_name: profileName.trim(),
            phone: profilePhone.trim(),
            phone_type: phoneType,
            website_url: websiteUrl.trim() || null,
            social_fb: socialFb.trim() || null,
            social_insta: socialInsta.trim() || null,
            social_li: socialLi.trim() || null,
            social_yt: socialYt.trim() || null
          }
        });

        showToast(profileUiText("ওয়েবসাইট ও সোশ্যাল লিঙ্ক সফলভাবে আপডেট হয়েছে!", "Website and social links updated successfully!"), "success");
        setProfileMessage(profileUiText("আপনার যোগাযোগের নম্বর, ওয়েবসাইট ও সোশ্যাল মিডিয়া লিঙ্ক সফলভাবে সংরক্ষণ করা হয়েছে।", "Your contact number, website, and social media links were saved successfully."));
        setTimeout(() => setProfileMessage(''), 4000);
        setIsSavingProfile(false);
        return;
      }

      // 2. Identity Document Mandatory Validation
      if (ageGroup === '18_plus') {
        if (!nidNumber.trim()) {
          showToast(profileUiText("১৮ বছরের বেশি বয়সীদের ক্ষেত্রে NID নম্বর বাধ্যতামূলক!", "NID number is required for applicants above 18."), "error");
          setIsSavingProfile(false);
          return;
        }
        if (!birthNumber.trim()) {
          showToast(profileUiText("জন্মনিবন্ধন নম্বর প্রদান করুন!", "Please provide the birth certificate number."), "error");
          setIsSavingProfile(false);
          return;
        }
        if (!nidFrontImage || !nidBackImage) {
          showToast(profileUiText("NID কার্ডের সম্মুখভাগ ও পেছনের ভাগের ছবি আবশ্যক!", "Both front and back images of the NID card are required."), "error");
          setIsSavingProfile(false);
          return;
        }
        if (!birthImage) {
          showToast(profileUiText("জন্মনিবন্ধন সনদের ছবি আবশ্যক!", "A birth certificate image is required."), "error");
          setIsSavingProfile(false);
          return;
        }
      } else {
        if (!birthNumber.trim()) {
          showToast(profileUiText("জন্মনিবন্ধন নম্বর প্রদান করা বাধ্যতামূলক!", "Birth certificate number is required."), "error");
          setIsSavingProfile(false);
          return;
        }
        if (!birthImage) {
          showToast(profileUiText("জন্মনিবন্ধন সনদের ছবি আবশ্যক!", "A birth certificate image is required."), "error");
          setIsSavingProfile(false);
          return;
        }
      }

      if (!faceImage) {
        showToast(profileUiText("লাইভ ফেস ফটো সেলফি আবশ্যক!", "A live face selfie is required."), "error");
        setIsSavingProfile(false);
        return;
      }

      // 3. Unique Check: Check if NID already used by another user
      if (nidNumber.trim()) {
        const { data: existingNid } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('nid_number', nidNumber.trim())
          .neq('id', user.id)
          .maybeSingle();

        if (existingNid) {
          showToast(`ত্রুটি: এই NID নম্বরটি (${nidNumber.trim()}) দিয়ে ইতিমধ্যে অন্য একটি অ্যাকাউন্ট ভেরিফাই করা হয়েছে!`, "error");
          setProfileMessage(`ত্রুটি: এই NID নম্বরটি (${nidNumber.trim()}) দিয়ে ইতিমধ্যে অন্য একটি অ্যাকাউন্ট রেজিস্টার্ড রয়েছে!`);
          setIsSavingProfile(false);
          return;
        }
      }

      // 4. Unique Check: Check if Birth Certificate number already used by another user
      if (birthNumber.trim()) {
        const { data: existingBirth } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('birth_number', birthNumber.trim())
          .neq('id', user.id)
          .maybeSingle();

        if (existingBirth) {
          showToast(`ত্রুটি: এই জন্মনিবন্ধন নম্বরটি (${birthNumber.trim()}) দিয়ে ইতিমধ্যে অন্য একটি অ্যাকাউন্ট ভেরিফাই করা হয়েছে!`, "error");
          setProfileMessage(`ত্রুটি: এই জন্মনিবন্ধন নম্বরটি (${birthNumber.trim()}) দিয়ে ইতিমধ্যে অন্য একটি অ্যাকাউন্ট রেজিস্টার্ড রয়েছে!`);
          setIsSavingProfile(false);
          return;
        }
      }

      // 5. Upload Compressed Images to Supabase Storage Bucket 'kyc_documents'
      let upNidFront = nidFrontImage;
      let upNidBack = nidBackImage;
      let upBirth = birthImage;
      let upFace = faceImage;

      if (nidFrontImage && nidFrontImage.startsWith('data:')) {
        upNidFront = await uploadKycImage(nidFrontImage, 'nid_front');
        setNidFrontImage(upNidFront);
      }
      if (nidBackImage && nidBackImage.startsWith('data:')) {
        upNidBack = await uploadKycImage(nidBackImage, 'nid_back');
        setNidBackImage(upNidBack);
      }
      if (birthImage && birthImage.startsWith('data:')) {
        upBirth = await uploadKycImage(birthImage, 'birth_cert');
        setBirthImage(upBirth);
      }
      if (faceImage && faceImage.startsWith('data:')) {
        upFace = await uploadKycImage(faceImage, 'face');
        setFaceImage(upFace);
      }

      // 6. Save directly to public.profiles table
      const statusToSave = 'pending';
      const { error: profError } = await supabase
        .from('profiles')
        .update({
          name: profileName.trim(),
          phone: profilePhone.trim(),
          age_group: ageGroup,
          nid_number: nidNumber.trim() || null,
          nid_front_url: upNidFront || null,
          nid_back_url: upNidBack || null,
          birth_number: birthNumber.trim() || null,
          birth_cert_url: upBirth || null,
          face_image_url: upFace || null,
          website_url: websiteUrl.trim() || null,
          social_fb: socialFb.trim() || null,
          social_insta: socialInsta.trim() || null,
          social_li: socialLi.trim() || null,
          social_yt: socialYt.trim() || null,
          verification_status: statusToSave,
          rejection_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profError) {
        console.error("Profiles table update error:", profError);
        if (profError.message?.includes('duplicate key') || profError.code === '23505' || profError.message?.includes('unique constraint') || (profError as any).details?.includes('already exists')) {
          if (profError.message?.includes('nid_number') || (profError as any).details?.includes('nid_number')) {
            throw new Error(`এই NID নম্বরটি (${nidNumber.trim()}) দিয়ে ইতিমধ্যে অন্য একজন ক্লায়েন্টের অ্যাকাউন্ট ভেরিফাই করা হয়েছে!`);
          }
          if (profError.message?.includes('birth_number') || (profError as any).details?.includes('birth_number')) {
            throw new Error(`এই জন্মনিবন্ধন নম্বরটি (${birthNumber.trim()}) দিয়ে ইতিমধ্যে অন্য একজন ক্লায়েন্টের অ্যাকাউন্ট ভেরিফাই করা হয়েছে!`);
          }
          throw new Error('এই NID বা জন্মনিবন্ধন নম্বর দিয়ে ইতিমধ্যে অন্য একটি অ্যাকাউন্ট বিদ্যমান রয়েছে!');
        }
        throw profError;
      }

      // 7. Sync with Supabase Auth Metadata
      await supabase.auth.updateUser({
        data: { 
          full_name: profileName, 
          phone: profilePhone,
          phone_type: phoneType,
          age_group: ageGroup,
          nid_number: nidNumber,
          birth_number: birthNumber,
          website_url: websiteUrl,
          social_fb: socialFb,
          social_insta: socialInsta,
          social_li: socialLi,
          social_yt: socialYt
        }
      });

      if (birthNumber) setIsBirthLocked(true);
      if (nidNumber) setIsNidLocked(true);
      setVerificationStatus('pending');
      setIsIdentityLocked(false);
      
      showToast(profileUiText('প্রোফাইল ও পরিচয়পত্র সফলভাবে সাবমিট হয়েছে!', 'Profile and identity documents submitted successfully!'), 'success');
      setProfileMessage(profileUiText('প্রোফাইল ও পরিচয়পত্র সফলভাবে জমা হয়েছে। অ্যাডমিন রিভিউয়ের পর ভেরিফাই হবে।', 'Profile and identity documents submitted successfully. Verification will follow admin review.'));
      setTimeout(() => setProfileMessage(''), 4000);

      // Instantly unlock and navigate to Dashboard in Your MecoPay
      setActiveTab('brand');
      setActiveSubMenu('Dashboard');
    } catch (err: any) {
      console.error(err);
      showToast('Error: ' + err.message, 'error');
      setProfileMessage('Error: ' + err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Admin KYC Actions
  const handleAdminApproveKyc = async (userId: string) => {
    setIsUpdatingKyc(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          verification_status: 'verified',
          rejection_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      showToast("ইউজার ভেরিফিকেশন সফলভাবে অনুমোদন (Approved) করা হয়েছে!", "success");
      setMockAdminUsers(prev => prev.map(u => u.id === userId ? { ...u, verification: 'Verified', verification_status: 'verified', rejection_reason: null } : u));
      if (user?.id === userId) {
        setVerificationStatus('verified');
      }
      setKycModalUser(null);
    } catch (err: any) {
      showToast("Error approving KYC: " + (err.message || ''), "error");
    } finally {
      setIsUpdatingKyc(false);
    }
  };

  const handleAdminRejectKyc = async (userId: string, reason: string) => {
    if (!reason.trim()) {
      showToast("প্রত্যাখ্যানের কারণ উল্লেখ করুন", "error");
      return;
    }
    setIsUpdatingKyc(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          verification_status: 'rejected',
          rejection_reason: reason.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      showToast("ভেরিফিকেশন প্রত্যাখ্যাত হয়েছে।", "success");
      setMockAdminUsers(prev => prev.map(u => u.id === userId ? { ...u, verification: 'Rejected', verification_status: 'rejected', rejection_reason: reason.trim() } : u));
      if (user?.id === userId) {
        setVerificationStatus('rejected');
        setRejectionReason(reason.trim());
      }
      setKycModalUser(null);
      setShowRejectInputBox(false);
      setAdminRejectInput('');
    } catch (err: any) {
      showToast("Error rejecting KYC: " + (err.message || ''), "error");
    } finally {
      setIsUpdatingKyc(false);
    }
  };

  

  const renderContent = () => {
    if (activeSubMenu === 'Brand') {
      return (
        <div className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-bold text-white tracking-tight">My Brands</h2>

            </div>
            <button 
              onClick={handleOpenCreateBrand}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Add New Brand
            </button>
          </div>

          <div className="bg-[#1a2234] border border-slate-700/50 rounded-xl shadow-lg">
            <div className="overflow-x-auto min-h-[250px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#242d42] border-b border-slate-700/50">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-300">#</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-300">Brand Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-300">Brand Key/API Key (For Website)</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-300">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-300 text-right pr-8">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {brands.map((brand, index) => (
                    <tr key={brand.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-400">{index + 1}</td>
                      <td className="px-6 py-4 text-sm font-bold text-white">
                        <div className="flex items-center gap-3">
                          {brand.logo_url ? (
                            <img src={brand.logo_url} alt={brand.name} className="w-8 h-8 object-cover rounded bg-slate-800 border border-slate-700" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-400 font-bold">
                              {brand.name ? brand.name.charAt(0).toUpperCase() : 'B'}
                            </div>
                          )}
                          <span>{brand.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                          <span className="font-mono tracking-widest text-slate-400">***************</span>
                          <button 
                            onClick={async () => {
                              if (brand.api_key) {
                                try {
                                  if (navigator.clipboard && window.isSecureContext) {
                                    await navigator.clipboard.writeText(brand.api_key);
                                    showToast("Copied!", "success");
                                  } else {
                                    // Fallback for iframe / non-secure contexts
                                    const textArea = document.createElement("textarea");
                                    textArea.value = brand.api_key;
                                    textArea.style.position = "fixed";
                                    textArea.style.left = "-999999px";
                                    textArea.style.top = "-999999px";
                                    document.body.appendChild(textArea);
                                    textArea.focus();
                                    textArea.select();
                                    document.execCommand('copy');
                                    textArea.remove();
                                    showToast("Copied!", "success");
                                  }
                                } catch (err) {
                                  showToast("Failed to copy!", "error");
                                  console.error(err);
                                }
                              } else {
                                showToast("Not found!", "error");
                              }
                            }}
                            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-800"
                            title="Copy API Key"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/20">
                          {brand.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right pr-6 relative">
                        <button 
                          onClick={() => setActiveBrandDropdown(activeBrandDropdown === brand.id ? null : brand.id)}
                          className="p-2 text-slate-400 hover:text-white transition-colors focus:outline-none"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {/* Dropdown */}
                        {activeBrandDropdown === brand.id && (
                          <div className="absolute right-12 top-10 w-48 bg-[#1e293b] border border-slate-700 rounded-lg shadow-xl py-2 z-50">
                            <button onClick={() => handleOpenEditBrand(brand)} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition-colors">
                              <Edit className="w-4 h-4" /> Edit Brand Settings
                            </button>
                            
                            <button onClick={() => handleDeleteBrand(brand.id)} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 flex items-center gap-2 transition-colors">
                              <Trash2 className="w-4 h-4" /> Delete Brand
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (activeSubMenu === 'Profile') {
      return (
        <div className="max-w-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Profile & Identity Verification</h2>
              <p className="text-xs text-slate-400 mt-1">{profileCopy.subtitle}</p>
            </div>
            <div>
              {verificationStatus === 'verified' ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified Merchant
                </div>
              ) : verificationStatus === 'pending' ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs animate-pulse">
                  <Clock className="w-4 h-4 text-amber-400" /> Verification Under Review
                </div>
              ) : verificationStatus === 'rejected' ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 text-red-400" /> Verification Rejected
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 text-amber-400" /> Unverified Merchant
                </div>
              )}
            </div>
          </div>

          {/* Rejection Alert Banner */}
          {verificationStatus === 'rejected' && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-xs shadow-lg">
              <div className="flex items-center gap-2 font-bold text-red-400 text-sm mb-1.5">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" /> {profileCopy.rejectedTitle}
              </div>
              <p className="text-slate-300 leading-relaxed">
                {profileCopy.adminNote} <strong className="text-red-200">{rejectionReason || profileCopy.rejectedReason}</strong>
              </p>
            </div>
          )}

          {/* Pending Alert Banner */}
          {verificationStatus === 'pending' && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs flex items-start gap-3 shadow-lg">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-400 text-sm">{profileCopy.pendingTitle}</p>
                <p className="mt-1 text-slate-300 leading-relaxed">
                  {profileCopy.pendingBody} <strong>{profileCopy.pendingStrong}</strong> {profileCopy.pendingTail}
                </p>
              </div>
            </div>
          )}

          {/* Unverified / Action Required Banner */}
          {verificationStatus === 'unverified' && (
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-blue-200 text-xs flex items-start gap-3 shadow-lg">
              <ShieldAlert className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-400 text-sm">{profileCopy.unlockTitle}</p>
                <p className="mt-1 text-slate-300 leading-relaxed">
                  {profileCopy.unlockBody}
                </p>
              </div>
            </div>
          )}

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-3">
                <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-emerald-500/50 flex items-center justify-center overflow-hidden shadow-inner">
                  {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-slate-400">{(profileName || user?.email || 'U').charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>
              
              <p className="text-sm font-medium text-slate-400 mb-1">{user?.email}</p>
              <LocaleSwitcher variant="dark" className="mt-3 w-full max-w-xl justify-center" />
              <div className="mt-1">
                {verificationStatus === 'verified' ? (
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> {profileCopy.verifiedMerchant}
                  </span>
                ) : verificationStatus === 'pending' ? (
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> {profileCopy.underReview}
                  </span>
                ) : verificationStatus === 'rejected' ? (
                  <span className="text-[11px] font-bold text-red-400 flex items-center gap-1.5 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> {profileCopy.rejected}
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> {profileCopy.unverified}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-5">
              {profileMessage && (
                <div className={`p-3 rounded-lg text-sm text-center ${profileMessage.includes('Error') || profileMessage.includes(profileCopy.errorPrefix) ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                  {profileMessage}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Email Address (Read-Only)</label>
                <input type="email" value={user?.email || ''} readOnly className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-500 cursor-not-allowed focus:outline-none transition-colors" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Full Name <span className="text-red-400">*</span></label>
                  <input type="text" placeholder={profileCopy.fullNamePlaceholder} value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-slate-300">
                      {profileCopy.contactNumber} <span className="text-red-400">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">{profileCopy.chooseContact}</span>
                  </div>

                  {/* WhatsApp / Telegram Selector with checkmark ticks */}
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setPhoneType('whatsapp')}
                      className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        phoneType === 'whatsapp'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm ring-1 ring-emerald-500/30'
                          : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-emerald-400">💬</span> WhatsApp
                      {phoneType === 'whatsapp' && <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPhoneType('telegram')}
                      className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        phoneType === 'telegram'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500 shadow-sm ring-1 ring-blue-500/30'
                          : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-blue-400">✈️</span> Telegram
                      {phoneType === 'telegram' && <Check className="w-3.5 h-3.5 text-blue-400 stroke-[3]" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPhoneType('both')}
                      className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        phoneType === 'both'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500 shadow-sm ring-1 ring-purple-500/30'
                          : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-purple-400">⚡</span> {profileCopy.both}
                      {phoneType === 'both' && <Check className="w-3.5 h-3.5 text-purple-400 stroke-[3]" />}
                    </button>
                  </div>

                  <input
                    type="tel"
                    placeholder={
                      phoneType === 'whatsapp'
                        ? profileCopy.whatsappPlaceholder
                        : phoneType === 'telegram'
                        ? profileCopy.telegramPlaceholder
                        : profileCopy.phonePlaceholder
                    }
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    {profileCopy.contactNote}
                  </p>
                </div>
              </div>

              {/* Identity Verification */}
              <div className="pt-6 border-t border-slate-800/50 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> {profileCopy.identityVerification}</h3>
                </div>
                <div className="bg-slate-900 border-y sm:border sm:border-slate-800 sm:rounded-xl p-3 sm:p-6 mb-6 -mx-4 sm:mx-0">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 sm:p-4 mb-6">
                    <div className="flex gap-2 sm:gap-3">
                      <ShieldAlert className="w-4 sm:w-5 h-4 sm:h-5 text-red-500 shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-sm text-red-200">
                        <p className="font-bold text-red-400 mb-2">{profileCopy.criticalWarning}</p>
                        <ul className="list-disc pl-3 sm:pl-4 space-y-1.5">
                          <li><strong>{profileCopy.rules[0]}</strong></li>
                          <li>{profileCopy.rules[1]}</li>
                          <li>{profileCopy.rules[2]}</li>
                          <li className="text-red-400 font-bold">{profileCopy.rules[3]}</li>
                          <li className="text-amber-300 font-semibold">{profileCopy.rules[4]}</li>
                          <li className="text-red-400 font-bold">{profileCopy.rules[5]}</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-4 sm:space-y-0 mb-6">
                    <label className={`flex items-center space-x-2 ${isIdentityLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} text-slate-300 font-bold bg-slate-950 px-4 py-3 rounded-lg border ${ageGroup === '18_plus' ? 'border-emerald-500' : 'border-slate-800'}`}>
                      <input type="radio" value="18_plus" checked={ageGroup === '18_plus'} onChange={(e) => setAgeGroup('18_plus')} disabled={isIdentityLocked} className="accent-emerald-500 w-4 h-4" />
                      <span>{profileCopy.age18}</span>
                    </label>
                    <label className={`flex items-center space-x-2 ${isIdentityLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} text-slate-300 font-bold bg-slate-950 px-4 py-3 rounded-lg border ${ageGroup === 'under_18' ? 'border-emerald-500' : 'border-slate-800'}`}>
                      <input type="radio" value="under_18" checked={ageGroup === 'under_18'} onChange={(e) => setAgeGroup('under_18')} disabled={isIdentityLocked} className="accent-emerald-500 w-4 h-4" />
                      <span>{profileCopy.under18}</span>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6 mb-6">
                    {/* Birth Certificate Section */}
                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                      <div>
                        <h4 className="text-white font-medium mb-3 flex items-center gap-2 text-sm border-b border-slate-800 pb-2">
                          <FileText className="w-4 h-4 text-emerald-500" />
                          {profileCopy.birthCertificate} <span className="text-red-400 text-xs ml-auto">*Mandatory</span>
                        </h4>
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-slate-400 mb-1">{profileCopy.birthNumber}</label>
                          <input type="text" placeholder={profileCopy.birthPlaceholder} value={birthNumber} onChange={(e) => setBirthNumber(e.target.value)} disabled={isBirthLocked} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Certificate Photo</label>
                        <div className="border border-slate-800 rounded-xl p-3 bg-slate-900/40 text-center">
                          {birthImage ? (
                            <div className="relative mb-2 mx-auto w-full max-w-xs aspect-[4/3] rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
                              <img src={birthImage} alt="Birth Certificate" className="w-full h-full object-contain p-2" />
                              <button
                                type="button"
                                onClick={() => setPreviewZoomImage(birthImage)}
                                className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1.5 rounded-lg text-xs"
                                title={profileCopy.zoom}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="mx-auto w-full max-w-xs aspect-[4/3] rounded-lg border-2 border-dashed border-slate-800 flex flex-col items-center justify-center p-4 mb-2 text-slate-500">
                              <Upload className="w-6 h-6 text-slate-600 mb-1" />
                              <span className="text-xs">{profileCopy.notUploaded}</span>
                            </div>
                          )}

                          <div className="flex flex-col gap-2">
                            {!isBirthLocked && (
                              <label className="w-full flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors">
                                <Upload className="w-3.5 h-3.5 text-blue-400" />
                                <span>{profileCopy.uploadGallery}</span>
                                <input type="file" accept="image/*" onChange={(e) => handleCompressedImageUpload(e, setBirthImage)} className="hidden" />
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* NID Section */}
                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                      <div>
                        <h4 className="text-white font-medium mb-3 flex items-start gap-2 border-b border-slate-800 pb-2">
                          <CreditCard className="w-4 h-4 text-blue-500 mt-0.5" />
                          <span className="text-sm">{profileCopy.nidCard}</span>
                          <span className={`text-xs ml-auto ${ageGroup === '18_plus' ? 'text-red-400' : 'text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded'}`}>
                            {ageGroup === '18_plus' ? '*Mandatory' : 'Optional for Under 18'}
                          </span>
                        </h4>
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-slate-400 mb-1">{profileCopy.nidNumber}</label>
                          <input type="text" placeholder={profileCopy.nidPlaceholder} value={nidNumber} onChange={(e) => setNidNumber(e.target.value)} disabled={isNidLocked} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Front Side */}
                        <div className="border border-slate-800 rounded-xl p-4 sm:p-5 bg-slate-900/40 text-center">
                          <span className="text-xs font-medium text-slate-400 block mb-1">{profileCopy.front}</span>
                          {nidFrontImage ? (
                            <div className="relative mb-3 aspect-[1.586/1] min-h-[190px] rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
                              <img src={nidFrontImage} alt="NID Front" className="w-full h-full object-contain p-1" />
                              <button
                                type="button"
                                onClick={() => setPreviewZoomImage(nidFrontImage)}
                                className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-black text-white p-1 rounded text-xs"
                                title={profileCopy.zoom}
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="aspect-[1.586/1] min-h-[190px] rounded-lg border-2 border-dashed border-slate-800 flex items-center justify-center mb-3 text-slate-600 text-sm">
                              Front Side
                            </div>
                          )}

                          <div className="flex flex-col gap-1.5">
                            {!isNidLocked && (
                              <label className="w-full flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2.5 rounded-lg text-xs font-medium cursor-pointer transition-colors">
                                <Upload className="w-4 h-4 text-blue-400" />
                                <span>{profileCopy.uploadDevice}</span>
                                <input type="file" accept="image/*" onChange={(e) => handleCompressedImageUpload(e, setNidFrontImage)} className="hidden" />
                              </label>
                            )}
                          </div>
                        </div>

                        {/* Back Side */}
                        <div className="border border-slate-800 rounded-xl p-4 sm:p-5 bg-slate-900/40 text-center">
                          <span className="text-xs font-medium text-slate-400 block mb-1">{profileCopy.back}</span>
                          {nidBackImage ? (
                            <div className="relative mb-3 aspect-[1.586/1] min-h-[190px] rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
                              <img src={nidBackImage} alt="NID Back" className="w-full h-full object-contain p-1" />
                              <button
                                type="button"
                                onClick={() => setPreviewZoomImage(nidBackImage)}
                                className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-black text-white p-1 rounded text-xs"
                                title={profileCopy.zoom}
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="aspect-[1.586/1] min-h-[190px] rounded-lg border-2 border-dashed border-slate-800 flex items-center justify-center mb-3 text-slate-600 text-sm">
                              Back Side
                            </div>
                          )}

                          <div className="flex flex-col gap-1.5">
                            {!isNidLocked && (
                              <label className="w-full flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2.5 rounded-lg text-xs font-medium cursor-pointer transition-colors">
                                <Upload className="w-4 h-4 text-blue-400" />
                                <span>{profileCopy.uploadDevice}</span>
                                <input type="file" accept="image/*" onChange={(e) => handleCompressedImageUpload(e, setNidBackImage)} className="hidden" />
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Face Image Card (LIVE CAMERA ONLY) */}
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                      <span>{profileCopy.liveSelfie}</span>
                      <span className="text-red-400 text-xs">*Mandatory</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">{profileCopy.liveCameraOnly}</span>
                    </label>
                    <p className="text-xs text-slate-500 mb-3">{profileCopy.selfieInstruction}</p>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="w-36 aspect-[3/4] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative flex items-center justify-center shadow-md">
                        {faceImage ? (
                          <>
                            <img src={faceImage} alt="Face" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setPreviewZoomImage(faceImage)}
                              className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1.5 rounded-lg text-xs"
                              title={profileCopy.zoom}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <div className="text-center p-3 text-slate-600">
                            <Camera className="w-8 h-8 mx-auto mb-1 text-slate-700" />
                            <span className="text-[11px]">{profileCopy.noSelfie}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-3 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => startLiveCamera('face')}
                          disabled={isIdentityLocked}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all active:scale-95 disabled:opacity-50"
                        >
                          <Camera className="w-4 h-4" /> {faceImage ? profileCopy.retakeSelfie : profileCopy.takeSelfie}
                        </button>
                        <p className="text-[11px] text-amber-300 font-medium">{profileCopy.selfieWarning}</p>
                        <p className="text-[11px] text-slate-400">{profileCopy.selfieTip}</p>
                      </div>
                    </div>
                  </div>

                  {/* Hidden Native Hardware Camera Shutter (Direct camera only, no gallery) */}
                  <input
                    ref={liveCameraInputRef}
                    type="file"
                    accept="image/*"
                    capture={cameraFacing}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file || !cameraTarget) return;

                      const img = new Image();
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        img.src = event.target?.result as string;
                        img.onload = () => {
                          const canvas = document.createElement('canvas');
                          let width = img.width;
                          let height = img.height;
                          const maxDim = 1200;
                          if (width > maxDim || height > maxDim) {
                            if (width > height) {
                              height = Math.round((height * maxDim) / width);
                              width = maxDim;
                            } else {
                              width = Math.round((width * maxDim) / height);
                              height = maxDim;
                            }
                          }
                          canvas.width = width;
                          canvas.height = height;
                          const ctx = canvas.getContext('2d');
                          if (ctx) {
                            ctx.drawImage(img, 0, 0, width, height);
                            const compressedDataUrl = canvas.toDataURL('image/webp', 0.82);
                            if (cameraTarget === 'birth') setBirthImage(compressedDataUrl);
                            else if (cameraTarget === 'nid_front') setNidFrontImage(compressedDataUrl);
                            else if (cameraTarget === 'nid_back') setNidBackImage(compressedDataUrl);
                            else if (cameraTarget === 'face') setFaceImage(compressedDataUrl);

                            showToast(profileCopy.cameraSuccess, "success");
                          }
                        };
                      };
                      reader.readAsDataURL(file);
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                </div>
              </div>{/* Web & Social Profiles */}
              
              <div className="pt-6 border-t border-slate-800/50 mt-6 space-y-4">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-emerald-500" /> Web & Social Profiles</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Website Domain / Subdomain</label>
                  <input type="url" placeholder="https://yourwebsite.com" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors" />
                  <p className="text-xs text-slate-500 mt-1">Provide your custom domain, subdomain, or MecoPay platform link.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Facebook Page</label>
                    <input type="url" placeholder="https://facebook.com/..." value={socialFb} onChange={(e) => setSocialFb(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Instagram</label>
                    <input type="url" placeholder="https://instagram.com/..." value={socialInsta} onChange={(e) => setSocialInsta(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">LinkedIn</label>
                    <input type="url" placeholder="https://linkedin.com/in/..." value={socialLi} onChange={(e) => setSocialLi(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">YouTube Channel</label>
                    <input type="url" placeholder="https://youtube.com/..." value={socialYt} onChange={(e) => setSocialYt(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors" />
                  </div>
                </div>
              </div>
              
              <div className="pt-6 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-lg text-sm font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSavingProfile ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{profileCopy.saveUpdating}</span>
                    </>
                  ) : verificationStatus === 'verified' ? (
                    <span>{profileCopy.updateLinks}</span>
                  ) : (
                    <span>Save & Submit For Verification</span>
                  )}
                </button>
                {isAdmin && (
                  <button 
                    onClick={handleResetProfile}
                    disabled={isSavingProfile}
                    className="sm:w-auto bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/30 px-6 py-3 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    Reset Profile (Test Mode)
                  </button>
                )}
              </div>

              <MfaSettings />
            </div>
          </div>
          {verificationStatus === 'verified' && user?.id && (
            <FreelancerApplicationSection userId={user.id} />
          )}
        </div>
      );
    }

    if (activeSubMenu === 'Service & Billing') {
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

      return (
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Service & Billing</h2>
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-8 max-w-2xl">
            
            {/* Wallet Section */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-white mb-4">Wallet Balance</h3>
              <div className="bg-slate-950 rounded-xl border border-emerald-900/30 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Available Funds</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-white">৳০.০০</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 max-w-sm">
                      Funds are automatically deducted for your monthly volume fees and plan renewals. Add funds to prevent service interruption.
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-full md:w-auto">
                    {showAddFund ? (
                      <div className="flex gap-2">
                        <input type="number" placeholder="Amount (৳)" className="w-32 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
                        <button onClick={() => setShowAddFund(false)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm">
                          Pay Now
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setShowAddFund(true)} className="w-full md:w-auto bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm">
                        + Add Fund
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-4">Current Plan</h3>
            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-emerald-900/30 mb-4">
              <div>
                <p className="text-lg font-bold text-white flex items-center gap-2">
                  Free Trial <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-md">Active</span>
                </p>
                <p className="text-sm text-slate-400 mt-1">Expires in 2 days</p>
              </div>
              <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors">
                Manage
              </button>
            </div>

            <h3 className="text-lg font-bold text-white mb-4 mt-6">Monthly Volume & Fees</h3>
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <span className="text-slate-400 text-sm">Monthly Volume Processed</span>
                <span className="text-white font-bold text-lg">৳০.০০</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <span className="text-slate-400 text-sm">Volume Fee (Percentage based)</span>
                <span className="text-white font-medium">৳০.০০</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <span className="text-slate-400 text-sm">Plan Renewal Fee</span>
                <span className="text-white font-medium">৳০.০০</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-white font-bold">Total Next Bill</span>
                <span className="text-emerald-400 font-bold text-xl">৳০.০০</span>
              </div>
            </div>
          </div>

          
          <div className="flex flex-col items-center justify-center gap-6 mb-10 mt-4">
            <div className="w-full text-left">
              <p className="text-xs uppercase tracking-wider text-blue-400 font-bold">Flexible service selection</p>
              <h3 className="text-3xl font-black text-white mt-2">Build Your Own Plan</h3>
              <p className="text-slate-400 mt-2 max-w-3xl">Select individual services instead of paying for features you do not need. Each card explains the use case and gives a practical example.</p>
            </div>
            <div className="flex flex-wrap gap-2 mb-3"><button onClick={() => setPricingMode('nocode')} className={`px-4 py-2 rounded-lg text-sm font-bold ${pricingMode === 'nocode' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'}`}>No-Code Website</button><button onClick={() => setPricingMode('custom')} className={`px-4 py-2 rounded-lg text-sm font-bold ${pricingMode === 'custom' ? 'bg-amber-500 text-white' : 'bg-slate-900 text-slate-400'}`}>Custom Website</button></div><div className="flex flex-wrap justify-start items-center gap-2 mb-3"><span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300">{isDetectingContinent ? 'Detecting your country…' : `Showing pricing for ${selectedCountryData?.name || continentLabel}`}</span><select aria-label="Country" value={selectedCountry} onChange={(event) => { setSelectedCountry(event.target.value); }} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200"><option value="">Select country</option>{countries.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}</select><select aria-label="Language" value={language} onChange={(event) => setLanguage(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200">{countryLanguageOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
            <div className="inline-flex items-center p-1.5 bg-slate-900 border border-slate-800 rounded-xl relative w-full max-w-xs">
              <button onClick={() => setIsYearly(false)} className={`relative z-10 w-1/2 py-2 rounded-lg text-sm font-bold ${!isYearly ? 'text-white' : 'text-slate-400 hover:text-white'}`}>Monthly</button>
              <button onClick={() => setIsYearly(true)} className={`relative z-10 w-1/2 py-2 rounded-lg text-sm font-bold ${isYearly ? 'text-white' : 'text-slate-400 hover:text-white'}`}>Yearly</button>
              <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-slate-700 rounded-lg transition-transform ${isYearly ? 'translate-x-[calc(100%-1px)]' : 'translate-x-1'}`}></div>
              <div className="absolute -top-3 -right-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-3 py-1 rounded-full">Save 10%</div>
            </div>
          </div>
          <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
            <div className="grid md:grid-cols-2 gap-4">
              {buildFeatures.map((feature) => {
                const selected = feature.available && selectedFeatureIds.includes(feature.id);
                return <button key={feature.id} disabled={!feature.available} onClick={() => feature.available && setSelectedFeatureIds((current) => selected ? current.filter((id) => id !== feature.id) : [...current, feature.id])} className={`text-left rounded-2xl border p-5 transition-all ${selected ? 'border-indigo-500/70 bg-indigo-500/10 shadow-lg shadow-indigo-950/30' : 'border-slate-800 bg-slate-900/50 hover:border-slate-600'}`}>
                  <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">{(feature as any).icon || <Zap className="w-5 h-5 text-indigo-400" />}</span><span className="font-bold text-white">{feature.name}</span></div><span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${selected ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-600 text-transparent'}`}>✓</span></div>
                  <p className="text-sm text-slate-300 mt-4 leading-relaxed">{getFeatureCopy(feature.id, language)[0]}</p>
                  <p className="text-xs text-slate-500 mt-3 leading-relaxed"><strong className="text-slate-400">Example:</strong> {getFeatureCopy(feature.id, language)[1]}</p>
                  <p className="text-sm text-indigo-300 font-bold mt-4">{feature.available ? (feature.price === 0 ? 'FREE' : `$${feature.price}/mo`) : 'N/A'}</p>
                </button>;
              })}
            </div>
            <aside className="lg:sticky lg:top-28 rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/60 to-slate-900 p-6">
              <p className="text-xs uppercase tracking-wider text-indigo-300 font-bold">Selected services</p>
              <h3 className="text-2xl font-black text-white mt-2">{selectedFeatures.length} services</h3>
              <div className="my-6 flex items-end gap-2"><span className="text-4xl font-black text-white">${planTotal.toLocaleString()}</span><span className="text-sm text-slate-400 mb-1">/{isYearly ? 'year' : 'month'}</span></div>
              <div className="space-y-2 border-y border-slate-800 py-4 mb-6">{selectedFeatures.length ? selectedFeatures.map((feature) => <div key={feature.id} className="flex justify-between gap-3 text-sm"><span className="text-slate-300">{feature.name}</span><span className="text-slate-400">${isYearly ? Math.round(feature.price * 12 * 0.9).toLocaleString() : feature.price}</span></div>) : <p className="text-sm text-slate-500">Select a service to start building your plan.</p>}</div>
              <button className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors">Request this plan</button>
              <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">Illustrative starting prices are shown for planning. Processing or third-party usage charges may be separate where applicable.</p>
            </aside>
          </div>
          </div>
      );
    }
    
    if (activeSubMenu === 'Gateway Settings') {
      return <GatewaySettings brands={brands} isAdmin={isAdmin} />;
    }

    if (activeSubMenu === 'Payment Links') {
      return <PaymentLinks brands={brands} />;
    }

    if (activeSubMenu === 'Invoices') {
      return <Invoices brands={brands} />;
    }

    if (activeSubMenu === 'Tele Sales Access') {
      return <TeleSalesAccessPanel brands={brands} userId={user?.id || ''} />;
    }

    if (activeSubMenu === 'Digital Service') {
      return <DigitalService brands={brands} user={user} />;
    }

    if (activeSubMenu === 'Full COD Service') {
      return <FullCodService brands={brands} user={user} />;
    }

    if (activeSubMenu === 'Courier Service') {
      return <CourierService brands={brands} user={user} />;
    }

    if (activeSubMenu === 'Apps' || activeSubMenu === 'Plugins & Apps') {
      const apkDownloadUrl = "https://github.com/robiulontherise-ux/mecopay.apk/raw/refs/heads/main/app-release.apk";
      const videoGuideUrl = "#"; // Replace with actual URL later
      
      const userId = user?.id || "USER_ID";
      const displayHmac = hmacSecret || "HMAC_SECRET";

      return (
        <div className="max-w-4xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Smartphone className="w-7 h-7 text-emerald-400" />
                MecoPay Sync App (Android)
              </h2>
              <p className="text-sm text-slate-400">অ্যান্ড্রয়েড অ্যাপ ডাউনলোড, লাইভ সিঙ্ক তথ্য এবং ডিভাইস ম্যানেজমেন্ট।</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* App Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Official Android App v2.5
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-400" /> MecoPay Sync App
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  আপনার মোবাইল থেকে পেমেন্ট ভেরিফাই করতে অ্যাপটি ডাউনলোড করুন। নিচের সেটআপ গাইড অনুযায়ী অ্যাপ কনফিগার করুন।
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a href={apkDownloadUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm">
                  <Download className="w-4 h-4" /> Download App (APK)
                </a>
                <a href={videoGuideUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 text-sm">
                  <Video className="w-4 h-4" /> App Setup Guide Video
                </a>
              </div>
            </div>

            {/* Manual Setup Section */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-400" /> 
                  Setup Link & Information (Dynamic App Config)
                </h3>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> App Auto-Sync Active
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    User ID & HMAC Connected
                  </span>
                </div>
              </div>
              
              <div className="text-sm text-slate-300 leading-relaxed bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl space-y-1">
                <p>
                  <strong>স্মার্ট অটো সিঙ্ক:</strong> অ্যাপে আপনার অ্যাকাউন্ট লগইন করলেই এই বক্সগুলোর তথ্য স্বয়ংক্রিয়ভাবে অ্যাপে সেট হয়ে যাবে। ম্যানুয়াল সেটআপের ক্ষেত্রে নিচের তথ্যগুলো কপি করে ব্যবহার করতে পারেন।
                </p>
                <p className="text-xs text-slate-400">
                  অ্যাডমিন প্যানেলে কোনো পরিবর্তন করা হলে আপনার অ্যাপ স্বয়ংক্রিয়ভাবে আপডেট গ্রহণ করবে।
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Sender Number (Box)</label>
                    <span className="text-[11px] text-purple-400 font-medium">Dynamic Live Setting</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between gap-3 group">
                    <div className="text-slate-200 font-mono text-sm break-all">{forwarderSettings.sender_number }</div>
                    <button onClick={() => handleCopy(forwarderSettings.sender_number , "sender")} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors shrink-0 flex items-center gap-1.5">
                      {copiedField === 'sender' ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span className="text-xs text-emerald-400 font-bold">Copied!</span></> : <><Copy className="w-3.5 h-3.5" /><span className="text-xs font-medium">Copy</span></>}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Text Filter (Box)</label>
                    <span className="text-[11px] text-purple-400 font-medium">Regex Pattern</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between gap-3 group">
                    <div className="text-slate-200 font-mono text-sm break-all">{forwarderSettings.text_filter}</div>
                    <button onClick={() => handleCopy(forwarderSettings.text_filter || "", "filter")} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors shrink-0 flex items-center gap-1.5">
                      {copiedField === 'filter' ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span className="text-xs text-emerald-400 font-bold">Copied!</span></> : <><Copy className="w-3.5 h-3.5" /><span className="text-xs font-medium">Copy</span></>}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Webhook URL (Edge Function + User ID)</label>
                    <span className="text-[11px] text-emerald-400 font-mono">Dynamic Live Sync</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between gap-3 group">
                    <div className="text-emerald-400 font-mono text-sm break-all">{`${forwarderSettings.webhook_edge_url }?user_id=${userId}`}</div>
                    <button onClick={() => handleCopy(`${forwarderSettings.webhook_edge_url }?user_id=${userId}`, "webhook")} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors shrink-0 flex items-center gap-1.5">
                      {copiedField === 'webhook' ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span className="text-xs text-emerald-400 font-bold">Copied!</span></> : <><Copy className="w-3.5 h-3.5" /><span className="text-xs font-medium">Copy</span></>}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Headers (Box)</label>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between gap-3 group">
                    <pre className="text-slate-200 font-mono text-sm overflow-x-auto m-0 whitespace-pre-wrap">
                      {forwarderSettings.headers}
                    </pre>
                    <button onClick={() => handleCopy(forwarderSettings.headers || "", "headers")} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors shrink-0 flex items-center gap-1.5">
                      {copiedField === 'headers' ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span className="text-xs text-emerald-400 font-bold">Copied!</span></> : <><Copy className="w-3.5 h-3.5" /><span className="text-xs font-medium">Copy</span></>}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">JSON Payload Template</label>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between gap-3 group">
                    <pre className="text-slate-200 font-mono text-sm overflow-x-auto m-0 whitespace-pre-wrap">
                      {forwarderSettings.json_payload_template || ""}
                    </pre>
                    <button onClick={() => handleCopy(forwarderSettings.json_payload_template || "", "payload")} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors shrink-0 flex items-center gap-1.5">
                      {copiedField === 'payload' ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span className="text-xs text-emerald-400 font-bold">Copied!</span></> : <><Copy className="w-3.5 h-3.5" /><span className="text-xs font-medium">Copy</span></>}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5"><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">HMAC Secret (Box)</label><button onClick={handleRegenerateHmac} className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[10px] font-bold rounded flex items-center gap-1 transition-colors"><RefreshCw className="w-3 h-3" /> Regenerate</button></div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between gap-3 group">
                    <div className="text-purple-400 font-mono text-sm break-all">{displayHmac}</div>
                    <button onClick={() => handleCopy(displayHmac, "hmac")} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors shrink-0 flex items-center gap-1.5">
                      {copiedField === 'hmac' ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span className="text-xs text-emerald-400 font-bold">Copied!</span></> : <><Copy className="w-3.5 h-3.5" /><span className="text-xs font-medium">Copy</span></>}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      WebSocket Realtime URL (Direct Realtime Connection)
                    </label>
                    <span className="text-[11px] text-emerald-400 font-mono">channel={forwarderSettings.ws_channel }</span>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    {customDevices.length === 0 ? (
                      <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 text-center text-slate-400 text-sm">
                        No devices added yet. Enter a phone name below to generate a WebSocket URL and save to database.
                      </div>
                    ) : (
                      customDevices.map((device, idx) => {
                        const hostUrl = forwarderSettings.project_url ;
                        const anonKey = forwarderSettings.anon_key ;
                        const channel = forwarderSettings.ws_channel ;
                        const defaultBrandId = brands[0]?.id ? String(brands[0].id) : 'default';
                        const wsRealtimeUrl = `wss://${hostUrl}/realtime/v1/websocket?apikey=${anonKey}&vsn=1.0.0&channel=${channel}&user_id=${userId}&brand_id=${defaultBrandId}&secret=${displayHmac}&device_id=${encodeURIComponent(device)}`;

                        return (
                          <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-purple-500/30 flex items-center justify-between gap-3 group relative">
                            <div className="overflow-hidden">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-purple-400">Device: {device}</span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300">WebSocket</span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300">Synced to DB</span>
                              </div>
                              <div className="text-emerald-400 font-mono text-xs md:text-sm break-all">{wsRealtimeUrl}</div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleCopy(wsRealtimeUrl, `ws-${idx}`)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors shrink-0 flex items-center gap-1.5">
                                {copiedField === `ws-${idx}` ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span className="text-xs text-emerald-400 font-bold">Copied!</span></> : <><Copy className="w-3.5 h-3.5" /><span className="text-xs font-medium">Copy</span></>}
                              </button>
                              <button onClick={() => handleDeleteDevice(device)} className="px-3 py-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors shrink-0 flex items-center justify-center" title="Delete Device">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 mb-3 space-y-3">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Add New Phone / SMS Device (Max 2 per Brand)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1 font-medium">Device Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Walton Primo, Samsung S23" 
                          value={newDeviceInput}
                          onChange={(e) => setNewDeviceInput(e.target.value)}
                          onKeyDown={async (e) => {
                            if (e.key === "Enter") {
                              await handleAddDevice();
                            }
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1 font-medium">Select Brand</label>
                        <select
                          value={newDeviceBrandId || (brands[0]?.id ? String(brands[0].id) : '')}
                          onChange={(e) => setNewDeviceBrandId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                        >
                          {brands.length > 0 ? (
                            brands.map((b) => (
                              <option key={b.id} value={String(b.id)}>
                                {b.name || `Brand #${b.id}`}
                              </option>
                            ))
                          ) : (
                            <option value="">Default Brand</option>
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1 font-medium">Select Country</label>
                        <select
                          value={newDeviceCountry}
                          onChange={(e) => setNewDeviceCountry(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                        >
                          <optgroup label="Asia">
                            {ASIA_COUNTRIES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Africa">
                            {AFRICA_COUNTRIES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </optgroup>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end pt-1">
                      <button 
                        onClick={handleAddDevice}
                        className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-lg transition-all shadow-md shadow-purple-900/20"
                      >
                        Create Device
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeSubMenu === 'WordPress Plugin') {
      const pluginDownloadUrl = "/mecopay-woocommerce.zip";
      const videoGuideUrl = "#";

      return (
        <div className="max-w-4xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Plug className="w-7 h-7 text-blue-400" />
                WordPress WooCommerce Plugin
              </h2>
              <p className="text-sm text-slate-400">ওয়ার্ডপ্রেস প্লাগইন ডাউনলোড এবং সেটআপ গাইড।</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Plugin Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      WooCommerce v2.7.0 • Invoice/Webhook Ready
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Mixed-Cart Blocker Included
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Plug className="w-5 h-5 text-blue-400" /> MecoPay WooCommerce Plugin
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    আপনার ওয়ার্ডপ্রেস সাইটে পেমেন্ট গেটওয়ে যুক্ত করতে final plugin ZIP ডাউনলোড করুন। এতে invoice_no mapping, চার product webhook handling, digital delivery link এবং বাধ্যতামূলক HMAC signature verification রয়েছে। WooCommerce Payment Settings-এ API Key ও Webhook Signing Secret সেট করুন।
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={() => downloadWordPressPluginZip()}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-md flex items-center gap-2 text-xs sm:text-sm shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Plugin (.zip)
                </button>
              </div>

              {/* Validation Info in Plugin Tab */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> ১. সিঙ্গেল ডিজিটাল কোর্স নিয়ম
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    ডিজিটাল কোর্স ও পাসকোড সুরক্ষার স্বার্থে একবারে ১টির বেশি ডিজিটাল প্রোডাক্ট অর্ডার করা নিষিদ্ধ। ১টির বেশি নিলে প্লাগইন চেকআউটে এরর দেবে।
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-rose-500/40 space-y-2">
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400" /> ২. মিক্সড কার্ট প্রতিরোধ (উভয় একসাথে নিষিদ্ধ)
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    কার্টে ফিজিক্যাল ও ডিজিটাল প্রোডাক্ট একসাথে নিলে প্লাগইন নিজে থেকেই চেকআউট আটকে দিয়ে গ্রাহককে যেকোনো একটি ক্যাটাগরি আলাদা অর্ডার করার নোটিশ দেবে।
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <a href={videoGuideUrl} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 text-sm">
                  <Video className="w-4 h-4" /> Plugin Setup Guide Video
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (['Merchant API', 'Official Merchant API', 'Personal API'].includes(activeSubMenu)) {
       const isMerchantMode = activeSubMenu === 'Merchant API' || activeSubMenu === 'Official Merchant API';
       const filteredBrands = brands.filter(b => isMerchantMode ? b.merchant_api : b.personal_api);

       return (
         <div className="max-w-3xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{activeSubMenu}</h2>
              <p className="text-sm text-slate-400">
                {isMerchantMode 
                  ? 'Official Merchant API keys activated once Gateway credentials are configured.' 
                  : 'Personal SMS API keys for Android forwarding & custom integrations.'}
              </p>
            </div>
            <button 
              onClick={() => { setActiveTab('brand'); setActiveSubMenu('Brand'); }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              Manage Brands
            </button>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
             {filteredBrands.length === 0 ? (
               <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800">
                 <Key className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                 <p className="text-slate-300 font-medium mb-1">No Brands Enabled for {activeSubMenu}</p>
                 <p className="text-xs text-slate-500 mb-4">Go to My Brands setup and select "{isMerchantMode ? 'Official Merchant API' : 'Personal SMS API'}" for your brand.</p>
                 <button 
                   onClick={() => { setActiveTab('brand'); setActiveSubMenu('Brand'); }}
                   className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold border border-slate-700 transition-colors"
                 >
                   Go to My Brands
                 </button>
               </div>
             ) : (
               filteredBrands.map((b) => {
                 const keyPrefix = isMerchantMode ? 'pk_merchant_' : 'pk_personal_';
                 const apiKey = b.api_key || (keyPrefix + (b.id || 'live').slice(0, 12));
                 const isGatewayActive = !isMerchantMode || b.has_gateway;

                 return (
                   <div key={b.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div className="flex items-center gap-3">
                       {b.logo_url ? (
                         <img src={b.logo_url} alt={b.name} className="w-10 h-10 object-cover rounded bg-slate-800 border border-slate-700" />
                       ) : (
                         <div className="w-10 h-10 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-sm text-slate-300 font-bold">
                           {b.name ? b.name.charAt(0).toUpperCase() : 'B'}
                         </div>
                       )}
                       <div>
                         <div className="flex items-center gap-2 flex-wrap">
                           <p className="text-white font-bold text-sm">{b.name}</p>
                           <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${isMerchantMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>
                             {isMerchantMode ? 'Official Direct Merchant' : 'Personal SMS'}
                           </span>
                           {isMerchantMode && (
                             <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${b.has_gateway ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
                               {b.has_gateway ? '✓ Gateway Ready' : '⚠ Gateway Required'}
                             </span>
                           )}
                           {!isMerchantMode && (
                             <div className="flex gap-1.5">
                               {b.verify_trx_id !== false && <span className="text-[10px] bg-slate-800 text-blue-400 px-1.5 py-0.5 rounded border border-slate-700">TrxID (24 Hours Window)</span>}
                               {b.verify_phone && <span className="text-[10px] bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-700">Phone (10 Min Session)</span>}
                             </div>
                           )}
                         </div>
                         <p className="text-xs text-slate-400 mt-1">
                           {isMerchantMode 
                             ? (b.has_gateway ? 'Direct Merchant PGW active for checkout' : 'Please configure gateway credentials in Gateway Settings first') 
                             : `Allowed Domains: ${b.website_url || 'All Domains'}`}
                         </p>
                       </div>
                     </div>

                     <div className="flex items-center gap-2">
                       {isMerchantMode && !b.has_gateway ? (
                         <button 
                           onClick={() => { setActiveTab('payments'); setActiveSubMenu('Gateway Settings'); setSelectedGatewayBrandId(b.id); }}
                           className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-colors"
                         >
                           Setup Gateway
                         </button>
                       ) : (
                         <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 font-mono text-xs text-slate-200">
                           <span className="truncate max-w-[200px]">{apiKey}</span>
                           <button 
                             onClick={() => {
                               navigator.clipboard.writeText(apiKey);
                               showToast("Copied!", "success");
                             }}
                             className="p-1 text-slate-400 hover:text-white transition-colors"
                             title="Copy API Key"
                           >
                             <Copy className="w-3.5 h-3.5" />
                           </button>
                         </div>
                       )}
                     </div>
                   </div>
                 );
               })
             )}
          </div>

                   </div>
       )
    }

    
    if (activeSubMenu === 'Documentation Docs' || activeSubMenu === 'Developer Docs') {
      return <DeveloperDocs />;
    }

    if (activeSubMenu === 'Webhook Settings') {
      return (
        <div className="max-w-4xl space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Webhook Settings</h2>
            <p className="text-sm text-slate-400">Configure endpoints that receive matched payment events from MecoPay.</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Add Webhook Endpoint</h3>
              <p className="text-sm text-slate-400">One endpoint is allowed per brand, and the endpoint domain must match the brand domain.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Brand</label>
                <select 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none appearance-none"
                  value={webhookForm.brand_id}
                  onChange={(e) => {
                    const selectedBrandId = e.target.value;
                    const selectedBrand = brands.find(b => String(b.id) === String(selectedBrandId));
                    setWebhookForm({ 
                      ...webhookForm, 
                      brand_id: selectedBrandId,
                      webhook_secret: selectedBrand?.webhook_secret || ''
                    });
                  }}
                >
                  <option value="">Select a brand</option>
                  {brands.map((b, idx) => (
                    <option key={idx} value={b.id || idx}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Payload URL</label>
                  <input 
                    type="url"
                    placeholder="https://example.com/webhook"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none"
                    value={webhookForm.payload_url}
                    onChange={(e) => setWebhookForm({ ...webhookForm, payload_url: e.target.value })}
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Webhook Secret</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Select a brand to view secret"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-400 focus:outline-none cursor-not-allowed"
                      value={webhookForm.webhook_secret}
                      readOnly
                    />
                    <button 
                      onClick={() => {
                        if (webhookForm.webhook_secret) {
                          handleCopy(webhookForm.webhook_secret, "webhook_secret");
                          showToast("Copied!", "success");
                        }
                      }}
                      className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px]"
                      title="Copy Secret"
                      disabled={!webhookForm.webhook_secret}
                    >
                      {copiedField === 'webhook_secret' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button 
                  onClick={handleSaveWebhookEndpoint}
                  disabled={isSavingWebhook}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl transition-all shadow-md flex items-center gap-2 text-sm font-medium cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> {isSavingWebhook ? "Saving..." : "Save Endpoint"}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/50 border-b border-slate-800 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Brand</th>
                    <th className="px-6 py-4">URL</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 w-20">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {webhooks.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <Inbox className="w-8 h-8 mb-3 opacity-50" />
                          <span className="text-sm">No endpoints configured.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    webhooks.map((wh, idx) => {
                      const matchedBrand = brands.find(b => String(b.id) === String(wh.brand_id));
                      const brandName = matchedBrand?.name || wh.brand_name || 'Brand';
                      return (
                        <tr key={wh.id || idx} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-white">{brandName}</td>
                          <td className="px-6 py-4 text-sm text-slate-300 truncate max-w-xs">{wh.payload_url}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => handleDeleteWebhook(wh.id)}
                              className="p-2 hover:bg-rose-500/10 hover:text-rose-400 rounded-lg text-slate-400 transition-colors"
                              title="Delete Endpoint"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (activeSubMenu === 'Website Builder') {
      return (
        <div className="w-full">
          <WebsiteBuilderHub user={user} />
        </div>
      );
    }

    if (activeSubMenu === 'Custom Domain Buy') {
      return (
        <div className="w-full">
          <CustomDomainBuy user={user} brands={brands} />
        </div>
      );
    }

    if (activeSubMenu === 'Integrate Custom Domain' || activeSubMenu === 'Custom Domain') {
      return (
        <div className="w-full">
          <IntegrateCustomDomain user={user} brands={brands} />
        </div>
      );
    }

    if (activeSubMenu === 'SMS + WhatsApp Service' || activeSubMenu === 'SMS Service') {
      return (
        <div className="w-full">
          <SmsServiceSettings user={user} brands={brands} />
        </div>
      );
    }

    if (activeSubMenu === 'Email Service') {
      return (
        <div className="w-full">
          <EmailServiceSettings user={user} brands={brands} />
        </div>
      );
    }

    if (activeSubMenu === 'Server Side Tracking') {
      return (
        <div className="w-full">
          <ServerSideTrackingSettings user={user} brands={brands} />
        </div>
      );
    }

    if (activeSubMenu === 'Web Custom Agent') {
      return (
        <div className="w-full">
          <WebCustomAgent user={user} brands={brands} />
        </div>
      );
    }

    if (activeSubMenu === 'Social Custom Agent') {
      return (
        <div className="w-full">
          <SocialCustomAgent user={user} brands={brands} />
        </div>
      );
    }

    if (activeSubMenu === 'Marketplace') {
      return (
        <div className="w-full">
          <Marketplace userId={user?.id || ''} brands={brands} />
        </div>
      );
    }

    if (activeSubMenu === 'Freelancer Work' && activeTab === 'freelancer' && isFreelancer && user?.id) {
      return <FreelancerWorkspace userId={user.id} />;
    }
    if (activeSubMenu === 'Influencer Profile' && activeTab === 'influencer' && isInfluencer && user?.id) {
      return <InfluencerWorkspace userId={user.id} />;
    }
    if (activeSubMenu === 'Tele Sales Invoices' && activeTab === 'teleSales' && hasTeleSalesAccess) {
      return <TeleSalesWorkspace />;
    }

    if (activeSubMenu === 'Analytics') {
       return (
         <div className="max-w-4xl">
           <h2 className="text-2xl font-bold text-white mb-6">Payments Analytics</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
             <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
               <p className="text-sm text-slate-400 font-medium mb-2">Today's Volume</p>
               <p className="text-3xl font-bold text-white">৳ 0</p>
             </div>
             <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
               <p className="text-sm text-slate-400 font-medium mb-2">Pending Invoices</p>
               <p className="text-3xl font-bold text-white">0</p>
             </div>
          </div>
         </div>
       )
    }

    if (activeSubMenu === 'Dashboard') {
       return (
         <div className="max-w-4xl">
           <div className="mb-8">
             <h2 className="text-2xl font-bold text-white mb-4">Device Status ({deviceStatuses.length} Added)</h2>
             {deviceStatuses.length === 0 ? (
               <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-slate-400 text-sm">
                 No devices added yet. Go to Plugins & Apps to connect your device.
               </div>
             ) : (
               <div className="flex flex-col gap-3">
                 {deviceStatuses.map((dev, idx) => {
                   const isConnected = dev.connected || (dev.last_heartbeat_at && new Date().getTime() - new Date(dev.last_heartbeat_at).getTime() < 120000);
                   return (
                     <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="p-2 bg-slate-800 rounded-lg">
                           <Smartphone className="w-5 h-5 text-slate-300" />
                         </div>
                         <div>
                           <p className="text-white font-medium">{dev.device_id}</p>
                           <p className="text-xs text-slate-400">ID: {dev.device_id}</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-2">
                         <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-red-500'}`}></span>
                         <span className={`text-sm font-medium ${isConnected ? 'text-emerald-500' : 'text-red-500'}`}>
                           {isConnected ? 'Connected' : 'Disconnected'}
                         </span>
                       </div>
                     </div>
                   );
                 })}
               </div>
             )}
           </div>

           <div className="mb-8">
                          <h2 className="text-2xl font-bold text-white mb-4 flex flex-wrap items-center gap-3">
               Gateway Tracker (Volume & Count)
               {(() => {
                 let warnings: { brand: string, msg: string }[] = [];

                 gatewayNumbers.forEach((gw: any) => {
                   const isPersonal = gw.type === 'personal' || !gw.type;
                   if (!isPersonal || !gw.brand_id) return;

                   const providerName = (gw.provider || 'Gateway').toUpperCase();
                   const bName = gw.brands?.name || 'Unknown Brand';
                   const limitsObj = {
                      bkash: { dailyCount: 100, dailyAmt: 50000, monthlyCount: 250, monthlyAmt: 300000 },
                      nagad: { dailyCount: 50, dailyAmt: 50000, monthlyCount: 100, monthlyAmt: 300000 },
                      upay: { dailyCount: 100, dailyAmt: 50000, monthlyCount: 1000, monthlyAmt: 300000 },
                      rocket: { dailyCount: 100000, dailyAmt: 50000, monthlyCount: 1000000, monthlyAmt: 300000 }
                   };
                   const providerKey = (gw.provider || '').toLowerCase();
                   const defaultLimits = { dailyCount: 100, dailyAmt: 30000, monthlyCount: 100, monthlyAmt: 300000 };
                   const lim = limitsObj[providerKey as keyof typeof limitsObj] || defaultLimits;
                   
                   const pDC = (Number(gw.daily_count) || 0) / lim.dailyCount;
                   const pDA = (Number(gw.daily_amount) || 0) / lim.dailyAmt;
                   const pMC = (Number(gw.monthly_count) || 0) / lim.monthlyCount;
                   const pMA = (Number(gw.monthly_volume) || 0) / lim.monthlyAmt;
                   
                   const maxPerc = Math.max(pDC, pDA, pMC, pMA);
                   const hasNumber2 = !!gw.number_2;
                   const hasNumber3 = gw.additional_numbers && gw.additional_numbers.length > 0;
                   
                   const currentLevel = Math.floor(maxPerc);
                   const percInLevel = maxPerc - currentLevel;

                   if (currentLevel === 0) {
                     if (percInLevel >= 0.8) {
                       if (!hasNumber2) warnings.push({ brand: bName, msg: `${providerName} at ${(percInLevel * 100).toFixed(0)}%. Please add a 2nd Number!` });
                       else warnings.push({ brand: bName, msg: `${providerName} at ${(percInLevel * 100).toFixed(0)}%. Ensure 2nd Number is online.` });
                     }
                   } else if (currentLevel === 1) {
                     if (!hasNumber2) {
                       warnings.push({ brand: bName, msg: `${providerName} Limit Reached (100%). Please add a 2nd Number immediately!` });
                     } else {
                       if (percInLevel >= 0.8) {
                         if (!hasNumber3) warnings.push({ brand: bName, msg: `${providerName} 2nd NM at ${(percInLevel * 100).toFixed(0)}%. Please add a 3rd Number!` });
                         else warnings.push({ brand: bName, msg: `${providerName} 2nd NM at ${(percInLevel * 100).toFixed(0)}%. Ensure 3rd Number is online.` });
                       } else if (percInLevel === 0 && maxPerc === 1) {
                         // exactly 100% and has a 2nd number
                         warnings.push({ brand: bName, msg: `${providerName} routed to 2nd Number. Ensure it is online.` });
                       } else {
                         warnings.push({ brand: bName, msg: `${providerName} routed to 2nd Number.` });
                       }
                     }
                   } else {
                     if (!hasNumber2) {
                       warnings.push({ brand: bName, msg: `${providerName} Limit Reached! Please add a 2nd Number immediately!` });
                     } else if (!hasNumber3) {
                       warnings.push({ brand: bName, msg: `${providerName} 2nd Limit Reached! Please add a 3rd Number immediately!` });
                     } else {
                       if (percInLevel >= 0.8) warnings.push({ brand: bName, msg: `${providerName} 3rd NM at ${(percInLevel * 100).toFixed(0)}%.` });
                       else warnings.push({ brand: bName, msg: `${providerName} routed to 3rd Number.` });
                     }
                   }
                 });

                 if (warnings.length === 0) return null;

                 return (
                   <div className="flex flex-col gap-2 w-full mt-2">
                     {warnings.map((w, i) => (
                       <span key={i} className="text-xs font-bold text-yellow-400 animate-pulse bg-yellow-400/10 px-3 py-1.5 rounded-full border border-yellow-400/20 flex items-center gap-1.5 w-fit">
                         ⚠️ <span className="text-white">[{w.brand}]</span> {w.msg}
                       </span>
                     ))}
                   </div>
                 );
               })()}
             </h2>
             {gatewayNumbers.filter((gw: any) => gw.brand_id).length === 0 ? (
               <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-slate-400 text-sm">
                 No gateways configured yet.
               </div>
             ) : (
               <div className="space-y-6">
                 {Object.entries(
                   gatewayNumbers.filter((gw: any) => gw.brand_id).reduce((acc: any, gw: any) => {
                     const brand = gw.brands?.name || 'Unknown Brand';
                     if (!acc[brand]) acc[brand] = [];
                     acc[brand].push(gw);
                     return acc;
                   }, {})
                 ).map(([brandName, gateways]: [string, any], bIdx) => (
                   <div key={bIdx} className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                     <div className="bg-slate-800/80 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                       <h3 className="font-bold text-white flex items-center gap-2 text-lg">
                         <Globe className="w-5 h-5 text-blue-400" />
                         {brandName}
                       </h3>
                       <span className="text-xs font-medium text-slate-400 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-700 shadow-inner">
                         {gateways.length} Gateways
                       </span>
                     </div>
                     <div className="overflow-x-auto">
                       <table className="w-full text-left border-collapse">
                         <thead>
                           <tr className="bg-slate-900/40 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                             <th className="p-4 font-semibold w-24">Gateway</th>
                             <th className="p-4 font-semibold">Number</th>
                             <th className="p-4 font-semibold text-right" >Daily Trx</th>
                             <th className="p-4 font-semibold text-right" >Daily Vol (৳)</th>
                             <th className="p-4 font-semibold text-right" >Monthly Trx</th>
                             <th className="p-4 font-semibold text-right" >Monthly Vol (৳)</th>
                             <th className="p-4 font-semibold text-center w-28">Status</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-800/60">
                           {gateways.map((gw: any, idx: number) => {
                             const monthlyVol = Number(gw.monthly_volume) || 0;
                             const dailyVol = Number(gw.daily_amount) || 0;
                             const monthlyCount = Number(gw.monthly_count) || 0;
                             const dailyCount = Number(gw.daily_count) || 0;
                             const isPersonal = gw.type === 'personal' || !gw.type;
                             
                             // Dynamic Limits based on Provider (Personal MFS)
                             const limitsObj = {
                                bkash: { dailyCount: 100, dailyAmt: 50000, monthlyCount: 250, monthlyAmt: 300000 },
                                nagad: { dailyCount: 50, dailyAmt: 50000, monthlyCount: 100, monthlyAmt: 300000 },
                                upay: { dailyCount: 100, dailyAmt: 50000, monthlyCount: 1000, monthlyAmt: 300000 },
                                rocket: { dailyCount: 100000, dailyAmt: 50000, monthlyCount: 1000000, monthlyAmt: 300000 }
                             };
                             const providerKey = (gw.provider || '').toLowerCase();
                             const defaultLimits = { dailyCount: 100, dailyAmt: 30000, monthlyCount: 100, monthlyAmt: 300000 };
                             const providerLimits = limitsObj[providerKey as keyof typeof limitsObj] || defaultLimits;

                             const limitDailyCount = isPersonal ? providerLimits.dailyCount : 999999;
                             const limitDailyAmount = isPersonal ? providerLimits.dailyAmt : 9999999;
                             const limitMonthlyCount = isPersonal ? providerLimits.monthlyCount : 999999;
                             const limitMonthlyAmount = isPersonal ? providerLimits.monthlyAmt : 9999999;
                             
                             const percDailyCount = (dailyCount / limitDailyCount) * 100;
                             const percDailyAmount = (dailyVol / limitDailyAmount) * 100;
                             const percMonthlyCount = (monthlyCount / limitMonthlyCount) * 100;
                             const percMonthlyAmount = (monthlyVol / limitMonthlyAmount) * 100;                             // If ANY of the 4 metrics hits >= 80%, trigger the alert
                             const isNearLimit = percDailyCount >= 80 || percDailyAmount >= 80 || percMonthlyCount >= 80 || percMonthlyAmount >= 80;
                             const isCrossed = percDailyCount >= 100 || percDailyAmount >= 100 || percMonthlyCount >= 100 || percMonthlyAmount >= 100;
                             const maxPerc = Math.max(percDailyCount, percDailyAmount, percMonthlyCount, percMonthlyAmount);
                             const currentLevel = Math.floor(maxPerc / 100);

                             return (
                               <tr 
                                 key={idx} 
                                 className={`${isNearLimit && !isCrossed ? 'bg-red-500/10 animate-pulse relative' : 'hover:bg-slate-800/30 transition-colors'}`}
                               >
                                 {isNearLimit && !isCrossed && (
                                   <td className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></td>
                                 )}
                                 <td className="p-4 text-sm font-bold text-blue-400 uppercase tracking-wider flex flex-col gap-1">
                                   {gw.provider}
                                   {!isPersonal && <span className="text-[9px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded w-max">MERCHANT</span>}
                                 </td>
                                 <td className="p-4 text-sm font-medium">
                                   <div className="flex flex-col gap-2">
                                     <div className="flex items-center gap-2">
                                       <span className={`${isCrossed ? 'text-slate-500 line-through' : 'text-white'}`}>{gw.number}</span>
                                       {!isCrossed ? (
                                         <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">✅ ACTIVE</span>
                                       ) : (
                                         <span className="text-[9px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/30">LIMIT REACHED</span>
                                       )}
                                     </div>
                                     {gw.number_2 && (
                                       <div className="flex items-center gap-2">
                                         <span className={`${isCrossed ? 'text-white' : 'text-slate-600'}`}>{gw.number_2}</span>
                                         {isCrossed ? (
                                           <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">✅ ACTIVE</span>
                                         ) : (
                                           <span className="text-[9px] font-bold bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full border border-slate-700">STANDBY</span>
                                         )}
                                       </div>
                                     )}
                                   </div>
                                 </td>
                                 <td className={`p-4 text-sm font-semibold text-right ${percDailyCount >= 80 ? 'text-red-400' : 'text-slate-200'}`}>
                                   {dailyCount} <span className="text-[10px] text-slate-500 font-normal">/ {isPersonal ? (limitDailyCount >= 100000 ? (limitDailyCount/100000 + 'L') : limitDailyCount.toLocaleString()) : '∞'}</span>
                                 </td>
                                 <td className={`p-4 text-sm font-semibold text-right ${percDailyAmount >= 80 ? 'text-red-400' : 'text-slate-200'}`}>
                                   {dailyVol.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">/ {isPersonal ? (limitDailyAmount/1000 + 'k') : '∞'}</span>
                                 </td>
                                 <td className={`p-4 text-sm font-semibold text-right ${percMonthlyCount >= 80 ? 'text-red-400' : 'text-slate-200'}`}>
                                   {monthlyCount} <span className="text-[10px] text-slate-500 font-normal">/ {isPersonal ? (limitMonthlyCount >= 100000 ? (limitMonthlyCount/100000 + 'L') : limitMonthlyCount.toLocaleString()) : '∞'}</span>
                                 </td>
                                 <td className={`p-4 text-sm font-semibold text-right ${percMonthlyAmount >= 80 ? 'text-red-400' : 'text-slate-200'}`}>
                                   {monthlyVol.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">/ {isPersonal ? (limitMonthlyAmount/100000 + 'L') : '∞'}</span>
                                 </td>
                                 <td className="p-4 text-center">
                                   <div className="flex flex-col items-center gap-1.5 w-full">
                                     <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                       <div className={`h-1.5 rounded-full ${isNearLimit ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(maxPerc, 100)}%` }}></div>
                                     </div>
                                     <span className={`text-[10px] font-bold ${isNearLimit ? 'text-red-400' : 'text-slate-400'}`}>{maxPerc.toFixed(1)}%</span>
                                   </div>
                                 </td>
                               </tr>
                             );
                           })}
                         </tbody>
                       </table>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>

           <h2 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
             <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
               <p className="text-sm text-slate-400 font-medium mb-2">Today's Volume</p>
               <p className="text-3xl font-bold text-white">৳ 0</p>
             </div>
             <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
               <p className="text-sm text-slate-400 font-medium mb-2">Pending Invoices</p>
               <p className="text-3xl font-bold text-white">0</p>
             </div>
          </div>
         </div>
       )
    }

    if (activeSubMenu === 'Freelancer Applications' && isAdmin) {
      return <FreelancerApplicationsAdmin />;
    }

    if (activeSubMenu === 'Users' && isAdmin) {
      const filteredUsers = mockAdminUsers.filter(u => 
        (u.id || '').toLowerCase().includes(adminSearchQuery.toLowerCase()) || 
        (u.email || '').toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
        (u.name || '').toLowerCase().includes(adminSearchQuery.toLowerCase())
      );

      return (
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-white">Registered Clients</h2>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search by ID, Email, Name..." 
                  value={adminSearchQuery}
                  onChange={(e) => setAdminSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <button onClick={fetchUsers} disabled={isLoadingUsers} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm shrink-0 disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${isLoadingUsers ? 'animate-spin' : ''}`} /> {isLoadingUsers ? 'Syncing...' : 'Sync'}
              </button>
            </div>
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-950/50 border-b border-slate-800">
                    <th className="p-4 text-sm font-bold text-slate-300">Client Info</th>
                    <th className="p-4 text-sm font-bold text-slate-300">Client ID</th>
                    <th className="p-4 text-sm font-bold text-slate-300">Verification Status</th>
                    <th className="p-4 text-sm font-bold text-slate-300">Uploaded Documents</th>
                    <th className="p-4 text-sm font-bold text-slate-300">Joined</th>
                    <th className="p-4 text-sm font-bold text-slate-300 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 text-sm">
                        No clients found matching your search.
                      </td>
                    </tr>
                  ) : filteredUsers.map((client) => (
                    <tr key={client.id} className="border-b border-slate-800 hover:bg-slate-800/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold border shrink-0 ${client.status === 'Blocked' ? 'text-red-400 border-red-500/20' : 'text-emerald-400 border-emerald-500/20'}`}>
                            {(client.name || 'U').charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{client.name}</p>
                            <p className="text-xs text-slate-400">{client.email}</p>
                            {client.phone && client.phone !== 'N/A' && (
                              <p className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                                {client.phone_type === 'telegram' ? (
                                  <span className="text-blue-300 font-sans text-[10px] bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.2 rounded font-bold">✈️ Telegram</span>
                                ) : client.phone_type === 'both' ? (
                                  <span className="text-purple-300 font-sans text-[10px] bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.2 rounded font-bold">⚡ WA/TG</span>
                                ) : (
                                  <span className="text-emerald-300 font-sans text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded font-bold">💬 WhatsApp</span>
                                )}
                                <span>{client.phone}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-800">{client.id}</code>
                          <button onClick={() => navigator.clipboard.writeText(client.id)} className="text-slate-500 hover:text-white" title="Copy ID">
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        {client.verification_status === 'verified' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified ✓
                          </span>
                        ) : client.verification_status === 'rejected' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                            <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> Rejected
                          </span>
                        ) : (client.verification_status === 'pending' || client.nid_number || client.birth_number || client.face_image_url) ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                            <Clock className="w-3.5 h-3.5 text-amber-400" /> রিকোয়েস্ট এসেছে
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                            কোনো আবেদন করেনি
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {client.nid_front_url ? (
                            <button
                              type="button"
                              onClick={() => setPreviewZoomImage(client.nid_front_url)}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 flex items-center gap-1"
                              title="NID সম্মুখভাগ বড় করে দেখুন"
                            >
                              🪪 NID ফ্রন্ট
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-600 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">NID ফ্রন্ট নেই</span>
                          )}

                          {client.nid_back_url ? (
                            <button
                              type="button"
                              onClick={() => setPreviewZoomImage(client.nid_back_url)}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 flex items-center gap-1"
                              title="NID পেছনের ভাগ বড় করে দেখুন"
                            >
                              🪪 NID ব্যাক
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-600 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">NID ব্যাক নেই</span>
                          )}

                          {client.birth_cert_url ? (
                            <button
                              type="button"
                              onClick={() => setPreviewZoomImage(client.birth_cert_url)}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 flex items-center gap-1"
                              title="জন্মনিবন্ধন সনদ বড় করে দেখুন"
                            >
                              📜 জন্মনিবন্ধন
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-600 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">জন্মনিবন্ধন নেই</span>
                          )}

                          {client.face_image_url ? (
                            <button
                              type="button"
                              onClick={() => setPreviewZoomImage(client.face_image_url)}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 flex items-center gap-1"
                              title="ফেস সেলফি বড় করে দেখুন"
                            >
                              🤳 সেলফি
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-600 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">সেলফি নেই</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-400">{client.joined}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {client.verification_status !== 'verified' ? (
                            <button 
                              onClick={() => handleAdminApproveKyc(client.id)}
                              disabled={isUpdatingKyc}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded text-xs font-bold transition-all shadow-sm flex items-center gap-1 active:scale-95 disabled:opacity-50"
                              title="সরাসরি অ্যাকাউন্ট ভেরিফাই করুন"
                            >
                              <Check className="w-3.5 h-3.5" /> Verify
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                              <ShieldCheck className="w-3.5 h-3.5" /> Verified ✓
                            </span>
                          )}
                          <button 
                            onClick={() => {
                              setKycModalUser(client);
                              setShowRejectInputBox(false);
                              setAdminRejectInput('');
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-400" /> Review & Details
                          </button>
                          {client.status === 'Active' ? (
                            <button 
                              onClick={async () => { if(await showConfirm('Are you sure you want to block this user? They will lose access to all features.')) toggleUserStatus(client.id, client.status) }}
                              className="bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/30 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                            >
                              Block
                            </button>
                          ) : (
                            <button 
                              onClick={async () => { if(await showConfirm('Are you sure you want to unblock this user?')) toggleUserStatus(client.id, client.status) }}
                              className="bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/30 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                            >
                              Unblock
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-900 text-center flex justify-between items-center">
              <p className="text-xs text-slate-500">Search by Client ID or Email to quickly find a user who has been reported for fraud or rule violations.</p>
              <p className="text-xs text-slate-500">{mockAdminUsers.length} total clients.</p>
            </div>
          </div>
        </div>
      );
    }

    if (activeSubMenu === 'Sms Forwarder Settings') {
      const handleCountryChange = async (countryName: string) => {
        setAdminSelectedCountry(countryName);
        try {
          const { data } = await supabase
            .from('sms_forwarder_settings')
            .select('*')
            .eq('device_name', `__GLOBAL_CONFIG_${countryName}__`)
            .maybeSingle();

          if (data) {
            setForwarderSettings({
              sender_number: data.sender_number || '',
              text_filter: data.text_filter || '',
              webhook_edge_url: data.webhook_edge_url || '',
              headers: data.headers || '',
              json_payload_template: data.json_payload_template || '',
              project_url: data.project_url || '',
              anon_key: data.anon_key || '',
              ws_channel: data.ws_channel || '',
              heartbeat_edge_url: data.heartbeat_edge_url || '',
              dashboard_url: data.dashboard_url || 'https://mecopay.pages.dev/dashboard'
            });
            showToast(`Loaded settings for ${countryName}`, 'success');
          } else {
            // Default presets based on selected country
            if (countryName === 'India') {
              setForwarderSettings(prev => ({
                ...prev,
                sender_number: 'Paytm,PhonePe,GooglePay,BHIM,SBI,HDFC',
                text_filter: '(?:UPI|Ref|TxnId)\\s*[:\\s]\\s*([A-Z0-9]+)'
              }));
            } else if (countryName === 'Pakistan') {
              setForwarderSettings(prev => ({
                ...prev,
                sender_number: 'Easypaisa,JazzCash,SadaPay,Nayapay,UBL',
                text_filter: '(?:TRX|TID|ID)\\s*[:\\s]\\s*([A-Z0-9]+)'
              }));
            } else if (countryName === 'Nigeria') {
              setForwarderSettings(prev => ({
                ...prev,
                sender_number: 'OPay,PalmPay,Moniepoint,Kuda,GTBank,Access',
                text_filter: '(?:Txn|Ref|Amount|Credited)\\s*[:\\s]\\s*([A-Z0-9]+)'
              }));
            } else if (countryName === 'Kenya') {
              setForwarderSettings(prev => ({
                ...prev,
                sender_number: 'MPESA,M-PESA,Equity,KCB',
                text_filter: '([A-Z0-9]{10})\\s*Confirmed'
              }));
            }
          }
        } catch (e) {
          console.error(e);
        }
      };

      const handleSaveForwarderSettings = async () => {
        setIsSavingForwarderSettings(true);
        try {
          // Save via server API with specific country cascade
          const res = await fetch('/api/admin/system-settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              settings: { ...forwarderSettings, user_id: user?.id },
              country: adminSelectedCountry || 'Bangladesh'
            })
          });
          
          const result = await res.json();
          if (!res.ok) throw new Error(result.error || 'Failed to save country settings');

          showToast(`Master settings saved and synced for all ${adminSelectedCountry} client devices!`, 'success');
        } catch (e: any) {
          console.error(e);
          showToast('Error saving settings: ' + (e.message || ''), 'error');
        } finally {
          setIsSavingForwarderSettings(false);
        }
      };

      return (
        <div className="max-w-4xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  Global System Architecture
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Country-Wise Auto Sync
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mt-2 flex items-center gap-2">
                <Settings className="w-6 h-6 text-purple-400" />
                SMS Forwarder Settings
              </h2>
              <p className="text-sm text-slate-400">
                অ্যাডমিন এখান থেকে যে দেশের রুলস আপডেট করবেন, তা স্বয়ংক্রিয়ভাবে ডাটাবেসের মাধ্যমে ওই দেশের সমস্ত ক্লায়েন্টের ডিভাইসে সিঙ্ক হয়ে যাবে।
              </p>
            </div>
            <button
              onClick={handleSaveForwarderSettings}
              disabled={isSavingForwarderSettings}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-900/20 flex items-center gap-2 disabled:opacity-50"
            >
              {isSavingForwarderSettings ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Saving & Syncing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Save & Sync {adminSelectedCountry}
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
            {/* Country Selector Header */}
            <div className="bg-slate-950/80 border border-indigo-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                  Select Country to Configure (Master Global Row)
                </label>
                <p className="text-xs text-slate-400">
                  দেশ নির্বাচন করুন। অ্যাডমিনের এই মাস্টার সেটিংসটি ওই দেশের সব ক্লায়েন্ট নতুন ডিভাইস অ্যাড করার সময় স্বয়ংক্রিয়ভাবে পেয়ে যাবে।
                </p>
              </div>
              <select
                value={adminSelectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="bg-slate-900 border border-indigo-500/50 rounded-lg px-4 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-indigo-400"
              >
                <optgroup label="Asia">
                  {ASIA_COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </optgroup>
                <optgroup label="Africa">
                  {AFRICA_COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="space-y-4">
              {/* 1. Sender Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  1. Sender Number (Box)
                </label>
                <input
                  type="text"
                  value={forwarderSettings.sender_number}
                  onChange={(e) => setForwarderSettings({ ...forwarderSettings, sender_number: e.target.value })}
                  placeholder="bKash | NAGAD | 16216 | upay"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  যেসকল প্রেরক নম্বর থেকে এসএমএস আসবে (যেমন: bKash | NAGAD | 16216 | upay)।
                </span>
              </div>

              {/* 2. Text Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  2. Text Filter (Regex Box)
                </label>
                <input
                  type="text"
                  value={forwarderSettings.text_filter}
                  onChange={(e) => setForwarderSettings({ ...forwarderSettings, text_filter: e.target.value })}
                  placeholder="(?:TrxID|TxnID)\s*[:\s]\s*([A-Z0-9]+)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  এসএমএস থেকে ট্রানজেকশন আইডি বের করার রেগুলার এক্সপ্রেশন (Regex pattern)।
                </span>
              </div>

              {/* 3. Webhook Edge Function URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  3. Webhook Edge Function Base URL
                </label>
                <input
                  type="text"
                  value={forwarderSettings.webhook_edge_url}
                  onChange={(e) => setForwarderSettings({ ...forwarderSettings, webhook_edge_url: e.target.value })}
                  placeholder="https://fwonuakvherzofqximno.supabase.co/functions/v1/sms-webhook"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-emerald-400 font-mono text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  এসএমএস গ্রহণের এজ ফাংশন লিংক। যার শেষে স্বয়ংক্রিয়ভাবে ?user_id=[user_id] যুক্ত হয়ে ফাইনাল Webhook URL তৈরি হবে।
                </span>
              </div>

              {/* 4. Headers */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  4. Headers (JSON Box)
                </label>
                <textarea
                  rows={3}
                  value={forwarderSettings.headers}
                  onChange={(e) => setForwarderSettings({ ...forwarderSettings, headers: e.target.value })}
                  placeholder={'{\n  "Content-Type": "application/json"\n}'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  অ্যাপ থেকে ফরোয়ার্ড করা রিকোয়েস্টে যে হেডারগুলো পাঠানো হবে।
                </span>
              </div>

              {/* 4.5 Json Payload Template */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Json Payload Template
                </label>
                <textarea
                  rows={3}
                  value={forwarderSettings.json_payload_template || ''}
                  onChange={(e) => setForwarderSettings({ ...forwarderSettings, json_payload_template: e.target.value })}
                  placeholder={'{\n  "sender": "{sender}",\n  "message": "{message}"\n}'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  এসএমএস ফরোয়ার্ডার অ্যাপ থেকে পাঠানো JSON পে-লোডের স্ট্রাকচার।
                </span>
              </div>

              <div className="border-t border-slate-800/80 pt-4 mt-4">
                <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-3">
                  Heartbeat WebSocket URL উপাদানসমূহ (Auto Composed by SQL)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 5. Project URL */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                      5. Supabase Host / Project URL
                    </label>
                    <input
                      type="text"
                      value={forwarderSettings.project_url}
                      onChange={(e) => setForwarderSettings({ ...forwarderSettings, project_url: e.target.value })}
                      placeholder="fwonuakvherzofqximno.supabase.co"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      প্রজেক্ট হোস্ট ডোমেইন (যেমন: fwonuakvherzofqximno.supabase.co)।
                    </span>
                  </div>

                  {/* 6. Channel */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                      6. WebSocket Realtime Channel
                    </label>
                    <input
                      type="text"
                      value={forwarderSettings.ws_channel}
                      onChange={(e) => setForwarderSettings({ ...forwarderSettings, ws_channel: e.target.value })}
                      placeholder="all_devices"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      রিয়েলটাইম চ্যানেল নাম (ডিফল্ট: all_devices)।
                    </span>
                  </div>
                </div>

                {/* 7. Anon Key */}
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    7. Supabase Anon API Key
                  </label>
                  <textarea
                    rows={2}
                    value={forwarderSettings.anon_key}
                    onChange={(e) => setForwarderSettings({ ...forwarderSettings, anon_key: e.target.value })}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-xs focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    সুপাবেস প্রজেক্টের Anon Public Key। যা WebSocket এর ?apikey= প্যারামিটারে বসবে।
                  </span>
                </div>

                {/* 8. Dashboard URL */}
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    8. Dashboard URL
                  </label>
                  <input
                    type="text"
                    value={forwarderSettings.dashboard_url || ""}
                    onChange={(e) => setForwarderSettings({ ...forwarderSettings, dashboard_url: e.target.value })}
                    placeholder="https://mecopay.pages.dev/dashboard"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    ক্লাইন্ট ড্যাশবোর্ডের URL, যা অ্যাপে দেখানো হবে।
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
              <p className="text-xs text-slate-500">
                সেভ বাটনে ক্লিক করলে সকল ইউজারের প্রতিটি ডিভাইসের রো স্বয়ংক্রিয়ভাবে নতুন ফরম্যাটেড লিংকে আপডেট হয়ে যাবে।
              </p>
              <button
                onClick={handleSaveForwarderSettings}
                disabled={isSavingForwarderSettings}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {isSavingForwarderSettings ? 'Updating...' : 'Save & Sync Backend'}
              </button>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden mt-8">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">All Client Devices</h3>
                <p className="text-sm text-slate-400">Manage SMS Forwarder limits and monitor active devices across all users.</p>
              </div>
              <button onClick={fetchAdminDevices} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/50 border-b border-slate-800 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Client Email</th>
                    <th className="px-6 py-4">Device Name</th>
                    <th className="px-6 py-4">Added On</th>
                    <th className="px-6 py-4">Last Sync</th>
                    <th className="px-6 py-4 w-32">Limit / Unlimited</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {allClientDevices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">
                        No client devices found yet.
                      </td>
                    </tr>
                  ) : (
                    allClientDevices.map((dev, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-white">{dev.user_email}</td>
                        <td className="px-6 py-4 text-sm text-slate-300 font-mono">
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-slate-500" />
                            {dev.device_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {new Date(dev.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {new Date(dev.updated_at).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button 
                            onClick={() => showToast("Device limits feature coming soon!", "success")}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-xs font-medium transition-colors w-full"
                          >
                            Set Limit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (activeSubMenu === 'Headless Orchestrator') {
      return (
        <div className="w-full">
          <HeadlessOrchestrator />
        </div>
      );
    }

    // Default placeholder
    return (
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">{activeSubMenu}</h2>
        <div className="p-8 border border-slate-800 bg-slate-900/30 rounded-2xl">
          <p className="text-slate-400">
            Configure settings and view data for <strong className="text-slate-200">{activeSubMenu}</strong>.
          </p>
        </div>
      </div>
    );
  };

  const handleTabChange = (tab: 'brand' | 'payments' | 'site' | 'freelancer' | 'influencer' | 'teleSales' | 'admin') => {
    if (tab === 'freelancer' && !isFreelancer) return;
    if (tab === 'influencer' && !isInfluencer) return;
    if (tab === 'teleSales' && !hasTeleSalesAccess) return;
    if (!isDashboardUnlocked && !['brand', 'admin', 'freelancer', 'influencer', 'teleSales'].includes(tab)) {
      showToast("ড্যাশবোর্ড সম্পূর্ণ আনলক করতে প্রোফাইলে তথ্য ও পরিচয়পত্র জমা দিন!", "error");
      return;
    }
    setActiveTab(tab);
    if (menuData[tab] && menuData[tab].items) {
      setActiveSubMenu(menuData[tab].items[0]);
    }
    setIsMobileMenuOpen(true);
  };

  return (
    <div className="h-screen bg-[#050505] text-slate-200 flex flex-col font-sans selection:bg-emerald-500/30 overflow-hidden">
      
      {/* Header */}
      <header className="flex flex-col bg-[#0a0a0a] border-b border-slate-900 shrink-0 z-40 relative">
        
        {/* Top Row: Logo & Sign Out */}
        <div className="h-16 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <img src="https://i.postimg.cc/gX1nxKHH/logo.png" alt="MecoPay" className="h-8 w-auto rounded-lg shadow-sm" onError={(e) => { e.currentTarget.src = "https://i.postimg.cc/Zn53D792/Meco-Pay-Logo.png"; }} />
            <h1 className="text-xl font-bold text-white tracking-tight">MecoPay</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {verificationStatus === 'verified' && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Merchant
              </span>
            )}
            {verificationStatus === 'pending' && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Pending Review
              </span>
            )}
            <span className="hidden md:block text-sm font-medium text-slate-400">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium px-3 sm:px-4 py-2 rounded-lg hover:bg-slate-900"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: 3 Tabs (Closer together, 1 finger below) */}
        <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-4 pb-4 px-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => handleTabChange('brand')}
            className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'brand' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            Your MecoPay
          </button>
          
          <button
            onClick={() => handleTabChange('payments')}
            className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'payments' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : !isDashboardUnlocked
                  ? 'bg-slate-900/50 text-slate-600 border border-slate-800/50 cursor-not-allowed'
                  : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            Payments Hub
            {!isDashboardUnlocked && <Lock className="w-3.5 h-3.5 text-red-500" />}
          </button>

          <button
            onClick={() => handleTabChange('site')}
            className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'site' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : !isDashboardUnlocked
                  ? 'bg-slate-900/50 text-slate-600 border border-slate-800/50 cursor-not-allowed'
                  : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            My Site
            {!isDashboardUnlocked && <Lock className="w-3.5 h-3.5 text-red-500" />}
          </button>

          {isFreelancer && (
            <button
              onClick={() => handleTabChange('freelancer')}
              className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === 'freelancer'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              Freelancer
            </button>
          )}

          {isInfluencer && (
            <button
              onClick={() => handleTabChange('influencer')}
              className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === 'influencer'
                  ? 'bg-fuchsia-600 text-white shadow-sm'
                  : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              Influencer
            </button>
          )}

          {hasTeleSalesAccess && (
            <button
              onClick={() => handleTabChange('teleSales')}
              className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === 'teleSales'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              Tele Sales
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => handleTabChange('admin')}
              className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'admin' 
                  ? 'bg-red-600 text-white shadow-sm' 
                  : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Crown className="w-4 h-4" />
              Admin
            </button>
          )}
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Left Sidebar (Updates based on Top Navigation) */}
        <div className={`absolute md:relative inset-y-0 left-0 z-30 w-72 border-r border-slate-900 bg-[#0a0a0a] flex flex-col overflow-y-auto shrink-0 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          
          {/* Sidebar Header (Profile Photo placeholder or Section Title) */}
          <div className="p-6 border-b border-slate-900/50">
             {activeTab === 'brand' ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-emerald-500/30 flex items-center justify-center overflow-hidden shrink-0">
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-slate-400">{(user?.email || 'U').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{profileName || user?.user_metadata?.full_name || 'My Profile'}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    <div className="mt-1">
                      {verificationStatus === 'verified' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified
                        </span>
                      ) : verificationStatus === 'pending' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          <Clock className="w-3 h-3 text-amber-400" /> Under Review
                        </span>
                      ) : verificationStatus === 'rejected' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                          <ShieldAlert className="w-3 h-3 text-red-400" /> Rejected
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
             ) : (
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{menuData[activeTab as keyof typeof menuData].title}</h2>
             )}
          </div>

          {/* Sub-menu Items */}
          <div className="p-4 space-y-1">
            {menuData[activeTab as keyof typeof menuData].items.map((item, idx) => {
              const isSubActive = activeSubMenu === item;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (!isDashboardUnlocked && item !== 'Profile') {
                      showToast("ড্যাশবোর্ড সম্পূর্ণ আনলক করতে প্রোফাইলে তথ্য ও পরিচয়পত্র জমা দিন!", "error");
                      return;
                    }
                    setActiveSubMenu(item);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                    isSubActive
                      ? 'text-emerald-400 bg-emerald-500/10 font-bold'
                      : !isDashboardUnlocked && item !== 'Profile'
                        ? 'text-slate-600 cursor-not-allowed opacity-50'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {item}
                    {!isDashboardUnlocked && item !== 'Profile' && <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />}
                  </div>
                  {isSubActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Main Content Area */}
        <div id="main-scroll-container" className="flex-1 bg-[#050505] overflow-y-auto p-4 sm:p-8 w-full">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </div>

      </div>
    
      {/* Brand Modal */}
      {showBrandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#1e293b] border border-slate-700 rounded-xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-slate-700/50 bg-[#1a2234] rounded-t-xl sticky top-0 z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Save className="w-5 h-5 text-blue-400" />
                Add a New Brand
              </h2>
              <button onClick={() => setShowBrandModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {/* Top 3 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-blue-400 border-b border-slate-700/50 pb-2">Basic Information</h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Brand Name <span className="text-red-500">*</span></label>
                    <input type="text" value={brandForm.name} onChange={(e) => setBrandForm({...brandForm, name: e.target.value})} placeholder="e.g., MecoPay" className="w-full bg-[#242d42] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Primary Website URL</label>
                    <input 
                      type="text" 
                      value={brandForm.website_url} 
                      onChange={(e) => setBrandForm({...brandForm, website_url: e.target.value})} 
                      placeholder="e.g. https://yourwebsite.com" 
                      className="w-full bg-[#242d42] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                                    <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-slate-300">Platform Links (Allow Delivery Options)</label>
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="flex gap-2 items-center">
                        <input type="checkbox" id="allow_telegram" checked={brandForm.allow_telegram} onChange={(e) => setBrandForm({...brandForm, allow_telegram: e.target.checked})} className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900" />
                        <label htmlFor="allow_telegram" className="text-sm text-slate-300 flex items-center gap-2">
                          Telegram <span className="px-2 py-0.5 bg-slate-800/50 border border-slate-700 rounded text-xs text-slate-400 font-mono">t.me</span>
                        </label>
                      </div>
                      <div className="flex gap-2 items-center">
                        <input type="checkbox" id="allow_tally" checked={brandForm.allow_tally} onChange={(e) => setBrandForm({...brandForm, allow_tally: e.target.checked})} className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900" />
                        <label htmlFor="allow_tally" className="text-sm text-slate-300 flex items-center gap-2">
                          Tally Forms <span className="px-2 py-0.5 bg-slate-800/50 border border-slate-700 rounded text-xs text-slate-400 font-mono">tally.so</span>
                        </label>
                      </div>
                      <div className="flex gap-2 items-center">
                        <input type="checkbox" id="allow_facebook" checked={brandForm.allow_facebook} onChange={(e) => setBrandForm({...brandForm, allow_facebook: e.target.checked})} className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900" />
                        <label htmlFor="allow_facebook" className="text-sm text-slate-300 flex items-center gap-2">
                          Facebook <span className="px-2 py-0.5 bg-slate-800/50 border border-slate-700 rounded text-xs text-slate-400 font-mono">facebook.com</span>
                        </label>
                      </div>
                      <div className="flex gap-2 items-center">
                        <input type="checkbox" id="allow_drive" checked={brandForm.allow_drive} onChange={(e) => setBrandForm({...brandForm, allow_drive: e.target.checked})} className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900" />
                        <label htmlFor="allow_drive" className="text-sm text-slate-300 flex items-center gap-2">
                          Google Drive <span className="px-2 py-0.5 bg-slate-800/50 border border-slate-700 rounded text-xs text-slate-400 font-mono">drive.google.com</span>
                        </label>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Select the platforms you want to allow for payment links under this brand.</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Brand Logo URL or Upload</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={brandForm.logo_url} 
                        onChange={(e) => setBrandForm({...brandForm, logo_url: e.target.value})} 
                        placeholder="Paste image URL or click upload" 
                        className="flex-1 min-w-0 bg-[#242d42] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" 
                      />
                      <input 
                        type="file" 
                        ref={logoInputRef} 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setBrandForm(prev => ({ ...prev, logo_url: reader.result as string }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }} 
                      />
                      <button 
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="flex-shrink-0 bg-[#115e59] hover:bg-teal-700 border border-[#0f766e] text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Upload className="w-4 h-4" /> Upload File
                      </button>
                    </div>
                    {brandForm.logo_url && (
                      <div className="mt-2 flex items-center gap-2 p-2 bg-[#242d42] border border-slate-700 rounded-md">
                        <img src={brandForm.logo_url} alt="Logo Preview" className="w-9 h-9 object-cover rounded bg-slate-800 border border-slate-600" />
                        <span className="text-xs text-slate-300">Logo selected</span>
                        <button 
                          type="button" 
                          onClick={() => setBrandForm({...brandForm, logo_url: ''})} 
                          className="text-xs text-red-400 hover:text-red-300 ml-auto font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Contact Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-blue-400 border-b border-slate-700/50 pb-2">Contact Details</h3>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Support Email</label>
                      <input type="email" value={brandForm.support_email} onChange={(e) => setBrandForm({...brandForm, support_email: e.target.value})} placeholder="support@example.com" className="w-full bg-[#242d42] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Support Phone</label>
                      <input type="tel" placeholder="+1XXXXXXXXXX / +8801XXXXXXXXX" className="w-full bg-[#242d42] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">WhatsApp Number</label>
                      <input type="text" placeholder="+1XXXXXXXXXX / +8801XXXXXXXXX" className="w-full bg-[#242d42] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Support Page Link</label>
                      <input type="text" placeholder="https://example.com/support" className="w-full bg-[#242d42] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                    </div>
                  </div>

                  {/* Social & SEO */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-blue-400 border-b border-slate-700/50 pb-2">Social & SEO</h3>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Facebook Page Link</label>
                      <input type="url" placeholder="e.g., https://facebook.com/mecopay" className="w-full bg-[#242d42] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Telegram Username</label>
                      <input type="text" placeholder="e.g., @mecopay_support" className="w-full bg-[#242d42] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Meta Description</label>
                      <textarea rows={2} placeholder="Short description of the brand for SEO and display..." className="w-full bg-[#242d42] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"></textarea>
                    </div>
                  </div>
                </div>

              </div>

              {/* Payment & Theme Settings */}
              <div className="mb-4">
                <div className="flex justify-between items-center text-blue-400 border-b border-slate-700/50 pb-2 mb-4">
                  <h3 className="text-lg font-bold">Payment & Theme Settings</h3>
                  <ChevronDown className="w-5 h-5" />
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3 border-b border-slate-700/50 pb-2">
                     <h4 className="text-sm font-bold text-slate-200">API Gateway Selection</h4>
                     <span className="text-xs text-slate-400">Optional (Select as needed)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className="cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={brandForm.merchant_api} 
                        onChange={(e) => setBrandForm({...brandForm, merchant_api: e.target.checked})}
                        className="peer hidden" 
                      />
                      <div className="p-3.5 rounded-xl border-2 border-slate-700 bg-[#242d42] peer-checked:border-emerald-500 peer-checked:bg-emerald-500/10 transition-all">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 rounded-md border-2 border-slate-500 peer-checked:border-emerald-500 peer-checked:bg-emerald-500 flex items-center justify-center transition-all shrink-0">
                             <CheckCircle2 className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" />
                          </div>
                          <span className="font-bold text-white text-xs sm:text-sm">Official Merchant</span>
                        </div>
                        <p className="text-[11px] text-slate-400 ml-7">bKash/Nagad PGW</p>
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={brandForm.personal_api} 
                        onChange={(e) => setBrandForm({...brandForm, personal_api: e.target.checked})}
                        className="peer hidden" 
                      />
                      <div className="p-3.5 rounded-xl border-2 border-slate-700 bg-[#242d42] peer-checked:border-purple-500 peer-checked:bg-purple-500/10 transition-all">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 rounded-md border-2 border-slate-500 peer-checked:border-purple-500 peer-checked:bg-purple-500 flex items-center justify-center transition-all shrink-0">
                             <CheckCircle2 className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" />
                          </div>
                          <span className="font-bold text-white text-xs sm:text-sm">Personal SMS API</span>
                        </div>
                        <p className="text-[11px] text-slate-400 ml-7">Android MFS Forwarder</p>
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={brandForm.international_api} 
                        onChange={(e) => setBrandForm({...brandForm, international_api: e.target.checked})}
                        className="peer hidden" 
                      />
                      <div className="p-3.5 rounded-xl border-2 border-slate-700 bg-[#242d42] peer-checked:border-blue-500 peer-checked:bg-blue-500/10 transition-all">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 rounded-md border-2 border-slate-500 peer-checked:border-blue-500 peer-checked:bg-blue-500 flex items-center justify-center transition-all shrink-0">
                             <CheckCircle2 className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" />
                          </div>
                          <span className="font-bold text-white text-xs sm:text-sm">International Gateway</span>
                        </div>
                        <p className="text-[11px] text-slate-400 ml-7">Stripe/PayPal/Global Cards</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Verification settings */}
                <div className={`mb-6 transition-all opacity-100`}>
                  <div className="flex justify-between items-center mb-3 border-b border-slate-700/50 pb-2">
                     <div>
                       <h4 className="text-sm font-bold text-slate-200">Verification Methods</h4>
                       <p className="text-[11px] text-slate-400">Select how to verify customer payments (TrxID or Phone)</p>
                     </div>
                     <button className="flex items-center gap-1 bg-slate-800 border border-slate-700 text-slate-300 px-2 py-1 rounded text-xs"><Info className="w-3 h-3"/> Info</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={brandForm.verify_trx_id} 
                        onChange={(e) => setBrandForm({...brandForm, verify_trx_id: e.target.checked})}
                        className="peer hidden" 
                      />
                      <div className="p-4 rounded-xl border-2 border-slate-700 bg-[#242d42] peer-checked:border-blue-500 peer-checked:bg-blue-500/10 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 rounded-md border-2 border-slate-500 peer-checked:border-blue-500 peer-checked:bg-blue-500 flex items-center justify-center transition-all">
                             <CheckCircle2 className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" />
                          </div>
                          <span className="font-bold text-white text-sm">Transaction ID (24 Hours Window)</span>
                        </div>
                        <p className="text-xs text-slate-400 ml-7">Customer inputs TrxID. System matches SMS received within 24 hours.</p>
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={brandForm.verify_phone} 
                        onChange={(e) => setBrandForm({...brandForm, verify_phone: e.target.checked})}
                        className="peer hidden" 
                      />
                      <div className="p-4 rounded-xl border-2 border-slate-700 bg-[#242d42] peer-checked:border-blue-500 peer-checked:bg-blue-500/10 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 rounded-md border-2 border-slate-500 peer-checked:border-blue-500 peer-checked:bg-blue-500 flex items-center justify-center transition-all">
                             <CheckCircle2 className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" />
                          </div>
                          <span className="font-bold text-white text-sm">Phone Number (10 Min Live Session)</span>
                        </div>
                        <p className="text-xs text-slate-400 ml-7">10-minute real-time live session. Auto-verifies SMS sent from sender phone.</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Payment Amount Type <span className="text-red-500">*</span></label>
                    <select 
                      value={brandForm.payment_amount_type} 
                      onChange={(e) => setBrandForm({...brandForm, payment_amount_type: e.target.value})}
                      className="w-full bg-[#242d42] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none"
                    >
                      <option value="equal">Equal Amount Only</option>
                      <option value="allow_overpayment">Allow Overpayment</option>
                    </select>
                    <p className="text-xs text-slate-400 mt-1">Choose whether to accept exact amount or allow overpayment</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Amount Format <span className="text-red-500">*</span></label>
                    <select 
                      value={brandForm.amount_format} 
                      onChange={(e) => setBrandForm({...brandForm, amount_format: e.target.value})}
                      className="w-full bg-[#242d42] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none"
                    >
                      <option value="as_is">As Is (20.40 &rarr; 20.40)</option>
                      <option value="round_up">Round Up (20.40 &rarr; 21.00)</option>
                    </select>
                    <p className="text-xs text-slate-400 mt-1">Choose how decimal amounts should be displayed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Transaction Fee</label>
                    <p className="text-xs text-slate-400 mt-1 mb-2">Add a brand-level fee for customer payments</p>
                  </div>
                  <div>
                    <input 
                      type="number" 
                      value={brandForm.transaction_fee} 
                      onChange={(e) => setBrandForm({...brandForm, transaction_fee: e.target.value})}
                      className="w-full bg-[#242d42] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 mb-4" 
                      min="0"
                      step="0.1"
                    />
                    <label className="block text-sm font-medium text-slate-300 mb-1">Transaction Fee Type</label>
                    <select 
                      value={brandForm.transaction_fee_type} 
                      onChange={(e) => setBrandForm({...brandForm, transaction_fee_type: e.target.value})}
                      className="w-full bg-[#242d42] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none"
                    >
                      <option value="fixed">Fixed</option>
                      <option value="percentage">Percentage</option>
                    </select>
                    <p className="text-xs text-slate-400 mt-1">Fixed amount or percentage of the payment amount</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <label className="block text-sm font-medium text-slate-300">Theme</label>
                  </div>
                  <a href="#" className="text-blue-400 text-xs flex items-center gap-1 mb-2 hover:underline">
                    <Info className="w-3 h-3" /> View Demo Themes
                  </a>
                  <select className="w-full md:w-1/2 bg-[#242d42] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none">
                    <option>Default</option>
                    <option>Dark Mode</option>
                    <option>Minimalist</option>
                  </select>
                  <p className="text-xs text-slate-400 mt-1">Select theme for brand customization</p>
                </div>
              </div>

            </div>
            
            <div className="p-4 border-t border-slate-700/50 bg-[#1a2234] rounded-b-xl flex justify-end gap-3 sticky bottom-0">
              <button 
                onClick={() => setShowBrandModal(false)}
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-sm font-bold transition-colors"
              >
                Cancel
              </button>
              <button onClick={handleSaveBrand} className="px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-md text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
                <Save className="w-4 h-4" /> Save Brand
              </button>
            </div>
          </div>
        </div>
      )}
    
      
      {confirmDialog && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-3 text-red-400 flex items-center gap-2">⚠️ Danger Zone</h3>
            <p className="text-slate-300 mb-6">{typeof confirmDialog === 'string' ? confirmDialog : confirmDialog.msg}</p>
            
            {typeof confirmDialog === 'object' && confirmDialog.checkboxLabel && (
              <label className="flex items-center gap-3 mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={confirmCheckbox} 
                  onChange={(e) => setConfirmCheckbox(e.target.checked)}
                  className="w-5 h-5 accent-red-500 cursor-pointer"
                />
                <span className="text-sm text-red-200">{confirmDialog.checkboxLabel}</span>
              </label>
            )}

            {typeof confirmDialog === 'object' && confirmDialog.requireType && (
              <div className="mb-6">
                <label className="block text-sm text-slate-400 mb-2">
                  Type <strong className="text-red-400 select-all">{confirmDialog.requireType}</strong> to confirm:
                </label>
                <input 
                  type="text" 
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder={confirmDialog.requireType}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-red-500 focus:outline-none"
                />
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('confirm-response', { detail: false }));
                  setConfirmDialog(null);
                }}
                className="px-4 py-2 rounded-lg font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                disabled={typeof confirmDialog === 'object' && confirmDialog.requireType && confirmInput !== confirmDialog.requireType}
                onClick={() => {
                  if (typeof confirmDialog === 'object' && (confirmDialog.checkboxLabel || confirmDialog.requireType)) {
                     window.dispatchEvent(new CustomEvent('confirm-response', { detail: { confirmed: true, checked: confirmCheckbox } }));
                  } else {
                     window.dispatchEvent(new CustomEvent('confirm-response', { detail: true }));
                  }
                  setConfirmDialog(null);
                }}
                className={`px-4 py-2 rounded-lg font-bold text-white transition-colors ${(typeof confirmDialog === 'object' && confirmDialog.requireType && confirmInput !== confirmDialog.requireType) ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]'}`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    
      
      {/* Regenerate HMAC Modal */}
      {showRegenerateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white mb-2">Regenerate HMAC Secret</h3>
              <p className="text-slate-400 text-sm">
                Are you sure? You will need to update your MecoPay SMS Forwarder app and any Heartbeat URLs with the new secret.
              </p>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Type <span className="text-amber-500 font-bold">regenerate</span> to confirm:
              </label>
              <input
                type="text"
                value={regenerateInput}
                onChange={(e) => setRegenerateInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:border-amber-500 transition-colors"
                placeholder="regenerate"
              />
            </div>
            <div className="p-6 bg-slate-800/50 flex justify-end gap-3">
              <button
                onClick={() => setShowRegenerateModal(false)}
                className="px-5 py-2.5 rounded-lg text-slate-300 font-bold hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={regenerateInput !== 'regenerate'}
                onClick={confirmRegenerateHmac}
                className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors disabled:opacity-50"
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Device Modal */}
      {showDeleteDeviceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white mb-2">Delete Device</h3>
              <p className="text-slate-400 text-sm">
                You are about to delete device <strong>{deviceToDelete}</strong>.
              </p>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Type <span className="text-rose-400 font-bold">delete</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteDeviceInput}
                onChange={(e) => setDeleteDeviceInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:border-rose-500 transition-colors"
                placeholder="delete"
              />
            </div>
            <div className="p-6 bg-slate-800/50 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteDeviceModal(false)}
                className="px-5 py-2.5 rounded-lg text-slate-300 font-bold hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={deleteDeviceInput !== 'delete'}
                onClick={confirmDeleteDevice}
                className="px-5 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold transition-colors disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Camera Capture Modal */}
      {cameraOpen && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-400" />
                <h3 className="text-white font-bold text-sm">
                  {cameraTarget === 'birth' && 'জন্মনিবন্ধন লাইভ ক্যামেরা ক্যাপচার'}
                  {cameraTarget === 'nid_front' && `NID ${profileCopy.front} লাইভ ক্যাপচার`}
                  {cameraTarget === 'nid_back' && `NID ${profileCopy.back} লাইভ ক্যাপচার`}
                  {cameraTarget === 'face' && 'লাইভ ফেস সেলফি ক্যাপচার'}
                </h3>
              </div>
              <button
                onClick={stopLiveCamera}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
              {cameraLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10 text-emerald-400 gap-2 text-sm font-medium">
                  <RefreshCw className="w-5 h-5 animate-spin" /> ক্যামেরা প্রস্তুত হচ্ছে...
                </div>
              )}
              {cameraError ? (
                <div className="p-6 text-center z-10 max-w-sm flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-red-300 leading-relaxed">{cameraError}</p>
                  <div className="flex flex-col sm:flex-row gap-2 mt-2 w-full">
                    <button
                      type="button"
                      onClick={() => cameraTarget && startLiveCamera(cameraTarget)}
                      className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> পুনরায় চেষ্টা
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const target = cameraTarget;
                        stopLiveCamera();
                        setCameraTarget(target);
                        liveCameraInputRef.current?.click();
                      }}
                      className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" /> ডিভাইস ক্যামেরা
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${cameraFacing === 'user' ? '-scale-x-100' : ''}`}
                  />
                  {/* Frame Overlay Guide */}
                  <div className="absolute inset-6 border-2 border-dashed border-emerald-500/60 rounded-xl pointer-events-none flex items-center justify-center">
                    <span className="text-[11px] text-emerald-300/90 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                      {cameraTarget === 'face' ? 'আপনার মুখমণ্ডল ফ্রেমের মাঝে রাখুন' : 'ডকুমেন্টটি ফ্রেমের ভেতরে সোজা রাখুন'}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={switchCameraFacing}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                title="ক্যামেরা পরিবর্তন (Front / Back)"
              >
                <SwitchCamera className="w-4 h-4" /> সুইচ ক্যামেরা
              </button>

              <button
                type="button"
                onClick={capturePhotoFromCamera}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
              >
                <Camera className="w-4 h-4" /> ছবি তুলুন (Capture)
              </button>

              <button
                type="button"
                onClick={stopLiveCamera}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-medium transition-colors"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin KYC Review Modal */}
      {kycModalUser && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">Client Identity & KYC Verification Review</h3>
                  <p className="text-xs text-slate-400">{kycModalUser.name} ({kycModalUser.email})</p>
                </div>
              </div>
              <button
                onClick={() => { setKycModalUser(null); setShowRejectInputBox(false); }}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Status header */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <span className="text-xs text-slate-400">Current Status:</span>
                  <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    kycModalUser.verification_status === 'verified'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : kycModalUser.verification_status === 'rejected'
                      ? 'bg-red-500/10 text-red-400 border-red-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {kycModalUser.verification_status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Age Group: <span className="text-white font-medium">{kycModalUser.age_group === 'under_18' ? '১৮ বছরের নিচে (Under 18)' : '১৮ বছরের উপরে (18+)'}</span>
                </div>
                <div className="text-xs text-slate-400">
                  Phone: <span className="text-white font-medium">{kycModalUser.phone || 'N/A'}</span>
                </div>
              </div>

              {/* NID and Birth numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1">National ID (NID) Number</span>
                  <span className="text-sm font-mono font-bold text-white select-all">
                    {kycModalUser.nid_number || 'জমা দেওয়া হয়নি'}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1">Birth Certificate Number</span>
                  <span className="text-sm font-mono font-bold text-white select-all">
                    {kycModalUser.birth_number || 'জমা দেওয়া হয়নি'}
                  </span>
                </div>
              </div>

              {/* Document Images Grid */}
              <div>
                <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-400" /> সাবমিট করা পরিচয়পত্রের ছবিসমূহ (বড় করে দেখতে ক্লিক করুন)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* NID Front */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5">
                    <span className="text-[11px] text-slate-400 font-medium block mb-1.5">NID Front Side</span>
                    <div
                      onClick={() => kycModalUser.nid_front_url && setPreviewZoomImage(kycModalUser.nid_front_url)}
                      className="aspect-video bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer border border-slate-800 hover:border-emerald-500/50 transition-colors"
                    >
                      {kycModalUser.nid_front_url ? (
                        <img src={kycModalUser.nid_front_url} alt="NID Front" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-slate-600">ছবি নেই</span>
                      )}
                    </div>
                  </div>

                  {/* NID Back */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5">
                    <span className="text-[11px] text-slate-400 font-medium block mb-1.5">NID Back Side</span>
                    <div
                      onClick={() => kycModalUser.nid_back_url && setPreviewZoomImage(kycModalUser.nid_back_url)}
                      className="aspect-video bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer border border-slate-800 hover:border-emerald-500/50 transition-colors"
                    >
                      {kycModalUser.nid_back_url ? (
                        <img src={kycModalUser.nid_back_url} alt="NID Back" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-slate-600">ছবি নেই</span>
                      )}
                    </div>
                  </div>

                  {/* Birth Certificate */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5">
                    <span className="text-[11px] text-slate-400 font-medium block mb-1.5">Birth Certificate</span>
                    <div
                      onClick={() => kycModalUser.birth_cert_url && setPreviewZoomImage(kycModalUser.birth_cert_url)}
                      className="aspect-video bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer border border-slate-800 hover:border-emerald-500/50 transition-colors"
                    >
                      {kycModalUser.birth_cert_url ? (
                        <img src={kycModalUser.birth_cert_url} alt="Birth Cert" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-slate-600">ছবি নেই</span>
                      )}
                    </div>
                  </div>

                  {/* Face Photo */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5">
                    <span className="text-[11px] text-slate-400 font-medium block mb-1.5">Live Face Photo</span>
                    <div
                      onClick={() => kycModalUser.face_image_url && setPreviewZoomImage(kycModalUser.face_image_url)}
                      className="aspect-video bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer border border-slate-800 hover:border-emerald-500/50 transition-colors"
                    >
                      {kycModalUser.face_image_url ? (
                        <img src={kycModalUser.face_image_url} alt="Face" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-slate-600">ছবি নেই</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Web & Social Links */}
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <span className="text-xs font-bold text-slate-400 block mb-2">Web & Social Profiles</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>Website: {kycModalUser.website_url ? <a href={kycModalUser.website_url} target="_blank" rel="noreferrer" className="text-emerald-400 underline">{kycModalUser.website_url}</a> : <span className="text-slate-600">None</span>}</div>
                  <div>Facebook: {kycModalUser.social_fb ? <a href={kycModalUser.social_fb} target="_blank" rel="noreferrer" className="text-emerald-400 underline">{kycModalUser.social_fb}</a> : <span className="text-slate-600">None</span>}</div>
                  <div>Instagram: {kycModalUser.social_insta ? <a href={kycModalUser.social_insta} target="_blank" rel="noreferrer" className="text-emerald-400 underline">{kycModalUser.social_insta}</a> : <span className="text-slate-600">None</span>}</div>
                  <div>YouTube: {kycModalUser.social_yt ? <a href={kycModalUser.social_yt} target="_blank" rel="noreferrer" className="text-emerald-400 underline">{kycModalUser.social_yt}</a> : <span className="text-slate-600">None</span>}</div>
                </div>
              </div>

              {/* Rejection input box if opened */}
              {showRejectInputBox && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl space-y-3">
                  <label className="block text-xs font-bold text-red-300">প্রত্যাখ্যানের সুনির্দিষ্ট কারণ লিখুন (ক্লায়েন্ট দেখতে পারবে):</label>
                  <textarea
                    value={adminRejectInput}
                    onChange={(e) => setAdminRejectInput(e.target.value)}
                    placeholder="যেমন: NID কার্ডের ছবি ঝাপসা ছিল, স্পষ্ট করে লাইভ ক্যামেরায় পুনরায় তুলুন..."
                    className="w-full bg-slate-950 border border-red-500/40 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-red-400"
                    rows={3}
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowRejectInputBox(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
                    >
                      বাতিল
                    </button>
                    <button
                      type="button"
                      disabled={isUpdatingKyc}
                      onClick={() => handleAdminRejectKyc(kycModalUser.id, adminRejectInput)}
                      className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                    >
                      রিজেক্ট নিশ্চিত করুন
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer action buttons */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => { setKycModalUser(null); setShowRejectInputBox(false); }}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                বন্ধ করুন
              </button>

              <div className="flex items-center gap-3">
                {!showRejectInputBox && (
                  <button
                    onClick={() => setShowRejectInputBox(true)}
                    disabled={isUpdatingKyc}
                    className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <ShieldAlert className="w-4 h-4" /> Reject (প্রত্যাখ্যান)
                  </button>
                )}

                <button
                  onClick={() => handleAdminApproveKyc(kycModalUser.id)}
                  disabled={isUpdatingKyc}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> {isUpdatingKyc ? 'Updating...' : 'Approve & Verify (অনুমোদন)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Image Zoom Preview Modal */}
      {previewZoomImage && (
        <div
          onClick={() => setPreviewZoomImage(null)}
          className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-150"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={previewZoomImage} alt="Full Zoom Preview" className="max-w-full max-h-[85vh] object-contain rounded-xl border border-slate-700 shadow-2xl" />
            <p className="text-center text-xs text-slate-400 mt-2">বন্ধ করতে যেকোনো জায়গায় ক্লিক করুন</p>
          </div>
        </div>
      )}

{toast && (
        <div className="fixed top-12 right-12 z-[9999] pointer-events-none animate-in fade-in slide-in-from-top-5 duration-200">
          <p className={`font-bold text-lg drop-shadow-sm ${toast.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
            {toast.msg}
          </p>
        </div>
      )}
    </div>
  );
}
