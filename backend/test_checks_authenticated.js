const http = require("http");
const jwt = require("./node_modules/jsonwebtoken");

process.env.PORT = "5056";
process.env.JWT_SECRET = "test-secret-key-1234567890123456";

const { server } = require("./server");

function buildMultipartBody(boundary, fields, files) {
  let buffers = [];

  for (const [name, val] of Object.entries(fields)) {
    buffers.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${val}\r\n`));
  }

  for (const file of files) {
    buffers.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="${file.fieldname}"; filename="${file.filename}"\r\nContent-Type: ${file.contentType}\r\n\r\n`
    ));
    buffers.push(file.content);
    buffers.push(Buffer.from("\r\n"));
  }

  buffers.push(Buffer.from(`--${boundary}--\r\n`));
  return Buffer.concat(buffers);
}

function request(method, urlPath, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "127.0.0.1",
      port: 5056,
      path: urlPath,
      method: method,
      headers: headers
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        let json = null;
        try { json = JSON.parse(data); } catch (_) {}
        resolve({ status: res.statusCode, headers: res.headers, body: json || data });
      });
    });

    req.on("error", reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

setTimeout(async () => {
  console.log("--- RUNNING AUTHENTICATED CHECKS & MULTIPART TESTS ---");
  try {
    const testUserId = "507f1f77bcf86cd799439011";
    const token = jwt.sign({ id: testUserId, role: "student" }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const authHeaders = { Authorization: `Bearer ${token}` };

    // 1. Check stats endpoint with auth
    console.log("Test 1: GET /api/checks/stats with JWT");
    const statsRes = await request("GET", "/api/checks/stats", authHeaders);
    console.log("  Status:", statsRes.status, "Stats:", statsRes.body);
    if (statsRes.status !== 200 || !statsRes.body.success) {
      throw new Error("Stats endpoint failed");
    }

    // 2. Upload valid PDF document check
    console.log("Test 2: POST /api/checks with valid PDF file and JWT");
    const boundary = "----FormFixBoundary" + Math.random().toString(36).substring(2);
    const validPdfBytes = Buffer.from("%PDF-1.5 \n1 0 obj<<>>endobj\ntrailer<<>>%%EOF");
    const multipartData = buildMultipartBody(
      boundary,
      { applicationType: "scholarship", applicationName: "Merit Scholarship" },
      [{ fieldname: "documents", filename: "identity_proof.pdf", contentType: "application/pdf", content: validPdfBytes }]
    );

    const checkRes = await request("POST", "/api/checks", {
      ...authHeaders,
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "Content-Length": multipartData.length
    }, multipartData);

    console.log("  Status:", checkRes.status, "Success:", checkRes.body.success);
    console.log("  Report message:", checkRes.body.message);
    if (checkRes.status !== 201 || !checkRes.body.success || !checkRes.body.report) {
      throw new Error("Document check failed to process valid PDF");
    }

    const report = checkRes.body.report;
    console.log("  Readiness Score:", report.readinessScore, "Docs count:", report.documents.length);
    console.log("  Document status:", report.documents[0].status, "message:", report.documents[0].message);
    if (report.documents[0].status !== "valid") {
      throw new Error("Valid PDF was not marked valid");
    }

    // 3. Upload invalid/corrupted PDF document check
    console.log("Test 3: POST /api/checks with fake PDF (invalid magic bytes)");
    const fakeBoundary = "----FormFixBoundaryFake" + Math.random().toString(36).substring(2);
    const fakePdfBytes = Buffer.from("NOT_A_REAL_PDF_FILE_JUST_PLAIN_TEXT");
    const fakeMultipartData = buildMultipartBody(
      fakeBoundary,
      { applicationType: "college", applicationName: "College Application" },
      [{ fieldname: "documents", filename: "corrupt_transcript.pdf", contentType: "application/pdf", content: fakePdfBytes }]
    );

    const fakeCheckRes = await request("POST", "/api/checks", {
      ...authHeaders,
      "Content-Type": `multipart/form-data; boundary=${fakeBoundary}`,
      "Content-Length": fakeMultipartData.length
    }, fakeMultipartData);

    console.log("  Status:", fakeCheckRes.status, "Doc status:", fakeCheckRes.body.report.documents[0].status);
    console.log("  Error message:", fakeCheckRes.body.report.documents[0].message);
    if (fakeCheckRes.body.report.documents[0].status !== "error") {
      throw new Error("Fake PDF was not correctly flagged as error");
    }

    console.log("\n>>> ALL AUTHENTICATED CHECKS AND MULTIPART TESTS PASSED! <<<");
    server.close(() => process.exit(0));
  } catch (err) {
    console.error("AUTHENTICATED TEST ERROR:", err);
    server.close(() => process.exit(1));
  }
}, 500);
