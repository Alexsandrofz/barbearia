import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardSidebar businessName="Navalha Real" />

      <div className="lg:pl-72">
        {children}
      </div>
    </div>
  );
}