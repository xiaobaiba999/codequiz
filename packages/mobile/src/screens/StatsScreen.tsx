import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { VictoryChart, VictoryLine, VictoryBar, VictoryAxis, VictoryTheme } from 'victory-native';
import { statsApi } from '../api';
import { useThemeStore } from '../store/theme';

const StatsScreen = () => {
  const [stats, setStats] = useState<any>(null);
  const { isDark } = useThemeStore();
  const bg = isDark ? '#1a1a1a' : '#f5f5f5';
  const cardBg = isDark ? '#2a2a2a' : '#fff';
  const textColor = isDark ? '#fff' : '#000';

  useEffect(() => {
    statsApi.get({ period: 'week' }).then(res => {
      if (res.data.success) setStats(res.data.data);
    });
  }, []);

  if (!stats) return <View style={[styles.container, { backgroundColor: bg }]}><Text style={{ color: textColor }}>加载中...</Text></View>;

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.title, { color: textColor }]}>学习统计</Text>
      <View style={[styles.statsRow, { backgroundColor: cardBg }]}>
        <View style={styles.statItem}><Text style={styles.statValue}>{stats.totalAnswered}</Text><Text style={styles.statLabel}>总做题</Text></View>
        <View style={styles.statItem}><Text style={styles.statValue}>{stats.totalCorrect}</Text><Text style={styles.statLabel}>正确</Text></View>
        <View style={styles.statItem}><Text style={styles.statValue}>{stats.overallAccuracy}%</Text><Text style={styles.statLabel}>正确率</Text></View>
        <View style={styles.statItem}><Text style={styles.statValue}>{stats.streakDays}</Text><Text style={styles.statLabel}>连续天</Text></View>
      </View>

      <View style={[styles.chartCard, { backgroundColor: cardBg }]}>
        <Text style={[styles.chartTitle, { color: textColor }]}>正确率趋势</Text>
        <VictoryChart theme={isDark ? VictoryTheme.material : VictoryTheme.grayscale} height={250}>
          <VictoryAxis dependentAxis />
          <VictoryAxis />
          <VictoryLine data={stats.dailyStats.map((d: any) => ({ x: d.date.slice(5), y: d.accuracy }))} style={{ data: { stroke: '#1677ff' } }} />
        </VictoryChart>
      </View>

      <View style={[styles.chartCard, { backgroundColor: cardBg }]}>
        <Text style={[styles.chartTitle, { color: textColor }]}>分类掌握度</Text>
        <VictoryChart theme={isDark ? VictoryTheme.material : VictoryTheme.grayscale} height={250}>
          <VictoryAxis dependentAxis />
          <VictoryBar data={stats.categoryStats.map((c: any) => ({ x: c.tag, y: c.accuracy }))} style={{ data: { fill: '#1677ff' } }} />
        </VictoryChart>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  statsRow: { flexDirection: 'row', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#1677ff' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 4 },
  chartCard: { borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  chartTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
});

export default StatsScreen;
