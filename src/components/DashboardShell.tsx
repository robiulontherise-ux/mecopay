import React, { useEffect, useState, useRef } from 'react';
import MySiteApp from '../mysite/App';
import WebsiteBuilderHub from './WebsiteBuilderHub';
import { supabase } from '../lib/supabase';
import { showToast } from '../lib/toast';
import { showConfirm } from '../lib/confirm';
import MfaSettings from './MfaSettings';
import GatewaySettings from "./payment-hub/GatewaySettings";
import PaymentLinks from "./payment-hub/PaymentLinks";
import Invoices from "./payment-hub/Invoices";
import { useNavigate } from 'react-router-dom';
import { Box, FolderGit2, UploadCloud, Lock, Search, LogOut, Upload, ShieldCheck, Key, Plug, CreditCard, LayoutTemplate, Settings, ChevronRight, Menu, X, ChevronDown, CheckCircle2, Zap, Rocket, Globe, Wallet, Crown, Plus, Video, MoreVertical, Copy, Edit, RefreshCw, Trash2, Image as ImageIcon, Save, Info, Download, Smartphone, FileText, ExternalLink, ShieldAlert, Inbox, Book } from 'lucide-react';

export default function DashboardShell({ isSuperAdmin }: { isSuperAdmin?: boolean }) {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [hmacSecret, setHmacSecret] = useState<string>('');
  const isAdmin = isSuperAdmin;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'brand' | 'payments' | 'site' | 'admin'>('brand');
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
          hmac_secret: hmacSecret || "HMAC_SECRET",
          settings: forwarderSettings
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
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        if (data.warning) setAdminWarning(data.warning);
        setMockAdminUsers(data.users || []);
      } else {
        const err = await res.json();
        console.error("Failed to fetch users:", err.error);
        setAdminWarning("Could not load users from server.");
      }
    } catch (e) {
      console.error(e);
      setAdminWarning("Failed to connect to backend API.");
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
      const res = await fetch(`/api/admin/users/${id}/${isBlocking ? 'block' : 'unblock'}`, {
        method: 'POST'
      });
      if (res.ok) {
        setMockAdminUsers(users => users.map(u => 
          u.id === id ? { ...u, status: isBlocking ? 'Blocked' : 'Active' } : u
        ));
      } else {
        const err = await res.json();
        showToast("Error changing status!", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to update status!", "error");
    }
  };

  // Profile States
  const [profileName, setProfileName] = useState<string>('');
  const [profilePhone, setProfilePhone] = useState<string>('+8801');
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
    allow_youtube: false,
    allow_drive: false,
    logo_url: '',
    support_email: '',
    verify_trx_id: true, verify_phone: false, merchant_api: true, personal_api: false,
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


  useEffect(() => {
    fetchBrands();
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
      allow_youtube: false,
      allow_drive: false,
      logo_url: '',
      support_email: '',
      verify_trx_id: true, verify_phone: false, merchant_api: true, personal_api: false,
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
      allow_youtube: !!brand.redirect_links?.allow_youtube,
      allow_drive: !!brand.redirect_links?.allow_drive,
      logo_url: brand.logo_url || '',
      support_email: brand.support_email || '',
      payment_amount_type: brand.payment_amount_type || 'equal',
      amount_format: brand.amount_format || 'as_is',
      transaction_fee: (brand.transaction_fee || 0).toString(),
      transaction_fee_type: brand.transaction_fee_type || 'fixed',
      verify_trx_id: brand.redirect_links?.verify_trx_id ?? true,
      verify_phone: brand.redirect_links?.verify_phone ?? false,
      merchant_api: brand.redirect_links?.merchant_api ?? true,
      personal_api: brand.redirect_links?.personal_api ?? false
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
      redirect_links: {
        allow_telegram: brandForm.allow_telegram,
        allow_tally: brandForm.allow_tally,
        allow_facebook: brandForm.allow_facebook,
        allow_drive: brandForm.allow_drive,
        verify_trx_id: brandForm.verify_trx_id,
        verify_phone: brandForm.verify_phone,
        merchant_api: brandForm.merchant_api,
        personal_api: brandForm.personal_api
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
        name: '', website_url: '', allow_telegram: false, allow_tally: false, allow_facebook: false, allow_whatsapp: false, allow_drive: false, allow_youtube: false, logo_url: '', support_email: '', verify_trx_id: true, verify_phone: false, merchant_api: true, personal_api: false,
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
        
      setProfileName(user.user_metadata?.full_name || '');
      setProfilePhone(user.user_metadata?.phone || '+8801');
      setAgeGroup(user.user_metadata?.age_group || '18_plus');
      setNidNumber(user.user_metadata?.nid_number || user.user_metadata?.identity_number || '');
      setNidFrontImage(user.user_metadata?.nid_front_image || user.user_metadata?.doc_front_image || '');
      setNidBackImage(user.user_metadata?.nid_back_image || user.user_metadata?.doc_back_image || '');
      setBirthNumber(user.user_metadata?.birth_number || '');
      setBirthImage(user.user_metadata?.birth_image || '');
      setFaceImage(user.user_metadata?.face_image || '');
      setWebsiteUrl(user.user_metadata?.website_url || '');
      setSocialFb(user.user_metadata?.social_fb || '');
      setSocialInsta(user.user_metadata?.social_insta || '');
      setSocialLi(user.user_metadata?.social_li || '');
      setSocialYt(user.user_metadata?.social_yt || '');
      
      const hasBirth = !!(user.user_metadata?.birth_number || (user.user_metadata?.identity_type === 'birth_cert' && user.user_metadata?.identity_number));
      const hasNid = !!(user.user_metadata?.nid_number || (user.user_metadata?.identity_type === 'nid' && user.user_metadata?.identity_number));
      
      setIsBirthLocked(hasBirth);
      setIsNidLocked(hasNid);
      
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
            const edgeUrl = globalConfigRow.heartbeat_edge_url || '';
            const webEdgeUrl = globalConfigRow.webhook_edge_url || '';
            const genWebhookUrl = `${webEdgeUrl}?user_id=${user.id}`;
            const genWsUrl = `wss://${hostUrl}/realtime/v1/websocket?apikey=${anonKey}&vsn=1.0.0&channel=${channel}&user_id=${user.id}&secret=${hmacSecret || ''}&device_id=${encodeURIComponent(dev)}&edge_url=${edgeUrl}`;

            await supabase.from('sms_forwarder_settings').upsert({
              user_id: user.id,
              device_name: dev,
              hmac_secret: hmacSecret || '',
              sender_number: globalConfigRow.sender_number,
              text_filter: globalConfigRow.text_filter,
              webhook_edge_url: webEdgeUrl,
              headers: globalConfigRow.headers,
              json_payload_template: globalConfigRow.json_payload_template,
              project_url: hostUrl,
              anon_key: anonKey,
              ws_channel: channel,
              heartbeat_edge_url: edgeUrl,
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
      
      // Unlock if they have full name and phone (or identity documents)
      const hasBasicInfo = !!(user.user_metadata?.full_name && user.user_metadata?.phone);
      const isVerified = hasBasicInfo || hasBirth || hasNid || !!user.user_metadata?.identity_number;
      setIsIdentityLocked(isVerified);
      if (isVerified) {
        setActiveSubMenu('Dashboard');
      }
      
    });
    
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  
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
      items: ['Profile', 'Dashboard', 'Service & Billing', 'Brand', 'Webhook Settings', 'Plugins & Apps', 'Developer Docs'],
    },
    payments: {
      title: 'Payments Hub',
      items: ['Gateway Settings', 'Payment Links', 'Invoices', 'Transactions', 'Transaction Analysis', 'Analytics'],
    },
    site: {
      title: 'My Site',
      items: ['Website Builder', 'Manage Posts', 'Custom Domain', 'SEO Settings'],
    },
    ...(isAdmin && {
      admin: {
        title: 'Admin Panel',
        items: ['Overview', 'Users', 'Sms Forwarder Settings', 'System Settings', 'Reports']
      }
    })
  };

  // Helper function to render content based on the selected sub-menu
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
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
      setIsIdentityLocked(false);
      setIsBirthLocked(false);
      setIsNidLocked(false);
      
      setProfileMessage('Profile has been completely reset for testing.');
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
      const { data, error } = await supabase.auth.updateUser({
        data: { 
          full_name: profileName, 
          phone: profilePhone,
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

      if (error) throw error;
      
      if (birthNumber) setIsBirthLocked(true);
      if (nidNumber) setIsNidLocked(true);
      
      setIsIdentityLocked(true);
      
      setProfileMessage('Profile updated successfully!');
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (err: any) {
      setProfileMessage('Error: ' + err.message);
    } finally {
      setIsSavingProfile(false);
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
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">Profile Settings</h2>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 sm:p-6">
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-3">
                <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-emerald-500/50 flex items-center justify-center overflow-hidden">
                  {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-slate-400">{(user?.email || 'U').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition-colors border-2 border-slate-900 shadow-sm">
                  <Upload className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-sm font-medium text-slate-400 mb-2">{user?.email}</p>
            </div>


            <div className="space-y-5">
              {profileMessage && (
                <div className={`p-3 rounded-lg text-sm text-center ${profileMessage.includes('Error') ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  {profileMessage}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Email Address (Read-Only)</label>
                <input type="email" value={user?.email || ''} readOnly className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-500 cursor-not-allowed focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Phone Number</label>
                <input type="text" placeholder="Enter full name" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors" />
                <input type="tel" placeholder="+8801..." value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors" />
              </div>

              {/* Identity Verification */}
              <div className="pt-6 border-t border-slate-800/50 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Identity Verification</h3></div>
              <div className="bg-slate-900 border-y sm:border sm:border-slate-800 sm:rounded-xl p-3 sm:p-6 mb-6 -mx-4 sm:mx-0">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 sm:p-4">
                  <div className="flex gap-2 sm:gap-3">
                    <ShieldAlert className="w-4 sm:w-5 h-4 sm:h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm text-red-200">
                      <p className="font-bold text-red-400 mb-2">CRITICAL WARNING</p>
                      <ul className="list-disc pl-3 sm:pl-4 space-y-2">
                        <li><strong>১৮ বছরের উপরে হলে NID এবং Birth Certificate উভয়ই বাধ্যতামূলক।</strong></li>
                        <li>১৮ বছরের নিচে হলে শুধুমাত্র Birth Certificate বাধ্যতামূলক।</li>
                        <li className="text-amber-400 mt-2 p-2 sm:p-2.5 bg-amber-500/10 border border-amber-500/20 rounded font-medium leading-relaxed">বয়স ১৮ বছরের বেশি হওয়া সত্ত্বেও তা গোপন করলে, অ্যাকাউন্টটি ভেরিফাই করা হবে না এবং নীতিমালা অনুযায়ী সাসপেন্ড করা হতে পারে।</li>
                        <li className="text-red-400 mt-2 p-2 sm:p-2.5 bg-red-500/10 border border-red-500/30 rounded font-bold animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)] leading-relaxed">একাধিক অ্যাকাউন্ট তৈরি বা কাস্টমারের সাথে প্রতারণা প্রমাণিত হলে, অ্যাকাউন্টটি স্থায়ীভাবে টার্মিনেট (Permanent Ban) করা হবে এবং আইনি ব্যবস্থা গ্রহণ করা হতে পারে। উপযুক্ত প্রমাণ সাপেক্ষে এবং নোটিশ প্রদানের মাধ্যমে এই সিদ্ধান্ত কার্যকর করা হবে।</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-4 sm:space-y-0 mb-6">
                  <label className={`flex items-center space-x-2 ${isIdentityLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} text-slate-300 font-bold bg-slate-950 px-4 py-3 rounded-lg border ${ageGroup === '18_plus' ? 'border-emerald-500' : 'border-slate-800'}`}>
                    <input type="radio" value="18_plus" checked={ageGroup === '18_plus'} onChange={(e) => setAgeGroup('18_plus')} disabled={isIdentityLocked} className="accent-emerald-500 w-4 h-4" />
                    <span>১৮ বছরের উপরে (18+)</span>
                  </label>
                  <label className={`flex items-center space-x-2 ${isIdentityLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} text-slate-300 font-bold bg-slate-950 px-4 py-3 rounded-lg border ${ageGroup === 'under_18' ? 'border-emerald-500' : 'border-slate-800'}`}>
                    <input type="radio" value="under_18" checked={ageGroup === 'under_18'} onChange={(e) => setAgeGroup('under_18')} disabled={isIdentityLocked} className="accent-emerald-500 w-4 h-4" />
                    <span>১৮ বছরের নিচে (Under 18)</span>
                  </label>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Birth Certificate Section */}
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-white font-medium mb-4 flex items-center gap-2 text-sm border-b border-slate-800 pb-2">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      Birth Certificate (Online Copy) <span className="text-red-400 text-xs ml-auto">*Mandatory</span>
                    </h4>
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-slate-400 mb-1">Birth Certificate Number</label>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Certificate Image</label>
                      <input type="text" placeholder="Enter number" value={birthNumber} onChange={(e) => setBirthNumber(e.target.value)} disabled={isBirthLocked} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" />
                      <div className={`aspect-[1/1.414] w-3/4 mx-auto flex flex-col items-center justify-center border-2 border-dashed border-slate-700 bg-slate-900/50 rounded-lg p-2 text-center transition-colors group relative overflow-hidden ${isBirthLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800/50'}`}>
                        {birthImage ? (
                          <img src={birthImage} alt="Birth Certificate" className="w-full h-full object-cover absolute inset-0" />
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-slate-500 mb-1 group-hover:text-emerald-400 transition-colors" />
                            <span className="text-[10px] text-slate-400 group-hover:text-slate-300">Upload Image</span>
                          </>
                        )}
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setBirthImage)} disabled={isBirthLocked} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed" />
                      </div>
                    </div>
                  </div>

                  {/* NID Section */}
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-white font-medium mb-4 flex items-start gap-2 border-b border-slate-800 pb-2">
                      <CreditCard className="w-4 h-4 text-blue-500 mt-0.5" />
                      <div>
                        <div className="text-sm">National ID</div>
                        <div className="text-sm">(NID)</div>
                      </div>
                      <span className={`text-xs ml-auto ${ageGroup === '18_plus' ? 'text-red-400' : 'text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded'}`}>
                        {ageGroup === '18_plus' ? '*Mandatory' : 'Upgrade if you get NID'}
                      </span>
                    </h4>
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-slate-400 mb-1">NID Number</label>
                      <input type="text" placeholder="Enter NID number" value={nidNumber} onChange={(e) => setNidNumber(e.target.value)} disabled={isNidLocked} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Front Side</label>
                        <div className={`aspect-video flex flex-col items-center justify-center border-2 border-dashed border-slate-700 bg-slate-900/50 rounded-lg p-2 text-center transition-colors group relative overflow-hidden ${isNidLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800/50'}`}>
                          {nidFrontImage ? (
                            <img src={nidFrontImage} alt="NID Front" className="w-full h-full object-cover absolute inset-0" />
                          ) : (
                            <>
                              <Upload className="w-4 h-4 text-slate-500 mb-1 group-hover:text-emerald-400 transition-colors" />
                              <span className="text-[10px] text-slate-400 group-hover:text-slate-300">Front Side</span>
                            </>
                          )}
                          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setNidFrontImage)} disabled={isNidLocked} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Back Side</label>
                        <div className={`aspect-video flex flex-col items-center justify-center border-2 border-dashed border-slate-700 bg-slate-900/50 rounded-lg p-2 text-center transition-colors group relative overflow-hidden ${isNidLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800/50'}`}>
                          {nidBackImage ? (
                            <img src={nidBackImage} alt="NID Back" className="w-full h-full object-cover absolute inset-0" />
                          ) : (
                            <>
                              <Upload className="w-4 h-4 text-slate-500 mb-1 group-hover:text-emerald-400 transition-colors" />
                              <span className="text-[10px] text-slate-400 group-hover:text-slate-300">Back Side</span>
                            </>
                          )}
                          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setNidBackImage)} disabled={isNidLocked} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Passport Size Face Image <span className="text-red-400 text-xs ml-2">*Mandatory</span></label>
                  <div className={`w-32 md:w-48 aspect-[3/4] flex flex-col items-center justify-center border-2 border-dashed border-slate-700 bg-slate-900/50 rounded-lg p-4 text-center transition-colors group relative overflow-hidden ${isIdentityLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800/50'}`}>
                    {faceImage ? (
                      <img src={faceImage} alt="Face" className="w-full h-full object-cover absolute inset-0" />
                    ) : (
                      <>
                        <ImageIcon className="w-6 h-6 text-slate-500 mb-2 group-hover:text-emerald-400 transition-colors" />
                        <span className="text-xs text-slate-400 group-hover:text-slate-300">Upload Face Image</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setFaceImage)} disabled={isIdentityLocked} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed" />
                  </div>
                </div>
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
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile'}
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
        </div>
      );
    }

    if (activeSubMenu === 'Service & Billing') {
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
            <h3 className="text-2xl font-bold text-white w-full text-left">Upgrade Plan</h3>
            <div className="inline-flex items-center p-1.5 bg-slate-900 border border-slate-800 rounded-xl relative w-full max-w-xs">
              <button 
                onClick={() => setIsYearly(false)}
                className={`relative z-10 w-1/2 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${!isYearly ? 'text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setIsYearly(true)}
                className={`relative z-10 w-1/2 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${isYearly ? 'text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Yearly
              </button>
              <div 
                className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-slate-700 rounded-lg transition-all duration-300 ease-out shadow-sm ${isYearly ? 'translate-x-[calc(100%-1px)]' : 'translate-x-1'}`}
              ></div>
              <div className="absolute -top-3 -right-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                Save 10%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan, idx) => (
              <div 
                key={idx} 
                className={`relative flex flex-col p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl group ${
                  plan.popular 
                    ? 'bg-slate-900/80 border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.15)] scale-[1.02] md:-translate-y-2' 
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    MOST POPULAR
                  </div>
                )}
                
                <div className="flex justify-between items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center shadow-inner">
                    {plan.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                </div>
                
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">৳{isYearly ? plan.yearlyPrice : plan.monthlyPrice}</span>
                  <span className="text-sm text-slate-400 font-medium">/{isYearly ? 'yr' : 'mo'}</span>
                </div>
                
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start text-sm text-slate-300">
                      <CheckCircle2 className={`w-5 h-5 mr-3 shrink-0 ${plan.popular ? 'text-indigo-400' : 'text-emerald-400'}`} />
                      <span className="leading-tight pt-0.5">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-900/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  {plan.name === 'Free Trial' ? 'Current Plan' : 'Select Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    if (activeSubMenu === 'Gateway Settings') {
      return <GatewaySettings brands={brands} />;
    }

    if (activeSubMenu === 'Payment Links') {
      return <PaymentLinks brands={brands} />;
    }

    if (activeSubMenu === 'Invoices') {
      return <Invoices brands={brands} />;
    }

    if (activeSubMenu === 'Plugins & Apps') {
      const apkDownloadUrl = "https://github.com/robiulontherise-ux/mecopay.apk/raw/refs/heads/main/app-release.apk";
      const pluginDownloadUrl = "https://github.com/robiulontherise-ux/mecopay-woocomerce-plugin.php/raw/refs/heads/main/mecopay_woocommerce_plugin.zip";
      const videoGuideUrl = "#"; // Replace with actual URL later
      
      const userId = user?.id || "USER_ID";
      const displayHmac = hmacSecret || "HMAC_SECRET";

      return (
        <div className="max-w-4xl space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Smartphone className="w-7 h-7 text-emerald-400" />
                Apps & Plugins
              </h2>
              <p className="text-sm text-slate-400">অ্যান্ড্রয়েড অ্যাপ ও ওয়ার্ডপ্রেস প্লাগইন ডাউনলোড এবং সেটআপ গাইড।</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plugin Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    WooCommerce
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Plug className="w-5 h-5 text-blue-400" /> WordPress Plugin
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  আপনার ওয়ার্ডপ্রেস সাইটে পেমেন্ট গেটওয়ে যুক্ত করতে এই প্লাগইনটি ডাউনলোড করুন। <br/><br/>
                  <strong className="text-emerald-400">Documentation Docs</strong>-এ প্লাগইনের কয়েক ক্লিকে সেটআপ করার গাইড দেখুন।
                </p>
              </div>
              <div className="pt-2 space-y-3">
                <a href={pluginDownloadUrl} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm">
                  <Download className="w-4 h-4" /> Download Plugin (.zip)
                </a>
                <a href={videoGuideUrl} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 text-sm">
                  <Video className="w-4 h-4" /> Plugin Setup Guide Video
                </a>
              </div>
            </div>

            {/* App Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Android App
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-400" /> MecoPay Sync App
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  আপনার মোবাইল থেকে পেমেন্ট ভেরিফাই করতে অ্যাপটি ডাউনলোড করুন। নিচের সেটআপ গাইড অনুযায়ী অ্যাপ কনফিগার করুন।
                </p>
              </div>
              <div className="pt-2 space-y-3">
                <a href={apkDownloadUrl} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm">
                  <Download className="w-4 h-4" /> Download App (APK)
                </a>
                <a href={videoGuideUrl} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 text-sm">
                  <Video className="w-4 h-4" /> App Setup Guide Video
                </a>
              </div>
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
                    Heartbeat WebSocket URL (Realtime + Edge Functions)
                  </label>
                  <span className="text-[11px] text-emerald-400 font-mono">channel={forwarderSettings.ws_channel }</span>
                </div>
                
                <div className="space-y-3 mb-4">
                  {customDevices.length === 0 ? (
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 text-center text-slate-400 text-sm">
                      No devices added yet. Enter a phone name below to generate a Heartbeat URL and save to database.
                    </div>
                  ) : (
                    customDevices.map((device, idx) => {
                      const hostUrl = forwarderSettings.project_url ;
                      const anonKey = forwarderSettings.anon_key ;
                      const channel = forwarderSettings.ws_channel ;
                      const edgeUrl = forwarderSettings.heartbeat_edge_url ;
                      const wsHeartbeatUrl = `wss://${hostUrl}/realtime/v1/websocket?apikey=${anonKey}&vsn=1.0.0&channel=${channel}&user_id=${userId}&secret=${displayHmac}&device_id=${encodeURIComponent(device)}&edge_url=${edgeUrl}`;

                      return (
                        <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-purple-500/30 flex items-center justify-between gap-3 group relative">
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-purple-400">Device: {device}</span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300">WebSocket</span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300">Synced to DB</span>
                            </div>
                            <div className="text-emerald-400 font-mono text-xs md:text-sm break-all">{wsHeartbeatUrl}</div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleCopy(wsHeartbeatUrl, `heartbeat-${idx}`)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors shrink-0 flex items-center gap-1.5">
                              {copiedField === `heartbeat-${idx}` ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span className="text-xs text-emerald-400 font-bold">Copied!</span></> : <><Copy className="w-3.5 h-3.5" /><span className="text-xs font-medium">Copy</span></>}
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

                <div className="flex gap-2 mb-3">
                  <input 
                    type="text" 
                    placeholder="Enter New Phone Name (e.g. Samsung S23, vivo15s)" 
                    value={newDeviceInput}
                    onChange={(e) => setNewDeviceInput(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        await handleAddDevice();
                      }
                    }}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                  <button 
                    onClick={handleAddDevice}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Add Device
                  </button>
                </div>
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

    
    if (activeSubMenu === 'Developer Docs') {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Book className="w-5 h-5 text-blue-400" /> Developer Documentation</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-semibold text-slate-200 mb-2">1. WordPress Plugin Integration</h4>
                <p className="text-sm text-slate-400">If you are using WordPress/WooCommerce, simply download our official MecoPay Plugin from the <strong>Apps / Plugin</strong> section. Install it on your site and paste your Brand API Key in the plugin settings. After that, you will receive a Payload URL from the plugin. Copy and paste it into our website's Webhook Settings by selecting your brand. You will then receive a Secret Key—paste that back into your plugin settings, and you're done!</p>
              </div>
              <div className="border-t border-slate-800 pt-6">
                <h4 className="text-md font-semibold text-slate-200 mb-2">2. Custom Website Integration (REST API)</h4>
                <p className="text-sm text-slate-400 mb-4">For custom-coded websites (PHP, Node.js, Python, React, etc.), your developer needs to call our Checkout Edge Function to initiate a payment.</p>
                
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 mb-4">
                  <p className="text-xs font-mono text-blue-400 mb-2">POST https://fwonuakvherzofqximno.supabase.co/functions/v1/check-out</p>
                  <div className="text-xs text-slate-300 font-mono whitespace-pre-wrap overflow-x-auto">
{`// Example Node.js Request
const response = await fetch("https://fwonuakvherzofqximno.supabase.co/functions/v1/check-out", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY" // Pass your brand API Key here
  },
  body: JSON.stringify({
    amount: 1500,
    customer_name: "John Doe",
    customer_phone: "017XXXXXXXX",
    redirect_url: "https://yourwebsite.com/success"
  })
});

const data = await response.json();
// Redirect the user to data.checkout_url`}
                  </div>
                </div>
                
                <p className="text-sm text-slate-400">Our system will handle the UI, routing, and payment verification. Once the payment is successful, the user will be redirected back to your provided <code>redirect_url</code>.</p>
              </div>
              <div className="border-t border-slate-800 pt-6">
                <h4 className="text-md font-semibold text-slate-200 mb-2">3. Verifying Payments via API (Optional)</h4>
                <p className="text-sm text-slate-400 mb-4">If you need to verify a payment status server-side, you can call the verify-payment Edge Function with the Transaction ID (TrxID) or Invoice ID.</p>
                
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <p className="text-xs font-mono text-emerald-400 mb-2">POST https://fwonuakvherzofqximno.supabase.co/functions/v1/verify-payment</p>
                  <div className="text-xs text-slate-300 font-mono whitespace-pre-wrap overflow-x-auto">
{`// Example Request
const response = await fetch("https://fwonuakvherzofqximno.supabase.co/functions/v1/verify-payment", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
  },
  body: JSON.stringify({
    invoice_id: "INV-XXXXXXX", // or trx_id: "9J2K1L9M"
  })
});`}
                  </div>
                </div>
              </div>
            </div>
          </div>


        </div>
      );
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
                    const selectedBrand = brands.find(b => b.id === selectedBrandId || b.id === Number(selectedBrandId));
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
                          navigator.clipboard.writeText(webhookForm.webhook_secret);
                          showToast("Copied!", "success");
                        }
                      }}
                      className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Copy Secret"
                      disabled={!webhookForm.webhook_secret}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all shadow-md flex items-center gap-2 text-sm font-medium">
                  <Plus className="w-4 h-4" /> Save Endpoint
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
                    webhooks.map((wh, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-white">{wh.brand_name}</td>
                        <td className="px-6 py-4 text-sm text-slate-300 truncate max-w-xs">{wh.payload_url}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                            <MoreVertical className="w-4 h-4" />
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

    if (activeSubMenu === 'Website Builder') {
      return (
        <div className="w-full">
          <WebsiteBuilderHub user={user} />
        </div>
      );
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
          
          {adminWarning && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-sm flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold">Missing Backend Configuration</p>
                <p>{adminWarning}</p>
                <p className="mt-1 text-xs opacity-80">To see live Google Auth users and actually block them, you must add <code>SUPABASE_SERVICE_ROLE_KEY</code> in the AI Studio Secrets panel.</p>
              </div>
            </div>
          )}
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-950/50 border-b border-slate-800">
                    <th className="p-4 text-sm font-bold text-slate-300">Client Info</th>
                    <th className="p-4 text-sm font-bold text-slate-300">Client ID</th>
                    <th className="p-4 text-sm font-bold text-slate-300">Auth Provider</th>
                    <th className="p-4 text-sm font-bold text-slate-300">Verification</th>
                    <th className="p-4 text-sm font-bold text-slate-300">Joined</th>
                    <th className="p-4 text-sm font-bold text-slate-300">Status</th>
                    <th className="p-4 text-sm font-bold text-slate-300 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 text-sm">
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
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700">
                          <Globe className="w-3 h-3 text-blue-400" /> {client.provider}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${client.verification.includes('Verified') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                          {client.verification.includes('Verified') ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                          {client.verification}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-400">{client.joined}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${client.status === 'Active' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
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
      const handleSaveForwarderSettings = async () => {
        setIsSavingForwarderSettings(true);
        try {
          // 1. Save to Node server /api/system-settings (persists immediately to system-settings.json and active server memory)
          try {
            await fetch('/api/system-settings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...forwarderSettings, user_id: user?.id })
            });
          } catch (apiErr) {
            console.warn('Failed to save to /api/system-settings', apiErr);
          }

          // 2. Direct upsert global config row into Supabase sms_forwarder_settings
          let dbSynced = false;
          let dbErrorMsg = '';

          try {
            const { error: upsertErr } = await supabase.from('sms_forwarder_settings').upsert({
              user_id: user?.id,
              device_name: '__GLOBAL_CONFIG__',
              sender_number: forwarderSettings.sender_number,
              text_filter: forwarderSettings.text_filter,
              webhook_edge_url: forwarderSettings.webhook_edge_url,
              headers: forwarderSettings.headers,
              json_payload_template: forwarderSettings.json_payload_template,
              project_url: forwarderSettings.project_url,
              anon_key: forwarderSettings.anon_key,
              ws_channel: forwarderSettings.ws_channel,
              heartbeat_edge_url: forwarderSettings.heartbeat_edge_url,
              dashboard_url: forwarderSettings.dashboard_url,
              webhook_url: `${forwarderSettings.webhook_edge_url}?user_id=${user?.id}`,
              heartbeat_ws_url: `wss://${forwarderSettings.project_url}/realtime/v1/websocket?apikey=${forwarderSettings.anon_key}&vsn=1.0.0&channel=${forwarderSettings.ws_channel}&user_id=${user?.id}&secret=${hmacSecret || 'GLOBAL_SECRET'}&device_id=Global&edge_url=${forwarderSettings.heartbeat_edge_url}`,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,device_name' });

            if (upsertErr) {
              console.error('Supabase upsert error:', upsertErr);
              dbErrorMsg = upsertErr.message || 'Permission denied';
            } else {
              dbSynced = true;
              try {
                const res = await fetch('/api/admin/sync-devices', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ settings: forwarderSettings })
                });
                const data = await res.json();
                if (data.success) {
                  showToast(`Synced ${data.count} client devices with new settings!`, 'success');
                }
              } catch (syncErr) {
                console.error("Failed to sync client devices:", syncErr);
              }
            }
          } catch (dbErr: any) {
            console.warn('Supabase update exception:', dbErr);
            dbErrorMsg = dbErr.message || '';
          }

          if (dbSynced) {
            showToast('Global settings saved and synced to live server & Supabase table!', 'success');
          } else if (dbErrorMsg) {
            showToast('Saved to Live App Server! (Run SQL below to grant Supabase permissions)', 'success');
          } else {
            showToast('Global settings saved successfully!', 'success');
          }
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
                  Live Auto-Recompose
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mt-2 flex items-center gap-2">
                <Settings className="w-6 h-6 text-purple-400" />
                SMS Forwarder Settings
              </h2>
              <p className="text-sm text-slate-400">
                অ্যাডমিন এখান থেকে যে ডেটা আপডেট করবেন, তা স্বয়ংক্রিয়ভাবে SQL দ্বারা সমস্ত ইউজারের ডিভাইসের জন্য Webhook ও WebSocket লিংকে যুক্ত হয়ে যাবে।
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
                  <CheckCircle2 className="w-4 h-4" /> Save & Sync All Devices
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
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

                {/* 8. Heartbeat Edge URL */}
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    8. Heartbeat Edge Function URL
                  </label>
                  <input
                    type="text"
                    value={forwarderSettings.heartbeat_edge_url}
                    onChange={(e) => setForwarderSettings({ ...forwarderSettings, heartbeat_edge_url: e.target.value })}
                    placeholder="https://fwonuakvherzofqximno.supabase.co/functions/v1/heart-beat"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-emerald-400 font-mono text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    হার্টবিট এজ ফাংশন লিংক। যা WebSocket URL এর শেষে &edge_url= হিসেবে থাকবে।
                  </span>
                </div>
                {/* 9. Dashboard URL */}
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    9. Dashboard URL
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

  const handleTabChange = (tab: 'brand' | 'payments' | 'site' | 'admin') => {
    if (!isIdentityLocked && tab !== 'brand' && tab !== 'admin') {
      showToast("Complete Identity Verification first!", "error");
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
          
          <div className="flex items-center gap-4">
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
                : !isIdentityLocked
                  ? 'bg-slate-900/50 text-slate-600 border border-slate-800/50 cursor-not-allowed'
                  : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            Payments Hub
            {!isIdentityLocked && <Lock className="w-3.5 h-3.5 text-red-500" />}
          </button>

          <button
            onClick={() => handleTabChange('site')}
            className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'site' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : !isIdentityLocked
                  ? 'bg-slate-900/50 text-slate-600 border border-slate-800/50 cursor-not-allowed'
                  : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            My Site
            {!isIdentityLocked && <Lock className="w-3.5 h-3.5 text-red-500" />}
          </button>

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
                    <p className="text-sm font-bold text-white truncate">{user?.user_metadata?.full_name || 'My Profile'}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
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
                    if (!isIdentityLocked && item !== 'Profile') {
                      showToast("Complete Identity Verification first!", "error");
                      return;
                    }
                    setActiveSubMenu(item);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                    isSubActive
                      ? 'text-emerald-400 bg-emerald-500/10 font-bold'
                      : !isIdentityLocked && item !== 'Profile'
                        ? 'text-slate-600 cursor-not-allowed opacity-50'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {item}
                    {!isIdentityLocked && item !== 'Profile' && <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />}
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
                      <input type="tel" placeholder="+8801XXXXXXXXX" className="w-full bg-[#242d42] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">WhatsApp Number</label>
                      <input type="text" placeholder="+8801XXXXXXXXX" className="w-full bg-[#242d42] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={brandForm.merchant_api} 
                        onChange={(e) => setBrandForm({...brandForm, merchant_api: e.target.checked})}
                        className="peer hidden" 
                      />
                      <div className="p-4 rounded-xl border-2 border-slate-700 bg-[#242d42] peer-checked:border-emerald-500 peer-checked:bg-emerald-500/10 transition-all">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 rounded-md border-2 border-slate-500 peer-checked:border-emerald-500 peer-checked:bg-emerald-500 flex items-center justify-center transition-all">
                             <CheckCircle2 className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" />
                          </div>
                          <span className="font-bold text-white text-sm">Official Merchant API</span>
                        </div>
                        <p className="text-xs text-slate-400 ml-7">Direct bKash/Nagad PGW. Auto-creates Official Merchant Key.</p>
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={brandForm.personal_api} 
                        onChange={(e) => setBrandForm({...brandForm, personal_api: e.target.checked})}
                        className="peer hidden" 
                      />
                      <div className="p-4 rounded-xl border-2 border-slate-700 bg-[#242d42] peer-checked:border-purple-500 peer-checked:bg-purple-500/10 transition-all">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 rounded-md border-2 border-slate-500 peer-checked:border-purple-500 peer-checked:bg-purple-500 flex items-center justify-center transition-all">
                             <CheckCircle2 className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" />
                          </div>
                          <span className="font-bold text-white text-sm">Personal SMS API</span>
                        </div>
                        <p className="text-xs text-slate-400 ml-7">Android SMS Forwarding. Auto-creates Personal API Key.</p>
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