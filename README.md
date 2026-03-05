# HamR 服务监控 (status.hamr.top)

> HamR 服务状态透明页面 - 实时监控、历史统计、故障通报

[![Status](https://img.shields.io/badge/status-开发中-yellow)](https://github.com/hamr-hub/hamr-status)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Framework](https://img.shields.io/badge/framework-Vite+React-61dafb)](https://vitejs.dev)

## 📋 项目概述

**项目编号**: PROJ-011  
**域名**: status.hamr.top  
**优先级**: ⭐⭐ 中  
**状态**: 待开发

HamR 服务监控页面面向用户，实时展示平台所有核心服务的运行状态、历史可用性、故障通报和 SLA 达成情况。

## 🎯 核心职责

### 1. 实时状态展示
监控 9 个核心服务：
- hamr.store (官网)
- account.hamr.store (账号中心)
- app.hamr.store (HamR 管家)
- hamr.top (开发者门户)
- docs.hamr.top (技术文档)
- api.hamr.top (API 网关)
- deploy.hamr.top (部署指南)
- demo.hamr.top (演示环境)
- jiabu.hamr.store (JiaBu 决策)

### 2. 状态级别（5 级）
- 🟢 **正常**: 所有功能正常
- 🟡 **性能下降**: 响应缓慢但可用
- 🟠 **部分中断**: 部分功能不可用
- 🔴 **完全中断**: 服务不可访问
- 🔵 **维护中**: 计划维护

### 3. 历史可用性
- **7 天可用率**: 过去一周统计
- **30 天可用率**: 过去一月统计
- **90 天可用率**: 过去一季度统计
- **响应时间趋势**: 历史延迟曲线
- **事件历史**: 故障/维护记录

### 4. 故障通报
**事件类型**:
- 🚨 **故障**: 非计划中断
- 🔧 **维护**: 计划维护
- 📢 **通知**: 重要公告

**事件管理流程**:
1. **调查中** (Investigating)
2. **已识别** (Identified)
3. **修复中** (Fixing)
4. **已解决** (Resolved)
5. **RCA 报告** (Post-mortem)

### 5. 状态订阅
- 邮件通知（故障/维护/恢复）
- RSS 订阅
- 可选订阅全部或特定服务

### 6. SLA 展示
- 月度 SLA 达成情况
- 目标: **99.9%** 可用性
- 实际达成率趋势图

## 🏗️ 系统架构

```
┌─────────────────┐
│   Status Page   │  React SPA
│(status.hamr.top)│  可视化展示
└────────┬────────┘
         │ HTTPS
┌────────▼────────┐
│ UptimeRobot API │  第三方监控
│  或自建监控      │  数据来源
└────────┬────────┘
         │
    ┌────┴─────┬────────────┐
    │          │            │
┌───▼───┐  ┌──▼───┐  ┌────▼────┐
│HTTP   │  │Ping  │  │API      │
│Check  │  │Check │  │Response │
└────────┘  └──────┘  └─────────┘
```

## 🛠️ 技术栈

| 技术 | 用途 | 备注 |
|-----|------|------|
| **Vite** | 构建工具 | 快速开发 |
| **React 18** | 前端框架 | TypeScript |
| **Tailwind CSS** | 样式框架 | 状态页面 UI |
| **Recharts** | 图表库 | 可用性趋势 |
| **UptimeRobot** | 监控服务 | 第三方监控 |
| **Vercel** | 部署托管 | 零成本 |

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 配置监控 API
cp .env.example .env

# 本地开发
npm run dev

# 构建生产版本
npm run build
```

## 📦 项目结构

```
hamr-status/
├── src/
│   ├── components/
│   │   ├── ServiceStatus.tsx    # 服务状态卡片
│   │   ├── UptimeChart.tsx      # 可用性图表
│   │   ├── Incident.tsx         # 事件通报
│   │   └── Subscribe.tsx        # 订阅表单
│   ├── pages/
│   │   ├── Home.tsx             # 首页
│   │   ├── History.tsx          # 历史统计
│   │   └── Incidents.tsx        # 事件列表
│   ├── api/
│   │   └── uptime.ts            # UptimeRobot API
│   └── App.tsx
├── public/
├── package.json
└── .env.example
```

## 📊 监控指标

### 核心指标
- **HTTP 状态码**: 200/4xx/5xx
- **响应时间**: P50/P90/P99
- **可用率**: Uptime %
- **事件次数**: 故障/维护次数

### 监控频率
- **外部监控**: 每 1 分钟检查一次
- **数据更新**: 实时刷新
- **历史数据**: 保留 90 天

## 🎨 状态页面设计

### 首页展示

```
┌─────────────────────────────────┐
│     HamR 服务状态               │
│  ✅ 所有系统运行正常             │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  🟢 hamr.store              99.9%│
│  🟢 account.hamr.store      99.8%│
│  🟢 app.hamr.store          99.7%│
│  🟢 api.hamr.top            99.9%│
│  ...                             │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│     最近事件                     │
│  2026-03-01 [已解决]            │
│  API 网关响应缓慢                │
└─────────────────────────────────┘
```

### 历史统计

```
可用性趋势 (过去 30 天)
┌─────────────────────────────────┐
│ 100% ─────────────────────────── │
│  99% ─────────────────────────── │
│  98% ─────────────────────────── │
│  97% ─────────────────────────── │
│       1  5  10  15  20  25  30   │
└─────────────────────────────────┘

响应时间 (ms)
┌─────────────────────────────────┐
│ 500 ─────────────────────────── │
│ 400 ─────────────────────────── │
│ 300 ─────────────────────────── │
│ 200 ─────────────────────────── │
│ 100 ─────────────────────────── │
│       1  5  10  15  20  25  30   │
└─────────────────────────────────┘
```

## 🔔 订阅功能

### 邮件订阅

```typescript
// 订阅所有服务
POST /api/subscribe
{
  "email": "user@example.com",
  "services": ["all"]
}

// 订阅特定服务
POST /api/subscribe
{
  "email": "user@example.com",
  "services": ["api.hamr.top", "app.hamr.store"]
}
```

### RSS 订阅

```xml
<feed>
  <title>HamR 服务状态</title>
  <link>https://status.hamr.top/rss</link>
  <updated>2026-03-05T10:00:00Z</updated>
  <entry>
    <title>[已解决] API 网关响应缓慢</title>
    <published>2026-03-01T14:30:00Z</published>
    <summary>问题已修复，服务恢复正常</summary>
  </entry>
</feed>
```

## 📊 里程碑

- [ ] **2026-04-05**: 监控方案设计
- [ ] **2026-04-20**: 页面开发
- [ ] **2026-04-28**: 监控集成
- [ ] **2026-05-05**: 测试上线

## 🔗 相关链接

- [技术文档](https://docs.hamr.top) - API 文档
- [帮助中心](https://help.hamr.store) - 故障排查

## 📄 许可证

MIT License

---

**最后更新**: 2026-03-05  
**部署环境**: https://status.hamr.top (即将上线)
