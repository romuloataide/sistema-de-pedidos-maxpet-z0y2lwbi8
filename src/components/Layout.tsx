import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  PlusCircle,
  Home,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import useMainStore from '@/stores/main'

export default function Layout() {
  const location = useLocation()
  const { settings, profile } = useMainStore()
  const isAdmin = profile?.role === 'admin'

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Clientes', path: '/clientes', icon: Users },
    { name: 'Produtos', path: '/produtos', icon: Package },
    { name: 'Pedidos', path: '/pedidos', icon: ShoppingCart },
    ...(isAdmin ? [{ name: 'Relatórios', path: '/relatorios', icon: BarChart3 }] : []),
    ...(isAdmin ? [{ name: 'Configurações', path: '/configuracoes', icon: Settings }] : []),
  ]

  return (
    <div className="flex h-screen bg-maxpet-light text-maxpet-dark overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-maxpet-navy text-white print:hidden shadow-lg z-10">
        <div className="p-6 text-3xl font-black tracking-tight flex items-center gap-1 bg-white/5">
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="h-10 object-contain" />
          ) : (
            <>
              <span className="text-white">Max</span>
              <span className="text-maxpet-green">PET</span>
            </>
          )}
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path))
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium',
                  isActive
                    ? 'bg-maxpet-blue text-white shadow-md'
                    : 'hover:bg-white/10 text-gray-300 hover:text-white',
                )}
              >
                <item.icon size={20} className={cn(isActive ? 'text-white' : 'text-gray-400')} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-maxpet-light relative">
        <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-white border-b print:hidden shadow-sm z-10">
          <div className="flex items-center gap-2">
            {settings?.logoUrl && (
              <img src={settings.logoUrl} alt="Logo" className="h-8 md:hidden object-contain" />
            )}
            <h1 className="text-lg md:text-xl font-bold text-maxpet-navy hidden sm:block">
              {settings?.companyName || 'Sistema de Vendas'}
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border">
            <div
              className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-sm ${isAdmin ? 'bg-maxpet-navy' : 'bg-maxpet-green'}`}
            >
              {isAdmin ? 'A' : 'V'}
            </div>
            <span className="text-sm font-semibold text-maxpet-navy hidden sm:block">
              {profile?.name || (isAdmin ? 'Administrador' : 'Vendedor')}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8 print:p-0 print:overflow-visible">
          <Outlet />
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex justify-around items-center print:hidden shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-50">
          <Link
            to="/"
            className={cn(
              'flex flex-col items-center gap-1',
              location.pathname === '/' ? 'text-maxpet-blue' : 'text-gray-400',
            )}
          >
            <Home size={20} />
            <span className="text-[10px] font-medium">Início</span>
          </Link>
          <Link
            to="/clientes"
            className={cn(
              'flex flex-col items-center gap-1',
              location.pathname.includes('/clientes') ? 'text-maxpet-blue' : 'text-gray-400',
            )}
          >
            <Users size={20} />
            <span className="text-[10px] font-medium">Clientes</span>
          </Link>
          <Link
            to="/pedidos/novo"
            className="flex flex-col items-center justify-center -mt-8 relative group"
          >
            <div className="bg-maxpet-green text-white p-3.5 rounded-full shadow-lg transform transition-transform group-active:scale-95">
              <PlusCircle size={26} />
            </div>
            <span className="text-[10px] text-gray-500 mt-1 font-medium">Novo</span>
          </Link>
          <Link
            to="/pedidos"
            className={cn(
              'flex flex-col items-center gap-1',
              location.pathname === '/pedidos' ? 'text-maxpet-blue' : 'text-gray-400',
            )}
          >
            <ShoppingCart size={20} />
            <span className="text-[10px] font-medium">Pedidos</span>
          </Link>
        </nav>
      </div>
    </div>
  )
}
