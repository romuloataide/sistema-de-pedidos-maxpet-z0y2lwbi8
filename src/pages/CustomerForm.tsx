import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useMainStore, { Client } from '@/stores/main'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.document)
      return toast({
        title: 'Erro',
        description: 'Nome e Documento são obrigatórios.',
        variant: 'destructive',
      })
    await addClient(formData as Omit<Client, 'id'>)
    toast({ title: 'Sucesso', description: 'Cliente cadastrado com sucesso.' })
    navigate('/clientes')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-maxpet-navy">Novo Cliente</h1>
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
                <Select
                  value={formData.segment}
                  onValueChange={(v) => setFormData({ ...formData, segment: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mercadinho">Mercadinho</SelectItem>
                    <SelectItem value="Depósito de bebidas">Depósito de bebidas</SelectItem>
                    <SelectItem value="Restaurante">Restaurante</SelectItem>
                    <SelectItem value="Distribuidora">Distribuidora</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
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
              Salvar Cliente
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
