import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useMainStore, { Client, Product, OrderItem } from '@/stores/main'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency, formatDocument } from '@/lib/utils'
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Check,
  Plus,
  Minus,
  CheckCircle,
  PlusCircle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase/client'

export default function NewOrder() {
  const { clients, setClients, products, addOrder, sellers, profile } = useMainStore()
  const isAdmin = profile?.role === 'admin'
  const navigate = useNavigate()
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [searchClient, setSearchClient] = useState('')
  const [selectedClient, setSelectedClient] = useState<string>('')
  const [cart, setCart] = useState<OrderItem[]>([])
  const [details, setDetails] = useState({
    sellerId: '',
    deliveryDate: '',
    paymentMethod: '',
    notes: '',
    internalNotes: '',
  })

  const [isNewClientOpen, setIsNewClientOpen] = useState(false)
  const [newClientData, setNewClientData] = useState<Partial<any>>({
    name: '',
    document: '',
    responsible: '',
    segment: '',
    category: 'Normal',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    neighborhood: '',
    city: 'São Luís',
    state: 'MA',
    notes: '',
  })

  const [filterNeighborhood, setFilterNeighborhood] = useState('')
  const [filterSegment, setFilterSegment] = useState('')
  const uniqueNeighborhoods = Array.from(
    new Set(clients.map((c: any) => c.neighborhood).filter(Boolean)),
  ) as string[]

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClientData.name || !newClientData.document) {
      return toast({
        title: 'Erro',
        description: 'Nome e Documento são obrigatórios',
        variant: 'destructive',
      })
    }
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([newClientData])
        .select()
        .single()
      if (error) throw error
      if (setClients) setClients([...clients, data as Client])
      setSelectedClient(data.id)
      setIsNewClientOpen(false)
      toast({ title: 'Sucesso', description: 'Cliente cadastrado com sucesso!' })
      setNewClientData({
        name: '',
        document: '',
        responsible: '',
        segment: '',
        category: 'Normal',
        phone: '',
        whatsapp: '',
        email: '',
        address: '',
        neighborhood: '',
        city: 'São Luís',
        state: 'MA',
        notes: '',
      })
    } catch (err: any) {
      toast({ title: 'Erro ao cadastrar', description: err.message, variant: 'destructive' })
    }
  }

  const filteredClients = clients.filter((c: any) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchClient.toLowerCase()) || c.document.includes(searchClient)
    const matchesNeighborhood =
      !filterNeighborhood ||
      filterNeighborhood === 'all' ||
      (c.neighborhood && c.neighborhood.toLowerCase().includes(filterNeighborhood.toLowerCase()))
    const matchesSegment =
      !filterSegment || (c.segment && c.segment.toLowerCase() === filterSegment.toLowerCase())
    return matchesSearch && matchesNeighborhood && matchesSegment
  })

  const updateCart = (productId: string, quantity: number, forcePrice?: number) => {
    const p = products.find((x: Product) => x.id === productId)!

    let finalQty = quantity
    if (quantity > 0 && quantity < p.minQuantity) {
      finalQty = p.minQuantity
    }

    let suggestedPrice = forcePrice ?? p.unitPriceMin
    if (!forcePrice && finalQty >= 1000) suggestedPrice = p.unitPriceMilheiro
    else if (!forcePrice && finalQty >= 100) suggestedPrice = p.unitPriceCento

    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId)
      if (finalQty <= 0) return prev.filter((i) => i.productId !== productId)
      if (existing)
        return prev.map((i) =>
          i.productId === productId
            ? {
                ...i,
                quantity: finalQty,
                unitPrice: forcePrice ?? i.unitPrice,
                unit_cost: (p as any).unit_cost || 0,
              }
            : i,
        )
      return [
        ...prev,
        {
          productId,
          quantity: finalQty,
          unitPrice: suggestedPrice,
          unit_cost: (p as any).unit_cost || 0,
        } as any,
      ]
    })
  }

  const subtotal = cart.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0)

  const [submitting, setSubmitting] = useState(false)

  const handleNextStep = () => {
    if (step === 2) {
      const invalidItems = cart.filter((item) => {
        const p = products.find((x: Product) => x.id === item.productId)
        return p && item.quantity < p.minQuantity
      })
      if (invalidItems.length > 0) {
        return toast({
          title: 'Atenção',
          description:
            'Alguns itens estão abaixo da quantidade mínima. Ajuste as quantidades para prosseguir.',
          variant: 'destructive',
        })
      }
    }
    setStep((s) => Math.min(3, s + 1))
  }

  const handleSubmit = async () => {
    if (!details.deliveryDate || !details.paymentMethod)
      return toast({
        title: 'Erro',
        description: 'Preencha os dados de entrega.',
        variant: 'destructive',
      })
    setSubmitting(true)
    const newOrderPayload = {
      clientId: selectedClient,
      items: cart,
      status: 'Pedido registrado' as const,
      total: subtotal,
      ...details,
    }
    try {
      const created = await addOrder(newOrderPayload)
      toast({ title: 'Sucesso', description: `Pedido #${created.shortId} salvo!` })
      navigate(`/pedidos/${created.id}`)
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-maxpet-navy">Novo Pedido</h1>
        <div className="flex gap-2">
          <div className={`w-8 h-2 rounded-full ${step >= 1 ? 'bg-maxpet-blue' : 'bg-gray-200'}`} />
          <div className={`w-8 h-2 rounded-full ${step >= 2 ? 'bg-maxpet-blue' : 'bg-gray-200'}`} />
          <div
            className={`w-8 h-2 rounded-full ${step >= 3 ? 'bg-maxpet-green' : 'bg-gray-200'}`}
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div
          className="flex w-[300%] h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${(step - 1) * 33.333}%)` }}
        >
          {/* Step 1: Cliente */}
          <div className="w-1/3 h-full overflow-y-auto px-1 pb-20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">1. Selecione o Cliente</h2>
              <Dialog open={isNewClientOpen} onOpenChange={setIsNewClientOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-maxpet-blue text-white h-8">
                    <PlusCircle className="w-4 h-4 mr-1" /> Novo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Cadastro Rápido de Cliente</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateClient} className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto px-1 pb-2">
                      <div className="space-y-2">
                        <Label>Razão Social / Nome *</Label>
                        <Input
                          required
                          value={newClientData.name}
                          onChange={(e) =>
                            setNewClientData({ ...newClientData, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CNPJ / CPF *</Label>
                        <Input
                          required
                          value={newClientData.document}
                          onChange={(e) =>
                            setNewClientData({ ...newClientData, document: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Pessoa Responsável</Label>
                        <Input
                          value={newClientData.responsible}
                          onChange={(e) =>
                            setNewClientData({ ...newClientData, responsible: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Segmento</Label>
                        <Input
                          placeholder="Ex: Mercadinho, Distribuidora..."
                          value={newClientData.segment || ''}
                          onChange={(e) =>
                            setNewClientData({ ...newClientData, segment: e.target.value })
                          }
                          list="segment-options"
                        />
                        <datalist id="segment-options">
                          <option value="Mercadinho" />
                          <option value="Depósito de bebidas" />
                          <option value="Restaurante" />
                          <option value="Distribuidora" />
                        </datalist>
                      </div>
                      <div className="space-y-2">
                        <Label>Categoria</Label>
                        <Select
                          value={newClientData.category}
                          onValueChange={(v) => setNewClientData({ ...newClientData, category: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Normal">Normal</SelectItem>
                            <SelectItem value="Revenda">Revenda</SelectItem>
                            <SelectItem value="VIP">VIP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Telefone</Label>
                        <Input
                          value={newClientData.phone}
                          onChange={(e) =>
                            setNewClientData({ ...newClientData, phone: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>WhatsApp</Label>
                        <Input
                          value={newClientData.whatsapp}
                          onChange={(e) =>
                            setNewClientData({ ...newClientData, whatsapp: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label>Endereço Completo</Label>
                        <Input
                          value={newClientData.address}
                          onChange={(e) =>
                            setNewClientData({ ...newClientData, address: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Bairro</Label>
                        <Input
                          value={newClientData.neighborhood}
                          onChange={(e) =>
                            setNewClientData({ ...newClientData, neighborhood: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2 grid grid-cols-2 gap-2">
                        <div>
                          <Label>Cidade</Label>
                          <Input
                            value={newClientData.city}
                            onChange={(e) =>
                              setNewClientData({ ...newClientData, city: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label>UF</Label>
                          <Input
                            value={newClientData.state}
                            onChange={(e) =>
                              setNewClientData({ ...newClientData, state: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 text-lg bg-maxpet-green hover:bg-green-600 text-white shadow-md"
                    >
                      Salvar e Selecionar
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Buscar cliente..."
                  className="pl-10 h-12 bg-white"
                  value={searchClient}
                  onChange={(e) => setSearchClient(e.target.value)}
                />
              </div>
              <div className="w-1/3 min-w-[120px]">
                <Select value={filterNeighborhood} onValueChange={setFilterNeighborhood}>
                  <SelectTrigger className="h-12 bg-white">
                    <SelectValue placeholder="Bairro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Bairros</SelectItem>
                    {uniqueNeighborhoods.map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-3">
              {filteredClients.map((c: Client) => (
                <Card
                  key={c.id}
                  className={`cursor-pointer transition-all border-2 ${selectedClient === c.id ? 'border-maxpet-blue bg-[#F0F7FF]' : 'border-transparent hover:border-gray-200'}`}
                  onClick={() => setSelectedClient(c.id)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-maxpet-navy">{c.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatDocument(c.document)} - {c.segment}
                      </p>
                    </div>
                    {selectedClient === c.id && (
                      <CheckCircle className="text-maxpet-blue h-6 w-6" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Step 2: Produtos */}
          <div className="w-1/3 h-full overflow-y-auto px-1 pb-20">
            <h2 className="text-xl font-bold mb-4">2. Produtos</h2>
            <div className="space-y-4">
              {products.map((p: Product) => {
                const item = cart.find((i) => i.productId === p.id)
                const qty = item?.quantity || 0
                return (
                  <Card key={p.id} className="border-0 shadow-sm overflow-hidden">
                    <div className="flex">
                      <div className="w-24 bg-[#EBF2F7] flex items-center justify-center p-2">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="h-20 object-contain mix-blend-multiply"
                        />
                      </div>
                      <CardContent className="p-4 flex-1">
                        <h3 className="font-bold text-maxpet-navy">
                          {p.name} {p.size}
                        </h3>
                        <p className="text-xs text-gray-500 mb-1">
                          Ref: {formatCurrency(p.unitPriceMin)} a{' '}
                          {formatCurrency(p.unitPriceMilheiro)}/un
                        </p>
                        <p className="text-xs text-maxpet-blue font-semibold mb-3">
                          Qtd. Mínima: {p.minQuantity} un
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border rounded-lg bg-gray-50 overflow-hidden">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 rounded-none text-maxpet-navy"
                              onClick={() => {
                                const step = qty > 100 ? 100 : 25
                                const newQty = Math.max(0, qty - step)
                                updateCart(p.id, newQty < p.minQuantity && newQty > 0 ? 0 : newQty)
                              }}
                            >
                              <Minus size={16} />
                            </Button>
                            <Input
                              type="number"
                              className="h-10 w-20 border-0 text-center font-bold bg-transparent focus-visible:ring-0"
                              value={qty || ''}
                              placeholder="0"
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0
                                updateCart(p.id, val)
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 rounded-none text-maxpet-navy"
                              onClick={() => {
                                const step = qty >= 100 ? 100 : 25
                                const newQty = qty === 0 ? p.minQuantity : qty + step
                                updateCart(p.id, newQty)
                              }}
                            >
                              <Plus size={16} />
                            </Button>
                          </div>
                          {qty > 0 && (
                            <div className="flex-1">
                              <Label className="text-xs text-gray-500">R$ Unidade</Label>
                              <Input
                                type="number"
                                step="0.01"
                                className="h-10 font-bold text-maxpet-blue"
                                value={item?.unitPrice || ''}
                                onChange={(e) => updateCart(p.id, qty, parseFloat(e.target.value))}
                              />
                            </div>
                          )}
                        </div>
                        {qty > 0 && (
                          <p className="text-right text-sm font-black mt-2">
                            Sub: {formatCurrency(qty * (item?.unitPrice || 0))}
                          </p>
                        )}
                      </CardContent>
                    </div>
                  </Card>
                )
              })}
            </div>
            <div className="mt-6 p-4 bg-maxpet-navy text-white rounded-xl flex justify-between items-center shadow-lg">
              <span className="font-bold">Total do Pedido:</span>
              <span className="text-2xl font-black">{formatCurrency(subtotal)}</span>
            </div>
          </div>

          {/* Step 3: Finalização */}
          <div className="w-1/3 h-full overflow-y-auto px-1 pb-20">
            <h2 className="text-xl font-bold mb-4">3. Detalhes Finais</h2>
            <Card className="border-0 shadow-sm mb-6">
              <CardContent className="p-4 bg-maxpet-blue text-white rounded-xl flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Total do Pedido:</span>
                  <span className="text-2xl font-black">{formatCurrency(subtotal)}</span>
                </div>
                {isAdmin && (
                  <div className="flex justify-between items-center pt-2 border-t border-white/20 text-sm">
                    <span className="opacity-80">Lucro Estimado:</span>
                    <span className="font-bold text-maxpet-green drop-shadow">
                      {formatCurrency(
                        subtotal -
                          cart.reduce((acc, item) => {
                            const p = products.find((x) => x.id === item.productId)
                            const cost = (item as any).unit_cost || (p as any)?.unit_cost || 0
                            return acc + cost * item.quantity
                          }, 0),
                      )}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
            <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm">
              <div className="space-y-2">
                <Label>Vendedor</Label>
                <Select
                  value={details.sellerId}
                  onValueChange={(v) => setDetails({ ...details, sellerId: v })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Selecione o vendedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {sellers.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data de Entrega Acordada</Label>
                <Input
                  type="date"
                  className="h-12"
                  value={details.deliveryDate}
                  onChange={(e) => setDetails({ ...details, deliveryDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <Select
                  value={details.paymentMethod}
                  onValueChange={(v) => setDetails({ ...details, paymentMethod: v })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pix">Pix</SelectItem>
                    <SelectItem value="Boleto 15d">Boleto 15 dias</SelectItem>
                    <SelectItem value="Boleto 30d">Boleto 30 dias</SelectItem>
                    <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Observações na Nota (Cliente vê)</Label>
                <Textarea
                  rows={3}
                  value={details.notes}
                  onChange={(e) => setDetails({ ...details, notes: e.target.value })}
                  placeholder="Ex: Entregar de manhã"
                />
              </div>
              <div className="space-y-2">
                <Label>Notas Internas (MaxPET)</Label>
                <Textarea
                  rows={2}
                  value={details.internalNotes}
                  onChange={(e) => setDetails({ ...details, internalNotes: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed md:static bottom-[4.5rem] md:bottom-auto left-0 right-0 p-4 bg-white md:bg-transparent border-t md:border-0 flex justify-between gap-4 mt-auto">
        <Button
          variant="outline"
          className="flex-1 h-12 text-base"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
        >
          <ChevronLeft className="mr-2" /> Voltar
        </Button>
        {step < 3 ? (
          <Button
            className="flex-1 h-12 text-base bg-maxpet-blue hover:bg-maxpet-navy"
            onClick={handleNextStep}
            disabled={(step === 1 && !selectedClient) || (step === 2 && cart.length === 0)}
          >
            Próximo <ChevronRight className="ml-2" />
          </Button>
        ) : (
          <Button
            className="flex-1 h-12 text-base bg-maxpet-green hover:bg-green-600"
            onClick={handleSubmit}
            disabled={submitting}
          >
            <Check className="mr-2" /> {submitting ? 'Salvando...' : 'Finalizar Pedido'}
          </Button>
        )}
      </div>
    </div>
  )
}
