import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { User, Clock, Bell, Shield } from "lucide-react";
import ProfileTab from "@/components/doctor-settings/ProfileTab";
import AvailabilityTab from "@/components/doctor-settings/AvailabilityTab";
import NotificationsTab from "@/components/doctor-settings/NotificationsTab";
import SecurityTab from "@/components/doctor-settings/SecurityTab";

type Tab = "profile" | "availability" | "notifications" | "security";

const DoctorSettings = () => {
  const [tab, setTab] = useState<Tab>("profile");

  const tabs = [
    { key: "profile" as Tab, label: "Profil", icon: User },
    { key: "availability" as Tab, label: "Disponibilités", icon: Clock },
    { key: "notifications" as Tab, label: "Notifications", icon: Bell },
    { key: "security" as Tab, label: "Sécurité", icon: Shield },
  ];

  return (
    <DashboardLayout role="doctor" title="Paramètres">
      <div className="max-w-4xl space-y-6">
        <div className="flex gap-1 rounded-lg border bg-card p-1 w-fit overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="h-4 w-4" />{t.label}
            </button>
          ))}
        </div>

        {tab === "profile" && <ProfileTab />}
        {tab === "availability" && <AvailabilityTab />}
        {tab === "notifications" && <NotificationsTab />}
        {tab === "security" && <SecurityTab />}
      </div>
    </DashboardLayout>
  );
};

export default DoctorSettings;
