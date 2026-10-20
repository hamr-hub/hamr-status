/**
 * 状态页可用率柱状条的确定性分布逻辑。
 *
 * 背景（proposed-fixes-v2 #04，P0 公信力缺陷）：旧实现在组件渲染时用
 * `Math.random()` 逐根决定柱子颜色，导致每次刷新页面 90 根柱子都重新
 * 洗牌 —— 用户刷新两次就会发现状态页是假的。
 *
 * 这里把「种子派生」和「分布生成」拆成纯函数，既能被 React 组件使用，
 * 也能被 `scripts/verify-uptime-determinism.mjs` 直接验证。
 */

/** 每根柱子的状态：0=正常 1=降级 2=故障 */
export type UptimeSlot = 0 | 1 | 2

/** FNV-1a 字符串哈希 → 32 位种子 */
export function hashSeed(str: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** mulberry32 —— 确定性伪随机数生成器（同一 seed 必定产生同一序列） */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * 生成 90 天可用率柱状条的示意分布。
 *
 * - `history` 存在时原样返回真实历史；
 * - 否则按 `serviceId` 派生的确定性序列生成：同一服务每次结果完全一致，
 *   不同服务之间分布不同；故障比例随聚合可用率下降而上升。
 */
export function buildUptimeSlots(
  serviceId: string,
  uptime: number,
  bars = 90,
  history?: UptimeSlot[],
): UptimeSlot[] {
  if (history) return history

  const rand = seededRandom(hashSeed(serviceId))
  const downRatio = Math.max(0, Math.min(1, (100 - uptime) / 100))
  // 故障占 downRatio 的 60%，另留少量降级
  const downCut = downRatio * 0.6
  const degradedCut = downCut + Math.min(0.04, downRatio * 0.2)

  return Array.from({ length: bars }, (): UptimeSlot => {
    const r = rand()
    if (r < downCut) return 2
    if (r < degradedCut) return 1
    return 0
  })
}
