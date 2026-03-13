/**
 * authOtpService — OTP authentication via Supabase Edge Functions.
 * Uses send-otp and verify-otp edge functions deployed on Supabase.
 * Falls back to mock in demo mode.
 */
import { supabase } from "@/integrations/supabase/client";
import { getAppMode } from "@/stores/authStore";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://pbirevaryjmyinuzxlvo.supabase.co";

export const sendOtp = async (phone: string): Promise<{ success: boolean; message: string; _dev_code?: string }> => {
  // Demo mode: mock
  if (getAppMode() === "demo") {
    console.log(`[Demo] OTP envoyé au ${phone} — Code: 123456`);
    return { success: true, message: `Code envoyé (test: 123456)`, _dev_code: "123456" };
  }

  // Production: call edge function
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, locale: "fr" }),
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      return { success: false, message: data.error || "Échec de l'envoi" };
    }
    return { success: true, message: "Code envoyé par SMS", _dev_code: data._dev_code };
  } catch (e) {
    console.warn("[sendOtp] Edge function call failed:", e);
    return { success: false, message: "Erreur réseau" };
  }
};

export const verifyOtp = async (phone: string, code: string): Promise<{ success: boolean; patientId?: string }> => {
  // Demo mode: accept mock code
  if (getAppMode() === "demo") {
    if (code === "123456") {
      const patientId = `guest-${Date.now()}`;
      localStorage.setItem("userRole", "patient");
      localStorage.setItem("guestPatientId", patientId);
      localStorage.setItem("guestPhone", phone);
      return { success: true, patientId };
    }
    return { success: false };
  }

  // Production: call edge function
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });
    const data = await res.json();
    if (data.success && data.verified) {
      const patientId = `guest-${Date.now()}`;
      localStorage.setItem("userRole", "patient");
      localStorage.setItem("guestPatientId", patientId);
      localStorage.setItem("guestPhone", phone);
      return { success: true, patientId };
    }
    return { success: false };
  } catch (e) {
    console.warn("[verifyOtp] Edge function call failed:", e);
    return { success: false };
  }
};
