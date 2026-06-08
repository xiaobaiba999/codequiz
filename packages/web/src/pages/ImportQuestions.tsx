import React, { useState } from 'react';
import {
  Card,
  Upload,
  Button,
  Space,
  Table,
  Tag,
  Alert,
  message,
  Tabs,
  Typography,
  Modal,
  Input,
  Select,
} from 'antd';
import { UploadOutlined, InboxOutlined, DownloadOutlined, FileWordOutlined, FileTextOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { questionApi } from '../api';

const { Dragger } = Upload;
const { Text } = Typography;

const typeLabels: Record<string, string> = {
  SINGLE_CHOICE: '单选题',
  MULTI_CHOICE: '多选题',
  FILL_BLANK: '填空题',
  PROGRAMMING: '编程题',
};

const difficultyColors: Record<string, string> = {
  EASY: 'green',
  MEDIUM: 'orange',
  HARD: 'red',
};

const EXAMPLE_JSON = [
  {
    type: 'SINGLE_CHOICE',
    title: 'JavaScript 中 typeof null 的结果是什么？',
    content: '请选择正确的答案。',
    options: [
      { label: 'A', value: '"null"' },
      { label: 'B', value: '"undefined"' },
      { label: 'C', value: '"object"' },
      { label: 'D', value: '"boolean"' },
    ],
    answer: 'C',
    analysis: 'typeof null 返回 "object"，这是 JavaScript 的历史遗留 bug。',
    difficulty: 'EASY',
    tags: ['JavaScript', '基础'],
  },
  {
    type: 'PROGRAMMING',
    title: '两数之和',
    content: '给定一个整数数组 nums 和一个目标值 target，请找出数组中和为目标值的两个整数的下标。',
    answer: '## 参考解法\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement), i];\n    map.set(nums[i], i);\n  }\n}',
    analysis: '使用哈希表将时间复杂度降为 O(n)。',
    difficulty: 'EASY',
    tags: ['算法', '数组'],
    language: 'javascript',
    starterCode: 'function twoSum(nums, target) {\n  // 在这里编写代码\n}',
    testCases: [
      { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]' },
      { input: '[3,2,4]\n6', expectedOutput: '[1,2]' },
    ],
  },
];

function validateQuestion(q: any, index: number): string | null {
  if (!q.type) return `第 ${index + 1} 题缺少 type 字段`;
  if (!['SINGLE_CHOICE', 'MULTI_CHOICE', 'FILL_BLANK', 'PROGRAMMING'].includes(q.type))
    return `第 ${index + 1} 题的 type 无效: ${q.type}`;
  if (!q.title) return `第 ${index + 1} 题缺少 title 字段`;
  if (!q.content) return `第 ${index + 1} 题缺少 content 字段`;
  if (!q.answer) return `第 ${index + 1} 题缺少 answer 字段`;
  if (!q.difficulty) return `第 ${index + 1} 题缺少 difficulty 字段`;
  if (!['EASY', 'MEDIUM', 'HARD'].includes(q.difficulty))
    return `第 ${index + 1} 题的 difficulty 无效: ${q.difficulty}`;
  if (!q.tags || !Array.isArray(q.tags) || q.tags.length === 0)
    return `第 ${index + 1} 题缺少 tags 字段（至少一个标签）`;
  // 选择题必须有 options
  if ((q.type === 'SINGLE_CHOICE' || q.type === 'MULTI_CHOICE') && (!q.options || q.options.length === 0))
    return `第 ${index + 1} 题是选择题但缺少 options`;
  // 编程题建议有 testCases
  if (q.type === 'PROGRAMMING' && (!q.testCases || q.testCases.length === 0))
    return `第 ${index + 1} 题是编程题但缺少 testCases`;
  return null;
}

const ImportQuestions: React.FC = () => {
  const [questions, setQuestions] = useState<any[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [pastedJson, setPastedJson] = useState('');
  const [docParsing, setDocParsing] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [editIndex, setEditIndex] = useState(-1);

  const parseAndValidate = (data: any[]) => {
    const errs: string[] = [];
    data.forEach((q, i) => {
      const err = validateQuestion(q, i);
      if (err) errs.push(err);
    });
    setErrors(errs);
    setQuestions(data);
    return errs.length === 0;
  };

  const handleFileUpload: UploadProps['beforeUpload'] = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const arr = Array.isArray(json) ? json : [json];
        parseAndValidate(arr);
      } catch {
        message.error('JSON 格式错误，请检查文件内容');
      }
    };
    reader.readAsText(file);
    return false; // 阻止自动上传
  };

  const handlePasteImport = () => {
    if (!pastedJson.trim()) {
      message.warning('请先粘贴 JSON 内容');
      return;
    }
    try {
      const json = JSON.parse(pastedJson);
      const arr = Array.isArray(json) ? json : [json];
      parseAndValidate(arr);
    } catch {
      message.error('JSON 格式错误，请检查内容');
    }
  };

  const handleDocUpload: UploadProps['beforeUpload'] = async (file) => {
    setDocParsing(true);
    setWarnings([]);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // 去掉 data:xxx;base64, 前缀
        };
        reader.readAsDataURL(file);
      });

      const res = await questionApi.importFile({
        fileBase64: base64,
        fileName: file.name,
      });

      if (res.data.success) {
        const parsed = res.data.data.questions;
        setQuestions(parsed);
        if (res.data.data.warnings) setWarnings(res.data.data.warnings);
        // 验证题目格式
        const errs: string[] = [];
        parsed.forEach((q: any, i: number) => {
          const err = validateQuestion(q, i);
          if (err) errs.push(err);
        });
        setErrors(errs);
        message.success(`智能识别 ${parsed.length} 道题目`);
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || '文档解析失败');
    } finally {
      setDocParsing(false);
    }
    return false;
  };

  const handleEditQuestion = (index: number) => {
    setEditIndex(index);
    setEditingQuestion({ ...questions![index] });
  };

  const handleSaveEdit = () => {
    if (editIndex < 0 || !questions) return;
    const updated = [...questions];
    updated[editIndex] = editingQuestion;
    setQuestions(updated);
    // 重新验证
    const errs: string[] = [];
    updated.forEach((q, i) => {
      const err = validateQuestion(q, i);
      if (err) errs.push(err);
    });
    setErrors(errs);
    setEditIndex(-1);
    setEditingQuestion(null);
  };

  const handleImport = async () => {
    if (!questions || errors.length > 0) return;
    setImporting(true);
    try {
      const res = await questionApi.batchImport({ questions });
      if (res.data.success) {
        message.success(`成功导入 ${questions.length} 道题目！`);
        setQuestions(null);
        setPastedJson('');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || '导入失败');
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([JSON.stringify(EXAMPLE_JSON, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'codequiz-template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { title: '#', dataIndex: 'idx', width: 40, render: (_: any, __: any, i: number) => i + 1 },
    {
      title: '标题', dataIndex: 'title', ellipsis: true,
      render: (t: string) => t?.length > 30 ? t.slice(0, 30) + '…' : t,
    },
    {
      title: '类型', dataIndex: 'type', width: 90,
      render: (t: string) => <Tag>{typeLabels[t] || t}</Tag>,
    },
    {
      title: '难度', dataIndex: 'difficulty', width: 70,
      render: (d: string) => <Tag color={difficultyColors[d]}>{d}</Tag>,
    },
    {
      title: '标签', dataIndex: 'tags', width: 200,
      render: (tags: string[]) => tags?.slice(0, 3).map((t: string) => <Tag key={t}>{t}</Tag>),
    },
  ];

  return (
    <div>
      <h2>导入题库</h2>

      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
            下载 JSON 模板
          </Button>
          <Text type="secondary">先下载模板查看格式，按模板填充题目后导入</Text>
        </Space>
      </Card>

      <Tabs
        items={[
          {
            key: 'doc',
            label: <span><FileWordOutlined /> Word/文档 导入</span>,
            children: (
              <div>
                <Alert
                  type="info"
                  message="智能解析"
                  description="支持 .docx 和 .txt 格式。系统会自动识别题号、题型、选项、答案和解析，无需手动整理格式。"
                  style={{ marginBottom: 16 }}
                />
                <Dragger
                  accept=".docx,.txt,.md"
                  maxCount={1}
                  beforeUpload={handleDocUpload}
                  showUploadList={false}
                  disabled={docParsing}
                >
                  <p className="ant-upload-drag-icon">
                    <FileTextOutlined style={{ fontSize: 48, color: '#1677ff' }} />
                  </p>
                  <p className="ant-upload-text">
                    {docParsing ? '正在智能解析中…' : '点击或拖拽 Word 文档到此区域'}
                  </p>
                  <p className="ant-upload-hint">
                    支持 .docx、.txt、.md 格式
                  </p>
                </Dragger>
              </div>
            ),
          },
          {
            key: 'json-upload',
            label: '📁 JSON 文件',
            children: (
              <Dragger
                accept=".json"
                maxCount={1}
                beforeUpload={handleFileUpload}
                showUploadList={false}
              >
                <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                <p className="ant-upload-text">点击或拖拽 JSON 文件到此区域</p>
                <p className="ant-upload-hint">支持单个文件上传，格式为题目数组</p>
              </Dragger>
            ),
          },
          {
            key: 'paste',
            label: '📋 粘贴 JSON',
            children: (
              <div>
                <TextArea
                  rows={12}
                  value={pastedJson}
                  onChange={(e) => setPastedJson(e.target.value)}
                  placeholder={`[\n  {\n    "type": "SINGLE_CHOICE",\n    "title": "...",\n    ...\n  }\n]`}
                />
                <Button
                  type="primary"
                  onClick={handlePasteImport}
                  style={{ marginTop: 12 }}
                >
                  解析 JSON
                </Button>
              </div>
            ),
          },
        ]}
      />

      {warnings.length > 0 && (
        <Alert
          type="warning"
          message={`${warnings.length} 个提示`}
          description={warnings.slice(0, 10).map((w, i) => <div key={i}>• {w}</div>)}
          style={{ marginTop: 16 }}
          closable
        />
      )}

      {errors.length > 0 && (
        <Alert
          type="error"
          message={`发现 ${errors.length} 个格式问题`}
          description={errors.slice(0, 10).map((e, i) => <div key={i}>• {e}</div>)}
          style={{ marginTop: 16 }}
        />
      )}

      {questions && questions.length > 0 && (
        <Card title={`题目预览 (${questions.length} 题) — 点击行可编辑`} style={{ marginTop: 16 }}>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <Table
              columns={[...columns, {
                title: '操作', width: 60,
                render: (_: any, __: any, i: number) => (
                  <Button size="small" onClick={() => handleEditQuestion(i)}>编辑</Button>
                ),
              }]}
              dataSource={questions}
              rowKey={(_, i) => String(i)}
              pagination={false}
              size="small"
              scroll={{ y: 400 }}
            />
          </div>
          <Button
            type="primary"
            size="large"
            onClick={handleImport}
            loading={importing}
            disabled={errors.length > 0}
            style={{ marginTop: 16 }}
          >
            确认导入 {questions.length} 道题目
          </Button>
        </Card>
      )}

      <Modal
        title={`编辑题目 #${editIndex + 1}`}
        open={editIndex >= 0}
        onOk={handleSaveEdit}
        onCancel={() => { setEditIndex(-1); setEditingQuestion(null); }}
        width={700}
        className="mobile-fullscreen-modal"
      >
        {editingQuestion && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <Text strong>题型</Text>
              <Select
                value={editingQuestion.type}
                onChange={(v) => setEditingQuestion({ ...editingQuestion, type: v })}
                style={{ width: '100%' }}
                options={[
                  { value: 'SINGLE_CHOICE', label: '单选题' },
                  { value: 'MULTI_CHOICE', label: '多选题' },
                  { value: 'FILL_BLANK', label: '填空题' },
                  { value: 'PROGRAMMING', label: '编程题' },
                ]}
              />
            </div>
            <div>
              <Text strong>标题</Text>
              <Input value={editingQuestion.title} onChange={(e) => setEditingQuestion({ ...editingQuestion, title: e.target.value })} />
            </div>
            <div>
              <Text strong>内容</Text>
              <TextArea rows={3} value={editingQuestion.content} onChange={(e) => setEditingQuestion({ ...editingQuestion, content: e.target.value })} />
            </div>
            <div>
              <Text strong>难度</Text>
              <Select
                value={editingQuestion.difficulty}
                onChange={(v) => setEditingQuestion({ ...editingQuestion, difficulty: v })}
                options={[
                  { value: 'EASY', label: '简单' },
                  { value: 'MEDIUM', label: '中等' },
                  { value: 'HARD', label: '困难' },
                ]}
              />
            </div>
            <div>
              <Text strong>标签（逗号分隔）</Text>
              <Input
                value={Array.isArray(editingQuestion.tags) ? editingQuestion.tags.join(', ') : editingQuestion.tags}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, tags: e.target.value.split(/[,，]/).map((t: string) => t.trim()).filter(Boolean) })}
              />
            </div>
            <div>
              <Text strong>答案</Text>
              <Input value={editingQuestion.answer} onChange={(e) => setEditingQuestion({ ...editingQuestion, answer: e.target.value })} />
            </div>
            <div>
              <Text strong>解析</Text>
              <TextArea rows={3} value={editingQuestion.analysis} onChange={(e) => setEditingQuestion({ ...editingQuestion, analysis: e.target.value })} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ImportQuestions;
