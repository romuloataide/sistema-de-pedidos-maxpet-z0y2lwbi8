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
import { Edit, Image as ImageIcon, Loader2, Search, Copy, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'

export default function Products() {
  const { products, updateProduct, addProduct, uploadImage } = useMainStore()
  const { toast } = useToast()
  const [editing, setEditing] = useState<Partial<Product> | null>(null)
  const [open, setOpen] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')

  const filteredProducts = products.filter(
    (p: Product) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p as any).code?.toString().includes(search),
  )

  const handleClone = (product: Product) => {
    const maxCode = products.reduce((max: number, p: any) => Math.max(max, p.code || 0), 0)
    setEditing({
      ...product,
      id: undefined,
      code: maxCode + 1,
      name: `${product.name} (Cópia)`,
    } as any)
    setIsNew(true)
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (
      !window.confirm('Tem certeza que deseja excluir este produto? A ação não pode ser desfeita.')
    )
      return
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      toast({ title: 'Produto excluído com sucesso' })
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (e: any) {
      toast({ title: 'Erro ao excluir', description: e.message, variant: 'destructive' })
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return

    try {
      if (isNew) {
        await addProduct(editing as Omit<Product, 'id'>)

        // Garantir persistência do código e custo unitário
        const { data } = await supabase
          .from('products')
          .select('id')
          .eq('name', editing.name)
          .order('created_at', { ascending: false })
          .limit(1)

        if (data?.[0]) {
          await supabase
            .from('products')
            .update({
              code: (editing as any).code,
              unit_cost: (editing as any).unit_cost || 0,
            })
            .eq('id', data[0].id)
        }

        toast({ title: 'Produto Adicionado' })
        setTimeout(() => window.location.reload(), 500)
      } else {
        await updateProduct(editing.id as string, editing)
        await supabase
          .from('products')
          .update({
            unit_cost: (editing as any).unit_cost || 0,
            code: (editing as any).code,
          })
          .eq('id', editing.id)
        toast({ title: 'Produto Atualizado' })
        setTimeout(() => window.location.reload(), 500)
      }
      setOpen(false)
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editing) return
    try {
      setUploading(true)
      const url = await uploadImage(file)
      setEditing({ ...editing, imageUrl: url })
      toast({ title: 'Foto carregada!' })
    } catch (err: any) {
      toast({ title: 'Erro ao enviar', description: err.message, variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-black text-maxpet-navy">Catálogo de Produtos</h1>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou código..."
              className="pl-9 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Dialog
            open={open && isNew}
            onOpenChange={(o) => {
              setOpen(o)
              setIsNew(o)
              if (o) {
                const maxCode = products.reduce(
                  (max: number, p: any) => Math.max(max, p.code || 0),
                  0,
                )
                setEditing({
                  code: maxCode + 1,
                  name: '',
                  size: '',
                  neck: '',
                  height: '',
                  diameter: '',
                  unitPriceMilheiro: 0,
                  unitPriceCento: 0,
                  unitPriceMin: 0,
                  minQuantity: 1,
                  stock: 0,
                  imageUrl: '',
                  unit_cost: 0,
                } as any)
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-maxpet-green hover:bg-green-600 text-white">
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Produto</DialogTitle>
              </DialogHeader>
              {editing && isNew && (
                <ProductForm
                  editing={editing}
                  setEditing={setEditing}
                  handleSave={handleSave}
                  handlePhotoUpload={handlePhotoUpload}
                  uploading={uploading}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((p: Product) => (
          <Card
            key={p.id}
            className="overflow-hidden flex flex-col border-0 shadow-md relative group"
          >
            <div className="bg-[#EBF2F7] p-8 flex justify-center relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 left-2 bg-white/50 text-red-500 hover:bg-red-50 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDelete(p.id)}
                title="Excluir Produto"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="h-56 object-contain mix-blend-multiply drop-shadow-xl"
                />
              ) : (
                <div className="h-56 w-full flex items-center justify-center bg-gray-100 rounded text-gray-400">
                  <ImageIcon size={48} />
                </div>
              )}
              <Badge className="absolute top-4 right-4 bg-maxpet-blue text-white text-sm px-3 py-1">
                {p.size}
              </Badge>
            </div>
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-xl text-maxpet-navy leading-tight">
                  <span className="text-gray-400 text-sm font-normal mr-2">
                    #{String((p as any).code || '').padStart(4, '0')}
                  </span>
                  <br />
                  {p.name}
                </h3>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${p.stock >= p.minQuantity ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                >
                  Estoque: {p.stock}
                </span>
              </div>

              {p.stock < p.minQuantity && (
                <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg mb-4 text-xs font-bold flex items-center border border-red-100">
                  <span className="mr-2">⚠️</span> Estoque crítico! (Abaixo de {p.minQuantity})
                </div>
              )}

              <div className="text-sm text-gray-600 mb-6 flex-1 grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg mt-2">
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

              <div className="bg-maxpet-navy text-white p-4 rounded-xl space-y-2 text-sm font-medium mb-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-white/10 px-2 py-1 rounded-bl-lg text-[10px]">
                  Custo: {formatCurrency((p as any).unit_cost || 0)}
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="opacity-80">Milheiro:</span>
                  <span className="text-lg">
                    {formatCurrency(p.unitPriceMilheiro)}
                    <span className="text-xs font-normal opacity-70">/un</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="opacity-80">Cento:</span>
                  <span className="text-lg">
                    {formatCurrency(p.unitPriceCento)}
                    <span className="text-xs font-normal opacity-70">/un</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="opacity-80">{p.minQuantity} Unidades:</span>
                  <span className="text-lg">
                    {formatCurrency(p.unitPriceMin)}
                    <span className="text-xs font-normal opacity-70">/un</span>
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-auto">
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
                      className="flex-1 text-maxpet-blue border-maxpet-blue hover:bg-maxpet-blue hover:text-white transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-2" /> Editar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Editar Produto: {p.name}</DialogTitle>
                    </DialogHeader>
                    {editing && !isNew && (
                      <ProductForm
                        editing={editing}
                        setEditing={setEditing}
                        handleSave={handleSave}
                        handlePhotoUpload={handlePhotoUpload}
                        uploading={uploading}
                      />
                    )}
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  className="flex-none text-maxpet-navy border-gray-300 hover:bg-gray-100 transition-colors px-3"
                  onClick={() => handleClone(p)}
                  title="Clonar Produto"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
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

function ProductForm({ editing, setEditing, handleSave, handlePhotoUpload, uploading }: any) {
  return (
    <form onSubmit={handleSave} className="space-y-6 pt-4 max-h-[75vh] overflow-y-auto px-2">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-bold border-b pb-2">Informações Gerais</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2 col-span-1">
              <Label>Código SKU</Label>
              <Input
                type="number"
                required
                value={(editing as any).code || ''}
                onChange={(e) => setEditing({ ...editing, code: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Nome do Produto</Label>
              <Input
                required
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Estoque Atual</Label>
            <Input
              type="number"
              required
              value={editing.stock}
              onChange={(e) => setEditing({ ...editing, stock: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label>Foto do Produto (Upload)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploading}
              />
              {uploading && <Loader2 className="w-4 h-4 animate-spin text-maxpet-blue" />}
            </div>
            {editing.imageUrl && (
              <p className="text-xs text-green-600 font-semibold mt-1">Imagem carregada.</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold border-b pb-2">Especificações Técnicas</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tamanho (ml/L)</Label>
              <Input
                required
                value={editing.size}
                onChange={(e) => setEditing({ ...editing, size: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Bocal</Label>
              <Input
                value={editing.neck}
                onChange={(e) => setEditing({ ...editing, neck: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Altura</Label>
              <Input
                value={editing.height}
                onChange={(e) => setEditing({ ...editing, height: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Diâmetro</Label>
              <Input
                value={editing.diameter}
                onChange={(e) => setEditing({ ...editing, diameter: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-bold text-lg">Preços e Quantidades</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Qtd. Mínima</Label>
            <Input
              type="number"
              value={editing.minQuantity}
              onChange={(e) => setEditing({ ...editing, minQuantity: parseInt(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label>Custo Unitário (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={editing.unit_cost || 0}
              onChange={(e) => setEditing({ ...editing, unit_cost: parseFloat(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label>Preço Min. (un)</Label>
            <Input
              type="number"
              step="0.01"
              value={editing.unitPriceMin}
              onChange={(e) => setEditing({ ...editing, unitPriceMin: parseFloat(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label>Preço Cento (un)</Label>
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
            <Label>Preço Milheiro (un)</Label>
            <Input
              type="number"
              step="0.01"
              value={editing.unitPriceMilheiro}
              onChange={(e) =>
                setEditing({ ...editing, unitPriceMilheiro: parseFloat(e.target.value) })
              }
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-maxpet-green hover:bg-green-600 text-white h-12 text-lg"
      >
        Salvar Produto
      </Button>
    </form>
  )
}
