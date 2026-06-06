#!/bin/bash
set -e

cd packages/api

# 运行数据库迁移
npx prisma migrate deploy

# 运行种子数据（仅首次）
if [ "$RUN_SEED" = "true" ]; then
  echo "Running seed..."
  npx prisma db seed
fi

# 启动服务
npm run start
