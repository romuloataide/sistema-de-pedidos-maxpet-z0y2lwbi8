import { useState } from 'react'
import useMainStore from '@/stores/main'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Save } from 'lucide-react'

export default function Settings() {
  const { settings, setSettings } = useMainStore()
  const { toast } = useToast()
  const [formData, setFormData] = useState(settings)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSettings(formData)
    toast({ title: 'Configurações Salvas', description: 'Os dados da empresa foram atualizados.' })
  }

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
              <Label className="text-maxpet-blue font-bold">
                Nome do Vendedor (Padrão para assinatura)
              </Label>
              <Input
                value={formData.sellerName}
                onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
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
    </div>
  )
}
