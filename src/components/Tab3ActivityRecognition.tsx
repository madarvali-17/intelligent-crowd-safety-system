import React, { useState, useRef, useEffect } from 'react';
import { ActivityRecognitionState } from '../types';
import { Upload, X, Play, Pause, AlertTriangle, ShieldCheck, Flame, FastForward } from 'lucide-react';

interface Tab3Props {
  state: ActivityRecognitionState;
  onChangeState: (updated: Partial<ActivityRecognitionState>) => void;
}

export const Tab3ActivityRecognition: React.FC<Tab3Props> = ({ state, onChangeState }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [hoveredBar, setHoveredBar] = useState<'fighting' | 'normal' | null>(null);
  const canvasAnimRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Pre-configured activity presets
  const presets = [
    {
      name: '8100_vvid.avi',
      size: '222.3KB',
      activity: 'FIGHTING' as const,
      confidence: 97.3,
      probabilities: { fighting: 0.973249554634, normal: 0.026750445366 },
    },
    {
      name: 'running_panic_cctv.avi',
      size: '310.5KB',
      activity: 'RUNNING' as const,
      confidence: 94.1,
      probabilities: { fighting: 0.05891244, normal: 0.94108756 },
    },
    {
      name: 'normal_flow_uav.mp4',
      size: '420.1KB',
      activity: 'NORMAL' as const,
      confidence: 98.7,
      probabilities: { fighting: 0.0128456, normal: 0.9871544 },
    },
  ];

  // Synthesize realistic CCTV surveillance animation on canvas
  useEffect(() => {
    let animId: number;
    let frameCount = 0;
    const canvas = canvasAnimRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      frameCount++;
      const w = canvas.width;
      const h = canvas.height;

      // Dark surveillance background
      ctx.fillStyle = '#161922';
      ctx.fillRect(0, 0, w, h);

      // Floor grid / perspective street
      ctx.strokeStyle = '#232836';
      ctx.lineWidth = 1;
      for (let i = 0; i < w; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }

      // Draw simulated figures based on activity
      const timeSec = (frameCount % 180) / 30;
      setCurrentTime(timeSec);

      if (state.predictedActivity === 'FIGHTING') {
        // Two figures grappling / fast agitation in center
        const shakeX = Math.sin(frameCount * 0.4) * 8;
        const shakeY = Math.cos(frameCount * 0.5) * 5;

        // Figure 1 (red/flagged posture)
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(w / 2 - 30 + shakeX, h / 2 - 25 + shakeY, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(w / 2 - 42 + shakeX, h / 2 - 10 + shakeY, 24, 45);

        // Figure 2 (orange/grappling posture)
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(w / 2 + 30 - shakeX, h / 2 - 25 - shakeY, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(w / 2 + 18 - shakeX, h / 2 - 10 - shakeY, 24, 45);

        // Agitation shockwaves / bounding box
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(w / 2 - 80, h / 2 - 50, 160, 110);
        ctx.setLineDash([]);

        // Tag label
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('ANOMALY: FIGHTING DETECTED [0.97]', w / 2 - 75, h / 2 - 58);
      } else if (state.predictedActivity === 'RUNNING') {
        // Fast horizontal movement
        const runX = (frameCount * 6) % (w + 100) - 50;
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(runX, h / 2 - 20, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(runX - 10, h / 2 - 5, 20, 40);

        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2;
        ctx.strokeRect(runX - 25, h / 2 - 40, 50, 85);
        ctx.fillStyle = '#eab308';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('RUNNING [VELOCITY: HIGH]', runX - 30, h / 2 - 48);
      } else {
        // Normal crowd walking quietly
        for (let i = 0; i < 6; i++) {
          const px = ((i * 120 + frameCount * 0.8) % (w + 40)) - 20;
          const py = h / 2 + (i % 2 === 0 ? 10 : -15);
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(px, py - 18, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(px - 8, py - 5, 16, 35);
        }
      }

      // OSD Timestamp & Camera ID
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(10, 10, 240, 24);
      ctx.fillStyle = '#22c55e';
      ctx.font = '11px monospace';
      ctx.fillText(`CAM-UAV04 • 2026-09-23 20:58:${String(Math.floor(frameCount / 30)).padStart(2, '0')} REC`, 16, 26);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [state.predictedActivity]);

  const handleSelectPreset = (preset: typeof presets[0]) => {
    onChangeState({
      videoName: preset.name,
      videoSize: preset.size,
      predictedActivity: preset.activity,
      confidence: preset.confidence,
      probabilities: preset.probabilities,
    });
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onChangeState({
        videoName: file.name,
        videoSize: `${(file.size / 1024).toFixed(1)} KB`,
        videoUrl: url,
        predictedActivity: 'FIGHTING',
        confidence: 96.5,
        probabilities: { fighting: 0.965, normal: 0.035 },
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Anomaly / Activity Recognition
        </h2>
        <p className="text-sm text-[#a3a8b8] mt-1">
          Upload a short video clip to check for running or fighting behavior.
        </p>
      </div>

      {/* Preset selector pills for testing different video scenarios */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
        <span className="text-[#808495] shrink-0 font-medium">Test Clips:</span>
        {presets.map((p) => (
          <button
            key={p.name}
            onClick={() => handleSelectPreset(p)}
            className={`px-3 py-1 rounded border text-xs font-mono transition-colors cursor-pointer ${
              state.videoName === p.name
                ? 'bg-[#ff4b4b] text-white border-[#ff4b4b] font-semibold'
                : 'bg-[#1e212b] text-[#a3a8b8] border-[#3b3d4a] hover:text-white'
            }`}
          >
            {p.name} ({p.activity})
          </button>
        ))}
      </div>

      {/* Choose a video uploader card */}
      <div className="space-y-1.5">
        <label className="text-xs text-[#a3a8b8] font-medium block">
          Choose a video...
        </label>

        <div className="bg-[#262730] border border-[#3b3d4a] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white font-medium bg-[#1e212b] px-3 py-1.5 rounded border border-[#3b3d4a] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              {state.videoName}
              <span className="text-xs text-[#808495] font-mono">{state.videoSize}</span>
            </span>

            {state.videoName !== '8100_vvid.avi' && (
              <button
                onClick={() => handleSelectPreset(presets[0])}
                className="text-[#808495] hover:text-[#ff4b4b] p-1"
                title="Reset default video"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCustomUpload}
              accept="video/*,.avi,.mp4,.mov,.webm"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#0e1117] hover:bg-[#1e212b] text-white text-xs px-3.5 py-1.5 rounded border border-[#3b3d4a] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#ff4b4b]" />
              Browse video
            </button>
          </div>
        </div>
      </div>

      {/* Video Player Display matching the video player */}
      <div className="w-full bg-[#131720] border border-[#262730] rounded-lg overflow-hidden shadow-2xl">
        <div className="relative aspect-video max-h-[360px] w-full flex items-center justify-center bg-black">
          <canvas
            ref={canvasAnimRef}
            width={640}
            height={360}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Video Player Bottom Controls Bar */}
        <div className="bg-[#1e212b] px-4 py-2 flex items-center justify-between text-xs text-[#a3a8b8] border-t border-[#262730]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="hover:text-white transition-colors text-white"
            >
              <Play className="w-4 h-4 fill-white" />
            </button>
            <span className="font-mono text-slate-300">
              0:0{Math.floor(currentTime)} / 0:06
            </span>
          </div>

          <div className="w-1/2 bg-[#31333f] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#ff4b4b] h-full transition-all"
              style={{ width: `${(currentTime / 6) * 100}%` }}
            />
          </div>

          <div className="text-[11px] font-mono text-[#808495]">
            222.3KB • 30 FPS • UAV Aerial
          </div>
        </div>
      </div>

      {/* Results Section matching the video */}
      <div className="space-y-4 pt-2">
        <div>
          <div className="text-xs text-[#a3a8b8] font-medium">
            Predicted Activity
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span
              className={`text-3xl md:text-4xl font-extrabold tracking-tight ${
                state.predictedActivity === 'FIGHTING'
                  ? 'text-red-400'
                  : state.predictedActivity === 'RUNNING'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {state.predictedActivity}
            </span>

            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-mono">
              ↑ {state.confidence.toFixed(1)}% confidence
            </span>
          </div>
        </div>

        {/* Interactive Bar Chart matching the exact visual in video */}
        <div className="bg-[#131720] border border-[#262730] rounded-lg p-6 relative">
          <div className="h-64 flex items-end justify-around gap-12 pt-6 pb-8 border-b border-slate-700/80 relative">
            {/* Horizontal Grid lines 0.0, 0.2, 0.4, 0.6, 0.8, 1.0 */}
            {[0.0, 0.2, 0.4, 0.6, 0.8, 1.0].map((val) => (
              <div
                key={val}
                className="absolute left-0 right-0 border-t border-slate-800 flex items-center justify-between text-[11px] text-[#808495] font-mono"
                style={{ bottom: `${val * 85 + 12}%` }}
              >
                <span className="pl-1">{val.toFixed(1)}</span>
              </div>
            ))}

            {/* Fighting Bar (Light Blue #85bdfa / #7cc2fc matching video) */}
            <div
              className="flex-1 max-w-[200px] flex flex-col items-center z-10 group cursor-pointer"
              onMouseEnter={() => setHoveredBar('fighting')}
              onMouseLeave={() => setHoveredBar(null)}
            >
              <div
                className="w-full bg-[#82c0fa] hover:bg-[#a2d2ff] transition-all rounded-t-sm shadow-md"
                style={{ height: `${state.probabilities.fighting * 180}px` }}
              />
              <span className="text-xs text-[#a3a8b8] mt-3 font-mono transform -rotate-45 md:rotate-0">
                fighting
              </span>
            </div>

            {/* Normal Bar */}
            <div
              className="flex-1 max-w-[200px] flex flex-col items-center z-10 group cursor-pointer"
              onMouseEnter={() => setHoveredBar('normal')}
              onMouseLeave={() => setHoveredBar(null)}
            >
              <div
                className="w-full bg-[#82c0fa] hover:bg-[#a2d2ff] transition-all rounded-t-sm min-h-[4px]"
                style={{ height: `${Math.max(4, state.probabilities.normal * 180)}px` }}
              />
              <span className="text-xs text-[#a3a8b8] mt-3 font-mono transform -rotate-45 md:rotate-0">
                normal
              </span>
            </div>

            {/* Hover Tooltip matching video tooltip */}
            {hoveredBar && (
              <div className="absolute top-2 right-4 bg-[#0e1117] border border-[#3b3d4a] rounded px-3 py-1.5 text-xs font-mono text-slate-200 shadow-xl z-20">
                <div>index: <span className="text-white font-bold">{hoveredBar}</span></div>
                <div>
                  value: <span className="text-emerald-400 font-bold">{state.probabilities[hoveredBar]}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
