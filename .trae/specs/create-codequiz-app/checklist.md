# CodeQuiz 项目检查清单

## 工程架构
- [x] pnpm-workspace.yaml 正确配置四个子包
- [x] nx.json 配置正确，子包间依赖关系明确
- [x] docker-compose.yml 可正常启动 PostgreSQL 和 Redis
- [x] .env.example 包含所有必要环境变量
- [x] README.md 包含完整的启动步骤说明

## 共享类型（packages/types）
- [x] 所有 API 请求/响应 DTO 类型已定义
- [x] 题目类型枚举（SINGLE_CHOICE、MULTI_CHOICE、FILL_BLANK、PROGRAMMING）已定义
- [x] 难度枚举（EASY、MEDIUM、HARD）已定义
- [x] 统一响应格式类型 ApiResponse<T> 已定义

## 后端 API（packages/api）
- [x] Prisma Schema 包含所有数据模型（User、Question、UserAnswer、Exam、ExamResult、Favorite、Note、Comment）
- [x] 数据库迁移文件可正常执行
- [x] 种子脚本生成至少 20 道不同题型和分类的题目 + 示例评论
- [x] JWT + Refresh Token 认证中间件正常工作
- [x] 所有 API 返回统一格式 { success, data, message }
- [x] Swagger 文档可访问且覆盖所有接口
- [x] 编程题判题服务封装了 Piston/Judge0 调用，并有 mock 降级
- [x] 错题自动记录逻辑正确
- [x] 模拟考试倒计时和自动交卷逻辑正确
- [x] 填空题模糊匹配（忽略大小写与空格）逻辑正确

## Web 前端（packages/web）
- [x] 暗色/亮色模式可切换且全局生效
- [x] 响应式布局在桌面、平板、手机浏览器中均正常显示
- [x] 移动端导航收缩为汉堡菜单
- [x] 登录/注册流程完整
- [x] 题目列表页支持分页、搜索、标签/难度筛选
- [x] 答题页面四种题型交互正确（单选点击、多选确认、填空模糊匹配、编程 Monaco Editor）
- [x] 刷题三种模式（顺序、随机、模拟考试）功能完整
- [x] 模拟考试倒计时和自动交卷正常
- [x] 错题本页面功能完整（查看、移除、重新练习、清空）
- [x] 收藏夹和笔记功能正常
- [x] 学习统计页面图表正确展示（Recharts）
- [x] 讨论区评论列表正常显示
- [x] 个人中心可修改头像、昵称、密码

## 移动端 App（packages/mobile）
- [x] 底栏导航四个标签（首页、题库、统计、我的）正常切换
- [x] 暗色模式支持
- [x] 登录/注册屏幕功能正常
- [x] 题库列表屏幕支持搜索和筛选
- [x] 答题屏幕四种题型交互正确
- [x] 刷题模式屏幕功能完整
- [x] 错题本屏幕功能完整
- [x] 收藏夹屏幕功能完整
- [x] 学习统计图表正确展示（victory-native）
- [x] 讨论区组件正常显示
- [x] 个人中心屏幕功能完整

## OTA 热更新
- [x] react-native-code-push 已集成
- [x] Staging/Production 环境部署 Key 配置正确
- [x] 启动时静默检查更新并下载
- [x] 下载完成后提示用户重启
- [x] 强制更新逻辑正确（不允许跳过）
- [x] OTA.md 使用说明完整（App Center 注册、Key 获取、发布命令、注意事项）
