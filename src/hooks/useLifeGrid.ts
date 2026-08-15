import { useMemo } from 'react';
import { addWeeks, differenceInMonths } from 'date-fns';
import type { UserConfig, Milestone, Era } from '../types';
import {
  getWeekIndex,
  getMonthIndex,
  getYearIndex,
  parseBirthday,
  weekToYear,
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
    const milestoneMap = new Map<number, Milestone>();

    const bd = parseBirthday(user.birthday);
    for (const m of milestones) {
      milestoneWeekSet.add(m.weekIndex);
      milestoneMap.set(m.weekIndex, m);

      // Precise month index using date-fns
      const weekDate = addWeeks(bd, m.weekIndex);
      const absMonth = differenceInMonths(weekDate, bd);
      milestoneMonthSet.add(absMonth);

      milestoneYearSet.add(weekToYear(m.weekIndex));
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
      pctLived,
      weeksLeft,
      preciseAge: { years: ageYears, months: ageMonths },
    };
  }, [user, milestones, eras]);
}
