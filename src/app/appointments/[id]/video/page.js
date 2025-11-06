"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDownIcon, 
  UserIcon, 
  UserGroupIcon, 
  BeakerIcon, 
  ShoppingCartIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  MicrophoneIcon,
  PhoneIcon,
  PhoneXMarkIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import toast, { Toaster } from 'react-hot-toast';

// Create custom slash icons since they don't exist in Heroicons
const MicrophoneSlashIcon = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11l-4-4m0 0l-4 4m4-4v12m-6.5-1.5v-10a2.5 2.5 0 115 0v10m-5 0h5m4.5-4.5v3a4.5 4.5 0 11-9 0v-3m9 0h-9" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
  </svg>
);

export default function Page() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const appointmentId = params?.id;
  const userId = searchParams.get("userId") || Math.floor(Math.random() * 100000);
  const role = searchParams.get("role") || "doctor";

  const loginOptions = [
    {
      type: 'patient',
      label: 'Patient',
      icon: UserIcon,
      description: 'Access your health records and appointments',
      color: 'blue'
    },
    {
      type: 'doctor',
      label: 'Doctor',
      icon: UserGroupIcon,
      description: 'Manage your practice and consultations',
      color: 'green'
    },
    {
      type: 'lab',
      label: 'Laboratory',
      icon: BeakerIcon,
      description: 'Handle test bookings and reports',
      color: 'orange'
    },
    {
      type: 'chemist',
      label: 'Chemist',
      icon: ShoppingCartIcon,
      description: 'Manage medicine orders and inventory',
      color: 'purple'
    }
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500 text-white',
      green: 'bg-green-500 text-white',
      orange: 'bg-orange-500 text-white',
      purple: 'bg-purple-500 text-white'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Enhanced Header matching your navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <VideoCameraIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Mediconnect
                  </span>
                  <span className="text-xs text-blue-600 block -mt-1 font-medium">.fit</span>
                </div>
              </div>
            </motion.div>

            {/* Appointment Info - Desktop */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-50 rounded-lg px-4 py-2 border border-blue-200">
                  <div className="text-blue-600 text-sm font-medium">Appointment ID</div>
                  <div className="text-gray-900 font-mono font-semibold">{appointmentId}</div>
                </div>
                <div className="bg-green-50 rounded-lg px-4 py-2 border border-green-200">
                  <div className="text-green-600 text-sm font-medium">Role</div>
                  <div className="text-gray-900 font-semibold capitalize flex items-center gap-2">
                    <UserCircleIcon className="w-4 h-4" />
                    {role}
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-emerald-50 rounded-full px-4 py-2 border border-emerald-200">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-emerald-700 text-sm font-medium">Secure Call</span>
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden bg-blue-50 border-t border-blue-200 py-4">
              <div className="space-y-3 px-4">
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <div className="text-blue-600 text-sm font-medium">Appointment ID</div>
                  <div className="text-gray-900 font-mono font-semibold">{appointmentId}</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <div className="text-green-600 text-sm font-medium">Role</div>
                  <div className="text-gray-900 font-semibold capitalize">{role}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <motion.div 
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Secure Video Consultation
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Your health is our priority. This is a secure, encrypted video call for your medical consultation.
          </p>
        </motion.div>

        {/* Video Call Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {appointmentId ? (
            <EnhancedVideoCallClient
              appointmentId={appointmentId}
              userId={userId}
              role={role}
            />
          ) : (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading appointment details...</p>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <motion.div 
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="inline-flex items-center space-x-3 text-sm text-gray-600 bg-gray-50 rounded-xl px-6 py-3 border border-gray-200">
            <ShieldCheckIcon className="w-5 h-5 text-green-500" />
            <span>This call is encrypted and secure. Your privacy is protected.</span>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

// Enhanced Video Call Client Component
function EnhancedVideoCallClient({ appointmentId, userId, role }) {
  const channelName = `appointment_${appointmentId}`;
  const clientRef = useRef(null);
  const localTracks = useRef({ audio: null, video: null });
  
  // Use separate refs for video elements
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  
  const remoteUsersRef = useRef(new Map()); // Track remote users with their tracks

  const [joined, setJoined] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [permissionError, setPermissionError] = useState(false);
  const [hasRemoteUser, setHasRemoteUser] = useState(false);

  // Call timer
  useEffect(() => {
    let interval;
    if (joined) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [joined]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const loadAgora = async () => {
    try {
      const { default: AgoraRTC } = await import("agora-rtc-sdk-ng");
      return AgoraRTC;
    } catch (error) {
      console.error('Failed to load Agora SDK:', error);
      toast.error('Failed to load video call service. Please refresh the page.');
      throw error;
    }
  };

  const checkMediaPermissions = async () => {
    try {
      // Check camera permissions
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      cameraStream.getTracks().forEach(track => track.stop());

      // Check microphone permissions
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStream.getTracks().forEach(track => track.stop());

      return true;
    } catch (error) {
      console.error('Media permission error:', error);
      return false;
    }
  };

  const createTracksWithFallback = async (AgoraRTC) => {
    try {
      // Try to create both audio and video tracks
      const [mic, cam] = await AgoraRTC.createMicrophoneAndCameraTracks();
      return { mic, cam, error: null };
    } catch (error) {
      console.warn('Failed to create both tracks, trying fallback:', error);

      // Fallback: Try to create tracks individually
      let mic = null;
      let cam = null;
      const errors = [];

      try {
        mic = await AgoraRTC.createMicrophoneAudioTrack();
      } catch (micError) {
        console.error('Failed to create microphone track:', micError);
        errors.push(`Microphone: ${micError.message}`);
        toast.error('Cannot access microphone. Please check permissions.');
      }

      try {
        cam = await AgoraRTC.createCameraVideoTrack();
      } catch (camError) {
        console.error('Failed to create camera track:', camError);
        errors.push(`Camera: ${camError.message}`);
        toast.error('Cannot access camera. Please check permissions.');
      }

      if (!mic && !cam) {
        throw new Error(`No media devices available: ${errors.join(', ')}`);
      }

      return { mic, cam, error: errors.length > 0 ? errors.join(', ') : null };
    }
  };

  // Safe video element cleanup
  const cleanupVideoElement = (element) => {
    if (!element) return;
    
    try {
      // Stop all video tracks
      if (element.srcObject) {
        const tracks = element.srcObject.getTracks();
        tracks.forEach(track => {
          track.stop();
          track.enabled = false;
        });
        element.srcObject = null;
      }
      
      // Remove all event listeners
      element.onloadedmetadata = null;
      element.oncanplay = null;
      element.onerror = null;
      
      // Clear the element
      if (element.parentNode) {
        // Don't remove the element from DOM, just clear it
        element.style.display = 'none';
      }
    } catch (error) {
      console.warn('Error cleaning up video element:', error);
    }
  };

  const joinCall = async () => {
    setLoading(true);
    setPermissionError(false);
    
    try {
      // Check if browser supports media devices
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support video calling. Please use a modern browser like Chrome, Firefox, or Safari.');
      }

      // Check basic permissions first
      const hasPermissions = await checkMediaPermissions();
      if (!hasPermissions) {
        setPermissionError(true);
        toast.error('Please allow camera and microphone permissions to join the call.');
        return;
      }

      // Generate token
      const res = await fetch("/api/agora/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointment_id: appointmentId,
          uid: userId,
          role: "publisher",
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to generate token: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      if (!data.status) {
        throw new Error(data.message || "Failed to generate authentication token");
      }

      const { appId, token } = data;
      const AgoraRTC = await loadAgora();
      
      // Create client and join channel
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;

      await client.join(appId, channelName, token, userId);
      toast.success('Successfully joined the call!');

      // Create media tracks with fallback
      const { mic, cam, error: trackError } = await createTracksWithFallback(AgoraRTC);
      
      localTracks.current.audio = mic;
      localTracks.current.video = cam;

      // Setup local video view using the ref directly
      if (cam && localVideoRef.current) {
        try {
          await cam.play(localVideoRef.current);
        } catch (playError) {
          console.error('Error playing local video:', playError);
          toast.error('Failed to start camera preview');
        }
      }

      // Publish available tracks
      const tracksToPublish = [];
      if (mic) tracksToPublish.push(mic);
      if (cam) tracksToPublish.push(cam);

      if (tracksToPublish.length > 0) {
        await client.publish(tracksToPublish);
      }

      if (trackError) {
        toast.error(`Some media devices unavailable: ${trackError}`);
      }

      setJoined(true);
      remoteUsersRef.current.clear(); // Reset remote users tracking

      // Handle remote users
      client.on("user-published", async (user, mediaType) => {
        try {
          await client.subscribe(user, mediaType);
          
          if (mediaType === "video" && user.videoTrack) {
            remoteUsersRef.current.set(user.uid, {
              videoTrack: user.videoTrack,
              audioTrack: user.audioTrack
            });
            
            if (remoteVideoRef.current) {
              try {
                await user.videoTrack.play(remoteVideoRef.current);
                setHasRemoteUser(true);
                toast.success('Participant joined the call');
              } catch (playError) {
                console.error('Error playing remote video:', playError);
              }
            }
          }
          
          if (mediaType === "audio" && user.audioTrack) {
            user.audioTrack.play();
          }
        } catch (error) {
          console.error('Error handling remote user:', error);
          toast.error('Failed to connect with participant');
        }
      });

      client.on("user-left", (user) => {
        if (remoteUsersRef.current.has(user.uid)) {
          remoteUsersRef.current.delete(user.uid);
          setHasRemoteUser(remoteUsersRef.current.size > 0);
          toast('Participant left the call');
        }
      });

      client.on("connection-state-change", (curState, prevState) => {
        console.log('Connection state changed:', prevState, '->', curState);
        
        if (curState === 'DISCONNECTED') {
          toast.error('Connection lost. Attempting to reconnect...');
        } else if (curState === 'CONNECTED') {
          toast.success('Connection restored');
        }
      });

    } catch (error) {
      console.error("Join call error:", error);
      
      // Specific error handling
      if (error.name === 'NotAllowedError') {
        toast.error('Camera/microphone access denied. Please allow permissions and try again.');
        setPermissionError(true);
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera or microphone found. Please check your devices.');
        setPermissionError(true);
      } else if (error.name === 'NotReadableError') {
        toast.error('Camera or microphone is busy. Please close other applications using them.');
        setPermissionError(true);
      } else if (error.message.includes('token')) {
        toast.error('Authentication failed. Please refresh the page.');
      } else if (error.message.includes('network') || error.message.includes('connection')) {
        toast.error('Network error. Please check your internet connection.');
      } else {
        toast.error(`Failed to join call: ${error.message}`);
      }

      // Cleanup on error
      await leaveCall();
    } finally {
      setLoading(false);
    }
  };

  const leaveCall = async () => {
    try {
      const client = clientRef.current;
      
      if (client) {
        // Remove all event listeners first
        client.removeAllListeners();
        
        // Stop and close all local tracks
        if (localTracks.current.audio) {
          localTracks.current.audio.stop();
          localTracks.current.audio.close();
          localTracks.current.audio = null;
        }
        if (localTracks.current.video) {
          localTracks.current.video.stop();
          localTracks.current.video.close();
          localTracks.current.video = null;
        }

        // Unpublish and leave
        await client.unpublish().catch(console.error);
        await client.leave().catch(console.error);
        
        toast('You left the call');
      }

      // Clean up video elements safely
      cleanupVideoElement(localVideoRef.current);
      cleanupVideoElement(remoteVideoRef.current);
      
      // Clear remote users
      remoteUsersRef.current.clear();
      
      setJoined(false);
      setCallDuration(0);
      setPermissionError(false);
      setHasRemoteUser(false);
    } catch (error) {
      console.error('Error leaving call:', error);
      toast.error('Error ending call');
    }
  };

  const toggleMic = async () => {
    try {
      const mic = localTracks.current.audio;
      if (!mic) {
        toast.error('Microphone not available');
        return;
      }
      await mic.setEnabled(!micOn);
      setMicOn(!micOn);
      toast.success(micOn ? 'Microphone muted' : 'Microphone unmuted');
    } catch (error) {
      console.error('Error toggling microphone:', error);
      toast.error('Failed to toggle microphone');
    }
  };

  const toggleCam = async () => {
    try {
      const cam = localTracks.current.video;
      if (!cam) {
        toast.error('Camera not available');
        return;
      }
      await cam.setEnabled(!camOn);
      setCamOn(!camOn);
      
      if (localVideoRef.current) {
        if (!camOn) {
          // Camera turning on
          localVideoRef.current.style.display = 'block';
        } else {
          // Camera turning off
          localVideoRef.current.style.display = 'none';
        }
      }
      
      toast.success(camOn ? 'Camera turned off' : 'Camera turned on');
    } catch (error) {
      console.error('Error toggling camera:', error);
      toast.error('Failed to toggle camera');
    }
  };

  const requestPermissions = async () => {
    try {
      setPermissionError(false);
      toast.loading('Requesting camera and microphone permissions...');
      
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      
      toast.dismiss();
      toast.success('Permissions granted! You can now join the call.');
    } catch (error) {
      toast.dismiss();
      toast.error('Please allow permissions in your browser settings.');
    }
  };

  useEffect(() => {
    return () => {
      leaveCall();
    };
  }, []);

  return (
    <div className="p-6">
      {/* Call Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <ClockIcon className="w-5 h-5" />
            <span className="font-mono text-lg font-semibold">{formatTime(callDuration)}</span>
          </div>
          {joined && (
            <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 text-sm font-medium">Live</span>
            </div>
          )}
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-500">Appointment ID</div>
          <div className="font-mono font-semibold text-gray-800">{appointmentId}</div>
        </div>
      </div>

      {/* Permission Error Banner */}
      {permissionError && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4"
        >
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-red-800 font-semibold">Camera/Microphone Access Required</h4>
              <p className="text-red-600 text-sm mt-1">
                Please allow camera and microphone permissions to join the video call.
              </p>
            </div>
            <button
              onClick={requestPermissions}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
            >
              Grant Permissions
            </button>
          </div>
        </motion.div>
      )}

      {/* Video Grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Local Video */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <UserCircleIcon className="w-4 h-4" />
              You ({role})
            </h3>
            <div className="relative w-full h-64 bg-gray-900 rounded-xl flex items-center justify-center overflow-hidden">
              <video
                ref={localVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />
              {!joined && (
                <div className="absolute inset-0 flex items-center justify-center text-center text-gray-400">
                  <VideoCameraSlashIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">Camera preview</div>
                </div>
              )}
              {!camOn && joined && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <VideoCameraSlashIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Remote Video */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-4 border border-gray-200 h-full">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <UserGroupIcon className="w-4 h-4" />
              {role === 'doctor' ? 'Patient' : 'Doctor'}
            </h3>
            <div className="relative w-full h-64 lg:h-80 bg-gray-900 rounded-xl flex items-center justify-center overflow-hidden">
              <video
                ref={remoteVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
              />
              {!hasRemoteUser && (
                <div className="absolute inset-0 flex items-center justify-center text-center text-gray-400">
                  {!joined ? (
                    <>
                      <UserCircleIcon className="w-16 h-16 mx-auto mb-3 opacity-50" />
                      <div className="text-lg font-medium mb-2">Waiting for participant</div>
                      <div className="text-sm">The other participant will appear here once they join</div>
                    </>
                  ) : (
                    <>
                      <UserCircleIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <div className="text-sm">Participant connecting...</div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Controls */}
      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
        <div className="flex flex-col items-center space-y-4">
          {/* Control Buttons */}
          <div className="flex items-center justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMic}
              disabled={!joined || !localTracks.current.audio}
              className={`p-4 rounded-2xl transition-all duration-200 ${
                micOn 
                  ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg' 
                  : 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
              } ${!joined || !localTracks.current.audio ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {micOn ? (
                <MicrophoneIcon className="w-6 h-6" />
              ) : (
                <MicrophoneSlashIcon className="w-6 h-6" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleCam}
              disabled={!joined || !localTracks.current.video}
              className={`p-4 rounded-2xl transition-all duration-200 ${
                camOn 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg' 
                  : 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
              } ${!joined || !localTracks.current.video ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {camOn ? (
                <VideoCameraIcon className="w-6 h-6" />
              ) : (
                <VideoCameraSlashIcon className="w-6 h-6" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={joined ? leaveCall : joinCall}
              disabled={loading}
              className={`p-4 rounded-2xl transition-all duration-200 ${
                joined 
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg' 
                  : 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : joined ? (
                <PhoneXMarkIcon className="w-6 h-6" />
              ) : (
                <PhoneIcon className="w-6 h-6" />
              )}
            </motion.button>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                !localTracks.current.audio ? 'bg-gray-400' : micOn ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span>Microphone {!localTracks.current.audio ? 'Unavailable' : micOn ? 'On' : 'Off'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                !localTracks.current.video ? 'bg-gray-400' : camOn ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span>Camera {!localTracks.current.video ? 'Unavailable' : camOn ? 'On' : 'Off'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}