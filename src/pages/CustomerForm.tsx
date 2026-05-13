import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useMainStore, { Client } from '@/stores/main'
import { supabase } from '@/lib/supabase/client'
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
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function CustomerForm() {
  const { id } = useParams()
  const { clients, setClients } = useMainStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    responsible: '',
    document: '',
    segment: '',
    address: '',
    neighborhood: '',
    city: 'São Luís',
    state: 'MA',
    phone: '',
    whatsapp: '',
    email: '',
    notes: '',
  })

  const { addClient } = useMainStore()

  useEffect(() => {
    if (id) {
      const client = clients.find((c: Client) => c.id === id)
      if (client) {
        setFormData(client)
      }
    }
  }, [id, clients])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.document)
      return toast({
        title: 'Erro',
        description: 'Nome e Documento são obrigatórios.',
        variant: 'destructive',
      })

    try {
      if (id) {
        const { error } = await supabase.from('clients').update(formData).eq('id', id)
        if (error) throw error
        if (setClients) {
          setClients(clients.map((c: Client) => (c.id === id ? { ...c, ...formData } : c)))
        }
        toast({ title: 'Sucesso', description: 'Cliente atualizado com sucesso.' })
      } else {
        await addClient(formData as Omit<Client, 'id'>)
        toast({ title: 'Sucesso', description: 'Cliente cadastrado com sucesso.' })
      }
      navigate('/clientes')
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-maxpet-navy">
          {id ? 'Editar Cliente' : 'Novo Cliente'}
        </h1>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          Cancelar
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Razão Social / Nome</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>CNPJ / CPF</Label>
                <Input
                  required
                  value={formData.document}
                  onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Pessoa Responsável</Label>
                <Input
                  value={formData.responsible}
                  onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Segmento</Label>
                <Input
                  placeholder="Ex: Mercadinho, Distribuidora..."
                  value={formData.segment || ''}
                  onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
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
                  value={(formData as any).category || 'Normal'}
                  onValueChange={(v) => setFormData({ ...formData, category: v } as any)}
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
            </div>

            <h3 className="font-bold text-maxpet-navy mt-6 mb-2 border-b pb-2">
              Contato & Endereço
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Endereço Completo</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Bairro</Label>
                <Input
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                />
              </div>
              <div className="space-y-2 grid grid-cols-2 gap-2">
                <div>
                  <Label>Cidade</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label>UF</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label>Observações Internas</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-maxpet-green hover:bg-green-600 text-white h-12 text-lg mt-6"
            >
              {id ? 'Salvar Alterações' : 'Salvar Cliente'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
