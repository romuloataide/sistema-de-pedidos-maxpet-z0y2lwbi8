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
import { formatCurrency } from '@/lib/utils'
import { Printer } from 'lucide-react'

export default function Reports() {
  const { orders, products, clients, sellers } = useMainStore()

  const [filterSeller, setFilterSeller] = useState('all')
  const [filterSegment, setFilterSegment] = useState('all')

  const validOrders = useMemo(() => {
    return orders
      .filter((o: Order) => o.status !== 'Cancelado')
      .filter((o: Order) => {
        const c = clients.find((x: any) => x.id === o.clientId)
        const passSeller = filterSeller === 'all' || o.sellerId === filterSeller
        const passSegment = filterSegment === 'all' || (c && c.segment === filterSegment)
        return passSeller && passSegment
      })
  }, [orders, clients, filterSeller, filterSegment])

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

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-2xl font-black text-maxpet-navy">Relatórios Gerenciais</h1>
        <Button className="bg-maxpet-blue text-white" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> Imprimir
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
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
                  {seg as string}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="print:block print:p-8">
        <div className="hidden print:block mb-8 text-center border-b pb-4">
          <h1 className="text-3xl font-black">MaxPET - Relatório de Vendas</h1>
          <p className="text-gray-500">Gerado em {new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        <Card className="border-0 shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-maxpet-navy">Resumo por Produto</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
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
