import { useState } from 'react'
import { Link } from 'react-router-dom'
import useMainStore, { Order } from '@/stores/main'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Search, PlusCircle, Calendar, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Orders() {
  const { orders, clients, removeOrder, profile } = useMainStore()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const isAdmin = profile?.role === 'admin'

  const filtered = orders
    .filter((o: Order) => {
      const client = clients.find((c: any) => c.id === o.clientId)
      const matchesSearch =
        client?.name.toLowerCase().includes(search.toLowerCase()) || o.shortId.includes(search)
      const matchesStatus = statusFilter === 'Todos' || o.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const getStatusColor = (status: string) => {
    if (status === 'Entregue') return 'bg-maxpet-green text-white'
    if (status === 'Em produção') return 'bg-yellow-500 text-white'
    if (status === 'Separado para entrega') return 'bg-orange-500 text-white'
    if (status === 'Cancelado') return 'bg-red-500 text-white'
    return 'bg-maxpet-blue text-white'
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault() // prevent Link navigation
    if (window.confirm('Tem certeza que deseja excluir este pedido? O estoque será devolvido.')) {
      await removeOrder(id)
      toast({ title: 'Pedido Excluído' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-black text-maxpet-navy">Acompanhamento de Pedidos</h1>
        <Link to="/pedidos/novo">
          <Button className="bg-maxpet-green hover:bg-green-600 text-white w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Pedido
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Buscar por cliente ou ID..."
            className="pl-10 h-12 bg-white border-0 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-12 bg-white border-0 shadow-sm">
              <SelectValue placeholder="Filtrar por Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos os Status</SelectItem>
              <SelectItem value="Pedido registrado">Pedido registrado</SelectItem>
              <SelectItem value="Em processamento">Em processamento</SelectItem>
              <SelectItem value="Em produção">Em produção</SelectItem>
              <SelectItem value="Separado para entrega">Separado para entrega</SelectItem>
              <SelectItem value="Entregue">Entregue</SelectItem>
              <SelectItem value="Cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((o: Order) => {
          const client = clients.find((c: any) => c.id === o.clientId)
          return (
            <Link key={o.id} to={`/pedidos/${o.id}`} className="block relative group">
              <Card className="hover:shadow-md transition-shadow border-0 shadow-sm">
                <CardContent className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-maxpet-navy text-lg">
                        {client?.name || 'Desconhecido'}
                      </h3>
                      <span className="text-sm font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        #{o.shortId}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 flex flex-wrap gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> Reg: {formatDate(o.createdAt)}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-maxpet-blue">
                        Entrega: {formatDate(o.deliveryDate)}
                      </span>
                      <span>Itens: {o.items.reduce((acc, i) => acc + i.quantity, 0)} un</span>
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
                    <p className="font-black text-xl text-maxpet-navy mb-2">
                      {formatCurrency(o.total)}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(o.status)}>{o.status}</Badge>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                          onClick={(e) => handleDelete(e, o.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
        {filtered.length === 0 && (
          <div className="p-12 text-center text-gray-500 bg-white rounded-xl shadow-sm border-0">
            Nenhum pedido encontrado.
          </div>
        )}
      </div>
    </div>
  )
}
