import React from 'react';
import { X, Award, Users, BookOpen, Cpu, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

interface ProjectInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectInfoModal: React.FC<ProjectInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#131720] border border-[#3b3d4a] rounded-xl max-w-3xl w-full p-6 text-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#808495] hover:text-white p-1 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Institution Header */}
        <div className="border-b border-[#262730] pb-4 mb-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#1e212b] text-xs font-mono text-emerald-400 mb-2">
            <Award className="w-3.5 h-3.5 text-[#ff4b4b]" />
            SANTHIRAM ENGINEERING COLLEGE: NANDYAL (AUTONOMOUS)
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Deep Learning-Based Intelligent Crowd Safety System
          </h2>
          <p className="text-xs text-[#a3a8b8] mt-1">
            Using Aerial Surveillance for Congestion Prediction and Emergency Response
          </p>
          <div className="text-[11px] text-[#808495] mt-1">
            Department of Computer Science & Engineering (Data Science) • Domain: Deep Learning
          </div>
        </div>

        {/* Batch & Team Members */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#1e212b] p-3.5 rounded-lg border border-[#3b3d4a]">
            <div className="flex items-center gap-2 text-xs font-semibold text-white mb-2">
              <Users className="w-4 h-4 text-[#ff4b4b]" />
              TEAM MEMBERS (BATCH NO: 29)
            </div>
            <ul className="text-xs space-y-1.5 font-mono text-slate-300">
              <li className="flex justify-between border-b border-[#262730] pb-1">
                <span>PITTALA MADAR VALI</span>
                <span className="text-emerald-400">(23X51A3275)</span>
              </li>
              <li className="flex justify-between border-b border-[#262730] pb-1">
                <span>PARSHA SHIVA KRISHNA</span>
                <span className="text-emerald-400">(23X51A3273)</span>
              </li>
              <li className="flex justify-between">
                <span>UPPARI SUJITH KUMAR</span>
                <span className="text-emerald-400">(23X51A32C6)</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#1e212b] p-3.5 rounded-lg border border-[#3b3d4a] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-white mb-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                PROJECT GUIDE & OVERSIGHT
              </div>
              <div className="text-sm font-bold text-white">
                K. SREENIVASULU
              </div>
              <div className="text-xs text-[#808495] mt-0.5">
                Faculty Guide • Department of CSE (Data Science)
              </div>
            </div>
            <div className="text-[11px] text-slate-400 border-t border-[#262730] pt-2 mt-2">
              ISO 9001:2015 Certified, NAAC (Grade-A), NBA Accredited
            </div>
          </div>
        </div>

        {/* Official Abstract from PDF */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <FileText className="w-4 h-4 text-[#ff4b4b]" />
            Official Project Abstract
          </div>
          <p className="text-xs text-slate-300 leading-relaxed bg-[#0e1117] p-3.5 rounded-lg border border-[#262730]">
            Ensuring public safety during large-scale public gatherings remains a significant challenge due to increasing urbanization, high crowd density, and the limited effectiveness of conventional surveillance systems in providing proactive situational awareness. This paper proposes an Artificial Intelligence (AI)-driven Intelligent Crowd Monitoring and Early Congestion Prediction System that performs real-time crowd analysis using aerial-view imagery acquired from unmanned aerial vehicles (UAVs) or surveillance cameras. The proposed framework employs a Lightweight Dilated Convolutional Neural Network (LDCNN) to generate high-precision crowd density maps while maintaining low computational complexity, making it suitable for real-time edge deployment.
          </p>
        </div>

        {/* Key Modules List */}
        <div className="mt-4 pt-4 border-t border-[#262730]">
          <div className="text-xs font-semibold text-slate-300 mb-2">
            Implemented System Modules:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#a3a8b8]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>1. Density Estimation & Quadrant Allocation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>2. Short-Term Congestion Forecasting (5-10m)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>3. Activity / Anomaly Recognition (Fighting, Running)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>4. Emergency Alert Dispatch & Real-Time Log</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>5. Threat Object Detection (YOLOv8)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>6. Persistent Person Tracking & Behavior Flagging</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#ff4b4b] hover:bg-[#ff3333] text-white px-4 py-2 rounded text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Information
          </button>
        </div>
      </div>
    </div>
  );
};
