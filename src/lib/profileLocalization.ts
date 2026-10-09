export type ProfileLanguage = 'en' | 'bn' | 'hi' | 'ar' | 'fr' | 'es' | 'pt';

type ProfileCopy = {
  subtitle: string;
  rejectedTitle: string;
  adminNote: string;
  rejectedReason: string;
  pendingTitle: string;
  pendingBody: string;
  pendingStrong: string;
  pendingTail: string;
  unlockTitle: string;
  unlockBody: string;
  verifiedMerchant: string;
  underReview: string;
  rejected: string;
  unverified: string;
  fullNamePlaceholder: string;
  contactNumber: string;
  chooseContact: string;
  both: string;
  whatsappPlaceholder: string;
  telegramPlaceholder: string;
  phonePlaceholder: string;
  contactNote: string;
  identityVerification: string;
  birthCertificate: string;
  nidCard: string;
  birthNumber: string;
  birthPlaceholder: string;
  nidNumber: string;
  nidPlaceholder: string;
  front: string;
  back: string;
  liveSelfie: string;
  liveCameraOnly: string;
  selfieInstruction: string;
  noSelfie: string;
  retakeSelfie: string;
  takeSelfie: string;
  selfieWarning: string;
  selfieTip: string;
  saveUpdating: string;
  updateLinks: string;
  cameraSuccess: string;
  errorPrefix: string;
  criticalWarning: string;
  rules: string[];
  age18: string;
  under18: string;
  zoom: string;
  notUploaded: string;
  uploadGallery: string;
  uploadDevice: string;
};

const bn: ProfileCopy = {
  subtitle: 'ব্যবসায়িক প্রোফাইল ও নিরাপত্তা ভেরিফিকেশন পরিচালনা করুন',
  rejectedTitle: 'পূর্বের ভেরিফিকেশন আবেদন বাতিল করা হয়েছিল',
  adminNote: 'অ্যাডমিন নোট:',
  rejectedReason: 'তথ্য বা ছবিতে অসঙ্গতি ছিল। অনুগ্রহ করে লাইভ ক্যামেরা দিয়ে স্পষ্ট ছবি তুলে পুনরায় সাবমিট করুন।',
  pendingTitle: 'পরিচয়পত্র পর্যালোচনায় রয়েছে (Under Review) — ড্যাশবোর্ড আনলক করা হয়েছে',
  pendingBody: 'আপনার জমা দেওয়া তথ্য ও ছবি সফলভাবে গৃহীত হয়েছে এবং ২৪ ঘণ্টার মধ্যে অ্যাডমিন প্যানেল থেকে সরকারি রেকর্ডের সঙ্গে মিলিয়ে ভেরিফাই করা হবে।',
  pendingStrong: 'ইতিমধ্যে আপনার ড্যাশবোর্ডের সকল ফিচার ব্যবহারের জন্য সম্পূর্ণ আনলক করে দেওয়া হয়েছে।',
  pendingTail: 'কোনো তথ্য ভুল বা অসত্য পাওয়া গেলে অ্যাডমিন অ্যাকাউন্ট ব্লক করার অধিকার সংরক্ষণ করে।',
  unlockTitle: 'ড্যাশবোর্ড সম্পূর্ণ আনলক করতে নিচের তথ্য ও পরিচয়পত্র দিন',
  unlockBody: 'নিচের তথ্য, NID বা জন্মনিবন্ধন সনদ এবং লাইভ ফেস সেলফি পূরণ করে "Save Profile & Documents" বাটনে ক্লিক করলেই আপনার ড্যাশবোর্ডের সব ফিচার ব্যবহারের জন্য সাথে সাথে আনলক হয়ে যাবে। এরপর অ্যাডমিন ২৪ ঘণ্টার মধ্যে আপনার তথ্য সরকারি রেকর্ডের সাথে যাচাই করে চূড়ান্ত অনুমোদন প্রদান করবে।',
  verifiedMerchant: 'আইডি ভেরিফাইড মার্চেন্ট (Verified)', underReview: 'ভেরিফিকেশন পর্যালোচনায় (ড্যাশবোর্ড আনলক)', rejected: 'ভেরিফিকেশন প্রত্যাখ্যাত (Action Needed)', unverified: 'আন-ভেরিফাইড প্রোফাইল',
  fullNamePlaceholder: 'আপনার পূর্ণ নাম লিখুন', contactNumber: 'যোগাযোগের নম্বর', chooseContact: 'টিক দিয়ে মাধ্যম বেছে নিন:', both: 'উভয়টি',
  whatsappPlaceholder: 'e.g. +1... / +44... / +880... (দেশের কোডসহ WhatsApp নম্বর)', telegramPlaceholder: 'e.g. +1... / +880... বা @username (Telegram নম্বর বা ইউজারনেম)', phonePlaceholder: 'e.g. +1... / +44... / +880... (দেশের কোডসহ নম্বর)', contactNote: 'জরুরি নোটিফিকেশন ও যোগাযোগের জন্য নির্বাচিত মাধ্যমে সচল নম্বর দিন।',
  identityVerification: 'Identity Verification (পরিচয়পত্র যাচাই)', birthCertificate: 'Birth Certificate (জন্মনিবন্ধন)', nidCard: 'National ID (NID কার্ড)', birthNumber: 'Birth Certificate Number (ইউনিক)', birthPlaceholder: 'জন্মনিবন্ধন নম্বর লিখুন', nidNumber: 'NID Number (ইউনিক)', nidPlaceholder: 'NID নম্বর লিখুন', front: 'সম্মুখভাগ (Front)', back: 'পেছনের ভাগ (Back)',
  liveSelfie: 'লাইভ ফেস সেলফি ফটো (Passport Size)', liveCameraOnly: 'লাইভ ক্যামেরা অনলি', selfieInstruction: 'ক্যামেরার মুখোমুখি হয়ে পরিষ্কার আলোতে একটি লাইভ সেলফি তুলুন।', noSelfie: 'সেলফি নেই', retakeSelfie: 'লাইভ সেলফি পুনরায় তুলুন', takeSelfie: '📸 লাইভ ফ্রন্ট ক্যামেরা দিয়ে সেলফি তুলুন', selfieWarning: '⚠️ জালিয়াতি প্রতিরোধে ফেস সেলফি শুধুমাত্র লাইভ ক্যামেরা দিয়ে নেওয়া হবে (গ্যালারি আপলোড বন্ধ)।', selfieTip: 'ছবি তোলার সময় চশমা বা মাস্ক পরিহার করুন এবং পর্যাপ্ত আলো নিশ্চিত করুন।', saveUpdating: 'সংরক্ষণ ও আপডেট হচ্ছে...', updateLinks: 'তথ্য ও সোশ্যাল লিঙ্ক আপডেট করুন', cameraSuccess: 'লাইভ ক্যামেরা দিয়ে ছবি সফলভাবে নেওয়া হয়েছে!', errorPrefix: 'ত্রুটি:', criticalWarning: 'গুরুত্বপূর্ণ সতর্কতা ও নির্দেশনা', rules: ['১৮ বছর বা তার বেশি হলে শুধু Birth Certificate দিয়ে অনুমোদন হবে না; NID ও Birth Certificate দুটিই বাধ্যতামূলক।', '১৮ বছরের নিচে হলে শুধুমাত্র Birth Certificate ও লাইভ ফেস সেলফি বাধ্যতামূলক।', 'জন্মনিবন্ধনে জন্মসাল ২০১০ বা তার আগের হতে হবে।', 'NID-তে থাকা জন্মতারিখ অনুযায়ী বয়স সর্বোচ্চ ৪০ বছর হতে হবে; ৪০ বছরের বেশি হলে অ্যাকাউন্ট যাচাই হবে না।', 'জমা দেওয়া তথ্য ও সনদ সরকারি অনলাইন যাচাই ব্যবস্থায় উপলভ্য রেকর্ডের সঙ্গে মিলিয়ে দেখা হবে। তথ্য ভুল হলে, ছবি অস্পষ্ট/পরিবর্তিত হলে বা সরকারি রেকর্ডের সঙ্গে অমিল থাকলে অ্যাকাউন্ট যাচাই বা অনুমোদন করা হবে না।', 'একটি NID বা জন্মনিবন্ধন দিয়ে কেবল একটি অ্যাকাউন্টই অনুমোদন পাবে। ডুপ্লিকেট অ্যাকাউন্ট নিষিদ্ধ।'], age18: '১৮ বছরের উপরে (18+)', under18: '১৮ বছরের নিচে (Under 18)', zoom: 'বড় করে দেখুন', notUploaded: 'ছবি এখনো আপলোড হয়নি', uploadGallery: 'ফাইল / গ্যালারি থেকে আপলোড', uploadDevice: 'ডিভাইস থেকে ছবি আপলোড'
};

const en: ProfileCopy = {
  subtitle: 'Manage your business profile and security verification', rejectedTitle: 'Previous verification application was rejected', adminNote: 'Admin note:', rejectedReason: 'There was an inconsistency in the information or images. Please take a clear photo with the live camera and resubmit.', pendingTitle: 'Identity documents are under review — dashboard unlocked', pendingBody: 'Your submitted information and images were received successfully and will be verified against government records by the admin panel within 24 hours.', pendingStrong: 'Your dashboard has already been fully unlocked so you can use all features.', pendingTail: 'The admin reserves the right to block an account if any information is found to be false or inaccurate.', unlockTitle: 'Provide the information and identity documents below to fully unlock your dashboard', unlockBody: 'Complete the information below, NID or birth certificate, and live face selfie, then click "Save Profile & Documents" to unlock all dashboard features immediately. The admin will verify your information against government records and provide final approval within 24 hours.', verifiedMerchant: 'Verified Merchant', underReview: 'Verification Under Review (Dashboard Unlocked)', rejected: 'Verification Rejected (Action Needed)', unverified: 'Unverified Profile', fullNamePlaceholder: 'Enter your full name', contactNumber: 'Contact number', chooseContact: 'Select a contact method:', both: 'Both', whatsappPlaceholder: 'e.g. +1... / +44... / +880... (WhatsApp number with country code)', telegramPlaceholder: 'e.g. +1... / +880... or @username (Telegram number or username)', phonePlaceholder: 'e.g. +1... / +44... / +880... (number with country code)', contactNote: 'Provide an active number through the selected method for urgent notifications and communication.', identityVerification: 'Identity Verification', birthCertificate: 'Birth Certificate', nidCard: 'National ID (NID card)', birthNumber: 'Birth Certificate Number (Unique)', birthPlaceholder: 'Enter birth certificate number', nidNumber: 'NID Number (Unique)', nidPlaceholder: 'Enter NID number', front: 'Front', back: 'Back', liveSelfie: 'Live Face Selfie Photo (Passport Size)', liveCameraOnly: 'Live Camera Only', selfieInstruction: 'Face the camera and take a live selfie in clear lighting.', noSelfie: 'No selfie', retakeSelfie: 'Retake live selfie', takeSelfie: '📸 Take a selfie with the live front camera', selfieWarning: '⚠️ To prevent fraud, the face selfie must be taken with the live camera only (gallery upload disabled).', selfieTip: 'Avoid wearing glasses or a mask while taking the photo and ensure sufficient lighting.', saveUpdating: 'Saving and updating...', updateLinks: 'Update information and social links', cameraSuccess: 'Photo captured successfully with the live camera!', errorPrefix: 'Error:', criticalWarning: 'CRITICAL WARNING & GUIDELINES', rules: ['Applicants aged 18 or above must provide both NID and Birth Certificate; a Birth Certificate alone is not sufficient.', 'Applicants under 18 must provide only a Birth Certificate and live face selfie.', 'The birth certificate must show a birth year of 2010 or earlier.', 'The age calculated from the NID date of birth must be no more than 40 years; accounts above 40 will not be verified.', 'Submitted information and certificates will be checked against available government online records. Incorrect information, unclear or altered images, or mismatches will not be approved.', 'Only one account may be approved per NID or birth certificate. Duplicate accounts are prohibited.'], age18: 'Above 18 (18+)', under18: 'Under 18', zoom: 'View larger', notUploaded: 'No image uploaded yet', uploadGallery: 'Upload from file / gallery', uploadDevice: 'Upload photo from device'
};

const hi: ProfileCopy = { ...en, subtitle: 'अपनी व्यावसायिक प्रोफ़ाइल और सुरक्षा सत्यापन प्रबंधित करें', rejectedTitle: 'पिछला सत्यापन आवेदन अस्वीकार कर दिया गया था', adminNote: 'एडमिन नोट:', pendingTitle: 'पहचान दस्तावेज़ समीक्षा में हैं — डैशबोर्ड अनलॉक है', pendingStrong: 'आपके डैशबोर्ड की सभी सुविधाएँ पहले ही अनलॉक कर दी गई हैं।', unlockTitle: 'डैशबोर्ड अनलॉक करने के लिए नीचे दी गई जानकारी और पहचान दस्तावेज़ दें', contactNumber: 'संपर्क नंबर', chooseContact: 'संपर्क माध्यम चुनें:', both: 'दोनों', contactNote: 'जरूरी सूचनाओं और संपर्क के लिए चुने गए माध्यम पर सक्रिय नंबर दें।', identityVerification: 'Identity Verification (पहचान सत्यापन)', liveCameraOnly: 'केवल लाइव कैमरा', noSelfie: 'सेल्फी नहीं', saveUpdating: 'सहेजा और अपडेट किया जा रहा है...' };
const ar: ProfileCopy = { ...en, subtitle: 'إدارة ملفك التجاري والتحقق الأمني', rejectedTitle: 'تم رفض طلب التحقق السابق', adminNote: 'ملاحظة المسؤول:', pendingTitle: 'مستندات الهوية قيد المراجعة — تم فتح لوحة التحكم', pendingStrong: 'تم فتح جميع ميزات لوحة التحكم الخاصة بك بالفعل.', unlockTitle: 'قدّم المعلومات ومستندات الهوية أدناه لفتح لوحة التحكم بالكامل', contactNumber: 'رقم التواصل', chooseContact: 'اختر وسيلة التواصل:', both: 'كلاهما', contactNote: 'أدخل رقمًا نشطًا للاتصالات والإشعارات العاجلة.', identityVerification: 'التحقق من الهوية', liveCameraOnly: 'الكاميرا المباشرة فقط', noSelfie: 'لا توجد صورة سيلفي', saveUpdating: 'جارٍ الحفظ والتحديث...' };
const fr: ProfileCopy = { ...en, subtitle: 'Gérez votre profil professionnel et la vérification de sécurité', rejectedTitle: 'La demande de vérification précédente a été rejetée', adminNote: 'Note de l’administrateur :', pendingTitle: 'Les documents d’identité sont en cours d’examen — tableau de bord déverrouillé', pendingStrong: 'Toutes les fonctionnalités de votre tableau de bord sont déjà déverrouillées.', unlockTitle: 'Fournissez les informations et documents d’identité ci-dessous pour déverrouiller votre tableau de bord', contactNumber: 'Numéro de contact', chooseContact: 'Choisissez un moyen de contact :', both: 'Les deux', contactNote: 'Indiquez un numéro actif pour les notifications urgentes et la communication.', identityVerification: 'Vérification d’identité', liveCameraOnly: 'Caméra en direct uniquement', noSelfie: 'Aucun selfie', saveUpdating: 'Enregistrement et mise à jour...' };
const es: ProfileCopy = { ...en, subtitle: 'Administra tu perfil empresarial y la verificación de seguridad', rejectedTitle: 'La solicitud de verificación anterior fue rechazada', adminNote: 'Nota del administrador:', pendingTitle: 'Los documentos de identidad están en revisión — panel desbloqueado', pendingStrong: 'Todas las funciones de tu panel ya están desbloqueadas.', unlockTitle: 'Proporciona la información y los documentos de identidad para desbloquear tu panel', contactNumber: 'Número de contacto', chooseContact: 'Selecciona un medio de contacto:', both: 'Ambos', contactNote: 'Proporciona un número activo para notificaciones urgentes y comunicación.', identityVerification: 'Verificación de identidad', liveCameraOnly: 'Solo cámara en vivo', noSelfie: 'No hay selfie', saveUpdating: 'Guardando y actualizando...' };
const pt: ProfileCopy = { ...en, subtitle: 'Gerencie seu perfil comercial e a verificação de segurança', rejectedTitle: 'A solicitação de verificação anterior foi rejeitada', adminNote: 'Nota do administrador:', pendingTitle: 'Os documentos de identidade estão em análise — painel desbloqueado', pendingStrong: 'Todos os recursos do seu painel já foram desbloqueados.', unlockTitle: 'Forneça as informações e os documentos de identidade abaixo para desbloquear seu painel', contactNumber: 'Número de contato', chooseContact: 'Selecione um meio de contato:', both: 'Ambos', contactNote: 'Forneça um número ativo para notificações urgentes e comunicação.', identityVerification: 'Verificação de identidade', liveCameraOnly: 'Apenas câmera ao vivo', noSelfie: 'Sem selfie', saveUpdating: 'Salvando e atualizando...' };

const copies: Record<string, ProfileCopy> = { en, bn, hi, ar, fr, es, pt };
export const getProfileCopy = (language: string): ProfileCopy => copies[language.toLowerCase().split('-')[0]] || en;
