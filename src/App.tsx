import React, { useState } from 'react';
import { Header } from './components/Header';
import { Tab1DensityEstimation } from './components/Tab1DensityEstimation';
import { Tab2CongestionForecast } from './components/Tab2CongestionForecast';
import { Tab3ActivityRecognition } from './components/Tab3ActivityRecognition';
import { Tab4AlertLog } from './components/Tab4AlertLog';
import { Tab5ThreatDetection } from './components/Tab5ThreatDetection';
import { Tab6PersonTracking } from './components/Tab6PersonTracking';
import { ProjectInfoModal } from './components/ProjectInfoModal';
import {
  DensityEstimationState,
  CongestionForecastState,
  ActivityRecognitionState,
  AlertLogItem,
} from './types';
import defaultCrowdImg from './assets/images/crowd_aerial_protest_1791204775838.jpg';

export default function App() {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Shared state matching the exact initial parameters in the video
  const [densityState, setDensityState] = useState<DensityEstimationState>({
    imageName: 'crowd.jpg',
    imageSize: '87.6KB',
    imageUrl: defaultCrowdImg,
    predictedCount: 110,
    securityGuardsNeeded: 3,
    medicalStaffNeeded: 1,
    busiestDirection: 'East',
    quadrantDensities: {
      North: 55.43555450439453,
      South: 55.292533491121094,
      West: 53.06997560966957,
      East: 57.681535994970703,
    },
  });

  const [forecastState, setForecastState] = useState<CongestionForecastState>({
    pastCounts: [
      83, 117, 94, 108, 89, 115, 120, 97, 86, 118, 96, 119, 104, 86, 113, 104, 86, 113, 106, 109,
    ],
    pastCountsString:
      '83, 117, 94, 108, 89, 115, 120, 97, 86, 118, 96, 119, 104, 86, 113, 104, 86, 113, 106, 109',
    readingsCollected: 4,
    neededReadings: 20,
    predictedCount: 108,
  });

  const [activityState, setActivityState] = useState<ActivityRecognitionState>({
    videoName: '8100_vvid.avi',
    videoSize: '222.3KB',
    videoUrl: '',
    predictedActivity: 'FIGHTING',
    confidence: 97.3,
    probabilities: {
      fighting: 0.973249554634042,
      normal: 0.026750445365958,
    },
  });

  // Preloaded alert log matching video exact entries
  const [alerts, setAlerts] = useState<AlertLogItem[]>([
    {
      id: 4,
      timestamp: '2026-09-23 20:58:37',
      reason: "Detected 'fighting' behavior with 97% confidence",
      current_count: 110,
      predicted_count: 107.6276,
      direction: 'None',
      anomaly_label: 'fighting',
      anomaly_confidence: 0.9732,
      security_guards: 3,
      medical_staff: 3,
    },
    {
      id: 3,
      timestamp: '2026-09-23 20:56:57',
      reason: "Detected 'fighting' behavior with 97% confidence",
      current_count: 110,
      predicted_count: 107.6276,
      direction: 'None',
      anomaly_label: 'fighting',
      anomaly_confidence: 0.9732,
      security_guards: 3,
      medical_staff: 3,
    },
    {
      id: 2,
      timestamp: '2026-09-23 20:21:04',
      reason: "Detected 'fighting' behavior with 97% confidence",
      current_count: 110,
      predicted_count: 107.3328,
      direction: 'None',
      anomaly_label: 'fighting',
      anomaly_confidence: 0.9732,
      security_guards: 3,
      medical_staff: 3,
    },
    {
      id: 1,
      timestamp: '2026-09-23 20:00:22',
      reason: "Detected 'fighting' behavior with 97% confidence",
      current_count: 110,
      predicted_count: 144.1887,
      direction: 'None',
      anomaly_label: 'fighting',
      anomaly_confidence: 0.9732,
      security_guards: 3,
      medical_staff: 3,
    },
  ]);

  const handleUpdateDensity = (updated: Partial<DensityEstimationState>) => {
    setDensityState((prev) => ({ ...prev, ...updated }));
  };

  const handleUpdateForecast = (updated: Partial<CongestionForecastState>) => {
    setForecastState((prev) => ({ ...prev, ...updated }));
  };

  const handleUpdateActivity = (updated: Partial<ActivityRecognitionState>) => {
    setActivityState((prev) => ({ ...prev, ...updated }));
  };

  const handleAddAlert = (newAlert: AlertLogItem) => {
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const handleClearAlerts = () => {
    setAlerts([]);
  };

  return (
    <div className="min-h-screen bg-[#0e1117] text-[#fafafa] flex flex-col font-sans selection:bg-[#ff4b4b] selection:text-white">
      {/* Top Streamlit Header & Navigation Tabs */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tabId) => setActiveTab(tabId)}
        onOpenProjectModal={() => setIsModalOpen(true)}
      />

      {/* Main Content Area rendering the active tab */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        {activeTab === 1 && (
          <Tab1DensityEstimation
            state={densityState}
            onChangeState={handleUpdateDensity}
          />
        )}

        {activeTab === 2 && (
          <Tab2CongestionForecast
            state={forecastState}
            currentCountFromTab1={densityState.predictedCount}
            onChangeState={handleUpdateForecast}
          />
        )}

        {activeTab === 3 && (
          <Tab3ActivityRecognition
            state={activityState}
            onChangeState={handleUpdateActivity}
          />
        )}

        {activeTab === 4 && (
          <Tab4AlertLog
            currentCount={densityState.predictedCount}
            predictedCount={forecastState.predictedCount}
            activityLabel={activityState.predictedActivity}
            activityConfidence={activityState.confidence}
            securityGuards={densityState.securityGuardsNeeded}
            medicalStaff={densityState.medicalStaffNeeded}
            direction={densityState.busiestDirection}
            alerts={alerts}
            onAddAlert={handleAddAlert}
            onClearAlerts={handleClearAlerts}
          />
        )}

        {activeTab === 5 && <Tab5ThreatDetection />}

        {activeTab === 6 && <Tab6PersonTracking />}
      </main>

      {/* Bottom Footer */}
      <footer className="w-full border-t border-[#262730] py-4 px-6 text-center text-xs text-[#808495] flex flex-wrap items-center justify-between gap-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Deep Learning Surveillance Engine • UAV Stream Online</span>
        </div>
        <div>
          Santhiram Engineering College (Autonomous) • Nandyal • Batch 29
        </div>
      </footer>

      {/* Academic Project Info Modal */}
      <ProjectInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
