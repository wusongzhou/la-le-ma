import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text } from 'react-native';
import { initDatabase, getOverallStats, getDailyStats } from '@/db';
import { Typography, Colors } from '@/components/ui';
import dayjs from 'dayjs';

export default function StatsScreen() {
  const [stats, setStats] = useState<{
    total_count: number;
    total_duration: number;
    avg_duration: number;
    longest_duration: number;
    shortest_duration: number;
  } | null>(null);

  const [dailyStats, setDailyStats] = useState<
    { date: string; count: number; total_duration: number; avg_duration: number }[]
  >([]);

  useEffect(() => {
    const init = async () => {
      await initDatabase();
      const overall = await getOverallStats();
      setStats(overall);
      const daily = await getDailyStats(7);
      setDailyStats(daily);
    };
    init();
  }, []);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const min = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${min}m`;
    }
    return `${min}分钟`;
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Typography variant="h1" style={styles.pageTitle}>统计</Typography>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: Colors.yellow }]}>
            <Text style={styles.statEmoji}>💩</Text>
            <Text style={styles.statValue}>{stats?.total_count || 0}</Text>
            <Typography variant="caption">总次数</Typography>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.orange }]}>
            <Text style={styles.statEmoji}>⏱️</Text>
            <Text style={styles.statValue}>{formatDuration(stats?.total_duration || 0)}</Text>
            <Typography variant="caption">总时长</Typography>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.pink }]}>
            <Text style={styles.statEmoji}>📊</Text>
            <Text style={styles.statValue}>{formatDuration(Math.round(stats?.avg_duration || 0))}</Text>
            <Typography variant="caption">平均时长</Typography>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.magenta }]}>
            <Text style={styles.statEmoji}>🏆</Text>
            <Text style={styles.statValue}>{formatDuration(stats?.longest_duration || 0)}</Text>
            <Typography variant="caption">最长时长</Typography>
          </View>
        </View>

        <Typography variant="h2" style={styles.sectionTitle}>最近7天</Typography>

        <View style={styles.dailyCard}>
          {dailyStats.map((item, index) => (
            <View key={index} style={styles.dailyItem}>
              <Typography variant="body">{dayjs(item.date).format('MM月DD日')}</Typography>
              <View style={styles.dailyRight}>
                <View style={[styles.countBadge, index % 2 === 1 && styles.countBadgeAlt]}>
                  <Text style={styles.dailyCount}>{item.count}次</Text>
                </View>
                <Typography variant="caption">{formatDuration(item.total_duration)}</Typography>
              </View>
            </View>
          ))}
          {dailyStats.length === 0 && (
            <View style={styles.empty}>
              <Typography variant="caption">暂无数据</Typography>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  pageTitle: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 28,
  },
  statCard: {
    width: '47%',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.sketch.dark,
  },
  statEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  dailyCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
  },
  dailyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.sketch.light,
  },
  dailyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countBadge: {
    backgroundColor: Colors.yellow,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  countBadgeAlt: {
    backgroundColor: Colors.orange,
  },
  dailyCount: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 24,
  },
});
