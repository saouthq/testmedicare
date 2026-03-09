/**
 * Mock OTP authentication service
 * TODO BACKEND: Replace with real API calls
 */

const MOCK_OTP_CODE = "123456";

export const sendOtp = async (phone: string): Promise<{ success: boolean; message: string }> => {
  // TODO BACKEND: POST /api/auth/otp/send
  console.log(`[Mock] OTP envoyé au ${phone} — Code: ${MOCK_OTP_CODE}`);
  return { success: true, message: `Code envoyé (test: ${MOCK_OTP_CODE})` };
};

export const verifyOtp = async (phone: string, code: string): Promise<{ success: boolean; patientId?: string }> => {
  // TODO BACKEND: POST /api/auth/otp/verify
  if (code === MOCK_OTP_CODE) {
    const patientId = `guest-${Date.now()}`;
    // Create mock guest session
    localStorage.setItem("userRole", "patient");
    localStorage.setItem("guestPatientId", patientId);
    localStorage.setItem("guestPhone", phone);
    return { success: true, patientId };
  }
  return { success: false };
};
