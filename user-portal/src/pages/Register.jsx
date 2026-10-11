import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';
import LanguageSwitcher from '../components/LanguageSwitcher';
import loginBg from '@/login.png';

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

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [withdrawPassword, setWithdrawPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPoliciesModal, setShowPoliciesModal] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Country code selector state
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES.find(c => c.code === '+1' && c.flagCode === 'us') || COUNTRIES[0]);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const countryDropdownRef = useRef(null);

  // Click-away listener for country picker
  useEffect(() => {
    function handleClickOutside(event) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setCountryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Automatically fetch referral code from URL search param 'ref' if present
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setReferralCode(ref);
    }
  }, [searchParams]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!username || !phone || !password || !confirmPassword || !referralCode || !withdrawPassword) {
      setFormError('Please fill in all required fields (Username, Phone Number, Passwords, Withdrawal Password, and Invitation Code).');
      return;
    }

    if (!termsAgreed) {
      setFormError('You must agree to the Terms & Conditions.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    try {
      const codeInput = referralCode.trim().toUpperCase();

      // ── Step 1a: Check if code matches a USER's invitation code (user-to-user binding) ──
      const { data: inviterUsers } = await supabase
        .from('cb_users')
        .select('id, username, invite_code, referred_by_staff_id, member_of_admin_id')
        .ilike('invite_code', codeInput);

      const inviterUser = inviterUsers && inviterUsers[0];

      // ── Step 1b: Check if code matches a STAFF referral code ──
      const { data: staffList, error: staffError } = await supabase
        .from('cb_staff')
        .select('*')
        .ilike('referral_code', referralCode.trim());

      if (staffError) {
        setFormError('Error verifying invitation code: ' + staffError.message);
        return;
      }

      let matchingStaff = staffList && staffList[0];

      // Dynamic parse pattern fallback
      if (!matchingStaff && !inviterUser) {
        let parsedStaffId = null;
        let parsedAdminId = null;

        const cleanInput = codeInput.trim().toUpperCase();
        const refMatchRandom = cleanInput.match(/^WK-([A-Z0-9]{6})-(AD\d+|OWNER)$/);
        const refMatchNoHyphen = cleanInput.match(/^WK([A-Z0-9]{6})(AD\d+|OWNER)$/);
        const refMatchNew = cleanInput.match(/^WK-STF-(AD\d+)-(SI\d+)-([A-Z]{3})$/);
        const refMatchOld = cleanInput.match(/^WK(AD\d+SI\d+)([A-Z]{3})$/);

        if (refMatchRandom) {
          parsedAdminId = refMatchRandom[2];
          parsedStaffId = `${parsedAdminId}SI1`;
        } else if (refMatchNoHyphen) {
          parsedAdminId = refMatchNoHyphen[2];
          parsedStaffId = `${parsedAdminId}SI1`;
        } else if (refMatchNew) {
          parsedAdminId = refMatchNew[1];
          parsedStaffId = `${parsedAdminId}${refMatchNew[2]}`;
        } else if (refMatchOld) {
          parsedStaffId = refMatchOld[1];
          parsedAdminId = parsedStaffId.split('SI')[0];
        }

        if (parsedStaffId && parsedAdminId) {
          const newStaffMember = {
            id: 'staff-' + Date.now(),
            staff_id: parsedStaffId,
            name: `Staff ${parsedStaffId}`,
            email: `staff_${parsedStaffId.toLowerCase()}@wallmark.com`,
            phone: 'Unassigned',
            status: 'Active',
            created_by_admin_id: parsedAdminId,
            department: 'Operations',
            referral_code: codeInput,
            created_at: new Date().toISOString(),
          };

          const { error: insertStaffError } = await supabase
            .from('cb_staff')
            .insert([newStaffMember]);

          if (!insertStaffError) matchingStaff = newStaffMember;
        }
      }

      if (!matchingStaff && !inviterUser) {
        toast.error('Invalid Invitation Code. Please contact your referrer or support for a valid code.');
        return;
      }

      // If user-to-user invite, inherit the inviter's staff/admin node
      if (inviterUser && !matchingStaff) {
        // We need the staff for this inviter — fetch based on their referred_by_staff_id
        const { data: inheritedStaff } = await supabase
          .from('cb_staff')
          .select('*')
          .eq('staff_id', inviterUser.referred_by_staff_id);
        matchingStaff = (inheritedStaff && inheritedStaff[0]) || {
          staff_id: inviterUser.referred_by_staff_id,
          name: inviterUser.username,
          status: 'Active',
          created_by_admin_id: inviterUser.member_of_admin_id,
        };
      }

      if (matchingStaff && matchingStaff.status && matchingStaff.status !== 'Active') {
        toast.error('This invitation code belongs to a suspended account.');
        return;
      }

      // Map phone to username and email (combining country code + raw digits beautifully)
      const rawDigits = phone.trim().replace(/^[+]/, ''); // Strip typed '+'
      const finalPhoneCombined = `${selectedCountry.code}${rawDigits}`;
      const finalPhoneWithSpace = `${selectedCountry.code} ${rawDigits}`;

      const computedUsername = username.trim();
      const computedEmail = `${finalPhoneCombined}@merchant.wallmark.com`;

      // 2. Check if phone or username already exists
      const queryCheck = `username.eq.${computedUsername},phone.eq.${finalPhoneCombined},phone.eq.${finalPhoneWithSpace},phone.eq.${rawDigits}`;

      const { data: existingUsers, error: userCheckError } = await supabase
        .from('cb_users')
        .select('username, email, phone')
        .or(queryCheck);

      if (userCheckError) {
        setFormError("Error checking existing users: " + userCheckError.message);
        return;
      }

      if (existingUsers && existingUsers.length > 0) {
        // Find out if it's the username or phone that clashed
        const isUsernameTaken = existingUsers.some(u => u.username === computedUsername);
        if (isUsernameTaken) {
          setFormError("This username is already taken.");
        } else {
          setFormError("This phone number is already registered.");
        }
        return;
      }

      // 3. Create client registration
      const newUserId = 'ID-' + Math.floor(10000 + Math.random() * 90000);
      const parentAdminId = matchingStaff.created_by_admin_id || matchingStaff.createdByAdminId || 'OWNER';
      
      const generateRandomCode = (length) => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing O, 0, I, 1
        let result = '';
        for (let i = 0; i < length; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };
      
      const inviteCode = `WK${generateRandomCode(8)}${parentAdminId}`;

      const newUser = {
        id: newUserId,
        username: computedUsername,
        email: computedEmail,
        phone: finalPhoneCombined,
        nickname: computedUsername,
        level: 'FREE VIP',
        rate: '$/1.0000',
        acceptance: 'Allowed',
        online: 'Online',
        balance: 0.00,
        frozen: 0.00,
        topup: 0.00,
        spent_today: 0.00,
        spent_current: 0.00,
        remaining: 10,
        withdraw: 'Enabled',
        tp_recharge: 0.00,
        be_recharge: 0.00,
        earnings: 0.00,
        commissions: 0.00,
        withdrawals: 0.00,
        invite_code: inviteCode,
        subs: 0,
        inviter: `${matchingStaff.name} (${matchingStaff.staff_id || matchingStaff.staffId})`,
        referred_by_staff_id: matchingStaff.staff_id || matchingStaff.staffId,
        member_of_admin_id: matchingStaff.created_by_admin_id || matchingStaff.createdByAdminId,
        referral_id: referralCode.trim().toUpperCase(),
        // Bind to the inviting user if they used a user-to-user invitation code
        invited_by_user_id: inviterUser ? inviterUser.id : '',
        l1_agent: matchingStaff.name,
        l2_agent: matchingStaff.created_by_admin_id || matchingStaff.createdByAdminId,
        ip: '192.168.1.' + Math.floor(Math.random() * 254),
        reg_time: new Date().toISOString(),
        password: password,
        password_plain: password,
      };

      let insertUserError;
      const { error: primaryError } = await supabase
        .from('cb_users')
        .insert([{ ...newUser, withdraw_password: withdrawPassword }]);

      insertUserError = primaryError;

      if (primaryError && (primaryError.message.includes('withdraw_password') || primaryError.code === 'PGRST204' || primaryError.message.includes('column'))) {
        console.warn("withdraw_password column missing in database. Retrying fallback insertion...");
        const { error: fallbackError } = await supabase
          .from('cb_users')
          .insert([newUser]);
        insertUserError = fallbackError;
        if (!fallbackError) {
          toast("Warning: 'withdraw_password' column missing. Please run add_withdrawal_password.sql, but registration was successful!", { duration: 5000 });
        }
      }

      if (insertUserError) {
        setFormError("Error registering user: " + insertUserError.message);
        return;
      }

      // Log user session in
      localStorage.setItem('cb_username', computedUsername);
      localStorage.setItem('cb_balance', '0.00');
      localStorage.setItem('cb_user_session', JSON.stringify({
        id: newUserId,
        username: computedUsername,
        referredBy: matchingStaff.staff_id || matchingStaff.staffId
      }));

      setFormSuccess(`Account created successfully under staff ${matchingStaff.staff_id || matchingStaff.staffId}!`);
      setTimeout(() => {
        navigate('/home');
      }, 2000);
    } catch (err) {
      setFormError("Registration failed: " + err.message);
    }
  };

  return (
    <div className="login-container scale-up" style={{ backgroundImage: `linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.08) 100%), url(${loginBg})` }}>
      {/* Background blurred glowing layers for high fidelity glassmorphic effects */}
      <div className="glass-ambient-glow glow-1"></div>
      <div className="glass-ambient-glow glow-2"></div>

      {/* Upper Top Corner Language Swapper */}
      <div className="login-lang-corner">
        <LanguageSwitcher />
      </div>

      <div className="login-glass-card">
        <div className="login-brand-header">
          <div className="logo-badge-walmart large">
            <span className="logo-text-walmart">Walmart</span>
            <span className="logo-spark-walmart">
              <svg viewBox="0 0 100 100" width="24" height="24">
                <g transform="translate(50,50)" stroke="#FFC220" strokeWidth="15" strokeLinecap="round">
                  <line x1="0" y1="-10" x2="0" y2="-38" />
                  <line x1="0" y1="-10" x2="0" y2="-38" transform="rotate(60)" />
                  <line x1="0" y1="-10" x2="0" y2="-38" transform="rotate(120)" />
                  <line x1="0" y1="-10" x2="0" y2="-38" transform="rotate(180)" />
                  <line x1="0" y1="-10" x2="0" y2="-38" transform="rotate(240)" />
                  <line x1="0" y1="-10" x2="0" y2="-38" transform="rotate(300)" />
                </g>
              </svg>
            </span>
          </div>
          <p className="brand-tagline">Financial Enhancement In Your Pocket</p>
        </div>

        <form className="login-card-form" onSubmit={handleRegister}>
          <h3 className="form-title">Merchant Account Creation</h3>

          {formError && <div className="inline-alert-error" style={{ marginBottom: 16 }}>{formError}</div>}
          {formSuccess && <div className="inline-alert-success" style={{ marginBottom: 16 }}>{formSuccess}</div>}

          <div className="login-form-group">
            <label>Username</label>
            <input 
              type="text" 
              placeholder="Enter your username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="login-form-group">
            <label>Phone Number</label>
            <div className="phone-input-wrapper" ref={countryDropdownRef}>
              <div className="country-code-selector">
                <button 
                  type="button" 
                  className="country-trigger-btn"
                  onClick={() => { setCountryDropdownOpen(!countryDropdownOpen); setCountrySearchQuery(''); }}
                >
                  <span className="country-flag-icon">
                    <img 
                      src={`https://flagcdn.com/w40/${selectedCountry.flagCode}.png`} 
                      alt="" 
                      className="real-flag-img" 
                      referrerPolicy="no-referrer"
                    />
                  </span>
                  <span className="country-code-text">{selectedCountry.code}</span>
                  <span className="country-chevron">▼</span>
                </button>
                {countryDropdownOpen && (
                  <div className="country-dropdown-list">
                    
                    <div className="country-search-box">
                      <input 
                        type="text" 
                        placeholder="Search country..." 
                        value={countrySearchQuery}
                        onChange={(e) => setCountrySearchQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="country-search-input"
                      />
                    </div>
                    {COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) || c.code.includes(countrySearchQuery)).map(c => (
                      <div 
                        key={c.flagCode} 
                        className="country-dropdown-item"
                        onClick={() => {
                          setSelectedCountry(c);
                          setCountryDropdownOpen(false);
                        }}
                      >
                        <span className="item-flag-icon">
                          <img 
                            src={`https://flagcdn.com/w40/${c.flagCode}.png`} 
                            alt="" 
                            className="real-flag-img" 
                            referrerPolicy="no-referrer"
                          />
                        </span>
                        <span className="country-item-title">{c.name}</span>
                        <span className="item-code">{c.code}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <input 
                type="tel" 
                className="phone-input-field"
                placeholder="Enter your phone number" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="login-form-group">
            <label>Secure Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="login-form-group">
            <label>Confirm Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="login-form-group">
            <label>Withdrawal Password (6-digit PIN or Secure Password)</label>
            <input 
              id="txt-register-withdraw-password"
              type="password" 
              placeholder="••••••••" 
              value={withdrawPassword}
              onChange={(e) => setWithdrawPassword(e.target.value)}
              required
            />
          </div>

          <div className="login-form-group">
            <label>Invitation Code</label>
            <input 
              type="text" 
              placeholder="Referral Code" 
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              required
              readOnly={!!searchParams.get('ref')}
            />
            <span style={{ fontSize: 9.5, color: 'var(--text-muted, #475569)', marginTop: 2, fontWeight: 500 }}>
              * Enter your recruiter's staff code OR a friend's invitation code.
            </span>
          </div>

          <div className="login-form-group" style={{ flexDirection: 'row', alignItems: 'flex-start', gap: '8px', marginTop: '4px' }}>
            <input 
              type="checkbox" 
              id="termsCheckbox" 
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              style={{ width: '16px', height: '16px', margin: '3px 0 0 0', cursor: 'pointer', accentColor: 'var(--primary-color, #0071ce)' }}
            />
            <label htmlFor="termsCheckbox" style={{ margin: 0, fontSize: '11.5px', cursor: 'pointer', color: 'var(--text-muted, #475569)', fontWeight: 500, lineHeight: '1.4', textAlign: 'left' }}>
              I agree to the <span style={{ color: 'var(--primary-color, #0071ce)', fontWeight: 'bold', textDecoration: 'underline' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTermsModal(true); }}>Terms & Conditions</span> and <span style={{ color: 'var(--primary-color, #0071ce)', fontWeight: 'bold', textDecoration: 'underline' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPoliciesModal(true); }}>Operational Policies</span> (Simulated Environment).
            </label>
          </div>

          <button type="submit" className="login-submit-btn" style={{ marginTop: '12px' }}>
            Submit & Register
          </button>

          <p className="register-prompt">
            Already have an account? <span className="reg-link-inline" onClick={() => navigate('/login')}>Sign In</span>
          </p>
        </form>
      </div>

      <style>{`
        .login-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 40px 16px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.08) 100%), 
                      url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=2000');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          overflow: hidden;
        }

        /* Ambient lighting backplate orbs behind glass */
        .glass-ambient-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.25;
          z-index: 0;
          pointer-events: none;
        }
        .glow-1 {
          width: 300px;
          height: 300px;
          background: #0071ce;
          top: 15%;
          left: 10%;
        }
        .glow-2 {
          width: 250px;
          height: 250px;
          background: #FFC220;
          bottom: 20%;
          right: 10%;
        }

        .login-lang-corner {
          position: fixed;
          top: 16px;
          right: 16px;
          z-index: 10001;
        }

        .login-glass-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          background: rgba(255, 255, 255, 0.015);
          backdrop-filter: blur(10px) saturate(140%);
          -webkit-backdrop-filter: blur(10px) saturate(140%);
          border: 1px solid rgba(255, 255, 255, 0.75);
          border-radius: 24px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 15px 35px -5px rgba(0, 0, 0, 0.04);
          padding: 36px 28px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          animation: cardBounce 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes cardBounce {
          0% { transform: scale(0.92) translateY(10px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }

        .login-brand-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          text-align: center;
          background: rgba(255, 255, 255, 0.02);
          padding: 16px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.55);
        }

        .brand-tagline {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          background: linear-gradient(135deg, #0071ce 0%, #d97706 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
          margin: 0;
        }

        .login-card-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
          background: transparent;
          border: none;
          padding: 0;
          box-shadow: none;
        }

        .form-title {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          text-align: center;
          margin-bottom: 4px;
          letter-spacing: -0.3px;
        }

        .login-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .login-form-group label {
          font-size: 11px;
          font-weight: 700;
          color: #334155;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .login-form-group > input {
          height: 40px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.45);
          background-color: rgba(255, 255, 255, 0.15);
          padding: 0 16px;
          font-size: 14px;
          color: #0f172a;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .login-form-group > input:focus {
          border-color: #0071ce;
          background-color: rgba(255, 255, 255, 0.85);
          box-shadow: 0 0 0 4px rgba(0, 113, 206, 0.15);
          outline: none;
        }

        /* Combined/nested country flag phone input wrapper styles */
        .phone-input-wrapper {
          display: flex;
          align-items: center;
          height: 40px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.45);
          background-color: rgba(255, 255, 255, 0.15);
          position: relative;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .phone-input-wrapper:focus-within {
          border-color: #0071ce;
          background-color: rgba(255, 255, 255, 0.85);
          box-shadow: 0 0 0 4px rgba(0, 113, 206, 0.15);
        }

        .country-code-selector {
          position: relative;
          height: 100%;
          border-right: 1px solid rgba(0, 0, 0, 0.1);
        }

        .country-trigger-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 12px;
          height: 100%;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
        }

        .country-flag-icon {
          width: 20px;
          height: 15px;
          border-radius: 2px;
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          border: 1px solid rgba(0,0,0,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .country-flag-icon img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .country-code-text {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }

        .country-chevron {
          font-size: 8px;
          color: #64748b;
          margin-left: 2px;
        }

        .country-search-box {
          padding: 8px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          position: sticky;
          top: 0;
          background: rgba(255, 255, 255, 0.98);
          z-index: 2;
        }
        .country-search-input {
          width: 100%;
          padding: 6px 10px;
          font-size: 13px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          outline: none;
        }
        .country-search-input:focus {
          border-color: var(--primary-color);
        }
        .country-dropdown-list {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          width: 190px;
          max-height: 200px;
          overflow-y: auto;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
          z-index: 100;
          padding: 4px;
        }

        .country-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
          font-size: 13px;
          color: #334155;
        }

        .country-dropdown-item:hover {
          background: rgba(0, 113, 206, 0.08);
          color: #0071ce;
        }

        .item-flag-icon {
          width: 20px;
          height: 15px;
          border-radius: 2px;
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(0,0,0,0.15);
          border: 1px solid rgba(0,0,0,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .item-flag-icon img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .country-item-title {
          flex: 1;
          font-weight: 500;
          text-align: left;
        }

        .item-code {
          font-weight: 600;
          color: #64748b;
        }

        .phone-input-field {
          flex: 1;
          height: 100%;
          border: none !important;
          background: transparent !important;
          padding: 0 16px !important;
          font-size: 14px;
          color: #0f172a;
          box-shadow: none !important;
          outline: none !important;
        }

        .login-submit-btn {
          height: 46px;
          border-radius: 23px;
          background: linear-gradient(135deg, #0071ce 0%, #004b87 100%);
          color: white;
          font-weight: 700;
          font-size: 15px;
          box-shadow: 0 10px 20px -5px rgba(0, 113, 206, 0.3);
          margin-top: 10px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .login-submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 24px -5px rgba(0, 113, 206, 0.4);
          background: linear-gradient(135deg, #0080eb 0%, #00569c 100%);
        }

        .register-prompt {
          font-size: 13px;
          color: #475569;
          text-align: center;
          margin-top: 8px;
        }

        .reg-link-inline {
          color: #0071ce;
          font-weight: 700;
          cursor: pointer;
          transition: color 0.15s;
        }

        .reg-link-inline:hover {
          color: #004b87;
          text-decoration: underline;
        }

        .inline-alert-error {
          padding: 10px 14px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #b91c1c;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
        }

        .inline-alert-success {
          padding: 10px 14px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #047857;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
        }

        /* Modals inside Register */
        .login-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10002;
          padding: 20px;
        }
        .login-modal-content {
          background: white;
          border-radius: 16px;
          max-width: 500px;
          width: 100%;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
          animation: modalScaleUp 0.25s ease-out;
          color: #1e293b;
        }
        @keyframes modalScaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .login-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #e2e8f0;
        }
        .login-modal-header h3 {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }
        .login-modal-close {
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          color: #64748b;
          transition: color 0.15s;
        }
        .login-modal-close:hover {
          color: #0f172a;
        }
        .login-modal-body {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: left;
        }
        .login-modal-body h4 {
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
          margin-top: 8px;
          margin-bottom: 2px;
        }
        .login-modal-body p {
          font-size: 12px;
          color: #475569;
          line-height: 1.5;
          margin: 0;
        }
        .login-modal-footer {
          padding: 12px 20px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: flex-end;
        }
        .login-modal-btn {
          background: #0071ce;
          color: white;
          border: none;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .login-modal-btn:hover {
          background: #00569c;
        }

        /* Dark Mode overrides for Register page */
        @media (prefers-color-scheme: dark) {
          .login-glass-card {
            background: rgba(15, 23, 42, 0.45);
            border-color: rgba(255, 255, 255, 0.15);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 20px 40px rgba(0, 0, 0, 0.5);
          }
          .login-brand-header {
            background: rgba(255, 255, 255, 0.01);
            border-color: rgba(255, 255, 255, 0.08);
          }
          .form-title {
            color: #f1f5f9;
          }
          .login-form-group label {
            color: #94a3b8;
          }
          .login-form-group > input {
            background-color: rgba(15, 23, 42, 0.35);
            border-color: rgba(255, 255, 255, 0.12);
            color: #f8fafc;
          }
          .login-form-group > input:focus {
            background-color: rgba(15, 23, 42, 0.6);
            border-color: #3b82f6;
          }
          .phone-input-wrapper {
            background-color: rgba(15, 23, 42, 0.35);
            border-color: rgba(255, 255, 255, 0.12);
          }
          .phone-input-wrapper:focus-within {
            background-color: rgba(15, 23, 42, 0.6);
            border-color: #3b82f6;
          }
          .country-trigger-btn {
            color: #f8fafc;
          }
          .country-code-text {
            color: #f8fafc;
          }
          .country-search-box {
            background: #1e293b;
            border-bottom-color: rgba(255, 255, 255, 0.08);
          }
          .country-search-input {
            background: #0f172a;
            border-color: rgba(255, 255, 255, 0.15);
            color: #f8fafc;
          }
          .country-dropdown-list {
            background: #1e293b;
            border-color: rgba(255, 255, 255, 0.15);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
          }
          .country-dropdown-item {
            color: #cbd5e1;
          }
          .country-dropdown-item:hover {
            background: rgba(59, 130, 246, 0.15);
            color: #60a5fa;
          }
          .phone-input-field {
            color: #f8fafc !important;
          }
          .register-prompt {
            color: #94a3b8;
          }
          .reg-link-inline {
            color: #60a5fa;
          }
          .reg-link-inline:hover {
            color: #93c5fd;
          }
          .login-modal-content {
            background: #1e293b;
            color: #cbd5e1;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }
          .login-modal-header {
            border-bottom-color: rgba(255, 255, 255, 0.08);
          }
          .login-modal-header h3 {
            color: #f1f5f9;
          }
          .login-modal-close {
            color: #94a3b8;
          }
          .login-modal-close:hover {
            color: #f1f5f9;
          }
          .login-modal-body h4 {
            color: #f1f5f9;
          }
          .login-modal-body p {
            color: #94a3b8;
          }
          .login-modal-footer {
            border-top-color: rgba(255, 255, 255, 0.08);
          }
        }
      `}</style>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="login-modal-overlay" onClick={() => setShowTermsModal(false)}>
          <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="login-modal-header">
              <h3>Terms of Service Agreement</h3>
              <button className="login-modal-close" onClick={() => setShowTermsModal(false)}>✕</button>
            </div>
            <div className="login-modal-body">
              <h4>1. Agreement of Service</h4>
              <p>By registering an account with Walmart, you represent that you are at least 18 years of age and agree to comply with all operational terms, verification checks, and administrative bindings.</p>
              
              <h4>2. User Responsibilities</h4>
              <p>Users are responsible for maintaining the confidentiality of their passwords and secure keys. Sharing accounts, transferring balances to other clients without approval, or registering multiple accounts under staff nodes is strictly prohibited.</p>

              <h4>3. Limitation of Liability</h4>
              <p>Walmart operates as a smart retail intermediary. Under no circumstances shall the platform, its admins, or operational staff nodes be liable for indirect, incidental, or consequential losses arising from network latency or client connectivity issues.</p>

              <h4>4. Node Suspensions</h4>
              <p>We reserve the right to suspend or lock accounts that violate system policies, manipulate transaction slips, or engage in suspicious activity. Suspended users must contact their affiliated support agent for audit resolution.</p>

              <h4>5. Amendments to Terms</h4>
              <p>Walmart reserves the right to modify or update these terms at any time. Continued use of the matching portal following adjustments constitutes acceptance of the new terms.</p>

              <h4>6. Development & Simulation Notice</h4>
              <p>This website is an educational simulation platform designed solely for demonstration and software testing purposes. It is NOT affiliated with, operated by, endorsed by, or associated with Walmart Inc., Walmark, or any real-world brand. All activities, balances, orders, and matchings on this site are fully simulated, artificial, and for development validation purposes only. No real currency is involved, and no physical order fulfillment or payout services are provided.</p>
            </div>
            <div className="login-modal-footer">
              <button className="login-modal-btn" onClick={() => setShowTermsModal(false)}>Accept & Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Rules & Policies Modal */}
      {showPoliciesModal && (
        <div className="login-modal-overlay" onClick={() => setShowPoliciesModal(false)}>
          <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="login-modal-header">
              <h3>Rules & Operational Policies</h3>
              <button className="login-modal-close" onClick={() => setShowPoliciesModal(false)}>✕</button>
            </div>
            <div className="login-modal-body">
              <h4>1. Retail Matching Operational Model</h4>
              <p>Walmart utilizes a real-time smart matching algorithm to connect merchants and retail nodes. Users must maintain a positive wallet balance to match and accept retail allocation worksheets.</p>
              
              <h4>2. Commission & Earnings Yields</h4>
              <p>Commissions are credited immediately upon successful verification and submission of each matched order. The standard commission yield is calculated based on the assigned VIP tier level rates.</p>

              <h4>3. Wallet Balance & Escrow Hold</h4>
              <p>During the active matching progression, the cost of matched orders will be temporarily held in escrow. Once you submit the order, the held principal and the earned commission are returned immediately to your active wallet balance.</p>

              <h4>4. Matching Daily Limits</h4>
              <p>Each user account is allocated a maximum of 10 standard matches per calendar day. VIP upgrades can raise matching limits, speed up settlement rates, and increase profit margins.</p>

              <h4>5. Financial Safety Policies</h4>
              <p>To prevent multi-accounting, automated script exploits, or capital washing, active balances are audited prior to withdrawal approval. Withdrawal requests are processed within 1 to 24 hours.</p>

              <h4>6. Development & Simulation Notice</h4>
              <p>This website is an educational simulation platform designed solely for demonstration and software testing purposes. It is NOT affiliated with, operated by, endorsed by, or associated with Walmart Inc., Walmark, or any real-world brand. All activities, balances, orders, and matchings on this site are fully simulated, artificial, and for development validation purposes only. No real currency is involved, and no physical order fulfillment or payout services are provided.</p>
            </div>
            <div className="login-modal-footer">
              <button className="login-modal-btn" onClick={() => setShowPoliciesModal(false)}>I Understand</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
