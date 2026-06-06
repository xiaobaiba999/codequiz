import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始填充种子数据...');

  // 创建测试用户
  const hashedPassword = await bcrypt.hash('123456', 10);
  const user = await prisma.user.upsert({
    where: { email: 'test@codequiz.com' },
    update: {},
    create: {
      email: 'test@codequiz.com',
      password: hashedPassword,
      nickname: '测试用户',
      avatar: null,
    },
  });

  console.log(`创建用户: ${user.email}`);

  // 创建题目
  const questions = [
    // === 操作系统 ===
    {
      type: 'SINGLE_CHOICE',
      title: '进程与线程的主要区别',
      content: '以下关于进程和线程的说法，哪个是正确的？',
      options: [
        { label: 'A', value: '线程是资源分配的基本单位' },
        { label: 'B', value: '进程是资源分配的基本单位' },
        { label: 'C', value: '线程之间不能共享资源' },
        { label: 'D', value: '进程之间可以共享地址空间' },
      ],
      answer: 'B',
      analysis: '进程是资源分配的基本单位，线程是 CPU 调度的基本单位。同一进程的线程共享进程的资源（如地址空间、文件描述符等），但不同进程之间的地址空间是隔离的。',
      difficulty: 'EASY',
      tags: ['操作系统'],
    },
    {
      type: 'SINGLE_CHOICE',
      title: '死锁的必要条件',
      content: '以下哪个不是死锁产生的必要条件？',
      options: [
        { label: 'A', value: '互斥条件' },
        { label: 'B', value: '请求与保持条件' },
        { label: 'C', value: '可抢占条件' },
        { label: 'D', value: '循环等待条件' },
      ],
      answer: 'C',
      analysis: '死锁的四个必要条件是：互斥条件、请求与保持条件、不可抢占条件、循环等待条件。"可抢占"不是死锁的必要条件，反而是破坏死锁的方法之一。',
      difficulty: 'MEDIUM',
      tags: ['操作系统'],
    },
    {
      type: 'MULTI_CHOICE',
      title: '页面置换算法',
      content: '以下哪些是常见的页面置换算法？',
      options: [
        { label: 'A', value: 'OPT（最佳置换）' },
        { label: 'B', value: 'FIFO（先进先出）' },
        { label: 'C', value: 'LRU（最近最少使用）' },
        { label: 'D', value: 'LFU（最不经常使用）' },
      ],
      answer: 'ABCD',
      analysis: 'OPT、FIFO、LRU、LFU 都是常见的页面置换算法。OPT 是理论上的最优算法（无法实现），FIFO 实现简单但可能产生 Belady 异常，LRU 性能较好但实现开销大，LFU 基于使用频率。',
      difficulty: 'MEDIUM',
      tags: ['操作系统'],
    },
    {
      type: 'FILL_BLANK',
      title: '进程间通信方式',
      content: '在操作系统中，进程间通信的常见方式包括管道、消息队列、共享内存和____。',
      answer: '信号量',
      analysis: '进程间通信（IPC）的常见方式包括：管道（Pipe）、消息队列（Message Queue）、共享内存（Shared Memory）、信号量（Semaphore）、套接字（Socket）等。',
      difficulty: 'EASY',
      tags: ['操作系统'],
    },

    // === 数据结构 ===
    {
      type: 'SINGLE_CHOICE',
      title: '二叉树遍历',
      content: '给定二叉树的前序遍历为 ABDECFG，中序遍历为 DBEAFCG，则后序遍历为？',
      options: [
        { label: 'A', value: 'DEBFGCA' },
        { label: 'B', value: 'EDBFGCA' },
        { label: 'C', value: 'DEBGFCA' },
        { label: 'D', value: 'EDBGFC A' },
      ],
      answer: 'A',
      analysis: '由前序遍历可知根节点为 A，中序遍历中 A 左侧为左子树 DBE，右侧为右子树 FCG。递归分析可得后序遍历为 DEBFGCA。',
      difficulty: 'MEDIUM',
      tags: ['数据结构'],
    },
    {
      type: 'SINGLE_CHOICE',
      title: '哈希表平均查找时间',
      content: '在理想情况下，哈希表查找一个元素的平均时间复杂度是？',
      options: [
        { label: 'A', value: 'O(1)' },
        { label: 'B', value: 'O(log n)' },
        { label: 'C', value: 'O(n)' },
        { label: 'D', value: 'O(n log n)' },
      ],
      answer: 'A',
      analysis: '哈希表通过哈希函数直接定位元素位置，理想情况下（无冲突）查找时间复杂度为 O(1)。最坏情况下（所有元素冲突）退化为 O(n)。',
      difficulty: 'EASY',
      tags: ['数据结构'],
    },
    {
      type: 'MULTI_CHOICE',
      title: '排序算法稳定性',
      content: '以下哪些排序算法是稳定的？',
      options: [
        { label: 'A', value: '冒泡排序' },
        { label: 'B', value: '快速排序' },
        { label: 'C', value: '归并排序' },
        { label: 'D', value: '插入排序' },
      ],
      answer: 'ACD',
      analysis: '稳定排序算法：冒泡排序、归并排序、插入排序。不稳定排序算法：快速排序、希尔排序、选择排序、堆排序。稳定性指相等元素排序后相对位置不变。',
      difficulty: 'MEDIUM',
      tags: ['数据结构'],
    },
    {
      type: 'FILL_BLANK',
      title: '完全二叉树节点数',
      content: '一棵深度为 k 的满二叉树共有____个节点。',
      answer: '2^k-1',
      analysis: '满二叉树的节点总数公式为 2^k - 1，其中 k 为深度（根节点深度为 1）。例如深度为 3 的满二叉树有 7 个节点。',
      difficulty: 'EASY',
      tags: ['数据结构'],
    },

    // === 前端基础 ===
    {
      type: 'SINGLE_CHOICE',
      title: 'JavaScript 事件循环',
      content: '以下代码的输出顺序是什么？\nconsole.log("1");\nsetTimeout(() => console.log("2"), 0);\nPromise.resolve().then(() => console.log("3"));\nconsole.log("4");',
      options: [
        { label: 'A', value: '1, 2, 3, 4' },
        { label: 'B', value: '1, 4, 3, 2' },
        { label: 'C', value: '1, 4, 2, 3' },
        { label: 'D', value: '1, 3, 4, 2' },
      ],
      answer: 'B',
      analysis: '同步代码先执行（1, 4），然后执行微任务（Promise.then → 3），最后执行宏任务（setTimeout → 2）。事件循环的执行顺序：同步代码 → 微任务 → 宏任务。',
      difficulty: 'MEDIUM',
      tags: ['前端基础'],
    },
    {
      type: 'SINGLE_CHOICE',
      title: 'CSS 盒模型',
      content: '在标准盒模型中，元素的总宽度等于？',
      options: [
        { label: 'A', value: 'width' },
        { label: 'B', value: 'width + padding' },
        { label: 'C', value: 'width + padding + border' },
        { label: 'D', value: 'width + padding + border + margin' },
      ],
      answer: 'C',
      analysis: '标准盒模型（content-box）中，元素的总宽度 = width + padding-left + padding-right + border-left + border-right。margin 不计入元素宽度。IE 盒模型（border-box）中 width 包含 padding 和 border。',
      difficulty: 'EASY',
      tags: ['前端基础'],
    },
    {
      type: 'MULTI_CHOICE',
      title: 'React Hooks',
      content: '以下哪些是 React 的内置 Hooks？',
      options: [
        { label: 'A', value: 'useState' },
        { label: 'B', value: 'useEffect' },
        { label: 'C', value: 'useConnect' },
        { label: 'D', value: 'useCallback' },
      ],
      answer: 'ABD',
      analysis: 'React 内置 Hooks 包括：useState、useEffect、useContext、useReducer、useCallback、useMemo、useRef、useImperativeHandle、useLayoutEffect、useDebugValue 等。useConnect 不是 React 内置 Hook，是 React Redux 提供的。',
      difficulty: 'EASY',
      tags: ['前端基础'],
    },
    {
      type: 'FILL_BLANK',
      title: 'HTTP 状态码',
      content: 'HTTP 状态码____表示资源已被永久移动到新的 URL。',
      answer: '301',
      analysis: '301 表示永久重定向（Moved Permanently），302 表示临时重定向，304 表示未修改（缓存有效），404 表示资源未找到。',
      difficulty: 'EASY',
      tags: ['前端基础'],
    },

    // === 计算机网络 ===
    {
      type: 'SINGLE_CHOICE',
      title: 'TCP 三次握手',
      content: 'TCP 三次握手的第二步，服务端发送的报文段标志位是？',
      options: [
        { label: 'A', value: 'SYN' },
        { label: 'B', value: 'ACK' },
        { label: 'C', value: 'SYN+ACK' },
        { label: 'D', value: 'FIN' },
      ],
      answer: 'C',
      analysis: 'TCP 三次握手：① 客户端发送 SYN → ② 服务端发送 SYN+ACK → ③ 客户端发送 ACK。第二步服务端同时确认客户端的 SYN 并发送自己的 SYN。',
      difficulty: 'EASY',
      tags: ['计算机网络'],
    },
    {
      type: 'SINGLE_CHOICE',
      title: 'DNS 解析过程',
      content: 'DNS 解析过程中，首先查询的是？',
      options: [
        { label: 'A', value: '根域名服务器' },
        { label: 'B', value: '本地 DNS 服务器' },
        { label: 'C', value: '顶级域名服务器' },
        { label: 'D', value: '权威域名服务器' },
      ],
      answer: 'B',
      analysis: 'DNS 解析顺序：浏览器缓存 → 操作系统缓存 → 本地 DNS 服务器 → 根域名服务器 → 顶级域名服务器 → 权威域名服务器。首先查询的是本地 DNS 服务器。',
      difficulty: 'MEDIUM',
      tags: ['计算机网络'],
    },
    {
      type: 'FILL_BLANK',
      title: 'TCP 与 UDP',
      content: 'TCP 是面向____的传输层协议，而 UDP 是面向无连接的。',
      answer: '连接',
      analysis: 'TCP（传输控制协议）是面向连接的协议，提供可靠的、有序的数据传输。UDP（用户数据报协议）是无连接的，不保证可靠传输，但延迟更低。',
      difficulty: 'EASY',
      tags: ['计算机网络'],
    },

    // === 编程题 ===
    {
      type: 'PROGRAMMING',
      title: '两数之和',
      content: '给定一个整数数组 nums 和一个整数目标值 target，请在该数组中找出和为目标值的那两个整数，并返回它们的数组下标。\n\n你可以假设每种输入只会对应一个答案，且同一个元素不能使用两遍。\n\n示例：\n输入：nums = [2, 7, 11, 15], target = 9\n输出：[0, 1]\n解释：nums[0] + nums[1] = 2 + 7 = 9',
      options: null,
      answer: '[0,1]',
      analysis: '使用哈希表可以在 O(n) 时间复杂度内解决。遍历数组，对于每个元素，检查 target - 当前元素 是否在哈希表中，如果在则返回两个下标。',
      difficulty: 'EASY',
      tags: ['编程题', '数据结构'],
      testCases: [
        { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]' },
        { input: '[3,2,4]\n6', expectedOutput: '[1,2]' },
      ],
      language: 'python',
      starterCode: 'def two_sum(nums, target):\n    # 请在此处编写代码\n    pass',
    },
    {
      type: 'PROGRAMMING',
      title: '反转链表',
      content: '给你单链表的头节点 head，请你反转链表，并返回反转后的链表。\n\n示例：\n输入：head = [1, 2, 3, 4, 5]\n输出：[5, 4, 3, 2, 1]',
      options: null,
      answer: '[5,4,3,2,1]',
      analysis: '使用迭代法：维护 prev、curr、next 三个指针，遍历链表时逐个反转指向。时间复杂度 O(n)，空间复杂度 O(1)。',
      difficulty: 'EASY',
      tags: ['编程题', '数据结构'],
      testCases: [
        { input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]' },
        { input: '[1,2]', expectedOutput: '[2,1]' },
      ],
      language: 'python',
      starterCode: 'def reverse_list(head):\n    # 请在此处编写代码\n    pass',
    },
    {
      type: 'PROGRAMMING',
      title: '有效的括号',
      content: '给定一个只包括 "("，")"，"{"，"}"，"["，"]" 的字符串 s，判断字符串是否有效。\n\n有效字符串需满足：\n1. 左括号必须用相同类型的右括号闭合\n2. 左括号必须以正确的顺序闭合\n3. 每个右括号都有一个对应的相同类型的左括号\n\n示例：\n输入：s = "()"\n输出：true\n输入：s = "()[]{}"\n输出：true\n输入：s = "(]"\n输出：false',
      options: null,
      answer: 'true',
      analysis: '使用栈来解决。遍历字符串，遇到左括号入栈，遇到右括号时检查栈顶是否为对应的左括号，是则出栈，否则返回 false。最后检查栈是否为空。',
      difficulty: 'EASY',
      tags: ['编程题', '数据结构'],
      testCases: [
        { input: '()', expectedOutput: 'true' },
        { input: '()[]{}', expectedOutput: 'true' },
        { input: '(]', expectedOutput: 'false' },
      ],
      language: 'javascript',
      starterCode: 'function isValid(s) {\n  // 请在此处编写代码\n}',
    },

    // === 数据库 ===
    {
      type: 'SINGLE_CHOICE',
      title: '数据库事务 ACID',
      content: '事务的 ACID 特性中，I 代表的是？',
      options: [
        { label: 'A', value: 'Integrity（完整性）' },
        { label: 'B', value: 'Isolation（隔离性）' },
        { label: 'C', value: 'Independence（独立性）' },
        { label: 'D', value: 'Identity（同一性）' },
      ],
      answer: 'B',
      analysis: 'ACID：A（Atomicity 原子性）、C（Consistency 一致性）、I（Isolation 隔离性）、D（Durability 持久性）。隔离性指并发事务之间互不干扰。',
      difficulty: 'EASY',
      tags: ['数据库'],
    },
    {
      type: 'MULTI_CHOICE',
      title: 'SQL 连接类型',
      content: '以下哪些是 SQL 中的连接类型？',
      options: [
        { label: 'A', value: 'INNER JOIN' },
        { label: 'B', value: 'LEFT JOIN' },
        { label: 'C', value: 'CROSS JOIN' },
        { label: 'D', value: 'MIDDLE JOIN' },
      ],
      answer: 'ABC',
      analysis: 'SQL 连接类型包括：INNER JOIN（内连接）、LEFT JOIN（左连接）、RIGHT JOIN（右连接）、FULL JOIN（全连接）、CROSS JOIN（交叉连接）。MIDDLE JOIN 不是有效的 SQL 连接类型。',
      difficulty: 'EASY',
      tags: ['数据库'],
    },
    {
      type: 'FILL_BLANK',
      title: '数据库索引',
      content: 'MySQL 中最常用的索引类型是基于____树实现的。',
      answer: 'B+',
      analysis: 'MySQL 的 InnoDB 存储引擎使用 B+ 树作为索引结构。B+ 树的非叶子节点只存储键值，叶子节点存储所有数据并通过链表相连，适合范围查询。',
      difficulty: 'MEDIUM',
      tags: ['数据库'],
    },

    // === 额外编程题 ===
    {
      type: 'PROGRAMMING',
      title: '斐波那契数列',
      content: '写一个函数，输入 n，返回斐波那契数列的第 n 项。斐波那契数列定义：F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2)。\n\n示例：\n输入：n = 4\n输出：3\n解释：F(4) = F(3) + F(2) = 2 + 1 = 3',
      options: null,
      answer: '3',
      analysis: '可以使用动态规划或迭代法。动态规划：dp[i] = dp[i-1] + dp[i-2]，时间复杂度 O(n)，空间复杂度可优化到 O(1)。',
      difficulty: 'EASY',
      tags: ['编程题', '数据结构'],
      testCases: [
        { input: '4', expectedOutput: '3' },
        { input: '0', expectedOutput: '0' },
        { input: '10', expectedOutput: '55' },
      ],
      language: 'python',
      starterCode: 'def fibonacci(n):\n    # 请在此处编写代码\n    pass',
    },
  ];

  console.log(`准备创建 ${questions.length} 道题目...`);

  for (const q of questions) {
    await prisma.question.create({ data: q });
  }

  console.log(`已创建 ${questions.length} 道题目`);

  // 创建示例评论
  const allQuestions = await prisma.question.findMany({ take: 5 });
  const comments = [];

  for (const question of allQuestions) {
    comments.push({
      questionId: question.id,
      userId: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      content: '这道题的解析写得很清楚，帮助我理解了这个知识点。',
    });
    comments.push({
      questionId: question.id,
      userId: user.id,
      nickname: '学习达人',
      avatar: null,
      content: '有没有更简单的解法？欢迎讨论。',
    });
  }

  await prisma.comment.createMany({ data: comments });
  console.log(`已创建 ${comments.length} 条评论`);

  console.log('种子数据填充完成！');
}

main()
  .catch((e) => {
    console.error('种子数据填充失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
