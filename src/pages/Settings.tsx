import { useState, useEffect } from 'react'
import useMainStore from '@/stores/main'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Save, Plus, Trash2 } from 'lucide-react'

export default function Settings() {
  const { settings, updateSettings, sellers, addSeller, removeSeller, loading } = useMainStore()
  const { toast } = useToast()
  const [formData, setFormData] = useState(settings || ({} as any))
  const [newSeller, setNewSeller] = useState('')

  useEffect(() => {
    if (settings) setFormData(settings)
  }, [settings])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateSettings(formData)
    toast({ title: 'Configurações Salvas', description: 'Os dados da empresa foram atualizados.' })
  }

  const handleAddSeller = async () => {
    if (!newSeller.trim()) return
    await addSeller(newSeller)
    setNewSeller('')
    toast({ title: 'Vendedor Adicionado' })
  }

  if (loading || !settings)
    return <div className="p-8 text-center text-gray-500">Carregando...</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <h1 className="text-2xl font-black text-maxpet-navy">Configurações da Empresa</h1>
      <p className="text-gray-500 mb-6">
        Esses dados serão utilizados no cabeçalho e rodapé dos PDFs gerados.
      </p>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <Label>Razão Social</Label>
              <Input
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input
                value={formData.document}
                onChange={(e) => setFormData({ ...formData, document: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Endereço Físico</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label>Telefone / WhatsApp</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail Corporativo</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2 border-t pt-5">
              <Label className="text-maxpet-blue font-bold">URL da Logo do Sistema</Label>
              <Input
                placeholder="https://..."
                value={formData.logoUrl || ''}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-maxpet-navy hover:bg-[#00152b] text-white h-12 mt-4"
            >
              <Save className="mr-2 h-4 w-4" /> Salvar Configurações
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm mt-8">
        <CardContent className="p-6 md:p-8">
          <h2 className="text-xl font-bold text-maxpet-navy mb-4">Gerenciar Vendedores</h2>
          <div className="flex gap-2 mb-4">
            <Input
              value={newSeller}
              onChange={(e) => setNewSeller(e.target.value)}
              placeholder="Nome do Vendedor"
            />
            <Button onClick={handleAddSeller} className="bg-maxpet-green text-white">
              <Plus className="w-4 h-4 mr-2" /> Adicionar
            </Button>
          </div>
          <ul className="space-y-2">
            {sellers.map((s: any) => (
              <li
                key={s.id}
                className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border"
              >
                <span className="font-semibold">{s.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => removeSeller(s.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
            {sellers.length === 0 && (
              <p className="text-gray-500 text-sm">Nenhum vendedor cadastrado.</p>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
