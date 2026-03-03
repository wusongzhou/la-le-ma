import { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, Modal } from 'react-native';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import { initDatabase, startRecord, endRecord, getActiveRecord } from '@/db';
import { useTimerStore } from '@/store';
import { Button, Typography, Colors, FontFamily } from '@/components/ui';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

// 防抖 Hook
function useDebounce(callback: () => void, delay: number, enabled: boolean) {
  const ref = useRef<boolean>(false);

  return useCallback(() => {
    if (!enabled || ref.current) return;
    ref.current = true;
    callback();
    setTimeout(() => {
      ref.current = false;
    }, delay);
  }, [callback, delay, enabled]);
}

export default function HomeScreen() {
  const [isReady, setIsReady] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { isRunning, currentRecord, startTime, startTimer, stopTimer } = useTimerStore();
  const [tick, setTick] = useState(0);
  const confettiRef = useRef<LottieView>(null);

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
  }, [startTimer]);

  useEffect(() => {
    if (!isRunning || !startTime) return;
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const elapsed = isRunning && startTime ? dayjs().diff(dayjs(startTime), 'second') + tick * 0 : 0;

  const formatTime = (seconds: number): string => {
    const d = dayjs.duration(seconds, 'seconds');
    const minutes = Math.floor(d.asMinutes());
    const secs = d.seconds();
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePressRaw = useCallback(async () => {
    if (!isReady) return;
    try {
      if (isRunning && currentRecord) {
        // 震动反馈
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await endRecord(currentRecord.id);
        stopTimer();
        // 显示礼花动画
        setShowConfetti(true);
      } else {
        // 震动反馈
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const id = await startRecord();
        const record = {
          id,
          start_time: dayjs().toISOString(),
          end_time: null,
          duration_seconds: null,
          created_at: dayjs().toISOString(),
        };
        startTimer(record);
      }
    } catch (error) {
      console.error(error);
    }
  }, [isReady, isRunning, currentRecord, startTimer, stopTimer]);

  // 防抖：1秒内不能重复点击
  const handlePress = useDebounce(handlePressRaw, 1000, isReady);

  const handleConfettiFinish = () => {
    setShowConfetti(false);
  };

  if (!isReady) {
    return (
      <View style={styles.container}>
        <Typography>加载中...</Typography>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Confetti Animation Modal */}
      <Modal visible={showConfetti} transparent animationType="none">
        <View style={styles.confettiContainer}>
          <LottieView
            ref={confettiRef}
            source={require('@/assets/animations/confetti.json')}
            autoPlay
            loop={false}
            onAnimationFinish={handleConfettiFinish}
            style={styles.confetti}
          />
        </View>
      </Modal>

      <View style={styles.content}>
        {/* Timer */}
        <Text style={styles.timer}>{formatTime(elapsed)}</Text>

        {/* Big Button */}
        <Button isRunning={isRunning} onPress={handlePress} size={200} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  timer: {
    fontSize: 64,
    fontWeight: '400',
    fontVariant: ['tabular-nums'],
    color: Colors.text.primary,
    letterSpacing: 4,
    fontFamily: FontFamily.mono,
    marginBottom: 48,
  },
  confettiContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  confetti: {
    width: 400,
    height: 400,
  },
});
