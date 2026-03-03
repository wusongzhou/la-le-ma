import { getDatabase } from './database';
import type { PoopRecord, DailyStats } from './types';
import dayjs from 'dayjs';

// 创建新记录（开始计时）
export const startRecord = async (): Promise<number> => {
  const db = getDatabase();
  const result = await db.runAsync('INSERT INTO poop_records (start_time) VALUES (?)', [
    dayjs().toISOString(),
  ]);
  return result.lastInsertRowId;
};

// 结束计时
export const endRecord = async (id: number, note?: string): Promise<void> => {
  const db = getDatabase();
  const record = await getRecordById(id);
  if (!record) throw new Error('Record not found');

  const endTime = dayjs();
  const startTime = dayjs(record.start_time);
  const durationSeconds = endTime.diff(startTime, 'second');

  await db.runAsync(
    'UPDATE poop_records SET end_time = ?, duration_seconds = ?, note = ? WHERE id = ?',
    [endTime.toISOString(), durationSeconds, note || null, id]
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

// 获取每日统计
export const getDailyStats = async (days = 30): Promise<DailyStats[]> => {
  const db = getDatabase();
  const startDate = dayjs().subtract(days, 'day').format('YYYY-MM-DD');

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
    [startDate]
  );
  return results;
};

// 获取总体统计
export const getOverallStats = async () => {
  const db = getDatabase();
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
    WHERE end_time IS NOT NULL`
  );
  return result;
};
