import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export function DavAdvancedFields({ davData, setDavData }: { davData: any; setDavData: any }) {
  const update = (section: string, field: string, value: any) => {
    setDavData((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }))
  }

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full bg-white rounded-xl shadow-sm border p-2 mt-4 animate-fade-in"
    >
      <AccordionItem value="delivery" className="border-b">
        <AccordionTrigger className="px-4 hover:no-underline font-bold text-maxpet-navy">
          1. Dados de Entrega e Frete (DAV)
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Transportadora</Label>
              <Input
                value={davData.delivery.carrier}
                onChange={(e) => update('delivery', 'carrier', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Frete</Label>
              <Select
                value={davData.delivery.freightType}
                onValueChange={(v) => update('delivery', 'freightType', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CIF (Empresa)">CIF (Empresa paga)</SelectItem>
                  <SelectItem value="FOB (Cliente)">FOB (Cliente paga)</SelectItem>
                  <SelectItem value="Retirada no Local">Retirada no Local</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Endereço de Entrega Completo</Label>
              <Input
                value={davData.delivery.address}
                onChange={(e) => update('delivery', 'address', e.target.value)}
                placeholder="Ex: Rua A, 123 - Bairro - Cidade/UF"
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="commercial" className="border-b">
        <AccordionTrigger className="px-4 hover:no-underline font-bold text-maxpet-navy">
          2. Condições Comerciais (DAV)
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prazo / Condição de Pagamento</Label>
              <Input
                value={davData.commercial.paymentCondition}
                onChange={(e) => update('commercial', 'paymentCondition', e.target.value)}
                placeholder="Ex: 30/60/90 dias"
              />
            </div>
            <div className="space-y-2">
              <Label>Pedido do Cliente (OC)</Label>
              <Input
                value={davData.commercial.customerOrderNumber}
                onChange={(e) => update('commercial', 'customerOrderNumber', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Desconto Total Concedido (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={davData.commercial.discount || ''}
                onChange={(e) => update('commercial', 'discount', parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Acréscimo Comercial (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={davData.commercial.addition || ''}
                onChange={(e) => update('commercial', 'addition', parseFloat(e.target.value))}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="totals" className="border-b-0">
        <AccordionTrigger className="px-4 hover:no-underline font-bold text-maxpet-navy">
          3. Impostos e Despesas Acessórias (DAV)
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 space-y-4 pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Valor do Frete (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={davData.totals.freight || ''}
                onChange={(e) => update('totals', 'freight', parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Seguro (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={davData.totals.insurance || ''}
                onChange={(e) => update('totals', 'insurance', parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>IPI Total (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={davData.totals.ipi || ''}
                onChange={(e) => update('totals', 'ipi', parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Valor ICMS (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={davData.totals.icms || ''}
                onChange={(e) => update('totals', 'icms', parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Valor ICMS ST (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={davData.totals.icmsSt || ''}
                onChange={(e) => update('totals', 'icmsSt', parseFloat(e.target.value))}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
