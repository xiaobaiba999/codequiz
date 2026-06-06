import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { questionApi, answerApi, favoriteApi, commentApi } from '../api';
import { useThemeStore } from '../store/theme';

const QuestionDetailScreen = ({ route, navigation }: any) => {
  const { id } = route.params;
  const [question, setQuestion] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isFav, setIsFav] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const { isDark } = useThemeStore();

  useEffect(() => { loadQuestion(); }, [id]);

  const loadQuestion = async () => {
    const res = await questionApi.get(id);
    if (res.data.success) {
      setQuestion(res.data.data);
      setIsFav(res.data.data.isFavorited);
    }
    const cRes = await commentApi.list(id);
    if (cRes.data.success) setComments(cRes.data.data.items);
  };

  const handleSubmit = async () => {
    if (!userAnswer.trim()) return Alert.alert('提示', '请先作答');
    const res = await answerApi.submit({ questionId: id, userAnswer, type: question.type, language: question.type === 'PROGRAMMING' ? question.language : undefined });
    if (res.data.success) setResult(res.data.data);
  };

  const toggleFav = async () => {
    if (isFav) await favoriteApi.remove(id); else await favoriteApi.add(id);
    setIsFav(!isFav);
  };

  if (!question) return <View style={styles.center}><Text>加载中...</Text></View>;

  const bg = isDark ? '#1a1a1a' : '#f5f5f5';
  const cardBg = isDark ? '#2a2a2a' : '#fff';
  const textColor = isDark ? '#fff' : '#000';

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.title, { color: textColor }]}>{question.title}</Text>
        <Text style={[styles.content, { color: textColor }]}>{question.content}</Text>

        {question.type === 'SINGLE_CHOICE' && question.options?.map((opt: any) => (
          <TouchableOpacity key={opt.label} style={[styles.option, userAnswer === opt.label && styles.selectedOption]} onPress={() => setUserAnswer(opt.label)}>
            <Text style={{ color: userAnswer === opt.label ? '#1677ff' : textColor }}>{opt.label}. {opt.value}</Text>
          </TouchableOpacity>
        ))}

        {question.type === 'MULTI_CHOICE' && question.options?.map((opt: any) => {
          const selected = userAnswer.includes(opt.label);
          return (
            <TouchableOpacity key={opt.label} style={[styles.option, selected && styles.selectedOption]} onPress={() => {
              const arr = userAnswer.split('').filter(c => c);
              const idx = arr.indexOf(opt.label);
              if (idx >= 0) arr.splice(idx, 1); else arr.push(opt.label);
              setUserAnswer(arr.sort().join(''));
            }}>
              <Text style={{ color: selected ? '#1677ff' : textColor }}>{opt.label}. {opt.value}</Text>
            </TouchableOpacity>
          );
        })}

        {(question.type === 'FILL_BLANK' || question.type === 'PROGRAMMING') && (
          <TextInput style={[styles.textInput, { backgroundColor: isDark ? '#333' : '#f9f9f9', color: textColor }]} multiline value={userAnswer} onChangeText={setUserAnswer} placeholder={question.type === 'PROGRAMMING' ? '输入代码' : '输入答案'} placeholderTextColor="#999" />
        )}

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>提交答案</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleFav} style={styles.favBtn}>
          <Text style={{ color: isFav ? '#ff4d4f' : '#999' }}>{isFav ? '已收藏' : '收藏'}</Text>
        </TouchableOpacity>
      </View>

      {result && (
        <View style={[styles.resultCard, { backgroundColor: cardBg }]}>
          <Text style={{ color: result.isCorrect ? '#52c41a' : '#ff4d4f', fontSize: 18, fontWeight: 'bold' }}>
            {result.isCorrect ? '回答正确！' : '回答错误'}
          </Text>
          <Text style={{ color: textColor, marginTop: 8 }}>正确答案：{result.correctAnswer}</Text>
          <Text style={{ color: textColor, marginTop: 4 }}>解析：{result.analysis}</Text>
        </View>
      )}

      {comments.length > 0 && (
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text style={[styles.title, { color: textColor }]}>讨论</Text>
          {comments.map((c: any) => (
            <View key={c.id} style={styles.comment}>
              <Text style={{ fontWeight: '500', color: textColor }}>{c.nickname}</Text>
              <Text style={{ color: '#666', marginTop: 2 }}>{c.content}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { margin: 12, padding: 16, borderRadius: 12, elevation: 2 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  content: { fontSize: 14, lineHeight: 22, marginBottom: 16 },
  option: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 8 },
  selectedOption: { borderColor: '#1677ff', backgroundColor: '#e6f4ff' },
  textInput: { minHeight: 100, borderRadius: 8, padding: 12, marginBottom: 12, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#1677ff', padding: 14, borderRadius: 8, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  favBtn: { marginTop: 12, alignItems: 'center', padding: 8 },
  resultCard: { margin: 12, padding: 16, borderRadius: 12, elevation: 2 },
  comment: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
});

export default QuestionDetailScreen;
