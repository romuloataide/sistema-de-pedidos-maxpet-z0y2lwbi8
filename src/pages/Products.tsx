import { useState } from 'react'
import useMainStore, { Product } from '@/stores/main'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Edit } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Products() {
  const { products, setProducts } = useMainStore()
  const { toast } = useToast()
  const [editing, setEditing] = useState<Product | null>(null)
  const [open, setOpen] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    setProducts(products.map((p: Product) => (p.id === editing.id ? editing : p)))
    setOpen(false)
    toast({ title: 'Salvo', description: 'Preços atualizados com sucesso.' })
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h1 className="text-2xl font-black text-maxpet-navy">Catálogo de Produtos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p: Product) => (
          <Card key={p.id} className="overflow-hidden flex flex-col border-0 shadow-md">
            <div className="bg-[#EBF2F7] p-8 flex justify-center relative">
              <img
                src={p.imageUrl}
                alt={p.name}
                className="h-56 object-contain mix-blend-multiply drop-shadow-xl"
              />
              <Badge className="absolute top-4 right-4 bg-maxpet-blue text-white text-sm px-3 py-1">
                {p.size}
              </Badge>
            </div>
            <CardContent className="p-6 flex-1 flex flex-col">
              <h3 className="font-bold text-xl text-maxpet-navy mb-4 leading-tight">{p.name}</h3>
              <div className="text-sm text-gray-600 mb-6 flex-1 grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg">
                <p>
                  <span className="font-semibold">Bocal:</span>
                  <br />
                  {p.neck}
                </p>
                <p>
                  <span className="font-semibold">Altura:</span>
                  <br />
                  {p.height}
                </p>
                <p className="col-span-2">
                  <span className="font-semibold">Diâmetro:</span> {p.diameter}
                </p>
              </div>
              <div className="bg-maxpet-navy text-white p-4 rounded-xl space-y-2 text-sm font-medium mb-4">
                <div className="flex justify-between items-center">
                  <span className="opacity-80">Milheiro:</span>{' '}
                  <span className="text-lg">
                    {formatCurrency(p.unitPriceMilheiro)}
                    <span className="text-xs font-normal opacity-70">/un</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="opacity-80">Cento:</span>{' '}
                  <span className="text-lg">
                    {formatCurrency(p.unitPriceCento)}
                    <span className="text-xs font-normal opacity-70">/un</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="opacity-80">{p.minQuantity} Unidades:</span>{' '}
                  <span className="text-lg">
                    {formatCurrency(p.unitPriceMin)}
                    <span className="text-xs font-normal opacity-70">/un</span>
                  </span>
                </div>
              </div>
              <Dialog
                open={open && editing?.id === p.id}
                onOpenChange={(o) => {
                  setOpen(o)
                  if (o) setEditing(p)
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full text-maxpet-blue border-maxpet-blue hover:bg-maxpet-blue hover:text-white transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" /> Editar Preços
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Preços: {p.name}</DialogTitle>
                  </DialogHeader>
                  {editing && (
                    <form onSubmit={handleSave} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Preço Milheiro (por unidade)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editing.unitPriceMilheiro}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              unitPriceMilheiro: parseFloat(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Preço Cento (por unidade)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editing.unitPriceCento}
                          onChange={(e) =>
                            setEditing({ ...editing, unitPriceCento: parseFloat(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Preço Min. ({p.minQuantity} un)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editing.unitPriceMin}
                          onChange={(e) =>
                            setEditing({ ...editing, unitPriceMin: parseFloat(e.target.value) })
                          }
                        />
                      </div>
                      <Button type="submit" className="w-full bg-maxpet-green text-white">
                        Salvar Alterações
                      </Button>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function Badge({ children, className }: any) {
  return <span className={`rounded-full font-bold ${className}`}>{children}</span>
}
