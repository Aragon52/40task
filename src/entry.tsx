import '../user-portal/src/index.css';

const hostname = (window.location.hostname || '').toLowerCase();
const pathname = (window.location.pathname || '').toLowerCase();
const search = (window.location.search || '').toLowerCase();
const hash = (window.location.hash || '').toLowerCase();

// Explicit portal triggers
const hasAdminQuery = search.includes('portal=admin') || search.includes('admin=true');
const hasAdminHash = hash.includes('portal=admin') || hash.includes('#admin');
const hasUserQuery = search.includes('portal=user') || search.includes('user=true');
const hasUserHash = hash.includes('portal=user') || hash.includes('#user');

const isAdminHost = hostname.startsWith('admin.') || (hostname.startsWith('admin-') && !hostname.includes('netlify.app'));
const isAdminRoute = pathname.startsWith('/admin') || pathname.includes('admin.html');

// User portal is the PRIMARY site by default unless explicitly routed to admin
const isAdmin = !hasUserQuery && !hasUserHash && Boolean(isAdminHost || isAdminRoute || hasAdminQuery || hasAdminHash);

try {
  localStorage.setItem('portal_mode', isAdmin ? 'admin' : 'user');
} catch (e) {
  // Ignore potential localStorage errors in sandbox
}

if (isAdmin) {
  // Dynamically load and mount the Admin Portal
  import('../admin-portal/src/main.tsx').catch((err) => {
    console.error('Failed to mount admin portal:', err);
  });
} else {
  // Seamlessly convert pathname (e.g. /login) to HashRouter route (/#/login) if accessed directly in production
  if (pathname !== '/' && !pathname.startsWith('/admin') && !pathname.includes('admin.html') && !hash) {
    try {
      window.history.replaceState(null, '', '/#' + pathname + (search || ''));
    } catch (e) {}
  }
  // Dynamically load and mount the User Portal (Primary Site)
  import('../user-portal/src/main.tsx').catch((err) => {
    console.error('Failed to mount user portal:', err);
  });
}

