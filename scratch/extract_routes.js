const fs = require('fs');

function extract(filePath, prefix) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const results = [];
  let pending = '';

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) continue;
    pending += ' ' + trimmed;
    if (pending.includes(');')) {
      const match = pending.match(/(?:userRouter|commonRouter|router|app)\.(get|post|put|patch|delete)\s*\(\s*['"]([^'"]+)['"](.*)/);
      if (match) {
        const method = match[1].toUpperCase();
        const path = prefix + match[2];
        const rest = match[3];
        const isAuth = rest.includes('auth') || rest.includes('isLoggedIn');
        results.push({ method, path, isAuth });
      }
      pending = '';
    }
  }
  return results;
}

const user = extract('Backend/src/routes/UserRoute.js', '/api/user');
const common = extract('Backend/src/routes/CommonRoutes.js', '/api');
const admin = extract('Backend/src/routes/AdminRoute.js', '/api/admin');
const ecom = extract('Ecommerce_backend/src/routes/adminRoutes.js', '/ecommerce-api');

console.log('User Routes:', user.length);
console.log('Common Routes:', common.length);
console.log('Admin Routes:', admin.length);
console.log('Ecommerce Routes:', ecom.length);

fs.writeFileSync('scratch/all_routes.json', JSON.stringify({ user, common, admin, ecom }, null, 2));
console.log('Saved to scratch/all_routes.json');
