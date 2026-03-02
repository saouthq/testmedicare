/**
 * Teleconsultation — Page slim qui compose les sous-composants.
 * Toute la logique est dans TeleconsultationContext.
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { TeleconsultationProvider, useTeleconsultation } from "@/components/teleconsultation/TeleconsultationContext";
import PreCheckScreen from "@/components/teleconsultation/PreCheckScreen";
import WaitingScreen from "@/components/teleconsultation/WaitingScreen";
import CallScreen from "@/components/teleconsultation/CallScreen";
import EndConfirmDialog from "@/components/teleconsultation/EndConfirmDialog";
import SummaryScreen from "@/components/teleconsultation/SummaryScreen";

function TeleconsultationRouter() {
  const ctx = useTeleconsultation();

  return (
    <div className="space-y-4">
      <EndConfirmDialog />
      {ctx.phase === "precheck" && <PreCheckScreen />}
      {ctx.phase === "waiting" && <WaitingScreen />}
      {(ctx.phase === "call" || ctx.phase === "ending") && <CallScreen />}
      {ctx.phase === "summary" && <SummaryScreen />}
    </div>
  );
}

const Teleconsultation = ({ role = "patient" }: { role?: "patient" | "doctor" }) => (
  <TeleconsultationProvider role={role}>
    <DashboardLayout role={role} title="Téléconsultation">
      <TeleconsultationRouter />
    </DashboardLayout>
  </TeleconsultationProvider>
);

export default Teleconsultation;
