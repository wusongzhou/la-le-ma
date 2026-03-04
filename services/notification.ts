import { Platform, Alert } from 'react-native';

// 检查是否在 Expo Go 环境中
let isExpoGo = false;
try {
  const Constants = require('expo-constants').default;
  isExpoGo = Constants.executionEnvironment === 'storeClient';
} catch {
  isExpoGo = false;
}

// 条件导入 expo-notifications
let Notifications: typeof import('expo-notifications') | null = null;

if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
  } catch (e) {
    console.log('expo-notifications not available');
  }
}

// 仅在非 Expo Go 环境下配置通知行为
if (Notifications && !isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * 请求通知权限
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Notifications || isExpoGo) {
    Alert.alert(
      '开发构建需要',
      '通知功能需要在开发构建中使用。当前在 Expo Go 中无法使用通知功能。'
    );
    return false;
  }
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * 检查通知权限状态
 */
export async function checkNotificationPermissions(): Promise<boolean> {
  if (!Notifications || isExpoGo) return false;
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/**
 * 取消所有已安排的提醒
 */
export async function cancelAllReminders(): Promise<void> {
  if (!Notifications || isExpoGo) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * 安排单次提醒
 */
export async function scheduleReminder(
  title: string,
  body: string,
  date: Date,
  identifier?: string
): Promise<string | null> {
  if (!Notifications || isExpoGo) return null;

  const trigger: import('expo-notifications').NotificationTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: date,
  };

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
      badge: 0,
    },
    trigger,
    identifier,
  });

  return id;
}

/**
 * 安排每日重复提醒
 */
export async function scheduleDailyReminder(
  hour: number,
  minute: number = 0,
  title: string = '该去厕所啦 🚽',
  body: string = '根据你的习惯，现在是个不错的时间~'
): Promise<string | null> {
  if (!Notifications || isExpoGo) return null;

  const trigger: import('expo-notifications').NotificationTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour,
    minute,
  };

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
      badge: 0,
    },
    trigger,
  });

  return id;
}

/**
 * 根据用户习惯设置智能提醒
 */
export async function setupSmartReminders(): Promise<void> {
  if (!Notifications || isExpoGo) {
    console.log('Expo Go 中不支持本地通知，请使用开发构建');
    return;
  }

  // 先取消所有现有提醒
  await cancelAllReminders();

  const { getReminderSettings } = await import('./reminderSettings');
  const { hasRecordedToday } = await import('./habitAnalyzer');
  const settings = await getReminderSettings();

  if (!settings.enabled) {
    console.log('提醒功能已关闭');
    return;
  }

  // 检查今天是否已经记录过
  const recordedToday = await hasRecordedToday();
  if (recordedToday) {
    console.log('今天已经记录过了，不设置今天的提醒');
  }

  if (settings.smartMode) {
    // 智能模式：分析用户习惯
    const { analyzeUserHabits, suggestReminderTimes } = await import('./habitAnalyzer');
    const habits = await analyzeUserHabits();
    const suggestedTimes = suggestReminderTimes(habits);

    // 为每个建议时间设置提醒
    for (const timeStr of suggestedTimes) {
      const [hour, minute] = timeStr.split(':').map(Number);
      await scheduleDailyReminder(
        hour,
        minute,
        '该去厕所啦 🚽',
        `根据你的习惯，${hour}:${minute.toString().padStart(2, '0')} 是你常去的时间~`
      );
    }
  } else {
    // 手动模式：使用自定义时间
    for (const hour of settings.customTimes) {
      await scheduleDailyReminder(
        hour,
        0,
        '该去厕所啦 🚽',
        '记得记录哦~'
      );
    }
  }
}

/**
 * 获取所有已安排的提醒
 */
export async function getScheduledReminders(): Promise<import('expo-notifications').NotificationRequest[]> {
  if (!Notifications || isExpoGo) return [];
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * 取消特定提醒
 */
export async function cancelReminder(identifier: string): Promise<void> {
  if (!Notifications || isExpoGo) return;
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

/**
 * 发送即时通知（测试用）
 */
export async function sendTestNotification(): Promise<void> {
  if (!Notifications || isExpoGo) {
    Alert.alert(
      '开发构建需要',
      '测试通知功能需要在开发构建中使用。\n\n请运行以下命令创建开发构建：\nnpx expo run:ios\n或\nnpx expo run:android'
    );
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '测试通知 🚽',
      body: '提醒功能正常工作！',
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });
}

/**
 * 监听通知点击事件
 */
export function addNotificationResponseListener(
  callback: (response: import('expo-notifications').NotificationResponse) => void
): import('expo-notifications').Subscription | null {
  if (!Notifications || isExpoGo) return null;
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * 监听通知接收事件
 */
export function addNotificationReceivedListener(
  callback: (notification: import('expo-notifications').Notification) => void
): import('expo-notifications').Subscription | null {
  if (!Notifications || isExpoGo) return null;
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * 移除通知监听器
 */
export function removeNotificationListener(subscription: import('expo-notifications').Subscription | null): void {
  if (!subscription) return;
  subscription.remove();
}

/**
 * 检查是否在 Expo Go 中运行
 */
export function isRunningInExpoGo(): boolean {
  return isExpoGo;
}
