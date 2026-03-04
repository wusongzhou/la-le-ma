import { Colors, FontFamily } from '@/components/ui';
import type { Achievement } from '@/db/types';
import LottieView from 'lottie-react-native';
import React, { useRef } from 'react';
import { Animated, Modal, StyleSheet, Text, View } from 'react-native';

interface AchievementUnlockModalProps {
  visible: boolean;
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementUnlockModal({ visible, achievement, onClose }: AchievementUnlockModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef<LottieView>(null);

  const handleShow = () => {
    if (visible && achievement) {
      // 确保初始值为0
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      
      // 播放动画
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 8,
            tension: 100,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(4500),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(({ finished }) => {
        if (finished) {
          onClose();
        }
      });
    }
  };

  if (!achievement) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onShow={handleShow}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
              backgroundColor: achievement.color || Colors.yellow,
            },
          ]}
        >
          {/* 装饰动画 */}
          <View style={styles.lottieContainer}>
            <LottieView
              ref={lottieRef}
              source={require('@/assets/animations/confetti.json')}
              autoPlay
              loop={false}
              style={styles.lottie}
            />
          </View>

          <Text style={styles.unlockedText}>🏆 解锁成就</Text>

          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{achievement.icon}</Text>
          </View>

          <Text style={styles.title}>{achievement.title}</Text>
          <Text style={styles.description}>{achievement.description}</Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 280,
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.sketch.dark,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 4, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 0,
      elevation: 8,
    },
  },
  lottieContainer: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    pointerEvents: 'none',
  },
  lottie: {
    width: 320,
    height: 320,
  },
  unlockedText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 16,
    fontFamily: FontFamily.regular,
    opacity: 0.8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: Colors.sketch.dark,
  },
  icon: {
    fontSize: 44,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 8,
    fontFamily: FontFamily.regular,
  },
  description: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    textAlign: 'center',
    fontFamily: FontFamily.regular,
  },
});
