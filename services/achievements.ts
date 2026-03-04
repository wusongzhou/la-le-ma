import type { Achievement, AchievementType } from '@/db/types';
import {
  getAllAchievements,
  getUnlockedAchievements,
  unlockAchievement,
  getOverallStats,
  getStreak,
  getWeekendRecordCount,
} from '@/db';
import dayjs from 'dayjs';

export interface AchievementCheckResult {
  newAchievements: Achievement[];
  allAchievements: Achievement[];
}

// 成就定义
const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlocked_at'>[] = [
  {
    id: 'first_poop',
    type: 'first_poop',
    title: '初出茅庐',
    description: '完成第一次记录',
    icon: '🚽',
    color: '#7FCC9E',
  },
  {
    id: 'night_owl',
    type: 'night_owl',
    title: '夜猫子',
    description: '在深夜 23:00-05:00 完成记录',
    icon: '🌙',
    color: '#5A9AC4',
  },
  {
    id: 'early_bird',
    type: 'early_bird',
    title: '早起的鸟儿',
    description: '在清晨 05:00-08:00 完成记录',
    icon: '🌅',
    color: '#F5D76E',
  },
  {
    id: 'speed_demon',
    type: 'speed_demon',
    title: '闪电侠',
    description: '1分钟内完成记录',
    icon: '⚡',
    color: '#FDC3A1',
  },
  {
    id: 'marathon',
    type: 'marathon',
    title: '马拉松选手',
    description: '单次记录超过15分钟',
    icon: '🦵',
    color: '#FB9B8F',
  },
  {
    id: 'week_warrior',
    type: 'week_warrior',
    title: '周常达人',
    description: '连续7天记录',
    icon: '🔥',
    color: '#F57799',
  },
  {
    id: 'month_master',
    type: 'month_master',
    title: '月度大师',
    description: '连续30天记录',
    icon: '🏆',
    color: '#F57799',
  },
  {
    id: 'century',
    type: 'century',
    title: '百变星君',
    description: '累计完成100次记录',
    icon: '💯',
    color: '#7FCC9E',
  },
  {
    id: 'time_lord',
    type: 'time_lord',
    title: '时间领主',
    description: '累计记录超过10小时',
    icon: '⏱️',
    color: '#5A9AC4',
  },
  {
    id: 'weekend_warrior',
    type: 'weekend_warrior',
    title: '周末战士',
    description: '在周末完成10次记录',
    icon: '🎉',
    color: '#FDC3A1',
  },
];

// 初始化成就表
export async function initAchievements(): Promise<void> {
  const existing = await getAllAchievements();
  const existingIds = new Set(existing.map((a) => a.id));

  for (const def of ACHIEVEMENT_DEFINITIONS) {
    if (!existingIds.has(def.id)) {
      await unlockAchievement(def.id, def.type, def.title, def.description, def.icon, def.color, null);
    }
  }
}

// 检查成就
export async function checkAchievements(
  durationSeconds: number,
  recordCount: number
): Promise<AchievementCheckResult> {
  const unlockedIds = new Set((await getUnlockedAchievements()).map((a) => a.id));
  const newAchievements: Achievement[] = [];
  const stats = await getOverallStats();
  const streak = await getStreak();
  const hour = dayjs().hour();

  const checkAndUnlock = async (achievement: Omit<Achievement, 'unlocked_at'>) => {
    if (!unlockedIds.has(achievement.id)) {
      const unlocked = await unlockAchievement(
        achievement.id,
        achievement.type,
        achievement.title,
        achievement.description,
        achievement.icon,
        achievement.color,
        dayjs().toISOString()
      );
      newAchievements.push(unlocked);
    }
  };

  // 1. 首次记录
  if (recordCount >= 1) {
    await checkAndUnlock(ACHIEVEMENT_DEFINITIONS[0]);
  }

  // 2. 夜猫子 (23:00-05:00)
  if (hour >= 23 || hour < 5) {
    await checkAndUnlock(ACHIEVEMENT_DEFINITIONS[1]);
  }

  // 3. 早起鸟儿 (05:00-08:00)
  if (hour >= 5 && hour < 8) {
    await checkAndUnlock(ACHIEVEMENT_DEFINITIONS[2]);
  }

  // 4. 闪电侠 (< 60秒)
  if (durationSeconds < 60) {
    await checkAndUnlock(ACHIEVEMENT_DEFINITIONS[3]);
  }

  // 5. 马拉松 (> 15分钟)
  if (durationSeconds > 15 * 60) {
    await checkAndUnlock(ACHIEVEMENT_DEFINITIONS[4]);
  }

  // 6. 周常达人 (连胜7天)
  if (streak.current_streak >= 7) {
    await checkAndUnlock(ACHIEVEMENT_DEFINITIONS[5]);
  }

  // 7. 月度大师 (连胜30天)
  if (streak.current_streak >= 30) {
    await checkAndUnlock(ACHIEVEMENT_DEFINITIONS[6]);
  }

  // 8. 百变星君 (100次)
  if ((stats?.total_count || 0) >= 100) {
    await checkAndUnlock(ACHIEVEMENT_DEFINITIONS[7]);
  }

  // 9. 时间领主 (10小时 = 36000秒)
  if ((stats?.total_duration || 0) >= 36000) {
    await checkAndUnlock(ACHIEVEMENT_DEFINITIONS[8]);
  }

  // 10. 周末战士 - 需要额外查询
  const weekendCount = await getWeekendRecordCount();
  if (weekendCount >= 10) {
    await checkAndUnlock(ACHIEVEMENT_DEFINITIONS[9]);
  }

  const allAchievements = await getAllAchievements();
  return { newAchievements, allAchievements };
}
