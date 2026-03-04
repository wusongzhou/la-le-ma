// 数据库类型定义
export interface PoopRecord {
  id: number;
  start_time: string;
  end_time: string | null;
  duration_seconds: number | null;
  created_at: string;
}

export interface PoopRecordInsert {
  start_time: string;
  end_time?: string;
  duration_seconds?: number;
}

export interface DailyStats {
  date: string;
  count: number;
  total_duration: number;
  avg_duration: number;
}

export interface Streak {
  current_streak: number;
  longest_streak: number;
  last_record_date: string | null;
  updated_at: string;
}

export interface StreakUpdate {
  newStreak: number;
  isNewRecord: boolean; // 是否创造了新的最长连胜
}

// 成就类型
export type AchievementType =
  | 'first_poop'        // 第一次记录
  | 'night_owl'         // 深夜记录
  | 'early_bird'        // 早起记录
  | 'speed_demon'       // 1分钟内完成
  | 'marathon'          // 超过15分钟
  | 'week_warrior'      // 连胜7天
  | 'month_master'      // 连胜30天
  | 'century'           // 累计100次
  | 'time_lord'         // 累计10小时
  | 'weekend_warrior';  // 周末10次

export interface Achievement {
  id: string;
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlocked_at: string | null;
}

