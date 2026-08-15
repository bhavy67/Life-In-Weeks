import { useMemo } from 'react';
import type { UserConfig, Milestone, Era } from '../types';
import {
  getWeekIndex,
  getMonthIndex,
  getYearIndex,
  getAbsoluteMonth,
  getAbsoluteYear,
} from '../utils/dateUtils';

export function useLifeGrid(user: UserConfig, milestones: Milestone[], eras: Era[]) {
  return useMemo(() => {
    const currentWeekIndex = getWeekIndex(user.birthday);
    const currentMonthIndex = getMonthIndex(user.birthday);
    const currentYearIndex = getYearIndex(user.birthday);

    const totalWeeks = user.lifespan * 52;
    const totalMonths = user.lifespan * 12;
    const totalYears = user.lifespan;

    // Week → Era map for O(1) lookup
    const eraMap = new Map<number, Era>();
    for (const era of eras) {
      for (let w = era.startWeek; w <= Math.min(era.endWeek, totalWeeks - 1); w++) {
        eraMap.set(w, era);
      }
    }

    // Milestone lookups for each view
    const milestoneWeekSet = new Set<number>();
    const milestoneMonthSet = new Set<number>();
    const milestoneYearSet = new Set<number>();
    const milestoneMap = new Map<number, Milestone[]>();
    const milestoneWeekCount = new Map<number, number>();
    const milestoneMonthCount = new Map<number, number>();
    const milestoneYearCount = new Map<number, number>();

    for (const m of milestones) {
      milestoneWeekSet.add(m.weekIndex);
      const arr = milestoneMap.get(m.weekIndex) ?? [];
      milestoneMap.set(m.weekIndex, [...arr, m]);
      milestoneWeekCount.set(m.weekIndex, (milestoneWeekCount.get(m.weekIndex) ?? 0) + 1);
      const absMonth = getAbsoluteMonth(m.weekIndex, user.birthday, m.date);
      milestoneMonthSet.add(absMonth);
      milestoneMonthCount.set(absMonth, (milestoneMonthCount.get(absMonth) ?? 0) + 1);
      const yr = getAbsoluteYear(m.weekIndex, user.birthday, m.date);
      milestoneYearSet.add(yr);
      milestoneYearCount.set(yr, (milestoneYearCount.get(yr) ?? 0) + 1);
    }

    // Stats
    const pctLived = Math.min(100, (currentWeekIndex / totalWeeks) * 100);
    const weeksLeft = Math.max(0, totalWeeks - currentWeekIndex);
    const ageYears = currentYearIndex;
    const ageMonths = currentMonthIndex - ageYears * 12;

    return {
      currentWeekIndex,
      currentMonthIndex,
      currentYearIndex,
      totalWeeks,
      totalMonths,
      totalYears,
      eraMap,
      milestoneWeekSet,
      milestoneMonthSet,
      milestoneYearSet,
      milestoneMap,
      milestoneWeekCount,
      milestoneMonthCount,
      milestoneYearCount,
      pctLived,
      weeksLeft,
      preciseAge: { years: ageYears, months: ageMonths },
    };
  }, [user, milestones, eras]);
}
