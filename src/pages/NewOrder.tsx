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
import { Search, ChevronRight, ChevronLeft, Check, Plus, Minus, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function NewOrder() {
  const { clients, products, orders, setOrders } = useMainStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [searchClient, setSearchClient] = useState('')
  const [selectedClient, setSelectedClient] = useState<string>('')
  const [cart, setCart] = useState<OrderItem[]>([])
  const [details, setDetails] = useState({
    deliveryDate: '',
    paymentMethod: '',
    notes: '',
    internalNotes: '',
  })

  const filteredClients = clients.filter(
    (c: Client) =>
      c.name.toLowerCase().includes(searchClient.toLowerCase()) ||
      c.document.includes(searchClient),
  )

  const updateCart = (productId: string, quantity: number, forcePrice?: number) => {
    const p = products.find((x: Product) => x.id === productId)!
    let suggestedPrice = forcePrice ?? p.unitPriceMin
    if (!forcePrice && quantity >= 1000) suggestedPrice = p.unitPriceMilheiro
    else if (!forcePrice && quantity >= 100) suggestedPrice = p.unitPriceCento

    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId)
      if (quantity <= 0) return prev.filter((i) => i.productId !== productId)
      if (existing)
        return prev.map((i) =>
          i.productId === productId ? { ...i, quantity, unitPrice: forcePrice ?? i.unitPrice } : i,
        )
      return [...prev, { productId, quantity, unitPrice: suggestedPrice }]
    })
  }

  const subtotal = cart.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0)

  const handleSubmit = () => {
    if (!details.deliveryDate || !details.paymentMethod)
      return toast({
        title: 'Erro',
        description: 'Preencha os dados de entrega.',
        variant: 'destructive',
      })
    const newOrder = {
      id: Math.floor(10000 + Math.random() * 90000).toString(),
      clientId: selectedClient,
      items: cart,
      status: 'Pedido registrado' as const,
      total: subtotal,
      createdAt: new Date().toISOString(),
      ...details,
    }
    setOrders([...orders, newOrder])
    toast({ title: 'Sucesso', description: `Pedido #${newOrder.id} salvo!` })
    navigate(`/pedidos/${newOrder.id}`)
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
            <h2 className="text-xl font-bold mb-4">1. Selecione o Cliente</h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Buscar cliente..."
                className="pl-10 h-12 bg-white"
                value={searchClient}
                onChange={(e) => setSearchClient(e.target.value)}
              />
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
                        <p className="text-xs text-gray-500 mb-3">
                          Ref: {formatCurrency(p.unitPriceMin)} a{' '}
                          {formatCurrency(p.unitPriceMilheiro)}/un
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border rounded-lg bg-gray-50 overflow-hidden">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 rounded-none text-maxpet-navy"
                              onClick={() =>
                                updateCart(p.id, Math.max(0, qty - (qty > 100 ? 100 : 25)))
                              }
                            >
                              <Minus size={16} />
                            </Button>
                            <Input
                              type="number"
                              className="h-10 w-20 border-0 text-center font-bold bg-transparent focus-visible:ring-0"
                              value={qty || ''}
                              placeholder="0"
                              onChange={(e) => updateCart(p.id, parseInt(e.target.value) || 0)}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 rounded-none text-maxpet-navy"
                              onClick={() => updateCart(p.id, qty + (qty >= 100 ? 100 : 25))}
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
              <CardContent className="p-4 bg-maxpet-blue text-white rounded-xl flex justify-between items-center">
                <span className="font-bold">Total:</span>
                <span className="text-2xl font-black">{formatCurrency(subtotal)}</span>
              </CardContent>
            </Card>
            <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm">
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
            onClick={() => setStep((s) => Math.min(3, s + 1))}
            disabled={(step === 1 && !selectedClient) || (step === 2 && cart.length === 0)}
          >
            Próximo <ChevronRight className="ml-2" />
          </Button>
        ) : (
          <Button
            className="flex-1 h-12 text-base bg-maxpet-green hover:bg-green-600"
            onClick={handleSubmit}
          >
            <Check className="mr-2" /> Finalizar Pedido
          </Button>
        )}
      </div>
    </div>
  )
}
