"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Plus,
  RefreshCw,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Star,
  Award,
  Building,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  FileText,
  Shield,
  CreditCard,
  BadgeCheck,
  Clock4,
  GraduationCap,
  Stethoscope,
  Upload,
  X,
  Store,
  Package,
  Receipt,
  ShieldCheck,
  FileCheck,
  Banknote,
  ExternalLink,
  QrCode,
} from "lucide-react";

// Terms and Conditions Modal Component
function TermsModal({ isOpen, onClose, onAccept }) {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    setAccepted(true);
    onAccept();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <FileText className="w-5 h-5 text-gray-700 dark:text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Terms & Conditions
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Please read and accept the terms to continue
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
            >
              <XCircle size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh] bg-gray-50 dark:bg-gray-800">
          <div className="space-y-6 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Privacy Policy
              </h4>
              <div className="space-y-3">
                <p>
                  <strong>1. Data Collection and Usage</strong><br />
                  We collect personal and business information including but not limited to:
                  - Owner name, contact details, and identification documents
                  - Pharmacy registration and license information
                  - Business documents (GSTIN, drug license, etc.)
                  - Location data and store details
                </p>
                
                <p>
                  <strong>2. Data Protection</strong><br />
                  Your data is protected with industry-standard security measures:
                  - Encryption of sensitive information
                  - Secure document storage
                  - Restricted access to personal data
                  - Regular security audits
                </p>
                
                <p>
                  <strong>3. Information Sharing</strong><br />
                  We may share your information with:
                  - Regulatory authorities as required by law
                  - Payment processors for transaction purposes
                  - Service providers for platform operations
                  - Legal authorities when mandated
                </p>
                
                <p>
                  <strong>4. Consent and Permissions</strong><br />
                  By accepting these terms, you agree to:
                  - Provide accurate and complete information
                  - Maintain updated documentation
                  - Allow verification of submitted documents
                  - Receive communications related to your account
                </p>
                
                <p>
                  <strong>5. Document Retention</strong><br />
                  We retain your documents for:
                  - Legal compliance requirements
                  - Service delivery purposes
                  - Audit and verification needs
                  - As long as your account remains active
                </p>
                
                <p>
                  <strong>6. Rights and Responsibilities</strong><br />
                  You have the right to:
                  - Access your personal information
                  - Request corrections to inaccurate data
                  - Withdraw consent (subject to legal obligations)
                  - Delete your account and associated data
                </p>
                
                <p>
                  <strong>7. Platform Usage</strong><br />
                  As a registered chemist, you agree to:
                  - Maintain valid licenses and certifications
                  - Comply with all applicable laws and regulations
                  - Provide genuine products and services
                  - Maintain professional conduct on the platform
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">
                    Important Notice
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-1">
                    By accepting these terms, you acknowledge that you have read, understood, 
                    and agree to be bound by all the conditions mentioned above. Please ensure 
                    all submitted documents are valid and up-to-date.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="accept-terms"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-black focus:ring-black bg-white dark:bg-gray-700"
              />
              <label htmlFor="accept-terms" className="text-sm text-gray-700 dark:text-gray-300">
                I have read and accept the Terms & Conditions
              </label>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAccept}
                disabled={!accepted}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Accept & Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Updated OnboardingModal Component
function OnboardingModal({ isOpen, onClose, chemist, onSave }) {
  const [formData, setFormData] = useState({
    owner_name: "",
    email: "",
    phone_number: "",
    pharmacy_name: "",
    address: "",
    latitude: "",
    longitude: "",
    gstin: "",
    payout_mode: "bank_transfer",
    mobile: "",
    whatsapp: "",
    registration_no: "",
    consent_terms: false,
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // File states (removed inventory_list)
  const [drug_license_file, setDrugLicenseFile] = useState(null);
  const [pharmacist_certificate_file, setPharmacistCertificateFile] = useState(null);
  const [pan_aadhaar_file, setPanAadhaarFile] = useState(null);
  const [gstin_certificate_file, setGstinCertificateFile] = useState(null);
  const [cancelled_cheque_file, setCancelledChequeFile] = useState(null);
  const [store_photo_file, setStorePhotoFile] = useState(null);
  const [consent_form_file, setConsentFormFile] = useState(null);
  const [declaration_form_file, setDeclarationFormFile] = useState(null);
  const [digital_signature_file, setDigitalSignatureFile] = useState(null);

  const payoutModes = ["bank_transfer", "upi", "cash", "cheque"];

  useEffect(() => {
    if (chemist) {
      setFormData({
        owner_name: chemist.owner_name || "",
        email: chemist.email || "",
        phone_number: chemist.users?.phone_number || "",
        pharmacy_name: chemist.pharmacy_name || "",
        address: chemist.address || "",
        latitude: chemist.latitude || "",
        longitude: chemist.longitude || "",
        gstin: chemist.gstin || "",
        payout_mode: chemist.payout_mode || "bank_transfer",
        mobile: chemist.mobile || "",
        whatsapp: chemist.whatsapp || "",
        registration_no: chemist.registration_no || "",
        consent_terms: chemist.consent_terms || false,
      });
    } else {
      setFormData({
        owner_name: "",
        email: "",
        phone_number: "",
        pharmacy_name: "",
        address: "",
        latitude: "",
        longitude: "",
        gstin: "",
        payout_mode: "bank_transfer",
        mobile: "",
        whatsapp: "",
        registration_no: "",
        consent_terms: false,
      });
    }

    setDrugLicenseFile(null);
    setPharmacistCertificateFile(null);
    setPanAadhaarFile(null);
    setGstinCertificateFile(null);
    setCancelledChequeFile(null);
    setStorePhotoFile(null);
    setConsentFormFile(null);
    setDeclarationFormFile(null);
    setDigitalSignatureFile(null);
  }, [chemist, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (setter, file) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload JPEG, PNG, or PDF files only");
        return;
      }
      setter(file);
    }
  };

  const removeFile = (setter) => {
    setter(null);
  };

  const handleAcceptTerms = () => {
    handleInputChange("consent_terms", true);
    setShowTermsModal(false);
  };

  const handleSubmit = async () => {
    if (!formData.consent_terms) {
      toast.error("Please accept the terms and conditions to continue");
      return;
    }

    setLoading(true);
    try {
      const submitFormData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "consent_terms") {
          submitFormData.append(key, formData[key].toString());
        } else {
          submitFormData.append(key, formData[key]);
        }
      });
      const fileFields = [
        { field: "drug_license", file: drug_license_file },
        { field: "pharmacist_certificate", file: pharmacist_certificate_file },
        { field: "pan_aadhaar", file: pan_aadhaar_file },
        { field: "gstin_certificate", file: gstin_certificate_file },
        { field: "cancelled_cheque", file: cancelled_cheque_file },
        { field: "store_photo", file: store_photo_file },
        { field: "consent_form", file: consent_form_file },
        { field: "declaration_form", file: declaration_form_file },
        { field: "digital_signature", file: digital_signature_file },
      ];

      fileFields.forEach(({ field, file }) => {
        if (file) submitFormData.append(`${field}_file`, file);
      });

      // Add ID for updates
      if (chemist) {
        submitFormData.append("id", chemist.id);
      }

      await onSave(submitFormData);
      onClose();
      toast.success(
        chemist
          ? "Chemist updated successfully!"
          : "Chemist onboarded successfully!"
      );
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const FileUploadField = ({
    label,
    file,
    setFile,
    accept = ".jpg,.jpeg,.png,.pdf",
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      {!file ? (
        <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            JPEG, PNG, PDF (Max 5MB)
          </p>
          <input
            type="file"
            accept={accept}
            onChange={(e) => handleFileChange(setFile, e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      ) : (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeFile(setFile)}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <User className="w-5 h-5 text-gray-700 dark:text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Basic Information
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Owner Name *
          </label>
          <input
            type="text"
            value={formData.owner_name}
            onChange={(e) => handleInputChange("owner_name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number *
          </label>
          <input
            type="text"
            value={formData.phone_number}
            onChange={(e) => handleInputChange("phone_number", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="+91 9876543210"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="chemist@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pharmacy Name *
          </label>
          <input
            type="text"
            value={formData.pharmacy_name}
            onChange={(e) => handleInputChange("pharmacy_name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="City Pharmacy"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Chemist Registration Number *
          </label>
          <input
            type="text"
            value={formData.registration_no}
            onChange={(e) => handleInputChange("registration_no", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="REG123456789"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Enter your official chemist registration number issued by the regulatory authority
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <MapPin className="w-5 h-5 text-gray-700 dark:text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Location & Contact Details
        </h3>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Address *
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="Enter full pharmacy address"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Latitude
            </label>
            <input
              type="text"
              value={formData.latitude}
              onChange={(e) => handleInputChange("latitude", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="28.6139"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Longitude
            </label>
            <input
              type="text"
              value={formData.longitude}
              onChange={(e) => handleInputChange("longitude", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="77.2090"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mobile
            </label>
            <input
              type="text"
              value={formData.mobile}
              onChange={(e) => handleInputChange("mobile", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="+91 9876543210"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              WhatsApp
            </label>
            <input
              type="text"
              value={formData.whatsapp}
              onChange={(e) => handleInputChange("whatsapp", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="+91 9876543210"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Receipt className="w-5 h-5 text-gray-700 dark:text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Business & Payment Details
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            GSTIN Number
          </label>
          <input
            type="text"
            value={formData.gstin}
            onChange={(e) => handleInputChange("gstin", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="07AABCU9603R1ZM"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Payout Mode *
          </label>
          <select
            value={formData.payout_mode}
            onChange={(e) => handleInputChange("payout_mode", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent"
          >
            {payoutModes.map((mode) => (
              <option key={mode} value={mode}>
                {mode.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Terms and Conditions */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="consent-terms"
            checked={formData.consent_terms}
            onChange={(e) => handleInputChange("consent_terms", e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600 text-black focus:ring-black bg-white dark:bg-gray-700 mt-1"
          />
          <div>
            <label htmlFor="consent-terms" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              I agree to the Terms & Conditions
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              By checking this box, you acknowledge that you have read and agree to our 
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline ml-1"
              >
                Privacy Policy and Terms of Service
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <FileText className="w-5 h-5 text-gray-700 dark:text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Documents & Certificates
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileUploadField
          label="Drug License"
          file={drug_license_file}
          setFile={setDrugLicenseFile}
        />
        <FileUploadField
          label="Pharmacist Certificate"
          file={pharmacist_certificate_file}
          setFile={setPharmacistCertificateFile}
        />
        <FileUploadField
          label="PAN/Aadhaar Card"
          file={pan_aadhaar_file}
          setFile={setPanAadhaarFile}
        />
        <FileUploadField
          label="GSTIN Certificate"
          file={gstin_certificate_file}
          setFile={setGstinCertificateFile}
        />
        <FileUploadField
          label="Cancelled Cheque"
          file={cancelled_cheque_file}
          setFile={setCancelledChequeFile}
        />
        <FileUploadField
          label="Store Photo"
          file={store_photo_file}
          setFile={setStorePhotoFile}
          accept=".jpg,.jpeg,.png"
        />
        <FileUploadField
          label="Consent Form"
          file={consent_form_file}
          setFile={setConsentFormFile}
        />
        <FileUploadField
          label="Declaration Form"
          file={declaration_form_file}
          setFile={setDeclarationFormFile}
        />
        <FileUploadField
          label="Digital Signature"
          file={digital_signature_file}
          setFile={setDigitalSignatureFile}
        />
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {chemist ? "Update Chemist" : "Onboard New Chemist"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  {chemist
                    ? "Update chemist information"
                    : "Add a new chemist to the system"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mt-4">
              {[1, 2, 3, 4].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                      step === stepNum
                        ? "bg-black text-white shadow-lg"
                        : step > stepNum
                        ? "bg-gray-600 text-white shadow-lg"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {stepNum}
                  </div>
                  {stepNum < 4 && (
                    <div
                      className={`w-12 h-1 mx-2 transition-all duration-300 ${
                        step > stepNum
                          ? "bg-gray-600"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[60vh] bg-gray-50 dark:bg-gray-800">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex justify-between">
              <button
                onClick={() => step > 1 && setStep(step - 1)}
                disabled={step === 1}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Previous
              </button>

              {step < 4 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-lg"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.consent_terms}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all duration-200 shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : chemist ? (
                    "Update Chemist"
                  ) : (
                    "Onboard Chemist"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleAcceptTerms}
      />
    </>
  );
}

function ChemistDetailsModal({ chemist, isOpen, onClose }) {
  if (!isOpen || !chemist) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl border border-gray-200 dark:border-gray-700">
        <ModalContent chemist={chemist} onClose={onClose} />
      </div>
    </div>
  );
}

function ModalContent({ chemist, onClose }) {
  const [activeTab, setActiveTab] = useState("details");
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800";
      case "inactive":
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700";
    }
  };

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "C"
    );
  };

  // Initialize map when location tab is active and coordinates are available
  useEffect(() => {
    if (
      activeTab === "location" &&
      chemist.latitude &&
      chemist.longitude &&
      window.google
    ) {
      const initializeMap = () => {
        const position = {
          lat: parseFloat(chemist.latitude),
          lng: parseFloat(chemist.longitude),
        };

        // Clear existing map
        if (mapRef.current) {
          mapRef.current = null;
        }
        if (markerRef.current) {
          markerRef.current.setMap(null);
        }

        // Create new map
        mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
          zoom: 15,
          center: position,
          styles: [
            {
              featureType: "all",
              elementType: "geometry",
              stylers: [{ color: "#f5f5f5" }],
            },
            {
              featureType: "all",
              elementType: "labels.text.fill",
              stylers: [{ color: "#616161" }],
            },
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        });

        // Create marker
        markerRef.current = new window.google.maps.Marker({
          position: position,
          map: mapRef.current,
          title: chemist.pharmacy_name || "Chemist Location",
          animation: window.google.maps.Animation.DROP,
        });

        // Create info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-semibold text-gray-900">${
                chemist.pharmacy_name || "Chemist"
              }</h3>
              <p class="text-sm text-gray-600">${
                chemist.address || "Location"
              }</p>
            </div>
          `,
        });

        markerRef.current.addListener("click", () => {
          infoWindow.open(mapRef.current, markerRef.current);
        });
      };

      initializeMap();
    }
  }, [
    activeTab,
    chemist.latitude,
    chemist.longitude,
    chemist.pharmacy_name,
    chemist.address,
  ]);

  // Load Google Maps script
  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src^="https://maps.googleapis.com/maps/api/js"]'
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY"
      }`;
      script.setAttribute("async", "");
      script.setAttribute("defer", "");
      script.setAttribute("loading", "async"); 
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else {
      if (window.google) {
        setMapLoaded(true);
      } else {
        existingScript.addEventListener("load", () => setMapLoaded(true));
      }
    }
  }, []);

  // Cleanup map when component unmounts
  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, []);

  // Render location content
  const renderLocationContent = () => {
    if (!chemist.latitude || !chemist.longitude) {
      return (
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">
              No location data available
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Location
          </h4>
          <a
            href={`https://www.google.com/maps?q=${chemist.latitude},${chemist.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm flex items-center space-x-1"
          >
            <span>Open in Google Maps</span>
            <ExternalLink size={14} />
          </a>
        </div>

        <div
          ref={mapContainerRef}
          className="h-64 w-full rounded-lg border border-gray-300 dark:border-gray-600"
        />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">
              Latitude:
            </span>
            <span className="ml-2 text-gray-900 dark:text-white">
              {chemist.latitude}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">
              Longitude:
            </span>
            <span className="ml-2 text-gray-900 dark:text-white">
              {chemist.longitude}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render documents content
  const renderDocumentsContent = () => {
    const documents = [
      { label: "Drug License", value: chemist.drug_license, icon: FileText },
      {
        label: "Pharmacist Certificate",
        value: chemist.pharmacist_certificate,
        icon: GraduationCap,
      },
      { label: "PAN/Aadhaar", value: chemist.pan_aadhaar, icon: CreditCard },
      {
        label: "GSTIN Certificate",
        value: chemist.gstin_certificate,
        icon: Receipt,
      },
      {
        label: "Cancelled Cheque",
        value: chemist.cancelled_cheque,
        icon: Banknote,
      },
      { label: "Store Photo", value: chemist.store_photo, icon: Store },
      { label: "Consent Form", value: chemist.consent_form, icon: ShieldCheck },
      {
        label: "Declaration Form",
        value: chemist.declaration_form,
        icon: FileCheck,
      },
      {
        label: "Digital Signature",
        value: chemist.digital_signature,
        icon: QrCode,
      },
    ];

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <FileCheck className="w-5 h-5 text-gray-700 dark:text-white" />
            </div>
            <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
              Documents Status
            </h5>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            {documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${
                      doc.value
                        ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    <doc.icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {doc.label}
                    </p>
                    <p
                      className={`text-xs ${
                        doc.value
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-500 dark:text-gray-500"
                      }`}
                    >
                      {doc.value ? "Uploaded" : "Pending"}
                    </p>
                  </div>
                </div>
                {doc.value && (
                  <a
                    href={doc.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    <Eye size={16} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render details content
  const renderDetailsContent = () => (
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Business Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Building className="w-5 h-5 text-gray-700 dark:text-white" />
            </div>
            <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
              Business Information
            </h5>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pharmacy Name
              </span>
              <span className="text-sm text-gray-900 dark:text-white font-medium">
                {chemist.pharmacy_name || "Not provided"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Owner Name
              </span>
              <span className="text-sm text-gray-900 dark:text-white font-medium">
                {chemist.owner_name || "Not provided"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                GSTIN
              </span>
              <span className="text-sm text-gray-900 dark:text-white font-medium">
                {chemist.gstin || "Not provided"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pharmacist Registration No.
              </span>
              <span className="text-sm text-gray-900 dark:text-white font-medium">
                {chemist.registration_no || "Not provided"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Payout Mode
              </span>
              <span className="text-sm text-gray-900 dark:text-white font-medium">
                {chemist.payout_mode
                  ? chemist.payout_mode
                      .split("_")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")
                  : "Not set"}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Mail className="w-5 h-5 text-gray-700 dark:text-white" />
            </div>
            <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
              Contact Information
            </h5>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 py-2">
              <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Email
                </p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {chemist.email || "Not provided"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 py-2">
              <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Phone
                </p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {chemist.users?.phone_number || "Not provided"}
                </p>
              </div>
            </div>
            {chemist.mobile && (
              <div className="flex items-center space-x-3 py-2">
                <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Mobile
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {chemist.mobile}
                  </p>
                </div>
              </div>
            )}
            {chemist.whatsapp && (
              <div className="flex items-center space-x-3 py-2">
                <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    WhatsApp
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {chemist.whatsapp}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Location Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-700 dark:text-white" />
            </div>
            <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
              Location Details
            </h5>
          </div>
          <div className="space-y-4">
            <div className="py-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Address
              </p>
              <p className="text-sm text-gray-900 dark:text-white">
                {chemist.address || "Not provided"}
              </p>
            </div>
            {(chemist.latitude || chemist.longitude) && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Latitude
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {chemist.latitude}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Longitude
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {chemist.longitude}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="p-6 pb-0 border-b rounded-t-2xl border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <Store className="w-8 h-8 text-gray-700 dark:text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Chemist Details
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Complete business information
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
          >
            <XCircle size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mt-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("details")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 ${
              activeTab === "details"
                ? "bg-black text-white border border-black"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <div className="flex items-center space-x-2">
              <User size={16} />
              <span>Details</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("location")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 ${
              activeTab === "location"
                ? "bg-black text-white border border-black"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <div className="flex items-center space-x-2">
              <MapPin size={16} />
              <span>Location</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 ${
              activeTab === "documents"
                ? "bg-black text-white border border-black"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText size={16} />
              <span>Documents</span>
            </div>
          </button>
        </div>
      </div>
      <div className="overflow-y-auto max-h-[70vh]">
        {/* Profile Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              {chemist.store_photo ? (
                <img
                  className="h-24 w-24 rounded-full object-cover shadow-xl border-4 border-gray-300 dark:border-gray-700"
                  src={chemist.store_photo}
                  alt="Store"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-900 dark:to-gray-900 flex items-center justify-center text-white font-bold text-2xl shadow-xl border-4 border-gray-300 dark:border-gray-700">
                  {getInitials(chemist.owner_name)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {chemist.pharmacy_name || "Unknown Pharmacy"}
              </h4>
              <p className="text-lg text-gray-700 dark:text-gray-300 font-semibold mb-3">
                {chemist.owner_name || "Unknown Owner"}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                  <BadgeCheck size={14} className="mr-1" />
                  ID: {chemist.users?.un_id || "N/A"}
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    chemist.users?.status || "active"
                  )}`}
                >
                  {chemist.users?.status === 1 ? "Active" : "Inactive"}
                </span>
                {chemist.gstin && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    <Receipt size={14} className="mr-1" />
                    GSTIN: {chemist.gstin}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "details" && renderDetailsContent()}
          {activeTab === "location" && renderLocationContent()}
          {activeTab === "documents" && renderDocumentsContent()}
        </div>
      </div>
      <div className="p-6 border-t rounded-b-2xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-500">
            Registered:{" "}
            {chemist.users?.created_at
              ? new Date(chemist.users.created_at).toLocaleDateString()
              : "N/A"}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ChemistsPage() {
  const [chemists, setChemists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [viewChemist, setViewChemist] = useState(null);
  const [editChemist, setEditChemist] = useState(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

   const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Fetch chemists
 const fetchChemists = async (page = 1, search = searchTerm, status = statusFilter) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.itemsPerPage.toString(),
        ...(search && { search }),
        ...(status !== "all" && { status }),
      });

      const response = await fetch(`/api/chemists/web?${params}`);
      const result = await response.json();

      if (result.success) {
        setChemists(result.data.data || []);
        setPagination(result.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false,
        });
      } else {
        toast.error(result.message || "Failed to fetch chemists");
      }
    } catch (error) {
      console.error("Error fetching chemists:", error);
      toast.error("Failed to load chemists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChemists(1, searchTerm, statusFilter);
  }, [searchTerm, statusFilter]);

   const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchChemists(newPage);
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newLimit) => {
    setPagination(prev => ({
      ...prev,
      itemsPerPage: newLimit,
      currentPage: 1, // Reset to first page when changing items per page
    }));
    // We'll refetch in the next useEffect
  };

  // Refetch when items per page changes
  useEffect(() => {
    if (pagination.itemsPerPage) {
      fetchChemists(1);
    }
  }, [pagination.itemsPerPage]);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    setConfirmOpen(false);
    if (selectedIds.length === 0) return toast.error("No chemists selected!");

    try {
      const res = await fetch("/api/chemists/web/delete-multiple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success("Chemists deleted successfully!");
        setSelectedIds([]);
        fetchChemists();
      } else {
        toast.error(result.message || "Failed to delete chemists");
      }
    } catch (err) {
      toast.error("Error: " + err.message);
    }
  };

  const handleStatusChange = async (chemistId, newStatus) => {
    try {
      const res = await fetch(`/api/chemists/web/${chemistId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success("Status updated successfully!");
        fetchChemists();
      } else {
        toast.error(result.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("Error: " + err.message);
    }
  };

  const handleSaveChemist = async (formData) => {
    const url = editChemist
      ? `/api/chemists/web/${editChemist.id}`
      : `/api/chemists/web`;
    const method = editChemist ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      body: formData,
    });

    const result = await res.json();
    if (!result.success) throw new Error(result.message);

    fetchChemists();
    setEditChemist(null);
    setOnboardingOpen(false);
  };

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "C"
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800";
      case "inactive":
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
    hover: {
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
      },
    },
  };

  return (
    <>
      <main className="flex-1 overflow-auto relative z-0">
        <div className="p-4 md:p-6 lg:p-8 bg-transparent">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="min-h-screen bg-gradient-to-br from-gray-50 rounded-2xl to-gray-100 dark:from-gray-900 dark:to-gray-800 p-2 md:p-4 lg:p-6">
              {/* Header Section */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <motion.h4
                      className="text-4xl font-bold text-gray-900 dark:text-white mb-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      Chemist Management
                    </motion.h4>
                    <motion.p
                      className="text-gray-600 dark:text-gray-400 mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} chemists
                    </motion.p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setEditChemist(null);
                      setOnboardingOpen(true);
                    }}
                    className="flex items-center px-6 py-3 bg-black text-white font-semibold rounded-xl transition-all duration-300 mt-4 sm:mt-0 cursor-pointer shadow-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-800"
                  >
                    <Plus size={20} className="mr-2" />
                    Onboard Chemist
                  </motion.button>
                </div>
              </motion.div>

              {/* Stats Cards */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {[
                  {
                    label: "Total Chemists",
                    value: chemists.length,
                    icon: Store,
                    color:
                      "from-gray-500 to-gray-600 dark:from-gray-800 dark:to-gray-900 text-gray-50",
                  },
                  {
                    label: "Active Chemists",
                    value: chemists.filter((c) => c.users?.status === 1).length,
                    icon: CheckCircle,
                    color:
                      "from-green-500 to-green-600 dark:from-green-800 dark:to-green-900 text-gray-50",
                  },
                  {
                    label: "Inactive Chemists",
                    value: chemists.filter((c) => c.users?.status === 0).length,
                    icon: XCircle,
                    color:
                      "from-red-500 to-red-600 dark:from-red-800 dark:to-red-900 text-gray-50",
                  },
                  {
                    label: "With GSTIN",
                    value: chemists.filter((c) => c.gstin).length,
                    icon: Receipt,
                    color:
                      "from-blue-500 to-blue-600 dark:from-blue-800 dark:to-blue-900 text-gray-50",
                  },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    variants={cardVariants}
                    whileHover="hover"
                    className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                          {stat.value}
                        </p>
                      </div>
                      <div
                        className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl shadow-lg border border-gray-300 dark:border-gray-600`}
                      >
                        <stat.icon className="w-6 h-6 text-gray-20 dark:text-white" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Controls Section */}
              <motion.div
                className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                 <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Search Bar */}
                  <motion.div
                    className="relative flex-1 max-w-md"
                    whileFocus={{ scale: 1.02 }}
                  >
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                    <input
                      type="text"
                      placeholder="Search chemists by name, pharmacy, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-black focus:border-transparent backdrop-blur-sm transition-all duration-300 cursor-text"
                    />
                  </motion.div>

                  {/* Filters and Actions */}
                  <div className="flex flex-wrap items-center gap-3">
                    <motion.select
                      whileFocus={{ scale: 1.05 }}
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent backdrop-blur-sm transition-all duration-300 cursor-pointer"
                    >
                      <option value="all">All Status</option>
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </motion.select>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fetchChemists(1)}
                      className="p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 cursor-pointer backdrop-blur-sm"
                    >
                      <Filter size={20} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fetchChemists(pagination.currentPage)}
                      disabled={loading}
                      className="p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer backdrop-blur-sm"
                    >
                      <RefreshCw
                        size={20}
                        className={loading ? "animate-spin" : ""}
                      />
                    </motion.button>
                  </div>
                </div>

                {/* Bulk Actions */}
                <AnimatePresence>
                  {selectedIds.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center justify-between mt-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border border-red-200 dark:border-red-800/50 backdrop-blur-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />
                        <span className="text-red-700 dark:text-red-300 font-medium">
                          {selectedIds.length} chemist(s) selected
                        </span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            Promise.all(
                              selectedIds.map((id) => handleStatusChange(id, 1))
                            );
                          }}
                          className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all duration-300 cursor-pointer text-sm"
                        >
                          <CheckCircle size={16} className="mr-1" />
                          Activate
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            Promise.all(
                              selectedIds.map((id) => handleStatusChange(id, 0))
                            );
                          }}
                          className="flex items-center px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-all duration-300 cursor-pointer text-sm"
                        >
                          <XCircle size={16} className="mr-1" />
                          Deactivate
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setConfirmOpen(true)}
                          className="flex items-center px-3 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-medium rounded-lg transition-all duration-300 cursor-pointer text-sm"
                        >
                          <Trash2 size={16} className="mr-1" />
                          Delete Selected
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Chemists Table */}
              <motion.div
                className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {loading ? (
                  <motion.div
                    className="flex items-center justify-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <RefreshCw size={32} className="text-gray-400" />
                    </motion.div>
                  </motion.div>
                ) : chemists.length === 0 ? (
                  <motion.div
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No chemists found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-500 mb-4">
                      {searchTerm || statusFilter !== "all"
                        ? "Try adjusting your search criteria"
                        : "Get started by onboarding your first chemist"}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setEditChemist(null);
                        setOnboardingOpen(true);
                      }}
                      className="inline-flex items-center px-4 py-2 bg-black text-white font-medium rounded-lg transition-all duration-300 cursor-pointer border border-gray-300 dark:border-gray-700 hover:bg-gray-800"
                    >
                      <Plus size={20} className="mr-2" />
                      Onboard New Chemist
                    </motion.button>
                  </motion.div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-600">
                        <tr>
                          <th className="px-6 py-4 text-left">
                            <input
                              type="checkbox"
                              onChange={(e) =>
                                setSelectedIds(
                                  e.target.checked
                                    ? chemists.map((c) => c.id)
                                    : []
                                )
                              }
                              checked={
                                chemists.length > 0 &&
                                selectedIds.length === chemists.length
                              }
                              className="rounded border-gray-300 dark:border-gray-600 text-black focus:ring-black bg-white dark:bg-gray-700 cursor-pointer"
                            />
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Chemist
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Pharmacy
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            GSTIN
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {chemists.map((chemist, index) => (
                          <motion.tr
                            key={chemist.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all duration-300 backdrop-blur-sm"
                          >
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(chemist.id)}
                                onChange={() => toggleSelect(chemist.id)}
                                className="rounded border-gray-300 dark:border-gray-600 text-black focus:ring-black bg-white dark:bg-gray-700 cursor-pointer"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  {chemist.store_photo ? (
                                    <motion.img
                                      whileHover={{ scale: 1.1 }}
                                      className="h-10 w-10 rounded-full object-cover shadow-lg"
                                      src={chemist.store_photo}
                                      alt=""
                                    />
                                  ) : (
                                    <motion.div
                                      whileHover={{ scale: 1.1 }}
                                      className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 dark:from-gray-700 dark:to-gray-900 flex items-center justify-center text-white font-medium text-sm shadow-lg"
                                    >
                                      {getInitials(chemist.owner_name)}
                                    </motion.div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {chemist.owner_name || "Unknown"}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    ID: {chemist?.users?.un_id || "N/A"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <Store
                                  size={16}
                                  className="text-gray-400 dark:text-gray-400 mr-2"
                                />
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {chemist.pharmacy_name || "N/A"}
                                </span>
                              </div>
                              {chemist.address && (
                                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate max-w-xs">
                                  {chemist.address}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {chemist.email || "No email"}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                                <Phone size={14} className="mr-1" />
                                {chemist.users?.phone_number || "No phone"}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {chemist.gstin || "Not provided"}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {chemist.payout_mode
                                  ? chemist.payout_mode
                                      .split("_")
                                      .map(
                                        (word) =>
                                          word.charAt(0).toUpperCase() +
                                          word.slice(1)
                                      )
                                      .join(" ")
                                  : "No payout mode"}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-2">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                    chemist.users?.status === 1
                                      ? "active"
                                      : "inactive"
                                  )}`}
                                >
                                  {chemist.users?.status === 1
                                    ? "Active"
                                    : "Inactive"}
                                </span>
                                <select
                                  value={chemist.users?.status}
                                  onChange={(e) =>
                                    handleStatusChange(
                                      chemist.id,
                                      parseInt(e.target.value)
                                    )
                                  }
                                  className="text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1 focus:ring-2 focus:ring-black focus:border-transparent cursor-pointer"
                                >
                                  <option value={1}>Active</option>
                                  <option value={0}>Inactive</option>
                                </select>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => {
                                    setViewChemist(chemist);
                                    setDetailsModalOpen(true);
                                  }}
                                  className="p-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-all duration-300 cursor-pointer"
                                  title="View Details"
                                >
                                  <Eye size={18} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => {
                                    setEditChemist(chemist);
                                    setOnboardingOpen(true);
                                  }}
                                  className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-all duration-300 cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit size={18} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => toggleSelect(chemist.id)}
                                  className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-all duration-300 cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
              {chemists.length > 0 && (
                <motion.div
                  className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} chemists
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Items Per Page Selector */}
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>Show:</span>
                        <select
                          value={pagination.itemsPerPage}
                          onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent cursor-pointer"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                        </select>
                        <span>per page</span>
                      </div>

                      {/* Pagination Controls */}
                      <div className="flex items-center space-x-1">
                        {/* First Page */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePageChange(1)}
                          disabled={!pagination.hasPrevPage}
                          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-300"
                        >
                          <ChevronsLeft size={16} />
                        </motion.button>

                        {/* Previous Page */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePageChange(pagination.currentPage - 1)}
                          disabled={!pagination.hasPrevPage}
                          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-300"
                        >
                          <ChevronLeft size={16} />
                        </motion.button>

                        {/* Page Numbers */}
                        {getPageNumbers().map((pageNum) => (
                          <motion.button
                            key={pageNum}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-300 cursor-pointer ${
                              pageNum === pagination.currentPage
                                ? "bg-black border-transparent text-white shadow-lg"
                                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                            }`}
                          >
                            {pageNum}
                          </motion.button>
                        ))}

                        {/* Next Page */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePageChange(pagination.currentPage + 1)}
                          disabled={!pagination.hasNextPage}
                          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-300"
                        >
                          <ChevronRight size={16} />
                        </motion.button>

                        {/* Last Page */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePageChange(pagination.totalPages)}
                          disabled={!pagination.hasNextPage}
                          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-300"
                        >
                          <ChevronsRight size={16} />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => {
          setOnboardingOpen(false);
          setEditChemist(null);
        }}
        chemist={editChemist}
        onSave={handleSaveChemist}
      />

      {/* Enhanced Chemist Details Modal */}
      <ChemistDetailsModal
        chemist={viewChemist}
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setViewChemist(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md transform transition-all border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6 text-center">
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Confirm Deletion
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete {selectedIds.length}{" "}
                  chemist(s)? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setConfirmOpen(false)}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 font-medium cursor-pointer backdrop-blur-sm"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDelete}
                    className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg transition-all duration-300 font-medium cursor-pointer"
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
