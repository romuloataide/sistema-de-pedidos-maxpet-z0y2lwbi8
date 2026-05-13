import { useMemo } from 'react'
import useMainStore, { Order } from '@/stores/main'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DollarSign, ShoppingBag, Truck, CheckCircle2 } from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { AreaChart, Area, BarChart, Bar, XAxis, CartesianGrid } from 'recharts'
import { Link } from 'react-router-dom'
import { Progress } from '@/components/ui/progress'

export default function Index() {
  const { orders, clients, settings } = useMainStore()

  const validOrders = orders.filter((o: Order) => o.status !== 'Cancelado')
  const totalSales = validOrders.reduce((acc: number, o: Order) => acc + o.total, 0)
  const totalOrders = validOrders.length
  const inProduction = orders.filter((o: Order) => o.status === 'Em produção').length
  const readyDelivery = orders.filter((o: Order) => o.status === 'Separado para entrega').length

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const thisMonthSales = validOrders
    .filter((o) => {
      const d = new Date(o.createdAt)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
    .reduce((acc, o) => acc + o.total, 0)

  const monthlyGoal = settings?.monthlyGoal || 10000
  const progressPercent = Math.min((thisMonthSales / monthlyGoal) * 100, 100)

  const chartConfig = {
    sales: { label: 'Vendas (R$)', color: 'hsl(var(--chart-1))' },
    qty: { label: 'Pedidos', color: 'hsl(var(--chart-2))' },
  }

  const salesData = useMemo(() => {
    return [
      { day: '10/05', sales: 1200 },
      { day: '11/05', sales: 1750 },
      { day: '12/05', sales: 700 },
      { day: '13/05', sales: 85 },
      { day: '14/05', sales: 0 },
    ]
  }, [])

  const segmentData = useMemo(() => {
    const map: Record<string, number> = {}
    validOrders.forEach((o: Order) => {
      const c = clients.find((c: any) => c.id === o.clientId)
      if (c) {
        map[c.segment] = (map[c.segment] || 0) + 1
      }
    })
    return Object.entries(map).map(([name, qty]) => ({ name, qty }))
  }, [validOrders, clients])

  return (
    <div className="space-y-8 animate-fade-in-up">
      <Card className="border-0 shadow-sm bg-gradient-to-r from-maxpet-blue to-[#003d82] text-white">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="w-full md:w-1/3">
            <h2 className="text-xl font-bold mb-1">Meta de Vendas (Mês)</h2>
            <p className="text-blue-200 text-sm">Acompanhe seu progresso mensal.</p>
          </div>
          <div className="w-full md:w-2/3 space-y-3">
            <div className="flex justify-between font-bold text-sm">
              <span>{formatCurrency(thisMonthSales)}</span>
              <span className="text-blue-200">Objetivo: {formatCurrency(monthlyGoal)}</span>
            </div>
            <Progress value={progressPercent} className="h-3 bg-blue-900/50" />
            <p className="text-xs text-right text-blue-200">
              {progressPercent.toFixed(1)}% concluído
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-0 border-l-4 border-maxpet-blue">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-gray-500 flex justify-between">
              Vendas do Mês <DollarSign size={16} className="text-maxpet-blue" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-maxpet-navy">{formatCurrency(totalSales)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0 border-l-4 border-maxpet-green">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-gray-500 flex justify-between">
              Total de Pedidos <ShoppingBag size={16} className="text-maxpet-green" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-maxpet-navy">{totalOrders}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0 border-l-4 border-yellow-500">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-gray-500 flex justify-between">
              Em Produção <CheckCircle2 size={16} className="text-yellow-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-maxpet-navy">{inProduction}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0 border-l-4 border-orange-500">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-gray-500 flex justify-between">
              Prontos p/ Entrega <Truck size={16} className="text-orange-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-maxpet-navy">{readyDelivery}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="text-lg text-maxpet-navy">
              Volume de Vendas (Últimos Dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: '#64748B' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="var(--color-sales)"
                  fill="var(--color-sales)"
                  fillOpacity={0.15}
                  strokeWidth={3}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="text-lg text-maxpet-navy">Pedidos por Segmento</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <BarChart data={segmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: '#64748B' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="qty" fill="var(--color-qty)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-maxpet-navy">Atividade Recente</CardTitle>
          <Link to="/pedidos" className="text-sm font-semibold text-maxpet-blue hover:underline">
            Ver todos
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {orders.slice(0, 5).map((o: Order) => {
              const client = clients.find((c: any) => c.id === o.clientId)
              return (
                <div
                  key={o.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-bold text-maxpet-navy">
                      {client?.name || 'Cliente Desconhecido'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Pedido #{o.id} • {formatDate(o.createdAt)}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="font-bold">{formatCurrency(o.total)}</p>
                    <Badge
                      variant={o.status === 'Entregue' ? 'default' : 'secondary'}
                      className={
                        o.status === 'Entregue' ? 'bg-maxpet-green' : 'bg-gray-200 text-gray-700'
                      }
                    >
                      {o.status}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
