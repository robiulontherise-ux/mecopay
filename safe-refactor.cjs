const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

function replaceBlock(startStr, endStr, newText) {
  const startIdx = code.indexOf(startStr);
  if (startIdx === -1) throw new Error("Start string not found: " + startStr.substring(0, 50));
  const endIdx = code.indexOf(endStr, startIdx);
  if (endIdx === -1) throw new Error("End string not found: " + endStr.substring(0, 50));
  
  const blockEnd = endIdx + endStr.length;
  code = code.substring(0, startIdx) + newText + code.substring(blockEnd);
}

// 1. States
const stateStart = "  const [identityType, setIdentityType] = useState<'nid' | 'birth_cert'>('nid');";
const stateEnd = "  const [websiteUrl, setWebsiteUrl] = useState<string>('');";
const newStates = `  const [ageGroup, setAgeGroup] = useState<'18_plus' | 'under_18'>('18_plus');
  const [nidNumber, setNidNumber] = useState<string>('');
  const [nidFrontImage, setNidFrontImage] = useState<string>('');
  const [nidBackImage, setNidBackImage] = useState<string>('');
  const [birthNumber, setBirthNumber] = useState<string>('');
  const [birthImage, setBirthImage] = useState<string>('');
  const [faceImage, setFaceImage] = useState<string>('');
  const [isBirthLocked, setIsBirthLocked] = useState(false);
  const [isNidLocked, setIsNidLocked] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState<string>('');`;
replaceBlock(stateStart, stateEnd, newStates);

// 2. Load
const loadStart = "      setIdentityType(user.user_metadata?.identity_type || 'nid');";
const loadEnd = "      setIsIdentityLocked(!!user.user_metadata?.identity_number);";
const newLoad = `      setAgeGroup(user.user_metadata?.age_group || '18_plus');
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
      
      if (user.user_metadata?.age_group === 'under_18') {
        setIsIdentityLocked(hasBirth);
      } else {
        setIsIdentityLocked(hasBirth && hasNid);
      }
      
      if (!user.user_metadata?.age_group && user.user_metadata?.identity_number) {
         setIsIdentityLocked(true);
      }`;
replaceBlock(loadStart, loadEnd, newLoad);

// 3. Reset
const resetStart = "      setIdentityType('nid');";
const resetEnd = "      setIsIdentityLocked(false);";
const newReset = `      setAgeGroup('18_plus');
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
replaceBlock(resetStart, resetEnd, newReset);

// 4. Save
const saveStart = "  const handleSaveProfile = async () => {";
const saveEnd = "      if (identityNumber) setIsIdentityLocked(true);";
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
replaceBlock(saveStart, saveEnd, newSave);

// 5. JSX
const jsxStart = "<h3 className=\"text-white font-medium mb-6 flex items-center gap-2\"><ShieldCheck className=\"w-5 h-5 text-emerald-500\" /> Identity Verification</h3>";
const jsxEnd = "              {/* Web & Social Profiles */}";
const newJsx = `<h3 className="text-white font-medium mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-500" /> Identity Verification</h3>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                  <div className="flex gap-3">
                    <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                    <div className="text-sm text-red-200">
                      <p className="font-bold text-red-400 mb-1">CRITICAL WARNING</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li><strong>১৮ বছরের উপরে হলে NID এবং Birth Certificate উভয়ই বাধ্যতামূলক।</strong></li>
                        <li>১৮ বছরের নিচে হলে শুধুমাত্র Birth Certificate বাধ্যতামূলক।</li>
                        <li className="text-amber-400 mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded font-medium">আপনার বয়স যদি ১৮ বছরের উপরে হয়, কিন্তু আপনি NID প্রদান এড়ানোর জন্য '১৮ বছরের নিচে' সিলেক্ট করেন, তবে আপনার অ্যাকাউন্ট ভেরিফাই হবে না এবং আমরা অ্যাকাউন্টটি ব্লক করে দেব।</li>
                        <li className="text-red-400 mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded font-bold animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]">একই আইডেন্টিটি দিয়ে একাধিকবার অ্যাকাউন্ট খোলার চেষ্টা করলে অথবা আমাদের প্ল্যাটফর্ম ব্যবহার করে কোনো কাস্টমারের কাছ থেকে অ্যাডভান্স পেমেন্ট নিয়ে প্রতারণা করলে, আপনার অ্যাকাউন্ট স্থায়ীভাবে ব্লক করে দেওয়া হবে এবং ভোক্তা অধিকার সংরক্ষণ আইন ও সাইবার নিরাপত্তা আইনে সরাসরি মামলা দায়ের করা হবে।</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-4 sm:space-y-0 mb-6">
                  <label className={\`flex items-center space-x-2 \${isIdentityLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} text-slate-300 font-bold bg-slate-950 px-4 py-3 rounded-lg border \${ageGroup === '18_plus' ? 'border-emerald-500' : 'border-slate-800'}\`}>
                    <input type="radio" value="18_plus" checked={ageGroup === '18_plus'} onChange={(e) => setAgeGroup('18_plus')} disabled={isIdentityLocked} className="accent-emerald-500 w-4 h-4" />
                    <span>১৮ বছরের উপরে (18+)</span>
                  </label>
                  <label className={\`flex items-center space-x-2 \${isIdentityLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} text-slate-300 font-bold bg-slate-950 px-4 py-3 rounded-lg border \${ageGroup === 'under_18' ? 'border-emerald-500' : 'border-slate-800'}\`}>
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
                      <input type="text" placeholder="Enter number" value={birthNumber} onChange={(e) => setBirthNumber(e.target.value)} disabled={isBirthLocked} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Certificate Image</label>
                      <div className={\`aspect-[1/1.414] w-3/4 mx-auto flex flex-col items-center justify-center border-2 border-dashed border-slate-700 bg-slate-900/50 rounded-lg p-2 text-center transition-colors group relative overflow-hidden \${isBirthLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800/50'}\`}>
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
                    <h4 className="text-white font-medium mb-4 flex items-center gap-2 text-sm border-b border-slate-800 pb-2">
                      <CreditCard className="w-4 h-4 text-blue-500" />
                      National ID (NID) 
                      <span className={\`text-xs ml-auto \${ageGroup === '18_plus' ? 'text-red-400' : 'text-slate-500'}\`}>
                        {ageGroup === '18_plus' ? '*Mandatory' : '(Optional)'}
                      </span>
                    </h4>
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-slate-400 mb-1">NID Number</label>
                      <input type="text" placeholder="Enter NID number" value={nidNumber} onChange={(e) => setNidNumber(e.target.value)} disabled={isNidLocked} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Front Side</label>
                        <div className={\`aspect-video flex flex-col items-center justify-center border-2 border-dashed border-slate-700 bg-slate-900/50 rounded-lg p-2 text-center transition-colors group relative overflow-hidden \${isNidLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800/50'}\`}>
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
                        <div className={\`aspect-video flex flex-col items-center justify-center border-2 border-dashed border-slate-700 bg-slate-900/50 rounded-lg p-2 text-center transition-colors group relative overflow-hidden \${isNidLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800/50'}\`}>
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
                  <div className={\`w-32 md:w-48 aspect-[3/4] flex flex-col items-center justify-center border-2 border-dashed border-slate-700 bg-slate-900/50 rounded-lg p-4 text-center transition-colors group relative overflow-hidden \${isIdentityLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800/50'}\`}>
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
              
              {/* Web & Social Profiles */}`;
// Using a regex to match from `<h3` up to `// Web & Social Profiles`? No, let's just replaceBlock
replaceBlock(jsxStart, jsxEnd, newJsx);

fs.writeFileSync('src/components/DashboardShell.tsx', code);
console.log('Successfully applied all changes safely!');
