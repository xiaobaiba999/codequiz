import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { questionApi } from '../api';
import { useThemeStore } from '../store/theme';

const categories = ['全部', '操作系统', '数据结构', '前端基础', '计算机网络', '数据库'];

const PracticeScreen = ({ navigation }: any) => {
  const [mode, setMode] = useState<'sequential' | 'random'>('sequential');
  const [category, setCategory] = useState('全部');
  const { isDark } = useThemeStore();
  const bg = isDark ? '#1a1a1a' : '#f5f5f5';
  const cardBg = isDark ? '#2a2a2a' : '#fff';
  const textColor = isDark ? '#fff' : '#000';

  const startPractice = async () => {
    try {
      const params: any = { page: 1, pageSize: 100 };
      if (category !== '全部') params.tags = category;
      const res = await questionApi.list(params);
      if (res.data.success) {
        const items = res.data.data.items;
        if (items.length === 0) return Alert.alert('提示', '没有找到题目');
        if (mode === 'random') items.sort(() => Math.random() - 0.5);
        navigation.navigate('QuestionDetail', { id: items[0].id });
      }
    } catch { Alert.alert('错误', '加载失败'); }
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.title, { color: textColor }]}>刷题模式</Text>
      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>练习模式</Text>
        <View style={styles.row}>
          {(['sequential', 'random'] as const).map(m => (
            <TouchableOpacity key={m} style={[styles.modeBtn, mode === m && styles.modeBtnActive]} onPress={() => setMode(m)}>
              <Text style={{ color: mode === m ? '#fff' : textColor }}>{m === 'sequential' ? '顺序练习' : '随机练习'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>题目分类</Text>
        <View style={styles.row}>
          {categories.map(c => (
            <TouchableOpacity key={c} style={[styles.catBtn, category === c && styles.catBtnActive]} onPress={() => setCategory(c)}>
              <Text style={{ color: category === c ? '#1677ff' : textColor, fontSize: 12 }}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <TouchableOpacity style={styles.startBtn} onPress={startPractice}>
        <Text style={styles.startText}>开始练习</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  section: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  modeBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  modeBtnActive: { backgroundColor: '#1677ff', borderColor: '#1677ff' },
  catBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, borderColor: '#ddd' },
  catBtnActive: { borderColor: '#1677ff', backgroundColor: '#e6f4ff' },
  startBtn: { backgroundColor: '#1677ff', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  startText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default PracticeScreen;
