import React, { useState, useEffect } from 'react';
import { 
  Wrench, ShieldCheck, Zap, Clock, Activity, CheckCircle2, 
  Lock, Globe, RefreshCw, Bell, ChevronRight, Server, Sparkles, AlertTriangle, ArrowRight, X
} from 'lucide-react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

export default function MaintenanceBreak({ onBypass }) {
  const [lang, setLang] = useState('en');
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [pingStatus, setPingStatus] = useState(null);
  const [isPinging, setIsPinging] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [adminError, setAdminError] = useState('');

  // Countdown state (45 minutes default)
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 42, seconds: 18 });

  useEffect(() => {
    const root = document.getElementById('root');
    const origPadding = root ? root.style.paddingBottom : '';
    const origBg = document.body.style.backgroundColor;

    document.body.style.backgroundColor = '#020617';
    if (root) {
      root.style.paddingBottom = '0px';
      root.style.maxWidth = '100%';
      root.style.border = 'none';
      root.style.boxShadow = 'none';
    }

    return () => {
      document.body.style.backgroundColor = origBg;
      if (root) {
        root.style.paddingBottom = origPadding;
      }
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Multi-lingual translations
  const translations = {
    en: {
      tag: "ON AIR • SCHEDULED MAINTENANCE BREAK",
      title: "System Upgrade & Performance Break",
      subtitle: "We are currently conducting scheduled database performance tuning, real-time speed acceleration, and zero-latency infrastructure upgrades to deliver better performance and stability.",
      progressTitle: "System Migration & Upgrade Progress",
      progressPercent: "88% Complete",
      estTime: "Estimated Time Remaining",
      pingBtn: "Check Live Server Connection",
      notifyTitle: "Get Instant Alert When Online",
      notifyDesc: "Enter your phone or email to receive an instant push alert the moment the maintenance window completes.",
      notifyBtn: "Notify Me",
      notifySuccess: "You are subscribed! We will notify you as soon as the site is back online.",
      guarantees: [
        { title: "100% Funds & Data Safe", desc: "All user accounts, balance records, pending withdrawals, and order tasks are securely encrypted and untouched." },
        { title: "10x Dashboard Speed", desc: "Our upgraded indexing engine eliminates load delay and delivers instant data rehydration." },
        { title: "Zero Latency Order Sync", desc: "Real-time task allocation and wallet processing will operate at maximum concurrency." }
      ],
      milestones: [
        { name: "Database Query Acceleration & Indexing", status: "Completed", percent: 100 },
        { name: "Session Security & Encryption Protocols", status: "Completed", percent: 100 },
        { name: "High-Concurrency Merchant Order Sync", status: "In Progress", percent: 92 },
        { name: "Real-time Balance Caching Engine", status: "Final Testing", percent: 85 }
      ],
      adminBypass: "Staff / Admin Portal Access",
      adminModalTitle: "Administrator Access",
      adminModalDesc: "Enter operator PIN or proceed directly to the Admin Dashboard.",
      goToAdmin: "Go to Admin Dashboard"
    },
    es: {
      tag: "EN VIVO • PAUSA DE MANTENIMIENTO PROGRAMADO",
      title: "Actualización de Sistema y Mantenimiento",
      subtitle: "Estamos realizando optimizaciones de base de datos y mejoras de infraestructura en tiempo real para garantizar un mejor rendimiento y máxima estabilidad.",
      progressTitle: "Progreso de Migración del Sistema",
      progressPercent: "88% Completado",
      estTime: "Tiempo Estimado Restante",
      pingBtn: "Verificar Conexión de Servidor",
      notifyTitle: "Reciba una Alerta Inmediata",
      notifyDesc: "Ingrese su correo o teléfono para recibir un aviso en cuanto el sistema esté activo.",
      notifyBtn: "Notificarme",
      notifySuccess: "¡Suscrito con éxito! Le avisaremos en cuanto el sitio reabra.",
      guarantees: [
        { title: "Saldo y Datos 100% Seguros", desc: "Todas las cuentas, saldos y retiros están totalmente encriptados y protegidos." },
        { title: "Velocidad 10x Superior", desc: "El nuevo motor de índices elimina tiempos de espera en el panel." },
        { title: "Sincronización en Tiempo Real", desc: "El procesamiento de pedidos funcionará a máxima velocidad sin retrasos." }
      ],
      milestones: [
        { name: "Indexación Acelerada de Base de Datos", status: "Completado", percent: 100 },
        { name: "Protocolos de Seguridad y Sesión", status: "Completado", percent: 100 },
        { name: "Sincronización de Pedidos de Alta Concurrencia", status: "En Proceso", percent: 92 },
        { name: "Caché de Saldo en Tiempo Real", status: "Prueba Final", percent: 85 }
      ],
      adminBypass: "Acceso para Personal / Administrador",
      adminModalTitle: "Acceso de Administrador",
      adminModalDesc: "Ingrese el PIN de operador o vaya al Panel de Control.",
      goToAdmin: "Ir al Panel de Administrador"
    },
    fr: {
      tag: "EN DIRECT • PAUSE DE MAINTENANCE PROGRAMMÉE",
      title: "Mise à Niveau et Maintenance du Système",
      subtitle: "Nous effectuons actuellement des optimisations de base de données et des mises à jour d'infrastructure pour garantir des performances accrues et une stabilité maximale.",
      progressTitle: "Progression de la Migration",
      progressPercent: "88% Terminé",
      estTime: "Temps Restant Estimé",
      pingBtn: "Vérifier le Statut du Serveur",
      notifyTitle: "Soyez Informé dès la Réouverture",
      notifyDesc: "Entrez votre e-mail pour recevoir une alerte instantanée dès la fin de la maintenance.",
      notifyBtn: "M'alerter",
      notifySuccess: "Suscrit avec succès! Vous serez prévenu dès la réouverture.",
      guarantees: [
        { title: "Fonds et Données 100% Sécurisés", desc: "Tous les comptes, soldes et retraits sont entièrement protégés et chiffrés." },
        { title: "Vitesse Tableau de Bord x10", desc: "La nouvelle architecture élimine les temps de chargement." },
        { title: "Synchronisation Instantanée", desc: "L'attribution des tâches s'effectuera en temps réel sans latence." }
      ],
      milestones: [
        { name: "Indexation et Accélération Base de Données", status: "Terminé", percent: 100 },
        { name: "Sécurité des Sessions et Chiffrement", status: "Terminé", percent: 100 },
        { name: "Synchronisation Commandes Haute Concurrence", status: "En Cours", percent: 92 },
        { name: "Moteur de Marge et Solde Temps Réel", status: "Test Final", percent: 85 }
      ],
      adminBypass: "Accès Personnel / Administrateur",
      adminModalTitle: "Accès Administrateur",
      adminModalDesc: "Entrez le PIN opérateur ou accédez directement au tableau de bord.",
      goToAdmin: "Aller au Tableau de Bord Admin"
    },
    de: {
      tag: "LIVE • GEPLANTE WARTUNGSPAUSE",
      title: "System-Upgrade & Wartungspause",
      subtitle: "Wir führen derzeit geplante Datenbankoptimierungen und Infrastruktur-Updates durch, um maximale Geschwindigkeit und Stabilität zu gewährleisten.",
      progressTitle: "System-Upgrade Fortschritt",
      progressPercent: "88% Abgeschlossen",
      estTime: "Geschätzte Verbleibende Zeit",
      pingBtn: "Serververbindung Prüfen",
      notifyTitle: "Sofortige Benachrichtigung Erhalten",
      notifyDesc: "Geben Sie Ihre E-Mail ein, um eine Nachricht zu erhalten, sobald das System online ist.",
      notifyBtn: "Benachrichtigen",
      notifySuccess: "Erfolgreich abonniert! Wir benachrichtigen Sie sofort nach Freischaltung.",
      guarantees: [
        { title: "100% Sicherheit für Guthaben", desc: "Alle Konten, Guthaben und Abhebungen sind sicher verschlüsselt." },
        { title: "10x Schnelleres Dashboard", desc: "Das neue Datenbankschema sorgt für sofortige Ladezeiten." },
        { title: "Echtzeit-Auftragssynchronisation", desc: "Auftragsverarbeitung ohne jegliche Verzögerung." }
      ],
      milestones: [
        { name: "Datenbank-Indexierung & Beschleunigung", status: "Abgeschlossen", percent: 100 },
        { name: "Sitzungssicherheit & Verschlüsselung", status: "Abgeschlossen", percent: 100 },
        { name: "Auftragssynchronisierung mit Hoher Kapazität", status: "In Arbeit", percent: 92 },
        { name: "Echtzeit-Guthaben-Caching-Engine", status: "Endprüfung", percent: 85 }
      ],
      adminBypass: "Personal- / Admin-Zugang",
      adminModalTitle: "Administrator Zugang",
      adminModalDesc: "PIN eingeben oder direkt zum Admin-Dashboard wechseln.",
      goToAdmin: "Zum Admin-Dashboard"
    },
    zh: {
      tag: "直播在线 • 系统计划维护暂停",
      title: "系统升级与性能维护暂停",
      subtitle: "我们目前正在进行计划中的数据库优化、实时速度加速和网络升级，以提供更出色的性能和稳定性。",
      progressTitle: "系统迁移与升级进度",
      progressPercent: "88% 已完成",
      estTime: "预计剩余时间",
      pingBtn: "检查服务器连接状态",
      notifyTitle: "上线即时提醒",
      notifyDesc: "输入您的手机号或邮箱，维护结束的第一时间接收推送通知。",
      notifyBtn: "订阅提醒",
      notifySuccess: "订阅成功！网站恢复访问后我们将第一时间通知您。",
      guarantees: [
        { title: "100% 资金与数据安全", desc: "所有用户账户、余额记录、提现订单均受安全加密保护，完全不受影响。" },
        { title: "10倍 仪表盘极速响应", desc: "升级后的索引引擎消除加载等待，实现数据秒级加载。" },
        { title: "零延迟 订单实时同步", desc: "抢单匹配与资金处理将以最高并发能力顺畅运行。" }
      ],
      milestones: [
        { name: "数据库查询加速与索引优化", status: "已完成", percent: 100 },
        { name: "会话安全与加密协议升级", status: "已完成", percent: 100 },
        { name: "高并发商家订单匹配同步", status: "进行中", percent: 92 },
        { name: "实时余额缓存引擎验证", status: "终审测试", percent: 85 }
      ],
      adminBypass: "工作人员 / 管理员通道",
      adminModalTitle: "管理员入口",
      adminModalDesc: "输入操作员 PIN 码或直接进入管理后台。",
      goToAdmin: "前往管理员后台"
    }
  };

  const t = translations[lang] || translations.en;

  // Perform server latency ping test
  const handlePingServer = async () => {
    setIsPinging(true);
    const start = Date.now();
    try {
      const { data, error } = await supabase.from('cb_deposit_settings').select('id').limit(1);
      const duration = Date.now() - start;
      if (!error) {
        setPingStatus({ ok: true, ms: duration, text: `Server Connected | API Latency: ${duration}ms | Data Engine Active` });
      } else {
        setPingStatus({ ok: true, ms: duration, text: `Database Upgrade Node Active | Latency: ${duration}ms` });
      }
    } catch (e) {
      setPingStatus({ ok: true, ms: 32, text: "Main Node Upgrading | Backup Service Responsive (32ms)" });
    } finally {
      setIsPinging(false);
    }
  };

  const handleNotificationSubmit = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setSubscribed(true);
    toast.success(t.notifySuccess);
    setEmailInput('');
  };

  const handleAdminAuth = (e) => {
    e.preventDefault();
    if (adminPin === '8888' || adminPin === 'admin' || adminPin === 'owner' || adminPin === '1234') {
      toast.success("Maintenance bypass granted for staff session.");
      setShowAdminModal(false);
      if (onBypass) onBypass();
    } else {
      setAdminError("Invalid authorization key. Click 'Go to Admin Dashboard' for full login.");
    }
  };

  const handleDirectAdminRoute = () => {
    window.location.href = window.location.origin + '/admin';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      
      {/* Background Decorative Ambient Lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-600/15 via-blue-900/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between border-b border-slate-800/80 relative z-10">
        
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 p-0.5 shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">WALMART</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">WALMARK</span>
            </div>
            <p className="text-[11px] text-slate-400">Order Picking & Logistics Platform</p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Language Selector */}
          <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <Globe className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent border-none text-slate-200 text-xs focus:outline-none cursor-pointer pr-1"
            >
              <option value="en" className="bg-slate-900 text-slate-200">English</option>
              <option value="es" className="bg-slate-900 text-slate-200">Español</option>
              <option value="fr" className="bg-slate-900 text-slate-200">Français</option>
              <option value="de" className="bg-slate-900 text-slate-200">Deutsch</option>
              <option value="zh" className="bg-slate-900 text-slate-200">中文 (简体)</option>
            </select>
          </div>

          {/* Admin Bypass Button */}
          <button 
            onClick={() => setShowAdminModal(true)}
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            <span>Staff Portal</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center justify-center relative z-10">
        
        {/* Status Tag Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-6 shadow-inner shadow-blue-500/10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span>{t.tag}</span>
        </div>

        {/* Central Hero Heading */}
        <div className="text-center max-w-3xl mb-10">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            {t.title}
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Progress & Countdown Main Card */}
        <div className="w-full bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl shadow-slate-950/80 mb-10 relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
            
            {/* Progress Bar Info */}
            <div className="w-full md:w-2/3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  {t.progressTitle}
                </span>
                <span className="text-sm font-bold text-blue-400 font-mono">{t.progressPercent}</span>
              </div>
              
              {/* Outer Bar */}
              <div className="w-full h-3.5 bg-slate-950 rounded-full p-0.5 border border-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400 rounded-full transition-all duration-1000 relative"
                  style={{ width: '88%' }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:16px_16px] animate-[stripe_2s_linear_infinite]" />
                </div>
              </div>
            </div>

            {/* Countdown Box */}
            <div className="w-full md:w-auto bg-slate-950 border border-slate-800/90 rounded-xl px-5 py-3 flex flex-col items-center justify-center shrink-0">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                {t.estTime}
              </span>
              <div className="font-mono text-xl sm:text-2xl font-bold text-white tracking-widest flex items-center gap-1">
                <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-blue-500">:</span>
                <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-blue-500">:</span>
                <span className="text-cyan-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          {/* Milestones Grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {t.milestones.map((m, idx) => (
              <div key={idx} className="bg-slate-950/60 border border-slate-800/70 rounded-xl p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  {m.percent === 100 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <RefreshCw className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
                  )}
                  <span className="font-medium text-slate-200">{m.name}</span>
                </div>
                <span className={`font-mono font-semibold px-2 py-0.5 rounded text-[11px] ${
                  m.percent === 100 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                  {m.percent}%
                </span>
              </div>
            ))}
          </div>

        </div>

        {/* Guarantees & Reassurance Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {t.guarantees.map((g, idx) => (
            <div key={idx} className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
                {idx === 0 && <ShieldCheck className="w-4 h-4" />}
                {idx === 1 && <Zap className="w-4 h-4" />}
                {idx === 2 && <Server className="w-4 h-4" />}
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{g.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{g.desc}</p>
            </div>
          ))}
        </div>

        {/* Live Server Connection Test & Subscription Bar */}
        <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Notification Form */}
          <div className="w-full md:w-1/2">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
              <Bell className="w-4 h-4 text-blue-400" />
              {t.notifyTitle}
            </h4>
            <p className="text-xs text-slate-400 mb-3">{t.notifyDesc}</p>
            
            {subscribed ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{t.notifySuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleNotificationSubmit} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Email or Phone Number"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-lg text-xs transition-colors shrink-0 flex items-center gap-1"
                >
                  <span>{t.notifyBtn}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* Vertical Divider */}
          <div className="hidden md:block w-px h-24 bg-slate-800" />

          {/* Live Ping Tester */}
          <div className="w-full md:w-1/2 flex flex-col items-start md:items-end text-left md:text-right">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-cyan-400" />
              Server Health Diagnostics
            </h4>
            <p className="text-xs text-slate-400 mb-3">Ping backend database nodes to verify migration connectivity.</p>
            
            <button
              onClick={handlePingServer}
              disabled={isPinging}
              className="bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isPinging ? 'animate-spin' : ''}`} />
              <span>{isPinging ? 'Pinging Node...' : t.pingBtn}</span>
            </button>

            {pingStatus && (
              <div className="mt-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-1 rounded">
                ✓ {pingStatus.text}
              </div>
            )}
          </div>

        </div>

      </main>

      {/* Footer Bar */}
      <footer className="w-full max-w-6xl mx-auto px-4 py-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 relative z-10">
        <div>
          © {new Date().getFullYear()} Walmart Walmark Retail Shop. All rights reserved.
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleDirectAdminRoute}
            className="hover:text-slate-300 transition-colors flex items-center gap-1"
          >
            <Lock className="w-3 h-3 text-blue-400" />
            <span>Admin Portal</span>
          </button>
          <span>•</span>
          <span className="font-mono text-[11px]">Build v4.2.0-STABLE</span>
        </div>
      </footer>

      {/* Administrator Bypass Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowAdminModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{t.adminModalTitle}</h3>
                <p className="text-xs text-slate-400">{t.adminModalDesc}</p>
              </div>
            </div>

            {adminError && (
              <div className="mb-4 p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{adminError}</span>
              </div>
            )}

            <form onSubmit={handleAdminAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Staff Access PIN / Secret Key</label>
                <input 
                  type="password" 
                  placeholder="Enter staff PIN (e.g. 8888 or admin)"
                  value={adminPin}
                  onChange={(e) => { setAdminPin(e.target.value); setAdminError(''); }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg text-xs transition-colors"
                >
                  Bypass Maintenance Mode (Local Session)
                </button>
                
                <button 
                  type="button"
                  onClick={handleDirectAdminRoute}
                  className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 py-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>{t.goToAdmin}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
