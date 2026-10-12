const hostname = (window.location.hostname || '').toLowerCase();
const pathname = (window.location.pathname || '').toLowerCase();

// Determine if the visitor is accessing the Admin Portal
const isAdmin = 
  hostname.startsWith('admin.') || 
  hostname.startsWith('admin-') || 
  hostname.includes('admin.walmark-retailshop.com') ||
  pathname === '/admin' || 
  pathname.startsWith('/admin/') || 
  pathname === '/admin.html';

if (isAdmin) {
  // Dynamically load and mount the Admin Portal
  import('../admin-portal/src/main.jsx');
} else {
  // Dynamically load and mount the User Portal
  import('../user-portal/src/main.jsx');
}
