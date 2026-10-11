import React, { useState, useEffect, useRef } from 'react';

const REGIONS = {
  'America': [
    { code: 'en', name: 'English', local: 'English', flag: '🇺🇸' }
  ],
  'Europe': [
    { code: 'fr', name: 'French', local: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'German', local: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', name: 'Spanish', local: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Portuguese', local: 'Português', flag: '🇵🇹' },
    { code: 'it', name: 'Italian', local: 'Italiano', flag: '🇮🇹' },
    { code: 'nl', name: 'Dutch', local: 'Nederlands', flag: '🇳🇱' },
    { code: 'sv', name: 'Swedish', local: 'Svenska', flag: '🇸🇪' },
    { code: 'no', name: 'Norwegian', local: 'Norsk', flag: '🇳🇴' },
    { code: 'da', name: 'Danish', local: 'Dansk', flag: '🇩🇰' },
    { code: 'fi', name: 'Finnish', local: 'Suomi', flag: '🇫🇮' },
    { code: 'ga', name: 'Irish', local: 'Gaeilge', flag: '🇮🇪' },
    { code: 'cy', name: 'Welsh', local: 'Cymraeg', flag: '🇬🇧' },
    { code: 'ca', name: 'Catalan', local: 'Català', flag: '🇪🇸' },
    { code: 'is', name: 'Icelandic', local: 'Íslenska', flag: '🇮🇸' },
    { code: 'el', name: 'Greek', local: 'Ελληνικά', flag: '🇬🇷' },
    { code: 'ru', name: 'Russian', local: 'Русский', flag: '🇷🇺' },
    { code: 'uk', name: 'Ukrainian', local: 'Українська', flag: '🇺🇦' },
    { code: 'pl', name: 'Polish', local: 'Polski', flag: '🇵🇱' },
    { code: 'cs', name: 'Czech', local: 'Čeština', flag: '🇨🇿' },
    { code: 'ro', name: 'Romanian', local: 'Română', flag: '🇷🇴' },
    { code: 'hu', name: 'Hungarian', local: 'Magyar', flag: '🇭🇺' },
    { code: 'bg', name: 'Bulgarian', local: 'Български', flag: '🇧🇬' },
    { code: 'sr', name: 'Serbian', local: 'Српски', flag: '🇷🇸' },
    { code: 'hr', name: 'Croatian', local: 'Hrvatski', flag: '🇭🇷' },
    { code: 'sk', name: 'Slovak', local: 'Slovenčina', flag: '🇸🇰' },
    { code: 'sl', name: 'Slovenian', local: 'Slovenščina', flag: '🇸🇮' },
    { code: 'lt', name: 'Lithuanian', local: 'Lietuvių', flag: '🇱🇹' },
    { code: 'lv', name: 'Latvian', local: 'Latviešu', flag: '🇱🇻' },
    { code: 'et', name: 'Estonian', local: 'Eesti', flag: '🇪🇪' },
    { code: 'be', name: 'Belarusian', local: 'Беларуская', flag: '🇧🇾' },
    { code: 'mk', name: 'Macedonian', local: 'Македонски', flag: '🇲🇰' },
    { code: 'sq', name: 'Albanian', local: 'Shqip', flag: '🇦🇱' },
    { code: 'bs', name: 'Bosnian', local: 'Bosanski', flag: '🇧🇦' }
  ],
  'Middle East': [
    { code: 'ar', name: 'Arabic', local: 'العربية', flag: '🇸🇦' },
    { code: 'iw', name: 'Hebrew', local: 'עברית', flag: '🇮🇱' },
    { code: 'fa', name: 'Persian', local: 'فارسی', flag: '🇮🇷' },
    { code: 'tr', name: 'Turkish', local: 'Türkçe', flag: '🇹🇷' },
    { code: 'ku', name: 'Kurdish', local: 'Kurdî', flag: '🇹🇷' },
    { code: 'az', name: 'Azerbaijani', local: 'Azərbaycanca', flag: '🇦🇿' },
    { code: 'ka', name: 'Georgian', local: 'ქართული', flag: '🇬🇪' },
    { code: 'hy', name: 'Armenian', local: 'Հայերեն', flag: '🇦🇲' },
    { code: 'ps', name: 'Pashto', local: 'پښتو', flag: '🇦🇫' }
  ],
  'Asia': [
    { code: 'my', name: 'Burmese', local: 'မြန်မာဘာသာ', flag: '🇲🇲' },
    { code: 'km', name: 'Khmer', local: 'ភាសាខ្មែរ', flag: '🇰🇭' },
    { code: 'lo', name: 'Lao', local: 'ພາສາລາව', flag: '🇱🇦' },
    { code: 'th', name: 'Thai', local: 'ภาษาไทย', flag: '🇹🇭' },
    { code: 'vi', name: 'Vietnamese', local: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'id', name: 'Indonesian', local: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'ms', name: 'Malay', local: 'Bahasa Melayu', flag: '🇲🇾' },
    { code: 'tl', name: 'Filipino', local: 'Wikang Filipino', flag: '🇵🇭' },
    { code: 'zh-CN', name: 'Chinese (Simplified)', local: '简体中文', flag: '🇨🇳' },
    { code: 'zh-TW', name: 'Chinese (Traditional)', local: '繁體中文', flag: '🇹🇼' },
    { code: 'ja', name: 'Japanese', local: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', local: '한국어', flag: '🇰🇷' },
    { code: 'hi', name: 'Hindi', local: 'हिन्दी', flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali', local: 'বাংলা', flag: '🇧🇩' },
    { code: 'ur', name: 'Urdu', local: 'اردو', flag: '🇵🇰' },
    { code: 'ta', name: 'Tamil', local: 'தமிழ்', flag: '🇱🇰' },
    { code: 'te', name: 'Telugu', local: 'తెలుగు', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', local: 'मराठी', flag: '🇮🇳' },
    { code: 'gu', name: 'Gujarati', local: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'kn', name: 'Kannada', local: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'ml', name: 'Malayalam', local: 'മലയാളം', flag: '🇮🇳' },
    { code: 'pa', name: 'Punjabi', local: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { code: 'ne', name: 'Nepali', local: 'नेपाली', flag: '🇳🇵' },
    { code: 'si', name: 'Sinhala', local: 'සිංහල', flag: '🇱🇰' }
  ]
};

// Flatten for quick search selection
const ALL_LANGUAGES = Object.values(REGIONS).flat();

const getFlagUrl = (code) => {
  if (!code) return 'https://flagcdn.com/w40/us.png';
  const mapping = {
    'my': 'mm', 'km': 'kh', 'lo': 'la', 'th': 'th', 'vi': 'vn', 'id': 'id', 'ms': 'my', 'tl': 'ph',
    'zh-CN': 'cn', 'zh-TW': 'tw', 'ja': 'jp', 'ko': 'kr',
    'hi': 'in', 'bn': 'bd', 'ur': 'pk', 'ta': 'lk', 'te': 'in', 'mr': 'in', 'gu': 'in', 'kn': 'in', 'ml': 'in', 'pa': 'in', 'ne': 'np', 'si': 'lk',
    'ru': 'ru', 'uk': 'ua', 'pl': 'pl', 'cs': 'cz', 'ro': 'ro', 'hu': 'hu', 'bg': 'bg', 'sr': 'rs', 'hr': 'hr', 'sk': 'sk', 'sl': 'si', 'lt': 'lt', 'lv': 'lv', 'et': 'ee', 'be': 'by', 'mk': 'mk', 'sq': 'al', 'bs': 'ba',
    'ar': 'sa', 'iw': 'il', 'fa': 'ir', 'tr': 'tr', 'ku': 'tr', 'az': 'az', 'ka': 'ge', 'hy': 'am', 'ps': 'af',
    'en': 'us', 'fr': 'fr', 'de': 'de', 'es': 'es', 'pt': 'pt', 'it': 'it', 'nl': 'nl', 'sv': 'se', 'no': 'no', 'da': 'dk', 'fi': 'fi', 'ga': 'ie', 'cy': 'gb', 'ca': 'es', 'is': 'is', 'el': 'gr'
  };
  const country = mapping[code] || code.split('-')[0].toLowerCase();
  return `https://flagcdn.com/w40/${country}.png`;
};

// Utility to generate a stylish short casing like 'eN' for English, 'zH' for Chinese, etc.
const getLanguageShortCode = (langCode) => {
  if (!langCode) return 'eN';
  const prefix = langCode.split('-')[0].toLowerCase();
  if (prefix === 'en') return 'eN';
  if (prefix === 'zh') return 'zH';
  if (prefix === 'my') return 'mY';
  if (prefix === 'vi') return 'vI';
  if (prefix === 'th') return 'tH';
  if (prefix === 'id') return 'iD';
  if (prefix === 'ms') return 'mS';
  if (prefix === 'ja') return 'jA';
  if (prefix === 'ko') return 'kO';
  if (prefix === 'es') return 'eS';
  if (prefix === 'fr') return 'fR';
  if (prefix === 'pt') return 'pT';
  if (prefix === 'ru') return 'rU';
  if (prefix === 'ar') return 'aR';
  if (prefix === 'hi') return 'hI';
  
  if (prefix.length >= 2) {
    return prefix[0].toLowerCase() + prefix[1].toUpperCase();
  }
  return prefix.toUpperCase();
};

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLang, setCurrentLang] = useState('en');
  const dropdownRef = useRef(null);

  const getCookie = (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  const getCurrentLangCode = () => {
    // 1. absolute source of truth is localStorage
    const saved = localStorage.getItem('user-language');
    if (saved) return saved;

    // 2. fallback to cookie
    const cookie = getCookie('googtrans');
    if (cookie) {
      const parts = cookie.split('/');
      if (parts.length >= 3) {
        return parts[2];
      }
    }
    return 'en';
  };

  const setTranslateCookie = (langCode) => {
    const value = `/en/${langCode}`;
    const date = new Date();
    date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
    const expires = `; expires=${date.toUTCString()}`;

    // Clean up all existing cookies under different potential domains to prevent duplicate entries
    const hostWithDot = `.${window.location.hostname}`;
    const domainsToClear = [
      '',
      window.location.hostname,
      hostWithDot
    ];

    // Attempt to clear parent domain if appropriate
    const hostnameParts = window.location.hostname.split('.');
    if (hostnameParts.length >= 2) {
      const mainDomain = hostnameParts.slice(-2).join('.');
      domainsToClear.push(mainDomain);
      domainsToClear.push(`.${mainDomain}`);
    }

    domainsToClear.forEach(domain => {
      const domStr = domain ? `; domain=${domain}` : '';
      document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC${domStr}`;
    });

    // Write new clean cookie with path=/ (Omit domain to support localhost and any subdomain seamlessly)
    document.cookie = `googtrans=${value}${expires}; path=/;`;

    // Also write it with host domain if it's not localhost
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      document.cookie = `googtrans=${value}${expires}; path=/; domain=.${window.location.hostname};`;
      document.cookie = `googtrans=${value}${expires}; path=/; domain=${window.location.hostname};`;
    }
  };

  useEffect(() => {
    // 1. Get current language and sync the cookie immediately on load so Google Translate reads it correctly
    const initialLang = getCurrentLangCode();
    setCurrentLang(initialLang);
    setTranslateCookie(initialLang);

    // 2. Set up programmatic Google Translate framework
    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = () => {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement({
            pageLanguage: 'en',
            autoDisplay: false,
          }, 'google_translate_element');
        }
      };

      // Hidden div target
      if (!document.getElementById('google_translate_element')) {
        const div = document.createElement('div');
        div.id = 'google_translate_element';
        div.style.display = 'none';
        document.body.appendChild(div);
      }

      // Add Translate script
      const script = document.createElement('script');
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else {
      // If already initialized, wait briefly for DOM to settle and sync the translate combo selection
      setTimeout(() => {
        const selectEl = document.querySelector('.goog-te-combo');
        if (selectEl && selectEl.value !== initialLang) {
          selectEl.value = initialLang;
          selectEl.dispatchEvent(new Event('change'));
        }
      }, 500);
    }
  }, []);

  // Handle outside Click to close the language modal
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (langCode) => {
    setCurrentLang(langCode);
    localStorage.setItem('user-language', langCode);
    setTranslateCookie(langCode);
    setIsOpen(false);

    // Try to trigger the change events on Google Translate combobox
    let selectEl = document.querySelector('.goog-te-combo');
    if (selectEl) {
      selectEl.value = langCode;
      selectEl.dispatchEvent(new Event('change'));
    } else {
      // If not yet present in DOM, poll for it up to 2.5 seconds to avoid hot refreshing
      let attempts = 0;
      const interval = setInterval(() => {
        selectEl = document.querySelector('.goog-te-combo');
        if (selectEl) {
          selectEl.value = langCode;
          selectEl.dispatchEvent(new Event('change'));
          clearInterval(interval);
        } else {
          attempts++;
          if (attempts > 25) { // 2.5 seconds
            clearInterval(interval);
            // Fallback reload
            window.location.reload();
          }
        }
      }, 100);
    }
  };

  // Find info about the current lang
  const currentLanguageObj = ALL_LANGUAGES.find(l => l.code === currentLang) || { name: 'English', flag: '🇺🇸', local: 'English' };

  return (
    <div className="language-switcher-root" ref={dropdownRef}>
      {/* Premium Pill Trigger */}
      <button 
        type="button" 
        className="lang-pill" 
        onClick={() => setIsOpen(!isOpen)}
        title="Choose language / 選擇語言"
      >
        <span className="lang-flag-circle">
          <img 
            src={getFlagUrl(currentLang)} 
            alt={currentLanguageObj.name} 
            className="real-flag-img" 
            referrerPolicy="no-referrer"
          />
        </span>
        <span className="lang-arrow">
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L4 4L7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>

      {/* Floating Category/Search Overlay Panel */}
      {isOpen && (
        <div className="lang-dropdown-panel bounce-in">
          <div className="panel-header-search">
            <div className="search-box-container">
              <svg className="search-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input 
                type="text" 
                placeholder="Search 67 languages..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <button type="button" className="clear-search" onClick={() => setSearchQuery('')}>×</button>
              )}
            </div>
          </div>

          <div className="languages-scroll-area">
            {searchQuery.trim() !== '' ? (
              // Search Mode
              <div className="search-results-list">
                {ALL_LANGUAGES.filter(lang => 
                  lang.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  lang.local.toLowerCase().includes(searchQuery.toLowerCase())
                ).map(lang => (
                  <button 
                    key={lang.code}
                    type="button" 
                    className={`lang-option-item ${currentLang === lang.code ? 'selected' : ''}`}
                    onClick={() => handleSelectLanguage(lang.code)}
                  >
                    <span className="option-flag">
                      <img 
                        src={getFlagUrl(lang.code)} 
                        alt={lang.name} 
                        className="real-flag-img-list" 
                        referrerPolicy="no-referrer"
                      />
                    </span>
                    <div className="option-info">
                      <span className="option-name">{lang.name}</span>
                      <span className="option-local">{lang.local}</span>
                    </div>
                    {currentLang === lang.code && <span className="option-check">✓</span>}
                  </button>
                ))}
              </div>
            ) : (
              // Region Category Mode
              Object.entries(REGIONS).map(([regionName, langs]) => (
                <div key={regionName} className="region-section">
                  <h4 className="region-title">{regionName}</h4>
                  <div className="region-grid">
                    {langs.map(lang => (
                      <button 
                        key={lang.code}
                        type="button" 
                        className={`lang-grid-item ${currentLang === lang.code ? 'selected' : ''}`}
                        onClick={() => handleSelectLanguage(lang.code)}
                      >
                        <span className="item-flag">
                          <img 
                            src={getFlagUrl(lang.code)} 
                            alt={lang.name} 
                            className="real-flag-img-list" 
                            referrerPolicy="no-referrer"
                          />
                        </span>
                        <div className="item-text-stack">
                          <span className="item-name">{lang.name}</span>
                          <span className="item-local">{lang.local}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Styled inline components to preserve premium presentation */}
      <style>{`
        /* Hide google translate visual top bar slop completely */
        .skiptranslate, iframe[id*="translate"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }
        body {
          top: 0 !important;
        }

        /* Hide Google Translate Tooltip and Rating */
        #goog-gt-tt, .goog-te-balloon-frame, .goog-tooltip, .goog-tooltip:hover {
          display: none !important;
          visibility: hidden !important;
        }
        .goog-text-highlight {
          background-color: transparent !important;
          border: none !important; 
          box-shadow: none !important;
        }

        .language-switcher-root {
          position: relative;
          display: inline-block;
          z-index: 10000;
        }

        .lang-pill {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(0, 113, 206, 0.15);
          padding: 4px 8px;
          border-radius: 20px;
          cursor: pointer;
          font-family: inherit;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .lang-pill:hover {
          background: #ffffff;
          transform: translateY(-0.5px);
          box-shadow: 0 6px 16px rgba(0, 113, 206, 0.12);
          border-color: rgba(0, 113, 206, 0.3);
        }

        .lang-flag-circle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 15px;
          background: #ffffff;
          border-radius: 2px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border: 1px solid rgba(0,0,0,0.06);
          overflow: hidden;
          flex-shrink: 0;
        }

        .real-flag-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 2px;
        }

        .real-flag-img-list {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 2px;
        }

        .lang-arrow {
          display: flex;
          align-items: center;
          color: #64748b;
          margin-left: 1px;
        }

        .lang-dropdown-panel {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          width: 250px;
          max-height: 320px;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 16px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.03);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        /* Support orientation adjustments on narrow viewports */
        @media (max-width: 360px) {
          .lang-dropdown-panel {
            width: 230px;
          }
        }

        .panel-header-search {
          padding: 8px;
          background: #f8fafc;
          border-bottom: 1px solid rgba(0,0,0,0.03);
        }

        .search-box-container {
          position: relative;
          display: flex;
          align-items: center;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 10px;
          padding: 0 8px;
          height: 32px;
        }

        .search-icon {
          color: #64748b;
          margin-right: 6px;
          flex-shrink: 0;
        }

        .search-box-container input {
          width: 100%;
          border: none;
          background: transparent;
          font-size: 11px;
          font-weight: 500;
          outline: none;
          color: #1e293b;
          padding: 0;
        }

        .clear-search {
          border: none;
          background: transparent;
          font-size: 14px;
          color: #94a3b8;
          cursor: pointer;
          font-weight: bold;
          padding: 0 4px;
        }

        .languages-scroll-area {
          flex: 1;
          overflow-y: auto;
          max-height: 240px;
          padding: 8px 4px;
        }

        /* Scrollbar aesthetics */
        .languages-scroll-area::-webkit-scrollbar {
          width: 4px;
        }
        .languages-scroll-area::-webkit-scrollbar-track {
          background: transparent;
        }
        .languages-scroll-area::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .search-results-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .lang-option-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 6px 8px;
          background: transparent;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s;
        }

        .lang-option-item:hover, .lang-option-item.selected {
          background: rgba(0, 113, 206, 0.04);
        }

        .option-flag {
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 15px;
          background: #ffffff;
          border-radius: 2px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          border: 1px solid rgba(0,0,0,0.06);
          line-height: 1;
          flex-shrink: 0;
        }

        .option-info {
          display: flex;
          flex-direction: column;
        }

        .option-name {
          font-size: 11px;
          font-weight: 700;
          color: #1e293b;
        }

        .option-local {
          font-size: 9px;
          color: #64748b;
          margin-top: 1px;
        }

        .option-check {
          margin-left: auto;
          font-weight: bold;
          color: #0071ce;
          font-size: 11px;
        }

        /* Categories Display style */
        .region-section {
          margin-bottom: 10px;
        }

        .region-title {
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #0071ce;
          padding-left: 6px;
          margin-bottom: 4px;
        }

        .region-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 4px;
        }

        .lang-grid-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px;
          background: #f8fafc;
          border: 1px solid rgba(0, 0, 0, 0.02);
          border-radius: 8px;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s;
        }

        .lang-grid-item:hover {
          background: #f1f5f9;
          border-color: rgba(0, 113, 206, 0.1);
        }

        .lang-grid-item.selected {
          background: rgba(0, 113, 206, 0.05);
          border-color: rgba(0, 113, 206, 0.2);
        }

        .item-flag {
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 15px;
          background: #ffffff;
          border-radius: 2px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          border: 1px solid rgba(0,0,0,0.06);
          line-height: 1;
          flex-shrink: 0;
        }

        .item-text-stack {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .item-name {
          font-size: 10.5px;
          font-weight: 700;
          color: #1e293b;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        .item-local {
          font-size: 8.5px;
          color: #64748b;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        .bounce-in {
          animation: langBounce 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes langBounce {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
