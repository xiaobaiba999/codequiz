import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { answerApi } from '../api';
import { useThemeStore } from '../store/theme';

const WrongBookScreen = ({ navigation }: any) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const { isDark } = useThemeStore();
  const bg = isDark ? '#1a1a1a' : '#f5f5f5';
  const cardBg = isDark ? '#2a2a2a' : '#fff';
  const textColor = isDark ? '#fff' : '#000';

  const fetchData = async () => {
    const res = await answerApi.getWrong();
    if (res.data.success) setQuestions(res.data.data.items);
  };

  useEffect(() => { fetchData(); }, []);

  const removeWrong = async (id: string) => {
    await answerApi.removeWrong(id);
    fetchData();
  };

  const clearAll = async () => {
    Alert.alert('确认', '清空所有错题？', [
      { text: '取消', style: 'cancel' },
      { text: '确定', onPress: async () => { await answerApi.clearWrong(); fetchData(); } },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>错题本</Text>
        <TouchableOpacity onPress={clearAll}><Text style={{ color: '#ff4d4f' }}>清空</Text></TouchableOpacity>
      </View>
      <FlatList data={questions} keyExtractor={item => item.id} renderItem={({ item }) => (
        <TouchableOpacity style={[styles.item, { backgroundColor: cardBg }]} onPress={() => navigation.navigate('QuestionDetail', { id: item.id })}>
          <Text style={{ color: textColor, fontWeight: '500' }}>{item.title}</Text>
          <View style={styles.row}>
            <Text style={{ color: '#888', fontSize: 12 }}>{item.type} · {item.difficulty}</Text>
            <TouchableOpacity onPress={() => removeWrong(item.id)}><Text style={{ color: '#ff4d4f', fontSize: 12 }}>移除</Text></TouchableOpacity>
          </View>
        </TouchableOpacity>
      )} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold' },
  item: { padding: 16, marginHorizontal: 12, marginBottom: 8, borderRadius: 8, elevation: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
});

export default WrongBookScreen;
