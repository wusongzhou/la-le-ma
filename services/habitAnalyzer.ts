import { getAllRecords } from '@/db';
import dayjs from 'dayjs';

export interface HabitPattern {
  hour: number;
  count: number;
  percentage: number;
}

export interface UserHabits {
  patterns: HabitPattern[];
  totalRecords: number;
  avgInterval: number; // 平均间隔天数
  mostActiveDay: number; // 0-6, 周几最活跃
}

/**
 * 分析用户的使用习惯
 */
export async function analyzeUserHabits(days: number = 30): Promise<UserHabits> {
  const records = await getAllRecords(200);
  const cutoffDate = dayjs().subtract(days, 'day');

  // 过滤最近 N 天的记录
  const recentRecords = records.filter((r) =>
    dayjs(r.start_time).isAfter(cutoffDate)
  );

  if (recentRecords.length === 0) {
    return {
      patterns: [],
      totalRecords: 0,
      avgInterval: 0,
      mostActiveDay: 0,
    };
  }

  // 统计每小时分布
  const hourCount: Record<number, number> = {};
  const dayCount: Record<number, number> = {};
  const dates: string[] = [];

  recentRecords.forEach((record) => {
    const date = dayjs(record.start_time);
    const hour = date.hour();
    const day = date.day();

    hourCount[hour] = (hourCount[hour] || 0) + 1;
    dayCount[day] = (dayCount[day] || 0) + 1;

    const dateStr = date.format('YYYY-MM-DD');
    if (!dates.includes(dateStr)) {
      dates.push(dateStr);
    }
  });

  // 计算每小时的百分比
  const total = recentRecords.length;
  const patterns: HabitPattern[] = Object.entries(hourCount)
    .map(([hour, count]) => ({
      hour: parseInt(hour),
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  // 找出最活跃的星期几
  const mostActiveDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0]
    ? parseInt(Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0][0])
    : 0;

  // 计算平均间隔
  const uniqueDates = dates.length;
  const avgInterval = uniqueDates > 1 ? days / uniqueDates : 0;

  return {
    patterns,
    totalRecords: recentRecords.length,
    avgInterval,
    mostActiveDay,
  };
}

/**
 * 根据习惯推荐提醒时间
 * 策略：
 * 1. 找出最常去的 2-3 个时间段
 * 2. 避开这些时间段后的 2 小时（刚去过不太可能再去）
 * 3. 在常去时间前 15-30 分钟提醒
 */
export function suggestReminderTimes(habits: UserHabits): string[] {
  if (habits.patterns.length === 0) {
    // 默认时间：早上 8 点和晚上 8 点
    return ['08:00', '20:00'];
  }

  // 取前 3 个最常去的时间段
  const topPatterns = habits.patterns.slice(0, 3);

  // 建议提醒时间（在习惯时间前 15-30 分钟）
  const suggestions = topPatterns.map((pattern) => {
    const reminderHour = Math.max(0, pattern.hour);
    const reminderMinute = 30; // 固定30分
    return `${reminderHour.toString().padStart(2, '0')}:${reminderMinute.toString().padStart(2, '0')}`;
  });

  // 去重并排序
  return [...new Set(suggestions)].sort();
}

/**
 * 获取今天的建议提醒时间
 */
export function getTodayReminderTimes(habits: UserHabits): Date[] {
  const timeStrings = suggestReminderTimes(habits);
  const now = dayjs();

  return timeStrings
    .map((timeStr) => {
      const [hour, minute] = timeStr.split(':').map(Number);
      return now.hour(hour).minute(minute).second(0).millisecond(0);
    })
    .filter((date) => date.isAfter(now)) // 只保留未来的时间
    .map((date) => date.toDate());
}

/**
 * 计算用户是否今天已经去过
 */
export async function hasRecordedToday(): Promise<boolean> {
  const records = await getAllRecords(10);
  if (records.length === 0) return false;

  const today = dayjs().format('YYYY-MM-DD');
  const lastRecord = records[0];
  const lastRecordDate = dayjs(lastRecord.start_time).format('YYYY-MM-DD');

  return lastRecordDate === today;
}

/**
 * 预测下一个可能需要去的时间
 */
export function predictNextTime(habits: UserHabits): Date | null {
  if (habits.patterns.length === 0) return null;

  const now = dayjs();
  const currentHour = now.hour();

  // 找出今天还没到的时间
  const futurePatterns = habits.patterns.filter((p) => p.hour > currentHour);

  if (futurePatterns.length > 0) {
    // 取最近的一个习惯时间
    const nextPattern = futurePatterns.sort((a, b) => a.hour - b.hour)[0];
    return now.hour(nextPattern.hour).minute(0).second(0).toDate();
  }

  // 如果今天没有了，预测明天最早的习惯时间
  const tomorrowPattern = habits.patterns.sort((a, b) => a.hour - b.hour)[0];
  return now
    .add(1, 'day')
    .hour(tomorrowPattern.hour)
    .minute(0)
    .second(0)
    .toDate();
}
