# CodeQuiz 跨平台刷题应用 Spec

## Why
当前缺乏一个前后端分离、多端统一的刷题应用，无法同时满足 PC 端深度学习和移动端碎片化刷题的需求。本项目旨在构建一个完整的刷题闭环系统，支持 Web 和 React Native 双端，并提供 OTA 热更新能力。

## What Changes
- 搭建 pnpm + Nx monorepo 工程结构，包含 packages/api、packages/web、packages/mobile、packages/types 四个子包
- 实现基于 JWT + Refresh Token 的用户认证系统（邮箱注册/登录）
- 构建题库管理后端（Prisma + PostgreSQL + Redis），支持单选、多选、填空、编程四种题型
- 实现 RESTful API 并集成 Swagger 文档
- 开发 Web 前端（React 18 + Vite + Ant Design），支持暗色模式和响应式布局
- 开发移动端 App（React Native CLI + React Navigation），集成 CodePush OTA 更新
- 实现刷题模式：顺序练习、随机练习、模拟考试
- 实现答题界面：单选/多选/填空/编程题，编程题集成 Piston/Judge0 判题
- 实现错题本、收藏与笔记、学习统计、讨论区功能
- 提供 docker-compose.yml 本地开发环境和种子数据脚本

## Impact
- Affected specs: 全新项目，无已有 spec 受影响
- Affected code: 全新代码库

---

## ADDED Requirements

### Requirement: Monorepo 工程架构
系统 SHALL 使用 pnpm workspace + Nx 管理 monorepo，包含以下子包：
- `packages/api`：Node.js + Express + TypeScript 后端
- `packages/web`：React 18 + Vite + Ant Design Web 前端
- `packages/mobile`：React Native CLI + TypeScript 移动端
- `packages/types`：共享类型定义，供所有子包复用

#### Scenario: 开发环境启动
- **WHEN** 开发者执行 `pnpm install` 并启动 docker-compose
- **THEN** 所有依赖安装完成，PostgreSQL 和 Redis 容器运行，可通过 `pnpm dev` 同时启动前后端

### Requirement: 用户认证系统
系统 SHALL 提供邮箱注册、登录、退出功能，使用 JWT + Refresh Token 机制。

#### Scenario: 邮箱注册
- **WHEN** 用户提交有效的邮箱和密码
- **THEN** 系统创建用户账户并返回 access token 和 refresh token

#### Scenario: Token 刷新
- **WHEN** access token 过期且 refresh token 有效
- **THEN** 系统签发新的 access token

#### Scenario: 个人中心
- **WHEN** 用户访问个人中心
- **THEN** 可查看和修改头像、昵称、密码

### Requirement: 题库管理
系统 SHALL 支持四种题型（单选、多选、填空、编程），每题包含题干、选项（JSON）、正确答案、解析、难度、分类标签。

#### Scenario: 题目 CRUD
- **WHEN** 管理员通过 API 创建/更新/删除题目
- **THEN** 数据库相应更新并返回操作结果

#### Scenario: 批量导入
- **WHEN** 管理员提交 JSON 格式的题目数据
- **THEN** 系统批量创建题目并返回导入结果

#### Scenario: 种子数据
- **WHEN** 执行种子脚本
- **THEN** 数据库中生成至少 20 道不同题型和分类的示例题目

### Requirement: 刷题模式
系统 SHALL 提供顺序练习、随机练习、模拟考试三种模式。

#### Scenario: 顺序练习
- **WHEN** 用户选择顺序练习并指定分类（或全部）
- **THEN** 系统按顺序返回题目列表，用户逐题作答

#### Scenario: 随机练习
- **WHEN** 用户选择随机练习并限定题型和难度
- **THEN** 系统随机抽取符合条件的题目

#### Scenario: 模拟考试
- **WHEN** 用户配置题目数量和时间限制后开始考试
- **THEN** 系统倒计时，时间到自动交卷并生成成绩报告

### Requirement: 答题界面
系统 SHALL 根据题型提供不同的答题交互。

#### Scenario: 单选题
- **WHEN** 用户点击选项并提交
- **THEN** 系统立即判题并显示结果、正确答案和解析

#### Scenario: 多选题
- **WHEN** 用户选择多个选项并点击确认按钮
- **THEN** 系统判题并显示结果

#### Scenario: 填空题
- **WHEN** 用户在文本框输入答案并提交
- **THEN** 系统与正确答案进行模糊匹配（忽略大小写与空格）

#### Scenario: 编程题
- **WHEN** 用户在代码编辑器中编写代码（Web 端用 Monaco Editor，移动端用文本输入）并提交
- **THEN** 系统调用判题服务（Piston/Judge0），返回通过/失败及执行输出

### Requirement: 错题本
系统 SHALL 自动记录答错的题目，支持移除、重新练习和清空。

#### Scenario: 自动记录
- **WHEN** 用户答错题目
- **THEN** 题目自动加入错题本

#### Scenario: 重新练习
- **WHEN** 用户选择重新练习错题
- **THEN** 系统展示错题本中的题目供用户作答

### Requirement: 收藏与笔记
系统 SHALL 支持收藏题目和添加私人笔记。

#### Scenario: 收藏题目
- **WHEN** 用户点击收藏按钮
- **THEN** 题目加入个人收藏夹

#### Scenario: 添加笔记
- **WHEN** 用户在答题页面添加/编辑笔记
- **THEN** 笔记保存并与该题目关联

### Requirement: 学习统计
系统 SHALL 展示刷题总数、正确率趋势图、各分类掌握程度、学习时长。

#### Scenario: 查看统计
- **WHEN** 用户访问统计页面
- **THEN** 显示刷题总数、正确率趋势（按天/周）、各分类掌握度图表、学习时长

### Requirement: 讨论区
系统 SHALL 在每道题下方展示评论（只读），种子数据中包含示例评论。

#### Scenario: 查看评论
- **WHEN** 用户查看某题的讨论区
- **THEN** 显示该题的评论列表

### Requirement: 暗色模式
系统 SHALL 在 Web 端和移动端均支持暗色/亮色模式切换。

#### Scenario: 切换主题
- **WHEN** 用户在设置中切换暗色模式
- **THEN** 整个应用界面切换为暗色/亮色主题

### Requirement: OTA 热更新
移动端 SHALL 集成 react-native-code-push，支持 Staging/Production 环境配置。

#### Scenario: 静默更新
- **WHEN** 应用启动时检测到新版本
- **THEN** 静默下载更新，完成后提示用户重启

#### Scenario: 强制更新
- **WHEN** 服务端标记为强制更新
- **THEN** 用户必须应用更新后才能继续使用

### Requirement: API 规范
所有 API SHALL 遵循 RESTful 风格，统一响应格式为 `{ success, data, message }`，并集成 Swagger 文档。

#### Scenario: 统一响应
- **WHEN** 客户端调用任意 API
- **THEN** 返回 `{ success: boolean, data: T, message: string }` 格式的响应

### Requirement: 本地开发环境
系统 SHALL 提供 docker-compose.yml 启动 PostgreSQL 和 Redis，以及数据库种子脚本。

#### Scenario: 环境初始化
- **WHEN** 开发者执行 `docker-compose up -d` 和种子脚本
- **THEN** PostgreSQL 和 Redis 运行，数据库填充示例数据

### Requirement: Web 响应式布局
Web 端 SHALL 采用响应式布局，适配桌面、平板和手机浏览器，移动端导航收缩为汉堡菜单。

#### Scenario: 移动端浏览
- **WHEN** 在手机浏览器中访问 Web 端
- **THEN** 导航栏收缩为汉堡菜单，布局自适应屏幕宽度

### Requirement: 移动端底栏导航
移动端 SHALL 使用原生底栏导航，包含首页、题库、统计、我的四个标签。

#### Scenario: 底栏切换
- **WHEN** 用户点击底栏标签
- **THEN** 切换到对应页面

### Requirement: 判题服务
系统 SHALL 使用 Piston API 或 Judge0 进行编程题判题，外部服务不可用时返回 mock 结果。

#### Scenario: 正常判题
- **WHEN** 用户提交编程题代码
- **THEN** 系统调用判题 API 执行代码并与预期输出比对

#### Scenario: 判题服务不可用
- **WHEN** 外部判题服务无法访问
- **THEN** 系统返回 mock 判题结果并提示服务暂不可用
