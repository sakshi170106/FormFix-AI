const http = require("http");

process.env.PORT = "5055";
process.env.JWT_SECRET = "test-secret-key-1234567890123456";

// Require server
const { server } = require("./server");

function request(method, urlPath, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "127.0.0.1",
      port: 5055,
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
      req.write(typeof body === "string" ? body : JSON.stringify(body));
    }
    req.end();
  });
}

// Give 300ms for listen
setTimeout(async () => {
  console.log("--- RUNNING HTTP API INTEGRATION TESTS ---");
  try {
    // 1. Health check
    console.log("Test 1: GET /api/health");
    const health = await request("GET", "/api/health");
    console.log("  Status:", health.status, "Body:", health.body);
    if (health.status !== 200 || !health.body.success) {
      throw new Error("Health check failed");
    }

    // 2. Static HTML check
    console.log("Test 2: GET / (Serving index.html)");
    const home = await request("GET", "/");
    console.log("  Status:", home.status, "Is HTML:", typeof home.body === "string" && home.body.includes("FormFix AI"));
    if (home.status !== 200 || !home.body.includes("FormFix AI")) {
      throw new Error("Home route failed to serve index.html");
    }

    // 3. Register validation (missing fields)
    console.log("Test 3: POST /api/auth/register (Validation check)");
    const regFail = await request("POST", "/api/auth/register", { "Content-Type": "application/json" }, {});
    console.log("  Status:", regFail.status, "Message:", regFail.body.message);
    if (regFail.status !== 400 || regFail.body.success !== false) {
      throw new Error("Register validation failed to reject empty body");
    }

    // 4. Login validation (missing fields)
    console.log("Test 4: POST /api/auth/login (Validation check)");
    const loginFail = await request("POST", "/api/auth/login", { "Content-Type": "application/json" }, {});
    console.log("  Status:", loginFail.status, "Message:", loginFail.body.message);
    if (loginFail.status !== 400 || loginFail.body.success !== false) {
      throw new Error("Login validation failed to reject empty body");
    }

    // 5. Protected profile without JWT
    console.log("Test 5: GET /api/auth/me (Unauthorized check)");
    const meUnauthorized = await request("GET", "/api/auth/me");
    console.log("  Status:", meUnauthorized.status, "Message:", meUnauthorized.body.message);
    if (meUnauthorized.status !== 401) {
      throw new Error("Protected route allowed access without token");
    }

    // 6. Protected checks endpoint without JWT
    console.log("Test 6: GET /api/checks (Unauthorized check)");
    const checksUnauthorized = await request("GET", "/api/checks");
    console.log("  Status:", checksUnauthorized.status, "Message:", checksUnauthorized.body.message);
    if (checksUnauthorized.status !== 401) {
      throw new Error("Checks endpoint allowed access without token");
    }

    // 7. Unknown API route
    console.log("Test 7: GET /api/unknown (404 handler check)");
    const notFound = await request("GET", "/api/unknown");
    console.log("  Status:", notFound.status, "Message:", notFound.body.message);
    if (notFound.status !== 404) {
      throw new Error("404 handler failed");
    }

    console.log("\n>>> ALL HTTP INTEGRATION TESTS PASSED SUCCESSFULLY! <<<");
    server.close(() => process.exit(0));
  } catch (err) {
    console.error("HTTP TEST ERROR:", err);
    server.close(() => process.exit(1));
  }
}, 500);
