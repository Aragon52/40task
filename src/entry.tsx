const hostname = (window.location.hostname || '').toLowerCase();
const pathname = (window.location.pathname || '').toLowerCase();
const search = (window.location.search || '').toLowerCase();
const hash = (window.location.hash || '').toLowerCase();

// Explicit user request: Open Admin Portal in preview window
const forceUser = pathname.startsWith('/user') || search.includes('portal=user') || hash.includes('portal=user') || localStorage.getItem('portal_mode') === 'user';

// Default to true (Admin Portal) per user request
const isAdmin = forceUser ? false : true;

try {
  localStorage.setItem('portal_mode', isAdmin ? 'admin' : 'user');
} catch (e) {}

if (isAdmin) {
  // Dynamically load and mount the Admin Portal
  import('../admin-portal/src/main.tsx');
} else {
  // Dynamically load and mount the User Portal
  import('../user-portal/src/main.tsx');
}
