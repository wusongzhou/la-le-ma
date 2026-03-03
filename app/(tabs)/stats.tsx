import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';
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

  // 当前查看的月份，默认为当月
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  // 计算月初和月末
  const startOfMonth = currentMonth.startOf('month').format('YYYY-MM-DD');
  const endOfMonth = currentMonth.endOf('month').format('YYYY-MM-DD');

  const loadStats = async () => {
    const overall = await getOverallStats(startOfMonth, endOfMonth);
    setStats(overall);
    const days = currentMonth.endOf('month').date();
    const daily = await getDailyStats(days, startOfMonth);
    setDailyStats(daily);
  };

  useEffect(() => {
    const init = async () => {
      await initDatabase();
      await loadStats();
    };
    init();
  }, [currentMonth]);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const min = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${min}m`;
    }
    return `${min}分钟`;
  };

  // 切换到上一个月
  const goToPrevMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, 'month'));
  };

  // 切换到下一个月
  const goToNextMonth = () => {
    const nextMonth = currentMonth.add(1, 'month');
    if (nextMonth.isAfter(dayjs())) return;
    setCurrentMonth(nextMonth);
  };

  // 是否可以切换到下一个月
  const canGoNext = currentMonth.add(1, 'month').isBefore(dayjs().add(1, 'month'));

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* 月份切换 */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={goToPrevMonth} style={styles.monthButton}>
            <Text style={styles.monthButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>{currentMonth.format('YYYY年MM月')}</Text>
          <TouchableOpacity
            onPress={goToNextMonth}
            style={[styles.monthButton, !canGoNext && styles.monthButtonDisabled]}
            disabled={!canGoNext}
          >
            <Text style={[styles.monthButtonText, !canGoNext && styles.monthButtonTextDisabled]}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: Colors.yellow }]}>
            <Text style={styles.statEmoji}>💩</Text>
            <Text style={styles.statValue}>{stats?.total_count || 0}</Text>
            <Typography variant="caption">本月次数</Typography>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.orange }]}>
            <Text style={styles.statEmoji}>⏱️</Text>
            <Text style={styles.statValue}>{formatDuration(stats?.total_duration || 0)}</Text>
            <Typography variant="caption">本月时长</Typography>
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

        <Typography variant="h2" style={styles.sectionTitle}>{currentMonth.format('MM月')}</Typography>

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
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  monthButton: {
    padding: 10,
  },
  monthButtonDisabled: {
    opacity: 0.3,
  },
  monthButtonText: {
    fontSize: 32,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  monthButtonTextDisabled: {
    color: Colors.sketch.light,
  },
  monthText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginHorizontal: 20,
    minWidth: 140,
    textAlign: 'center',
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
