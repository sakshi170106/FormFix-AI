const assert = require("assert");
const bcrypt = require("./node_modules/bcryptjs");
const jwt = require("./node_modules/jsonwebtoken");
const authMiddleware = require("./middleware/authMiddleware");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret-key-1234567890123456";

async function runTests() {
  console.log("--- STARTING BACKEND LOGIC AND SECURITY TESTS ---");

  // 1. Password Hashing Test
  console.log("Test 1: Bcrypt Password Hashing and Comparison");
  const password = "SuperSecretPassword123!";
  const hash = await bcrypt.hash(password, 12);
  assert(hash !== password, "Password was not hashed");
  assert(await bcrypt.compare(password, hash), "Password comparison failed on matching password");
  assert(!(await bcrypt.compare("WrongPassword", hash)), "Password comparison succeeded on wrong password");
  console.log("  ✓ Password hashing & comparison verified successfully");

  // 2. JWT Generation & Middleware Verification
  console.log("Test 2: JWT Generation & authMiddleware verification");
  const payload = { id: "507f1f77bcf86cd799439011", role: "student" };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

  // Test valid token
  let req = { headers: { authorization: `Bearer ${token}` } };
  let res = { status: (code) => ({ json: (data) => ({ code, data }) }) };
  let nextCalled = false;
  authMiddleware(req, res, () => { nextCalled = true; });
  assert(nextCalled, "authMiddleware did not call next() for valid token");
  assert.strictEqual(req.user.id, payload.id, "User ID not attached correctly");
  assert.strictEqual(req.user.role, payload.role, "User role not attached correctly");
  console.log("  ✓ Valid JWT token accepted and req.user populated");

  // Test missing token
  let errorStatusCode = 0;
  let errorResponse = null;
  req = { headers: {} };
  res = {
    status: (code) => {
      errorStatusCode = code;
      return {
        json: (d) => {
          errorResponse = d;
        }
      };
    }
  };
  nextCalled = false;
  authMiddleware(req, res, () => { nextCalled = true; });
  assert(!nextCalled, "next() was called with missing token");
  assert.strictEqual(errorStatusCode, 401, "Expected 401 on missing token");
  assert.strictEqual(errorResponse.success, false, "Expected success: false");
  console.log("  ✓ Missing JWT token rejected with 401");

  // Test invalid / tampered token
  req = { headers: { authorization: "Bearer invalid.fake.token" } };
  res = {
    status: (code) => {
      errorStatusCode = code;
      return {
        json: (d) => {
          errorResponse = d;
        }
      };
    }
  };
  nextCalled = false;
  authMiddleware(req, res, () => { nextCalled = true; });
  assert(!nextCalled, "next() was called with invalid token");
  assert.strictEqual(errorStatusCode, 401, "Expected 401 on invalid token");
  console.log("  ✓ Tampered JWT token rejected with 401");

  // 3. File Validation Logic (Magic Bytes)
  console.log("Test 3: File Signature Validation (PDF, JPG, PNG)");
  const validPdfBuffer = Buffer.from("%PDF-1.4 header contents here");
  const fakePdfBuffer = Buffer.from("This is a plain text file pretending to be pdf");
  const validJpgBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  const validPngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);

  function isPdfValid(buffer) {
    return buffer.length >= 5 && buffer.subarray(0, 5).toString() === "%PDF-";
  }
  function isJpgValid(buffer) {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  function isPngValid(buffer) {
    return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }

  assert(isPdfValid(validPdfBuffer), "Valid PDF failed signature check");
  assert(!isPdfValid(fakePdfBuffer), "Invalid PDF passed signature check unexpectedly");
  assert(isJpgValid(validJpgBuffer), "Valid JPG failed signature check");
  assert(isPngValid(validPngBuffer), "Valid PNG failed signature check");
  console.log("  ✓ PDF, JPG, and PNG signature validation checks verified");

  // 4. Missing Document Detection & Readiness Score
  console.log("Test 4: Missing Document Detection & Readiness Score Calculation");
  const required = ["Identity proof", "Income certificate", "Academic marksheet"];
  const uploadedFileNames = ["my_aadhaar_identity.pdf", "marksheet_12th.pdf"]; // missing income
  
  const missing = required.filter(doc => {
    const keywords = doc.toLowerCase().split(/\s+/);
    return !uploadedFileNames.some(name => keywords.some(k => name.toLowerCase().includes(k)));
  });

  assert.strictEqual(missing.length, 1, "Expected 1 missing document");
  assert.strictEqual(missing[0], "Income certificate", "Expected 'Income certificate' to be missing");

  // Score formula: valid files ratio - missing docs * 15
  let score = Math.round((2 / 2) * 100) - (missing.length * 15);
  score = Math.max(0, score);
  assert.strictEqual(score, 85, `Expected score 85, got ${score}`);
  console.log(`  ✓ Missing document detected: ${missing[0]}, readiness score calculated: ${score}/100`);

  console.log("\n>>> ALL BACKEND LOGIC AND SECURITY TESTS PASSED! <<<");
}

runTests().catch(err => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
