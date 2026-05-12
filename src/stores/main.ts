import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  createElement,
} from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export type Seller = { id: string; name: string }
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
  whatsapp: string
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
export type OrderItem = { productId: string; quantity: number; unitPrice: number }
export type Order = {
  id: string
  shortId: string
  clientId: string
  sellerId?: string
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
  id: string
  companyName: string
  document: string
  address: string
  phone: string
  email: string
  sellerName?: string
  logoUrl?: string
}

export const StoreContext = createContext<any>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      setLoading(true)

      const [resClients, resProducts, resOrders, resSettings, resSellers] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('products').select('*'),
        supabase
          .from('orders')
          .select('*, items:order_items(*)')
          .order('created_at', { ascending: false }),
        supabase.from('company_settings').select('*').limit(1).single(),
        supabase.from('sellers').select('*'),
      ])

      if (resClients.data)
        setClients(resClients.data.map((c) => ({ ...c, whatsapp: c.whatsapp || '' })))
      if (resProducts.data)
        setProducts(
          resProducts.data.map((p) => ({
            id: p.id,
            name: p.name,
            size: p.size,
            neck: p.neck,
            height: p.height,
            diameter: p.diameter,
            unitPriceMilheiro: p.unit_price_milheiro,
            unitPriceCento: p.unit_price_cento,
            unitPriceMin: p.unit_price_min,
            minQuantity: p.min_quantity,
            imageUrl: p.image_url,
          })),
        )
      if (resOrders.data)
        setOrders(
          resOrders.data.map((o) => ({
            id: o.id,
            shortId: o.short_id,
            clientId: o.client_id,
            sellerId: o.seller_id,
            status: o.status,
            deliveryDate: o.delivery_date,
            paymentMethod: o.payment_method,
            notes: o.notes,
            internalNotes: o.internal_notes,
            total: o.total,
            createdAt: o.created_at,
            items: o.items.map((i: any) => ({
              productId: i.product_id,
              quantity: i.quantity,
              unitPrice: i.unit_price,
            })),
          })),
        )
      if (resSettings.data)
        setSettings({
          id: resSettings.data.id,
          companyName: resSettings.data.company_name,
          document: resSettings.data.document,
          address: resSettings.data.address,
          phone: resSettings.data.phone,
          email: resSettings.data.email,
          logoUrl: resSettings.data.logo_url || '',
        })
      if (resSellers.data) setSellers(resSellers.data)

      setLoading(false)
    }
    fetchData()
  }, [user])

  const addClient = async (c: Omit<Client, 'id'>) => {
    const { data } = await supabase.from('clients').insert([c]).select().single()
    if (data) setClients([...clients, data])
  }
  const removeClient = async (id: string) => {
    await supabase.from('clients').delete().eq('id', id)
    setClients(clients.filter((c) => c.id !== id))
  }

  const addProduct = async (p: Omit<Product, 'id'>) => {
    const payload = {
      name: p.name,
      size: p.size,
      neck: p.neck,
      height: p.height,
      diameter: p.diameter,
      unit_price_milheiro: p.unitPriceMilheiro,
      unit_price_cento: p.unitPriceCento,
      unit_price_min: p.unitPriceMin,
      min_quantity: p.minQuantity,
      image_url: p.imageUrl,
    }
    const { data } = await supabase.from('products').insert([payload]).select().single()
    if (data) setProducts([...products, { ...p, id: data.id }])
  }

  const updateProduct = async (id: string, p: Partial<Product>) => {
    const payload: any = {}
    if (p.name) payload.name = p.name
    if (p.size) payload.size = p.size
    if (p.neck) payload.neck = p.neck
    if (p.height) payload.height = p.height
    if (p.diameter) payload.diameter = p.diameter
    if (p.unitPriceMilheiro !== undefined) payload.unit_price_milheiro = p.unitPriceMilheiro
    if (p.unitPriceCento !== undefined) payload.unit_price_cento = p.unitPriceCento
    if (p.unitPriceMin !== undefined) payload.unit_price_min = p.unitPriceMin
    if (p.minQuantity !== undefined) payload.min_quantity = p.minQuantity
    if (p.imageUrl) payload.image_url = p.imageUrl

    await supabase.from('products').update(payload).eq('id', id)
    setProducts(products.map((x) => (x.id === id ? { ...x, ...p } : x)))
  }

  const addOrder = async (o: Omit<Order, 'id' | 'shortId' | 'createdAt'>) => {
    const shortId = Math.floor(10000 + Math.random() * 90000).toString()
    const { data } = await supabase
      .from('orders')
      .insert([
        {
          short_id: shortId,
          client_id: o.clientId,
          seller_id: o.sellerId || null,
          status: o.status,
          delivery_date: o.deliveryDate,
          payment_method: o.paymentMethod,
          notes: o.notes,
          internal_notes: o.internalNotes,
          total: o.total,
        },
      ])
      .select()
      .single()

    if (data && o.items.length > 0) {
      await supabase.from('order_items').insert(
        o.items.map((i) => ({
          order_id: data.id,
          product_id: i.productId,
          quantity: i.quantity,
          unit_price: i.unitPrice,
        })),
      )
    }
    const newOrder = { ...o, id: data!.id, shortId, createdAt: data!.created_at }
    setOrders([newOrder, ...orders])
    return newOrder
  }

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    await supabase.from('orders').update({ status }).eq('id', id)
    setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)))
  }

  const handleUpdateSettings = async (s: Settings) => {
    await supabase
      .from('company_settings')
      .update({
        company_name: s.companyName,
        document: s.document,
        address: s.address,
        phone: s.phone,
        email: s.email,
        logo_url: s.logoUrl,
      })
      .eq('id', s.id)
    setSettings(s)
  }

  const addSeller = async (name: string) => {
    const { data } = await supabase.from('sellers').insert([{ name }]).select().single()
    if (data) setSellers([...sellers, data])
  }
  const removeSeller = async (id: string) => {
    await supabase.from('sellers').delete().eq('id', id)
    setSellers(sellers.filter((s) => s.id !== id))
  }

  return createElement(
    StoreContext.Provider,
    {
      value: {
        clients,
        products,
        orders,
        settings,
        sellers,
        loading,
        addClient,
        removeClient,
        addProduct,
        updateProduct,
        addOrder,
        updateOrderStatus,
        updateSettings: handleUpdateSettings,
        addSeller,
        removeSeller,
      },
    },
    children,
  )
}

export default function useMainStore() {
  return useContext(StoreContext)
}
