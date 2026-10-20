/**
 * 验证状态页可用率柱状条的**确定性**。
 *
 * 回归背景：旧实现用 `Math.random()` 逐根掷骰子，用户每次刷新页面都会看到
 * 不同的 90 根柱子 —— 状态页因此失去公信力（proposed-fixes-v2 #04）。
 *
 * 本脚本用 Node 原生 TypeScript 支持直接跑，无需测试框架：
 *   node scripts/verify-uptime-determinism.mjs
 */
import assert from 'node:assert/strict'
import { buildUptimeSlots, hashSeed, seededRandom } from '../src/utils/uptime.ts'

let passed = 0

function check(name, fn) {
  fn()
  passed++
  console.log(`  ✓ ${name}`)
}

console.log('状态页可用率分布 — 确定性验证\n')

check('同一服务重复生成的结果完全一致', () => {
  const a = buildUptimeSlots('website', 99.98)
  const b = buildUptimeSlots('website', 99.98)
  assert.deepEqual(a, b, '两次生成结果不一致 —— 页面刷新后柱子会重新洗牌')
})

check('模拟 10 次刷新，结果始终不变', () => {
  const first = buildUptimeSlots('api', 99.91)
  for (let i = 0; i < 10; i++) {
    assert.deepEqual(buildUptimeSlots('api', 99.91), first)
  }
})

check('不同服务产生不同分布', () => {
  // 注意：可用率极高时（如 99.9%）所有服务都看不到故障柱，分布自然相同；
  // 这里用同一个可用率比较，验证差异来自服务 id 派生的种子本身。
  const website = buildUptimeSlots('website', 95)
  const api = buildUptimeSlots('api', 95)
  assert.notDeepEqual(website, api, '不同服务不应产生完全相同的柱子分布')
})

check('可用率极高时不产生故障柱', () => {
  for (const id of ['website', 'api', 'help']) {
    const slots = buildUptimeSlots(id, 99.98)
    assert.equal(slots.filter(s => s === 2).length, 0, `${id} 在 99.98% 时不应有故障柱`)
  }
})

check('可用率越低，故障柱子越多', () => {
  const healthy = buildUptimeSlots('svc', 100).filter(s => s === 2).length
  const degraded = buildUptimeSlots('svc', 95).filter(s => s === 2).length
  const broken = buildUptimeSlots('svc', 90).filter(s => s === 2).length
  assert.ok(healthy < degraded, `100% 时故障应少于 95%（${healthy} vs ${degraded}）`)
  assert.ok(degraded < broken, `95% 时故障应少于 90%（${degraded} vs ${broken}）`)
})

check('100% 可用率时不产生故障柱', () => {
  const slots = buildUptimeSlots('svc', 100)
  assert.equal(slots.filter(s => s === 2).length, 0)
})

check('提供真实历史时原样使用', () => {
  const history = [0, 1, 2, 0, 2]
  assert.deepEqual(buildUptimeSlots('svc', 50, 5, history), history)
})

check('哈希种子稳定且可复现', () => {
  assert.equal(hashSeed('website'), hashSeed('website'))
  assert.notEqual(hashSeed('website'), hashSeed('api'))
})

check('伪随机序列可复现', () => {
  const a = seededRandom(hashSeed('x'))
  const b = seededRandom(hashSeed('x'))
  for (let i = 0; i < 50; i++) {
    assert.equal(a(), b())
  }
})

console.log(`\n${passed} 项检查全部通过 ✅`)
