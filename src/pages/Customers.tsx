import { useState } from 'react'
import { Link } from 'react-router-dom'
import useMainStore, { Client } from '@/stores/main'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Search, PlusCircle, MapPin, Phone, Edit, Filter, Printer } from 'lucide-react'
import { formatCurrency, formatDate, formatDocument } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'

export default function Customers() {
  const { clients, orders, sellers } = useMainStore()
  const [search, setSearch] = useState('')
  const [filterNeighborhood, setFilterNeighborhood] = useState('')
  const [filterSegment, setFilterSegment] = useState('')
  const [filterSeller, setFilterSeller] = useState('')

  const filtered = clients.filter((c: Client) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.document.includes(search) ||
      (c.segment && c.segment.toLowerCase().includes(search.toLowerCase()))

    const matchesNeighborhood =
      !filterNeighborhood ||
      (c.neighborhood && c.neighborhood.toLowerCase().includes(filterNeighborhood.toLowerCase()))
    const matchesSegment =
      !filterSegment || (c.segment && c.segment.toLowerCase() === filterSegment.toLowerCase())
    const matchesSeller =
      !filterSeller ||
      (orders && orders.some((o: any) => o.clientId === c.id && o.sellerId === filterSeller))

    return matchesSearch && matchesNeighborhood && matchesSegment && matchesSeller
  })

  const uniqueNeighborhoods = Array.from(
    new Set(clients.map((c: Client) => c.neighborhood).filter(Boolean)),
  ) as string[]
  const uniqueSegments = Array.from(
    new Set(clients.map((c: Client) => c.segment).filter(Boolean)),
  ) as string[]

  const getClientMetrics = (clientId: string) => {
    const clientOrders = orders
      .filter((o: any) => o.clientId === clientId && o.status !== 'Cancelado')
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    if (clientOrders.length > 0) {
      return {
        date: clientOrders[0].createdAt,
        value: clientOrders[0].total,
      }
    }
    return null
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <h1 className="text-2xl font-black text-maxpet-navy">Clientes</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            className="border-maxpet-blue text-maxpet-blue"
            onClick={() => window.print()}
          >
            <Printer className="mr-2 h-4 w-4" /> Imprimir Lista
          </Button>
          <Link to="/clientes/novo">
            <Button className="bg-maxpet-blue hover:bg-maxpet-navy text-white w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Novo Cliente
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-2 print:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Buscar por nome ou CNPJ..."
            className="pl-10 h-12 bg-white border-0 shadow-sm text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-12 bg-white border-0 shadow-sm px-4">
              <Filter className="w-5 h-5 mr-2" />
              Filtros
              {(filterNeighborhood || filterSegment || filterSeller) && (
                <span className="ml-2 w-2 h-2 rounded-full bg-maxpet-blue" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-4">
              <h4 className="font-bold text-maxpet-navy">Filtros Avançados</h4>
              <div className="space-y-2">
                <Label>Bairro</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={filterNeighborhood}
                  onChange={(e) => setFilterNeighborhood(e.target.value)}
                >
                  <option value="">Todos os Bairros</option>
                  {uniqueNeighborhoods.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Segmento</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={filterSegment}
                  onChange={(e) => setFilterSegment(e.target.value)}
                >
                  <option value="">Todos os Segmentos</option>
                  {uniqueSegments.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Vendedor (via Pedidos)</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={filterSeller}
                  onChange={(e) => setFilterSeller(e.target.value)}
                >
                  <option value="">Todos os Vendedores</option>
                  {sellers &&
                    sellers.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setFilterNeighborhood('')
                  setFilterSegment('')
                  setFilterSeller('')
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100 print:hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-maxpet-navy">Cliente</th>
              <th className="p-4 font-semibold text-maxpet-navy">CNPJ/CPF</th>
              <th className="p-4 font-semibold text-maxpet-navy">Contato</th>
              <th className="p-4 font-semibold text-maxpet-navy">Bairro</th>
              <th className="p-4 font-semibold text-maxpet-navy">Segmento / Categoria</th>
              <th className="p-4 font-semibold text-maxpet-navy text-right">Último Pedido</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((c: Client) => {
              const metrics = getClientMetrics(c.id)
              return (
                <tr
                  key={c.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => (window.location.href = `/clientes/${c.id}`)}
                >
                  <td className="p-4">
                    <p className="font-bold text-maxpet-navy">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.responsible}</p>
                  </td>
                  <td className="p-4 text-gray-600">{formatDocument(c.document)}</td>
                  <td className="p-4 text-gray-600">{c.phone}</td>
                  <td className="p-4 text-gray-600">{c.neighborhood}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 items-start">
                      <Badge variant="outline" className="bg-white">
                        {c.segment || '-'}
                      </Badge>
                      {(c as any).category && (c as any).category !== 'Normal' && (
                        <Badge
                          variant="outline"
                          className={
                            (c as any).category === 'VIP'
                              ? 'bg-amber-100 text-amber-700 border-amber-200'
                              : 'bg-purple-100 text-purple-700 border-purple-200'
                          }
                        >
                          {(c as any).category}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    {metrics ? (
                      <>
                        <p className="font-bold text-maxpet-green">
                          {formatCurrency(metrics.value)}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(metrics.date)}</p>
                      </>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <Link to={`/clientes/${c.id}/editar`} onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-maxpet-blue hover:text-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden print:hidden">
        {filtered.map((c: Client) => {
          const metrics = getClientMetrics(c.id)
          return (
            <Link key={c.id} to={`/clientes/${c.id}`}>
              <Card className="hover:shadow-md transition-all border-0 shadow-sm group h-full">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-maxpet-navy text-lg line-clamp-1 group-hover:text-maxpet-blue transition-colors flex-1">
                      {c.name}
                    </h3>
                    <div className="flex flex-col gap-1 ml-2 items-end">
                      <Badge variant="outline" className="bg-gray-50 whitespace-nowrap">
                        {c.segment}
                      </Badge>
                      {(c as any).category && (c as any).category !== 'Normal' && (
                        <Badge
                          variant="outline"
                          className={
                            (c as any).category === 'VIP'
                              ? 'bg-amber-100 text-amber-700 border-amber-200'
                              : 'bg-purple-100 text-purple-700 border-purple-200'
                          }
                        >
                          {(c as any).category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 mb-4 flex-1">
                    <p>CNPJ/CPF: {formatDocument(c.document)}</p>
                    <p className="flex items-center gap-2">
                      <MapPin size={14} className="text-maxpet-green shrink-0" />{' '}
                      <span className="truncate">
                        {c.neighborhood}, {c.city}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone size={14} className="text-maxpet-blue shrink-0" /> {c.phone}
                    </p>
                  </div>
                  <div className="pt-3 border-t flex justify-between items-center">
                    <div className="text-xs">
                      {metrics ? (
                        <>
                          Último:{' '}
                          <span className="font-bold text-maxpet-green">
                            {formatCurrency(metrics.value)}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-400">Sem pedidos</span>
                      )}
                    </div>
                    <Link to={`/clientes/${c.id}/editar`} onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-maxpet-blue hover:text-blue-700 h-8"
                      >
                        <Edit className="w-4 h-4 mr-2" /> Editar
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}{' '}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            Nenhum cliente encontrado.
          </div>
        )}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html:
            '@media print { @page { size: landscape; margin: 10mm; } body { -webkit-print-color-adjust: exact; } }',
        }}
      />
      <div className="hidden print:block font-sans text-black bg-white">
        <div className="text-center mb-6 border-b pb-4">
          <h1 className="text-2xl font-black">MAXPET - Relatório de Clientes</h1>
          <p className="text-sm text-gray-500">
            Gerado em {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-maxpet-navy">
              <th className="py-2 px-1">Razão Social</th>
              <th className="py-2 px-1">CNPJ/CPF</th>
              <th className="py-2 px-1">Contato</th>
              <th className="py-2 px-1">Telefone</th>
              <th className="py-2 px-1">Bairro</th>
              <th className="py-2 px-1">Segmento</th>
              <th className="py-2 px-1 text-right">Último Pedido</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map((c: Client) => {
              const metrics = getClientMetrics(c.id)
              return (
                <tr key={c.id}>
                  <td className="py-2 px-1 font-bold">{c.name}</td>
                  <td className="py-2 px-1">{formatDocument(c.document)}</td>
                  <td className="py-2 px-1">{c.responsible || '-'}</td>
                  <td className="py-2 px-1">{c.phone}</td>
                  <td className="py-2 px-1">{c.neighborhood}</td>
                  <td className="py-2 px-1">{c.segment}</td>
                  <td className="py-2 px-1 text-right">
                    {metrics
                      ? `${formatDate(metrics.date)} - ${formatCurrency(metrics.value)}`
                      : '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
