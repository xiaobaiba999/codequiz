import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useThemeStore } from '../store/theme';

const HomeScreen = ({ navigation }: any) => {
  const { isDark } = useThemeStore();
  const bg = isDark ? '#1a1a1a' : '#f5f5f5';
  const cardBg = isDark ? '#2a2a2a' : '#fff';
  const textColor = isDark ? '#fff' : '#000';

  const features = [
    { title: '顺序练习', desc: '按分类顺序刷题', screen: 'Practice' },
    { title: '随机练习', desc: '随机抽取题目', screen: 'Practice' },
    { title: '模拟考试', desc: '限时考试模式', screen: 'Exam' },
    { title: '错题本', desc: '回顾答错的题', screen: 'WrongBook' },
    { title: '收藏夹', desc: '查看收藏的题', screen: 'Favorites' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.greeting, { color: textColor }]}>欢迎回来！</Text>

      <View style={styles.grid}>
        {features.map((f, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.card, { backgroundColor: cardBg }]}
            onPress={() => navigation.navigate(f.screen)}
          >
            <Text style={[styles.cardTitle, { color: textColor }]}>{f.title}</Text>
            <Text style={styles.cardDesc}>{f.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  greeting: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: '#888' },
});

export default HomeScreen;
