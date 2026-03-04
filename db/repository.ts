import { getDatabase } from './database';
import type { PoopRecord, DailyStats, Streak, StreakUpdate, Achievement, AchievementType } from './types';
import dayjs from 'dayjs';

// ==================== Record Functions ====================

// 创建新记录（开始计时）
export const startRecord = async (): Promise<number> => {
  const db = getDatabase();
  const result = await db.runAsync('INSERT INTO poop_records (start_time) VALUES (?)', [
    dayjs().toISOString(),
  ]);
  return result.lastInsertRowId;
};

// 结束计时
export const endRecord = async (id: number): Promise<void> => {
  const db = getDatabase();
  const record = await getRecordById(id);
  if (!record) throw new Error('Record not found');

  const endTime = dayjs();
  const startTime = dayjs(record.start_time);
  const durationSeconds = endTime.diff(startTime, 'second');

  await db.runAsync(
    'UPDATE poop_records SET end_time = ?, duration_seconds = ? WHERE id = ?',
    [endTime.toISOString(), durationSeconds, id]
  );
};

// 获取单条记录
export const getRecordById = async (id: number): Promise<PoopRecord | null> => {
  const db = getDatabase();
  const result = await db.getFirstAsync<PoopRecord>('SELECT * FROM poop_records WHERE id = ?', [
    id,
  ]);
  return result || null;
};

// 获取所有记录（倒序）
export const getAllRecords = async (limit = 50): Promise<PoopRecord[]> => {
  const db = getDatabase();
  const results = await db.getAllAsync<PoopRecord>(
    'SELECT * FROM poop_records ORDER BY start_time DESC LIMIT ?',
    [limit]
  );
  return results;
};

// 获取未完成的记录（正在计时中）
export const getActiveRecord = async (): Promise<PoopRecord | null> => {
  const db = getDatabase();
  const result = await db.getFirstAsync<PoopRecord>(
    'SELECT * FROM poop_records WHERE end_time IS NULL ORDER BY id DESC LIMIT 1'
  );
  return result || null;
};

// 删除记录
export const deleteRecord = async (id: number): Promise<void> => {
  const db = getDatabase();
  await db.runAsync('DELETE FROM poop_records WHERE id = ?', [id]);
};

// ==================== Stats Functions ====================

// 获取每日统计
export const getDailyStats = async (days: number = 30, startDate?: string): Promise<DailyStats[]> => {
  const db = getDatabase();
  const start = startDate || dayjs().subtract(days, 'day').format('YYYY-MM-DD');

  const results = await db.getAllAsync<DailyStats>(
    `SELECT
      DATE(start_time) as date,
      COUNT(*) as count,
      COALESCE(SUM(duration_seconds), 0) as total_duration,
      COALESCE(AVG(duration_seconds), 0) as avg_duration
    FROM poop_records
    WHERE DATE(start_time) >= ?
    GROUP BY DATE(start_time)
    ORDER BY date DESC`,
    [start]
  );
  return results;
};

// 获取总体统计
export const getOverallStats = async (startDate?: string, endDate?: string) => {
  const db = getDatabase();

  let whereClause = 'WHERE end_time IS NOT NULL';
  const params: string[] = [];

  if (startDate) {
    whereClause += ' AND DATE(start_time) >= ?';
    params.push(startDate);
  }
  if (endDate) {
    whereClause += ' AND DATE(start_time) <= ?';
    params.push(endDate);
  }

  const result = await db.getFirstAsync<{
    total_count: number;
    total_duration: number;
    avg_duration: number;
    longest_duration: number;
    shortest_duration: number;
  }>(
    `SELECT
      COUNT(*) as total_count,
      COALESCE(SUM(duration_seconds), 0) as total_duration,
      COALESCE(AVG(duration_seconds), 0) as avg_duration,
      COALESCE(MAX(duration_seconds), 0) as longest_duration,
      COALESCE(MIN(duration_seconds), 0) as shortest_duration
    FROM poop_records
    ${whereClause}`,
    params
  );
  return result;
};

// ==================== Streak Functions ====================

// 获取当前连胜数据
export const getStreak = async (): Promise<Streak> => {
  const db = getDatabase();
  const result = await db.getFirstAsync<Streak>('SELECT * FROM streak WHERE id = 1');
  return result || { current_streak: 0, longest_streak: 0, last_record_date: null, updated_at: dayjs().toISOString() };
};

// 计算并更新连胜（在结束记录时调用）
export const updateStreak = async (): Promise<StreakUpdate> => {
  const db = getDatabase();
  const streak = await getStreak();
  const today = dayjs().format('YYYY-MM-DD');
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

  // 如果今天已经记录过了，连胜不变
  if (streak.last_record_date === today) {
    return { newStreak: streak.current_streak, isNewRecord: false };
  }

  let newStreak: number;

  // 如果上次记录是昨天，连胜+1
  if (streak.last_record_date === yesterday) {
    newStreak = streak.current_streak + 1;
  } else {
    // 否则连胜从1开始（今天第一次记录）
    newStreak = 1;
  }

  const isNewRecord = newStreak > streak.longest_streak;
  const newLongestStreak = isNewRecord ? newStreak : streak.longest_streak;

  await db.runAsync(
    'UPDATE streak SET current_streak = ?, longest_streak = ?, last_record_date = ?, updated_at = ? WHERE id = 1',
    [newStreak, newLongestStreak, today, dayjs().toISOString()]
  );

  return { newStreak, isNewRecord };
};

// 检查今天是否已记录
export const hasRecordedToday = async (): Promise<boolean> => {
  const db = getDatabase();
  const today = dayjs().format('YYYY-MM-DD');
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM poop_records WHERE DATE(start_time) = ? AND end_time IS NOT NULL',
    [today]
  );
  return (result?.count || 0) > 0;
};

// 重置连胜（用于测试）
export const resetStreak = async (): Promise<void> => {
  const db = getDatabase();
  await db.runAsync(
    'UPDATE streak SET current_streak = 0, longest_streak = 0, last_record_date = NULL WHERE id = 1'
  );
};

// ==================== Achievement Functions ====================

// 获取周末记录数
export const getWeekendRecordCount = async (): Promise<number> => {
  const db = getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM poop_records
     WHERE end_time IS NOT NULL
     AND (strftime('%w', start_time) = '0' OR strftime('%w', start_time) = '6')`
  );
  return result?.count || 0;
};

// 获取所有成就
export const getAllAchievements = async (): Promise<Achievement[]> => {
  const db = getDatabase();
  const results = await db.getAllAsync<Achievement>(
    'SELECT * FROM achievements ORDER BY unlocked_at DESC, id ASC'
  );
  return results;
};

// 获取已解锁成就
export const getUnlockedAchievements = async (): Promise<Achievement[]> => {
  const db = getDatabase();
  const results = await db.getAllAsync<Achievement>(
    'SELECT * FROM achievements WHERE unlocked_at IS NOT NULL ORDER BY unlocked_at DESC'
  );
  return results;
};

// 解锁成就
export const unlockAchievement = async (
  id: string,
  type: string,
  title: string,
  description: string,
  icon: string,
  color: string,
  unlockedAt: string | null
): Promise<Achievement> => {
  const db = getDatabase();

  await db.runAsync(
    `INSERT OR REPLACE INTO achievements (id, type, title, description, icon, color, unlocked_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, type, title, description, icon, color, unlockedAt]
  );

  return {
    id,
    type: type as AchievementType,
    title,
    description,
    icon,
    color,
    unlocked_at: unlockedAt,
  };
};
