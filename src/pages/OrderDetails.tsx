import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useMainStore, { Order, OrderItem } from '@/stores/main'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { formatCurrency, formatDate, formatDocument } from '@/lib/utils'
import {
  ArrowLeft,
  Printer,
  Truck,
  Calendar,
  CreditCard,
  Box,
  MessageCircle,
  Edit,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function OrderDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const {
    orders,
    updateOrderStatus,
    editOrderItems,
    clients,
    products,
    settings,
    sellers,
    profile,
    loading,
  } = useMainStore()

  const [isEditingItems, setIsEditingItems] = useState(false)
  const [editingCart, setEditingCart] = useState<OrderItem[]>([])
  const [history, setHistory] = useState<{ status: string; date: string }[]>([])

  const order = orders.find((o: Order) => o.id === id)

  useEffect(() => {
    if (order) {
      supabase
        .from('orders')
        .select('history, created_at, status')
        .eq('id', order.id)
        .single()
        .then(({ data }) => {
          if (data?.history && Array.isArray(data.history) && data.history.length > 0) {
            setHistory(data.history)
          } else {
            setHistory([
              { status: data?.status || order.status, date: data?.created_at || order.createdAt },
            ])
          }
        })
    }
  }, [order?.id, order?.status])

  if (loading) return <div className="p-8 text-center">Carregando...</div>
  if (!order) return <div className="p-8 text-center">Pedido não encontrado.</div>

  const client = clients.find((c: any) => c.id === order.clientId)
  const seller = sellers.find((s: any) => s.id === order.sellerId)
  const isAdmin = profile?.role === 'admin'

  const handleStatusChange = async (newStatus: string) => {
    await updateOrderStatus(id as string, newStatus as any)
    toast({ title: 'Status Atualizado', description: `O pedido agora está: ${newStatus}` })
  }

  const handleWhatsApp = () => {
    if (!client?.whatsapp && !client?.phone)
      return toast({
        title: 'Erro',
        description: 'Cliente sem número cadastrado.',
        variant: 'destructive',
      })
    const phone = (client.whatsapp || client.phone).replace(/\D/g, '')
    const msg = `Olá ${client.name}! Seu pedido #${order.shortId} no valor de ${formatCurrency(order.total)} foi registrado com sucesso. Previsão de entrega: ${formatDate(order.deliveryDate)}.`
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const handleStartEdit = () => {
    setEditingCart(JSON.parse(JSON.stringify(order.items)))
    setIsEditingItems(true)
  }

  const updateEditCart = (productId: string, quantity: number, unitPrice: number) => {
    setEditingCart((prev) => {
      const existing = prev.find((i) => i.productId === productId)
      if (quantity <= 0) return prev.filter((i) => i.productId !== productId)
      if (existing)
        return prev.map((i) => (i.productId === productId ? { ...i, quantity, unitPrice } : i))
      return [...prev, { productId, quantity, unitPrice }]
    })
  }

  const handleSaveItems = async () => {
    const newTotal = editingCart.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0)
    await editOrderItems(order.id, editingCart, newTotal)
    setIsEditingItems(false)
    toast({ title: 'Itens Atualizados', description: 'Os itens do pedido foram salvos.' })
  }

  const TIMELINE_STEPS = [
    'Pedido registrado',
    'Em processamento',
    'Em produção',
    'Separado para entrega',
    'Entregue',
  ]

  return (
    <div className="animate-fade-in-up">
      <div className="print:hidden max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2">
              <ArrowLeft />
            </Button>
            <h1 className="text-2xl font-black text-maxpet-navy">Pedido #{order.shortId}</h1>
            <Badge className="bg-maxpet-green">{order.status}</Badge>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
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
            <Button
              className="bg-[#25D366] hover:bg-[#128C7E] text-white shrink-0"
              onClick={handleWhatsApp}
            >
              <MessageCircle className="w-4 h-4 sm:mr-2" />{' '}
              <span className="hidden sm:inline">WhatsApp</span>
            </Button>
            <Button className="bg-maxpet-navy text-white shrink-0" onClick={() => window.print()}>
              <Printer className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">PDF</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  <p className="font-bold text-lg text-maxpet-blue">
                    {formatDate(order.deliveryDate)}
                  </p>
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
              <div className="bg-[#EBF2F7] px-6 py-4 border-b flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Box className="text-maxpet-navy" />
                  <h2 className="font-bold text-maxpet-navy text-lg">Itens do Pedido</h2>
                </div>
                {isAdmin && (
                  <Dialog
                    open={isEditingItems}
                    onOpenChange={(o) => {
                      if (!o) setIsEditingItems(false)
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleStartEdit}
                        className="text-maxpet-blue border-maxpet-blue bg-white"
                      >
                        <Edit className="w-4 h-4 mr-2" /> Editar Itens
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Editar Itens do Pedido</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {products.map((p: any) => {
                          const item = editingCart.find((i) => i.productId === p.id)
                          const qty = item?.quantity || 0
                          return (
                            <div
                              key={p.id}
                              className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                            >
                              <div>
                                <p className="font-bold">
                                  {p.name} {p.size}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Min: {formatCurrency(p.unitPriceMin)} | Estoque: {p.stock}
                                </p>
                              </div>
                              <div className="flex gap-4 items-center">
                                <div>
                                  <p className="text-xs mb-1">Qtd</p>
                                  <Input
                                    type="number"
                                    className="w-20 h-9"
                                    value={qty || ''}
                                    placeholder="0"
                                    onChange={(e) =>
                                      updateEditCart(
                                        p.id,
                                        parseInt(e.target.value) || 0,
                                        item?.unitPrice || p.unitPriceMin,
                                      )
                                    }
                                  />
                                </div>
                                {qty > 0 && (
                                  <div>
                                    <p className="text-xs mb-1">R$ Unit</p>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      className="w-24 h-9"
                                      value={item?.unitPrice || ''}
                                      onChange={(e) =>
                                        updateEditCart(p.id, qty, parseFloat(e.target.value))
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex justify-between items-center border-t pt-4">
                        <span className="font-black text-xl text-maxpet-navy">
                          Total:{' '}
                          {formatCurrency(
                            editingCart.reduce((a, i) => a + i.quantity * i.unitPrice, 0),
                          )}
                        </span>
                        <Button onClick={handleSaveItems} className="bg-maxpet-green text-white">
                          Salvar Alterações
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
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

          <div className="md:col-span-1">
            <Card className="border-0 shadow-sm sticky top-6">
              <CardHeader className="py-4 border-b">
                <CardTitle className="text-lg text-maxpet-navy flex items-center gap-2">
                  <Clock className="w-5 h-5" /> Linha do Tempo
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {order.status === 'Cancelado' ? (
                  <div className="flex items-start gap-4">
                    <div className="w-4 h-4 rounded-full bg-red-500 ring-4 ring-red-100 shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-red-600">Cancelado</p>
                      {history.find((h) => h.status === 'Cancelado') && (
                        <p className="text-xs text-gray-500">
                          {formatDate(history.find((h) => h.status === 'Cancelado')!.date)}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="relative border-l-2 border-gray-200 ml-2 space-y-6">
                    {TIMELINE_STEPS.map((s, idx) => {
                      const histItem = history.find((h) => h.status === s)
                      const currentIndex = TIMELINE_STEPS.indexOf(order.status)
                      const isPast = history.some((h) => h.status === s) || currentIndex > idx
                      const isCurrent = order.status === s
                      return (
                        <div key={s} className="flex items-start relative group">
                          <div
                            className={`absolute -left-[9px] w-4 h-4 rounded-full transition-all duration-300 ${isCurrent ? 'bg-maxpet-blue ring-4 ring-blue-100 z-10' : isPast ? 'bg-maxpet-green z-10' : 'bg-gray-300'} `}
                          />
                          <div className="ml-6 -mt-1 w-full">
                            <p
                              className={`font-bold transition-colors ${isCurrent ? 'text-maxpet-blue' : isPast ? 'text-maxpet-navy' : 'text-gray-400'}`}
                            >
                              {s}{' '}
                              {isPast && !isCurrent && (
                                <CheckCircle2 className="inline w-3 h-3 text-maxpet-green ml-1" />
                              )}
                            </p>
                            {histItem && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {formatDate(histItem.date)}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* PRINT UI (unchanged except logo size) */}
      <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-10 text-black font-sans leading-relaxed">
        <div className="flex justify-between items-center mb-8 border-b-4 border-maxpet-navy pb-6">
          <div>
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Logo"
                className="h-24 max-w-[250px] object-contain"
              />
            ) : (
              <h1 className="text-4xl font-black italic tracking-tighter">
                Max<span className="text-maxpet-green">PET</span>
              </h1>
            )}
          </div>
          <div className="text-right text-sm">
            <p className="font-bold text-lg text-maxpet-navy">{settings?.companyName}</p>
            <p>CNPJ: {settings?.document}</p>
            <p>{settings?.address}</p>
            <p>
              {settings?.phone} | {settings?.email}
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
                  <td className="py-1 text-right font-bold text-maxpet-navy">#{order.shortId}</td>
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
