import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Save, Loader2 } from 'lucide-react'

export const defaultDavConfig = {
  activeBlocks: {
    header: true,
    client: true,
    delivery: true,
    products: true,
    commercial: true,
    totals: true,
    observations: true,
  },
  columns: {
    code: true,
    description: true,
    quantity: true,
    unit: true,
    unitPrice: true,
    discount: true,
    total: true,
    ipi: false,
    icms: false,
    ncm: false,
    cfop: false,
    weight: false,
  },
  texts: {
    footer: 'Agradecemos a preferência! Este documento é válido por 15 dias.',
    fiscalObservation: 'Documento Auxiliar de Venda - Não possui valor fiscal.',
    commercialTerms: '',
  },
  layout: {
    orientation: 'portrait',
    size: 'A4',
  },
}

export function DavSettings({ companyId }: { companyId: string }) {
  const [config, setConfig] = useState(defaultDavConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!companyId)
      return supabase
        .from('company_settings')
        .select('dav_config')
        .eq('id', companyId)
        .single()
        .then(({ data }) => {
          if (data?.dav_config && Object.keys(data.dav_config).length > 0) {
            setConfig({ ...defaultDavConfig, ...(data.dav_config as any) })
          }
          setLoading(false)
        })
  }, [companyId])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('company_settings')
      .update({ dav_config: config as any })
      .eq('id', companyId)
    setSaving(false)
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({
        title: 'Salvo',
        description: 'Configurações do modelo personalizado do DAV salvas com sucesso!',
      })
    }
  }

  const toggleBlock = (key: keyof typeof config.activeBlocks) => {
    setConfig((c) => ({ ...c, activeBlocks: { ...c.activeBlocks, [key]: !c.activeBlocks[key] } }))
  }

  const toggleColumn = (key: keyof typeof config.columns) => {
    setConfig((c) => ({ ...c, columns: { ...c.columns, [key]: !c.columns[key] } }))
  }

  if (loading)
    return (
      <div className="p-12 flex justify-center">
        <Loader2 className="animate-spin text-gray-400" />
      </div>
    )

  return (
    <Card className="border-0 shadow-sm animate-fade-in">
      <CardContent className="p-6 md:p-8 space-y-8">
        <div>
          <h2 className="text-xl font-bold text-maxpet-navy mb-4">Blocos de Exibição</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border">
            {Object.keys(config.activeBlocks).map((k) => (
              <div key={k} className="flex items-center space-x-2">
                <Switch
                  id={`block-${k}`}
                  checked={config.activeBlocks[k as keyof typeof config.activeBlocks]}
                  onCheckedChange={() => toggleBlock(k as any)}
                />
                <Label htmlFor={`block-${k}`} className="capitalize">
                  {k === 'products' ? 'produtos' : k}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-maxpet-navy mb-4">Colunas da Tabela de Itens</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border">
            {Object.keys(config.columns).map((k) => (
              <div key={k} className="flex items-center space-x-2">
                <Switch
                  id={`col-${k}`}
                  checked={config.columns[k as keyof typeof config.columns]}
                  onCheckedChange={() => toggleColumn(k as any)}
                />
                <Label htmlFor={`col-${k}`} className="capitalize">
                  {k}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
          <div className="space-y-2">
            <Label>Tamanho do Papel (DAV)</Label>
            <Select
              value={config.layout.size}
              onValueChange={(v) => setConfig((c) => ({ ...c, layout: { ...c.layout, size: v } }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">Página A4</SelectItem>
                <SelectItem value="thermal">Bobina Térmica (80mm)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Orientação</Label>
            <Select
              value={config.layout.orientation}
              onValueChange={(v) =>
                setConfig((c) => ({ ...c, layout: { ...c.layout, orientation: v } }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="portrait">Retrato</SelectItem>
                <SelectItem value="landscape">Paisagem</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Texto de Rodapé (Agradecimento)</Label>
            <Textarea
              value={config.texts.footer}
              onChange={(e) =>
                setConfig((c) => ({ ...c, texts: { ...c.texts, footer: e.target.value } }))
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Observação Fiscal Padrão</Label>
            <Textarea
              value={config.texts.fiscalObservation}
              onChange={(e) =>
                setConfig((c) => ({
                  ...c,
                  texts: { ...c.texts, fiscalObservation: e.target.value },
                }))
              }
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-maxpet-blue hover:bg-maxpet-navy text-white h-12 mt-4"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Salvar Modelo Personalizado do DAV
        </Button>
      </CardContent>
    </Card>
  )
}
