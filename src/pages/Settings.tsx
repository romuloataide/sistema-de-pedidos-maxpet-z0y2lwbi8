import { useState, useEffect } from 'react'
import useMainStore from '@/stores/main'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Save, Plus, Trash2, Upload, Loader2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DavSettings } from '@/components/DavSettings'

export default function Settings() {
  const {
    settings,
    updateSettings,
    sellers,
    addSeller,
    removeSeller,
    expenses,
    addExpense,
    removeExpense,
    uploadImage,
    loading,
  } = useMainStore()
  const { toast } = useToast()
  const [formData, setFormData] = useState(settings || ({} as any))
  const [newSellerName, setNewSellerName] = useState('')
  const [newSellerComm, setNewSellerComm] = useState(5)
  const [uploading, setUploading] = useState(false)

  // Expense form
  const [expDesc, setExpDesc] = useState('')
  const [expAmount, setExpAmount] = useState('')
  const [expDate, setExpDate] = useState('')

  useEffect(() => {
    if (settings) setFormData(settings)
  }, [settings])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateSettings(formData)
    toast({ title: 'Configurações Salvas', description: 'Os dados da empresa foram atualizados.' })
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploading(true)
      const url = await uploadImage(file)
      setFormData({ ...formData, logoUrl: url })
      toast({ title: 'Logo carregada com sucesso!' })
    } catch (err: any) {
      toast({ title: 'Erro ao enviar logo', description: err.message, variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  const handleAddSeller = async () => {
    if (!newSellerName.trim()) return
    await addSeller(newSellerName, newSellerComm)
    setNewSellerName('')
    setNewSellerComm(5)
    toast({ title: 'Vendedor Adicionado' })
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!expDesc || !expAmount || !expDate) return
    await addExpense(expDesc, parseFloat(expAmount), expDate)
    setExpDesc('')
    setExpAmount('')
    setExpDate('')
    toast({ title: 'Despesa registrada com sucesso' })
  }

  if (loading || !settings)
    return <div className="p-8 text-center text-gray-500">Carregando...</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <h1 className="text-2xl font-black text-maxpet-navy">Painel de Administração</h1>

      <Tabs defaultValue="company">
        <TabsList className="flex flex-wrap md:grid md:grid-cols-4 mb-6 h-auto gap-2 bg-muted/50 p-1">
          <TabsTrigger value="company" className="flex-1 min-w-[120px]">
            Empresa
          </TabsTrigger>
          <TabsTrigger value="sellers" className="flex-1 min-w-[120px]">
            Vendedores
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex-1 min-w-[120px]">
            Despesas
          </TabsTrigger>
          <TabsTrigger value="dav" className="flex-1 min-w-[150px]">
            Configurações do DAV
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSave} className="space-y-5">
                <div className="space-y-2 border-b pb-6 mb-6">
                  <Label className="text-maxpet-blue font-bold">Logo do Sistema e Documentos</Label>
                  <div className="flex items-center gap-4">
                    {formData.logoUrl && (
                      <div className="w-20 h-20 bg-gray-50 rounded border flex items-center justify-center p-2">
                        <img
                          src={formData.logoUrl}
                          alt="Logo"
                          className="max-h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <Label htmlFor="logo-upload" className="cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-sm font-medium transition-colors w-fit">
                          {uploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          {uploading ? 'Enviando...' : 'Carregar Nova Imagem'}
                        </div>
                      </Label>
                      <Input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                        disabled={uploading}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Formatos suportados: PNG, JPG, WEBP.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                  <div className="space-y-2 md:col-span-2">
                    <Label>Endereço Físico</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
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
                  <div className="space-y-2">
                    <Label>Cor de Fundo da Logo</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        className="w-16 h-10 p-1 cursor-pointer shrink-0"
                        value={formData.logoBgColor || '#EBF2F7'}
                        onChange={(e) => setFormData({ ...formData, logoBgColor: e.target.value })}
                      />
                      <Input
                        value={formData.logoBgColor || '#EBF2F7'}
                        onChange={(e) => setFormData({ ...formData, logoBgColor: e.target.value })}
                        className="flex-1 uppercase"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Meta Mensal de Vendas (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.monthlyGoal || 0}
                      onChange={(e) =>
                        setFormData({ ...formData, monthlyGoal: parseFloat(e.target.value) })
                      }
                    />
                  </div>
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
        </TabsContent>

        <TabsContent value="sellers">
          <Card className="border-0 shadow-sm flex flex-col min-h-[500px]">
            <CardContent className="p-6 md:p-8 flex-1">
              <h2 className="text-xl font-bold text-maxpet-navy mb-4">Gerenciar Vendedores</h2>
              <div className="flex gap-2 mb-6">
                <div className="flex-1">
                  <Input
                    value={newSellerName}
                    onChange={(e) => setNewSellerName(e.target.value)}
                    placeholder="Nome do Vendedor"
                  />
                </div>
                <div className="w-32">
                  <Input
                    type="number"
                    value={newSellerComm}
                    onChange={(e) => setNewSellerComm(parseFloat(e.target.value))}
                    placeholder="% Comis."
                  />
                </div>
                <Button
                  onClick={handleAddSeller}
                  className="bg-maxpet-green hover:bg-green-600 text-white shrink-0"
                >
                  <Plus className="w-4 h-4 mr-2" /> Adicionar
                </Button>
              </div>
              <ul className="space-y-2">
                {sellers.map((s: any) => (
                  <li
                    key={s.id}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border"
                  >
                    <div>
                      <span className="font-semibold">{s.name}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({s.commissionRate}% de comissão)
                      </span>
                    </div>
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
            <div className="p-6 pt-0 mt-auto">
              <Button
                className="w-full bg-maxpet-navy hover:bg-[#00152b] text-white h-12"
                onClick={() =>
                  toast({
                    title: 'Vendedores Salvos',
                    description: 'A lista de vendedores está atualizada.',
                  })
                }
              >
                <Save className="mr-2 h-4 w-4" /> Salvar Vendedores
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card className="border-0 shadow-sm flex flex-col min-h-[500px]">
            <CardContent className="p-6 md:p-8 flex-1">
              <h2 className="text-xl font-bold text-maxpet-navy mb-4">Registro de Despesas</h2>
              <form onSubmit={handleAddExpense} className="flex flex-col md:flex-row gap-2 mb-6">
                <div className="flex-1">
                  <Input
                    required
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    placeholder="Descrição da despesa"
                  />
                </div>
                <div className="w-full md:w-32">
                  <Input
                    required
                    type="number"
                    step="0.01"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    placeholder="Valor (R$)"
                  />
                </div>
                <div className="w-full md:w-40">
                  <Input
                    required
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-maxpet-green hover:bg-green-600 text-white shrink-0"
                >
                  <Plus className="w-4 h-4 mr-2" /> Registrar
                </Button>
              </form>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-3">Data</th>
                      <th className="text-left p-3">Descrição</th>
                      <th className="text-right p-3">Valor</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {expenses.map((e: any) => (
                      <tr key={e.id}>
                        <td className="p-3 text-gray-600">{formatDate(e.date)}</td>
                        <td className="p-3 font-medium">{e.description}</td>
                        <td className="p-3 text-right font-bold text-red-500">
                          {formatCurrency(e.amount)}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-red-600"
                            onClick={() => removeExpense(e.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {expenses.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-500">
                          Nenhuma despesa registrada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <div className="p-6 pt-0 mt-auto">
              <Button
                className="w-full bg-maxpet-navy hover:bg-[#00152b] text-white h-12"
                onClick={() =>
                  toast({
                    title: 'Despesas Salvas',
                    description: 'A lista de despesas está atualizada.',
                  })
                }
              >
                <Save className="mr-2 h-4 w-4" /> Salvar Despesas
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="dav">
          <DavSettings companyId={formData.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
