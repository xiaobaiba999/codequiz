import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { examApi } from '../api';
import { useThemeStore } from '../store/theme';

const ExamScreen = () => {
  const [mode, setMode] = useState<'setup' | 'taking' | 'result'>('setup');
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(30);
  const [examData, setExamData] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState<any>(null);
  const timerRef = useRef<any>();
  const { isDark } = useThemeStore();
  const bg = isDark ? '#1a1a1a' : '#f5f5f5';
  const cardBg = isDark ? '#2a2a2a' : '#fff';
  const textColor = isDark ? '#fff' : '#000';

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
    } catch (err: any) { Alert.alert('错误', err.response?.data?.message || '创建考试失败'); }
  };

  useEffect(() => {
    if (mode === 'taking' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); submitExam(); return 0; } return t - 1; });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [mode]);

  const submitExam = async () => {
    clearInterval(timerRef.current);
    try {
      const answerList = Object.entries(answers).map(([questionId, userAnswer]) => ({ questionId, userAnswer }));
      const res = await examApi.submit(examData.id, { answers: answerList });
      if (res.data.success) { setResult(res.data.data); setMode('result'); }
    } catch { Alert.alert('错误', '提交失败'); }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  if (mode === 'setup') {
    return (
      <View style={[styles.container, { backgroundColor: bg }]}>
        <Text style={[styles.title, { color: textColor }]}>模拟考试</Text>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text style={{ color: textColor, marginBottom: 8 }}>题目数量</Text>
          <TextInput style={[styles.input, { color: textColor }]} keyboardType="numeric" value={String(questionCount)} onChangeText={v => setQuestionCount(parseInt(v) || 10)} />
          <Text style={{ color: textColor, marginBottom: 8, marginTop: 16 }}>时间限制（分钟）</Text>
          <TextInput style={[styles.input, { color: textColor }]} keyboardType="numeric" value={String(timeLimit)} onChangeText={v => setTimeLimit(parseInt(v) || 30)} />
          <TouchableOpacity style={styles.startBtn} onPress={startExam}><Text style={styles.startText}>开始考试</Text></TouchableOpacity>
        </View>
      </View>
    );
  }

  if (mode === 'taking' && examData) {
    const q = examData.questions[currentIdx]?.question;
    if (!q) return null;
    return (
      <ScrollView style={[styles.container, { backgroundColor: bg }]}>
        <View style={styles.timerRow}>
          <Text style={{ color: textColor }}>第 {currentIdx + 1}/{examData.questionCount} 题</Text>
          <Text style={{ color: '#ff4d4f' }}>{formatTime(timeLeft)}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text style={[styles.qTitle, { color: textColor }]}>{q.title}</Text>
          <Text style={{ color: textColor, marginBottom: 16 }}>{q.content}</Text>
          {q.type === 'SINGLE_CHOICE' && q.options?.map((opt: any) => (
            <TouchableOpacity key={opt.label} style={[styles.option, answers[q.id] === opt.label && styles.selectedOption]} onPress={() => setAnswers({ ...answers, [q.id]: opt.label })}>
              <Text style={{ color: answers[q.id] === opt.label ? '#1677ff' : textColor }}>{opt.label}. {opt.value}</Text>
            </TouchableOpacity>
          ))}
          {(q.type === 'FILL_BLANK' || q.type === 'PROGRAMMING') && (
            <TextInput style={[styles.textInput, { color: textColor }]} multiline value={answers[q.id] || ''} onChangeText={v => setAnswers({ ...answers, [q.id]: v })} placeholder="输入答案" placeholderTextColor="#999" />
          )}
        </View>
        <View style={styles.navRow}>
          <TouchableOpacity disabled={currentIdx === 0} onPress={() => setCurrentIdx(currentIdx - 1)} style={styles.navBtn}><Text>上一题</Text></TouchableOpacity>
          {currentIdx < examData.questionCount - 1 ? (
            <TouchableOpacity onPress={() => setCurrentIdx(currentIdx + 1)} style={[styles.navBtn, { backgroundColor: '#1677ff' }]}><Text style={{ color: '#fff' }}>下一题</Text></TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={submitExam} style={[styles.navBtn, { backgroundColor: '#ff4d4f' }]}><Text style={{ color: '#fff' }}>交卷</Text></TouchableOpacity>
          )}
        </View>
      </ScrollView>
    );
  }

  if (mode === 'result' && result) {
    return (
      <View style={[styles.container, { backgroundColor: bg, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.title, { color: textColor }]}>考试结果</Text>
        <View style={[styles.card, { backgroundColor: cardBg, alignItems: 'center' }]}>
          <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#1677ff' }}>{result.accuracy}%</Text>
          <Text style={{ color: textColor, marginTop: 8 }}>正确 {result.correctCount}/{result.totalQuestions}</Text>
          <Text style={{ color: textColor, marginTop: 4 }}>用时 {Math.floor(result.timeSpent / 60)}分{result.timeSpent % 60}秒</Text>
          <TouchableOpacity style={[styles.startBtn, { marginTop: 24 }]} onPress={() => { setMode('setup'); setResult(null); }}><Text style={styles.startText}>再考一次</Text></TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { padding: 16, borderRadius: 12, elevation: 2 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 8 },
  startBtn: { backgroundColor: '#1677ff', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  startText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  timerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  qTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  option: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 8 },
  selectedOption: { borderColor: '#1677ff', backgroundColor: '#e6f4ff' },
  textInput: { minHeight: 80, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, textAlignVertical: 'top' },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  navBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
});

export default ExamScreen;
