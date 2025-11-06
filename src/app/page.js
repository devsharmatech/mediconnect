'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/website/Navbar';
import Footer from '@/components/website/Footer';
import AuthModal from '@/components/website/AuthModal';
import { 
  Brain, 
  Stethoscope, 
  Microscope, 
  ShoppingCart, 
  ArrowRight,
  CheckCircle,
  Play,
  Download,
  Shield,
  Zap,
  Users,
  Activity,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  Clock,
  ArrowUpRight
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
};

export default function Home() {
  const [authModal, setAuthModal] = useState({ isOpen: false, userType: 'patient' });
  const [activeStep, setActiveStep] = useState(0);

  const openAuthModal = (userType) => {
    setAuthModal({ isOpen: true, userType });
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, userType: 'patient' });
  };

  // Auto-rotate steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar onOpenAuth={openAuthModal} />
      
      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 min-h-screen flex items-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          ></motion.div>
          <motion.div 
            className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.2, 0.3]
            }}
            transition={{ duration: 10, repeat: Infinity }}
          ></motion.div>
          <motion.div 
            className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.25, 0.2]
            }}
            transition={{ duration: 12, repeat: Infinity }}
          ></motion.div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div 
              className="text-center lg:text-left"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.h1 
                className="text-5xl md:text-7xl font-black text-white leading-tight"
                variants={fadeInUp}
              >
                AI-Powered
                <motion.span 
                  className="block bg-gradient-to-r from-cyan-400 to-blue-200 bg-clip-text text-transparent mt-2"
                  variants={fadeInUp}
                >
                  Healthcare
                </motion.span>
                Revolution
              </motion.h1>
              
              <motion.p 
                className="mt-8 text-xl text-blue-100 max-w-2xl leading-relaxed"
                variants={fadeInUp}
              >
                Experience seamless healthcare with AI-driven symptom screening, instant doctor matching, lab test bookings, and medicine delivery - all in one intelligent platform connecting patients, doctors, labs, and chemists.
              </motion.p>

              <motion.div 
                className="mt-12 flex flex-col sm:flex-row gap-6 justify-center lg:justify-start"
                variants={fadeInUp}
              >
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openAuthModal('patient')}
                  className="bg-white text-blue-600 px-10 py-5 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-3xl flex items-center justify-center gap-3"
                >
                  <Play className="w-5 h-5" />
                  Start Free Health Check
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white text-white px-10 py-5 rounded-2xl hover:bg-white hover:text-blue-600 transition-all duration-300 font-bold text-lg backdrop-blur-sm flex items-center justify-center gap-3"
                >
                  <Download className="w-5 h-5" />
                  Download App
                </motion.button>
              </motion.div>

              {/* Stats */}
              <motion.div 
                className="mt-16 grid grid-cols-3 gap-8 text-center lg:text-left"
                variants={fadeInUp}
              >
                <div>
                  <div className="text-3xl font-bold text-white">50K+</div>
                  <div className="text-blue-200 text-sm">Patients Served</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">1K+</div>
                  <div className="text-blue-200 text-sm">Verified Doctors</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">24/7</div>
                  <div className="text-blue-200 text-sm">AI Support</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div 
              className="relative"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.div 
                className="relative z-10 bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl"
                variants={scaleIn}
              >
                {/* AI Chat Interface */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      <div className="flex-1 text-center">
                        <span className="font-semibold flex items-center justify-center gap-2">
                          <Brain className="w-4 h-4" />
                          AI Health Assistant
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <motion.div 
                        className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <p className="text-sm">Hello! I'm your AI health assistant. What symptoms are you experiencing today?</p>
                      </motion.div>
                      
                      <motion.div 
                        className="flex space-x-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                      >
                        {['Fever', 'Headache', 'Cough', 'More...'].map((symptom, index) => (
                          <motion.button
                            key={symptom}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white/30 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-full hover:bg-white/40 transition-colors"
                            style={{ animationDelay: `${1 + index * 0.1}s` }}
                          >
                            {symptom}
                          </motion.button>
                        ))}
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50">
                    <div className="flex space-x-2">
                      <input 
                        type="text" 
                        placeholder="Type your symptoms..." 
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors">
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Floating Elements */}
              <motion.div 
                className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-400 rounded-full opacity-20"
                animate={{
                  y: [0, -20, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 6, repeat: Infinity }}
              ></motion.div>
              <motion.div 
                className="absolute -bottom-6 -left-6 w-32 h-32 bg-cyan-400 rounded-full opacity-20"
                animate={{
                  y: [0, 15, 0],
                  scale: [1.1, 1, 1.1]
                }}
                transition={{ duration: 8, repeat: Infinity, delay: 2 }}
              ></motion.div>
              
              {/* Floating Cards */}
              <motion.div
                className="absolute -bottom-8 right-8 bg-white rounded-2xl p-4 shadow-2xl border border-blue-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Dr. Sarah</div>
                    <div className="text-sm text-gray-500">Cardiologist</div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                className="absolute top-1/2 -left-8 bg-white rounded-2xl p-4 shadow-2xl border border-blue-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                    <Microscope className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Lab Results</div>
                    <div className="text-sm text-green-600">Ready</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0" style={{transform:"rotate(180deg)"}}>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="fill-white"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className="fill-white"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-white"></path>
          </svg>
        </div>
      </section>

      {/* How It Works - Ecosystem Flow */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <Zap className="w-8 h-8 text-blue-600" />
              How Our Healthcare Ecosystem Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Seamless integration between patients, doctors, labs, and chemists for complete healthcare journey
            </p>
          </motion.div>

          {/* Interactive Steps */}
          <div className="mb-12">
            <div className="flex justify-center flex-wrap space-x-4 mb-8 gap-2">
              {[
                { label: 'Patient Journey', icon: Users },
                { label: 'Doctor Connect', icon: Stethoscope },
                { label: 'Lab Integration', icon: Microscope },
                { label: 'Chemist Network', icon: ShoppingCart }
              ].map((step, index) => (
                <motion.button
                  key={step.label}
                  onClick={() => setActiveStep(index)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                    activeStep === index
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <step.icon className="w-4 h-4" />
                  <span className='hidden md:block'>{step.label}</span>
                </motion.button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border border-blue-100"
              >
                {activeStep === 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <Users className="w-6 h-6 text-blue-600" />
                        Patient Journey
                      </h3>
                      <div className="space-y-4">
                        {[
                          'AI Symptom Checker analyzes health concerns',
                          'Smart doctor matching based on specialization',
                          'Easy appointment booking & reminders',
                          'E-prescriptions sent directly to partnered chemists',
                          'Lab test bookings with home collection options',
                          'Real-time tracking of entire healthcare journey'
                        ].map((item, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center space-x-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <motion.div
                      className="flex justify-center"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <div className="bg-white rounded-2xl p-6 shadow-xl border border-blue-200">
                        <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                          <Users className="w-10 h-10 text-white" />
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-gray-900">Patient Portal</div>
                          <div className="text-sm text-gray-600">Complete Health Management</div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {activeStep === 1 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <Stethoscope className="w-6 h-6 text-green-600" />
                        Doctor Connect
                      </h3>
                      <div className="space-y-4">
                        {[
                          'Verified profile with specialization details',
                          'AI-powered patient matching algorithm',
                          'Integrated video consultation platform',
                          'Digital prescription management system',
                          'Smart appointment scheduling & reminders',
                          'Performance analytics & insights dashboard'
                        ].map((item, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center space-x-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <motion.div
                      className="flex justify-center"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                    >
                      <div className="bg-white rounded-2xl p-6 shadow-xl border border-green-200">
                        <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                          <Stethoscope className="w-10 h-10 text-white" />
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-gray-900">Doctor Dashboard</div>
                          <div className="text-sm text-gray-600">Practice Management</div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <Microscope className="w-6 h-6 text-orange-600" />
                        Lab Integration
                      </h3>
                      <div className="space-y-4">
                        {[
                          'Network of certified diagnostic laboratories',
                          'Comprehensive test catalog management',
                          'Home sample collection scheduling',
                          'Digital report generation & delivery',
                          'Direct integration with doctor prescriptions',
                          'Real-time status updates for patients'
                        ].map((item, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center space-x-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <motion.div
                      className="flex justify-center"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                    >
                      <div className="bg-white rounded-2xl p-6 shadow-xl border border-orange-200">
                        <div className="w-20 h-20 bg-orange-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                          <Microscope className="w-10 h-10 text-white" />
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-gray-900">Lab Management</div>
                          <div className="text-sm text-gray-600">Diagnostic Services</div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <ShoppingCart className="w-6 h-6 text-purple-600" />
                        Chemist Network
                      </h3>
                      <div className="space-y-4">
                        {[
                          'Extensive medicine inventory management',
                          'Prescription validation system',
                          'Delivery & pickup coordination',
                          'Competitive pricing & offers',
                          'Order tracking & notifications',
                          'Partnership with insurance providers'
                        ].map((item, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center space-x-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <motion.div
                      className="flex justify-center"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, delay: 3 }}
                    >
                      <div className="bg-white rounded-2xl p-6 shadow-xl border border-purple-200">
                        <div className="w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                          <ShoppingCart className="w-10 h-10 text-white" />
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-gray-900">Pharmacy Portal</div>
                          <div className="text-sm text-gray-600">Medicine Distribution</div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Connection Flow Diagram */}
          <motion.div
            className="bg-gray-900 rounded-3xl p-8 text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-3">
              <Activity className="w-6 h-6 text-cyan-400" />
              Seamless Healthcare Ecosystem Flow
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Users, title: 'Patient', desc: 'Starts journey with AI symptom check', color: 'blue' },
                { icon: Stethoscope, title: 'Doctor', desc: 'Provides diagnosis & prescription', color: 'green' },
                { icon: Microscope, title: 'Laboratory', desc: 'Conducts tests & shares reports', color: 'orange' },
                { icon: ShoppingCart, title: 'Chemist', desc: 'Delivers medicines to patient', color: 'purple' }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  className="text-center relative"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className={`w-16 h-16 bg-${item.color}-600 rounded-2xl flex items-center justify-center mb-4 mx-auto`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                  <p className="text-gray-300 text-sm">{item.desc}</p>
                  {index < 3 && (
                    <motion.div
                      className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 text-2xl text-cyan-400"
                      animate={{ x: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                    >
                      <ArrowRight className="w-6 h-6" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Intelligence Section */}
      <section id="ai-intelligence" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <Brain className="w-8 h-8 text-blue-600" />
              Advanced AI & Core Intelligence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cutting-edge artificial intelligence that understands, predicts, and enhances your healthcare experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Symptom Screening */}
            <motion.div 
              className="bg-white rounded-2xl p-8 border border-blue-100 hover:shadow-xl transition-all duration-300 hover:border-blue-300"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Symptom Screening</h3>
              <ul className="text-gray-600 space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-blue-600 mr-3 flex-shrink-0" />
                  Conversational medical chatbot
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-blue-600 mr-3 flex-shrink-0" />
                  Dynamic questioning based on responses
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-blue-600 mr-3 flex-shrink-0" />
                  Text + selectable answer options
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-blue-600 mr-3 flex-shrink-0" />
                  Common disease detection
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-blue-600 mr-3 flex-shrink-0" />
                  Symptom summary & diagnosis
                </li>
              </ul>
            </motion.div>

            {/* AI Doctor Recommendation */}
            <motion.div 
              className="bg-white rounded-2xl p-8 border border-green-100 hover:shadow-xl transition-all duration-300 hover:border-green-300"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-6">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Doctor Recommendation</h3>
              <ul className="text-gray-600 space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
                  Specialization-based matching
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
                  Availability & rating filters
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
                  Distance-based sorting
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
                  Urgency prioritization
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
                  Online/offline status
                </li>
              </ul>
            </motion.div>

            {/* AI Lab & Chemist Matching */}
            <motion.div 
              className="bg-white rounded-2xl p-8 border border-orange-100 hover:shadow-xl transition-all duration-300 hover:border-orange-300"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mb-6">
                <Microscope className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Lab & Chemist Matching</h3>
              <ul className="text-gray-600 space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-orange-600 mr-3 flex-shrink-0" />
                  Nearest diagnostic labs
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-orange-600 mr-3 flex-shrink-0" />
                  Partnered chemists network
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-orange-600 mr-3 flex-shrink-0" />
                  Medicine availability
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-orange-600 mr-3 flex-shrink-0" />
                  Online/offline mode
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-orange-600 mr-3 flex-shrink-0" />
                  Real-time inventory
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Ready to Transform Healthcare Experience?
          </motion.h2>
          <motion.p 
            className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Join thousands of patients, doctors, labs, and chemists already using Mediconnect.fit
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openAuthModal('patient')}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors font-semibold text-lg shadow-lg flex items-center justify-center gap-3"
            >
              <Play className="w-5 h-5" />
              Start Free Trial
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300 font-semibold text-lg flex items-center justify-center gap-3"
            >
              <Calendar className="w-5 h-5" />
              Schedule Demo
            </motion.button>
          </motion.div>
        </div>
      </section>

      <Footer />
      <AuthModal 
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        userType={authModal.userType}
      />
    </div>
  );
}