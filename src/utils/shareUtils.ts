import type { Era, Milestone } from '../types';

interface SharePayload {
  b: string;
  l: number;
  m: { w: number; t: string; e?: string; d?: string; a?: string }[];
  r: { n: string; c: string; s: number; e: number }[];
}

export interface SharedState {
  birthday: string;
  lifespan: number;
  milestones: Milestone[];
  eras: Era[];
}

function toB64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromB64(b64: string): string {
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeShareUrl(state: SharedState): string {
  const payload: SharePayload = {
    b: state.birthday,
    l: state.lifespan,
    m: state.milestones.map((m) => ({
      w: m.weekIndex,
      t: m.title,
      ...(m.emoji && { e: m.emoji }),
      ...(m.description && { d: m.description }),
      ...(m.date && { a: m.date }),
    })),
    r: state.eras.map((era) => ({
      n: era.name,
      c: era.color,
      s: era.startWeek,
      e: era.endWeek,
    })),
  };
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('s', toB64(JSON.stringify(payload)));
  return url.toString();
}

export function decodeShareParam(param: string): SharedState | null {
  try {
    const p = JSON.parse(fromB64(param)) as SharePayload;
    return {
      birthday: p.b,
      lifespan: p.l,
      milestones: p.m.map((m, i) => ({
        id: `s-${i}`,
        weekIndex: m.w,
        title: m.t,
        emoji: m.e,
        description: m.d,
        date: m.a,
      })),
      eras: p.r.map((r, i) => ({
        id: `s-era-${i}`,
        name: r.n,
        color: r.c,
        startWeek: r.s,
        endWeek: r.e,
      })),
    };
  } catch {
    return null;
  }
}

export function getShareParam(): string | null {
  return new URLSearchParams(window.location.search).get('s');
}
