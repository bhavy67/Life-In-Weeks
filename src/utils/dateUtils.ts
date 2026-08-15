import {
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
  addWeeks,
  addMonths,
  addDays,
  format,
} from 'date-fns';

export function parseBirthday(birthday: string): Date {
  return new Date(birthday + 'T00:00:00');
}

export function getWeekIndex(birthday: string): number {
  return Math.max(0, differenceInWeeks(new Date(), parseBirthday(birthday)));
}

export function getMonthIndex(birthday: string): number {
  return Math.max(0, differenceInMonths(new Date(), parseBirthday(birthday)));
}

export function getYearIndex(birthday: string): number {
  return Math.max(0, differenceInYears(new Date(), parseBirthday(birthday)));
}

export function getWeekDays(weekIndex: number, birthday: string): Date[] {
  const start = addWeeks(parseBirthday(birthday), weekIndex);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function getWeekDateRange(weekIndex: number, birthday: string): string {
  const bd = parseBirthday(birthday);
  const start = addWeeks(bd, weekIndex);
  const end = addWeeks(bd, weekIndex + 1);
  return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
}

export function getWeekStart(weekIndex: number, birthday: string): string {
  return format(addWeeks(parseBirthday(birthday), weekIndex), 'MMM d, yyyy');
}

export function getMonthLabel(monthIndex: number, birthday: string): string {
  const bd = parseBirthday(birthday);
  return format(addMonths(bd, monthIndex), 'MMMM yyyy');
}

// Convert absolute week index → approximate absolute month index
export function weekToAbsoluteMonth(weekIndex: number): number {
  return Math.floor((weekIndex * 12) / 52);
}

// Convert absolute week index → year index (0-based from birth)
export function weekToYear(weekIndex: number): number {
  return Math.floor(weekIndex / 52);
}

// Real calendar month index from birth — respects specific date when available
export function getAbsoluteMonth(weekIndex: number, birthday: string, date?: string): number {
  const bd = parseBirthday(birthday);
  const ref = date ? new Date(date + 'T00:00:00') : addWeeks(bd, weekIndex);
  return differenceInMonths(ref, bd);
}

// Real calendar year index from birth — respects specific date when available
export function getAbsoluteYear(weekIndex: number, birthday: string, date?: string): number {
  const bd = parseBirthday(birthday);
  const ref = date ? new Date(date + 'T00:00:00') : addWeeks(bd, weekIndex);
  return differenceInYears(ref, bd);
}

// Age in years at a given week index
export function ageAtWeek(weekIndex: number): number {
  return Math.floor(weekIndex / 52);
}

// Weeks until a target age
export function weeksUntilAge(currentWeekIndex: number, targetAge: number): number {
  const targetWeek = targetAge * 52;
  return Math.max(0, targetWeek - currentWeekIndex);
}
