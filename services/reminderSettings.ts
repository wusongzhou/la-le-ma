import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@reminder_settings';

export interface ReminderSettings {
  enabled: boolean;
  smartMode: boolean;
  morningReminder: boolean;
  eveningReminder: boolean;
  customTimes: number[]; // 小时数组，如 [8, 12, 20]
}

const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: false,
  smartMode: true,
  morningReminder: true,
  eveningReminder: true,
  customTimes: [8, 20],
};

/**
 * 获取提醒设置
 */
export async function getReminderSettings(): Promise<ReminderSettings> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(json) };
    }
  } catch (error) {
    console.error('获取提醒设置失败:', error);
  }
  return DEFAULT_SETTINGS;
}

/**
 * 保存提醒设置
 */
export async function saveReminderSettings(settings: ReminderSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('保存提醒设置失败:', error);
  }
}

/**
 * 重置提醒设置
 */
export async function resetReminderSettings(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('重置提醒设置失败:', error);
  }
}

