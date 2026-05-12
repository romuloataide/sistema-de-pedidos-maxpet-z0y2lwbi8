import { useParams, useNavigate, Link } from 'react-router-dom'
import useMainStore, { Order } from '@/stores/main'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDocument, formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft, Edit, Trash2, MapPin, Phone, Mail } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function CustomerDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { clients, setClients, orders } = useMainStore()

  const { removeClient } = useMainStore()

  const client = clients.find((c: any) => c.id === id)
  const clientOrders = orders.filter((o: Order) => o.clientId === id)

  if (!client) return <div className="p-8 text-center">Cliente não encontrado.</div>

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      await removeClient(id as string)
      toast({ title: 'Excluído', description: 'Cliente removido com sucesso.' })
      navigate('/clientes')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="-ml-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" className="text-maxpet-blue">
            <Edit className="h-4 w-4 mr-2" /> Editar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" /> Excluir
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="h-2 bg-maxpet-blue"></div>
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8 border-b pb-6">
            <div>
              <h1 className="text-3xl font-black text-maxpet-navy mb-2">{client.name}</h1>
              <div className="flex gap-2 items-center">
                <Badge className="bg-maxpet-green">{client.segment}</Badge>
                <span className="text-sm text-gray-500 font-mono">
                  {formatDocument(client.document)}
                </span>
              </div>
            </div>
            {client.whatsapp && (
              <a
                href={`https://wa.me/55${client.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button className="bg-[#25D366] hover:bg-[#128C7E] text-white">
                  Chamar no WhatsApp
                </Button>
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 text-sm">
              <h3 className="font-bold text-gray-400 uppercase tracking-wider">Contato</h3>
              <p className="flex items-center gap-3">
                <Phone className="text-maxpet-blue w-5 h-5" /> {client.phone || '-'}
              </p>
              <p className="flex items-center gap-3">
                <Mail className="text-maxpet-blue w-5 h-5" /> {client.email || '-'}
              </p>
              <p className="font-medium mt-2">Responsável: {client.responsible || '-'}</p>
            </div>
            <div className="space-y-4 text-sm">
              <h3 className="font-bold text-gray-400 uppercase tracking-wider">Endereço</h3>
              <p className="flex items-start gap-3">
                <MapPin className="text-maxpet-green w-5 h-5 shrink-0" />{' '}
                <span>
                  {client.address}
                  <br />
                  {client.neighborhood}
                  <br />
                  {client.city} - {client.state}
                </span>
              </p>
            </div>
          </div>
          {client.notes && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
              <span className="font-bold">Observações:</span> {client.notes}
            </div>
          )}
        </CardContent>
      </Card>

      <h2 className="text-xl font-bold text-maxpet-navy mt-8 mb-4">
        Histórico de Pedidos ({clientOrders.length})
      </h2>
      <div className="space-y-3">
        {clientOrders.map((o: Order) => (
          <Link key={o.id} to={`/pedidos/${o.id}`}>
            <Card className="hover:shadow-md transition-shadow border-0 shadow-sm group">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold text-maxpet-navy group-hover:text-maxpet-blue transition-colors">
                    Pedido #{o.shortId || o.id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(o.createdAt)} • {o.items.length} itens
                  </p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <p className="font-black text-lg">{formatCurrency(o.total)}</p>
                  <Badge
                    variant="outline"
                    className={
                      o.status === 'Entregue' ? 'text-maxpet-green border-maxpet-green' : ''
                    }
                  >
                    {o.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {clientOrders.length === 0 && (
          <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border-0">
            Nenhum pedido registrado para este cliente.
          </div>
        )}
      </div>
    </div>
  )
}
