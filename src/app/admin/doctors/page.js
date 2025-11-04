"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";

// Onboarding Modal Component
function OnboardingModal({ isOpen, onClose, doctor, onSave }) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    specialization: "",
    experience_years: "",
    license_number: "",
    clinic_name: "",
    clinic_address: "",
    available_days: [],
    available_time: { start: "09:00", end: "17:00" },
    speciality_tags: [],
    consultation_fee: "",
    qualification: "",
    indemnity_insurance: "",
    dmc_mci_certificate: "",
    aadhaar_pan_license: "",
    address_proof: "",
    passport_photo: "",
    bank_account_details: { account_no: "", ifsc: "", bank_name: "" },
    digital_consent: false,
    onboarding_status: "pending",
    phone_number: "",
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // File states
  const [dmc_mci_certificate_file, setDmcMciCertificateFile] = useState(null);
  const [aadhaar_pan_license_file, setAadhaarPanLicenseFile] = useState(null);
  const [address_proof_file, setAddressProofFile] = useState(null);
  const [passport_photo_file, setPassportPhotoFile] = useState(null);

  const daysOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const specialityOptions = [
    "Cardiology",
    "Dermatology",
    "Neurology",
    "Pediatrics",
    "Orthopedics",
    "Psychiatry",
    "Surgery",
    "Dentistry",
    "Ophthalmology",
    "ENT",
    "Gynecology",
    "Urology",
    "Endocrinology",
    "Gastroenterology",
    "Nephrology",
  ];

  useEffect(() => {
    if (doctor) {
      setFormData({
        full_name: doctor.doctor_details?.full_name || "",
        email: doctor.doctor_details?.email || "",
        specialization: doctor.doctor_details?.specialization || "",
        experience_years: doctor.doctor_details?.experience_years || "",
        license_number: doctor.doctor_details?.license_number || "",
        clinic_name: doctor.doctor_details?.clinic_name || "",
        clinic_address: doctor.doctor_details?.clinic_address || "",
        available_days: doctor.doctor_details?.available_days || [],
        available_time: doctor.doctor_details?.available_time || {
          start: "09:00",
          end: "17:00",
        },
        speciality_tags: doctor.doctor_details?.speciality_tags || [],
        consultation_fee: doctor.doctor_details?.consultation_fee || "",
        qualification: doctor.doctor_details?.qualification || "",
        indemnity_insurance: doctor.doctor_details?.indemnity_insurance || "",
        dmc_mci_certificate: doctor.doctor_details?.dmc_mci_certificate || "",
        aadhaar_pan_license: doctor.doctor_details?.aadhaar_pan_license || "",
        address_proof: doctor.doctor_details?.address_proof || "",
        passport_photo: doctor.doctor_details?.passport_photo || "",
        bank_account_details: doctor.doctor_details?.bank_account_details || {
          account_no: "",
          ifsc: "",
          bank_name: "",
        },
        digital_consent: doctor.doctor_details?.digital_consent || false,
        onboarding_status:
          doctor.doctor_details?.onboarding_status || "pending",
        phone_number: doctor.phone_number || "",
      });
    } else {
      setFormData({
        full_name: "",
        email: "",
        specialization: "",
        experience_years: "",
        license_number: "",
        clinic_name: "",
        clinic_address: "",
        available_days: [],
        available_time: { start: "09:00", end: "17:00" },
        speciality_tags: [],
        consultation_fee: "",
        qualification: "",
        indemnity_insurance: "",
        dmc_mci_certificate: "",
        aadhaar_pan_license: "",
        address_proof: "",
        passport_photo: "",
        bank_account_details: { account_no: "", ifsc: "", bank_name: "" },
        digital_consent: false,
        onboarding_status: "pending",
        phone_number: "",
      });
    }

    // Reset files when modal opens/closes
    setDmcMciCertificateFile(null);
    setAadhaarPanLicenseFile(null);
    setAddressProofFile(null);
    setPassportPhotoFile(null);
  }, [doctor, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const handleArrayToggle = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleFileChange = (setter, file) => {
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      // Validate file type
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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const submitFormData = new FormData();

      // Add all form fields
      Object.keys(formData).forEach((key) => {
        if (key === "available_days" || key === "speciality_tags") {
          formData[key].forEach((value) => submitFormData.append(key, value));
        } else if (key === "available_time" || key === "bank_account_details") {
          submitFormData.append(key, JSON.stringify(formData[key]));
        } else if (key === "digital_consent") {
          submitFormData.append(key, formData[key].toString());
        } else {
          submitFormData.append(key, formData[key]);
        }
      });

      // Add files
      if (dmc_mci_certificate_file)
        submitFormData.append(
          "dmc_mci_certificate_file",
          dmc_mci_certificate_file
        );
      if (aadhaar_pan_license_file)
        submitFormData.append(
          "aadhaar_pan_license_file",
          aadhaar_pan_license_file
        );
      if (address_proof_file)
        submitFormData.append("address_proof_file", address_proof_file);
      if (passport_photo_file)
        submitFormData.append("passport_photo_file", passport_photo_file);

      // Add ID for updates
      if (doctor) {
        submitFormData.append("id", doctor.id);
      }

      await onSave(submitFormData);
      onClose();
      toast.success(
        doctor
          ? "Doctor updated successfully!"
          : "Doctor onboarded successfully!"
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
            Full Name *
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => handleInputChange("full_name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="Dr. John Doe"
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
            placeholder="doctor@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Specialization *
          </label>
          <input
            type="text"
            value={formData.specialization}
            onChange={(e) =>
              handleInputChange("specialization", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="Cardiology"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Experience (Years) *
          </label>
          <input
            type="number"
            value={formData.experience_years}
            onChange={(e) =>
              handleInputChange("experience_years", parseInt(e.target.value))
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="5"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            License Number *
          </label>
          <input
            type="text"
            value={formData.license_number}
            onChange={(e) =>
              handleInputChange("license_number", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="MED123456"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Stethoscope className="w-5 h-5 text-gray-700 dark:text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Professional Details
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Qualification *
          </label>
          <input
            type="text"
            value={formData.qualification}
            onChange={(e) => handleInputChange("qualification", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="MBBS, MD"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Consultation Fee *
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.consultation_fee}
            onChange={(e) =>
              handleInputChange("consultation_fee", parseFloat(e.target.value))
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="500.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Indemnity Insurance
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.indemnity_insurance}
            onChange={(e) =>
              handleInputChange(
                "indemnity_insurance",
                parseFloat(e.target.value)
              )
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="1000000.00"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Speciality Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {specialityOptions.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleArrayToggle("speciality_tags", tag)}
              className={`px-3 py-2 rounded-full text-sm border transition-all duration-200 ${
                formData.speciality_tags.includes(tag)
                  ? "bg-black text-white border-black shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Building className="w-5 h-5 text-gray-700 dark:text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Clinic & Availability
        </h3>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Clinic Name
          </label>
          <input
            type="text"
            value={formData.clinic_name}
            onChange={(e) => handleInputChange("clinic_name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="City Hospital"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Clinic Address
          </label>
          <textarea
            value={formData.clinic_address}
            onChange={(e) =>
              handleInputChange("clinic_address", e.target.value)
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="Enter full clinic address"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Available Days
        </label>
        <div className="flex flex-wrap gap-2">
          {daysOptions.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => handleArrayToggle("available_days", day)}
              className={`px-4 py-2 rounded-lg text-sm border transition-all duration-200 ${
                formData.available_days.includes(day)
                  ? "bg-black text-white border-black shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Available From
          </label>
          <input
            type="time"
            value={formData.available_time.start}
            onChange={(e) =>
              handleNestedChange("available_time", "start", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Available To
          </label>
          <input
            type="time"
            value={formData.available_time.end}
            onChange={(e) =>
              handleNestedChange("available_time", "end", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent"
          />
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
          Documents & Bank Details
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileUploadField
          label="DMC/MCI Certificate"
          file={dmc_mci_certificate_file}
          setFile={setDmcMciCertificateFile}
        />
        <FileUploadField
          label="Aadhaar/PAN/License"
          file={aadhaar_pan_license_file}
          setFile={setAadhaarPanLicenseFile}
        />
        <FileUploadField
          label="Address Proof"
          file={address_proof_file}
          setFile={setAddressProofFile}
        />
        <FileUploadField
          label="Passport Photo"
          file={passport_photo_file}
          setFile={setPassportPhotoFile}
          accept=".jpg,.jpeg,.png"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bank Account Number
          </label>
          <input
            type="text"
            value={formData.bank_account_details.account_no}
            onChange={(e) =>
              handleNestedChange(
                "bank_account_details",
                "account_no",
                e.target.value
              )
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="1234567890"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            IFSC Code
          </label>
          <input
            type="text"
            value={formData.bank_account_details.ifsc}
            onChange={(e) =>
              handleNestedChange("bank_account_details", "ifsc", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="SBIN0001234"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bank Name
          </label>
          <input
            type="text"
            value={formData.bank_account_details.bank_name}
            onChange={(e) =>
              handleNestedChange(
                "bank_account_details",
                "bank_name",
                e.target.value
              )
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="State Bank of India"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-300 dark:border-gray-600">
        <input
          type="checkbox"
          id="digital_consent"
          checked={formData.digital_consent}
          onChange={(e) =>
            handleInputChange("digital_consent", e.target.checked)
          }
          className="rounded border-gray-300 dark:border-gray-600 text-black focus:ring-black bg-white dark:bg-gray-700"
        />
        <label
          htmlFor="digital_consent"
          className="text-sm text-gray-700 dark:text-gray-300"
        >
          I agree to the digital consent terms and conditions
        </label>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
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
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {doctor ? "Update Doctor" : "Onboard New Doctor"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {doctor
                  ? "Update doctor information"
                  : "Add a new doctor to the system"}
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
                disabled={loading}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all duration-200 shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : doctor ? (
                  "Update Doctor"
                ) : (
                  "Onboard Doctor"
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Enhanced Doctor Details Modal Component
function DoctorDetailsModal({ doctor, isOpen, onClose }) {
  if (!isOpen || !doctor) return null;

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

  const getOnboardingStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800";
      case "rejected":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800";
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
        .toUpperCase() || "D"
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <User className="w-8 h-8 text-gray-700 dark:text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Doctor Details
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Complete professional information
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                >
                  <XCircle size={24} />
                </motion.button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[80vh]">
              {/* Profile Section */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    {doctor.profile_picture ? (
                      <motion.img
                        whileHover={{ scale: 1.05 }}
                        className="h-24 w-24 rounded-full object-cover shadow-xl border-4 border-gray-300 dark:border-gray-700"
                        src={doctor.profile_picture}
                        alt=""
                      />
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="h-24 w-24 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-900 flex items-center justify-center text-white font-bold text-2xl shadow-xl border-4 border-gray-300 dark:border-gray-700"
                      >
                        {getInitials(doctor.doctor_details?.full_name)}
                      </motion.div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {doctor.doctor_details?.full_name || "Unknown"}
                    </h4>
                    <p className="text-lg text-gray-700 dark:text-gray-300 font-semibold mb-3">
                      {doctor.doctor_details?.specialization || "N/A"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                        <BadgeCheck size={14} className="mr-1" />
                        ID: {doctor.un_id || "N/A"}
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          doctor.status === 1 ? "active" : "inactive"
                        )}`}
                      >
                        {doctor.status === 1 ? "Active" : "Inactive"}
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getOnboardingStatusColor(
                          doctor.doctor_details?.onboarding_status
                        )}`}
                      >
                        {doctor.doctor_details?.onboarding_status || "pending"}
                      </span>
                      {doctor.doctor_details?.rating && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
                          <Star size={14} className="mr-1" />
                          {doctor.doctor_details.rating} ⭐ (
                          {doctor.doctor_details.total_reviews || 0} reviews)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Professional Information */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <GraduationCap className="w-5 h-5 text-gray-700 dark:text-white" />
                        </div>
                        <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Professional Information
                        </h5>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Specialization
                          </span>
                          <span className="text-sm text-gray-900 dark:text-white font-medium">
                            {doctor.doctor_details?.specialization ||
                              "Not provided"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Experience
                          </span>
                          <span className="text-sm text-gray-900 dark:text-white font-medium">
                            {doctor.doctor_details?.experience_years || "0"}{" "}
                            years
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Qualification
                          </span>
                          <span className="text-sm text-gray-900 dark:text-white font-medium">
                            {doctor.doctor_details?.qualification ||
                              "Not provided"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            License Number
                          </span>
                          <span className="text-sm text-gray-900 dark:text-white font-medium">
                            {doctor.doctor_details?.license_number ||
                              "Not provided"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Consultation Fee
                          </span>
                          <span className="text-sm text-gray-900 dark:text-white font-medium">
                            ₹{doctor.doctor_details?.consultation_fee || "0"}
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
                              {doctor.doctor_details?.email || "Not provided"}
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
                              {doctor.phone_number || "Not provided"}
                            </p>
                          </div>
                        </div>
                        {doctor.doctor_details?.clinic_name && (
                          <div className="flex items-start space-x-3 py-2">
                            <Building className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Clinic
                              </p>
                              <p className="text-sm text-gray-900 dark:text-white">
                                {doctor.doctor_details.clinic_name}
                              </p>
                              {doctor.doctor_details.clinic_address && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  {doctor.doctor_details.clinic_address}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Availability */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <Clock4 className="w-5 h-5 text-gray-700 dark:text-white" />
                        </div>
                        <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Availability
                        </h5>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Available Days
                          </span>
                          <span className="text-sm text-gray-900 dark:text-white font-medium">
                            {doctor.doctor_details?.available_days?.join(
                              ", "
                            ) || "Not set"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Available Time
                          </span>
                          <span className="text-sm text-gray-900 dark:text-white font-medium">
                            {doctor.doctor_details?.available_time?.start ||
                              "09:00"}{" "}
                            -{" "}
                            {doctor.doctor_details?.available_time?.end ||
                              "17:00"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Specialities */}
                    {doctor.doctor_details?.speciality_tags &&
                      doctor.doctor_details.speciality_tags.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                              <Award className="w-5 h-5 text-gray-700 dark:text-white" />
                            </div>
                            <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                              Specialities & Expertise
                            </h5>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {doctor.doctor_details.speciality_tags.map(
                              (tag, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg border border-gray-300 dark:border-gray-600 font-medium"
                                >
                                  {tag}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Documents & Financial */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <FileText className="w-5 h-5 text-gray-700 dark:text-white" />
                        </div>
                        <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Documents & Financial
                        </h5>
                      </div>
                      <div className="space-y-4">
                        {doctor.doctor_details?.dmc_mci_certificate && (
                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              DMC/MCI Certificate
                            </span>
                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                              Provided
                            </span>
                          </div>
                        )}
                        {doctor.doctor_details?.aadhaar_pan_license && (
                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Aadhaar/PAN
                            </span>
                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                              Provided
                            </span>
                          </div>
                        )}
                        {doctor.doctor_details?.indemnity_insurance && (
                          <div className="flex justify-between items-center py-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Indemnity Insurance
                            </span>
                            <span className="text-sm text-gray-900 dark:text-white font-medium">
                              ₹{doctor.doctor_details.indemnity_insurance}
                            </span>
                          </div>
                        )}
                        {doctor.doctor_details?.bank_account_details && (
                          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                              Bank Details
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {
                                doctor.doctor_details.bank_account_details
                                  .bank_name
                              }{" "}
                              •
                              {doctor.doctor_details.bank_account_details
                                .account_no
                                ? ` •••${doctor.doctor_details.bank_account_details.account_no.slice(
                                    -4
                                  )}`
                                : " Not provided"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                {(doctor.doctor_details?.qualification ||
                  doctor.doctor_details?.digital_consent) && (
                  <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {doctor.doctor_details?.qualification && (
                        <div>
                          <h6 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Qualifications
                          </h6>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {doctor.doctor_details.qualification}
                          </p>
                        </div>
                      )}
                      {doctor.doctor_details?.digital_consent && (
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Digital Consent Provided
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-gray-500">
                  Last updated:{" "}
                  {doctor.doctor_details?.updated_at
                    ? new Date(
                        doctor.doctor_details.updated_at
                      ).toLocaleDateString()
                    : "N/A"}
                </div>
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Main Doctors Page Component
export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [viewDoctor, setViewDoctor] = useState(null);
  const [editDoctor, setEditDoctor] = useState(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchDoctors = async (
    page = 1,
    search = searchTerm,
    status = statusFilter,
    specialization = specializationFilter
  ) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(status !== "all" && { status }),
        ...(specialization !== "all" && { specialization }),
      });

      const res = await fetch(`/api/doctors/get?${params}`);
      const data = await res.json();

      if (!data.success) throw new Error(data.error);

      setDoctors(data.data || []);
      setPagination(
        data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false,
        }
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctors(1, searchTerm, statusFilter, specializationFilter);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, specializationFilter]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    setConfirmOpen(false);
    if (selectedIds.length === 0) return toast.error("No doctors selected!");

    try {
      const res = await fetch("/api/doctors/delete-doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success("Doctors deleted successfully!");
        setSelectedIds([]);
        fetchDoctors(pagination.currentPage);
      } else {
        toast.error(result.error || "Failed to delete doctors");
      }
    } catch (err) {
      toast.error("Error: " + err.message);
    }
  };

  const handleStatusChange = async (doctorId, newStatus) => {
    try {
      const res = await fetch("/api/doctors/onboard/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: doctorId, status: newStatus }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success("Status updated successfully!");
        fetchDoctors(pagination.currentPage);
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } catch (err) {
      toast.error("Error: " + err.message);
    }
  };

  const handleSaveDoctor = async (formData) => {
    const url = editDoctor
      ? `/api/doctors/onboard/update`
      : `/api/doctors/onboard`;
    const method = editDoctor ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      body: formData,
    });

    const result = await res.json();
    if (!result.success) throw new Error(result.error);

    fetchDoctors(pagination.currentPage);
    setEditDoctor(null);
    setOnboardingOpen(false);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchDoctors(newPage);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(
      1,
      pagination.currentPage - Math.floor(maxVisiblePages / 2)
    );
    let endPage = Math.min(
      pagination.totalPages,
      startPage + maxVisiblePages - 1
    );

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "D"
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

  const getOnboardingStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800";
      case "rejected":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800";
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
          <div className="bg-white dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700/50">
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black p-6">
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
                      Doctor Management
                    </motion.h4>
                    <motion.p
                      className="text-gray-600 dark:text-gray-400 mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      Showing {pagination.totalItems} doctors
                    </motion.p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setEditDoctor(null);
                      setOnboardingOpen(true);
                    }}
                    className="flex items-center px-6 py-3 bg-black text-white font-semibold rounded-xl transition-all duration-300 mt-4 sm:mt-0 cursor-pointer shadow-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-800"
                  >
                    <Plus size={20} className="mr-2" />
                    Onboard Doctor
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
                    label: "Total Doctors",
                    value: pagination.totalItems,
                    icon: User,
                    color:
                      "from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900",
                  },
                  {
                    label: "Active Doctors",
                    value: doctors.filter((d) => d.status === 1).length,
                    icon: CheckCircle,
                    color:
                      "from-green-100 to-green-200 dark:from-green-800 dark:to-green-900",
                  },
                  {
                    label: "Pending Approval",
                    value: doctors.filter(
                      (d) => d.doctor_details?.onboarding_status === "pending"
                    ).length,
                    icon: AlertTriangle,
                    color:
                      "from-yellow-100 to-yellow-200 dark:from-yellow-800 dark:to-yellow-900",
                  },
                  {
                    label: "Current Page",
                    value: `${pagination.currentPage}/${pagination.totalPages}`,
                    icon: Calendar,
                    color:
                      "from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900",
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
                        <stat.icon className="w-6 h-6 text-gray-700 dark:text-white" />
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
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search doctors by name, specialization, or email..."
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

                    <motion.select
                      whileFocus={{ scale: 1.05 }}
                      value={specializationFilter}
                      onChange={(e) => setSpecializationFilter(e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent backdrop-blur-sm transition-all duration-300 cursor-pointer"
                    >
                      <option value="all">All Specializations</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Orthopedics">Orthopedics</option>
                    </motion.select>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fetchDoctors(1)}
                      className="p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 cursor-pointer backdrop-blur-sm"
                    >
                      <Filter size={20} />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 cursor-pointer backdrop-blur-sm"
                    >
                      <Download size={20} />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fetchDoctors(pagination.currentPage)}
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
                          {selectedIds.length} doctor(s) selected
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            const newStatus = 1; // Active
                            Promise.all(
                              selectedIds.map((id) =>
                                handleStatusChange(id, newStatus)
                              )
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
                            const newStatus = 0; // Inactive
                            Promise.all(
                              selectedIds.map((id) =>
                                handleStatusChange(id, newStatus)
                              )
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

              {/* Doctors Table */}
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
                ) : doctors.length === 0 ? (
                  <motion.div
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No doctors found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-500 mb-4">
                      {searchTerm ||
                      statusFilter !== "all" ||
                      specializationFilter !== "all"
                        ? "Try adjusting your search criteria"
                        : "Get started by onboarding your first doctor"}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setEditDoctor(null);
                        setOnboardingOpen(true);
                      }}
                      className="inline-flex items-center px-4 py-2 bg-black text-white font-medium rounded-lg transition-all duration-300 cursor-pointer border border-gray-300 dark:border-gray-700 hover:bg-gray-800"
                    >
                      <Plus size={20} className="mr-2" />
                      Onboard New Doctor
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
                                    ? doctors.map((d) => d.id)
                                    : []
                                )
                              }
                              checked={
                                doctors.length > 0 &&
                                selectedIds.length === doctors.length
                              }
                              className="rounded border-gray-300 dark:border-gray-600 text-black focus:ring-black bg-white dark:bg-gray-700 cursor-pointer"
                            />
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Doctor
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Specialization
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Experience
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Onboarding
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {doctors.map((doctor, index) => (
                          <motion.tr
                            key={doctor.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all duration-300 backdrop-blur-sm"
                          >
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(doctor.id)}
                                onChange={() => toggleSelect(doctor.id)}
                                className="rounded border-gray-300 dark:border-gray-600 text-black focus:ring-black bg-white dark:bg-gray-700 cursor-pointer"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  {doctor.profile_picture ? (
                                    <motion.img
                                      whileHover={{ scale: 1.1 }}
                                      className="h-10 w-10 rounded-full object-cover shadow-lg"
                                      src={doctor.profile_picture}
                                      alt=""
                                    />
                                  ) : (
                                    <motion.div
                                      whileHover={{ scale: 1.1 }}
                                      className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-900 flex items-center justify-center text-white font-medium text-sm shadow-lg"
                                    >
                                      {getInitials(
                                        doctor.doctor_details?.full_name
                                      )}
                                    </motion.div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {doctor.doctor_details?.full_name ||
                                      "Unknown"}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    ID: {doctor.un_id || "N/A"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <Award
                                  size={16}
                                  className="text-gray-400 dark:text-gray-400 mr-2"
                                />
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {doctor.doctor_details?.specialization ||
                                    "N/A"}
                                </span>
                              </div>
                              {doctor.doctor_details?.speciality_tags && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {doctor.doctor_details.speciality_tags
                                    .slice(0, 2)
                                    .map((tag) => (
                                      <span
                                        key={tag}
                                        className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  {doctor.doctor_details.speciality_tags
                                    .length > 2 && (
                                    <span className="text-xs text-gray-500 dark:text-gray-500">
                                      +
                                      {doctor.doctor_details.speciality_tags
                                        .length - 2}
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {doctor.doctor_details?.email || "No email"}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                                <Phone size={14} className="mr-1" />
                                {doctor.phone_number || "No phone"}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {doctor.doctor_details?.experience_years || "0"}{" "}
                                years
                              </div>
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <Star
                                  size={14}
                                  className="mr-1 text-yellow-500"
                                />
                                {doctor.doctor_details?.rating || "0.0"} (
                                {doctor.doctor_details?.total_reviews || 0})
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-2">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                    doctor.status === 1 ? "active" : "inactive"
                                  )}`}
                                >
                                  {doctor.status === 1 ? "Active" : "Inactive"}
                                </span>
                                <select
                                  value={doctor.status}
                                  onChange={(e) =>
                                    handleStatusChange(
                                      doctor.id,
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
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOnboardingStatusColor(
                                  doctor.doctor_details?.onboarding_status
                                )}`}
                              >
                                {doctor.doctor_details?.onboarding_status ||
                                  "pending"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => {
                                    setViewDoctor(doctor);
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
                                    setEditDoctor(doctor);
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
                                  onClick={() => toggleSelect(doctor.id)}
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

              {/* Pagination Component */}
              {doctors.length > 0 && (
                <motion.div
                  className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing{" "}
                      {(pagination.currentPage - 1) * pagination.itemsPerPage +
                        1}{" "}
                      to{" "}
                      {Math.min(
                        pagination.currentPage * pagination.itemsPerPage,
                        pagination.totalItems
                      )}{" "}
                      of {pagination.totalItems} doctors
                    </div>

                    <div className="flex items-center space-x-1">
                      {/* First Page */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePageChange(1)}
                        disabled={!pagination.hasPrevPage}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-300 backdrop-blur-sm"
                      >
                        <ChevronsLeft size={16} />
                      </motion.button>

                      {/* Previous Page */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handlePageChange(pagination.currentPage - 1)
                        }
                        disabled={!pagination.hasPrevPage}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-300 backdrop-blur-sm"
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
                              : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 backdrop-blur-sm"
                          }`}
                        >
                          {pageNum}
                        </motion.button>
                      ))}

                      {/* Next Page */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handlePageChange(pagination.currentPage + 1)
                        }
                        disabled={!pagination.hasNextPage}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-300 backdrop-blur-sm"
                      >
                        <ChevronRight size={16} />
                      </motion.button>

                      {/* Last Page */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePageChange(pagination.totalPages)}
                        disabled={!pagination.hasNextPage}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-300 backdrop-blur-sm"
                      >
                        <ChevronsRight size={16} />
                      </motion.button>
                    </div>

                    {/* Items Per Page Selector */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>Show:</span>
                      <select
                        value={pagination.itemsPerPage}
                        onChange={(e) => {
                          const newLimit = parseInt(e.target.value);
                          setPagination((prev) => ({
                            ...prev,
                            itemsPerPage: newLimit,
                          }));
                          fetchDoctors(1);
                        }}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent cursor-pointer backdrop-blur-sm"
                      >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                      </select>
                      <span>per page</span>
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
          setEditDoctor(null);
        }}
        doctor={editDoctor}
        onSave={handleSaveDoctor}
      />

      {/* Enhanced Doctor Details Modal */}
      <DoctorDetailsModal
        doctor={viewDoctor}
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setViewDoctor(null);
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
                  doctor(s)? This action cannot be undone.
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
