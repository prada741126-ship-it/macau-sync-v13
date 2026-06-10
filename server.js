const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// HTML 文件禁用缓存 (关键修复 — 否则浏览器忽略 HTML meta)
app.use((req, res, next) => {
  if (req.path.endsWith('.html') || req.path === '/') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

app.use(express.static(path.join(__dirname, 'dist')));

// 所有路由指向 index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`v13 Macau Sync running on port ${PORT}`);
});
