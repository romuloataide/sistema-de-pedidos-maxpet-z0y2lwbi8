import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import useMainStore from '@/stores/main'
import { Save } from 'lucide-react'

export function DavSettings({ companyId }: { companyId?: string }) {
  const { settings, updateSettings } = useMainStore()
  const { toast } = useToast()

  const defaultDavConfig = {
    enabledBlocks: {
      header: true,
      client: true,
      delivery: true,
      products: true,
      commercial: true,
      totals: true,
    },
    texts: {
      footer: 'Obrigado pela preferência!',
      fiscalNotes: 'Documento auxiliar de venda - Sem valor fiscal',
      commercialTerms: 'Validade da proposta: 15 dias.',
    },
    layout: {
      orientation: 'portrait',
      size: 'A4',
      headerColor: '#EBF2F7',
      logoSize: 100,
    },
  }

  const [config, setConfig] = useState<any>(defaultDavConfig)

  useEffect(() => {
    if (settings?.dav_config) {
      setConfig({
        ...defaultDavConfig,
        ...(typeof settings.dav_config === 'object' ? settings.dav_config : {}),
      })
    }
  }, [settings])

  const handleSave = async () => {
    try {
      if (!settings) return
      await updateSettings({ ...settings, dav_config: config })
      toast({ title: 'Configurações do DAV salvas com sucesso!' })
    } catch (e: any) {
      toast({ title: 'Erro ao salvar', description: e.message, variant: 'destructive' })
    }
  }

  const toggleBlock = (block: string) => {
    setConfig((prev: any) => ({
      ...prev,
      enabledBlocks: {
        ...prev.enabledBlocks,
        [block]: !prev.enabledBlocks[block],
      },
    }))
  }

  const updateText = (field: string, value: string) => {
    setConfig((prev: any) => ({
      ...prev,
      texts: { ...prev.texts, [field]: value },
    }))
  }

  const updateLayout = (field: string, value: string | number) => {
    setConfig((prev: any) => ({
      ...prev,
      layout: { ...prev.layout, [field]: value },
    }))
  }

  if (!settings) return null

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
        <div>
          <h2 className="text-xl font-bold text-maxpet-navy">Preferências do DAV</h2>
          <p className="text-sm text-gray-500">
            Personalize a exibição do Documento Auxiliar de Venda e orçamentos
          </p>
        </div>
        <Button onClick={handleSave} className="bg-maxpet-navy hover:bg-[#00152b] text-white">
          <Save className="mr-2 h-4 w-4" /> Salvar Preferências
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="bg-gray-50/50 border-b">
            <CardTitle className="text-lg text-maxpet-navy">Blocos Exibidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Cabeçalho (Logo e Empresa)</Label>
                <p className="text-sm text-gray-500">Mostra os dados da sua empresa no topo</p>
              </div>
              <Switch
                checked={config.enabledBlocks?.header ?? true}
                onCheckedChange={() => toggleBlock('header')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Dados do Cliente</Label>
                <p className="text-sm text-gray-500">Informações de contato e faturamento</p>
              </div>
              <Switch
                checked={config.enabledBlocks?.client ?? true}
                onCheckedChange={() => toggleBlock('client')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Dados de Entrega</Label>
                <p className="text-sm text-gray-500">Endereço de destino e informações de frete</p>
              </div>
              <Switch
                checked={config.enabledBlocks?.delivery ?? true}
                onCheckedChange={() => toggleBlock('delivery')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Tabela de Produtos</Label>
                <p className="text-sm text-gray-500">Lista detalhada dos itens orçados</p>
              </div>
              <Switch
                checked={config.enabledBlocks?.products ?? true}
                onCheckedChange={() => toggleBlock('products')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Condições Comerciais</Label>
                <p className="text-sm text-gray-500">Prazos, parcelas e formas de pagamento</p>
              </div>
              <Switch
                checked={config.enabledBlocks?.commercial ?? true}
                onCheckedChange={() => toggleBlock('commercial')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Totais Financeiros</Label>
                <p className="text-sm text-gray-500">Resumo de impostos, frete e descontos</p>
              </div>
              <Switch
                checked={config.enabledBlocks?.totals ?? true}
                onCheckedChange={() => toggleBlock('totals')}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="bg-gray-50/50 border-b">
            <CardTitle className="text-lg text-maxpet-navy">Layout e Formato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-3">
              <Label>Tamanho do Papel</Label>
              <Select
                value={config.layout?.size ?? 'A4'}
                onValueChange={(v) => updateLayout('size', v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4 (Padrão)</SelectItem>
                  <SelectItem value="half">Meia Página (A5)</SelectItem>
                  <SelectItem value="thermal">Bobina Térmica (80mm)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>Orientação da Página</Label>
              <Select
                value={config.layout?.orientation ?? 'portrait'}
                onValueChange={(v) => updateLayout('orientation', v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Retrato (Vertical)</SelectItem>
                  <SelectItem value="landscape">Paisagem (Horizontal)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>Tamanho da Logo (%)</Label>
              <Input
                type="number"
                min="50"
                max="200"
                value={config.layout?.logoSize ?? 100}
                onChange={(e) => updateLayout('logoSize', parseInt(e.target.value) || 100)}
              />
              <p className="text-xs text-gray-500">
                Ajuste o tamanho de 50 a 200 para escalar a logo no cabeçalho.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="bg-gray-50/50 border-b">
            <CardTitle className="text-lg text-maxpet-navy">Textos Padrão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 md:col-span-2">
              <Label>Termos Comerciais Padrão</Label>
              <Textarea
                className="resize-none"
                rows={3}
                placeholder="Ex: Validade da proposta: 15 dias..."
                value={config.texts?.commercialTerms ?? ''}
                onChange={(e) => updateText('commercialTerms', e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <Label>Observações Fiscais</Label>
              <Textarea
                className="resize-none"
                rows={3}
                placeholder="Ex: Documento sem valor fiscal..."
                value={config.texts?.fiscalNotes ?? ''}
                onChange={(e) => updateText('fiscalNotes', e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <Label>Mensagem de Rodapé</Label>
              <Textarea
                className="resize-none"
                rows={3}
                placeholder="Texto do rodapé do documento"
                value={config.texts?.footer ?? ''}
                onChange={(e) => updateText('footer', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
