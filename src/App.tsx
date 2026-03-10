import { useState, useEffect } from 'react'
import {
  CheckCircle, AlertTriangle, XCircle, Clock, RefreshCw,
  Activity, Globe, Shield, Database, Zap, Home, FileText,
  BookOpen, Code2, Server
} from 'lucide-react'

type ServiceStatus = 'operational' | 'degraded' | 'partial' | 'down' | 'maintenance'

interface Service {
  id: string
  name: string
  url: string
  icon: React.ReactNode
  status: ServiceStatus
  uptime_30d: number
  response_ms: number
  category: 'user' | 'dev' | 'infra'
}

interface Incident {
  id: string
  title: string
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
  severity: 'critical' | 'major' | 'minor'
  created_at: string
  updated_at: string
  message: string
}

const STATUS_CONFIG: Record<ServiceStatus, { label: string; color: string; bg: string; dot: string }> = {
  operational:  { label: '正常运行', color: 'text-green-700',  bg: 'bg-green-100',  dot: 'bg-green-500' },
  degraded:     { label: '性能下降', color: 'text-yellow-700', bg: 'bg-yellow-100', dot: 'bg-yellow-500' },
  partial:      { label: '部分中断', color: 'text-orange-700', bg: 'bg-orange-100', dot: 'bg-orange-500' },
  down:         { label: '完全中断', color: 'text-red-700',    bg: 'bg-red-100',    dot: 'bg-red-500' },
  maintenance:  { label: '维护中',   color: 'text-blue-700',   bg: 'bg-blue-100',   dot: 'bg-blue-500' },
}

const INCIDENT_STATUS: Record<string, string> = {
  investigating: '调查中',
  identified:    '已定位',
  monitoring:    '监控中',
  resolved:      '已解决',
}

const INITIAL_SERVICES: Service[] = [
  { id: 'website',   name: 'HamR 官网',     url: 'hamr.store',          icon: <Home className="w-4 h-4" />,     status: 'operational', uptime_30d: 99.98, response_ms: 142, category: 'user' },
  { id: 'account',   name: '账号中心',       url: 'account.hamr.store',  icon: <Shield className="w-4 h-4" />,   status: 'operational', uptime_30d: 99.95, response_ms: 187, category: 'user' },
  { id: 'app',       name: '管家应用',       url: 'app.hamr.store',      icon: <Activity className="w-4 h-4" />, status: 'operational', uptime_30d: 99.92, response_ms: 203, category: 'user' },
  { id: 'help',      name: '帮助中心',       url: 'help.hamr.store',     icon: <FileText className="w-4 h-4" />, status: 'operational', uptime_30d: 100,   response_ms: 98,  category: 'user' },
  { id: 'developer', name: '开发者门户',     url: 'hamr.top',            icon: <Globe className="w-4 h-4" />,    status: 'operational', uptime_30d: 99.99, response_ms: 115, category: 'dev' },
  { id: 'docs',      name: '技术文档站',     url: 'docs.hamr.top',       icon: <BookOpen className="w-4 h-4" />, status: 'operational', uptime_30d: 99.97, response_ms: 108, category: 'dev' },
  { id: 'api',       name: 'API 服务',       url: 'api.hamr.top',        icon: <Code2 className="w-4 h-4" />,    status: 'operational', uptime_30d: 99.91, response_ms: 234, category: 'dev' },
  { id: 'database',  name: '数据库集群',     url: '内部服务',             icon: <Database className="w-4 h-4" />, status: 'operational', uptime_30d: 99.99, response_ms: 12,  category: 'infra' },
  { id: 'infra',     name: '基础设施',       url: '服务器 43.133.224.11', icon: <Server className="w-4 h-4" />,   status: 'operational', uptime_30d: 99.98, response_ms: 0,   category: 'infra' },
]

const MOCK_INCIDENTS: Incident[] = [
  {
    id: '1',
    title: 'API 服务响应延迟升高',
    status: 'resolved',
    severity: 'minor',
    created_at: '2026-03-08 14:23',
    updated_at: '2026-03-08 15:41',
    message: '已定位为数据库连接池配置问题，调整后恢复正常。响应时间降至 200ms 以下。',
  },
]

function StatusBadge({ status }: { status: ServiceStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

function UptimeBar({ uptime }: { uptime: number }) {
  const bars = 90
  return (
    <div className="flex gap-0.5 items-end">
      {Array.from({ length: bars }).map((_, i) => {
        const isDown = Math.random() < (1 - uptime / 100) * 0.3
        return (
          <div
            key={i}
            className={`w-1 rounded-sm ${isDown ? 'bg-red-400' : 'bg-green-400'}`}
            style={{ height: isDown ? '8px' : '16px' }}
            title={isDown ? '故障' : '正常'}
          />
        )
      })}
    </div>
  )
}

function OverallBanner({ services }: { services: Service[] }) {
  const hasDown = services.some(s => s.status === 'down')
  const hasPartial = services.some(s => s.status === 'partial')
  const hasDegraded = services.some(s => s.status === 'degraded')
  const hasMaintenance = services.some(s => s.status === 'maintenance')

  let icon = <CheckCircle className="w-6 h-6 text-green-600" />
  let bg = 'bg-green-50 border-green-200'
  let text = 'text-green-800'
  let message = '所有系统正常运行'

  if (hasDown) {
    icon = <XCircle className="w-6 h-6 text-red-600" />
    bg = 'bg-red-50 border-red-200'; text = 'text-red-800'
    message = '部分服务发生中断'
  } else if (hasPartial) {
    icon = <AlertTriangle className="w-6 h-6 text-orange-600" />
    bg = 'bg-orange-50 border-orange-200'; text = 'text-orange-800'
    message = '部分服务存在中断'
  } else if (hasDegraded) {
    icon = <AlertTriangle className="w-6 h-6 text-yellow-600" />
    bg = 'bg-yellow-50 border-yellow-200'; text = 'text-yellow-800'
    message = '部分服务性能下降'
  } else if (hasMaintenance) {
    icon = <Clock className="w-6 h-6 text-blue-600" />
    bg = 'bg-blue-50 border-blue-200'; text = 'text-blue-800'
    message = '部分服务正在维护'
  }

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border ${bg}`}>
      {icon}
      <span className={`font-semibold text-lg ${text}`}>{message}</span>
    </div>
  )
}

const CATEGORIES = [
  { key: 'user', label: '用户服务' },
  { key: 'dev',  label: '开发者服务' },
  { key: 'infra', label: '基础设施' },
] as const

export default function App() {
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)

  const refresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setServices([...INITIAL_SERVICES])
      setLastUpdated(new Date())
      setRefreshing(false)
    }, 800)
  }

  useEffect(() => {
    const timer = setInterval(refresh, 60000)
    return () => clearInterval(timer)
  }, [])

  const avgUptime = (services.reduce((s, svc) => s + svc.uptime_30d, 0) / services.length).toFixed(2)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">HamR 服务状态</h1>
              <p className="text-xs text-gray-500">status.hamr.top</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>上次更新：{lastUpdated.toLocaleTimeString('zh-CN')}</span>
            <button
              onClick={refresh}
              disabled={refreshing}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              刷新
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <OverallBanner services={services} />

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{avgUptime}%</div>
            <div className="text-xs text-gray-500 mt-1">30 天平均可用性</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{services.filter(s => s.status === 'operational').length}</div>
            <div className="text-xs text-gray-500 mt-1">正常运行服务</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{MOCK_INCIDENTS.filter(i => i.status !== 'resolved').length}</div>
            <div className="text-xs text-gray-500 mt-1">进行中事件</div>
          </div>
        </div>

        {CATEGORIES.map(cat => (
          <section key={cat.key}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{cat.label}</h2>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
              {services.filter(s => s.category === cat.key).map(svc => (
                <div key={svc.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="text-gray-400 shrink-0">{svc.icon}</div>
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 text-sm">{svc.name}</div>
                      <div className="text-xs text-gray-400 truncate">{svc.url}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="hidden sm:block">
                      <UptimeBar uptime={svc.uptime_30d} />
                      <div className="text-xs text-gray-400 mt-1 text-right">{svc.uptime_30d}% / 90天</div>
                    </div>
                    {svc.response_ms > 0 && (
                      <div className="text-right hidden md:block">
                        <div className="text-sm font-medium text-gray-700">{svc.response_ms}ms</div>
                        <div className="text-xs text-gray-400">响应时间</div>
                      </div>
                    )}
                    <StatusBadge status={svc.status} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">历史事件</h2>
          {MOCK_INCIDENTS.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
              近期无故障记录
            </div>
          ) : (
            <div className="space-y-3">
              {MOCK_INCIDENTS.map(incident => (
                <div key={incident.id} className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full mr-2 ${
                        incident.severity === 'critical' ? 'bg-red-100 text-red-700' :
                        incident.severity === 'major' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {incident.severity === 'critical' ? '严重' : incident.severity === 'major' ? '主要' : '轻微'}
                      </span>
                      <span className="font-medium text-gray-900 text-sm">{incident.title}</span>
                    </div>
                    <span className={`shrink-0 text-xs px-2.5 py-0.5 rounded-full ${
                      incident.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {INCIDENT_STATUS[incident.status]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{incident.message}</p>
                  <div className="flex gap-4 mt-3 text-xs text-gray-400">
                    <span>创建：{incident.created_at}</span>
                    <span>更新：{incident.updated_at}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            订阅状态更新
          </h2>
          <p className="text-sm text-gray-500 mb-4">在服务发生故障或恢复时，第一时间收到通知。</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <button className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors">
              订阅
            </button>
          </div>
        </section>
      </main>

      <footer className="text-center text-xs text-gray-400 py-8">
        <p>© 2026 HamR · 家庭智能助理 · <a href="https://hamr.store" className="hover:text-gray-600">hamr.store</a></p>
      </footer>
    </div>
  )
}
