// Debug helper - Add this to browser console to check auth status

// Check if token exists
const token = localStorage.getItem('officerToken');
const user = localStorage.getItem('officerUser');

console.log('=== AUTH DEBUG INFO ===');
console.log('Token exists:', !!token);
console.log('Token:', token ? token.substring(0, 50) + '...' : 'NONE');
console.log('User exists:', !!user);

if (user) {
  try {
    const userData = JSON.parse(user);
    console.log('User:', userData);
  } catch (e) {
    console.log('User data corrupted');
  }
}

// Check token expiration (if JWT)
if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token payload:', payload);
    console.log('Token expires:', new Date(payload.exp * 1000).toLocaleString());
    console.log('Token expired:', Date.now() > payload.exp * 1000);
  } catch (e) {
    console.log('Token is not a valid JWT');
  }
}

console.log('======================');

// To clear and restart:
// localStorage.clear(); location.reload();