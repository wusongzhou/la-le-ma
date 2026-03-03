import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { initDatabase, getOverallStats, getDailyStats } from '@/db';
import { GlassCard, Typography, Colors } from '@/components/ui';
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
      <BlurView intensity={80} style={StyleSheet.absoluteFill} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Typography variant="h2" style={styles.sectionTitle}>
          总体统计
        </Typography>

        {/* 统计卡片网格 */}
        <View style={styles.statsGrid}>
          <StatCard emoji="💩" value={stats?.total_count || 0} label="总次数" suffix="次" />
          <StatCard emoji="⏱️" value={formatDuration(stats?.total_duration || 0)} label="总时长" />
          <StatCard
            emoji="📊"
            value={formatDuration(Math.round(stats?.avg_duration || 0))}
            label="平均时长"
          />
          <StatCard
            emoji="🏆"
            value={formatDuration(stats?.longest_duration || 0)}
            label="最长时长"
          />
        </View>

        <Typography variant="h2" style={styles.sectionTitle}>
          最近7天
        </Typography>

        {/* 每日统计 */}
        <GlassCard style={styles.dailyCard}>
          {dailyStats.map((item, index) => (
            <View key={index} style={styles.dailyItem}>
              <Typography variant="body">{dayjs(item.date).format('MM月DD日')}</Typography>
              <View style={styles.dailyRight}>
                <Text style={styles.dailyCount}>{item.count}次</Text>
                <Typography variant="caption">{formatDuration(item.total_duration)}</Typography>
              </View>
            </View>
          ))}
          {dailyStats.length === 0 && (
            <View style={styles.empty}>
              <Typography variant="caption">暂无数据</Typography>
            </View>
          )}
        </GlassCard>
      </ScrollView>
    </View>
  );
}

// 统计卡片组件
function StatCard({
  emoji,
  value,
  label,
  suffix = '',
}: {
  emoji: string;
  value: string | number;
  label: string;
  suffix?: string;
}) {
  return (
    <View style={styles.statCard}>
      <BlurView intensity={20} tint="light" style={styles.statBlur}>
        <View style={styles.statContent}>
          <Text style={styles.statEmoji}>{emoji}</Text>
          <Text style={styles.statValue}>
            {value}
            {suffix}
          </Text>
          <Typography variant="caption">{label}</Typography>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4ff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  sectionTitle: {
    marginBottom: 16,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statBlur: {
    flex: 1,
  },
  statContent: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  statEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  dailyCard: {
    marginTop: 8,
  },
  dailyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  dailyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dailyCount: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.success,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 20,
  },
});
