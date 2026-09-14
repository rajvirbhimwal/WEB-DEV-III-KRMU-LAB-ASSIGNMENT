// Basic Node.js HTTP server
const http = require("http");
const { URL } = require("url");

const PORT = 3000;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  if (req.method === "GET" && url.pathname === "/") {
    res.statusCode = 200;
    res.end("Welcome to Node Server");
  } else if (req.method === "GET" && url.pathname === "/about") {
    res.statusCode = 200;
    res.end("About Page");
  } else if (req.method === "GET" && url.pathname === "/contact") {
    res.statusCode = 200;
    res.end("Contact Page");
  } else {
    res.statusCode = 404;
    res.end("404 - Page Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Visit: http://localhost:${PORT}/`);
  console.log(`Visit: http://localhost:${PORT}/about`);
  console.log(`Visit: http://localhost:${PORT}/contact`);
});
