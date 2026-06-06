# Tasks

- [x] Task 1: 初始化 Monorepo 工程结构
  - [x] SubTask 1.1: 创建根目录配置文件（pnpm-workspace.yaml、nx.json、package.json、tsconfig.base.json、.eslintrc.js、.prettierrc、.env.example、.gitignore）
  - [x] SubTask 1.2: 创建 docker-compose.yml（PostgreSQL + Redis）
  - [x] SubTask 1.3: 创建 packages/types 子包（所有 DTO 接口定义：User、Question、Answer、Exam、Note、Comment、Stats 等）
  - [x] SubTask 1.4: 创建项目根目录 README.md（启动步骤说明）

- [x] Task 2: 搭建后端 API 服务（packages/api）
  - [x] SubTask 2.1: 初始化 Express + TypeScript 项目，配置 package.json、tsconfig.json
  - [x] SubTask 2.2: 配置 Prisma Schema（User、Question、UserAnswer、Exam、ExamResult、Favorite、Note、Comment 模型）
  - [x] SubTask 2.3: 实现数据库连接、Redis 连接和全局中间件（CORS、JSON 解析、错误处理）
  - [x] SubTask 2.4: 实现用户认证模块（注册、登录、刷新 Token、JWT 中间件）
  - [x] SubTask 2.5: 实现题目管理 API（CRUD、批量导入、按标签/难度筛选、分页）
  - [x] SubTask 2.6: 实现答题与判题 API（提交答案、编程题判题服务封装 Piston/Judge0 + mock 降级）
  - [x] SubTask 2.7: 实现刷题模式 API（顺序练习、随机练习、模拟考试创建/交卷/成绩报告）
  - [x] SubTask 2.8: 实现错题本 API（自动记录、查询、移除、清空、重新练习）
  - [x] SubTask 2.9: 实现收藏与笔记 API（收藏/取消收藏、添加/编辑笔记）
  - [x] SubTask 2.10: 实现学习统计 API（刷题总数、正确率趋势、分类掌握度、学习时长）
  - [x] SubTask 2.11: 实现讨论区 API（获取题目评论列表）
  - [x] SubTask 2.12: 实现个人中心 API（获取/更新用户信息、修改密码）
  - [x] SubTask 2.13: 集成 Swagger 文档
  - [x] SubTask 2.14: 编写种子数据脚本（至少 20 道不同题型和分类的题目 + 示例评论）

- [x] Task 3: 搭建 Web 前端（packages/web）
  - [x] SubTask 3.1: 初始化 React 18 + Vite + TypeScript 项目，配置 Ant Design
  - [x] SubTask 3.2: 实现路由配置（React Router）、API 调用模块（axios 封装）、状态管理（Zustand）
  - [x] SubTask 3.3: 实现暗色模式切换（Ant Design ConfigProvider + CSS 变量）
  - [x] SubTask 3.4: 实现响应式布局（Header + Sidebar，移动端汉堡菜单）
  - [x] SubTask 3.5: 实现登录/注册页面
  - [x] SubTask 3.6: 实现题目列表页（分页、搜索、标签/难度筛选、完成状态）
  - [x] SubTask 3.7: 实现答题页面（单选/多选/填空/编程题，Monaco Editor，判题结果展示）
  - [x] SubTask 3.8: 实现刷题模式页面（顺序练习、随机练习、模拟考试含倒计时）
  - [x] SubTask 3.9: 实现错题本页面
  - [x] SubTask 3.10: 实现收藏夹页面
  - [x] SubTask 3.11: 实现学习统计页面（Recharts 图表：正确率趋势、分类掌握度）
  - [x] SubTask 3.12: 实现讨论区组件（题目下方评论列表）
  - [x] SubTask 3.13: 实现个人中心页面（头像、昵称、修改密码、主题切换）

- [x] Task 4: 搭建移动端 App（packages/mobile）
  - [x] SubTask 4.1: 初始化 React Native CLI + TypeScript 项目
  - [x] SubTask 4.2: 配置 React Navigation 底栏导航（首页、题库、统计、我的）
  - [x] SubTask 4.3: 实现 API 调用模块和状态管理
  - [x] SubTask 4.4: 实现暗色模式支持
  - [x] SubTask 4.5: 实现登录/注册屏幕
  - [x] SubTask 4.6: 实现首页屏幕（推荐练习、继续学习入口）
  - [x] SubTask 4.7: 实现题库列表屏幕（搜索、筛选、分页）
  - [x] SubTask 4.8: 实现答题屏幕（单选/多选/填空/编程题，编程题使用文本输入）
  - [x] SubTask 4.9: 实现刷题模式屏幕（顺序、随机、模拟考试含倒计时）
  - [x] SubTask 4.10: 实现错题本屏幕
  - [x] SubTask 4.11: 实现收藏夹屏幕
  - [x] SubTask 4.12: 实现学习统计屏幕（victory-native 图表）
  - [x] SubTask 4.13: 实现讨论区组件
  - [x] SubTask 4.14: 实现个人中心屏幕

- [x] Task 5: 集成 OTA 热更新
  - [x] SubTask 5.1: 集成 react-native-code-push，配置 Staging/Production 部署 Key
  - [x] SubTask 5.2: 实现启动时静默检查更新 + 下载完成后提示重启
  - [x] SubTask 5.3: 实现强制更新逻辑
  - [x] SubTask 5.4: 编写 OTA.md 使用说明（App Center 注册、Key 获取、发布命令、注意事项）

# Task Dependencies
- Task 1 是所有后续任务的基础
- Task 2 依赖 Task 1（特别是 packages/types）
- Task 3 和 Task 4 依赖 Task 1 和 Task 2（需要 API 和类型定义）
- Task 3 和 Task 4 可并行开发
- Task 5 依赖 Task 4（移动端基础完成后集成 CodePush）
