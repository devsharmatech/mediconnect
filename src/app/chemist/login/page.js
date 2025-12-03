"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { sendOtp, verifyOtp, setLoggedInUser } from "@/lib/authHelpers";
import Image from "next/image";

export default function ChemistLogin() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    setLoading(true);
    const data = await sendOtp(phone, "chemist");
    setLoading(false);

    if (data.success) {
      setStep(2);
      setUserId(data.data.user_id);
      toast.success(`OTP sent successfully!`);
    } else {
      toast.error(data.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }

    setLoading(true);
    const data = await verifyOtp(userId, otp);
    setLoading(false);

    if (data.success) {
      setLoggedInUser("chemist", data.data.user);
      toast.success("OTP verified successfully!");
      router.push("/chemist/dashboard");
    } else {
      toast.error(data.message || "Invalid OTP");
    }
  };

  const handleBack = () => {
    setStep(1);
    setOtp("");
    setLoading(false);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900 p-4">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1e40af",
            color: "#fff",
            border: "1px solid #3b82f6",
          },
        }}
      />

      <div className="w-full max-w-4xl flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
        {/* Left Side - Chemistry Image */}
        <div className="md:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-8 flex flex-col justify-center items-center text-white">
          <div className="w-48 h-48 relative mb-6">
            {/* Chemistry Flask/Beaker Illustration */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Flask Body */}
                <div className="w-32 h-40 bg-blue-400/30 rounded-full border-4 border-blue-300/50">
                  {/* Liquid inside */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-28 h-32 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-full"></div>
                </div>
                
                {/* Flask Neck */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-blue-400/20 border-4 border-blue-300/50 rounded-t-full"></div>
                
                {/* Bubbles */}
                <div className="absolute top-4 left-8 w-4 h-4 bg-cyan-300/60 rounded-full animate-pulse"></div>
                <div className="absolute top-8 right-6 w-3 h-3 bg-cyan-300/60 rounded-full animate-pulse delay-300"></div>
                <div className="absolute top-16 left-10 w-5 h-5 bg-cyan-300/60 rounded-full animate-pulse delay-700"></div>
                
                {/* Molecular Structure */}
                <div className="absolute -top-4 -right-4">
                  <div className="relative w-16 h-16">
                    {/* Benzene ring or molecular structure */}
                    <div className="absolute inset-0 border-2 border-cyan-300/50 rounded-full"></div>
                    <div className="absolute inset-0 rotate-60 border-2 border-cyan-300/50 rounded-full"></div>
                    <div className="absolute inset-0 rotate-120 border-2 border-cyan-300/50 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-cyan-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-4 text-center">Chemist Portal</h2>
          <p className="text-blue-100 text-center max-w-md">
            Access your professional dashboard to manage prescriptions, 
            inventory, and patient records securely
          </p>
          
          {/* Chemistry Icons */}
          <div className="flex space-x-6 mt-8">
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-500/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm text-blue-200">Secure Access</span>
            </div>
            
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-500/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm text-blue-200">Verified</span>
            </div>
            
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-500/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-sm text-blue-200">Protected</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="md:w-1/2 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Chemist Login
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {step === 1
                ? "Enter your registered phone number"
                : "Enter verification code sent to your phone"}
            </p>
          </div>

          {/* Step 1: Phone Input */}
          {step === 1 ? (
            <div className="space-y-6">
              <div className="relative">
                <input
                  type="tel"
                  placeholder="+91 12345 67890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-4 pl-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 dark:bg-gray-700 dark:text-white transition-all duration-200"
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28l1.498 4.493-2.257 1.13a11 11 0 005.516 5.516l1.13-2.257 4.493 1.498V19a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"
                    />
                  </svg>
                </div>
              </div>

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 disabled:bg-gray-400 text-white rounded-xl font-semibold shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send OTP</span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 5l7 7-7 7M5 5l7 7-7 7"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Step 2: OTP */
            <div className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 dark:bg-gray-700 dark:text-white transition-all duration-200 text-center text-xl tracking-widest"
                  maxLength={6}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleBack}
                  disabled={loading}
                  className="flex-1 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-semibold transition-all duration-200"
                >
                  Back
                </button>
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 disabled:bg-gray-400 text-white rounded-xl font-semibold shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify OTP</span>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors duration-200"
                >
                  Resend OTP
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Secure chemist access portal • All data encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}