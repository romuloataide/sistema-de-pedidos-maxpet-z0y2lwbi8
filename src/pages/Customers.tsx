import { useState } from 'react'
import { Link } from 'react-router-dom'
import useMainStore, { Client } from '@/stores/main'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Search, PlusCircle, MapPin, Phone, Edit, Filter } from 'lucide-react'
import { formatDocument } from '@/lib/utils'
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

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-black text-maxpet-navy">Clientes</h1>
        <Link to="/clientes/novo">
          <Button className="bg-maxpet-blue hover:bg-maxpet-navy text-white w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Cliente
          </Button>
        </Link>
      </div>

      <div className="flex gap-2">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c: Client) => (
          <Link key={c.id} to={`/clientes/${c.id}`}>
            <Card className="hover:shadow-md transition-all border-0 shadow-sm group">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-maxpet-navy text-lg line-clamp-1 group-hover:text-maxpet-blue transition-colors flex-1">
                    {c.name}
                  </h3>
                  <Badge variant="outline" className="bg-gray-50 ml-2">
                    {c.segment}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
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
                <div className="pt-3 border-t flex justify-end">
                  <Link to={`/clientes/${c.id}/editar`} onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-maxpet-blue hover:text-blue-700 h-8"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            Nenhum cliente encontrado.
          </div>
        )}
      </div>
    </div>
  )
}
