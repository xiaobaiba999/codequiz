import React, { useState, useEffect, useRef } from 'react';
import { Card, InputNumber, Button, Radio, message, Progress, Space, Tag, Input } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { examApi } from '../api';

const Exam: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'setup' | 'taking' | 'result'>('setup');
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(30);
  const [examData, setExamData] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startExam = async () => {
    try {
      const res = await examApi.create({ questionCount, timeLimit });
      if (res.data.success) {
        const startRes = await examApi.start(res.data.data.id);
        if (startRes.data.success) {
          setExamData(startRes.data.data);
          setTimeLeft(timeLimit * 60);
          setMode('taking');
        }
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || '创建考试失败');
    }
  };

  useEffect(() => {
    if (mode === 'taking' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            submitExam();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [mode]);

  const submitExam = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const answerList = Object.entries(answers).map(([questionId, userAnswer]) => ({
        questionId,
        userAnswer,
      }));
      const res = await examApi.submit(examData.id, { answers: answerList });
      if (res.data.success) {
        setResult(res.data.data);
        setMode('result');
      }
    } catch (err: any) {
      message.error('提交考试失败');
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (mode === 'setup') {
    return (
      <div>
        <h2>模拟考试</h2>
        <Card style={{ maxWidth: 400 }} className="mobile-full-width">
          <div style={{ marginBottom: 16 }}>
            <h4>题目数量</h4>
            <InputNumber min={5} max={50} value={questionCount} onChange={(v) => setQuestionCount(v || 10)} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <h4>时间限制（分钟）</h4>
            <InputNumber min={10} max={180} value={timeLimit} onChange={(v) => setTimeLimit(v || 30)} />
          </div>
          <Button type="primary" size="large" onClick={startExam} block>开始考试</Button>
        </Card>
      </div>
    );
  }

  if (mode === 'taking' && examData) {
    const currentQ = examData.questions[currentIdx]?.question;
    if (!currentQ) return null;

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <span>第 {currentIdx + 1} / {examData.questionCount} 题</span>
          <Tag color="red" icon={<ClockCircleOutlined />}>{formatTime(timeLeft)}</Tag>
        </div>
        <Progress percent={((currentIdx + 1) / examData.questionCount) * 100} showInfo={false} />

        <Card title={currentQ.title} style={{ marginTop: 16 }} className="mobile-full-width">
          <div style={{ whiteSpace: 'pre-wrap', marginBottom: 16 }}>{currentQ.content}</div>
          {currentQ.type === 'SINGLE_CHOICE' && (
            <Radio.Group value={answers[currentQ.id]} onChange={(e: any) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}>
              <Space direction="vertical" className="mobile-btn-wrap">
                {currentQ.options?.map((opt: any) => (
                  <Radio key={opt.label} value={opt.label}>{opt.label}. {opt.value}</Radio>
                ))}
              </Space>
            </Radio.Group>
          )}
          {currentQ.type === 'MULTI_CHOICE' && (
            <Radio.Group value={answers[currentQ.id]} onChange={(e: any) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}>
              <Space direction="vertical" className="mobile-btn-wrap">
                {currentQ.options?.map((opt: any) => (
                  <Radio key={opt.label} value={opt.label}>{opt.label}. {opt.value}</Radio>
                ))}
              </Space>
            </Radio.Group>
          )}
          {(currentQ.type === 'FILL_BLANK' || currentQ.type === 'PROGRAMMING') && (
            <Input.TextArea
              rows={4}
              value={answers[currentQ.id] || ''}
              onChange={(e: any) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
              placeholder={currentQ.type === 'PROGRAMMING' ? '请输入代码' : '请输入答案'}
            />
          )}
        </Card>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
          <Button disabled={currentIdx === 0} onClick={() => setCurrentIdx(currentIdx - 1)}>上一题</Button>
          {currentIdx < examData.questionCount - 1 ? (
            <Button type="primary" onClick={() => setCurrentIdx(currentIdx + 1)}>下一题</Button>
          ) : (
            <Button type="primary" danger onClick={submitExam}>交卷</Button>
          )}
        </div>
      </div>
    );
  }

  if (mode === 'result' && result) {
    return (
      <div>
        <h2>考试结果</h2>
        <Card>
          <p>总题数：{result.totalQuestions}</p>
          <p>正确数：{result.correctCount}</p>
          <p>正确率：{result.accuracy}%</p>
          <p>用时：{Math.floor(result.timeSpent / 60)}分{result.timeSpent % 60}秒</p>
          <Progress type="circle" percent={result.accuracy} />
          <div style={{ marginTop: 16 }}>
            <Button onClick={() => { setMode('setup'); setResult(null); }}>再考一次</Button>
            <Button type="link" onClick={() => navigate('/questions')}>返回题库</Button>
          </div>
        </Card>
      </div>
    );
  }

  return null;
};

export default Exam;
