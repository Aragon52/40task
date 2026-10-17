import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import LanguageSwitcher from '../components/LanguageSwitcher';
import loginBg from '@/login.png';
import { 
  Phone, 
  Lock, 
  ChevronDown, 
  Search, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { Button, Modal, Input } from '@/src/shared/UI';
import toast from 'react-hot-toast';

const COUNTRIES = [
  { code: '+213', flagCode: 'dz', name: 'Algeria' },
  { code: '+54', flagCode: 'ar', name: 'Argentina' },
  { code: '+61', flagCode: 'au', name: 'Australia' },
  { code: '+43', flagCode: 'at', name: 'Austria' },
  { code: '+973', flagCode: 'bh', name: 'Bahrain' },
  { code: '+880', flagCode: 'bd', name: 'Bangladesh' },
  { code: '+32', flagCode: 'be', name: 'Belgium' },
  { code: '+591', flagCode: 'bo', name: 'Bolivia' },
  { code: '+55', flagCode: 'br', name: 'Brazil' },
  { code: '+673', flagCode: 'bn', name: 'Brunei' },
  { code: '+855', flagCode: 'kh', name: 'Cambodia' },
  { code: '+56', flagCode: 'cl', name: 'Chile' },
  { code: '+86', flagCode: 'cn', name: 'China' },
  { code: '+57', flagCode: 'co', name: 'Colombia' },
  { code: '+53', flagCode: 'cu', name: 'Cuba' },
  { code: '+420', flagCode: 'cz', name: 'Czech Republic' },
  { code: '+45', flagCode: 'dk', name: 'Denmark' },
  { code: '+1', flagCode: 'do', name: 'Dominican Republic' },
  { code: '+593', flagCode: 'ec', name: 'Ecuador' },
  { code: '+20', flagCode: 'eg', name: 'Egypt' },
  { code: '+358', flagCode: 'fi', name: 'Finland' },
  { code: '+33', flagCode: 'fr', name: 'France' },
  { code: '+49', flagCode: 'de', name: 'Germany' },
  { code: '+30', flagCode: 'gr', name: 'Greece' },
  { code: '+502', flagCode: 'gt', name: 'Guatemala' },
  { code: '+504', flagCode: 'hn', name: 'Honduras' },
  { code: '+852', flagCode: 'hk', name: 'Hong Kong' },
  { code: '+36', flagCode: 'hu', name: 'Hungary' },
  { code: '+91', flagCode: 'in', name: 'India' },
  { code: '+62', flagCode: 'id', name: 'Indonesia' },
  { code: '+964', flagCode: 'iq', name: 'Iraq' },
  { code: '+353', flagCode: 'ie', name: 'Ireland' },
  { code: '+972', flagCode: 'il', name: 'Israel' },
  { code: '+39', flagCode: 'it', name: 'Italy' },
  { code: '+81', flagCode: 'jp', name: 'Japan' },
  { code: '+7', flagCode: 'kz', name: 'Kazakhstan' },
  { code: '+254', flagCode: 'ke', name: 'Kenya' },
  { code: '+82', flagCode: 'kr', name: 'Korea' },
  { code: '+965', flagCode: 'kw', name: 'Kuwait' },
  { code: '+856', flagCode: 'la', name: 'Laos' },
  { code: '+853', flagCode: 'mo', name: 'Macao' },
  { code: '+60', flagCode: 'my', name: 'Malaysia' },
  { code: '+52', flagCode: 'mx', name: 'Mexico' },
  { code: '+212', flagCode: 'ma', name: 'Morocco' },
  { code: '+95', flagCode: 'mm', name: 'Myanmar' },
  { code: '+977', flagCode: 'np', name: 'Nepal' },
  { code: '+31', flagCode: 'nl', name: 'Netherlands' },
  { code: '+64', flagCode: 'nz', name: 'New Zealand' },
  { code: '+505', flagCode: 'ni', name: 'Nicaragua' },
  { code: '+234', flagCode: 'ng', name: 'Nigeria' },
  { code: '+47', flagCode: 'no', name: 'Norway' },
  { code: '+968', flagCode: 'om', name: 'Oman' },
  { code: '+92', flagCode: 'pk', name: 'Pakistan' },
  { code: '+507', flagCode: 'pa', name: 'Panama' },
  { code: '+595', flagCode: 'py', name: 'Paraguay' },
  { code: '+51', flagCode: 'pe', name: 'Peru' },
  { code: '+63', flagCode: 'ph', name: 'Philippines' },
  { code: '+48', flagCode: 'pl', name: 'Poland' },
  { code: '+351', flagCode: 'pt', name: 'Portugal' },
  { code: '+974', flagCode: 'qa', name: 'Qatar' },
  { code: '+40', flagCode: 'ro', name: 'Romania' },
  { code: '+7', flagCode: 'ru', name: 'Russia' },
  { code: '+966', flagCode: 'sa', name: 'Saudi Arabia' },
  { code: '+65', flagCode: 'sg', name: 'Singapore' },
  { code: '+421', flagCode: 'sk', name: 'Slovakia' },
  { code: '+27', flagCode: 'za', name: 'South Africa' },
  { code: '+34', flagCode: 'es', name: 'Spain' },
  { code: '+94', flagCode: 'lk', name: 'Sri Lanka' },
  { code: '+46', flagCode: 'se', name: 'Sweden' },
  { code: '+41', flagCode: 'ch', name: 'Switzerland' },
  { code: '+886', flagCode: 'tw', name: 'Taiwan' },
  { code: '+66', flagCode: 'th', name: 'Thailand' },
  { code: '+216', flagCode: 'tn', name: 'Tunisia' },
  { code: '+90', flagCode: 'tr', name: 'Turkey' },
  { code: '+971', flagCode: 'ae', name: 'UAE' },
  { code: '+44', flagCode: 'gb', name: 'UK' },
  { code: '+380', flagCode: 'ua', name: 'Ukraine' },
  { code: '+598', flagCode: 'uy', name: 'Uruguay' },
  { code: '+1', flagCode: 'us', name: 'USA/Canada' },
  { code: '+998', flagCode: 'uz', name: 'Uzbekistan' },
  { code: '+58', flagCode: 've', name: 'Venezuela' },
  { code: '+84', flagCode: 'vn', name: 'Vietnam' }
];

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPoliciesModal, setShowPoliciesModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Country selector
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES.find(c => c.code === '+1' && c.flagCode === 'us') || COUNTRIES[0]);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setCountryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      toast.error("Please agree to terms and policies");
      return;
    }
    if (!phone || !password) {
      toast.error("Fill all fields");
      return;
    }

    setIsLoading(true);
    try {
      const rawPhone = phone.trim();
      const cleanedDigits = rawPhone.replace(/^[+]/, '');
      const fullPhone = `${selectedCountry.code}${cleanedDigits}`;
      const fullPhoneWithSpace = `${selectedCountry.code} ${cleanedDigits}`;

      const queryFilter = `username.eq.${fullPhone},phone.eq.${fullPhone},username.eq.${fullPhoneWithSpace},phone.eq.${fullPhoneWithSpace},username.eq.${rawPhone},phone.eq.${rawPhone}`;

      const { data: users, error } = await supabase.from('cb_users').select('*').or(queryFilter);
      if (error) throw error;

      const user = users && users[0];
      if (user) {
        if (user.password && user.password !== password) {
          toast.error("Invalid password");
          return;
        }

        await supabase.from('cb_users').update({ online: 'Online' }).eq('id', user.id);
        
        localStorage.setItem('cb_username', user.username);
        localStorage.setItem('cb_balance', user.balance.toString());
        localStorage.setItem('cb_user_session', JSON.stringify({
          id: user.id,
          username: user.username,
          referredBy: user.referred_by_staff_id || 'None'
        }));
        window.dispatchEvent(new Event('cb_session_updated'));
        toast.success(`Welcome back, ${user.username}`);
        navigate('/home');
      } else {
        toast.error("Account not found");
      }
    } catch (err: any) {
      toast.error("Sign in failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-950">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <img src={loginBg} alt="bg" className="w-full h-full object-cover opacity-40 scale-110 blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/90 to-blue-900/30" />
      </div>

      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-10 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-10 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse-slow delay-1000" />

      {/* Language Corner */}
      <div className="fixed top-6 right-6 z-50">
        <div className="glass px-4 py-2 rounded-2xl flex items-center gap-2">
          <Globe className="w-4 h-4 text-white" />
          <LanguageSwitcher />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
        {/* Brand Header */}
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20 border border-blue-400/30">
            <span className="text-2xl font-black text-white tracking-tighter italic">Walmart</span>
            <div className="w-px h-6 bg-white/20" />
            <ShieldCheck className="w-6 h-6 text-amber-400" />
          </div>
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] pl-1">Financial Enhancement Portal</p>
        </div>

        {/* Login Card */}
        <div className="glass-dark border border-white/10 rounded-[32px] p-8 shadow-2xl backdrop-blur-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="text-center space-y-1 mb-8">
              <h2 className="text-xl font-black text-white tracking-tight">Merchant Access</h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sign in to your matching node</p>
            </div>

            {/* Phone Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                <Phone className="w-3 h-3" />
                Mobile Connection
              </label>
              <div className="flex h-14 bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50 transition-all">
                <div className="relative" ref={countryDropdownRef}>
                  <button 
                    type="button"
                    onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                    className="h-full px-4 flex items-center gap-2 bg-white/5 border-r border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <img src={`https://flagcdn.com/w40/${selectedCountry.flagCode}.png`} className="w-5 h-3.5 object-cover rounded-sm shadow-sm" alt="" />
                    <span className="text-sm font-black text-white">{selectedCountry.code}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {countryDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-2">
                      <div className="p-2 border-b border-white/10 flex items-center gap-2 bg-white/5">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Search countries..." 
                          className="bg-transparent border-none text-sm text-white w-full outline-none py-1"
                          value={countrySearchQuery}
                          onChange={e => setCountrySearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                        {COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) || c.code.includes(countrySearchQuery)).map(c => (
                          <button
                            key={c.flagCode}
                            type="button"
                            onClick={() => { setSelectedCountry(c); setCountryDropdownOpen(false); }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-left"
                          >
                            <img src={`https://flagcdn.com/w40/${c.flagCode}.png`} className="w-6 h-4 object-cover rounded-sm shadow-sm" alt="" />
                            <span className="flex-1 text-xs font-bold text-slate-300">{c.name}</span>
                            <span className="text-[10px] font-black text-blue-500">{c.code}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <input 
                  type="tel" 
                  placeholder="Phone number" 
                  className="flex-1 bg-transparent px-4 text-sm font-bold text-white outline-none"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                <Lock className="w-3 h-3" />
                Secure Key
              </label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 p-1">
              <div className="relative flex items-center">
                <input 
                  type="checkbox" 
                  id="agreeTerms"
                  checked={agreeTerms} 
                  onChange={e => setAgreeTerms(e.target.checked)}
                  className="w-5 h-5 rounded-lg border-2 border-white/10 bg-white/5 checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer appearance-none"
                />
                <CheckCircle2 className={`absolute w-3 h-3 text-white pointer-events-none left-1 transition-opacity ${agreeTerms ? 'opacity-100' : 'opacity-0'}`} />
              </div>
              <label htmlFor="agreeTerms" className="text-[11px] text-slate-500 leading-relaxed font-medium">
                I accept the <button type="button" onClick={() => setShowTermsModal(true)} className="text-blue-500 font-black underline">Service Terms</button> and <button type="button" onClick={() => setShowPoliciesModal(true)} className="text-blue-500 font-black underline">Merchant Policies</button>.
              </label>
            </div>

            <Button type="submit" className="w-full h-14 text-base group" isLoading={isLoading}>
              <span>Initialize Session</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <p className="text-center text-xs font-bold text-slate-600 uppercase tracking-widest pt-4">
              New Merchant? <button type="button" onClick={() => navigate('/register')} className="text-blue-500 hover:underline">Create Account</button>
            </p>
          </form>
        </div>

        {/* Trust Badge */}
        <div className="mt-12 flex items-center justify-center gap-8 opacity-40 grayscale group hover:grayscale-0 transition-all">
          <div className="flex items-center gap-2">
            <div className="w-8 h-px bg-slate-800" />
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Military Grade Encryption</p>
            <div className="w-8 h-px bg-slate-800" />
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} title="Terms of Service">
        <div className="space-y-6 text-sm text-slate-400">
          <p>By registering an account with Walmart, you represent that you are at least 18 years of age and agree to comply with all operational terms.</p>
          <p>Users are responsible for maintaining the confidentiality of their passwords and secure keys. Sharing accounts or manipulaing slips is strictly prohibited.</p>
          <Button onClick={() => setShowTermsModal(false)} className="w-full">Agree & Close</Button>
        </div>
      </Modal>

      <Modal isOpen={showPoliciesModal} onClose={() => setShowPoliciesModal(false)} title="Operational Policies">
        <div className="space-y-6 text-sm text-slate-400">
          <p>Walmart utilizes a real-time smart matching algorithm. Users must maintain a positive wallet balance to match and accept retail allocation worksheets.</p>
          <p>Commissions are credited immediately upon successful verification. Standard daily limits apply based on VIP tier.</p>
          <Button onClick={() => setShowPoliciesModal(false)} className="w-full">I Understand</Button>
        </div>
      </Modal>
    </div>
  );
}
