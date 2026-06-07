#!/bin/bash
set -e
pnpm exec prisma generate
mkdir -p public/api
cat > public/api/ping.js << 'EOF'
exports.default = function(req, res) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ ok: true }));
};
EOF
cp api/index.ts public/api/index.ts
cp api/health.ts public/api/health.ts 2>/dev/null || true
