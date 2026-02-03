const http = require("http");
const url = require("url");
const fs = require("fs").promises;
const path = require("path");

// Directory where credential files will be stored
const KEYS_DIR = path.join(__dirname, "../keys");

// Ensure keys directory exists
async function ensureKeysDir() {
  try {
    await fs.access(KEYS_DIR);
  } catch {
    await fs.mkdir(KEYS_DIR, { recursive: true });
  }
}

// Parse JSON body
async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

// Create the server
const server = http.createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    // Generate credential endpoint
    if (req.url === "/api/credentials/generate" && req.method === "POST") {
      const body = await parseBody(req);
      const { credentialId, badgeId, apiKey } = body;

      if (!credentialId || !badgeId || !apiKey) {
        res.writeHead(400);
        res.end(
          JSON.stringify({
            error: "credentialId, badgeId, and apiKey are required",
          })
        );
        return;
      }

      await ensureKeysDir();

      // Create credential file with API key as content
      const filename = credentialId;
      const filepath = path.join(KEYS_DIR, filename);

      // Write only the API key to the file
      await fs.writeFile(filepath, apiKey, "utf8");

      console.log(`Created credential file: ${filename}`);

      res.writeHead(201);
      res.end(
        JSON.stringify({
          success: true,
          credentialId: credentialId,
          message: "Credential file created successfully",
          filename: filename,
        })
      );
      return;
    }

    // Health check endpoint
    if (req.url === "/api/health" && req.method === "GET") {
      res.writeHead(200);
      res.end(JSON.stringify({ status: "ok" }));
      return;
    }

    // Not found
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Not found" }));
  } catch (error) {
    console.error("Error:", error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: error.message }));
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, "localhost", () => {
  console.log(`Credential server running on http://localhost:${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/credentials/generate`);
});