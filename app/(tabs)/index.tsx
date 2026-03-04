import { AchievementUnlockModal } from '@/components/AchievementUnlockModal';
import { Mascot } from '@/components/Mascot';
import { Button, Colors, FontFamily, Typography } from '@/components/ui';
import { Achievement, Streak, endRecord, getActiveRecord, getAllRecords, getStreak, initDatabase, startRecord, updateStreak } from '@/db';
import { checkAchievements, initAchievements } from '@/services/achievements';
import { useTimerStore } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const [streak, setStreak] = useState<Streak | null>(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [mascotMood, setMascotMood] = useState<'idle' | 'happy' | 'excited' | 'sleepy' | 'encouraging'>('idle');
  const [mascotMessage, setMascotMessage] = useState<string>('');
  const { isRunning, currentRecord, startTime, startTimer, stopTimer } = useTimerStore();
  const [tick, setTick] = useState(0);
  const confettiRef = useRef<LottieView>(null);


  // 确定吉祥物情绪
  const determineMascotMood = useCallback((): typeof mascotMood => {
    const hour = dayjs().hour();
    if (hour >= 23 || hour < 5) return 'sleepy';
    if (streak && streak.current_streak >= 3) return 'happy';
    return 'idle';
  }, [streak]);

  // 初始化数据库和连胜
  useEffect(() => {
    const init = async () => {
      await initDatabase();
      await initAchievements(); // 初始化成就系统
      const active = await getActiveRecord();
      if (active) {
        startTimer(active);
      }
      // 加载连胜数据
      const streakData = await getStreak();
      setStreak(streakData);
      // 设置吉祥物情绪
      setMascotMood(determineMascotMood());
      setIsReady(true);
    };
    init();
  }, [startTimer, determineMascotMood]);

  // 刷新连胜数据
  const refreshStreak = async () => {
    const streakData = await getStreak();
    setStreak(streakData);
  };

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

        // 计算时长（分钟）
        const durationSeconds = dayjs().diff(dayjs(currentRecord.start_time), 'second');
        const durationMinutes = Math.floor(durationSeconds / 60);

        // 更新连胜
        const streakResult = await updateStreak();
        await refreshStreak();

        // 检查成就
        const allRecords = await getAllRecords(1000);
        const achievementResult = await checkAchievements(durationSeconds, allRecords.length);
        if (achievementResult.newAchievements.length > 0) {
          // 显示第一个新解锁的成就
          setUnlockedAchievement(achievementResult.newAchievements[0]);
          setShowAchievementModal(true);
        }

        // 更新吉祥物状态为兴奋
        if (streakResult.newStreak >= 3) {
          setMascotMood('excited');
          setMascotMessage(`🔥 连胜 ${streakResult.newStreak} 天！太厉害了！`);
        } else {
          setMascotMood('happy');
          setMascotMessage('完成！你真棒！👏');
        }

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
      {/* Confetti Animation */}
      {showConfetti && (
        <View style={styles.confettiContainer} pointerEvents="none">
          <LottieView
            ref={confettiRef}
            source={require('@/assets/animations/confetti.json')}
            autoPlay
            loop={false}
            onAnimationFinish={handleConfettiFinish}
            style={styles.confetti}
          />
        </View>
      )}

      <AchievementUnlockModal
        visible={showAchievementModal}
        achievement={unlockedAchievement}
        onClose={() => {
          setShowAchievementModal(false);
          setUnlockedAchievement(null);
        }}
      />

      <View style={styles.content}>
        {/* Top Header Section */}
        <View style={styles.header}>
          {/* Streak Display */}
          <View style={styles.streakContainer}>
            <View style={[styles.streakBadge, { backgroundColor: Colors.orange }]}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakText}>{streak?.current_streak || 0}</Text>
            </View>
            {(streak?.current_streak || 0) >= 3 && (
              <Text style={styles.streakLabel}>连胜中！</Text>
            )}
          </View>

          {/* Settings Button */}
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('/reminder-settings')}
          >
            <Ionicons name="notifications-outline" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.mascotArea}>
          {/* Mascot */}
          <Mascot
            mood={mascotMood}
            message={mascotMessage}
            streak={streak?.current_streak || 0}
            onPress={() => {
              // 点击吉祥物切换随机消息
              const messages = ['嘿嘿~', '点我干嘛？', '加油哦！', '💩', '你最棒了！'];
              setMascotMessage(messages[Math.floor(Math.random() * messages.length)]);
            }}
          />
        </View>

        <View style={styles.timerArea}>
          {/* Timer */}
          <Text style={styles.timer}>{formatTime(elapsed)}</Text>
        </View>

        {/* Big Button */}
        <View style={styles.buttonArea}>
          <Button isRunning={isRunning} onPress={handlePress} size={180} />
        </View>
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
    paddingHorizontal: 24,
    paddingTop: 120,
    paddingBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: Colors.sketch.dark,
    gap: 4,
  },
  streakEmoji: {
    fontSize: 20,
  },
  streakText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text.primary,
    fontFamily: FontFamily.regular,
  },
  streakLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.secondary,
    fontFamily: FontFamily.regular,
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.yellow,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.sketch.dark,
  },
  mascotArea: {
    position: 'absolute',
    left: 24,
    top: 130, // below header
    zIndex: 10,
    alignItems: 'flex-start',
  },
  timerArea: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonArea: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  timer: {
    fontSize: 64,
    fontWeight: '400',
    fontVariant: ['tabular-nums'],
    color: Colors.text.primary,
    letterSpacing: 4,
    fontFamily: FontFamily.mono,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    elevation: 999,
  },
  confetti: {
    width: 400,
    height: 400,
  },

});
