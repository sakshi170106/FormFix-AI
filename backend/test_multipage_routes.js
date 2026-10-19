const http = require('http');
const path = require('path');

// Ensure test port
process.env.PORT = '5057';
const { app, server } = require('./server');

function makeRequest(pathname) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5057${pathname}`, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, headers: res.headers, body: data });
      });
    }).on('error', reject);
  });
}

async function runMultipageTests() {
  console.log('--- RUNNING MULTI-PAGE ROUTE & ASSET TESTS ---');
  let failures = 0;

  const routes = [
    { path: '/', expectedStatus: 200, title: 'FormFix AI' },
    { path: '/index.html', expectedStatus: 200, title: 'FormFix AI' },
    { path: '/features', expectedStatus: 200, title: 'Features — FormFix AI' },
    { path: '/features.html', expectedStatus: 200, title: 'Features — FormFix AI' },
    { path: '/how-it-works', expectedStatus: 200, title: 'How It Works — FormFix AI' },
    { path: '/how-it-works.html', expectedStatus: 200, title: 'How It Works — FormFix AI' },
    { path: '/reports', expectedStatus: 200, title: 'My Reports — FormFix AI' },
    { path: '/reports.html', expectedStatus: 200, title: 'My Reports — FormFix AI' },
    { path: '/login', expectedStatus: 200, title: 'Log In — FormFix AI' },
    { path: '/login.html', expectedStatus: 200, title: 'Log In — FormFix AI' },
    { path: '/signup', expectedStatus: 200, title: 'Sign Up — FormFix AI' },
    { path: '/signup.html', expectedStatus: 200, title: 'Sign Up — FormFix AI' },
    { path: '/styles.css', expectedStatus: 200, checkBody: '--color-midnight: #101329' },
    { path: '/i18n.js', expectedStatus: 200, checkBody: 'I18N_STORAGE_KEY' },
    { path: '/web.js', expectedStatus: 200, checkBody: 'AuthState' },
    { path: '/api/health', expectedStatus: 200, checkBody: '"success":true' }
  ];

  for (const r of routes) {
    try {
      const res = await makeRequest(r.path);
      const isStatusOk = res.status === r.expectedStatus;
      const isTitleOk = !r.title || res.body.includes(r.title);
      const isBodyOk = !r.checkBody || res.body.includes(r.checkBody);

      if (isStatusOk && isTitleOk && isBodyOk) {
        console.log(`  ✓ PASS: GET ${r.path} -> ${res.status}`);
      } else {
        console.error(`  ✗ FAIL: GET ${r.path} -> got ${res.status}, titleOk: ${isTitleOk}, bodyOk: ${isBodyOk}`);
        failures++;
      }
    } catch (err) {
      console.error(`  ✗ ERROR: GET ${r.path} -> ${err.message}`);
      failures++;
    }
  }

  server.close(() => {
    if (failures === 0) {
      console.log('\n>>> ALL MULTI-PAGE ROUTES AND ASSETS VERIFIED SUCCESSFULLY! <<<');
      process.exit(0);
    } else {
      console.error(`\n>>> MULTI-PAGE ROUTE TESTS FAILED WITH ${failures} ERROR(S) <<<`);
      process.exit(1);
    }
  });
}

setTimeout(runMultipageTests, 300);
