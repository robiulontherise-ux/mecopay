const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

// 1. Replace the state variables
const oldStates = `  const [profilePhone, setProfilePhone] = useState<string>('+8801');
  const [identityType, setIdentityType] = useState<'nid' | 'birth_cert'>('nid');
  const [identityNumber, setIdentityNumber] = useState<string>('');
  const [faceImage, setFaceImage] = useState<string>('');
  const [docFrontImage, setDocFrontImage] = useState<string>('');
  const [docBackImage, setDocBackImage] = useState<string>('');
  const [websiteUrl, setWebsiteUrl] = useState<string>('');`;

const newStates = `  const [profilePhone, setProfilePhone] = useState<string>('+8801');
  const [ageGroup, setAgeGroup] = useState<'18_plus' | 'under_18'>('18_plus');
  const [nidNumber, setNidNumber] = useState<string>('');
  const [nidFrontImage, setNidFrontImage] = useState<string>('');
  const [nidBackImage, setNidBackImage] = useState<string>('');
  const [birthNumber, setBirthNumber] = useState<string>('');
  const [birthImage, setBirthImage] = useState<string>('');
  const [faceImage, setFaceImage] = useState<string>('');
  const [isBirthLocked, setIsBirthLocked] = useState(false);
  const [isNidLocked, setIsNidLocked] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState<string>('');`;
code = code.replace(oldStates, newStates);

// 2. Loading state from user
const oldLoad = `      setProfilePhone(user.user_metadata?.phone || '+8801');
      setIdentityType(user.user_metadata?.identity_type || 'nid');
      setIdentityNumber(user.user_metadata?.identity_number || '');
      setFaceImage(user.user_metadata?.face_image || '');
      setDocFrontImage(user.user_metadata?.doc_front_image || '');
      setDocBackImage(user.user_metadata?.doc_back_image || '');
      setWebsiteUrl(user.user_metadata?.website_url || '');
      setSocialFb(user.user_metadata?.social_fb || '');
      setSocialInsta(user.user_metadata?.social_insta || '');
      setSocialLi(user.user_metadata?.social_li || '');
      setSocialYt(user.user_metadata?.social_yt || '');
      setIsIdentityLocked(!!user.user_metadata?.identity_number);`;

const newLoad = `      setProfilePhone(user.user_metadata?.phone || '+8801');
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
      
      // Determine overall platform lock status
      if (user.user_metadata?.age_group === 'under_18') {
        setIsIdentityLocked(hasBirth);
      } else {
        setIsIdentityLocked(hasBirth && hasNid);
      }
      
      // Handle legacy users
      if (!user.user_metadata?.age_group && user.user_metadata?.identity_number) {
         setIsIdentityLocked(true);
      }`;
code = code.replace(oldLoad, newLoad);

// 3. Reset state
const oldReset = `      setProfileName('');
      setProfilePhone('');
      setIdentityType('nid');
      setIdentityNumber('');
      setFaceImage('');
      setDocFrontImage('');
      setDocBackImage('');
      setWebsiteUrl('');
      setSocialFb('');
      setSocialInsta('');
      setSocialLi('');
      setSocialYt('');
      setIsIdentityLocked(false);`;

const newReset = `      setProfileName('');
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
      setIsNidLocked(false);`;
code = code.replace(oldReset, newReset);

// 4. Save Logic
const oldSave = `  const handleSaveProfile = async () => {
    if (!isIdentityLocked) {
      if (!identityNumber || !faceImage || !docFrontImage || (identityType === 'nid' && !docBackImage)) {
        alert("Please provide all required Identity Verification details (Number and Images) to unlock the platform.");
        return;
      }
    }
    
    setIsSavingProfile(true);
    setProfileMessage('');

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { 
          full_name: profileName, 
          phone: profilePhone,
          identity_type: identityType,
          identity_number: identityNumber,
          face_image: faceImage,
          doc_front_image: docFrontImage,
          doc_back_image: docBackImage,
          website_url: websiteUrl,
          social_fb: socialFb,
          social_insta: socialInsta,
          social_li: socialLi,
          social_yt: socialYt
        }
      });

      if (error) throw error;
      
      if (identityNumber) setIsIdentityLocked(true);`;

const newSave = `  const handleSaveProfile = async () => {
    if (!isIdentityLocked) {
      if (!faceImage) {
        alert("Please provide a Face Image.");
        return;
      }
      if (ageGroup === '18_plus') {
        if (!nidNumber || !nidFrontImage || !nidBackImage || !birthNumber || !birthImage) {
          alert("১৮ বছরের উপরে হলে NID এবং Birth Certificate উভয়ের তথ্য ও ছবি প্রদান বাধ্যতামূলক। সব ফিল্ড পূরণ করুন।");
          return;
        }
      } else {
        if (!birthNumber || !birthImage) {
          alert("১৮ বছরের নিচে হলে Birth Certificate এর তথ্য ও ছবি প্রদান বাধ্যতামূলক।");
          return;
        }
      }
    }
    
    setIsSavingProfile(true);
    setProfileMessage('');

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { 
          full_name: profileName, 
          phone: profilePhone,
          age_group: ageGroup,
          nid_number: nidNumber,
          nid_front_image: nidFrontImage,
          nid_back_image: nidBackImage,
          birth_number: birthNumber,
          birth_image: birthImage,
          face_image: faceImage,
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
      if (ageGroup === 'under_18' && birthNumber) {
        setIsIdentityLocked(true);
      } else if (ageGroup === '18_plus' && birthNumber && nidNumber) {
        setIsIdentityLocked(true);
      }`;
code = code.replace(oldSave, newSave);

fs.writeFileSync('src/components/DashboardShell.tsx', code);
