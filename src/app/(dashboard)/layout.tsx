import { Sidebar } from "@/components/layout/sidebar";
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:flex">
      <Sidebar />
      <main className="min-w-0 flex-1 p-5 md:p-9">{children}</main>
    </div>
  );
}
