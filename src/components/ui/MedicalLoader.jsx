import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, HeartPulse, Stethoscope } from 'lucide-react';

const MEDICAL_MESSAGES = [
  "Initializing clinical simulation...",
  "Loading patient history...",
  "Staging treatment modules...",
  "Synchronizing diagnostic tools...",
  "Preparing anatomical models...",
  "Loading clinical protocols...",
  "Calibrating simulation parameters..."
];

const MedicalLoader = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MEDICAL_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md">
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Pulsing Background Glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-blue-500 rounded-full blur-3xl"
        />

        {/* Heartbeat SVG */}
        <div className="relative w-full h-20 flex items-center justify-center overflow-hidden">
          <svg
            viewBox="0 0 100 40"
            className="w-full h-full text-blue-600 fill-none"
            style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }}
          >
            <motion.path
              d="M0 20 L20 20 L25 10 L35 30 L45 5 L55 35 L65 15 L70 20 L100 20"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 1, 1],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
                times: [0, 0.8, 1],
              }}
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Floating Icons */}
        <motion.div
          animate={{
            y: [-10, 10, -10],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-10 right-4 bg-blue-100 p-2 rounded-lg text-blue-600 shadow-sm"
        >
          <HeartPulse size={20} />
        </motion.div>
        
        <motion.div
          animate={{
            y: [10, -10, 10],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-10 left-4 bg-blue-50 p-2 rounded-lg text-blue-500 shadow-sm"
        >
          <Activity size={20} />
        </motion.div>
      </div>

      {/* Text Container */}
      <div className="mt-8 text-center px-4">
        <div className="h-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-slate-700 font-semibold text-xl tracking-tight"
            >
              {MEDICAL_MESSAGES[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
        
        <div className="mt-8 w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden mx-auto shadow-inner">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-full h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"
          />
        </div>
        
        <div className="mt-6 flex items-center justify-center gap-2">
          <Stethoscope size={16} className="text-blue-400" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
            PhysioSim Clinical Simulation
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicalLoader;
