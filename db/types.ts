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
