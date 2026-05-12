import { useState } from 'react'
import { Link } from 'react-router-dom'
import useMainStore, { Client } from '@/stores/main'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Search, PlusCircle, MapPin, Phone } from 'lucide-react'
import { formatDocument } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export default function Customers() {
  const { clients } = useMainStore()
  const [search, setSearch] = useState('')

  const filtered = clients.filter(
    (c: Client) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.document.includes(search) ||
      c.segment.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-black text-maxpet-navy">Clientes</h1>
        <Link to="/clientes/novo">
          <Button className="bg-maxpet-blue hover:bg-maxpet-navy text-white w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Cliente
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Buscar por nome, CNPJ ou segmento..."
          className="pl-10 h-12 bg-white border-0 shadow-sm text-base"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c: Client) => (
          <Link key={c.id} to={`/clientes/${c.id}`}>
            <Card className="hover:shadow-md transition-all border-0 shadow-sm group">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-maxpet-navy text-lg line-clamp-1 group-hover:text-maxpet-blue transition-colors">
                    {c.name}
                  </h3>
                  <Badge variant="outline" className="bg-gray-50">
                    {c.segment}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>CNPJ/CPF: {formatDocument(c.document)}</p>
                  <p className="flex items-center gap-2">
                    <MapPin size={14} className="text-maxpet-green" /> {c.neighborhood}, {c.city}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone size={14} className="text-maxpet-blue" /> {c.phone}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            Nenhum cliente encontrado.
          </div>
        )}
      </div>
    </div>
  )
}
