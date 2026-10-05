import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, ShieldAlert, AlertTriangle, Eye, Layers } from 'lucide-react';
import defaultTacticalImg from '../assets/images/security_tactical_line_1791204795396.jpg';

interface ThreatBox {
  id: string;
  label: string;
  confidence: number;
  type: 'person' | 'weapon' | 'fallen';
  // coordinates in percentages: [ymin, xmin, ymax, xmax]
  box: [number, number, number, number];
}

export const Tab5ThreatDetection: React.FC = () => {
  const [fileName, setFileName] = useState('images (3).jpg');
  const [fileSize, setFileSize] = useState('53.0KB');
  const [imageUrl, setImageUrl] = useState(defaultTacticalImg);
  const [enableFineTuned, setEnableFineTuned] = useState(false);
  const [hoveredBox, setHoveredBox] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Default detections for the riot/tactical police image matching video
  const defaultDetections: ThreatBox[] = [
    {
      id: 'p1',
      label: 'person',
      confidence: 88,
      type: 'person',
      box: [28, 6, 92, 28], // left-most tactical officer
    },
    {
      id: 'p2',
      label: 'person',
      confidence: 87,
      type: 'person',
      box: [32, 29, 90, 48], // center tactical officer
    },
    {
      id: 'p3',
      label: 'person',
      confidence: 85,
      type: 'person',
      box: [30, 46, 88, 62], // third officer
    },
    {
      id: 'p4',
      label: 'person',
      confidence: 80,
      type: 'person',
      box: [34, 60, 85, 74], // fourth officer
    },
  ];

  // Optional fine-tuned detections
  const fineTunedDetections: ThreatBox[] = [
    ...defaultDetections,
    {
      id: 'w1',
      label: 'weapon (rifle/baton)',
      confidence: 91,
      type: 'weapon',
      box: [46, 17, 78, 30],
    },
    {
      id: 'f1',
      label: 'fallen-person (simulated)',
      confidence: 84,
      type: 'fallen',
      box: [65, 72, 88, 92],
    },
  ];

  const detections = enableFineTuned ? fineTunedDetections : defaultDetections;
  const peopleCount = detections.filter((d) => d.type === 'person').length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFileName(file.name);
      setFileSize(`${(file.size / 1024).toFixed(1)}KB`);
      setImageUrl(url);
    }
  };

  const handleReset = () => {
    setFileName('images (3).jpg');
    setFileSize('53.0KB');
    setImageUrl(defaultTacticalImg);
    setEnableFineTuned(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Threat Object Detection (YOLO)
        </h2>
        <p className="text-sm text-[#a3a8b8] mt-1">
          Person detection works immediately (pretrained). Weapon and fallen-person detection need a fine-tuned checkpoint — see README.
        </p>
      </div>

      {/* Choose an image... uploader matching video */}
      <div className="space-y-1.5">
        <label className="text-xs text-[#a3a8b8] font-medium block">
          Choose an image...
        </label>

        <div className="bg-[#262730] border border-[#3b3d4a] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white font-medium bg-[#1e212b] px-3 py-1.5 rounded border border-[#3b3d4a] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              {fileName}
              <span className="text-xs text-[#808495] font-mono">{fileSize}</span>
            </span>

            {fileName !== 'images (3).jpg' && (
              <button
                onClick={handleReset}
                className="text-[#808495] hover:text-[#ff4b4b] p-1"
                title="Reset default"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#0e1117] hover:bg-[#1e212b] text-white text-xs px-3.5 py-1.5 rounded border border-[#3b3d4a] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#ff4b4b]" />
              Upload (200MB per file • JPG, PNG)
            </button>
          </div>
        </div>
      </div>

      {/* Image with YOLO Bounding Boxes Overlay matching video visual */}
      <div className="w-full bg-[#131720] border border-[#262730] rounded-lg overflow-hidden shadow-2xl relative">
        <div className="relative w-full max-h-[520px] overflow-hidden bg-black flex items-center justify-center">
          <img
            src={imageUrl}
            alt="Tactical Surveillance YOLO"
            className="w-full h-auto object-cover max-h-[520px] block select-none"
            referrerPolicy="no-referrer"
          />

          {/* SVG / HTML Bounding Boxes Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {detections.map((det) => {
              const [ymin, xmin, ymax, xmax] = det.box;
              const isHovered = hoveredBox === det.id;

              const borderColor =
                det.type === 'weapon'
                  ? '#ef4444' // red
                  : det.type === 'fallen'
                  ? '#f59e0b' // amber
                  : '#0084ff'; // blue (matching video blue)

              const labelBg =
                det.type === 'weapon'
                  ? 'bg-red-600'
                  : det.type === 'fallen'
                  ? 'bg-amber-600'
                  : 'bg-[#0084ff]';

              return (
                <div
                  key={det.id}
                  style={{
                    top: `${ymin}%`,
                    left: `${xmin}%`,
                    width: `${xmax - xmin}%`,
                    height: `${ymax - ymin}%`,
                    borderColor,
                  }}
                  className={`absolute border-2 pointer-events-auto transition-all cursor-pointer ${
                    isHovered ? 'ring-2 ring-white z-20' : 'z-10'
                  }`}
                  onMouseEnter={() => setHoveredBox(det.id)}
                  onMouseLeave={() => setHoveredBox(null)}
                >
                  {/* Bounding box label tag */}
                  <div
                    className={`absolute -top-5 left-0 ${labelBg} text-white font-mono text-[11px] font-bold px-1.5 py-0.2 rounded-t whitespace-nowrap shadow`}
                  >
                    {det.label} {det.confidence}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Caption below image matching video text */}
        <div className="p-2.5 bg-[#1e212b] text-center text-xs text-[#a3a8b8] border-t border-[#262730] flex items-center justify-center gap-4">
          <span className="font-mono text-slate-300">
            Detections (blue=person, red=weapon, amber=fallen)
          </span>

          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-400 hover:text-white select-none">
            <input
              type="checkbox"
              checked={enableFineTuned}
              onChange={(e) => setEnableFineTuned(e.target.checked)}
              className="rounded accent-[#ff4b4b]"
            />
            <span>Simulate Fine-tuned Checkpoint</span>
          </label>
        </div>
      </div>

      {/* People Detected Count Stat matching video */}
      <div className="pt-2">
        <div className="text-xs text-[#a3a8b8] font-medium">
          People detected
        </div>
        <div className="text-4xl md:text-5xl font-bold text-white mt-1 font-mono tabular-nums">
          {peopleCount}
        </div>
      </div>

      {/* Blue Alert Callout Boxes matching video */}
      <div className="space-y-3">
        <div className="bg-[#1e293b]/70 border border-[#38bdf8]/40 rounded-lg p-3 text-xs md:text-sm text-cyan-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-[#38bdf8] shrink-0" />
            <span>
              Weapon detector not trained yet — see README to fine-tune with a Roboflow dataset.
            </span>
          </div>
          <button
            onClick={() => setEnableFineTuned(!enableFineTuned)}
            className="text-[11px] underline text-[#38bdf8] hover:text-white shrink-0 ml-2"
          >
            {enableFineTuned ? 'Reset to Pretrained' : 'Load Demo Checkpoint'}
          </button>
        </div>

        <div className="bg-[#1e293b]/70 border border-[#38bdf8]/40 rounded-lg p-3 text-xs md:text-sm text-cyan-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-[#38bdf8] shrink-0" />
            <span>
              Fallen-person detector not trained yet — see README to fine-tune with a Roboflow dataset.
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            YOLOv8 Architecture
          </span>
        </div>
      </div>
    </div>
  );
};
