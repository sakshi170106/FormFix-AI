/**
 * FormFix AI — Multilingual Internationalization (i18n) Engine
 * Supported Languages: English (en), Marathi (mr), Hindi (hi)
 * Persists selection via localStorage and updates all [data-i18n] elements immediately.
 */
"use strict";

const I18N_STORAGE_KEY = "formfix_lang";

const translations = {
  en: {
    // Brand & Tagline
    brand_name: "FormFix AI",
    brand_tagline: "Every Detail Matters. Every Application Deserves a Second Chance.",

    // Navbar
    nav_home: "Home",
    nav_features: "Features",
    nav_how_it_works: "How It Works",
    nav_reports: "My Reports",
    nav_login: "Log In",
    nav_signup: "Sign Up",
    nav_logout: "Log Out",
    nav_check_cta: "Check Application",

    // Hero Section
    hero_eyebrow: "INTELLIGENT APPLICATION VERIFICATION",
    hero_title_1: "Submit with Confidence.",
    hero_title_2: "Not with Doubt.",
    hero_subtitle: "Detect missing documents, identify file issues, and review application readiness before you submit.",
    hero_cta_primary: "Check My Documents",
    hero_cta_secondary: "Explore How It Works",
    hero_trust_badge: "Verified File Intelligence · Magic Bytes & Checklist Validation",

    // Lab Centerpiece (Homepage Preview)
    lab_preview_badge: "INTERACTIVE DEMO",
    lab_doc_title: "Candidate Document Audit",
    lab_status_scanning: "Binary Scan Active...",
    lab_status_verified: "Signature Valid (%PDF-)",
    lab_status_corrupted: "Invalid Header Detected",
    lab_status_missing: "Missing Income Certificate",
    lab_readiness_label: "READINESS SCORE",
    lab_readiness_sub: "Target: 80% or higher",
    lab_simulated_note: "Live Simulated Preview. Real audits are performed in the workspace below.",

    // Dashboard & Metrics
    dash_eyebrow: "AUDIT ANALYTICS",
    dash_heading: "Application Dashboard",
    dash_subtitle: "Real-time verification metrics and quality overview across submissions.",
    dash_total_checks: "Total Applications Checked",
    dash_errors_detected: "Errors Detected",
    dash_missing_docs: "Missing Documents",
    dash_avg_score: "Average Readiness Score",
    dash_sub_total: "Lifetime verified checks",
    dash_sub_errors: "Binary signature & extension issues",
    dash_sub_missing: "Required certificates omitted",
    dash_sub_score: "Overall application health",
    dash_guest_notice: "You are in guest mode. Log in to permanently record and access your application reports.",

    // Verification Workspace
    ws_eyebrow: "VERIFICATION WORKSPACE",
    ws_heading: "Audit Your Application Documents",
    ws_subtitle: "Upload supporting PDFs or images. FormFix AI inspects binary headers and verifies mandatory requirements.",
    ws_app_type_label: "Application Type",
    ws_app_name_label: "Applicant / Application Title (Optional)",
    ws_app_name_placeholder: "e.g., National Merit Scholarship - Sakshi P.",
    ws_opt_scholarship: "Scholarship Application",
    ws_opt_college: "College / University Admission",
    ws_opt_internship: "Internship & Job Application",
    ws_opt_other: "Other Official Application",
    ws_checklist_label: "Mandatory Checklist Requirements",
    ws_checklist_hint: "Items marked for your application category. Select the documents required for your submission.",
    ws_chk_identity: "Identity Proof (Aadhaar, Passport, PAN)",
    ws_chk_marksheet: "Marksheet / Academic Transcript",
    ws_chk_photo: "Passport Size Photograph",
    ws_chk_signature: "Signature Specimen",
    ws_chk_income: "Income / Domicile Certificate",
    ws_dropzone_title: "Drag & drop files here, or",
    ws_dropzone_browse: "browse from device",
    ws_dropzone_sub: "Accepts genuine PDF, JPG, PNG · Up to 5 MB per file · Up to 10 files",
    ws_btn_submit: "Run Document Verification",
    ws_btn_submitting: "Auditing Document Laboratory...",
    ws_empty_file_warn: "Please select at least one document to audit.",

    // Report Result
    rep_eyebrow: "AUDIT REPORT",
    rep_heading: "Verification Diagnosis",
    rep_badge_ready: "READY TO SUBMIT",
    rep_badge_review: "REVIEW REQUIRED",
    rep_badge_action: "ACTION NEEDED",
    rep_score_headline_ready: "Application is in Excellent Condition",
    rep_score_headline_review: "Application Has Minor Issues",
    rep_score_headline_action: "Action Required Before Submission",
    rep_sec_files: "Inspected Files & Signatures",
    rep_sec_missing: "Missing Mandatory Documents",
    rep_sec_issues: "Detailed Issues & Corrective Guidance",
    rep_btn_new: "Start New Check",
    rep_btn_print: "Print / Save PDF Report",
    rep_btn_view_history: "View In My Reports",

    // Reports Page (reports.html)
    rep_page_title: "My Reports",
    rep_page_subtitle: "Comprehensive history of all your audited applications and quality scores.",
    rep_search_placeholder: "Search applications by name or type...",
    rep_filter_all: "All Reports",
    rep_filter_ready: "Ready (≥ 80%)",
    rep_filter_review: "Needs Review (< 80%)",
    rep_sort_newest: "Sort: Newest First",
    rep_sort_oldest: "Sort: Oldest First",
    rep_sort_score_high: "Sort: Highest Score",
    rep_sort_score_low: "Sort: Lowest Score",
    rep_empty_title: "No verification reports found",
    rep_empty_desc: "Run a check from the homepage workspace to generate your first audit report.",
    rep_empty_cta: "Audit Your First Application",
    rep_guest_title: "Authentication Required",
    rep_guest_desc: "Please log in to review your private document verification history.",
    rep_guest_btn: "Log In to View Reports",

    // Features Page (features.html)
    feat_hero_eyebrow: "SYSTEM CAPABILITIES",
    feat_hero_title: "Built for Flawless Submissions",
    feat_hero_sub: "Engineered specifically to protect applicants from bureaucratic rejection, file corruption, and missed deadlines.",
    feat_1_title: "PDF & Image Binary Verification",
    feat_1_desc: "Scans actual magic bytes (%PDF-, JPEG 0xFFD8FF, PNG) instead of blindly relying on file extensions.",
    feat_2_title: "Missing Document Heuristics",
    feat_2_desc: "Evaluates uploaded documents against strict scholarship, admission, and job checklist criteria.",
    feat_3_title: "Readiness Scoring Engine",
    feat_3_desc: "An objective 0–100 scale evaluating complete file integrity and checklist compliance.",
    feat_4_title: "Actionable Guidance, Not Guesswork",
    feat_4_desc: "Pinpoints exactly which file is corrupt, mismatched, or missing with clear correction steps.",
    feat_5_title: "Stateless JWT Security",
    feat_5_desc: "Private Bearer tokens and 12-round bcrypt password encryption keep applicant data confidential.",
    feat_6_title: "Zero-Data Retention Choice",
    feat_6_desc: "Guest audits are performed securely without storing files permanently on cloud disks.",

    // How It Works Page (how-it-works.html)
    hiw_hero_eyebrow: "THE 5-STEP PROTOCOL",
    hiw_hero_title: "How FormFix AI Verifies Applications",
    hiw_hero_sub: "A transparent, structured workflow designed to catch errors before official reviewers see them.",
    hiw_step1_num: "01",
    hiw_step1_title: "Choose Your Application Track",
    hiw_step1_desc: "Select Scholarship, College Admission, Internship, or Custom to activate tailored checklist rules.",
    hiw_step2_num: "02",
    hiw_step2_title: "Upload Supporting Documents",
    hiw_step2_desc: "Drag and drop your PDF certificates, marksheets, identity cards, and photographs into the laboratory workspace.",
    hiw_step3_num: "03",
    hiw_step3_title: "Execute Deep Binary Verification",
    hiw_step3_desc: "FormFix AI reads raw byte headers, checks integrity against declared mime types, and catches renamed text files.",
    hiw_step4_num: "04",
    hiw_step4_title: "Review Detected Issues & Checklist",
    hiw_step4_desc: "Receive an immediate diagnostic report with color-coded badges indicating valid, warning, or error states.",
    hiw_step5_num: "05",
    hiw_step5_title: "Fix Errors & Submit With Confidence",
    hiw_step5_desc: "Replace flagged files, confirm missing items, and export your verification record for peace of mind.",

    // Auth Pages (login.html & signup.html)
    auth_login_title: "Welcome Back",
    auth_login_sub: "Access your application audits, reports, and real-time dashboard.",
    auth_signup_title: "Create Your Account",
    auth_signup_sub: "Start verifying applications and track submission readiness with FormFix AI.",
    auth_name_label: "Full Name",
    auth_name_placeholder: "Enter your legal full name",
    auth_email_label: "Email Address",
    auth_email_placeholder: "you@example.com",
    auth_pass_label: "Password",
    auth_pass_placeholder: "At least 8 characters",
    auth_confirm_pass_label: "Confirm Password",
    auth_confirm_pass_placeholder: "Re-enter your password",
    auth_show_pass: "Show",
    auth_hide_pass: "Hide",
    auth_btn_login: "Log In to Workspace",
    auth_btn_signup: "Create Free Account",
    auth_submitting: "Authenticating...",
    auth_have_account: "Already have an account?",
    auth_no_account: "Don't have an account yet?",
    auth_link_login: "Log In",
    auth_link_signup: "Sign Up for Free",
    auth_strength_weak: "Weak password",
    auth_strength_medium: "Moderate password",
    auth_strength_strong: "Strong password",
    auth_pass_mismatch: "Passwords do not match.",

    // Footer
    footer_tagline: "Intelligent document verification platform. Every detail matters.",
    footer_nav_heading: "Navigation",
    footer_legal_heading: "Integrity & Privacy",
    footer_disclaimer: "FormFix AI is an automated preparatory auditing tool. Always verify mandatory rules with your official admissions or granting authority.",
    footer_rights: "© 2026 FormFix AI. All rights reserved."
  },

  // MARATHI TRANSLATIONS
  mr: {
    brand_name: "फॉर्मफिक्स एआय",
    brand_tagline: "प्रत्येक तपशील महत्त्वाचा आहे. प्रत्येक अर्जाला दुसरी संधी मिळायला हवी.",

    nav_home: "मुख्यपृष्ठ",
    nav_features: "वैशिष्ट्ये",
    nav_how_it_works: "कार्यपद्धती",
    nav_reports: "माझे अहवाल",
    nav_login: "लॉगिन",
    nav_signup: "साइन अप",
    nav_logout: "लॉग आउट",
    nav_check_cta: "अर्ज तपासा",

    hero_eyebrow: "प्रगत अर्ज पडताळणी प्रणाली",
    hero_title_1: "आत्मविश्वासाने सादर करा.",
    hero_title_2: "संशयाने नाही.",
    hero_subtitle: "अर्ज सादर करण्यापूर्वी गहाळ कागदपत्रे शोधा, फाईल त्रुटी ओळखा आणि अर्जाची तयारी तपासा.",
    hero_cta_primary: "माझे दस्तऐवज तपासा",
    hero_cta_secondary: "कार्यपद्धती जाणून घ्या",
    hero_trust_badge: "सत्यापित फाईल पडताळणी · मॅजिक बाइट्स आणि चेकलिस्ट सत्यापन",

    lab_preview_badge: "थेट प्रात्यक्षिक",
    lab_doc_title: "उमेदवार दस्तऐवज तपासणी",
    lab_status_scanning: "बायनरी स्कॅनिंग सुरू आहे...",
    lab_status_verified: "स्वाक्षरी वैध (%PDF-)",
    lab_status_corrupted: "अवैध फाईल हेडर आढळले",
    lab_status_missing: "उत्पन्नाचा दाखला गहाळ",
    lab_readiness_label: "तयारी गुण",
    lab_readiness_sub: "लक्ष्य: ८०% किंवा अधिक",
    lab_simulated_note: "हे केवळ प्रात्यक्षिक आहे. वास्तविक तपासणी खालील वर्कस्पेसमध्ये केली जाते.",

    dash_eyebrow: "तपासणी विश्लेषण",
    dash_heading: "अर्ज डॅशबोर्ड",
    dash_subtitle: "सादर केलेल्या सर्व तपासण्यांचे थेट विश्लेषण आणि दर्जा आढावा.",
    dash_total_checks: "एकूण तपासलेले अर्ज",
    dash_errors_detected: "आढळलेल्या त्रुटी",
    dash_missing_docs: "गहाळ कागदपत्रे",
    dash_avg_score: "सरासरी तयारी गुण",
    dash_sub_total: "आजवरच्या एकूण तपासण्या",
    dash_sub_errors: "बायनरी स्वाक्षरी व फॉरमॅट त्रुटी",
    dash_sub_missing: "आवश्यक दाखले वगळले",
    dash_sub_score: "अर्जाचा एकूण दर्जा",
    dash_guest_notice: "तुम्ही अतिथी मोडमध्ये आहात. अहवाल कायमस्वरूपी सेव्ह करण्यासाठी लॉगिन करा.",

    ws_eyebrow: "दस्तऐवज पडताळणी कक्ष",
    ws_heading: "तुमच्या अर्जाचे दस्तऐवज तपासा",
    ws_subtitle: "पीडीएफ किंवा प्रतिमा अपलोड करा. फॉर्मफिक्स एआय बायनरी हेडर आणि अनिवार्य आवश्यकतांची त्वरित पडताळणी करते.",
    ws_app_type_label: "अर्जाचा प्रकार",
    ws_app_name_label: "अर्जदार किंवा अर्जाचे नाव (ऐच्छिक)",
    ws_app_name_placeholder: "उदा. राष्ट्रीय शिष्यवृत्ती - साक्षी पी.",
    ws_opt_scholarship: "शिष्यवृत्ती अर्ज",
    ws_opt_college: "महाविद्यालय / विद्यापीठ प्रवेश",
    ws_opt_internship: "इंटर्नशिप व नोकरी अर्ज",
    ws_opt_other: "इतर अधिकृत अर्ज",
    ws_checklist_label: "अनिवार्य दस्तऐवज सूची",
    ws_checklist_hint: "तुमच्या अर्जासाठी आवश्यक असणारे दस्तऐवज निवडा.",
    ws_chk_identity: "ओळख पुरावा (आधार, पासपोर्ट, पॅन)",
    ws_chk_marksheet: "गुणपत्रिका / शैक्षणिक रेकॉर्ड",
    ws_chk_photo: "पासपोर्ट आकाराचे छायाचित्र",
    ws_chk_signature: "स्वाक्षरी नमुना",
    ws_chk_income: "उत्पन्न / अधिवास दाखला",
    ws_dropzone_title: "फाईल्स येथे ड्रॅग करून टाका, किंवा",
    ws_dropzone_browse: "डिव्हाइसवरून निवडा",
    ws_dropzone_sub: "केवळ अस्सल PDF, JPG, PNG · कमाल ५ MB प्रति फाईल · जास्तीत जास्त १० फाईल्स",
    ws_btn_submit: "दस्तऐवज पडताळणी सुरू करा",
    ws_btn_submitting: "पडताळणी सुरू आहे...",
    ws_empty_file_warn: "कृपया तपासणीसाठी किमान एक दस्तऐवज निवडा.",

    rep_eyebrow: "पडताळणी अहवाल",
    rep_heading: "अर्जाचे निदान व निष्कर्ष",
    rep_badge_ready: "सादरीकरणासाठी तयार",
    rep_badge_review: "पुनरावलोकन आवश्यक",
    rep_badge_action: "त्रुटी निवारण आवश्यक",
    rep_score_headline_ready: "अर्ज उत्कृष्ट स्थितीत आहे",
    rep_score_headline_review: "अर्जामध्ये काही किरकोळ त्रुटी आहेत",
    rep_score_headline_action: "अर्ज सादर करण्यापूर्वी त्रुटी दुरुस्त करा",
    rep_sec_files: "तपासलेल्या फाईल्स व स्वाक्षऱ्या",
    rep_sec_missing: "गहाळ अनिवार्य कागदपत्रे",
    rep_sec_issues: "तपशीलवार त्रुटी व मार्गदर्शन",
    rep_btn_new: "नवीन तपासणी करा",
    rep_btn_print: "अहवाल प्रिंट करा / सेव्ह करा",
    rep_btn_view_history: "माझ्या अहवालांमध्ये पहा",

    rep_page_title: "माझे अहवाल",
    rep_page_subtitle: "तुमच्या सर्व तपासलेल्या अर्जांचा आणि तयारी गुणांचा इतिहास.",
    rep_search_placeholder: "नाव किंवा प्रकारानुसार अर्ज शोधा...",
    rep_filter_all: "सर्व अहवाल",
    rep_filter_ready: "तयार (≥ ८०%)",
    rep_filter_review: "पुनरावलोकन आवश्यक (< ८०%)",
    rep_sort_newest: "क्रम: नवीन प्रथम",
    rep_sort_oldest: "क्रम: जुने प्रथम",
    rep_sort_score_high: "क्रम: सर्वाधिक गुण",
    rep_sort_score_low: "क्रम: किमान गुण",
    rep_empty_title: "कोणतेही अहवाल आढळले नाहीत",
    rep_empty_desc: "तुमचा पहिला पडताळणी अहवाल तयार करण्यासाठी मुख्यपृष्ठावरून तपासणी करा.",
    rep_empty_cta: "पहिला अर्ज तपासा",
    rep_guest_title: "लॉगिन आवश्यक आहे",
    rep_guest_desc: "तुमचा वैयक्तिक पडताळणी इतिहास पाहण्यासाठी कृपया लॉगिन करा.",
    rep_guest_btn: "अहवाल पाहण्यासाठी लॉगिन करा",

    feat_hero_eyebrow: "प्रणालीची क्षमता",
    feat_hero_title: "अचूक सादरीकरणासाठी निर्मित",
    feat_hero_sub: "अर्जदारांचे नुकसान, फाईल बिघाड आणि अंतिम मुदत चुकण्यापासून संरक्षण करण्यासाठी विशेष रचना.",
    feat_1_title: "PDF व इमेज बायनरी पडताळणी",
    feat_1_desc: "केवळ फाईलच्या नावावर अवलंबून न राहता मूळ मॅजिक बाइट्स (%PDF-, JPEG, PNG) तपासते.",
    feat_2_title: "गहाळ कागदपत्रांची तपासणी",
    feat_2_desc: "शिष्यवृत्ती व प्रवेश नियमांनुसार सर्व आवश्यक कागदपत्रांची अचूक तुलना करते.",
    feat_3_title: "तयारी गुण प्रणाली (Readiness Engine)",
    feat_3_desc: "० ते १०० या प्रमाणावर अर्जाची संपूर्ण तांत्रिक तयारी दर्शवते.",
    feat_4_title: "निश्चित कृती मार्गदर्शन",
    feat_4_desc: "कोणती फाईल खराब किंवा गहाळ आहे हे नेमके सांगून दुरुस्तीचे मार्ग सुचवते.",
    feat_5_title: "सुरक्षित JWT ऑथेंटिकेशन",
    feat_5_desc: "गोपनीय बेरर टोकन्स आणि १२-राऊंड bcrypt पासवर्ड एनक्रिप्शन.",
    feat_6_title: "गोपनीयता व डेटा सुरक्षा",
    feat_6_desc: "अतिथी तपासण्यांमध्ये फाईल्स क्लाउडवर कायमस्वरूपी साठवल्या जात नाहीत.",

    hiw_hero_eyebrow: "५-टप्प्यांची कार्यपद्धती",
    hiw_hero_title: "फॉर्मफिक्स एआय कसे कार्य करते",
    hiw_hero_sub: "अधिकाऱ्यांपर्यंत अर्ज पोहोचण्यापूर्वी त्रुटी पकडणारी सोपी व स्पष्ट पद्धती.",
    hiw_step1_num: "०१",
    hiw_step1_title: "अर्जाचा प्रकार निवडा",
    hiw_step1_desc: "शिष्यवृत्ती, महाविद्यालय प्रवेश किंवा नोकरी यापैकी योग्य पर्याय निवडा.",
    hiw_step2_num: "०२",
    hiw_step2_title: "कागदपत्रे अपलोड करा",
    hiw_step2_desc: "तुमचे प्रमाणपत्र, गुणपत्रिका व छायाचित्रे ड्रॅग करून वर्कस्पेसमध्ये टाका.",
    hiw_step3_num: "०३",
    hiw_step3_title: "बायनरी पडताळणी चालवा",
    hiw_step3_desc: "प्रणाली बायनरी डेटा तपासून फाईलची अस्सलता आणि स्वरूप पडताळते.",
    hiw_step4_num: "०४",
    hiw_step4_title: "त्रुटी व चेकलिस्टचे पुनरावलोकन",
    hiw_step4_desc: "वैध, चेतावणी किंवा त्रुटी दाखवणारा स्पष्ट रंगीत अहवाल त्वरित मिळवा.",
    hiw_step5_num: "०५",
    hiw_step5_title: "त्रुटी सुधारा व आत्मविश्वासाने सादर करा",
    hiw_step5_desc: "गहाळ कागदपत्रे जोडून अर्जाची खात्री करा आणि निश्चिंतपणे अर्ज सादर करा.",

    auth_login_title: "पुन्हा स्वागत आहे",
    auth_login_sub: "तुमचे अर्ज, अहवाल आणि रिअल-टाइम डॅशबोर्ड पाहण्यासाठी लॉगिन करा.",
    auth_signup_title: "नवीन खाते तयार करा",
    auth_signup_sub: "फॉर्मफिक्स एआयसह अर्ज तपासणी सुरू करा आणि तयारी गुण तपासा.",
    auth_name_label: "पूर्ण नाव",
    auth_name_placeholder: "तुमचे अधिकृत पूर्ण नाव प्रविष्ट करा",
    auth_email_label: "ईमेल पत्ता",
    auth_email_placeholder: "you@example.com",
    auth_pass_label: "पासवर्ड",
    auth_pass_placeholder: "किमान ८ अक्षरे",
    auth_confirm_pass_label: "पासवर्डची पुष्टी करा",
    auth_confirm_pass_placeholder: "पासवर्ड पुन्हा प्रविष्ट करा",
    auth_show_pass: "दाखवा",
    auth_hide_pass: "लपवा",
    auth_btn_login: "वर्कस्पेसमध्ये लॉगिन करा",
    auth_btn_signup: "मोफत खाते तयार करा",
    auth_submitting: "प्रमाणीकरण करत आहे...",
    auth_have_account: "आधीच खाते आहे का?",
    auth_no_account: "अद्याप खाते नाही का?",
    auth_link_login: "लॉगिन करा",
    auth_link_signup: "मोफत नोंदणी करा",
    auth_strength_weak: "कमकुवत पासवर्ड",
    auth_strength_medium: "मध्यम पासवर्ड",
    auth_strength_strong: "मजबूत पासवर्ड",
    auth_pass_mismatch: "पासवर्ड जुळत नाहीत.",

    footer_tagline: "बुद्धिमान दस्तऐवज पडताळणी प्रणाली. प्रत्येक तपशील महत्त्वाचा आहे.",
    footer_nav_heading: "नेव्हिगेशन",
    footer_legal_heading: "विश्वसनीयता व गोपनीयता",
    footer_disclaimer: "फॉर्मफिक्स एआय हे पूर्वतयारी तपासणी साधन आहे. अंतिम नियमांची खात्री संबंधित अधिकृत संस्थेकडून करून घ्यावी.",
    footer_rights: "© २०२६ फॉर्मफिक्स एआय. सर्व हक्क राखीव."
  },

  // HINDI TRANSLATIONS
  hi: {
    brand_name: "फॉर्मफिक्स एआई",
    brand_tagline: "हर विवरण महत्वपूर्ण है। हर आवेदन एक दूसरा मौका पाने का हकदार है।",

    nav_home: "होम",
    nav_features: "विशेषताएं",
    nav_how_it_works: "यह कैसे काम करता है",
    nav_reports: "मेरी रिपोर्ट्स",
    nav_login: "लॉग इन",
    nav_signup: "साइन अप",
    nav_logout: "लॉग आउट",
    nav_check_cta: "आवेदन जांचें",

    hero_eyebrow: "सटीक आवेदन सत्यापन प्रणाली",
    hero_title_1: "आत्मविश्वास से जमा करें।",
    hero_title_2: "संदेह के साथ नहीं।",
    hero_subtitle: "जमा करने से पहले अनुपलब्ध दस्तावेज़ खोजें, फ़ाइल त्रुटियों को पहचानें और आवेदन की तैयारी की समीक्षा करें।",
    hero_cta_primary: "मेरे दस्तावेज़ जांचें",
    hero_cta_secondary: "प्रक्रिया समझें",
    hero_trust_badge: "सत्यापित फ़ाइल इंटेलिजेंस · मैजिक बाइट्स और चेकलिस्ट सत्यापन",

    lab_preview_badge: "लाइव डेमो",
    lab_doc_title: "दस्तावेज़ गुणवत्ता जांच",
    lab_status_scanning: "बाइनरी स्कैन सक्रिय...",
    lab_status_verified: "हस्ताक्षर वैध (%PDF-)",
    lab_status_corrupted: "अमान्य फ़ाइल हेडर मिला",
    lab_status_missing: "आय प्रमाण पत्र गायब",
    lab_readiness_label: "तैयारी स्कोर",
    lab_readiness_sub: "लक्ष्य: 80% या अधिक",
    lab_simulated_note: "यह केवल डेमो है। वास्तविक जांच नीचे दिए गए कार्यक्षेत्र में होती है।",

    dash_eyebrow: "ऑडिट मेट्रिक्स",
    dash_heading: "आवेदन डैशबोर्ड",
    dash_subtitle: "जमा किए गए सभी दस्तावेज़ों की गुणवत्ता और तैयारियों का लाइव अवलोकन।",
    dash_total_checks: "कुल जांचे गए आवेदन",
    dash_errors_detected: "पहचानी गई त्रुटियाँ",
    dash_missing_docs: "अनुपलब्ध दस्तावेज़",
    dash_avg_score: "औसत तैयारी स्कोर",
    dash_sub_total: "अब तक की कुल जांच",
    dash_sub_errors: "फ़ाइल हेडर और एक्सटेंशन त्रुटियाँ",
    dash_sub_missing: "आवश्यक प्रमाण पत्र छूटे",
    dash_sub_score: "आवेदन की समग्र गुणवत्ता",
    dash_guest_notice: "आप गेस्ट मोड में हैं। रिपोर्ट्स को हमेशा के लिए सहेजने के लिए लॉग इन करें।",

    ws_eyebrow: "दस्तावेज़ सत्यापन कार्यक्षेत्र",
    ws_heading: "अपने आवेदन दस्तावेज़ों की जांच करें",
    ws_subtitle: "पीडीएफ या चित्र अपलोड करें। फॉर्मफिक्स एआई बाइनरी हेडर और अनिवार्य आवश्यकताओं की तुरंत जांच करता है।",
    ws_app_type_label: "आवेदन का प्रकार",
    ws_app_name_label: "आवेदक / आवेदन का नाम (वैकल्पिक)",
    ws_app_name_placeholder: "उदा. राष्ट्रीय छात्रवृत्ति - साक्षी पी.",
    ws_opt_scholarship: "छात्रवृत्ति आवेदन",
    ws_opt_college: "कॉलेज / विश्वविद्यालय प्रवेश",
    ws_opt_internship: "इंटर्नशिप और नौकरी आवेदन",
    ws_opt_other: "अन्य आधिकारिक आवेदन",
    ws_checklist_label: "अनिवार्य दस्तावेज़ चेकलिस्ट",
    ws_checklist_hint: "अपने आवेदन के लिए आवश्यक दस्तावेज़ों का चयन करें।",
    ws_chk_identity: "पहचान प्रमाण (आधार, पासपोर्ट, पैन)",
    ws_chk_marksheet: "मार्कशीट / शैक्षणिक रिकॉर्ड",
    ws_chk_photo: "पासपोर्ट आकार का फोटो",
    ws_chk_signature: "हस्ताक्षर नमूना",
    ws_chk_income: "आय / निवास प्रमाण पत्र",
    ws_dropzone_title: "फ़ाइलें यहाँ खींचकर लाएँ, या",
    ws_dropzone_browse: "डिवाइस से चुनें",
    ws_dropzone_sub: "केवल असली PDF, JPG, PNG · अधिकतम 5 MB प्रति फ़ाइल · 10 फ़ाइलों तक",
    ws_btn_submit: "दस्तावेज़ सत्यापन शुरू करें",
    ws_btn_submitting: "सत्यापन जारी है...",
    ws_empty_file_warn: "कृपया जांच के लिए कम से कम एक दस्तावेज़ चुनें।",

    rep_eyebrow: "सत्यापन रिपोर्ट",
    rep_heading: "आवेदन जांच निष्कर्ष",
    rep_badge_ready: "जमा करने के लिए तैयार",
    rep_badge_review: "समीक्षा आवश्यक",
    rep_badge_action: "सुधार आवश्यक",
    rep_score_headline_ready: "आवेदन उत्कृष्ट स्थिति में है",
    rep_score_headline_review: "आवेदन में कुछ मामूली कमियां हैं",
    rep_score_headline_action: "जमा करने से पहले त्रुटियों को ठीक करें",
    rep_sec_files: "जांची गई फ़ाइलें और हस्ताक्षर",
    rep_sec_missing: "अनुपलब्ध अनिवार्य दस्तावेज़",
    rep_sec_issues: "पहचानी गई त्रुटियाँ और सुझाव",
    rep_btn_new: "नई जांच शुरू करें",
    rep_btn_print: "रिपोर्ट प्रिंट / सेव करें",
    rep_btn_view_history: "मेरी रिपोर्ट्स में देखें",

    rep_page_title: "मेरी रिपोर्ट्स",
    rep_page_subtitle: "आपके सभी सत्यापित आवेदनों और तैयारी स्कोर का इतिहास।",
    rep_search_placeholder: "नाम या प्रकार से आवेदन खोजें...",
    rep_filter_all: "सभी रिपोर्ट्स",
    rep_filter_ready: "तैयार (≥ 80%)",
    rep_filter_review: "समीक्षा आवश्यक (< 80%)",
    rep_sort_newest: "क्रम: नए पहले",
    rep_sort_oldest: "क्रम: पुराने पहले",
    rep_sort_score_high: "क्रम: उच्चतम स्कोर",
    rep_sort_score_low: "क्रम: न्यूनतम स्कोर",
    rep_empty_title: "कोई रिपोर्ट नहीं मिली",
    rep_empty_desc: "अपनी पहली ऑडिट रिपोर्ट बनाने के लिए होमपेज से जांच चलाएं।",
    rep_empty_cta: "पहला आवेदन जांचें",
    rep_guest_title: "लॉगिन आवश्यक है",
    rep_guest_desc: "अपनी निजी सत्यापन रिपोर्ट देखने के लिए कृपया लॉग इन करें।",
    rep_guest_btn: "रिपोर्ट देखने के लिए लॉग इन करें",

    feat_hero_eyebrow: "प्रणाली क्षमताएं",
    feat_hero_title: "सटीक और निर्दोष प्रस्तुति के लिए",
    feat_hero_sub: "आवेदकों को प्रशासनिक अस्वीकृति, फ़ाइल खराबी और समय सीमा चूकने से बचाने के लिए निर्मित।",
    feat_1_title: "PDF और इमेज बाइनरी सत्यापन",
    feat_1_desc: "केवल फ़ाइल एक्सटेंशन पर भरोसा न करके वास्तविक मैजिक बाइट्स (%PDF-, JPEG, PNG) को स्कैन करता है।",
    feat_2_title: "अनुपलब्ध दस्तावेज़ खोज",
    feat_2_desc: "छात्रवृत्ति और प्रवेश नियमों के आधार पर सभी अनिवार्य दस्तावेज़ों का मिलान करता है।",
    feat_3_title: "तैयारी स्कोर इंजन (Readiness Engine)",
    feat_3_desc: "0 से 100 के पैमाने पर आपके आवेदन की संपूर्ण तकनीकी तैयारी का मूल्यांकन करता है।",
    feat_4_title: "सटीक मार्गदर्शन, कोई अनुमान नहीं",
    feat_4_desc: "स्पष्ट रूप से बताता है कि कौन सी फ़ाइल अमान्य या अनुपलब्ध है और इसे कैसे ठीक करें।",
    feat_5_title: "सुरक्षित JWT प्रमाणीकरण",
    feat_5_desc: "निजी बेयरर टोकन और 12-राउंड bcrypt पासवर्ड एन्क्रिप्शन डेटा को सुरक्षित रखते हैं।",
    feat_6_title: "शून्य डेटा प्रतिधारण विकल्प",
    feat_6_desc: "गेस्ट जांच में फ़ाइलों को क्लाउड पर स्थायी रूप से सहेजा नहीं जाता है।",

    hiw_hero_eyebrow: "5-चरणीय प्रक्रिया",
    hiw_hero_title: "फॉर्मफिक्स एआई कैसे काम करता है",
    hiw_hero_sub: "अधिकारियों द्वारा देखे जाने से पहले गलतियों को पकड़ने के लिए एक पारदर्शी और संरचित प्रक्रिया।",
    hiw_step1_num: "01",
    hiw_step1_title: "आवेदन श्रेणी चुनें",
    hiw_step1_desc: "छात्रवृत्ति, कॉलेज प्रवेश या नौकरी में से उचित श्रेणी का चयन करें।",
    hiw_step2_num: "02",
    hiw_step2_title: "दस्तावेज़ अपलोड करें",
    hiw_step2_desc: "अपने प्रमाण पत्र, अंकतालिका और तस्वीरें कार्यक्षेत्र में ड्रैग और ड्रॉप करें।",
    hiw_step3_num: "03",
    hiw_step3_title: "गहन बाइनरी सत्यापन चलाएं",
    hiw_step3_desc: "सिस्टम बाइनरी डेटा की जांच करके फ़ाइल की प्रामाणिकता और प्रारूप की पुष्टि करता है।",
    hiw_step4_num: "04",
    hiw_step4_title: "त्रुटियों और चेकलिस्ट की समीक्षा करें",
    hiw_step4_desc: "वैध, चेतावनी या त्रुटि दर्शाने वाली स्पष्ट रंगीन रिपोर्ट तुरंत प्राप्त करें।",
    hiw_step5_num: "05",
    hiw_step5_title: "त्रुटियां सुधारें और विश्वास से जमा करें",
    hiw_step5_desc: "अनुपलब्ध दस्तावेज़ जोड़ें, फ़ाइलें बदलें और बिना किसी डर के आवेदन जमा करें।",

    auth_login_title: "वापसी पर स्वागत है",
    auth_login_sub: "अपने आवेदन ऑडिट, रिपोर्ट्स और लाइव डैशबोर्ड तक पहुँचने के लिए लॉग इन करें।",
    auth_signup_title: "नया खाता बनाएं",
    auth_signup_sub: "फॉर्मफिक्स एआई के साथ दस्तावेज़ सत्यापन शुरू करें और तैयारी स्कोर जांचें।",
    auth_name_label: "पूरा नाम",
    auth_name_placeholder: "अपना कानूनी पूरा नाम दर्ज करें",
    auth_email_label: "ईमेल पता",
    auth_email_placeholder: "you@example.com",
    auth_pass_label: "पासवर्ड",
    auth_pass_placeholder: "कम से कम 8 वर्ण",
    auth_confirm_pass_label: "पासवर्ड की पुष्टि करें",
    auth_confirm_pass_placeholder: "पासवर्ड फिर से दर्ज करें",
    auth_show_pass: "दिखाएँ",
    auth_hide_pass: "छिपाएँ",
    auth_btn_login: "कार्यक्षेत्र में लॉग इन करें",
    auth_btn_signup: "मुफ़्त खाता बनाएं",
    auth_submitting: "प्रमाणीकरण जारी है...",
    auth_have_account: "क्या पहले से एक खाता है?",
    auth_no_account: "क्या अभी तक कोई खाता नहीं है?",
    auth_link_login: "लॉग इन करें",
    auth_link_signup: "मुफ़्त पंजीकरण करें",
    auth_strength_weak: "कमजोर पासवर्ड",
    auth_strength_medium: "मध्यम पासवर्ड",
    auth_strength_strong: "मजबूत पासवर्ड",
    auth_pass_mismatch: "पासवर्ड मेल नहीं खाते।",

    footer_tagline: "सटीक दस्तावेज़ सत्यापन प्रणाली। हर विवरण महत्वपूर्ण है।",
    footer_nav_heading: "नेविगेशन",
    footer_legal_heading: "विश्वसनीयता और गोपनीयता",
    footer_disclaimer: "फॉर्मफिक्स एआई एक तैयारी जांच उपकरण है। अंतिम नियमों की पुष्टि अपने आधिकारिक संस्थान से अवश्य करें।",
    footer_rights: "© 2026 फॉर्मफिक्स एआई। सर्वाधिकार सुरक्षित।"
  }
};

class I18nEngine {
  constructor() {
    this.currentLang = localStorage.getItem(I18N_STORAGE_KEY) || "en";
    if (!translations[this.currentLang]) {
      this.currentLang = "en";
    }
  }

  t(key, fallback = "") {
    const dict = translations[this.currentLang] || translations.en;
    if (dict && dict[key]) {
      return dict[key];
    }
    if (translations.en && translations.en[key]) {
      return translations.en[key];
    }
    return fallback || key;
  }

  setLanguage(lang) {
    if (!translations[lang]) return;
    this.currentLang = lang;
    localStorage.setItem(I18N_STORAGE_KEY, lang);
    this.applyToDOM();
    window.dispatchEvent(new CustomEvent("formfix_lang_changed", { detail: { lang } }));
  }

  getLanguage() {
    return this.currentLang;
  }

  applyToDOM() {
    document.documentElement.lang = this.currentLang;

    // Translate all [data-i18n] text nodes
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const translation = this.t(key);
      if (translation) {
        el.textContent = translation;
      }
    });

    // Translate placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      const translation = this.t(key);
      if (translation) {
        el.setAttribute("placeholder", translation);
      }
    });

    // Translate titles / aria-labels
    document.querySelectorAll("[data-i18n-title]").forEach(el => {
      const key = el.getAttribute("data-i18n-title");
      const translation = this.t(key);
      if (translation) {
        el.setAttribute("title", translation);
      }
    });

    // Sync select dropdown if present
    document.querySelectorAll(".language-select").forEach(sel => {
      sel.value = this.currentLang;
    });
  }

  init() {
    this.applyToDOM();

    // Attach listeners to language selectors across pages
    document.querySelectorAll(".language-select").forEach(sel => {
      sel.value = this.currentLang;
      sel.addEventListener("change", (e) => {
        this.setLanguage(e.target.value);
      });
    });
  }
}

// Global instance
window.i18n = new I18nEngine();

document.addEventListener("DOMContentLoaded", () => {
  window.i18n.init();
});
