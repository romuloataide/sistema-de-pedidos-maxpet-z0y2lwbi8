import { useMemo, useState } from 'react'
import useMainStore, { Order, Product } from '@/stores/main'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Printer, Download, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

export default function Reports() {
  const { orders, products, clients, sellers, expenses } = useMainStore()

  const [dateRange, setDateRange] = useState('30d')
  const [filterSeller, setFilterSeller] = useState('all')
  const [filterSegment, setFilterSegment] = useState('all')
  const [filterClient, setFilterClient] = useState('all')
  const [filterNeighborhood, setFilterNeighborhood] = useState('all')

  const validOrders = useMemo(() => {
    const now = new Date()
    let startDate = new Date(0) // all time

    if (dateRange === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (dateRange === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    } else if (dateRange === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    } else if (dateRange === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1)
    }

    return orders
      .filter((o: Order) => o.status !== 'Cancelado')
      .filter((o: Order) => new Date(o.createdAt) >= startDate)
      .filter((o: Order) => {
        const c = clients.find((x: any) => x.id === o.clientId)
        const passSeller = filterSeller === 'all' || o.sellerId === filterSeller
        const passSegment = filterSegment === 'all' || (c && c.segment === filterSegment)
        const passClient = filterClient === 'all' || o.clientId === filterClient
        const passNeighborhood =
          filterNeighborhood === 'all' || (c && c.neighborhood === filterNeighborhood)
        return passSeller && passSegment && passClient && passNeighborhood
      })
  }, [orders, clients, filterSeller, filterSegment, filterClient, filterNeighborhood, dateRange])

  // KPIs
  const totalRevenue = validOrders.reduce((acc, o) => acc + o.total, 0)
  const totalCMV = validOrders.reduce((acc, o) => {
    const orderCost =
      o.items?.reduce((sum: number, item: any) => {
        const p = products.find((x: any) => x.id === item.productId)
        const cost = item.unit_cost || (p ? p.unit_cost : 0) || 0
        return sum + cost * item.quantity
      }, 0) || 0
    return acc + orderCost
  }, 0)

  // Also filter expenses by date for accurate profit
  const filteredExpenses = useMemo(() => {
    const now = new Date()
    let startDate = new Date(0)
    if (dateRange === '7d') startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    else if (dateRange === '30d') startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    else if (dateRange === 'month') startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    else if (dateRange === 'year') startDate = new Date(now.getFullYear(), 0, 1)

    return expenses.filter((e: any) => new Date(e.date) >= startDate)
  }, [expenses, dateRange])

  const totalExpenses = filteredExpenses.reduce((acc: number, e: any) => acc + e.amount, 0)
  const netProfit = totalRevenue - totalCMV - totalExpenses

  // Ticket Médio
  const averageTicket = validOrders.length > 0 ? totalRevenue / validOrders.length : 0

  // ABC Curve for Clients
  const abcCurve = useMemo(() => {
    const stats: Record<string, number> = {}
    validOrders.forEach((o) => {
      stats[o.clientId] = (stats[o.clientId] || 0) + o.total
    })

    const sorted = Object.entries(stats)
      .map(([id, total]) => ({ client: clients.find((c: any) => c.id === id), total }))
      .sort((a, b) => b.total - a.total)

    let cumulative = 0
    return sorted.map((s) => {
      cumulative += s.total
      const perc = (cumulative / totalRevenue) * 100
      let classification = 'A'
      if (perc > 80 && perc <= 95) classification = 'B'
      else if (perc > 95) classification = 'C'
      return { ...s, classification }
    })
  }, [validOrders, clients, totalRevenue])

  // Sales Growth Chart
  const salesGrowthData = useMemo(() => {
    const grouped: Record<string, number> = {}
    validOrders.forEach((o) => {
      // Group by date string (e.g. DD/MM)
      const d = new Date(o.createdAt)
      const key = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
      grouped[key] = (grouped[key] || 0) + o.total
    })
    return Object.entries(grouped)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => {
        const [dA, mA] = a.date.split('/')
        const [dB, mB] = b.date.split('/')
        return (
          new Date(2024, Number(mA) - 1, Number(dA)).getTime() -
          new Date(2024, Number(mB) - 1, Number(dB)).getTime()
        )
      })
  }, [validOrders])

  // Commissions
  const sellerCommissions = useMemo(() => {
    const comms: Record<string, { name: string; totalVendas: number; comissao: number }> = {}
    validOrders.forEach((o) => {
      if (o.sellerId) {
        const seller = sellers.find((s: any) => s.id === o.sellerId)
        if (seller) {
          if (!comms[seller.id])
            comms[seller.id] = { name: seller.name, totalVendas: 0, comissao: 0 }
          comms[seller.id].totalVendas += o.total
          comms[seller.id].comissao += o.total * (seller.commissionRate / 100)
        }
      }
    })
    return Object.values(comms).sort((a, b) => b.comissao - a.comissao)
  }, [validOrders, sellers])

  const exportCSV = () => {
    const headers = ['ID Pedido', 'Data', 'Cliente', 'Vendedor', 'Status', 'Total']
    const rows = validOrders.map((o) => [
      o.shortId,
      formatDate(o.createdAt),
      clients.find((c: any) => c.id === o.clientId)?.name || '',
      sellers.find((s: any) => s.id === o.sellerId)?.name || '',
      o.status,
      o.total.toString(),
    ])
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'relatorio_vendas.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const neighborhoods = Array.from(new Set(clients.map((c: any) => c.neighborhood).filter(Boolean)))

  const chartConfig = {
    total: { label: 'Receita (R$)', color: 'hsl(var(--primary))' },
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <h1 className="text-2xl font-black text-maxpet-navy">Relatórios Gerenciais</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            className="text-maxpet-blue border-maxpet-blue flex-1 sm:flex-none"
            onClick={exportCSV}
          >
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
          <Button
            className="bg-maxpet-blue text-white flex-1 sm:flex-none"
            onClick={() => window.print()}
          >
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 print:hidden bg-white p-4 rounded-xl shadow-sm">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="font-semibold bg-gray-50 border-0">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="month">Este Mês</SelectItem>
            <SelectItem value="year">Este Ano</SelectItem>
            <SelectItem value="all">Todo o período</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterClient} onValueChange={setFilterClient}>
          <SelectTrigger>
            <SelectValue placeholder="Cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Clientes</SelectItem>
            {clients.map((c: any) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterSeller} onValueChange={setFilterSeller}>
          <SelectTrigger>
            <SelectValue placeholder="Vendedor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Vendedores</SelectItem>
            {sellers.map((s: any) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterSegment} onValueChange={setFilterSegment}>
          <SelectTrigger>
            <SelectValue placeholder="Segmento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Segmentos</SelectItem>
            {Array.from(new Set(clients.map((c: any) => c.segment).filter(Boolean))).map(
              (seg: any) => (
                <SelectItem key={seg} value={seg}>
                  {seg}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
        <Select value={filterNeighborhood} onValueChange={setFilterNeighborhood}>
          <SelectTrigger>
            <SelectValue placeholder="Bairro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Bairros</SelectItem>
            {neighborhoods.map((b: any) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-maxpet-blue to-[#003d82] text-white">
          <CardContent className="p-6">
            <p className="text-blue-200 font-bold mb-1 flex items-center gap-2">
              <TrendingUp size={16} /> Receita Bruta
            </p>
            <h2 className="text-2xl font-black">{formatCurrency(totalRevenue)}</h2>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-500 to-purple-700 text-white">
          <CardContent className="p-6">
            <p className="text-purple-200 font-bold mb-1 flex items-center gap-2">
              <Activity size={16} /> Ticket Médio
            </p>
            <h2 className="text-2xl font-black">{formatCurrency(averageTicket)}</h2>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-500 to-red-700 text-white">
          <CardContent className="p-6">
            <p className="text-red-200 font-bold mb-1 flex items-center gap-2">
              <TrendingDown size={16} /> Custos & Despesas
            </p>
            <h2 className="text-2xl font-black">{formatCurrency(totalExpenses + totalCMV)}</h2>
            <p className="text-xs text-red-200 mt-1 opacity-80">CMV: {formatCurrency(totalCMV)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-maxpet-green to-green-600 text-white">
          <CardContent className="p-6">
            <p className="text-green-200 font-bold mb-1 flex items-center gap-2">
              <DollarSign size={16} /> Lucro Líquido
            </p>
            <h2 className="text-2xl font-black">{formatCurrency(netProfit)}</h2>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Crescimento de Vendas</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <LineChart
                data={salesGrowthData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: '#64748B' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `R$${v / 1000}k`}
                  tick={{ fontSize: 12, fill: '#64748B' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="var(--color-total)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'var(--color-total)' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Curva ABC de Clientes</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto max-h-72">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b sticky top-0 z-10">
                <tr>
                  <th className="p-4 text-left">Class.</th>
                  <th className="p-4 text-left">Cliente</th>
                  <th className="p-4 text-right">Volume Comprado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {abcCurve.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-4 font-black">
                      <span
                        className={`px-2 py-1 rounded text-xs ${c.classification === 'A' ? 'bg-green-100 text-green-700' : c.classification === 'B' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {c.classification}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-maxpet-navy">{c.client?.name}</td>
                    <td className="p-4 text-right font-bold text-gray-700">
                      {formatCurrency(c.total)}
                    </td>
                  </tr>
                ))}
                {abcCurve.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-gray-500">
                      Nenhum dado encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Controle de Comissões</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-left">Vendedor</th>
                  <th className="p-4 text-right">Vendas do Período</th>
                  <th className="p-4 text-right">Comissão Devida</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sellerCommissions.map((sc, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-maxpet-navy">{sc.name}</td>
                    <td className="p-4 text-right">{formatCurrency(sc.totalVendas)}</td>
                    <td className="p-4 text-right font-bold text-maxpet-green">
                      {formatCurrency(sc.comissao)}
                    </td>
                  </tr>
                ))}
                {sellerCommissions.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-gray-500">
                      Nenhum dado encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html:
            '@media print { @page { size: auto; margin: 0; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; margin: 0; padding: 0; } }',
        }}
      />
      <div className="hidden print:block bg-white text-black font-sans p-10">
        <div className="text-center border-b pb-4 mb-8">
          <h1 className="text-3xl font-black">MAXPET - Relatório Gerencial</h1>
          <p className="text-gray-500">
            Período: {dateRange} | Gerado em {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="border p-4 rounded text-center">
            <p className="text-xs uppercase text-gray-500 font-bold">Receita Bruta</p>
            <p className="text-xl font-black">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="border p-4 rounded text-center">
            <p className="text-xs uppercase text-gray-500 font-bold">Ticket Médio</p>
            <p className="text-xl font-black">{formatCurrency(averageTicket)}</p>
          </div>
          <div className="border p-4 rounded text-center">
            <p className="text-xs uppercase text-gray-500 font-bold">Custos & Despesas</p>
            <p className="text-xl font-black">{formatCurrency(totalExpenses + totalCMV)}</p>
            <p className="text-[10px] text-gray-400 mt-1">CMV: {formatCurrency(totalCMV)}</p>
          </div>
          <div className="border p-4 rounded text-center">
            <p className="text-xs uppercase text-gray-500 font-bold">Lucro Líquido</p>
            <p className="text-xl font-black">{formatCurrency(netProfit)}</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="font-bold text-lg border-b mb-4">Curva ABC de Clientes</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Class.</th>
                <th className="py-2 text-left">Cliente</th>
                <th className="py-2 text-right">Volume</th>
              </tr>
            </thead>
            <tbody>
              {abcCurve.slice(0, 15).map((c, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2 font-bold">{c.classification}</td>
                  <td className="py-2">{c.client?.name}</td>
                  <td className="py-2 text-right">{formatCurrency(c.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="font-bold text-lg border-b mb-4">Comissões Devidas</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Vendedor</th>
                <th className="py-2 text-right">Vendas</th>
                <th className="py-2 text-right">Comissão</th>
              </tr>
            </thead>
            <tbody>
              {sellerCommissions.map((sc, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2 font-bold">{sc.name}</td>
                  <td className="py-2 text-right">{formatCurrency(sc.totalVendas)}</td>
                  <td className="py-2 text-right font-bold">{formatCurrency(sc.comissao)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
