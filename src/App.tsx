import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import Index from './pages/Index'
import Customers from './pages/Customers'
import CustomerForm from './pages/CustomerForm'
import CustomerDetails from './pages/CustomerDetails'
import Products from './pages/Products'
import Orders from './pages/Orders'
import NewOrder from './pages/NewOrder'
import OrderDetails from './pages/OrderDetails'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import { StoreProvider } from './stores/main'

const App = () => (
  <StoreProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/clientes" element={<Customers />} />
            <Route path="/clientes/novo" element={<CustomerForm />} />
            <Route path="/clientes/:id" element={<CustomerDetails />} />
            <Route path="/produtos" element={<Products />} />
            <Route path="/pedidos" element={<Orders />} />
            <Route path="/pedidos/novo" element={<NewOrder />} />
            <Route path="/pedidos/:id" element={<OrderDetails />} />
            <Route path="/relatorios" element={<Reports />} />
            <Route path="/configuracoes" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </StoreProvider>
)

export default App
