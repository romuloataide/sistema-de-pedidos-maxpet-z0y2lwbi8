import React, { createContext, useContext, useState, ReactNode, createElement } from 'react'

export type Client = {
  id: string
  name: string
  responsible: string
  document: string
  segment: string
  address: string
  neighborhood: string
  city: string
  state: string
  phone: string
  email: string
  notes: string
}

export type Product = {
  id: string
  name: string
  size: string
  neck: string
  height: string
  diameter: string
  unitPriceMilheiro: number
  unitPriceCento: number
  unitPriceMin: number
  minQuantity: number
  imageUrl: string
}

export type OrderStatus =
  | 'Pedido registrado'
  | 'Em processamento'
  | 'Em produção'
  | 'Separado para entrega'
  | 'Entregue'
  | 'Cancelado'

export type OrderItem = {
  productId: string
  quantity: number
  unitPrice: number
}

export type Order = {
  id: string
  clientId: string
  items: OrderItem[]
  status: OrderStatus
  deliveryDate: string
  paymentMethod: string
  notes: string
  internalNotes: string
  total: number
  createdAt: string
}

export type Settings = {
  companyName: string
  document: string
  address: string
  phone: string
  email: string
  sellerName: string
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'Supermercado Dois Irmãos',
    responsible: 'João Silva',
    document: '12345678000199',
    segment: 'Mercadinho',
    address: 'Rua das Flores, 123',
    neighborhood: 'Centro',
    city: 'São Luís',
    state: 'MA',
    phone: '98988887777',
    email: 'contato@doisirmaos.com',
    notes: 'Entrega preferencial pela manhã',
  },
  {
    id: '2',
    name: 'Distribuidora Gelada',
    responsible: 'Maria Fernandes',
    document: '98765432000111',
    segment: 'Distribuidora',
    address: 'Av. dos Holandeses, 45',
    neighborhood: 'Calhau',
    city: 'São Luís',
    state: 'MA',
    phone: '98999991111',
    email: 'compras@gelada.com',
    notes: '',
  },
  {
    id: '3',
    name: 'Restaurante Sabor de Casa',
    responsible: 'Carlos Mendes',
    document: '45612378000155',
    segment: 'Restaurante',
    address: 'Rua do Sol, 88',
    neighborhood: 'Praia Grande',
    city: 'São Luís',
    state: 'MA',
    phone: '98977772222',
    email: 'sabor@casa.com',
    notes: '',
  },
]

const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Frasco PET Redondo',
    size: '200ml',
    neck: '28 mm',
    height: '136 mm',
    diameter: '56 mm',
    unitPriceMilheiro: 0.5,
    unitPriceCento: 0.6,
    unitPriceMin: 0.7,
    minQuantity: 25,
    imageUrl: 'https://img.usecurling.com/p/200/200?q=plastic%20bottle&color=white',
  },
  {
    id: 'p2',
    name: 'Frasco PET Cilíndrico',
    size: '300ml',
    neck: '38 mm',
    height: '150 mm',
    diameter: '50 mm',
    unitPriceMilheiro: 0.75,
    unitPriceCento: 0.85,
    unitPriceMin: 0.95,
    minQuantity: 25,
    imageUrl: 'https://img.usecurling.com/p/200/200?q=water%20bottle&color=blue',
  },
  {
    id: 'p3',
    name: 'Frasco PET Cilíndrico Grande',
    size: '1000ml',
    neck: '28 mm',
    height: '240 mm',
    diameter: '69 mm',
    unitPriceMilheiro: 1.25,
    unitPriceCento: 1.4,
    unitPriceMin: 1.5,
    minQuantity: 15,
    imageUrl: 'https://img.usecurling.com/p/200/200?q=large%20bottle&color=white',
  },
]

const mockOrders: Order[] = [
  {
    id: '1001',
    clientId: '1',
    items: [{ productId: 'p1', quantity: 1000, unitPrice: 0.5 }],
    status: 'Entregue',
    deliveryDate: '2026-05-10',
    paymentMethod: 'Pix',
    notes: '',
    internalNotes: '',
    total: 500,
    createdAt: '2026-05-08T10:00:00Z',
  },
  {
    id: '1002',
    clientId: '2',
    items: [{ productId: 'p3', quantity: 500, unitPrice: 1.4 }],
    status: 'Em produção',
    deliveryDate: '2026-05-15',
    paymentMethod: 'Boleto 30d',
    notes: '',
    internalNotes: '',
    total: 700,
    createdAt: '2026-05-12T14:30:00Z',
  },
  {
    id: '1003',
    clientId: '3',
    items: [{ productId: 'p2', quantity: 100, unitPrice: 0.85 }],
    status: 'Pedido registrado',
    deliveryDate: '2026-05-14',
    paymentMethod: 'Cartão',
    notes: '',
    internalNotes: '',
    total: 85,
    createdAt: '2026-05-13T09:15:00Z',
  },
  {
    id: '1004',
    clientId: '1',
    items: [
      { productId: 'p1', quantity: 2000, unitPrice: 0.5 },
      { productId: 'p2', quantity: 1000, unitPrice: 0.75 },
    ],
    status: 'Separado para entrega',
    deliveryDate: '2026-05-13',
    paymentMethod: 'Pix',
    notes: '',
    internalNotes: '',
    total: 1750,
    createdAt: '2026-05-11T11:00:00Z',
  },
]

const defaultSettings: Settings = {
  companyName: 'MaxPET Embalagens LTda',
  document: '00.000.000/0001-00',
  address: 'Rodovia BR-135, Km 5, Distrito Industrial, São Luís - MA',
  phone: '(98) 98897-7895',
  email: 'vendas@maxpet.com.br',
  sellerName: 'Vendedor Externo',
}

export const StoreContext = createContext<any>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [settings, setSettings] = useState<Settings>(defaultSettings)

  return createElement(
    StoreContext.Provider,
    {
      value: {
        clients,
        setClients,
        products,
        setProducts,
        orders,
        setOrders,
        settings,
        setSettings,
      },
    },
    children,
  )
}

export default function useMainStore() {
  return useContext(StoreContext)
}
