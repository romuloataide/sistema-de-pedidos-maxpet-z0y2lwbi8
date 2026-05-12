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
import { Printer, Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
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

export default function Reports() {
  const { orders, products, clients, sellers, expenses } = useMainStore()

  const [filterSeller, setFilterSeller] = useState('all')
  const [filterSegment, setFilterSegment] = useState('all')
  const [filterClient, setFilterClient] = useState('all')
  const [filterNeighborhood, setFilterNeighborhood] = useState('all')

  const validOrders = useMemo(() => {
    return orders
      .filter((o: Order) => o.status !== 'Cancelado')
      .filter((o: Order) => {
        const c = clients.find((x: any) => x.id === o.clientId)
        const passSeller = filterSeller === 'all' || o.sellerId === filterSeller
        const passSegment = filterSegment === 'all' || (c && c.segment === filterSegment)
        const passClient = filterClient === 'all' || o.clientId === filterClient
        const passNeighborhood =
          filterNeighborhood === 'all' || (c && c.neighborhood === filterNeighborhood)
        return passSeller && passSegment && passClient && passNeighborhood
      })
  }, [orders, clients, filterSeller, filterSegment, filterClient, filterNeighborhood])

  // KPIs
  const totalRevenue = validOrders.reduce((acc, o) => acc + o.total, 0)
  const totalExpenses = expenses.reduce((acc: number, e: any) => acc + e.amount, 0)
  const netProfit = totalRevenue - totalExpenses

  // Product Stats
  const productStats = useMemo(() => {
    const stats: Record<string, { qty: number; rev: number }> = {}
    validOrders.forEach((o: Order) => {
      o.items.forEach((i) => {
        if (!stats[i.productId]) stats[i.productId] = { qty: 0, rev: 0 }
        stats[i.productId].qty += i.quantity
        stats[i.productId].rev += i.quantity * i.unitPrice
      })
    })
    return Object.entries(stats)
      .map(([id, data]) => ({ product: products.find((p: Product) => p.id === id), ...data }))
      .sort((a, b) => b.rev - a.rev)
  }, [validOrders, products])

  // Top Products for Chart
  const topProductsChart = productStats.slice(0, 5).map((s) => ({
    name: `${s.product?.name} ${s.product?.size}`,
    receita: s.rev,
  }))

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

  // Unique neighborhoods
  const neighborhoods = Array.from(new Set(clients.map((c: any) => c.neighborhood).filter(Boolean)))

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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden bg-white p-4 rounded-xl shadow-sm">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-maxpet-blue to-[#003d82] text-white">
          <CardContent className="p-6">
            <p className="text-blue-200 font-bold mb-1 flex items-center gap-2">
              <TrendingUp size={16} /> Receita Bruta
            </p>
            <h2 className="text-3xl font-black">{formatCurrency(totalRevenue)}</h2>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-500 to-red-700 text-white">
          <CardContent className="p-6">
            <p className="text-red-200 font-bold mb-1 flex items-center gap-2">
              <TrendingDown size={16} /> Despesas Totais
            </p>
            <h2 className="text-3xl font-black">{formatCurrency(totalExpenses)}</h2>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-maxpet-green to-green-600 text-white">
          <CardContent className="p-6">
            <p className="text-green-200 font-bold mb-1 flex items-center gap-2">
              <DollarSign size={16} /> Lucro Líquido
            </p>
            <h2 className="text-3xl font-black">{formatCurrency(netProfit)}</h2>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Top Produtos (Receita)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProductsChart}
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v / 1000}k`} />
                <RechartsTooltip
                  formatter={(val: number) => formatCurrency(val)}
                  cursor={{ fill: '#f3f4f6' }}
                />
                <Bar dataKey="receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Comissões de Vendedores</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-left">Vendedor</th>
                  <th className="p-4 text-right">Vendas</th>
                  <th className="p-4 text-right">Comissão</th>
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

      <div className="print:block print:p-8">
        <div className="hidden print:block mb-8 text-center border-b pb-4">
          <h1 className="text-3xl font-black">MaxPET - Relatório de Vendas</h1>
          <p className="text-gray-500">Gerado em {new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        <Card className="border-0 shadow-sm mb-6">
          <CardHeader className="print:p-0">
            <CardTitle className="text-maxpet-navy">Resumo por Produto</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b print:bg-transparent">
                <tr>
                  <th className="p-4 text-left">Produto</th>
                  <th className="p-4 text-right">Volume Vendido</th>
                  <th className="p-4 text-right">Receita Bruta</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {productStats.map((stat, i) => (
                  <tr key={i}>
                    <td className="p-4 font-bold">
                      {stat.product?.name} {stat.product?.size}
                    </td>
                    <td className="p-4 text-right">{stat.qty.toLocaleString('pt-BR')} un</td>
                    <td className="p-4 text-right font-bold text-maxpet-green">
                      {formatCurrency(stat.rev)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
