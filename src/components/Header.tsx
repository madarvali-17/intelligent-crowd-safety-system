import React, { useState } from 'react';
import { Info, RotateCw, RefreshCw, MoreVertical, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  activeTab: number;
  onSelectTab: (tabIndex: number) => void;
  onOpenProjectModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenProjectModal,
}) => {
  const [rerunSpin, setRerunSpin] = useState(false);

  const tabs = [
    { id: 1, label: '1. Density Estimation' },
    { id: 2, label: '2. Congestion Forecast' },
    { id: 3, label: '3. Activity Recognition' },
    { id: 4, label: '4. Alert Log' },
    { id: 5, label: '5. Threat Detection' },
    { id: 6, label: '6. Person Tracking' },
  ];

  const handleRerun = () => {
    setRerunSpin(true);
    setTimeout(() => setRerunSpin(false), 600);
  };

  return (
    <header className="w-full bg-[#0e1117] border-b border-[#262730] px-4 md:px-8 pt-4 pb-0">
      {/* Streamlit Top Utility Bar */}
      <div className="flex items-center justify-between text-xs text-[#a3a8b8] pb-3 border-b border-[#1e212b]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            localhost:8501
          </div>
          <span className="text-[#3b3d4a]">•</span>
          <button 
            onClick={onOpenProjectModal}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer text-[#a3a8b8] hover:underline"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#ff4b4b]" />
            <span className="font-medium text-slate-200">Santhiram Engg College (Batch 29)</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#808495]">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            File change: <span className="text-slate-300">Auto</span>
          </div>
          <button
            onClick={handleRerun}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
            title="Rerun analysis"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${rerunSpin ? 'animate-spin text-[#ff4b4b]' : ''}`} />
            <span>Rerun</span>
          </button>
          <span className="hidden sm:inline text-[#808495] hover:text-white cursor-pointer transition-colors text-[11px]">
            Always rerun
          </span>
          <button 
            onClick={onOpenProjectModal}
            className="hover:text-white transition-colors p-1"
            title="Project Documentation & Guide"
          >
            <Info className="w-4 h-4 text-[#a3a8b8] hover:text-white" />
          </button>
        </div>
      </div>

      {/* Main App Title Lockup matching video */}
      <div className="pt-4 pb-3">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Deep Learning-Based Intelligent Crowd Safety System
        </h1>
        <p className="text-xs md:text-sm text-[#808495] mt-1 font-normal">
          Aerial Surveillance for Congestion Prediction and Emergency Response
        </p>
      </div>

      {/* 6 Tabs Navigation matching video exact text & styling */}
      <nav className="flex items-center gap-2 overflow-x-auto border-b border-[#262730] scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`py-2.5 px-3 md:px-4 text-xs md:text-sm font-medium whitespace-nowrap transition-colors relative cursor-pointer ${
                isActive
                  ? 'text-[#ff4b4b] font-semibold'
                  : 'text-[#fafafa] hover:text-[#ff4b4b]'
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#ff4b4b] rounded-t-sm" />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
