import Link from "next/link";
import { LayoutDashboard, PlusCircle, ReceiptText } from "lucide-react";
const links = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/payments/new", label: "Criar cobrança", icon: PlusCircle },
  { href: "/transactions", label: "Transações", icon: ReceiptText },
];
export function Sidebar() {
  return (
    <aside className="flex w-full flex-col bg-gray-900 text-slate-300 md:min-h-screen md:w-64">
      <div className="border-b border-gray-800 px-6 py-6">
        <Link href="/dashboard" className="text-xl font-bold text-white">
          Pay<span className="text-green-500">Flow</span>
        </Link>
        <p className="mt-1 text-xs text-slate-500">Gestão de pagamentos</p>
      </div>
      <nav className="flex gap-1 overflow-x-auto p-3 md:flex-col">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-2.5 text-sm hover:bg-gray-800 hover:text-white"
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-5 text-xs text-slate-500">Ambiente sandbox</div>
    </aside>
  );
}
