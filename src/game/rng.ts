/**
 * 可播种伪随机数（mulberry32）。战斗结算的随机性全部经此显式注入（CLAUDE.md §5.5），
 * 同 seed + 同调用序列 → 完全一致的结果，战斗可回放、可测试。
 */

export interface Rng {
  /** 下一个 [0, 1) 均匀随机数 */
  next(): number;
}

export function makeRng(seed: number): Rng {
  // mulberry32：32 位状态，质量足够，实现极短
  let a = seed >>> 0;
  return {
    next(): number {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
  };
}
