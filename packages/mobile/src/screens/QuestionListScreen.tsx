import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, TextInput } from 'react-native';
import { questionApi } from '../api';
import { useThemeStore } from '../store/theme';

const QuestionListScreen = ({ navigation }: any) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const { isDark } = useThemeStore();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await questionApi.list({ page: 1, pageSize: 50, keyword });
      if (res.data.success) setQuestions(res.data.data.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const difficultyColors: Record<string, string> = { EASY: '#52c41a', MEDIUM: '#fa8c16', HARD: '#ff4d4f' };
  const bg = isDark ? '#1a1a1a' : '#f5f5f5';
  const cardBg = isDark ? '#2a2a2a' : '#fff';
  const textColor = isDark ? '#fff' : '#000';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <TextInput
        style={[styles.search, { backgroundColor: cardBg, color: textColor }]}
        placeholder="搜索题目"
        value={keyword}
        onChangeText={setKeyword}
        onSubmitEditing={fetchData}
        placeholderTextColor="#999"
      />
      <FlatList
        data={questions}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={fetchData}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.item, { backgroundColor: cardBg }]} onPress={() => navigation.navigate('QuestionDetail', { id: item.id })}>
            <View style={styles.itemHeader}>
              <Text style={[styles.itemTitle, { color: textColor }]}>{item.title}</Text>
              <Text style={{ color: difficultyColors[item.difficulty], fontSize: 12 }}>{item.difficulty}</Text>
            </View>
            <Text style={styles.itemTags}>{item.tags?.join(' · ')}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: { height: 44, margin: 12, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  item: { padding: 16, marginHorizontal: 12, marginBottom: 8, borderRadius: 8, elevation: 1 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTitle: { fontSize: 15, fontWeight: '500', flex: 1 },
  itemTags: { fontSize: 12, color: '#888', marginTop: 4 },
});

export default QuestionListScreen;
