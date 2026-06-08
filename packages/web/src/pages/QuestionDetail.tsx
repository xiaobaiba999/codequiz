import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Radio, Checkbox, Input, Button, Tag, message, Divider, Space, Modal, List } from 'antd';
import { HeartOutlined, HeartFilled, BookOutlined, SendOutlined } from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { questionApi, answerApi, favoriteApi, noteApi, commentApi } from '../api';
import { useThemeStore } from '../store/theme';

const QuestionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mode } = useThemeStore();
  const isDark = mode === 'dark' || mode === 'eyecare';
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [noteVisible, setNoteVisible] = useState(false);

  useEffect(() => {
    if (id) loadQuestion();
  }, [id]);

  const loadQuestion = async () => {
    setLoading(true);
    try {
      const res = await questionApi.get(id!);
      if (res.data.success) {
        const q = res.data.data;
        setQuestion(q);
        setIsFavorited(q.isFavorited);
        setNoteContent(q.note || '');
      }
      // 加载评论
      const commentRes = await commentApi.list(id!);
      if (commentRes.data.success) {
        setComments(commentRes.data.data.items);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!userAnswer.trim()) {
      message.warning('请先作答');
      return;
    }
    setSubmitting(true);
    try {
      const res = await answerApi.submit({
        questionId: id!,
        userAnswer,
        type: question.type,
        language: question.type === 'PROGRAMMING' ? question.language : undefined,
      });
      if (res.data.success) {
        setResult(res.data.data);
        message.success(res.data.data.isCorrect ? '回答正确！' : '回答错误');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorited) {
        await favoriteApi.remove(id!);
        setIsFavorited(false);
        message.success('已取消收藏');
      } else {
        await favoriteApi.add(id!);
        setIsFavorited(true);
        message.success('已收藏');
      }
    } catch (err: any) {
      message.error('操作失败');
    }
  };

  const saveNote = async () => {
    try {
      if (noteContent) {
        await noteApi.create({ questionId: id!, content: noteContent });
        message.success('笔记已保存');
      }
      setNoteVisible(false);
    } catch (err: any) {
      message.error('保存失败');
    }
  };

  if (loading) return <Card loading />;
  if (!question) return <div>题目不存在</div>;

  const difficultyColors: Record<string, string> = { EASY: 'green', MEDIUM: 'orange', HARD: 'red' };
  const typeLabels: Record<string, string> = { SINGLE_CHOICE: '单选题', MULTI_CHOICE: '多选题', FILL_BLANK: '填空题', PROGRAMMING: '编程题' };

  return (
    <div>
      <Card
        title={
          <Space>
            <Tag color={difficultyColors[question.difficulty]}>{question.difficulty}</Tag>
            <Tag>{typeLabels[question.type]}</Tag>
            {question.tags?.map((t: string) => <Tag key={t}>{t}</Tag>)}
            <span>{question.title}</span>
          </Space>
        }
        extra={
          <Space className="mobile-btn-wrap">
            <Button icon={isFavorited ? <HeartFilled /> : <HeartOutlined />} onClick={toggleFavorite} type={isFavorited ? 'primary' : 'default'}>
              {isFavorited ? '已收藏' : '收藏'}
            </Button>
            <Button icon={<BookOutlined />} onClick={() => setNoteVisible(true)}>笔记</Button>
          </Space>
        }
      >
        <div style={{ whiteSpace: 'pre-wrap', marginBottom: 24 }}>{question.content}</div>

        {/* 答题区域 */}
        {question.type === 'SINGLE_CHOICE' && (
          <Radio.Group onChange={(e) => setUserAnswer(e.target.value)} value={userAnswer}>
            <Space direction="vertical">
              {question.options?.map((opt: any) => (
                <Radio key={opt.label} value={opt.label}>
                  {opt.label}. {opt.value}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        )}

        {question.type === 'MULTI_CHOICE' && (
          <Checkbox.Group onChange={(values) => setUserAnswer((values as string[]).sort().join(''))}>
            <Space direction="vertical">
              {question.options?.map((opt: any) => (
                <Checkbox key={opt.label} value={opt.label}>
                  {opt.label}. {opt.value}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        )}

        {question.type === 'FILL_BLANK' && (
          <Input
            placeholder="请输入答案"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            style={{ width: '100%', maxWidth: 400 }}
          />
        )}

        {question.type === 'PROGRAMMING' && (
          <div style={{ border: '1px solid #d9d9d9', borderRadius: 4, overflow: 'hidden' }}>
            <Editor
              height="300px"
              className="mobile-editor-short"
              language={question.language === 'python' ? 'python' : 'javascript'}
              theme={isDark ? 'vs-dark' : 'light'}
              value={userAnswer || question.starterCode || ''}
              onChange={(value) => setUserAnswer(value || '')}
              options={{ minimap: { enabled: false }, fontSize: 14 }}
            />
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <Button type="primary" icon={<SendOutlined />} onClick={handleSubmit} loading={submitting} disabled={!!result}>
            提交答案
          </Button>
        </div>

        {/* 判题结果 */}
        {result && (
          <div style={{ marginTop: 24, padding: 16, background: isDark ? '#1a1a1a' : '#f6f8fa', borderRadius: 8 }}>
            <h3 style={{ color: result.isCorrect ? '#52c41a' : '#ff4d4f' }}>
              {result.isCorrect ? '回答正确！' : '回答错误'}
            </h3>
            <p><strong>正确答案：</strong>{result.correctAnswer}</p>
            <p><strong>解析：</strong>{result.analysis}</p>
            {result.executionOutput && (
              <div>
                <strong>执行输出：</strong>
                <pre style={{ background: isDark ? '#000' : '#f0f0f0', padding: 8, borderRadius: 4, overflow: 'auto' }}>
                  {result.executionOutput}
                </pre>
              </div>
            )}
            {result.executionError && (
              <p style={{ color: '#ff4d4f' }}><strong>错误：</strong>{result.executionError}</p>
            )}
          </div>
        )}
      </Card>

      {/* 讨论区 */}
      <Card title="讨论" style={{ marginTop: 16 }} size="small" className="mobile-discussion">
        <List
          dataSource={comments}
          renderItem={(item: any) => (
            <List.Item>
              <List.Item.Meta
                title={`${item.nickname} · ${new Date(item.createdAt).toLocaleDateString()}`}
                description={item.content}
              />
            </List.Item>
          )}
          locale={{ emptyText: '暂无评论' }}
        />
      </Card>

      {/* 笔记弹窗 */}
      <Modal title="我的笔记" open={noteVisible} onOk={saveNote} onCancel={() => setNoteVisible(false)}>
        <Input.TextArea rows={6} value={noteContent} onChange={(e) => setNoteContent(e.target.value)} placeholder="写下你的笔记..." />
      </Modal>
    </div>
  );
};

export default QuestionDetail;
