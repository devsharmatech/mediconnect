"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  VideoCameraIcon,
  VideoCameraSlashIcon,
  MicrophoneIcon,
  PhoneIcon,
  PhoneXMarkIcon,
  ClockIcon,
  UserCircleIcon,
  EllipsisVerticalIcon,
  UserIcon
} from "@heroicons/react/24/outline";
import toast, { Toaster } from 'react-hot-toast';

// Create custom slash icons
const MicrophoneSlashIcon = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11l-4-4m0 0l-4 4m4-4v12m-6.5-1.5v-10a2.5 2.5 0 115 0v10m-5 0h5m4.5-4.5v3a4.5 4.5 0 11-9 0v-3m9 0h-9" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
  </svg>
);

export default function Page() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const appointmentId = params?.id;
  const userId = searchParams.get("userId") || Math.floor(Math.random() * 100000);
  const role = searchParams.get("role") || "doctor";

  return (
    <div className="h-screen bg-gray-900 overflow-hidden">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />

      {/* Compact Header */}
      <nav className="bg-gray-900 border-b border-gray-700">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <VideoCameraIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white">Mediconnect</span>
                <span className="text-xs text-blue-400 block -mt-1">.fit</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <ClockIcon className="w-4 h-4" />
                <span className="font-mono text-sm">00:00</span>
              </div>
              <div className="flex items-center space-x-2 bg-red-500/20 px-2 py-1 rounded-full border border-red-500/30">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-400 text-xs">Not connected</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="h-[calc(100vh-80px)]">
        {appointmentId ? (
          <CompactVideoCall
            appointmentId={appointmentId}
            userId={userId}
            role={role}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-900">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-gray-400 text-sm">Loading appointment...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Compact Video Call Component
function CompactVideoCall({ appointmentId, userId, role }) {
  const channelName = `appointment_${appointmentId}`;
  const clientRef = useRef(null);
  const localTracks = useRef({ audio: null, video: null });
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteUsersRef = useRef(new Map());

  const [joined, setJoined] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [hasRemoteUser, setHasRemoteUser] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [mediaState, setMediaState] = useState({
    hasCamera: false,
    hasMicrophone: false,
    cameraError: null,
    microphoneError: null
  });

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
      toast.error('Failed to load video service');
      throw error;
    }
  };

  // Test media devices without Agora
  const testMediaDevices = async () => {
    let cameraAvailable = false;
    let microphoneAvailable = false;
    let cameraError = null;
    let microphoneError = null;

    try {
      // Test camera
      const videoStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        } 
      });
      videoStream.getTracks().forEach(track => track.stop());
      cameraAvailable = true;
    } catch (error) {
      cameraAvailable = false;
      if (error.name === 'NotAllowedError') {
        cameraError = 'Camera permission denied';
      } else if (error.name === 'NotFoundError') {
        cameraError = 'No camera found';
      } else if (error.name === 'NotReadableError') {
        cameraError = 'Camera in use by another application';
      } else {
        cameraError = 'Camera not accessible';
      }
    }

    try {
      // Test microphone
      const audioStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      audioStream.getTracks().forEach(track => track.stop());
      microphoneAvailable = true;
    } catch (error) {
      microphoneAvailable = false;
      if (error.name === 'NotAllowedError') {
        microphoneError = 'Microphone permission denied';
      } else if (error.name === 'NotFoundError') {
        microphoneError = 'No microphone found';
      } else if (error.name === 'NotReadableError') {
        microphoneError = 'Microphone in use by another application';
      } else {
        microphoneError = 'Microphone not accessible';
      }
    }

    setMediaState({
      hasCamera: cameraAvailable,
      hasMicrophone: microphoneAvailable,
      cameraError,
      microphoneError
    });

    return { hasCamera: cameraAvailable, hasMicrophone: microphoneAvailable };
  };

  // Safe track creation that never throws errors
  const createTracksSafely = async (AgoraRTC) => {
    let mic = null;
    let cam = null;

    // Create microphone track safely
    if (mediaState.hasMicrophone) {
      try {
        mic = await AgoraRTC.createMicrophoneAudioTrack({
          AEC: true,
          ANS: true,
          AGC: true
        }).catch(() => null);
      } catch (error) {
        console.warn('Microphone track creation failed silently');
      }
    }

    // Create camera track safely - only if we know camera is available
    if (mediaState.hasCamera && !mediaState.cameraError?.includes('in use')) {
      try {
        // Use minimal configuration to avoid NOT_READABLE errors
        cam = await AgoraRTC.createCameraVideoTrack({
          encoderConfig: '120p', // Lowest possible quality
          optimizationMode: 'motion',
          bitrateMin: 100,
          bitrateMax: 500
        }).catch(() => null);
        
        // If that fails, try with no configuration
        if (!cam) {
          cam = await AgoraRTC.createCameraVideoTrack().catch(() => null);
        }
      } catch (error) {
        console.warn('Camera track creation failed silently');
      }
    }

    return { mic, cam };
  };

  const joinCall = async () => {
    setLoading(true);
    
    try {
      if (!navigator.mediaDevices) {
        throw new Error('Browser not supported');
      }

      // Test devices first
      const deviceStatus = await testMediaDevices();

      const tokenPromise = fetch("/api/agora/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointment_id: appointmentId,
          uid: userId,
          role: "publisher",
        }),
      });

      const loadingToast = toast.loading('Joining consultation...');

      const [res, AgoraRTC] = await Promise.all([
        tokenPromise,
        loadAgora()
      ]);

      if (!res.ok) throw new Error('Server error');

      const data = await res.json();
      if (!data.status) throw new Error(data.message || "Authentication failed");

      const { appId, token } = data;
      
      const client = AgoraRTC.createClient({ 
        mode: "rtc", 
        codec: "vp8" 
      });
      clientRef.current = client;

      await client.join(appId, channelName, token, userId);
      toast.dismiss(loadingToast);

      // Create tracks safely without throwing errors
      const { mic, cam } = await createTracksSafely(AgoraRTC);
      
      localTracks.current.audio = mic;
      localTracks.current.video = cam;

      // Setup local video if available
      if (cam && localVideoRef.current) {
        try {
          await cam.play(localVideoRef.current);
          setCamOn(true);
        } catch (playError) {
          console.warn('Failed to play local video');
          setCamOn(false);
        }
      } else {
        setCamOn(false);
      }

      // Set initial mic state
      setMicOn(!!mic);

      // Publish available tracks
      const tracksToPublish = [];
      if (mic) tracksToPublish.push(mic);
      if (cam) tracksToPublish.push(cam);

      if (tracksToPublish.length > 0) {
        try {
          await client.publish(tracksToPublish);
          if (mic && cam) {
            toast.success('Audio and video connected');
          } else if (mic) {
            toast.success('Audio connected (video unavailable)');
          } else if (cam) {
            toast.success('Video connected (audio unavailable)');
          }
        } catch (publishError) {
          console.warn('Publish failed, continuing without media');
          toast.success('Joined consultation (media unavailable)');
        }
      } else {
        toast.success('Joined as listener');
      }

      setJoined(true);
      remoteUsersRef.current.clear();

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
                setParticipantCount(2);
                const participantRole = role === 'doctor' ? 'Patient' : 'Doctor';
                toast.success(`${participantRole} joined`);
              } catch (playError) {
                console.warn('Failed to play remote video');
              }
            }
          }
          
          if (mediaType === "audio" && user.audioTrack) {
            try {
              user.audioTrack.play();
            } catch (audioError) {
              console.warn('Failed to play remote audio');
            }
          }
        } catch (error) {
          console.warn('Error handling remote user');
        }
      });

      client.on("user-left", (user) => {
        if (remoteUsersRef.current.has(user.uid)) {
          remoteUsersRef.current.delete(user.uid);
          setHasRemoteUser(remoteUsersRef.current.size > 0);
          setParticipantCount(1);
          const participantRole = role === 'doctor' ? 'Patient' : 'Doctor';
          toast(`${participantRole} left the call`);
        }
      });

    } catch (error) {
      console.error('Join call error:', error);
      
      if (error.message.includes('PERMISSION_DENIED') || error.name === 'NotAllowedError') {
        toast.error('Camera/microphone access denied');
      } else if (error.message.includes('NOT_READABLE')) {
        toast.error('Camera is in use by another application');
      } else {
        toast.error('Failed to join consultation');
      }
      
      await leaveCall().catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  const leaveCall = async () => {
    try {
      const client = clientRef.current;
      
      if (client) {
        client.removeAllListeners();
        
        // Stop tracks safely
        if (localTracks.current.audio) {
          try {
            localTracks.current.audio.stop();
            localTracks.current.audio.close();
          } catch (error) {}
          localTracks.current.audio = null;
        }
        
        if (localTracks.current.video) {
          try {
            localTracks.current.video.stop();
            localTracks.current.video.close();
          } catch (error) {}
          localTracks.current.video = null;
        }

        try {
          await client.unpublish();
          await client.leave();
        } catch (error) {}
        
        toast('Call ended');
      }

      // Clear video elements
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      
      remoteUsersRef.current.clear();
      
      setJoined(false);
      setCallDuration(0);
      setHasRemoteUser(false);
      setParticipantCount(1);
      setMicOn(false);
      setCamOn(false);
    } catch (error) {
      console.error('Leave call error:', error);
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
      
      const newState = !micOn;
      await mic.setEnabled(newState);
      setMicOn(newState);
      
      if (newState) {
        toast.success('Microphone unmuted');
      } else {
        toast.info('Microphone muted');
      }
    } catch (error) {
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
      
      const newState = !camOn;
      await cam.setEnabled(newState);
      setCamOn(newState);
      
      if (newState) {
        toast.success('Camera turned on');
      } else {
        toast.info('Camera turned off');
      }
    } catch (error) {
      toast.error('Failed to toggle camera');
    }
  };

  // Initialize media state on component mount
  useEffect(() => {
    testMediaDevices();
  }, []);

  useEffect(() => {
    return () => {
      leaveCall();
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Video Grid Area */}
      <div className="flex-1 relative p-2">
        {!joined ? (
          // Pre-call view
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <VideoCameraIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Ready to join?
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                Join as {role}
              </p>
              
              {/* Media Status */}
              <div className="flex justify-center space-x-6 mb-4">
                <div className={`flex flex-col items-center ${mediaState.hasMicrophone ? 'text-green-400' : 'text-red-400'}`}>
                  <MicrophoneIcon className="w-5 h-5" />
                  <span className="text-xs mt-1">{mediaState.hasMicrophone ? 'Ready' : 'No mic'}</span>
                </div>
                <div className={`flex flex-col items-center ${mediaState.hasCamera ? 'text-green-400' : 'text-red-400'}`}>
                  <VideoCameraIcon className="w-5 h-5" />
                  <span className="text-xs mt-1">{mediaState.hasCamera ? 'Ready' : 'No camera'}</span>
                </div>
              </div>

              {/* Error Messages */}
              {mediaState.cameraError && (
                <div className="mb-3 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded text-xs text-yellow-400">
                  📹 {mediaState.cameraError}
                </div>
              )}
              {mediaState.microphoneError && (
                <div className="mb-3 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded text-xs text-yellow-400">
                  🎤 {mediaState.microphoneError}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={joinCall}
                disabled={loading}
                className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition-colors font-semibold text-sm disabled:opacity-50 w-full max-w-xs"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Joining...</span>
                  </div>
                ) : (
                  `Join Consultation`
                )}
              </motion.button>

              <p className="text-gray-500 text-xs mt-3">
                You can still join even if media devices are unavailable
              </p>
            </div>
          </div>
        ) : (
          // Active call view
          <div className={`h-full grid gap-2 ${
            hasRemoteUser ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
          }`}>
            
            {/* Remote Participant */}
            <div className={`relative bg-black rounded-lg overflow-hidden ${
              hasRemoteUser ? '' : 'w-full h-full'
            }`}>
              <video
                ref={remoteVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
              />
              
              <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                {role === 'doctor' ? 'Patient' : 'Doctor'}
              </div>

              {!hasRemoteUser && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <UserIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <div className="text-sm font-medium text-white mb-1">
                      Waiting for {role === 'doctor' ? 'patient' : 'doctor'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Local Participant */}
            {hasRemoteUser && (
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                />
                
                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                  You ({role})
                </div>

                {(!localTracks.current.video || !camOn) && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <VideoCameraSlashIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Call Status Bar */}
        {joined && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full">
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-3 h-3" />
                <span className="font-mono">{formatTime(callDuration)}</span>
              </div>
              <div className="w-px h-3 bg-gray-600"></div>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span>{participantCount} participant{participantCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-900 border-t border-gray-800 py-3">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-center space-x-4">
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleMic}
              disabled={!joined || !localTracks.current.audio}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                micOn 
                  ? 'bg-white hover:bg-gray-200 text-gray-700' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              } ${!joined || !localTracks.current.audio ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {micOn ? (
                <MicrophoneIcon className="w-5 h-5" />
              ) : (
                <MicrophoneSlashIcon className="w-5 h-5" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleCam}
              disabled={!joined || !localTracks.current.video}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                camOn 
                  ? 'bg-white hover:bg-gray-200 text-gray-700' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              } ${!joined || !localTracks.current.video ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {camOn ? (
                <VideoCameraIcon className="w-5 h-5" />
              ) : (
                <VideoCameraSlashIcon className="w-5 h-5" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={joined ? leaveCall : joinCall}
              disabled={loading}
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                joined 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : joined ? (
                <PhoneXMarkIcon className="w-5 h-5" />
              ) : (
                <PhoneIcon className="w-5 h-5" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full bg-white hover:bg-gray-200 text-gray-700 flex items-center justify-center"
            >
              <EllipsisVerticalIcon className="w-5 h-5" />
            </motion.button>
          </div>

          {joined && (
            <div className="mt-2 text-center">
              <div className="inline-flex items-center space-x-3 text-xs text-gray-400">
                <div className={`flex items-center space-x-1 ${localTracks.current.audio ? 'text-green-400' : 'text-red-400'}`}>
                  <MicrophoneIcon className="w-3 h-3" />
                  <span>{localTracks.current.audio ? 'Audio' : 'No audio'}</span>
                </div>
                <div className={`flex items-center space-x-1 ${localTracks.current.video ? 'text-green-400' : 'text-red-400'}`}>
                  <VideoCameraIcon className="w-3 h-3" />
                  <span>{localTracks.current.video ? 'Video' : 'No video'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}