import DashboardLayout from "@/components/layout/DashboardLayout";
import { Construction } from "lucide-react";

const AdminSettings = () => {
  return (
    <DashboardLayout role="admin" title="Paramètres plateforme">
      <div className="flex flex-col items-center justify-center py-20">
        <div className="rounded-2xl bg-primary/5 p-6 mb-6">
          <Construction className="h-16 w-16 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">En cours de construction</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Les paramètres avancés de la plateforme (configuration emails, limites, maintenance, etc.) sont en cours de développement.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
