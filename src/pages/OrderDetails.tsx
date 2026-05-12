import { useParams, useNavigate } from 'react-router-dom'
import useMainStore, { Order } from '@/stores/main'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency, formatDate, formatDocument } from '@/lib/utils'
import { ArrowLeft, Printer, Truck, Calendar, CreditCard, Box } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function OrderDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { orders, updateOrderStatus, clients, products, settings, sellers, loading } =
    useMainStore()

  const order = orders.find((o: Order) => o.id === id)

  if (loading) return <div className="p-8 text-center">Carregando...</div>
  if (!order) return <div className="p-8 text-center">Pedido não encontrado.</div>

  const client = clients.find((c: any) => c.id === order.clientId)
  const seller = sellers.find((s: any) => s.id === order.sellerId)

  const handleStatusChange = async (newStatus: string) => {
    await updateOrderStatus(id as string, newStatus as any)
    toast({ title: 'Status Atualizado', description: `O pedido agora está: ${newStatus}` })
  }

  return (
    <div className="animate-fade-in-up">
      {/* Screen UI */}
      <div className="print:hidden max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2">
              <ArrowLeft />
            </Button>
            <h1 className="text-2xl font-black text-maxpet-navy">
              Pedido #{order.shortId || order.id.slice(0, 8)}
            </h1>
            <Badge className="bg-maxpet-green">{order.status}</Badge>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={order.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full sm:w-48 bg-white border-maxpet-blue text-maxpet-blue font-bold">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pedido registrado">Pedido registrado</SelectItem>
                <SelectItem value="Em processamento">Em processamento</SelectItem>
                <SelectItem value="Em produção">Em produção</SelectItem>
                <SelectItem value="Separado para entrega">Separado p/ entrega</SelectItem>
                <SelectItem value="Entregue">Entregue</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-maxpet-navy text-white shrink-0" onClick={() => window.print()}>
              <Printer className="w-4 h-4 sm:mr-2" />{' '}
              <span className="hidden sm:inline">Gerar PDF</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="py-4">
              <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
                <Calendar size={16} /> Data do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-bold text-lg">{formatDate(order.createdAt)}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader className="py-4">
              <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
                <Truck size={16} /> Previsão Entrega
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-bold text-lg text-maxpet-blue">{formatDate(order.deliveryDate)}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader className="py-4">
              <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
                <CreditCard size={16} /> Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-bold text-lg">{order.paymentMethod}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="bg-[#EBF2F7] px-6 py-4 border-b flex items-center gap-3">
            <Box className="text-maxpet-navy" />
            <h2 className="font-bold text-maxpet-navy text-lg">Itens do Pedido</h2>
          </div>
          <div className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b">
                <tr>
                  <th className="p-4 text-left font-medium">Produto</th>
                  <th className="p-4 text-right font-medium">Qtd</th>
                  <th className="p-4 text-right font-medium">V. Unit</th>
                  <th className="p-4 text-right font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {order.items.map((item: any, i: number) => {
                  const p = products.find((x: any) => x.id === item.productId)
                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="p-4 font-semibold text-maxpet-navy">
                        {p?.name} {p?.size}
                      </td>
                      <td className="p-4 text-right">{item.quantity} un</td>
                      <td className="p-4 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="p-4 text-right font-bold">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot className="bg-[#001F3F] text-white">
                <tr>
                  <td colSpan={3} className="p-4 text-right text-lg">
                    Total do Pedido
                  </td>
                  <td className="p-4 text-right font-black text-2xl text-maxpet-green">
                    {formatCurrency(order.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        {order.notes && (
          <Card className="border-0 shadow-sm bg-yellow-50">
            <CardContent className="p-4">
              <p className="font-bold text-yellow-800 mb-1">Observações do Cliente:</p>
              <p className="text-sm text-yellow-900">{order.notes}</p>
            </CardContent>
          </Card>
        )}
        {order.internalNotes && (
          <Card className="border-0 shadow-sm bg-gray-100">
            <CardContent className="p-4">
              <p className="font-bold text-gray-700 mb-1">Notas Internas:</p>
              <p className="text-sm text-gray-600">{order.internalNotes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* PRINT UI (A4 Document Format) */}
      <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-10 text-black font-sans leading-relaxed">
        <div className="flex justify-between items-center mb-8 border-b-4 border-maxpet-navy pb-6">
          <div>
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="h-16 object-contain" />
            ) : (
              <>
                <h1 className="text-4xl font-black italic tracking-tighter">
                  Max<span className="text-maxpet-green">PET</span>
                </h1>
                <p className="text-sm font-bold text-gray-500 tracking-widest mt-1">EMBALAGENS</p>
              </>
            )}
          </div>
          <div className="text-right text-sm">
            <p className="font-bold text-lg text-maxpet-navy">{settings.companyName}</p>
            <p>CNPJ: {settings.document}</p>
            <p>{settings.address}</p>
            <p>
              {settings.phone} | {settings.email}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-start mb-8">
          <div className="w-2/3 pr-8">
            <h2 className="bg-gray-100 font-bold px-3 py-1 mb-3 uppercase text-xs tracking-wider border-l-4 border-maxpet-blue">
              Dados do Cliente
            </h2>
            <p className="font-bold text-lg mb-1">{client?.name}</p>
            <p>CNPJ/CPF: {formatDocument(client?.document || '')}</p>
            <p>
              Contato: {client?.responsible} - {client?.phone}
            </p>
            <p>
              Endereço: {client?.address}, {client?.neighborhood}, {client?.city}-{client?.state}
            </p>
          </div>
          <div className="w-1/3">
            <h2 className="bg-gray-100 font-bold px-3 py-1 mb-3 uppercase text-xs tracking-wider border-l-4 border-maxpet-green">
              Detalhes do Pedido
            </h2>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-1 font-semibold">Nº Pedido:</td>
                  <td className="py-1 text-right font-bold text-maxpet-navy">
                    #{order.shortId || order.id.slice(0, 8)}
                  </td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold">Emissão:</td>
                  <td className="py-1 text-right">{formatDate(order.createdAt)}</td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold">Previsão:</td>
                  <td className="py-1 text-right">{formatDate(order.deliveryDate)}</td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold">Pagamento:</td>
                  <td className="py-1 text-right">{order.paymentMethod}</td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold">Vendedor:</td>
                  <td className="py-1 text-right">{seller?.name || 'Não informado'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <h2 className="bg-gray-100 font-bold px-3 py-1 mb-3 uppercase text-xs tracking-wider border-l-4 border-maxpet-navy">
          Itens
        </h2>
        <table className="w-full mb-8 border-collapse">
          <thead>
            <tr className="border-b-2 border-maxpet-navy">
              <th className="py-2 text-left">Produto</th>
              <th className="py-2 text-center">Quantidade</th>
              <th className="py-2 text-right">V. Unitário</th>
              <th className="py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {order.items.map((item: any, i: number) => {
              const p = products.find((x: any) => x.id === item.productId)
              return (
                <tr key={i}>
                  <td className="py-3 font-semibold">
                    {p?.name} {p?.size}
                  </td>
                  <td className="py-3 text-center">{item.quantity} un</td>
                  <td className="py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-3 text-right font-bold">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="flex justify-end mb-12">
          <div className="w-64 bg-gray-50 p-4 rounded-lg border-2 border-maxpet-navy text-center">
            <p className="text-sm font-bold uppercase mb-1 text-gray-500">Total a Pagar</p>
            <p className="text-3xl font-black text-maxpet-navy">{formatCurrency(order.total)}</p>
          </div>
        </div>

        {order.notes && (
          <div className="mb-12">
            <p className="font-bold text-sm">Observações Comerciais:</p>
            <p className="text-sm italic">{order.notes}</p>
          </div>
        )}

        <div className="mt-24 flex justify-around text-center pt-8">
          <div className="w-64 border-t border-gray-400 pt-2">
            <p className="font-bold text-sm">{client?.name}</p>
            <p className="text-xs text-gray-500">Assinatura do Cliente</p>
          </div>
          <div className="w-64 border-t border-gray-400 pt-2">
            <p className="font-bold text-sm">{seller?.name || settings?.companyName}</p>
            <p className="text-xs text-gray-500">MaxPET Embalagens</p>
          </div>
        </div>
      </div>
    </div>
  )
}
