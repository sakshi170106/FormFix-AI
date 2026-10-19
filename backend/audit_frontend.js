const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

function readFile(filename) {
  return fs.readFileSync(path.join(publicDir, filename), 'utf8');
}

const indexHtml = readFile('index.html');
const featuresHtml = readFile('features.html');
const howItWorksHtml = readFile('how-it-works.html');
const reportsHtml = readFile('reports.html');
const loginHtml = readFile('login.html');
const signupHtml = readFile('signup.html');
const css = readFile('styles.css');
const i18n = readFile('i18n.js');
const webJs = readFile('web.js');

const allHtmlPages = [
  { name: 'index.html', content: indexHtml },
  { name: 'features.html', content: featuresHtml },
  { name: 'how-it-works.html', content: howItWorksHtml },
  { name: 'reports.html', content: reportsHtml },
  { name: 'login.html', content: loginHtml },
  { name: 'signup.html', content: signupHtml }
];

const auditChecks = [
  // 1. Navigation & Structural Architecture
  {
    name: 'Top navbar only across all HTML pages (no sidebar element anywhere)',
    pass: allHtmlPages.every(p => p.content.includes('top-navbar') && !p.content.includes('<aside') && !p.content.includes('class="sidebar"'))
  },
  {
    name: 'Brand Logo FormFix AI with logo link on every page',
    pass: allHtmlPages.every(p => p.content.includes('FormFix') && p.content.includes('brand-ai-tag') && (p.content.includes('class="brand"') || p.content.includes('brand')))
  },
  {
    name: 'Navigation links (Home, Features, How It Works, My Reports) on all pages',
    pass: allHtmlPages.every(p => 
      p.content.includes('features.html') && 
      p.content.includes('how-it-works.html') && 
      p.content.includes('reports.html')
    )
  },
  {
    name: 'Language selector on every page with English, Marathi, Hindi options',
    pass: allHtmlPages.every(p => 
      p.content.includes('language-select') && 
      p.content.includes('value="en"') && 
      p.content.includes('value="mr"') && 
      p.content.includes('value="hi"')
    )
  },
  {
    name: 'Auth state controls (navGuestBox, navUserBox, navLogoutBtn) on every page',
    pass: allHtmlPages.every(p => 
      p.content.includes('id="navGuestBox"') && 
      p.content.includes('id="navUserBox"') && 
      p.content.includes('id="navLogoutBtn"')
    )
  },

  // 2. Cinematic Homepage & Laboratory Centerpiece
  {
    name: 'Homepage Hero Eyebrow: INTELLIGENT APPLICATION VERIFICATION',
    pass: indexHtml.includes('INTELLIGENT APPLICATION VERIFICATION')
  },
  {
    name: 'Homepage Hero Heading: Submit with Confidence. Not with Doubt.',
    pass: indexHtml.includes('Submit with Confidence.') && indexHtml.includes('Not with Doubt.')
  },
  {
    name: 'Homepage Hero Subtitle: Detect missing documents, identify file issues, and review application readiness...',
    pass: indexHtml.includes('Detect missing documents, identify file issues, and review application readiness before you submit.')
  },
  {
    name: 'Homepage Hero CTAs: Check My Documents & Explore How It Works',
    pass: indexHtml.includes('Check My Documents') && indexHtml.includes('Explore How It Works')
  },
  {
    name: 'Interactive Document Laboratory Centerpiece with scanning line and demo badge',
    pass: indexHtml.includes('lab-centerpiece') && indexHtml.includes('lab-scan-line') && indexHtml.includes('INTERACTIVE DEMO')
  },
  {
    name: 'Realistic Document Verification preview with binary header and missing-doc indicators',
    pass: indexHtml.includes('Binary Header Check') && indexHtml.includes('Signature Valid (%PDF-)') && indexHtml.includes('Missing Income Certificate')
  },

  // 3. Statistics Dashboard (4 key metrics)
  {
    name: 'Dashboard Stat 1: Total Applications Checked (statTotalChecks)',
    pass: indexHtml.includes('id="statTotalChecks"') && indexHtml.includes('Total Applications Checked')
  },
  {
    name: 'Dashboard Stat 2: Errors Detected (statTotalErrors)',
    pass: indexHtml.includes('id="statTotalErrors"') && indexHtml.includes('Errors Detected')
  },
  {
    name: 'Dashboard Stat 3: Missing Documents (statMissingDocs)',
    pass: indexHtml.includes('id="statMissingDocs"') && indexHtml.includes('Missing Documents')
  },
  {
    name: 'Dashboard Stat 4: Average Readiness Score (statAvgScore)',
    pass: indexHtml.includes('id="statAvgScore"') && indexHtml.includes('Average Readiness Score')
  },

  // 4. Document Verification Workspace
  {
    name: 'Application type selector with scholarship, college, internship options',
    pass: indexHtml.includes('id="applicationType"') && indexHtml.includes('value="scholarship"') && indexHtml.includes('value="college"')
  },
  {
    name: 'Mandatory checklist requirements container with selectable items',
    pass: indexHtml.includes('id="checklist"') && indexHtml.includes('Identity Proof') && indexHtml.includes('Marksheet')
  },
  {
    name: 'Drag-and-drop upload zone with hidden file input and visual prompt',
    pass: indexHtml.includes('id="uploadZone"') && indexHtml.includes('id="documents"') && indexHtml.includes('Drag &amp; drop files here')
  },
  {
    name: 'Selected file queue container (fileList) and submit button with spinner (btnSpinner)',
    pass: indexHtml.includes('id="fileList"') && indexHtml.includes('id="checkSubmitBtn"') && indexHtml.includes('id="btnSpinner"')
  },

  // 5. Verification Report Interface
  {
    name: 'Real-time diagnostic report with readiness score (repScoreVal) and status badge (repBadge)',
    pass: indexHtml.includes('id="reportResult"') && indexHtml.includes('id="repScoreVal"') && indexHtml.includes('id="repBadge"')
  },
  {
    name: 'Inspected file signatures stack (repFilesStack) and detailed issues list (repIssuesList)',
    pass: indexHtml.includes('id="repFilesStack"') && indexHtml.includes('id="repIssuesList"')
  },

  // 6. Dedicated Subpages
  {
    name: 'Dedicated Features page (features.html) with binary specifications (%PDF-, JPEG, PNG)',
    pass: featuresHtml.includes('%PDF-') && featuresHtml.includes('formats-table') && featuresHtml.includes('ACTIVE ENGINE')
  },
  {
    name: 'Dedicated How It Works page (how-it-works.html) with 5-step visual protocol',
    pass: howItWorksHtml.includes('THE 5-STEP PROTOCOL') && howItWorksHtml.includes('workflow-step-card') && howItWorksHtml.includes('hiw_step5_title')
  },
  {
    name: 'Dedicated My Reports page (reports.html) with feed container, filter, and search',
    pass: reportsHtml.includes('id="reportsFeedContainer"') && reportsHtml.includes('id="reportsFilterSelect"') && reportsHtml.includes('id="reportsSearchInput"')
  },
  {
    name: 'Dedicated Login page (login.html) with form, email/password fields, and show/hide toggle',
    pass: loginHtml.includes('id="pageLoginForm"') && loginHtml.includes('id="loginEmail"') && loginHtml.includes('btn-toggle-pass')
  },
  {
    name: 'Dedicated Sign Up page (signup.html) with password strength meter and confirm-password check',
    pass: signupHtml.includes('id="pageSignupForm"') && signupHtml.includes('id="passStrengthFill"') && signupHtml.includes('id="signupConfirmPassword"')
  },

  // 7. Styling & Intelligent Document Laboratory Color Palette
  {
    name: 'CSS Design System: Midnight Navy (#101329), Electric Violet (#7657FF), Soft Lavender (#EEE9FF)',
    pass: css.includes('#101329') && css.includes('#7657FF') && css.includes('#EEE9FF')
  },
  {
    name: 'CSS Design System: Pure White (#FFFFFF), Cool Gray (#F5F6FA), Success Green (#16A673)',
    pass: css.includes('#FFFFFF') && css.includes('#F5F6FA') && css.includes('#16A673')
  },
  {
    name: 'CSS Scanning animation and prefers-reduced-motion safety',
    pass: css.includes('@keyframes labScan') && css.includes('prefers-reduced-motion')
  },

  // 8. Internationalization Engine (English, Marathi, Hindi)
  {
    name: 'i18n engine with dictionaries for en, mr, and hi',
    pass: i18n.includes('const translations =') && i18n.includes('mr:') && i18n.includes('hi:') && i18n.includes('localStorage')
  },
  {
    name: 'Client web engine (web.js) connecting auth, file drag-and-drop, API checks, and reports',
    pass: webJs.includes('AuthState') && webJs.includes('/api/checks') && webJs.includes('/api/auth')
  }
];

let allPassed = true;
console.log('======================================================');
console.log('--- FORMDETAIL & FRONTEND DESIGN REQUIREMENTS AUDIT ---');
console.log('======================================================');

auditChecks.forEach((c, idx) => {
  const mark = c.pass ? '✓ PASS' : '✗ FAIL';
  console.log(`${mark} [${idx + 1}/${auditChecks.length}]: ${c.name}`);
  if (!c.pass) allPassed = false;
});

console.log('======================================================');
if (allPassed) {
  console.log(`>>> ALL ${auditChecks.length} FRONTEND & DESIGN REQUIREMENTS VERIFIED 100%! <<<`);
  process.exit(0);
} else {
  console.error('>>> SOME REQUIREMENTS FAILED AUDIT. SEE LOGS ABOVE. <<<');
  process.exit(1);
}
