/**
 * 题库文档智能解析器
 * 支持常见中文题库格式的自动识别：
 * - 题号模式：1. 2. 一、二、 1、 2、
 * - 题型识别：单选题、多选题、填空题、编程题、判断
 * - 选项模式：A. B. C. D. 或 A、 B、
 * - 答案模式：答案：A  参考答案：B
 * - 解析模式：解析：  答案解析：
 */

interface ParsedQuestion {
  type: string;
  title: string;
  content: string;
  options: { label: string; value: string }[];
  answer: string;
  analysis: string;
  difficulty: string;
  tags: string[];
  language?: string;
  starterCode?: string;
  testCases?: { input: string; expectedOutput: string }[];
}

// 题型关键词映射
const TYPE_KEYWORDS: Record<string, string> = {
  '单选': 'SINGLE_CHOICE',
  '多选': 'MULTI_CHOICE',
  '填空': 'FILL_BLANK',
  '编程': 'PROGRAMMING',
  '程序设计': 'PROGRAMMING',
  '判断': 'FILL_BLANK', // 判断题归为填空题
  '简答': 'FILL_BLANK',
  '论述': 'FILL_BLANK',
};

// 难度关键词映射
const DIFFICULTY_KEYWORDS: Record<string, string> = {
  '简单': 'EASY', '容易': 'EASY', '基础': 'EASY',
  '中等': 'MEDIUM', '一般': 'MEDIUM',
  '困难': 'HARD', '较难': 'HARD', '难': 'HARD',
};

function detectType(text: string): string {
  for (const [kw, type] of Object.entries(TYPE_KEYWORDS)) {
    if (text.includes(kw)) return type;
  }
  // 有选项 → 单选，无选项 → 填空
  if (/[A-D][.、]/.test(text)) return 'SINGLE_CHOICE';
  return 'FILL_BLANK';
}

function detectDifficulty(text: string): string {
  for (const [kw, diff] of Object.entries(DIFFICULTY_KEYWORDS)) {
    if (text.includes(kw)) return diff;
  }
  return 'MEDIUM';
}

function extractTags(text: string): string[] {
  const tags: string[] = [];
  // 尝试从文本中提取学科标签
  const subjects = ['JavaScript', 'Python', 'Java', 'C++', '算法', '数据结构',
    '网络', '数据库', '操作系统', '前端', '后端', 'Vue', 'React', 'Node.js',
    'HTML', 'CSS', 'Linux', 'Git', 'SQL', 'Redis', 'Spring', 'Docker'];
  for (const s of subjects) {
    if (text.toLowerCase().includes(s.toLowerCase())) tags.push(s);
  }
  if (tags.length === 0) tags.push('综合');
  return tags;
}

/**
 * 根据题号模式将文本拆分为独立题目
 */
function splitQuestions(text: string): string[] {
  // 多种题号模式
  const patterns = [
    /(?=^\s*\d+[\.、)\s]\s*[^\d])/gm,           // 1. 1、 1) 1
    /(?=^\s*[一二三四五六七八九十]+[、.]?\s*[^\d])/gm,  // 一、二、
    /(?=^\s*第[一二三四五六七八九十\d]+题)/gm,          // 第一题
  ];

  for (const pattern of patterns) {
    const parts = text.split(pattern).filter(s => s.trim().length > 5);
    if (parts.length >= 2) return parts;
  }

  // 如果无法拆分，尝试按空行拆分
  const byBlank = text.split(/\n{2,}/).filter(s => s.trim().length > 10);
  if (byBlank.length >= 2) return byBlank;

  return [text];
}

/**
 * 解析单道题目的各个字段
 */
function parseQuestionBlock(block: string, index: number): ParsedQuestion {
  const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
  const fullText = lines.join('\n');

  // 提取题型行（第一行通常包含题型标识）
  const firstLine = lines[0] || '';
  const type = detectType(firstLine + fullText.slice(0, 200));

  // 提取标题：去掉题号和题型标识后的第一行
  let title = firstLine
    .replace(/^[\s]*[\d一二三四五六七八九十]+[\.、)\s]+/, '')
    .replace(/^第[\d一二三四五六七八九十]+题[\.、:\s]*/, '')
    .replace(/【(单选题|多选题|填空题|编程题|判断题)】/, '')
    .replace(/\((单选题|多选题|填空题|编程题|判断题)\)/, '')
    .trim();
  if (!title || title.length < 2) title = lines[1] || `题目 ${index + 1}`;

  // 提取选项
  const options: { label: string; value: string }[] = [];
  const optionRegex = /^([A-D])[\.、)\s]+(.+)/;
  for (const line of lines) {
    const m = line.match(optionRegex);
    if (m) options.push({ label: m[1], value: m[2].trim() });
  }

  // 提取答案
  let answer = '';
  const answerRegex = /(?:参考)?答案[：:]\s*(.+)/;
  for (const line of lines) {
    const m = line.match(answerRegex);
    if (m) { answer = m[1].trim(); break; }
  }
  if (!answer && options.length > 0) {
    // 尝试从选项后找答案标记
    for (const line of lines) {
      if (/^[A-D]$/.test(line.trim())) { answer = line.trim(); break; }
    }
  }

  // 提取解析
  let analysis = '';
  const analysisRegex = /(?:答案)?解析[：:]\s*(.+)/;
  const analysisStart = lines.findIndex(l => analysisRegex.test(l));
  if (analysisStart >= 0) {
    analysis = lines[analysisStart].replace(analysisRegex, '$1').trim();
    // 收集后续行直到下一个题号或结束
    for (let i = analysisStart + 1; i < lines.length; i++) {
      if (/^\s*\d+[\.、)]/.test(lines[i])) break;
      analysis += '\n' + lines[i];
    }
  }

  // 内容：标题后的描述文本（去除选项、答案、解析）
  const contentLines: string[] = [];
  let inContent = false;
  for (const line of lines) {
    if (line === title) { inContent = true; continue; }
    if (!inContent) continue;
    if (optionRegex.test(line)) continue;
    if (answerRegex.test(line)) break;
    if (line.includes('答案') && line.length < 10) break;
    contentLines.push(line);
  }
  const content = contentLines.join('\n').trim() || title;

  // 编程题特殊处理
  let language: string | undefined;
  let starterCode: string | undefined;
  if (type === 'PROGRAMMING') {
    if (fullText.toLowerCase().includes('python')) language = 'python';
    else if (fullText.toLowerCase().includes('java')) language = 'java';
    else language = 'javascript';

    const codeMatch = fullText.match(/```[\w]*\n([\s\S]*?)```/);
    if (codeMatch) starterCode = codeMatch[1].trim();
  }

  const difficulty = detectDifficulty(fullText.slice(0, 300));
  const tags = extractTags(fullText);

  return {
    type, title, content, options,
    answer: answer || '待填写',
    analysis: analysis || '暂无解析',
    difficulty, tags, language, starterCode,
  };
}

/**
 * 主解析函数：文本 → 结构化题目数组
 */
export function parseQuestionsFromText(text: string): { questions: ParsedQuestion[]; warnings: string[] } {
  const warnings: string[] = [];

  // 清理文本
  let cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\u00A0/g, ' ');

  // 移除页眉页脚等噪音
  cleaned = cleaned
    .replace(/第\s*\d+\s*页\s*共\s*\d+\s*页/gi, '')
    .replace(/^\s*[=\-*]{3,}\s*$/gm, '');

  const blocks = splitQuestions(cleaned);
  const questions = blocks.map((block, i) => parseQuestionBlock(block, i));

  // 验证和警告
  questions.forEach((q, i) => {
    if (!q.title || q.title.length < 2) warnings.push(`第 ${i + 1} 题标题可能不完整`);
    if (q.answer === '待填写') warnings.push(`第 ${i + 1} 题未找到答案`);
    if ((q.type === 'SINGLE_CHOICE' || q.type === 'MULTI_CHOICE') && q.options.length === 0)
      warnings.push(`第 ${i + 1} 题是选择题但未找到选项`);
  });

  return { questions, warnings };
}
