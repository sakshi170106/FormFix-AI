"use strict";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

// ==========================================================================
// 1. AUTHENTICATION & SESSION STATE
// ==========================================================================

const AuthState = {
  getToken() {
    return localStorage.getItem("formfix_token");
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem("formfix_user"));
    } catch (_) {
      return null;
    }
  },

  setSession(token, user) {
    localStorage.setItem("formfix_token", token);
    localStorage.setItem("formfix_user", JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem("formfix_token");
    localStorage.removeItem("formfix_user");
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};

// ==========================================================================
// API & NETWORK HELPERS
// ==========================================================================

function getApiUrl(endpoint) {
  // If running via Live Server or another port (e.g., 5500, 3000, 8080) and Express is on 5000,
  // automatically route API calls to the Express backend on port 5000.
  if (
    typeof window !== "undefined" &&
    window.location &&
    window.location.port &&
    window.location.port !== "5000" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ) {
    return `http://${window.location.hostname}:5000${endpoint}`;
  }
  return endpoint;
}

async function safeFetchJson(url, options = {}) {
  const finalUrl = getApiUrl(url);
  let res;
  try {
    res = await fetch(finalUrl, options);
  } catch (netErr) {
    throw new Error(`Network error: Unable to connect to backend server at ${finalUrl}. Please ensure the FormFix AI server is running on port 5000.`);
  }

  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!text || text.trim().length === 0) {
    if (res.status === 405) {
      throw new Error("HTTP 405 (Method Not Allowed): The server serving this page does not accept POST requests. Please open FormFix AI directly via the Express server at http://localhost:5000.");
    }
    throw new Error(`Server returned HTTP ${res.status} with an empty response.`);
  }

  let data = null;
  if (contentType.includes("application/json") || text.trim().startsWith("{") || text.trim().startsWith("[")) {
    try {
      data = JSON.parse(text);
    } catch (_) {
      throw new Error(`Server returned unparseable JSON (HTTP ${res.status}): ${text.slice(0, 100)}`);
    }
  } else {
    // HTML or plain text response
    if (res.status === 405) {
      throw new Error("HTTP 405 (Method Not Allowed): The server serving this page does not accept POST requests. Please open FormFix AI directly via the Express server at http://localhost:5000.");
    }
    throw new Error(`Server returned HTTP ${res.status} (${res.statusText || "Unexpected format"}).`);
  }

  return { ok: res.ok, status: res.status, data };
}

// ==========================================================================
// 2. NAVBAR CONTROLLER (Present on every page)
// ==========================================================================

function initNavbar() {
  const mobileToggle = $("#mobileNavToggle");
  const navLinks = $("#navLinks");

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener("click", () => {
      navLinks.classList.toggle("nav-mobile-open");
    });

    $$(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("nav-mobile-open");
      });
    });
  }

  // Highlight active link based on current path
  const currentPath = window.location.pathname.toLowerCase();
  $$(".nav-link").forEach(link => {
    const href = link.getAttribute("href").toLowerCase();
    if (
      (currentPath.endsWith("/") || currentPath.endsWith("index.html")) && (href === "/" || href === "index.html" || href === "#home")
    ) {
      link.classList.add("active");
    } else if (href && currentPath.includes(href.replace(".html", ""))) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Sync auth UI state in Navbar
  syncNavbarAuth();
}

async function syncNavbarAuth() {
  const guestBox = $("#navGuestBox");
  const userBox = $("#navUserBox");
  const avatar = $("#navAvatar");
  const userName = $("#navUserName");
  const logoutBtn = $("#navLogoutBtn");

  const token = AuthState.getToken();
  if (!token) {
    if (guestBox) guestBox.hidden = false;
    if (userBox) userBox.hidden = true;
    return;
  }

  try {
    const { ok, data } = await safeFetchJson("/api/auth/me", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (ok && data && data.success && data.user) {
      AuthState.setSession(token, data.user);
      if (guestBox) guestBox.hidden = true;
      if (userBox) userBox.hidden = false;
      const initial = (data.user.name || data.user.email || "U").charAt(0).toUpperCase();
      if (avatar) avatar.textContent = initial;
      if (userName) userName.textContent = data.user.name || data.user.email;
      if (logoutBtn) logoutBtn.onclick = handleLogout;
      return;
    }
    // Stale or invalid token
    AuthState.clearSession();
    if (guestBox) guestBox.hidden = false;
    if (userBox) userBox.hidden = true;
  } catch (_) {
    // Offline fallback to stored user info
    const cachedUser = AuthState.getUser();
    if (cachedUser && guestBox && userBox) {
      guestBox.hidden = true;
      userBox.hidden = false;
      if (avatar) avatar.textContent = (cachedUser.name || "U").charAt(0).toUpperCase();
      if (userName) userName.textContent = cachedUser.name || cachedUser.email;
      if (logoutBtn) logoutBtn.onclick = handleLogout;
    }
  }

  if (logoutBtn) {
    logoutBtn.onclick = handleLogout;
  }
}

async function handleLogout() {
  try {
    await safeFetchJson("/api/auth/logout", { method: "POST" });
  } catch (_) {}
  AuthState.clearSession();
  syncNavbarAuth();
  if (window.location.pathname.includes("reports.html")) {
    window.location.href = "login.html";
  } else {
    window.location.reload();
  }
}

// ==========================================================================
// 3. HOMEPAGE & DOCUMENT VERIFICATION WORKSPACE
// ==========================================================================

let selectedFiles = [];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_FILES = 10;

function initWorkspace() {
  const uploadZone = $("#uploadZone");
  const fileInput = $("#documents");
  const fileList = $("#fileList");
  const appTypeSelect = $("#applicationType");
  const appForm = $("#applicationForm");
  const submitBtn = $("#checkSubmitBtn");
  const btnSpinner = $("#btnSpinner");
  const btnText = $("#btnText");
  const alertBanner = $("#formAlertBanner");

  if (!uploadZone || !appForm) return;

  function showAlert(msg, type = "alert-error") {
    if (!alertBanner) return;
    if (!msg) {
      alertBanner.hidden = true;
      alertBanner.textContent = "";
      return;
    }
    alertBanner.className = `form-alert-banner ${type}`;
    alertBanner.textContent = msg;
    alertBanner.hidden = false;
  }

  // Update Checklist styling when application type changes
  const requiredCategories = {
    scholarship: ["identity", "marksheet", "income"],
    college: ["identity", "marksheet", "photo"],
    internship: ["identity", "marksheet"],
    other: ["identity"]
  };

  function updateChecklist() {
    const val = appTypeSelect ? appTypeSelect.value : "scholarship";
    const req = requiredCategories[val] || [];
    $$(".checklist-item").forEach(item => {
      const chk = item.querySelector("input");
      if (chk) {
        if (req.includes(chk.value)) {
          item.style.borderColor = "var(--color-violet)";
          item.style.fontWeight = "700";
        } else {
          item.style.borderColor = "var(--color-border-subtle)";
          item.style.fontWeight = "400";
        }
      }
    });
  }

  if (appTypeSelect) {
    appTypeSelect.addEventListener("change", updateChecklist);
    updateChecklist();
  }

  function renderQueue() {
    if (!fileList) return;
    if (selectedFiles.length === 0) {
      fileList.innerHTML = "";
      return;
    }

    fileList.innerHTML = selectedFiles.map((file, idx) => `
      <div class="queue-item">
        <div class="queue-file-title">
          <span>📄</span>
          <span>${escapeHTML(file.name)}</span>
        </div>
        <div class="queue-file-right">
          <span class="queue-file-size">${(file.size / 1024 / 1024).toFixed(2)} MB</span>
          <button type="button" class="btn-remove-file" data-remove="${idx}">Remove</button>
        </div>
      </div>
    `).join("");

    $$("[data-remove]").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = Number(btn.dataset.remove);
        selectedFiles.splice(i, 1);
        renderQueue();
      });
    });
  }

  function addFiles(files) {
    const allowed = /\.(pdf|jpe?g|png)$/i;
    for (const file of files) {
      if (!allowed.test(file.name)) {
        showAlert(`${file.name}: Only PDF, JPG, and PNG files are accepted.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        showAlert(`${file.name}: File exceeds 5 MB size limit.`);
        continue;
      }
      if (selectedFiles.length >= MAX_FILES) {
        showAlert("Maximum 10 files per inspection batch.");
        break;
      }
      const duplicate = selectedFiles.some(f => f.name === file.name && f.size === file.size);
      if (!duplicate) {
        selectedFiles.push(file);
      }
    }
    renderQueue();
  }

  uploadZone.addEventListener("click", (e) => {
    if (e.target !== fileInput) {
      fileInput.click();
    }
  });
  uploadZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadZone.classList.add("dragover");
  });
  uploadZone.addEventListener("dragleave", () => {
    uploadZone.classList.remove("dragover");
  });
  uploadZone.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadZone.classList.remove("dragover");
    if (e.dataTransfer.files) addFiles([...e.dataTransfer.files]);
  });
  fileInput.addEventListener("change", (e) => {
    if (e.target.files) {
      addFiles([...e.target.files]);
      e.target.value = "";
    }
  });

  // Handle Form Submission with Real Backend API
  appForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    showAlert("");

    if (selectedFiles.length === 0) {
      showAlert(window.i18n ? window.i18n.t("ws_empty_file_warn") : "Please select at least one document to audit.");
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    if (btnSpinner) btnSpinner.hidden = false;
    if (btnText) btnText.textContent = window.i18n ? window.i18n.t("ws_btn_submitting") : "Auditing Document Laboratory...";

    try {
      const formData = new FormData();
      formData.append("applicationType", appTypeSelect.value);
      formData.append("applicationName", ($("#applicantName").value || "My Application").trim());

      const selectedChecklist = $$("#checklist input[type='checkbox']:checked").map(c => c.value);
      formData.append("checklist", JSON.stringify(selectedChecklist));

      selectedFiles.forEach(file => formData.append("documents", file));

      const headers = {};
      const token = AuthState.getToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const { ok, data } = await safeFetchJson("/api/checks", {
        method: "POST",
        headers,
        body: formData
      });

      if (!ok || !data || !data.success) {
        throw new Error((data && data.message) || "Audit could not be completed.");
      }

      renderReportResults(data.report);
      fetchDashboardMetrics();
    } catch (err) {
      showAlert(err.message || "An unexpected error occurred during document inspection.");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (btnSpinner) btnSpinner.hidden = true;
      if (btnText) btnText.textContent = window.i18n ? window.i18n.t("ws_btn_submit") : "Run Document Verification";
    }
  });

  // Reset Check
  const resetBtn = $("#resetCheckBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      selectedFiles = [];
      appForm.reset();
      renderQueue();
      showAlert("");
      const rep = $("#reportResult");
      if (rep) {
        rep.hidden = true;
        rep.style.display = "none";
      }
    });
  }

  // Print Report
  const printBtn = $("#printReportBtn");
  if (printBtn) {
    printBtn.addEventListener("click", () => window.print());
  }
}

function renderReportResults(report) {
  const reportEl = $("#reportResult");
  if (!reportEl || !report) return;

  reportEl.hidden = false;
  reportEl.removeAttribute("hidden");
  reportEl.style.display = "block";

  const score = typeof report.readinessScore === "number" ? report.readinessScore : 0;
  const scoreVal = $("#repScoreVal");
  const badge = $("#repBadge");
  const headline = $("#repScoreHeadline");
  const summary = $("#repSummary");

  if (scoreVal) scoreVal.textContent = score;

  if (score >= 80) {
    if (badge) {
      badge.className = "badge badge-success";
      badge.textContent = window.i18n ? window.i18n.t("rep_badge_ready") : "READY TO SUBMIT";
    }
    if (headline) headline.textContent = window.i18n ? window.i18n.t("rep_score_headline_ready") : "Application is in Excellent Condition";
  } else if (score >= 50) {
    if (badge) {
      badge.className = "badge badge-warning";
      badge.textContent = window.i18n ? window.i18n.t("rep_badge_review") : "REVIEW REQUIRED";
    }
    if (headline) headline.textContent = window.i18n ? window.i18n.t("rep_score_headline_review") : "Application Has Minor Issues";
  } else {
    if (badge) {
      badge.className = "badge badge-danger";
      badge.textContent = window.i18n ? window.i18n.t("rep_badge_action") : "ACTION NEEDED";
    }
    if (headline) headline.textContent = window.i18n ? window.i18n.t("rep_score_headline_action") : "Action Required Before Submission";
  }

  if (summary) {
    const dCount = (report.documents && report.documents.length) || 0;
    const eCount = (report.errors && report.errors.length) || 0;
    const mCount = (report.missingDocuments && report.missingDocuments.length) || 0;
    summary.textContent = `${dCount} file(s) inspected. ${eCount} format error(s). ${mCount} missing mandatory requirement(s).`;
  }

  // Render Inspected Files Stack
  const filesStack = $("#repFilesStack");
  if (filesStack) {
    if (report.documents && report.documents.length > 0) {
      filesStack.innerHTML = report.documents.map(doc => {
        const isErr = doc.status === "error";
        const rowClass = isErr ? "row-error" : "row-valid";
        const badgeClass = isErr ? "badge-danger" : "badge-success";
        const label = isErr ? "ERROR" : "VALID";
        return `
          <div class="report-file-row ${rowClass}">
            <div class="report-file-meta">
              <strong>${escapeHTML(doc.originalName)}</strong>
              <small>${escapeHTML(doc.message || "File signature verified.")}</small>
            </div>
            <span class="badge ${badgeClass}">${label}</span>
          </div>
        `;
      }).join("");
    } else {
      filesStack.innerHTML = `<p class="form-hint">No file records.</p>`;
    }
  }

  // Render Issues & Recommendations
  const issuesList = $("#repIssuesList");
  if (issuesList) {
    const allIssues = [
      ...(report.errors || []).map(e => `<strong>Error:</strong> ${e}`),
      ...(report.warnings || []).map(w => `<strong>Warning:</strong> ${w}`),
      ...(report.missingDocuments || []).map(m => `<strong>Missing:</strong> Required document "${m}" was not identified.`)
    ];

    if (allIssues.length > 0) {
      issuesList.innerHTML = allIssues.map(iss => `<li>${iss}</li>`).join("");
    } else {
      issuesList.innerHTML = `<li style="color: var(--color-success);">All uploaded documents meet signature specifications. Confirm official requirements.</li>`;
    }
  }

  if (typeof reportEl.scrollIntoView === "function") {
    reportEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// Fetch Real Dashboard Metrics on Home
async function fetchDashboardMetrics() {
  const statTotal = $("#statTotalChecks");
  const statErrors = $("#statTotalErrors");
  const statMissing = $("#statMissingDocs");
  const statScore = $("#statAvgScore");
  const guestBanner = $("#metricsGuestBanner");

  const token = AuthState.getToken();
  if (!token) {
    if (guestBanner) guestBanner.hidden = false;
    return;
  }
  if (guestBanner) guestBanner.hidden = true;

  try {
    const { ok, data } = await safeFetchJson("/api/checks/stats", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (ok && data && data.success && data.stats) {
      if (statTotal) statTotal.textContent = data.stats.totalChecks || 0;
      if (statErrors) statErrors.textContent = data.stats.totalErrors || 0;
      if (statMissing) statMissing.textContent = data.stats.missingDocsCount || 0;
      if (statScore) statScore.textContent = data.stats.averageScore ? `${data.stats.averageScore}%` : "--";
    }
  } catch (_) {}
}

// ==========================================================================
// 4. MY REPORTS PAGE CONTROLLER (reports.html)
// ==========================================================================

let rawReportsData = [];

async function initReportsPage() {
  const container = $("#reportsFeedContainer");
  const guestGate = $("#reportsGuestGate");
  const searchInput = $("#reportsSearchInput");
  const filterSelect = $("#reportsFilterSelect");
  const sortSelect = $("#reportsSortSelect");

  if (!container) return;

  const token = AuthState.getToken();
  if (!token) {
    if (guestGate) guestGate.hidden = false;
    if (container) container.hidden = true;
    return;
  }
  if (guestGate) guestGate.hidden = true;
  if (container) container.hidden = false;

  try {
    const { ok, status, data } = await safeFetchJson("/api/checks", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (status === 401) {
      AuthState.clearSession();
      syncNavbarAuth();
      if (guestGate) guestGate.hidden = false;
      if (container) container.hidden = true;
      return;
    }

    if (ok && data && data.success && Array.isArray(data.reports)) {
      rawReportsData = data.reports;
      renderFilteredReports();
      updateReportsHeaderStats(rawReportsData);
    } else {
      throw new Error((data && data.message) || "Could not load reports");
    }
  } catch (err) {
    container.innerHTML = `<div class="form-alert-banner alert-error">${escapeHTML(err.message || "Could not load reports. Please verify connection.")}</div>`;
  }

  if (searchInput) searchInput.addEventListener("input", renderFilteredReports);
  if (filterSelect) filterSelect.addEventListener("change", renderFilteredReports);
  if (sortSelect) sortSelect.addEventListener("change", renderFilteredReports);
}

function updateReportsHeaderStats(reports) {
  const totalEl = $("#repStatTotal");
  const passedEl = $("#repStatPassed");
  const issuesEl = $("#repStatIssues");

  if (totalEl) totalEl.textContent = reports.length;
  if (passedEl) passedEl.textContent = reports.filter(r => (r.readinessScore || 0) >= 80).length;
  if (issuesEl) issuesEl.textContent = reports.reduce((acc, r) => acc + ((r.errors && r.errors.length) || 0), 0);
}

function renderFilteredReports() {
  const container = $("#reportsFeedContainer");
  if (!container) return;

  const query = ($("#reportsSearchInput")?.value || "").toLowerCase().trim();
  const filter = $("#reportsFilterSelect")?.value || "all";
  const sort = $("#reportsSortSelect")?.value || "newest";

  let list = [...rawReportsData];

  // Search Filter
  if (query) {
    list = list.filter(r => 
      (r.applicationName && r.applicationName.toLowerCase().includes(query)) ||
      (r.applicationType && r.applicationType.toLowerCase().includes(query))
    );
  }

  // Category Filter
  if (filter === "ready") {
    list = list.filter(r => (r.readinessScore || 0) >= 80);
  } else if (filter === "review") {
    list = list.filter(r => (r.readinessScore || 0) < 80);
  }

  // Sort
  if (sort === "newest") {
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sort === "oldest") {
    list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sort === "score-high") {
    list.sort((a, b) => (b.readinessScore || 0) - (a.readinessScore || 0));
  } else if (sort === "score-low") {
    list.sort((a, b) => (a.readinessScore || 0) - (b.readinessScore || 0));
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="reports-empty-state">
        <span class="empty-icon">📑</span>
        <h4 data-i18n="rep_empty_title">No verification reports found</h4>
        <p data-i18n="rep_empty_desc">Run an audit from the homepage workspace to generate reports.</p>
        <a href="index.html#checker" class="btn btn-primary btn-sm" data-i18n="rep_empty_cta">Audit Your First Application</a>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(r => {
    const score = r.readinessScore || 0;
    const badgeClass = score >= 80 ? "badge-success" : score >= 50 ? "badge-warning" : "badge-danger";
    const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleDateString(undefined, {
      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
    }) : "Recent";
    const fileCount = (r.documents && r.documents.length) || 0;
    const missingCount = (r.missingDocuments && r.missingDocuments.length) || 0;

    return `
      <div class="report-feed-card">
        <div>
          <h4 class="feed-card-title">${escapeHTML(r.applicationName || "Application Audit")}</h4>
          <div class="feed-card-meta">
            <span>📅 ${dateStr}</span>
            <span>📂 ${escapeHTML(r.applicationType || "General")}</span>
            <span>📄 ${fileCount} file(s)</span>
            ${missingCount ? `<span style="color: var(--color-warning); font-weight: 700;">⚠️ ${missingCount} missing</span>` : ""}
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 14px;">
          <span class="feed-score-badge ${badgeClass}">${score}% Readiness</span>
        </div>
      </div>
    `;
  }).join("");
}

// ==========================================================================
// 5. AUTHENTICATION PAGES (login.html & signup.html)
// ==========================================================================

function initAuthPages() {
  // Toggle password visibility helper
  $$(".btn-toggle-pass").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = btn.parentElement.querySelector("input");
      if (input.type === "password") {
        input.type = "text";
        btn.textContent = window.i18n ? window.i18n.t("auth_hide_pass") : "Hide";
      } else {
        input.type = "password";
        btn.textContent = window.i18n ? window.i18n.t("auth_show_pass") : "Show";
      }
    });
  });

  // LOGIN PAGE
  const pageLoginForm = $("#pageLoginForm");
  if (pageLoginForm) {
    pageLoginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const alert = $("#loginAlert");
      const btn = $("#loginSubmitBtn");
      const spinner = btn.querySelector(".spinner-inline");
      if (alert) alert.hidden = true;
      btn.disabled = true;
      if (spinner) spinner.hidden = false;

      try {
        const email = $("#loginEmail") ? $("#loginEmail").value.trim() : "";
        const password = $("#loginPassword") ? $("#loginPassword").value : "";

        if (!email || !password) {
          throw new Error("Please enter both email and password.");
        }

        const { ok, data } = await safeFetchJson("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        if (!ok || !data || !data.success) {
          throw new Error((data && data.message) || "Invalid email or password");
        }

        AuthState.setSession(data.token, data.user);
        window.location.href = "reports.html";
      } catch (err) {
        if (alert) {
          alert.className = "form-alert-banner alert-error";
          alert.textContent = err.message;
          alert.hidden = false;
        }
      } finally {
        btn.disabled = false;
        if (spinner) spinner.hidden = true;
      }
    });
  }

  // SIGNUP PAGE
  const pageSignupForm = $("#pageSignupForm");
  const passInput = $("#signupPassword");
  const confirmPassInput = $("#signupConfirmPassword");
  const strengthFill = $("#passStrengthFill");
  const strengthText = $("#passStrengthText");

  if (passInput && strengthFill) {
    passInput.addEventListener("input", () => {
      const val = passInput.value;
      let score = 0;
      if (val.length >= 8) score++;
      if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
      if (/[0-9]/.test(val) || /[^A-Za-z0-9]/.test(val)) score++;

      strengthFill.className = "pass-strength-fill";
      if (score === 0 || val.length === 0) {
        strengthFill.style.width = "0%";
        if (strengthText) strengthText.textContent = "";
      } else if (score === 1) {
        strengthFill.classList.add("strength-weak");
        if (strengthText) strengthText.textContent = window.i18n ? window.i18n.t("auth_strength_weak") : "Weak password";
      } else if (score === 2) {
        strengthFill.classList.add("strength-medium");
        if (strengthText) strengthText.textContent = window.i18n ? window.i18n.t("auth_strength_medium") : "Moderate password";
      } else {
        strengthFill.classList.add("strength-strong");
        if (strengthText) strengthText.textContent = window.i18n ? window.i18n.t("auth_strength_strong") : "Strong password";
      }
    });
  }

  if (pageSignupForm) {
    pageSignupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const alert = $("#signupAlert");
      const btn = $("#signupSubmitBtn");
      const spinner = btn ? btn.querySelector(".spinner-inline") : null;
      if (alert) alert.hidden = true;

      const name = $("#signupName") ? $("#signupName").value.trim() : "";
      const email = $("#signupEmail") ? $("#signupEmail").value.trim() : "";
      const password = passInput ? passInput.value : "";
      const confirmPassword = confirmPassInput ? confirmPassInput.value : "";

      if (!name || !email || !password) {
        if (alert) {
          alert.className = "form-alert-banner alert-error";
          alert.textContent = "Please fill in all required fields.";
          alert.hidden = false;
        }
        return;
      }

      if (password !== confirmPassword) {
        if (alert) {
          alert.className = "form-alert-banner alert-error";
          alert.textContent = window.i18n ? window.i18n.t("auth_pass_mismatch") : "Passwords do not match.";
          alert.hidden = false;
        }
        return;
      }

      if (btn) btn.disabled = true;
      if (spinner) spinner.hidden = false;

      try {
        const { ok, data } = await safeFetchJson("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        });

        if (!ok || !data || !data.success) {
          throw new Error((data && data.message) || "Registration failed");
        }

        AuthState.setSession(data.token, data.user);
        window.location.href = "reports.html";
      } catch (err) {
        if (alert) {
          alert.className = "form-alert-banner alert-error";
          alert.textContent = err.message;
          alert.hidden = false;
        }
      } finally {
        if (btn) btn.disabled = false;
        if (spinner) spinner.hidden = true;
      }
    });
  }
}

// Utility: Escape HTML strings
function escapeHTML(str = "") {
  return String(str).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[c]);
}

// ==========================================================================
// 6. GLOBAL INITIALIZATION
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initWorkspace();
  initReportsPage();
  initAuthPages();
  fetchDashboardMetrics();
});

window.addEventListener("formfix_lang_changed", () => {
  // Re-render components with translated dynamic labels
  if (typeof renderFilteredReports === "function" && rawReportsData.length) {
    renderFilteredReports();
  }
});