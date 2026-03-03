import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { initDatabase, startRecord, endRecord, getActiveRecord } from '@/db';
import { useTimerStore } from '@/store';
import { BigButton, GlassCard, Typography } from '@/components/ui';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

export default function HomeScreen() {
  const [isReady, setIsReady] = useState(false);
  const { isRunning, currentRecord, startTime, startTimer, stopTimer } = useTimerStore();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const init = async () => {
      await initDatabase();
      const active = await getActiveRecord();
      if (active) {
        startTimer(active);
      }
      setIsReady(true);
    };
    init();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isRunning && startTime) {
      interval = setInterval(() => {
        setElapsed(dayjs().diff(dayjs(startTime), 'second'));
      }, 1000);
    } else {
      setElapsed(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime]);

  const formatTime = (seconds: number): string => {
    const d = dayjs.duration(seconds, 'seconds');
    const minutes = Math.floor(d.asMinutes());
    const secs = d.seconds();
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePress = useCallback(async () => {
    if (!isReady) return;

    try {
      if (isRunning && currentRecord) {
        await endRecord(currentRecord.id);
        stopTimer();
        Alert.alert('完成', '记录已保存', [{ text: '好的' }]);
      } else {
        const id = await startRecord();
        const record = {
          id,
          start_time: dayjs().toISOString(),
          end_time: null,
          duration_seconds: null,
          note: null,
          created_at: dayjs().toISOString(),
        };
        startTimer(record);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('错误', '操作失败，请重试');
    }
  }, [isReady, isRunning, currentRecord, startTimer, stopTimer]);

  if (!isReady) {
    return (
      <View style={styles.container}>
        <Typography>加载中...</Typography>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 背景 */}
      <View style={styles.background}>
        <BlurView intensity={80} style={StyleSheet.absoluteFill} />
      </View>

      {/* 内容 */}
      <View style={styles.content}>
        <Typography variant="h1" style={styles.title}>拉了吗</Typography>

        {/* 计时器卡片 */}
        <GlassCard style={styles.timerCard}>
          <View style={styles.timerContainer}>
            <Text style={styles.timer}>{formatTime(elapsed)}</Text>
            <Typography variant="caption" style={styles.timerLabel}>
              {isRunning ? '正在进行中...' : '准备就绪'}
            </Typography>
          </View>
        </GlassCard>

        {/* 主按钮 */}
        <BigButton isRunning={isRunning} onPress={handlePress} size={180} />

        {/* 提示 */}
        <Typography variant="caption" style={styles.hint}>
          {isRunning ? '点击结束记录' : '点击开始计时'}
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f0f4ff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    marginBottom: 40,
  },
  timerCard: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 60,
  },
  timerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  timer: {
    fontSize: 64,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    color: '#1f2937',
  },
  timerLabel: {
    marginTop: 8,
  },
  hint: {
    marginTop: 40,
  },
});