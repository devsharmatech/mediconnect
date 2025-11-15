"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import {
  User,
  Mail,
  Phone,
  Award,
  MapPin,
  Camera,
  FileText,
  Shield,
  BanknoteIcon,
  Calendar,
  Clock,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Star,
  Store,
  Building,
  FileCheck,
  Heart,
  Info,
  Lock,
  AlertTriangle,
  Package,
  Receipt,
  CreditCard,
  QrCode,
  Beaker,
  Microscope,
  TestTube,
  Activity,
} from "lucide-react";

// Default form data structure for lab
const defaultFormData = {
  // Personal Information
  owner_name: "",
  email: "",
  phone: "",
  mobile: "",
  whatsapp: "",
  contact_person: "",
  
  // Lab Information
  lab_name: "",
  license_number: "",
  registration_number: "",
  address: "",
  latitude: "",
  longitude: "",
  
  // Business Details
  gst_number: "",
  pan_number: "",
  years_experience: "",
  general_turnaround: "",
  accepts_home_collection: false,
  opening_hours: { open: "09:00", close: "18:00" },
  services: [],
  
  // KYC Data
  kyc_data: [],
  is_kyc: false,
  
  // Documents
  pan_card_file: null,
  aadhaar_card_file: null,
  lab_license_file: null,
  gst_certificate_file: null,
  owner_photo_file: null,
  signature_file: null,
  
  // Payment & Agreements
  payout_mode: "bank_transfer",
  bank_account_number: "",
  bank_ifsc_code: "",
  bank_name: "",
  bank_branch: "",
  
  // Agreements
  non_disclosure_agreement: false,
  terms_conditions_agreement: false,
  digital_consent: false,
  consent_terms: false,
};

export default function LabOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(defaultFormData);
  const [isClient, setIsClient] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [signatureData, setSignatureData] = useState("");
  const [activeSignatureTab, setActiveSignatureTab] = useState("draw");
  const [isDrawing, setIsDrawing] = useState(false);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycCompleted, setKycCompleted] = useState(false);

  const canvasRef = useRef(null);
  const fileInputRefs = useRef({});

  const steps = [
    { number: 1, title: "Lab Info", icon: Beaker, color: "blue" },
    { number: 2, title: "Location & Services", icon: MapPin, color: "green" },
    { number: 3, title: "Documents", icon: FileText, color: "orange" },
    { number: 4, title: "Bank & Agreements", icon: Shield, color: "purple" },
  ];

  const payoutModes = [
    { value: "bank_transfer", label: "Bank Transfer", icon: BanknoteIcon },
    { value: "upi", label: "UPI", icon: QrCode },
    { value: "cash", label: "Cash", icon: CreditCard },
    { value: "cheque", label: "Cheque", icon: FileText },
  ];

  const turnaroundOptions = [
    "Same day",
    "24 hours",
    "48 hours",
    "3-5 days",
    "1 week",
    "2 weeks"
  ];

  // Set isClient to true when component mounts on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load form data from localStorage after component mounts on client
  useEffect(() => {
    if (isClient) {
      const savedFormData = localStorage.getItem('labOnboardingFormData');
      const savedCurrentStep = localStorage.getItem('labOnboardingCurrentStep');
      
      if (savedFormData) {
        try {
          const parsedData = JSON.parse(savedFormData);
          setFormData(prev => ({
            ...defaultFormData,
            ...parsedData,
            services: parsedData.services || [],
            opening_hours: parsedData.opening_hours || { open: "09:00", close: "18:00" }
          }));
        } catch (error) {
          console.error('Error parsing saved form data:', error);
          localStorage.removeItem('labOnboardingFormData');
        }
      }
      
      if (savedCurrentStep) {
        setCurrentStep(parseInt(savedCurrentStep));
      }
    }
  }, [isClient]);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('labOnboardingFormData', JSON.stringify(formData));
    }
  }, [formData, isClient]);

  // Save current step to localStorage whenever it changes
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('labOnboardingCurrentStep', currentStep.toString());
    }
  }, [currentStep, isClient]);

  // Clean up localStorage when form is successfully submitted
  const clearLocalStorage = () => {
    if (isClient) {
      localStorage.removeItem('labOnboardingFormData');
      localStorage.removeItem('labOnboardingCurrentStep');
    }
  };

  // DigiLocker KYC Integration
  const handleDigiLockerKYC = async () => {
    try {
      setKycLoading(true);
      
      // Store current form data in localStorage before starting KYC process
      if (isClient) {
        localStorage.setItem('labOnboardingPreKycData', JSON.stringify(formData));
      }

      // Step 1: Get access token
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify({
        company_name: "chandanI1vF",
        secret_token: "FPWzvCOxPHTXuOXamPLtBgy0d9ve4am3",
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      const tokenResponse = await fetch(
        "https://digilocker.meon.co.in/get_access_token",
        requestOptions
      );
      const tokenData = await tokenResponse.json();
      
      if (!tokenData.client_token) {
        throw new Error("Failed to get access token");
      }

      const clientToken = tokenData.client_token;
      const state = tokenData.state;

      // Step 2: Get DigiLocker URL
      const urlHeaders = new Headers();
      urlHeaders.append("Content-Type", "application/json");

      // Use current page URL as redirect URL
      const currentUrl = window.location.href;
      const redirectUrl = `${
        currentUrl.split("?")[0]
      }?kyc_callback=true&state=${state}`;

      const urlRaw = JSON.stringify({
        client_token: clientToken,
        redirect_url: redirectUrl,
        company_name: "chandanI1vF",
        documents: "aadhaar,pan",
      });

      const urlRequestOptions = {
        method: "POST",
        headers: urlHeaders,
        body: urlRaw,
        redirect: "follow",
      };

      const urlResponse = await fetch(
        "https://digilocker.meon.co.in/digi_url",
        urlRequestOptions
      );
      const urlData = await urlResponse.json();

      if (urlData.url) {
        // Store client token for later use
        localStorage.setItem("digilocker_client_token", clientToken);

        // Redirect to DigiLocker
        window.location.href = urlData.url;
      } else {
        throw new Error("Failed to get DigiLocker URL");
      }
    } catch (error) {
      console.error("DigiLocker KYC error:", error);
      toast.error("Failed to initiate KYC process. Please try again.");
      setKycLoading(false);
    }
  };

  // Handle KYC callback
  useEffect(() => {
    const handleKycCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const kycCallback = urlParams.get("kyc_callback");
      const state = urlParams.get("state");
      const status = true;

      if (kycCallback && state && status) {
        try {
          const clientToken = localStorage.getItem("digilocker_client_token");

          if (!clientToken) {
            throw new Error("No client token found");
          }

          const dataHeaders = new Headers();
          dataHeaders.append("Content-Type", "application/json");

          const dataRaw = JSON.stringify({
            client_token: clientToken,
            state: state,
            status: true,
          });

          const dataRequestOptions = {
            method: "POST",
            headers: dataHeaders,
            body: dataRaw,
            redirect: "follow",
          };

          const dataResponse = await fetch(
            "https://digilocker.meon.co.in/v2/send_entire_data",
            dataRequestOptions
          );
          const kycData = await dataResponse.json();

          if (kycData.status) {
            if (kycData.data) {
              // Apply KYC data
              setFormData((prev) => ({
                ...prev,
                owner_name: kycData.data.name || prev.owner_name,
                email: kycData.data.email || prev.email,
                kyc_data: kycData.data || [],
                is_kyc: true,
              }));
            }
            setKycCompleted(true);
            toast.success("KYC verification completed successfully!");

            // Clean up URL
            window.history.replaceState({}, "", window.location.pathname);
          }
        } catch (error) {
          console.error("KYC data fetch error:", error);
          toast.error("Failed to fetch KYC data. Please try again.");
          
          // Restore form data from localStorage if KYC failed
          if (isClient) {
            const preKycData = localStorage.getItem('labOnboardingPreKycData');
            if (preKycData) {
              try {
                const parsedPreKycData = JSON.parse(preKycData);
                setFormData(parsedPreKycData);
              } catch (parseError) {
                console.error('Error parsing pre-KYC data:', parseError);
              }
            }
          }
        } finally {
          setKycLoading(false);
          localStorage.removeItem("digilocker_client_token");
          localStorage.removeItem('labOnboardingPreKycData');
        }
      }
    };

    if (isClient) {
      handleKycCallback();
    }
  }, [formData, isClient]);

  // Initialize signature canvas with proper error handling
  const initializeCanvas = () => {
    if (!canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Set canvas size properly
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Set drawing styles
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    } catch (error) {
      console.error("Error initializing canvas:", error);
    }
  };

  useEffect(() => {
    if (showSignatureModal) {
      const timer = setTimeout(() => {
        if (activeSignatureTab === "draw") {
          initializeCanvas();
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [showSignatureModal, activeSignatureTab]);

  // Enhanced Signature functionality with error handling
  const startDrawing = (e) => {
    if (!canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext("2d");

      setIsDrawing(true);
      ctx.beginPath();
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ctx.moveTo(x, y);
    } catch (error) {
      console.error("Error starting drawing:", error);
    }
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext("2d");

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ctx.lineTo(x, y);
      ctx.stroke();
    } catch (error) {
      console.error("Error drawing:", error);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    if (!canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
    } catch (error) {
      console.error("Error clearing signature:", error);
    }
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG)");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size should be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSignatureData(event.target.result);
    };
    reader.onerror = () => {
      toast.error("Error reading file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const saveSignature = () => {
    try {
      if (activeSignatureTab === "draw") {
        if (!canvasRef.current) {
          toast.error("Please draw your signature first");
          return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // Check if canvas has any drawing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let isEmpty = true;

        for (let i = 0; i < imageData.data.length; i += 4) {
          if (imageData.data[i + 3] !== 0) {
            isEmpty = false;
            break;
          }
        }

        if (isEmpty) {
          toast.error("Please draw your signature before saving");
          return;
        }

        const signature = canvas.toDataURL("image/png");
        setSignatureData(signature);
        setFormData((prev) => ({ ...prev, signature_file: signature }));
      } else if (activeSignatureTab === "upload") {
        if (!signatureData) {
          toast.error("Please upload a signature image first");
          return;
        }
        setFormData((prev) => ({ ...prev, signature_file: signatureData }));
      }

      setShowSignatureModal(false);
      toast.success("Signature saved successfully!");
    } catch (error) {
      console.error("Error saving signature:", error);
      toast.error("Failed to save signature. Please try again.");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileUpload = (field, files) => {
    const file = files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload JPEG, PNG, or PDF files only");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));
    toast.success("File uploaded successfully!");
  };

  const removeFile = (field) => {
    setFormData((prev) => ({ ...prev, [field]: null }));
  };

  // Service management functions
  const [newService, setNewService] = useState({ service_name: "", price: "" });

  const addService = () => {
    if (newService.service_name && newService.price) {
      const updatedServices = [...formData.services, {
        service_name: newService.service_name,
        price: parseFloat(newService.price)
      }];
      setFormData(prev => ({
        ...prev,
        services: updatedServices
      }));
      setNewService({ service_name: "", price: "" });
    }
  };

  const removeService = (index) => {
    const updatedServices = formData.services.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      services: updatedServices
    }));
  };

  const handleOpeningHoursChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [field]: value
      }
    }));
  };

  // Get geolocation
  useEffect(() => {
    if (isClient && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          }));
        },
        (error) => {
          console.log("Geolocation error:", error);
        }
      );
    }
  }, [isClient]);

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.lab_name) newErrors.lab_name = "Lab name is required";
        if (!formData.owner_name) newErrors.owner_name = "Owner name is required";
        if (!formData.email) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email))
          newErrors.email = "Email is invalid";
        if (!formData.phone) newErrors.phone = "Phone is required";
        else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, "")))
          newErrors.phone = "Please enter a valid 10-digit Indian phone number";
        if (!formData.license_number)
          newErrors.license_number = "Lab license number is required";
        if (!formData.is_kyc)
          newErrors.kyc = "KYC verification is required";
        break;

      case 2:
        if (!formData.address) newErrors.address = "Address is required";
        if (!formData.general_turnaround) newErrors.general_turnaround = "Turnaround time is required";
        if (formData.services.length === 0) newErrors.services = "At least one service is required";
        
        // Validate required documents for step 2
        if (!formData.lab_license_file) newErrors.lab_license_file = "Lab license file is required";
        break;

      case 3:
        // GST validation
        if (formData.gst_number && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gst_number))
          newErrors.gst_number = "Please enter a valid GST number";

        // PAN validation
        if (formData.pan_number && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_number))
          newErrors.pan_number = "Please enter a valid PAN number";

        // Validate additional documents
        if (!formData.pan_card_file) newErrors.pan_card_file = "PAN card is required";
        if (!formData.aadhaar_card_file) newErrors.aadhaar_card_file = "Aadhaar card is required";
        if (!formData.owner_photo_file) newErrors.owner_photo_file = "Owner photo is required";
        break;

      case 4:
        // Bank account validation
        if (formData.payout_mode === "bank_transfer") {
          if (!formData.bank_account_number) newErrors.bank_account_number = "Bank account number is required";
          else if (!/^\d{9,18}$/.test(formData.bank_account_number.replace(/\s/g, "")))
            newErrors.bank_account_number = "Please enter a valid bank account number (9-18 digits)";

          if (!formData.bank_ifsc_code) newErrors.bank_ifsc_code = "IFSC code is required";
          else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.bank_ifsc_code))
            newErrors.bank_ifsc_code = "Please enter a valid IFSC code";
        }

        // Digital consent validation
        if (!formData.digital_consent)
          newErrors.digital_consent = "Digital consent is required to proceed";
        if (!formData.consent_terms)
          newErrors.consent_terms = "You must accept the terms and conditions";
        if (!formData.non_disclosure_agreement)
          newErrors.non_disclosure_agreement = "Non-disclosure agreement is required";
        if (!formData.terms_conditions_agreement)
          newErrors.terms_conditions_agreement = "Terms and conditions agreement is required";

        break;
    }

    setErrors(newErrors);
    
    // Show error toast if there are validation errors
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the validation errors before proceeding");
      return false;
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    try {
      setLoading(true);
      toast.loading("Submitting your application...", { id: "loading" });

      const fd = new FormData();

      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value === null || value === undefined) return;

        if (typeof value === "boolean") {
          fd.append(key, value.toString());
        } else if (value instanceof File) {
          fd.append(key, value);
        } else if (Array.isArray(value)) {
          fd.append(key, JSON.stringify(value));
        } else if (typeof value === "object") {
          fd.append(key, JSON.stringify(value));
        } else {
          fd.append(key, value);
        }
      });

      // Send to API
      const res = await fetch("/api/labs/onboard/web", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      toast.dismiss("loading");
      if (data.success) {
        toast.success("✅ Lab onboarded successfully!");
        setLoading(false);
        clearLocalStorage();
        // Reset form
        setFormData(defaultFormData);
        setCurrentStep(1);
      } else {
        toast.error(`❌ ${data.message || "Failed to submit"}`);
        setLoading(false);
      }
    } catch (err) {
      toast.dismiss("loading");
      console.error("Error submitting form:", err);
      toast.error("Something went wrong! Please try again.");
      setLoading(false);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  const FileUploadBox = ({
    field,
    label,
    accept,
    required = false,
  }) => (
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-500 transition-colors">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        {label} {required && <span className="text-red-500">*</span>}
        {errors[field] && (
          <span className="text-red-500 text-sm ml-2">({errors[field]})</span>
        )}
      </label>

      <div className="text-center">
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
        <p className="text-sm text-gray-500">PNG, JPG, PDF up to 5MB</p>

        <input
          type="file"
          accept={accept}
          onChange={(e) => handleFileUpload(field, e.target.files)}
          className="hidden"
          id={field}
        />
        <label
          htmlFor={field}
          className="inline-block mt-4 bg-blue-800 text-white px-6 py-2 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
        >
          Choose File
        </label>
      </div>

      {/* File preview */}
      {formData[field] && (
        <div className="mt-4">
          <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileCheck className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-700">
                {formData[field].name || "File uploaded"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => removeFile(field)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const ServiceInput = () => (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Service name"
          value={newService.service_name}
          onChange={(e) => setNewService(prev => ({ ...prev, service_name: e.target.value }))}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <input
          type="number"
          placeholder="Price"
          value={newService.price}
          onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))}
          className="w-32 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={addService}
          className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
        >
          Add
        </button>
      </div>
      
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {formData.services.map((service, index) => (
          <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <span className="font-medium text-gray-900">{service.service_name}</span>
              <span className="ml-2 text-green-600">₹{service.price}</span>
            </div>
            <button
              type="button"
              onClick={() => removeService(index)}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      {errors.services && (
        <p className="text-red-500 text-sm mt-1 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {errors.services}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="bg-gradient-to-r from-blue-800 to-blue-800 text-white rounded-2xl p-8 shadow-2xl">
            <h1 className="text-4xl font-bold mb-4">Lab Onboarding Form</h1>
            <p className="text-xl opacity-90">
              Join our network of diagnostic laboratories
            </p>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="mb-4">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="text-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 border-4 ${
                    currentStep > step.number
                      ? "bg-green-500 border-green-500 text-white"
                      : currentStep === step.number
                      ? "bg-blue-800 border-blue-800 text-white shadow-lg"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {currentStep > step.number ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                <span
                  className={`text-sm font-semibold ${
                    currentStep >= step.number
                      ? "text-blue-800"
                      : "text-gray-500"
                  }`}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Lab Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-8"
              >
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-blue-800 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                    <Beaker className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Lab Information
                    </h2>
                    <p className="text-gray-600">Tell us about your lab</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lab Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lab_name}
                      onChange={(e) =>
                        handleInputChange("lab_name", e.target.value)
                      }
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        errors.lab_name
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter lab name"
                    />
                    {errors.lab_name && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.lab_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Owner Name *
                    </label>
                    <input
                      type="text"
                      value={formData.owner_name}
                      onChange={(e) =>
                        handleInputChange("owner_name", e.target.value)
                      }
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        errors.owner_name
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter owner name"
                    />
                    {errors.owner_name && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.owner_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="lab@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="+91 98765 43210"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) =>
                        handleInputChange("mobile", e.target.value)
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) =>
                        handleInputChange("whatsapp", e.target.value)
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={formData.contact_person}
                      onChange={(e) =>
                        handleInputChange("contact_person", e.target.value)
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Contact person name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    <select
                      value={formData.years_experience}
                      onChange={(e) =>
                        handleInputChange("years_experience", e.target.value)
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="">Select years</option>
                      {Array.from({ length: 50 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} Years
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lab License No. *
                    </label>
                    <input
                      type="text"
                      value={formData.license_number}
                      onChange={(e) =>
                        handleInputChange("license_number", e.target.value)
                      }
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        errors.license_number
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Lab license number"
                    />
                    {errors.license_number && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.license_number}
                      </p>
                    )}
                  </div>

                  {/* KYC Section */}
                  <div className="md:col-span-2">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-50 border-2 border-blue-200 rounded-xl p-6">
                      <div className="flex items-center flex-wrap justify-between">
                        <div className="flex items-center flex-wrap space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Shield className="w-6 h-6 text-blue-800" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              DigiLocker KYC Verification
                            </h3>
                            <p className="text-gray-600 text-sm">
                              Sync your Aadhaar and PAN details automatically
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          {kycCompleted ? (
                            <div className="flex items-center space-x-2 text-green-600">
                              <CheckCircle className="w-6 h-6" />
                              <span className="font-semibold">Verified</span>
                            </div>
                          ) : (
                            <motion.button
                              type="button"
                              onClick={handleDigiLockerKYC}
                              disabled={kycLoading}
                              whileHover={{ scale: kycLoading ? 1 : 1.02 }}
                              whileTap={{ scale: kycLoading ? 1 : 0.98 }}
                              className="bg-gradient-to-r from-blue-800 to-blue-800 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {kycLoading ? (
                                <div className="flex items-center space-x-2">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  <span>Processing...</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <FileCheck className="w-5 h-5" />
                                  <span>Verify with DigiLocker</span>
                                </div>
                              )}
                            </motion.button>
                          )}
                        </div>
                      </div>

                      {kycCompleted && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200"
                        >
                          <div className="flex items-center space-x-2 text-green-800">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">
                              Your KYC has been verified successfully!
                            </span>
                          </div>
                          <p className="text-green-700 text-sm mt-1">
                            Your Aadhaar and PAN details have been automatically synced.
                          </p>
                        </motion.div>
                      )}
                    </div>
                    {errors.kyc && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.kyc}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-blue-800 to-blue-800 text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all font-semibold shadow-md"
                  >
                    Next Step
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Location & Services */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-8"
              >
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Location & Services
                    </h2>
                    <p className="text-gray-600">
                      Your lab location and service offerings
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        rows={3}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                          errors.address ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Full lab address with landmark"
                      />
                      {errors.address && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.address}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Latitude
                        </label>
                        <input
                          type="text"
                          value={formData.latitude}
                          readOnly
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Longitude
                        </label>
                        <input
                          type="text"
                          value={formData.longitude}
                          readOnly
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Registration Number
                        </label>
                        <input
                          type="text"
                          value={formData.registration_number}
                          onChange={(e) =>
                            handleInputChange("registration_number", e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Lab registration number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          General Turnaround Time *
                        </label>
                        <select
                          value={formData.general_turnaround}
                          onChange={(e) =>
                            handleInputChange("general_turnaround", e.target.value)
                          }
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                            errors.general_turnaround ? "border-red-500" : "border-gray-300"
                          }`}
                        >
                          <option value="">Select turnaround time</option>
                          {turnaroundOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                        {errors.general_turnaround && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.general_turnaround}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg">
                      <input
                        type="checkbox"
                        id="home-collection"
                        checked={formData.accepts_home_collection}
                        onChange={(e) =>
                          handleInputChange("accepts_home_collection", e.target.checked)
                        }
                        className="rounded border-gray-300 text-blue-800 focus:ring-blue-500"
                      />
                      <label htmlFor="home-collection" className="text-sm font-medium text-gray-700">
                        Accepts Home Collection
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Opening Hours
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Open Time</label>
                          <input
                            type="time"
                            value={formData.opening_hours.open}
                            onChange={(e) => handleOpeningHoursChange('open', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Close Time</label>
                          <input
                            type="time"
                            value={formData.opening_hours.close}
                            onChange={(e) => handleOpeningHoursChange('close', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Services Section */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Lab Services
                    </h3>
                    <ServiceInput />
                  </div>

                  {/* Required Documents for Step 2 */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Required Documents
                    </h3>
                    <FileUploadBox
                      field="lab_license_file"
                      label="Lab License *"
                      accept="image/*,.pdf"
                      required={true}
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gray-500 text-white px-8 py-4 rounded-xl hover:bg-gray-600 transition-colors font-semibold shadow-md"
                  >
                    Previous
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all font-semibold shadow-md"
                  >
                    Next Step
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Documents */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-8"
              >
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Documents & Business Details
                    </h2>
                    <p className="text-gray-600">Upload required documents</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GST Number
                      </label>
                      <input
                        type="text"
                        value={formData.gst_number}
                        onChange={(e) =>
                          handleInputChange("gst_number", e.target.value)
                        }
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                          errors.gst_number ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="07AABCU9603R1ZM"
                      />
                      {errors.gst_number && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.gst_number}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PAN Number
                      </label>
                      <input
                        type="text"
                        value={formData.pan_number}
                        onChange={(e) =>
                          handleInputChange("pan_number", e.target.value)
                        }
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                          errors.pan_number ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="ABCDE1234F"
                      />
                      {errors.pan_number && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.pan_number}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FileUploadBox
                      field="pan_card_file"
                      label="PAN Card *"
                      accept="image/*,.pdf"
                      required={true}
                    />
                    <FileUploadBox
                      field="aadhaar_card_file"
                      label="Aadhaar Card *"
                      accept="image/*,.pdf"
                      required={true}
                    />
                    <FileUploadBox
                      field="gst_certificate_file"
                      label="GST Certificate"
                      accept="image/*,.pdf"
                      required={false}
                    />
                    <FileUploadBox
                      field="owner_photo_file"
                      label="Owner Photo *"
                      accept="image/*"
                      required={true}
                    />

                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-500 transition-colors">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Digital Signature
                      </label>
                      <div className="text-center">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        {formData.signature_file ? (
                          <div className="bg-green-50 p-4 rounded-lg">
                            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                            <p className="text-green-700 font-medium">
                              Signature Added
                            </p>
                          </div>
                        ) : (
                          <>
                            <p className="text-gray-600 mb-2">
                              Add your digital signature
                            </p>
                            <button
                              type="button"
                              onClick={() => setShowSignatureModal(true)}
                              className="mt-4 bg-blue-800 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Create Signature
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gray-500 text-white px-8 py-4 rounded-xl hover:bg-gray-600 transition-colors font-semibold shadow-md"
                  >
                    Previous
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-blue-800 to-blue-800 text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all font-semibold shadow-md"
                  >
                    Next Step
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Bank & Agreements */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-8"
              >
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Bank Details & Agreements
                    </h2>
                    <p className="text-gray-600">Finalize your application</p>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Bank Details */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                      Bank Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payout Mode
                        </label>
                        <select
                          value={formData.payout_mode}
                          onChange={(e) =>
                            handleInputChange("payout_mode", e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        >
                          {payoutModes.map((mode) => (
                            <option key={mode.value} value={mode.value}>
                              {mode.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bank Account Number
                          {formData.payout_mode === "bank_transfer" && " *"}
                        </label>
                        <input
                          type="text"
                          value={formData.bank_account_number}
                          onChange={(e) =>
                            handleInputChange(
                              "bank_account_number",
                              e.target.value
                            )
                          }
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                            errors.bank_account_number
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Account number"
                        />
                        {errors.bank_account_number && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.bank_account_number}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bank IFSC Code
                          {formData.payout_mode === "bank_transfer" && " *"}
                        </label>
                        <input
                          type="text"
                          value={formData.bank_ifsc_code}
                          onChange={(e) =>
                            handleInputChange("bank_ifsc_code", e.target.value)
                          }
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                            errors.bank_ifsc_code
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="IFSC code"
                        />
                        {errors.bank_ifsc_code && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.bank_ifsc_code}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          value={formData.bank_name}
                          onChange={(e) =>
                            handleInputChange("bank_name", e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Bank name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bank Branch
                        </label>
                        <input
                          type="text"
                          value={formData.bank_branch}
                          onChange={(e) =>
                            handleInputChange("bank_branch", e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Branch name"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Agreements */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                      Agreements
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.non_disclosure_agreement}
                          onChange={(e) =>
                            handleInputChange(
                              "non_disclosure_agreement",
                              e.target.checked
                            )
                          }
                          className={`w-5 h-5 rounded border-2 focus:ring-blue-500 ${
                            errors.non_disclosure_agreement
                              ? "border-red-500 text-red-500"
                              : "border-gray-300 text-blue-800"
                          }`}
                        />
                        <div>
                          <span className="font-semibold text-gray-700">
                            Non-Disclosure Agreement (NDA) *
                          </span>
                          <p className="text-gray-600 text-sm mt-1">
                            I agree to maintain confidentiality of patient and business information
                          </p>
                          {errors.non_disclosure_agreement && (
                            <p className="text-red-500 text-sm mt-1 flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {errors.non_disclosure_agreement}
                            </p>
                          )}
                        </div>
                      </label>

                      <label className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.terms_conditions_agreement}
                          onChange={(e) =>
                            handleInputChange(
                              "terms_conditions_agreement",
                              e.target.checked
                            )
                          }
                          className={`w-5 h-5 rounded border-2 focus:ring-blue-500 ${
                            errors.terms_conditions_agreement
                              ? "border-red-500 text-red-500"
                              : "border-gray-300 text-blue-800"
                          }`}
                        />
                        <div>
                          <span className="font-semibold text-gray-700">
                            Terms & Conditions *
                          </span>
                          <p className="text-gray-600 text-sm mt-1">
                            I agree to the platform terms and conditions
                          </p>
                          {errors.terms_conditions_agreement && (
                            <p className="text-red-500 text-sm mt-1 flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {errors.terms_conditions_agreement}
                            </p>
                          )}
                        </div>
                      </label>

                      <div className="bg-gradient-to-r from-blue-50 to-blue-50 p-6 rounded-xl border-2 border-blue-200">
                        <label className="flex items-start space-x-4 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.digital_consent}
                            onChange={(e) =>
                              handleInputChange(
                                "digital_consent",
                                e.target.checked
                              )
                            }
                            className={`w-5 h-5 rounded border-2 focus:ring-blue-500 mt-1 ${
                              errors.digital_consent
                                ? "border-red-500 text-red-500"
                                : "border-gray-300 text-blue-800"
                            }`}
                            required
                          />
                          <div className="flex-1">
                            <span className="font-semibold text-gray-700">
                              Digital Consent & Declaration *
                            </span>
                            <p className="text-gray-600 mt-2">
                              I consent to the{" "}
                              <button
                                type="button"
                                onClick={() => setShowConsentModal(true)}
                                className="text-blue-800 hover:text-blue-800 underline font-medium"
                              >
                                platform terms and conditions
                              </button>
                              , and confirm that all information provided is
                              accurate to the best of my knowledge.
                            </p>
                            {errors.digital_consent && (
                              <p className="text-red-500 text-sm mt-2 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {errors.digital_consent}
                              </p>
                            )}
                          </div>
                        </label>
                      </div>

                      <div className="bg-gradient-to-r from-green-50 to-green-50 p-6 rounded-xl border-2 border-green-200">
                        <label className="flex items-start space-x-4 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.consent_terms}
                            onChange={(e) =>
                              handleInputChange(
                                "consent_terms",
                                e.target.checked
                              )
                            }
                            className={`w-5 h-5 rounded border-2 focus:ring-green-500 mt-1 ${
                              errors.consent_terms
                                ? "border-red-500 text-red-500"
                                : "border-gray-300 text-green-600"
                            }`}
                            required
                          />
                          <div className="flex-1">
                            <span className="font-semibold text-gray-700">
                              Terms & Conditions Acceptance *
                            </span>
                            <p className="text-gray-600 mt-2">
                              I have read and accept the complete Terms & Conditions, 
                              Privacy Policy, and all associated agreements for lab onboarding.
                            </p>
                            {errors.consent_terms && (
                              <p className="text-red-500 text-sm mt-2 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {errors.consent_terms}
                              </p>
                            )}
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gray-500 text-white px-8 py-4 rounded-xl hover:bg-gray-600 transition-colors font-semibold shadow-md"
                  >
                    Previous
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      "Submit Application"
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </form>
        </div>
      </div>

      {/* Enhanced Signature Modal with Error Handling */}
      <AnimatePresence>
        {showSignatureModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSignatureModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-blue-800 to-blue-800 text-white p-6">
                <h3 className="text-2xl font-bold">Digital Signature</h3>
                <p className="opacity-90">Create your signature</p>
              </div>

              <div className="p-6">
                <div className="border-b border-gray-200 mb-6">
                  <div className="flex space-x-8">
                    <button
                      onClick={() => setActiveSignatureTab("draw")}
                      className={`pb-4 px-2 border-b-2 font-semibold transition-colors ${
                        activeSignatureTab === "draw"
                          ? "border-blue-800 text-blue-800"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Draw Signature
                    </button>
                    <button
                      onClick={() => setActiveSignatureTab("upload")}
                      className={`pb-4 px-2 border-b-2 font-semibold transition-colors ${
                        activeSignatureTab === "upload"
                          ? "border-blue-800 text-blue-800"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Upload Signature
                    </button>
                  </div>
                </div>

                {activeSignatureTab === "draw" && (
                  <div>
                    <p className="text-gray-600 mb-4">
                      Draw your signature in the box below:
                    </p>
                    <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                      <canvas
                        ref={canvasRef}
                        className="w-full h-64 border-2 border-gray-200 rounded bg-white cursor-crosshair touch-none"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          const touch = e.touches[0];
                          const mouseEvent = new MouseEvent("mousedown", {
                            clientX: touch.clientX,
                            clientY: touch.clientY,
                          });
                          canvasRef.current.dispatchEvent(mouseEvent);
                        }}
                        onTouchMove={(e) => {
                          e.preventDefault();
                          const touch = e.touches[0];
                          const mouseEvent = new MouseEvent("mousemove", {
                            clientX: touch.clientX,
                            clientY: touch.clientY,
                          });
                          canvasRef.current.dispatchEvent(mouseEvent);
                        }}
                        onTouchEnd={() => {
                          const mouseEvent = new MouseEvent("mouseup", {});
                          canvasRef.current.dispatchEvent(mouseEvent);
                        }}
                      />
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <button
                        onClick={clearSignature}
                        className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Clear</span>
                      </button>
                      <p className="text-sm text-gray-500">
                        Draw your signature clearly
                      </p>
                    </div>
                  </div>
                )}

                {activeSignatureTab === "upload" && (
                  <div>
                    <p className="text-gray-600 mb-4">
                      Upload your signature image:
                    </p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">
                        PNG or JPG files only (max 2MB)
                      </p>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleSignatureUpload}
                        className="w-full max-w-xs mx-auto"
                      />
                      {signatureData && (
                        <div className="mt-4">
                          <p className="text-green-600 font-medium mb-2">
                            Preview:
                          </p>
                          <img
                            src={signatureData}
                            alt="Signature preview"
                            className="max-h-32 mx-auto border rounded"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-4">
                <button
                  onClick={() => setShowSignatureModal(false)}
                  className="px-8 py-3 text-gray-600 hover:text-gray-800 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSignature}
                  className="bg-gradient-to-r from-blue-800 to-blue-800 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  Save Signature
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Consent Modal */}
      <AnimatePresence>
        {showConsentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-gradient-to-br from-white to-blue-50/30 rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl border border-white/20"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-blue-800 via-blue-800 to-indigo-700 text-white p-8 overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                        Lab Compliance & Terms
                      </h3>
                      <p className="text-blue-100 text-lg mt-1">
                        MediConnect.fit Laboratory Regulatory Compliance Framework
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 max-h-[60vh] overflow-y-auto">
                <div className="space-y-6 text-sm text-gray-700 dark:text-gray-300">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Laboratory Compliance Requirements
                    </h4>
                    <div className="space-y-3">
                      <p>
                        <strong>1. Laboratory License Compliance</strong><br />
                        All diagnostic labs must maintain valid licenses as per the 
                        Clinical Establishments Act and relevant state regulations.
                      </p>
                      
                      <p>
                        <strong>2. NABL Accreditation</strong><br />
                        Compliance with National Accreditation Board for Testing and Calibration Laboratories standards.
                      </p>
                      
                      <p>
                        <strong>3. Data Protection</strong><br />
                        Adherence to Digital Personal Data Protection Act (DPDP), 2023 
                        for patient data and test results.
                      </p>
                      
                      <p>
                        <strong>4. Quality Control Standards</strong><br />
                        Implementation of proper quality control measures and 
                        maintenance of test accuracy standards.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-200/50 px-8 py-6">
                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowConsentModal(false)}
                    className="bg-gradient-to-r from-blue-800 to-blue-800 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    I Understand & Agree
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}