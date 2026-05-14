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
  Plus,
  Minus,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { DavPrintView } from '@/components/DavPrintView'
import { defaultDavConfig } from '@/components/DavSettings'

const DAV_MODELS = {
  personalizado: null, // Resolvido dinamicamente
  simples: {
    ...defaultDavConfig,
    activeBlocks: {
      ...defaultDavConfig.activeBlocks,
      commercial: false,
      totals: true,
      observations: true,
    },
    columns: { code: true, description: true, quantity: true, unitPrice: true, total: true },
  },
  completo: defaultDavConfig,
  fiscal: {
    ...defaultDavConfig,
    columns: { ...defaultDavConfig.columns, ipi: true, icms: true, ncm: true },
  },
  minimalista: {
    ...defaultDavConfig,
    activeBlocks: {
      header: true,
      client: true,
      products: true,
      totals: true,
      commercial: false,
      delivery: false,
      observations: false,
    },
  },
}

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
  const [davConfig, setDavConfig] = useState(defaultDavConfig)
  const [davData, setDavData] = useState<any>(null)
  const [itemsDavData, setItemsDavData] = useState<any>({})
  const [selectedModel, setSelectedModel] = useState('personalizado')

  const order = orders.find((o: Order) => o.id === id)

  useEffect(() => {
    supabase
      .from('company_settings')
      .select('dav_config')
      .single()
      .then(({ data }) => {
        if (data?.dav_config) setDavConfig({ ...defaultDavConfig, ...(data.dav_config as any) })
      })
    if (order) {
      supabase
        .from('orders')
        .select('dav_data')
        .eq('id', order.id)
        .single()
        .then(({ data }) => {
          if (data?.dav_data) setDavData(data.dav_data)
        })
      supabase
        .from('order_items')
        .select('id, dav_data')
        .eq('order_id', order.id)
        .then(({ data }) => {
          if (data) {
            const m = {} as any
            data.forEach((x) => {
              m[x.id] = x.dav_data
            })
            setItemsDavData(m)
          }
        })
    }
  }, [order?.id])

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
  const isAdmin = true // removed auth requirement

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
      const p = products.find((x: any) => x.id === productId)
      if (quantity <= 0) return prev.filter((i) => i.productId !== productId)
      if (existing)
        return prev.map((i) =>
          i.productId === productId
            ? { ...i, quantity, unitPrice, unit_cost: (p as any)?.unit_cost || 0 }
            : i,
        )
      return [
        ...prev,
        { productId, quantity, unitPrice, unit_cost: (p as any)?.unit_cost || 0 } as any,
      ]
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

            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-36 bg-white">
                <SelectValue placeholder="Modelo DAV" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personalizado">Personalizado</SelectItem>
                <SelectItem value="simples">Modelo Simples</SelectItem>
                <SelectItem value="completo">Modelo Completo</SelectItem>
                <SelectItem value="fiscal">Modelo Fiscal</SelectItem>
                <SelectItem value="minimalista">Minimalista</SelectItem>
              </SelectContent>
            </Select>

            <Button
              className="bg-maxpet-navy text-white shrink-0 shadow-md"
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4 sm:mr-2" />{' '}
              <span className="hidden sm:inline">Imprimir DAV</span>
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
                        className="text-maxpet-blue border-maxpet-blue bg-white shadow-sm"
                      >
                        <Edit className="w-4 h-4 mr-2" /> Editar Itens do Pedido
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col bg-white">
                      <DialogHeader>
                        <DialogTitle>Editar Itens do Pedido</DialogTitle>
                      </DialogHeader>
                      <div className="py-2">
                        <Input
                          placeholder="Buscar produto por nome ou código para adicionar..."
                          className="w-full bg-gray-50 border-gray-300"
                          onChange={(e) => {
                            const val = e.target.value.toLowerCase()
                            const els = document.querySelectorAll('.edit-product-item')
                            els.forEach((el) => {
                              const text = el.getAttribute('data-search') || ''
                              if (val.length === 0) {
                                if (el.getAttribute('data-in-cart') === 'true') {
                                  ;(el as HTMLElement).style.display = 'flex'
                                } else {
                                  ;(el as HTMLElement).style.display = 'none'
                                }
                              } else {
                                if (text.includes(val)) {
                                  ;(el as HTMLElement).style.display = 'flex'
                                } else {
                                  ;(el as HTMLElement).style.display = 'none'
                                }
                              }
                            })
                          }}
                        />
                      </div>
                      <div className="space-y-4 py-4 flex-1 overflow-y-auto">
                        {products.map((p: any) => {
                          const item = editingCart.find((i) => i.productId === p.id)
                          const qty = item?.quantity || 0
                          const inCart = qty > 0
                          return (
                            <div
                              key={p.id}
                              className="edit-product-item flex flex-col p-4 border border-gray-200 rounded-xl bg-white shadow-sm transition-all"
                              data-search={`${p.name.toLowerCase()} ${p.code}`}
                              data-in-cart={inCart.toString()}
                              style={{ display: inCart ? 'flex' : 'none' }}
                            >
                              <div className="flex items-start justify-between w-full">
                                <div>
                                  <p className="font-bold text-maxpet-navy text-lg leading-tight">
                                    <span className="text-gray-400 font-normal mr-1">
                                      #{String(p?.code || '').padStart(4, '0')}
                                    </span>
                                    {p.name} {p.size}
                                  </p>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Ref: {formatCurrency(p.unitPriceMin)} a{' '}
                                    {formatCurrency(p.unitPriceMilheiro)}/un | Estoque: {p.stock}
                                  </p>
                                </div>
                                <div className="flex gap-4 items-center">
                                  <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden shadow-sm">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-10 w-10 text-maxpet-navy hover:bg-gray-100 rounded-none border-r border-gray-200"
                                      onClick={() => {
                                        const step = qty > 100 ? 100 : 25
                                        const newQty = Math.max(0, qty - step)
                                        updateEditCart(
                                          p.id,
                                          newQty < p.minQuantity && newQty > 0 ? 0 : newQty,
                                          item?.unitPrice || p.unitPriceMin,
                                        )
                                      }}
                                    >
                                      <Minus size={16} />
                                    </Button>
                                    <Input
                                      type="number"
                                      className="w-20 h-10 border-0 text-center font-black bg-transparent focus-visible:ring-0 text-lg"
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
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-10 w-10 text-maxpet-navy hover:bg-gray-100 rounded-none border-l border-gray-200"
                                      onClick={() => {
                                        const step = qty >= 100 ? 100 : 25
                                        const newQty = qty === 0 ? p.minQuantity : qty + step
                                        updateEditCart(
                                          p.id,
                                          newQty,
                                          item?.unitPrice || p.unitPriceMin,
                                        )
                                      }}
                                    >
                                      <Plus size={16} />
                                    </Button>
                                  </div>
                                  {qty > 0 && (
                                    <div>
                                      <p className="text-xs mb-1 text-gray-500 font-bold uppercase">
                                        R$ Unidade (Final)
                                      </p>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        className="w-28 h-10 font-bold text-maxpet-blue bg-white border-gray-300 shadow-sm"
                                        value={item?.unitPrice || ''}
                                        onChange={(e) =>
                                          updateEditCart(p.id, qty, parseFloat(e.target.value) || 0)
                                        }
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                              {qty > 0 && (
                                <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-3 gap-3">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className={`h-auto py-2 whitespace-normal leading-tight transition-all border-2 ${item?.unitPrice === p.unitPriceMin ? 'bg-maxpet-blue border-maxpet-blue text-white shadow-md' : 'bg-white border-gray-200 hover:border-maxpet-blue hover:text-maxpet-blue text-gray-600'}`}
                                    onClick={() => updateEditCart(p.id, qty, p.unitPriceMin)}
                                  >
                                    <span className="font-bold block mb-1">Unidade</span>
                                    {formatCurrency(p.unitPriceMin)}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className={`h-auto py-2 whitespace-normal leading-tight transition-all border-2 ${item?.unitPrice === p.unitPriceCento ? 'bg-maxpet-blue border-maxpet-blue text-white shadow-md' : 'bg-white border-gray-200 hover:border-maxpet-blue hover:text-maxpet-blue text-gray-600'}`}
                                    onClick={() => updateEditCart(p.id, qty, p.unitPriceCento)}
                                  >
                                    <span className="font-bold block mb-1">Cento</span>
                                    {formatCurrency(p.unitPriceCento)}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className={`h-auto py-2 whitespace-normal leading-tight transition-all border-2 ${item?.unitPrice === p.unitPriceMilheiro ? 'bg-maxpet-blue border-maxpet-blue text-white shadow-md' : 'bg-white border-gray-200 hover:border-maxpet-blue hover:text-maxpet-blue text-gray-600'}`}
                                    onClick={() => updateEditCart(p.id, qty, p.unitPriceMilheiro)}
                                  >
                                    <span className="font-bold block mb-1">Milheiro</span>
                                    {formatCurrency(p.unitPriceMilheiro)}
                                  </Button>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex justify-between items-center border-t pt-4 mt-auto">
                        <span className="font-black text-2xl text-maxpet-navy">
                          Total:{' '}
                          <span className="text-maxpet-green">
                            {formatCurrency(
                              editingCart.reduce((a, i) => a + i.quantity * i.unitPrice, 0),
                            )}
                          </span>
                        </span>
                        <Button
                          onClick={handleSaveItems}
                          className="bg-maxpet-green hover:bg-green-600 text-white h-12 px-8 text-lg shadow-md font-bold"
                        >
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
                            <span className="text-gray-400 font-normal mr-1">
                              #{String(p?.code || '').padStart(4, '0')}
                            </span>
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
                    {isAdmin && (
                      <tr className="bg-gray-800 border-t border-gray-700">
                        <td colSpan={3} className="p-4 text-right text-sm text-gray-300">
                          Lucro Estimado do Pedido
                        </td>
                        <td className="p-4 text-right font-bold text-maxpet-green">
                          {formatCurrency(
                            order.total -
                              order.items.reduce((acc: number, item: any) => {
                                const p = products.find((x: any) => x.id === item.productId)
                                const cost = item.unit_cost || (p ? p.unit_cost : 0) || 0
                                return acc + cost * item.quantity
                              }, 0),
                          )}
                        </td>
                      </tr>
                    )}
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

      {/* PRINT UI (DAV Automático) */}
      <style
        dangerouslySetInnerHTML={{
          __html:
            '@media print { @page { size: auto; margin: 0; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; margin: 0; padding: 0; } }',
        }}
      />
      <DavPrintView
        order={order}
        client={client}
        settings={settings}
        seller={seller}
        products={products}
        davConfig={(DAV_MODELS as any)[selectedModel] || davConfig}
        davData={davData}
        itemsDavData={itemsDavData}
      />
    </div>
  )
}
