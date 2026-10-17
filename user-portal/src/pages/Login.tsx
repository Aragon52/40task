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
  ArrowRight,
  ShieldCheck,
  Globe,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';
import { Button, Modal } from '@/src/shared/UI';
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
  const [showPassword, setShowPassword] = useState(false);
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

  const filteredCountries = COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) || 
    c.code.includes(countrySearchQuery)
  );

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-x-hidden bg-slate-100 font-sans text-slate-800">
      {/* Crisp Light Background with subtle gradient & ambient lighting */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img 
          src={loginBg} 
          alt="background" 
          className="w-full h-full object-cover opacity-15 scale-105 blur-sm" 
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-100/90 via-blue-50/70 to-sky-100/80" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300/25 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl" />
      </div>

      {/* Language Corner */}
      <div className="fixed top-5 right-5 z-50">
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-sm border border-slate-200/90 flex items-center gap-2">
          <Globe className="w-4 h-4 text-slate-500" />
          <LanguageSwitcher />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        {/* Brand Header */}
        <div className="text-center mb-7 space-y-3">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#0071ce] rounded-2xl shadow-xl shadow-blue-500/20 border border-blue-400/40">
            <span className="text-2xl font-black text-white tracking-tighter italic">Walmart</span>
            <div className="w-px h-6 bg-white/30" />
            <ShieldCheck className="w-6 h-6 text-[#FFC220]" />
          </div>
          <p className="text-[11px] font-extrabold text-[#0071ce] uppercase tracking-[0.25em]">
            Financial Enhancement Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200/90 rounded-[32px] p-7 sm:p-9 shadow-2xl shadow-slate-300/60">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="text-center space-y-1.5 mb-7">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Merchant Access</h2>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sign in to your matching node</p>
            </div>

            {/* Mobile Connection (Phone + Country Selector) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#0071ce]" />
                Mobile Connection
              </label>
              
              <div className="flex items-center gap-2.5">
                {/* Country Selector Trigger */}
                <div className="relative shrink-0" ref={countryDropdownRef}>
                  <button 
                    type="button"
                    onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                    className="h-14 px-3.5 sm:px-4 flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 hover:border-slate-400 rounded-2xl transition-all cursor-pointer text-slate-800 shadow-xs focus:ring-4 focus:ring-blue-100 focus:border-[#0071ce] outline-none"
                    aria-expanded={countryDropdownOpen}
                    aria-haspopup="listbox"
                    title="Select country dial code"
                  >
                    <img 
                      src={`https://flagcdn.com/w40/${selectedCountry.flagCode}.png`} 
                      className="w-5 h-3.5 object-cover rounded-xs shadow-xs shrink-0" 
                      alt={selectedCountry.name} 
                    />
                    <span className="text-sm font-extrabold text-slate-900 tracking-tight">{selectedCountry.code}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 shrink-0 ${countryDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu (Guaranteed NOT clipped) */}
                  {countryDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-2.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                        <Search className="w-4 h-4 text-slate-400 shrink-0" />
                        <input 
                          type="text" 
                          placeholder="Search country or code (+1, +44...)" 
                          className="bg-transparent border-none text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 w-full outline-none py-1 font-medium"
                          value={countrySearchQuery}
                          onChange={e => setCountrySearchQuery(e.target.value)}
                          autoFocus
                        />
                        {countrySearchQuery && (
                          <button 
                            type="button" 
                            onClick={() => setCountrySearchQuery('')}
                            className="text-xs font-bold text-slate-400 hover:text-slate-600 px-1 cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <div className="max-h-60 overflow-y-auto p-1.5 divide-y divide-slate-50">
                        {filteredCountries.length === 0 ? (
                          <div className="p-4 text-center text-xs font-medium text-slate-400">
                            No matching country found
                          </div>
                        ) : (
                          filteredCountries.map(c => {
                            const isSelected = c.code === selectedCountry.code && c.flagCode === selectedCountry.flagCode;
                            return (
                              <button
                                key={`${c.flagCode}-${c.code}`}
                                type="button"
                                onClick={() => { 
                                  setSelectedCountry(c); 
                                  setCountryDropdownOpen(false); 
                                  setCountrySearchQuery('');
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left cursor-pointer ${
                                  isSelected ? 'bg-blue-50 text-[#0071ce] font-bold' : 'hover:bg-slate-100/80 text-slate-700'
                                }`}
                              >
                                <img 
                                  src={`https://flagcdn.com/w40/${c.flagCode}.png`} 
                                  className="w-5 h-3.5 object-cover rounded-xs shadow-xs shrink-0" 
                                  alt="" 
                                />
                                <span className="flex-1 text-xs font-semibold truncate">{c.name}</span>
                                <span className="text-xs font-extrabold text-[#0071ce] shrink-0">{c.code}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-[#0071ce] shrink-0" />}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Phone Input */}
                <div className="relative flex-1">
                  <input 
                    type="tel" 
                    placeholder="Phone number" 
                    className="w-full h-14 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-300 focus:border-[#0071ce] rounded-2xl px-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-xs"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#0071ce]" />
                Secure Key
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="w-full h-14 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-300 focus:border-[#0071ce] rounded-2xl px-4 pr-12 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-xs"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                  tabIndex={-1}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 p-1">
              <input 
                type="checkbox" 
                id="agreeTerms"
                checked={agreeTerms} 
                onChange={e => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded-lg border-2 border-slate-300 text-[#0071ce] focus:ring-2 focus:ring-blue-500/20 cursor-pointer accent-[#0071ce]"
              />
              <label htmlFor="agreeTerms" className="text-xs text-slate-600 leading-relaxed font-medium select-none">
                I accept the <button type="button" onClick={() => setShowTermsModal(true)} className="text-[#0071ce] hover:text-[#005fa7] font-bold underline underline-offset-2 cursor-pointer">Service Terms</button> and <button type="button" onClick={() => setShowPoliciesModal(true)} className="text-[#0071ce] hover:text-[#005fa7] font-bold underline underline-offset-2 cursor-pointer">Merchant Policies</button>.
              </label>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-base font-bold bg-[#0071ce] hover:bg-[#005fa7] active:bg-[#004f8b] text-white shadow-xl shadow-blue-500/25 rounded-2xl group transition-all cursor-pointer" 
              isLoading={isLoading}
            >
              <span>Initialize Session</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <p className="text-center text-xs font-semibold text-slate-500 tracking-wide pt-2">
              New Merchant? <button type="button" onClick={() => navigate('/register')} className="text-[#0071ce] hover:text-[#005fa7] font-bold hover:underline cursor-pointer ml-1">Create Account</button>
            </p>
          </form>
        </div>

        {/* Security Trust Badge */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="w-8 h-px bg-slate-300" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            256-Bit SSL Encrypted Session
          </p>
          <div className="w-8 h-px bg-slate-300" />
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} title="Terms of Service">
        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <p>By registering an account with Walmart, you represent that you are at least 18 years of age and agree to comply with all operational terms.</p>
          <p>Users are responsible for maintaining the confidentiality of their passwords and secure keys. Sharing accounts or manipulating slips is strictly prohibited.</p>
          <div className="pt-2">
            <Button onClick={() => setShowTermsModal(false)} className="w-full bg-[#0071ce] hover:bg-[#005fa7] text-white">Agree & Close</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showPoliciesModal} onClose={() => setShowPoliciesModal(false)} title="Operational Policies">
        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <p>Walmart utilizes a real-time smart matching algorithm. Users must maintain a positive wallet balance to match and accept retail allocation worksheets.</p>
          <p>Commissions are credited immediately upon successful verification. Standard daily limits apply based on VIP tier.</p>
          <div className="pt-2">
            <Button onClick={() => setShowPoliciesModal(false)} className="w-full bg-[#0071ce] hover:bg-[#005fa7] text-white">I Understand</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
