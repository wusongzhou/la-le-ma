import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  getReminderSettings,
  saveReminderSettings,
  ReminderSettings,
} from '@/services/reminderSettings';
import { analyzeUserHabits, suggestReminderTimes } from '@/services/habitAnalyzer';
import { setupSmartReminders, requestNotificationPermissions, isRunningInExpoGo } from '@/services/notification';
import { Typography, Colors } from '@/components/ui';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function ReminderSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<ReminderSettings>({
    enabled: false,
    smartMode: true,
    morningReminder: true,
    eveningReminder: true,
    customTimes: [],
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpoGo, setIsExpoGo] = useState(false);

  useEffect(() => {
    loadSettings();
    setIsExpoGo(isRunningInExpoGo());
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await getReminderSettings();
      setSettings(saved);

      // 分析用户习惯并给出建议
      const habits = await analyzeUserHabits();
      const times = suggestReminderTimes(habits);
      setSuggestions(times);
    } catch (error) {
      console.error('加载设置失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = useCallback(
    async <K extends keyof ReminderSettings>(key: K, value: ReminderSettings[K]) => {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await saveReminderSettings(newSettings);

      // 如果修改的是与提醒相关的设置，重新设置提醒
      if (key === 'enabled' || key === 'smartMode' || key === 'customTimes') {
        if (newSettings.enabled) {
          const granted = await requestNotificationPermissions();
          if (granted) {
            await setupSmartReminders();
          } else {
            Alert.alert('需要通知权限', '请在设置中开启通知权限以接收提醒');
          }
        } else if (key === 'enabled' && !value) {
          // 关闭提醒时取消所有提醒
          const { cancelAllReminders } = await import('@/services/notification');
          await cancelAllReminders();
        }
      }
    },
    [settings]
  );

  const toggleTimeSelection = (hour: number) => {
    const newTimes = settings.customTimes.includes(hour)
      ? settings.customTimes.filter((t) => t !== hour)
      : [...settings.customTimes, hour].sort((a, b) => a - b);
    updateSetting('customTimes', newTimes);
  };

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Typography variant="h1">提醒设置</Typography>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Expo Go 警告 */}
        {isExpoGo && (
          <View style={styles.expoGoWarning}>
            <Text style={styles.warningEmoji}>⚠️</Text>
            <Typography variant="caption" style={styles.warningText}>
              Expo Go 不支持本地通知功能。如需测试提醒，请使用开发构建：
              npx expo run:ios 或 npx expo run:android
            </Typography>
          </View>
        )}

        {/* 总开关 */}
        <View style={styles.section}>
          <View style={[styles.card, { backgroundColor: Colors.yellow }]}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={styles.emoji}>🔔</Text>
                <View>
                  <Typography variant="h3">智能提醒</Typography>
                  <Typography variant="caption">根据你的习惯自动提醒</Typography>
                </View>
              </View>
              <Switch
                value={settings.enabled}
                onValueChange={(value) => updateSetting('enabled', value)}
                trackColor={{ false: '#D1D1D1', true: Colors.mint }}
                thumbColor="#FFF"
              />
            </View>
          </View>
        </View>

        {settings.enabled && (
          <>
            {/* 智能模式开关 */}
            <View style={styles.section}>
              <View style={[styles.card, { backgroundColor: Colors.orange }]}>
                <View style={styles.row}>
                  <View style={styles.rowLeft}>
                    <Text style={styles.emoji}>🤖</Text>
                    <View>
                      <Typography variant="h3">自动分析模式</Typography>
                      <Typography variant="caption">根据历史记录智能推荐时间</Typography>
                    </View>
                  </View>
                  <Switch
                    value={settings.smartMode}
                    onValueChange={(value) => updateSetting('smartMode', value)}
                    trackColor={{ false: '#D1D1D1', true: Colors.mint }}
                    thumbColor="#FFF"
                  />
                </View>
              </View>
            </View>

            {/* 习惯分析建议 */}
            {settings.smartMode && suggestions.length > 0 && (
              <View style={styles.section}>
                <Typography variant="h3" style={styles.sectionTitle}>
                  基于你的习惯分析
                </Typography>
                <View style={styles.suggestionCard}>
                  <Text style={styles.suggestionEmoji}>📊</Text>
                  <Typography variant="body">
                    根据你过去30天的记录，你经常在以下时间段：
                  </Typography>
                  <View style={styles.suggestionTimes}>
                    {suggestions.map((time, index) => (
                      <View
                        key={time}
                        style={[
                          styles.suggestionBadge,
                          { backgroundColor: [Colors.yellow, Colors.orange, Colors.pink][index % 3] },
                        ]}
                      >
                        <Text style={styles.suggestionText}>{time}</Text>
                      </View>
                    ))}
                  </View>
                  <Typography variant="caption" style={styles.suggestionNote}>
                    系统会在这些时间前15分钟提醒你
                  </Typography>
                </View>
              </View>
            )}

            {/* 手动选择时间段 */}
            {!settings.smartMode && (
              <View style={styles.section}>
                <Typography variant="h3" style={styles.sectionTitle}>
                  自定义提醒时间
                </Typography>
                <View style={styles.timeGrid}>
                  {HOURS.map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      style={[
                        styles.timeButton,
                        settings.customTimes.includes(hour) && styles.timeButtonSelected,
                      ]}
                      onPress={() => toggleTimeSelection(hour)}
                    >
                      <Text
                        style={[
                          styles.timeButtonText,
                          settings.customTimes.includes(hour) && styles.timeButtonTextSelected,
                        ]}
                      >
                        {formatHour(hour)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* 提示说明 */}
            <View style={styles.tipsCard}>
              <Text style={styles.tipEmoji}>💡</Text>
              <Typography variant="caption" style={styles.tipText}>
                智能提醒会根据你的使用习惯自动调整。使用越久，提醒越准确。
              </Typography>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 3,
    borderColor: Colors.sketch.dark,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 32,
  },
  suggestionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 3,
    borderColor: Colors.sketch.dark,
  },
  suggestionEmoji: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 12,
  },
  suggestionTimes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
    marginBottom: 12,
  },
  suggestionBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.sketch.dark,
  },
  suggestionText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  suggestionNote: {
    textAlign: 'center',
    color: Colors.text.secondary,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeButton: {
    width: '22%',
    aspectRatio: 1.5,
    backgroundColor: '#FFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.sketch.light,
  },
  timeButtonSelected: {
    backgroundColor: Colors.mint,
    borderColor: Colors.sketch.dark,
  },
  timeButtonText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  timeButtonTextSelected: {
    color: Colors.text.primary,
  },
  tipsCard: {
    backgroundColor: Colors.mintLight,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  tipEmoji: {
    fontSize: 24,
  },
  tipText: {
    flex: 1,
    color: Colors.text.mint,
  },
  expoGoWarning: {
    backgroundColor: Colors.orange,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: Colors.sketch.dark,
  },
  warningEmoji: {
    fontSize: 24,
  },
  warningText: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: 13,
  },
});
