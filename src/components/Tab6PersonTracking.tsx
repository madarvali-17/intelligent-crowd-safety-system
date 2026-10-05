import React, { useState, useRef, useEffect } from 'react';
import { FlaggedTrackItem } from '../types';
import { Upload, X, Loader2, Play, Pause, AlertOctagon, RotateCcw, UserCheck, Shield } from 'lucide-react';
import defaultTrackImg from '../assets/images/person_running_track_1791204871555.jpg';

export const Tab6PersonTracking: React.FC = () => {
  const [videoName, setVideoName] = useState('8100_vvid.avi');
  const [videoSize, setVideoSize] = useState('222.3KB');
  const [isProcessing, setIsProcessing] = useState(false);
  const [framesProcessed, setFramesProcessed] = useState(41);
  const [flaggedIdsThisRun, setFlaggedIdsThisRun] = useState<number[]>([1]);
  const [activeFrame, setActiveFrame] = useState(24);
  const [isPlaying, setIsPlaying] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Persistent log of flagged individuals matching the video
  const [flaggedLogs, setFlaggedLogs] = useState<FlaggedTrackItem[]>([
    {
      id: 'f1',
      trackId: 1,
      behavior: 'running',
      frame: 24,
      timestamp: '2026-09-23 20:41:13',
    },
    {
      id: 'f2',
      trackId: 1,
      behavior: 'running',
      frame: 24,
      timestamp: '2026-09-23 19:30:36',
    },
  ]);

  // Video track simulation across 41 frames
  useEffect(() => {
    let animId: number;
    let frame = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = defaultTrackImg;

    const render = () => {
      if (isPlaying) {
        frame = (frame + 1) % 41;
        setActiveFrame(frame);
      }

      const w = canvas.width;
      const h = canvas.height;

      // Draw background CCTV image
      if (img.complete) {
        ctx.drawImage(img, 0, 0, w, h);
      } else {
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, w, h);
      }

      // Dark overlay for surveillance contrast
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(0, 0, w, h);

      // Person 2: Normal walking pedestrian (Green box)
      const p2X = 140 + frame * 1.5;
      const p2Y = 160 + Math.sin(frame * 0.2) * 4;
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.strokeRect(p2X, p2Y, 65, 140);
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('Track ID 2 [WALKING]', p2X, p2Y - 6);

      // Person 1: Running Individual (Flagged Red Box with persistent Cooldown)
      const p1X = 320 + frame * 7.5; // High velocity
      const p1Y = 145 + Math.sin(frame * 0.8) * 8; // Running vertical oscillation
      const isFlagged = frame > 8; // Flagged after velocity threshold exceeded

      if (isFlagged) {
        // Red FLAGGED box
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(p1X, p1Y, 70, 150);

        // Solid red banner tag
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(p1X, p1Y - 22, 160, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('FLAGGED: RUNNING (ID 1)', p1X + 4, p1Y - 8);

        // Motion vector trail
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(p1X - 60, p1Y + 75);
        ctx.lineTo(p1X, p1Y + 75);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // Normal green track before trigger
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.strokeRect(p1X, p1Y, 70, 150);
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('Track ID 1 [EVALUATING]', p1X, p1Y - 6);
      }

      // HUD OSD
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(10, 10, 260, 24);
      ctx.fillStyle = '#22c55e';
      ctx.font = '11px monospace';
      ctx.fillText(`FRAME: ${frame + 1}/41 • FPS: 24 • BYTE_TRACK`, 16, 26);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  const handleSimulateRerun = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
        now.getDate()
      )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      const newLog: FlaggedTrackItem = {
        id: `f_${Date.now()}`,
        trackId: 1,
        behavior: 'running',
        frame: 24,
        timestamp,
      };

      setFlaggedLogs((prev) => [newLog, ...prev]);
      setFramesProcessed(41);
      setFlaggedIdsThisRun([1]);
    }, 600);
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoName(file.name);
      setVideoSize(`${(file.size / 1024).toFixed(1)}KB`);
      handleSimulateRerun();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Persistent Person Tracking & Flagging
        </h2>
        <p className="text-sm text-[#a3a8b8] mt-1 leading-relaxed">
          Assigns each person a persistent ID across the video. Anyone whose motion looks like running, or who overlaps a weapon detection, gets a red &apos;FLAGGED&apos; box that stays on them for a cooldown period — not just for one frame.
        </p>
        <p className="text-xs text-[#808495] mt-1.5 font-normal">
          Behavior-based only: no face recognition, no identity database, no group/gang classification.
        </p>
      </div>

      {/* Choose a video uploader matching video */}
      <div className="space-y-1.5">
        <label className="text-xs text-[#a3a8b8] font-medium block">
          Choose a video...
        </label>

        <div className="bg-[#262730] border border-[#3b3d4a] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white font-medium bg-[#1e212b] px-3 py-1.5 rounded border border-[#3b3d4a] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {videoName}
              <span className="text-xs text-[#808495] font-mono">{videoSize}</span>
            </span>

            {videoName !== '8100_vvid.avi' && (
              <button
                onClick={() => {
                  setVideoName('8100_vvid.avi');
                  setVideoSize('222.3KB');
                }}
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
              onChange={handleCustomUpload}
              accept="video/*,.avi,.mp4,.mov"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#0e1117] hover:bg-[#1e212b] text-white text-xs px-3.5 py-1.5 rounded border border-[#3b3d4a] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#ff4b4b]" />
              Upload (200MB per file • MP4, AVI, MOV)
            </button>
          </div>
        </div>
      </div>

      {/* Tracking across frames status/spinner if processing */}
      {isProcessing && (
        <div className="flex items-center gap-2.5 text-xs text-slate-300 font-mono bg-[#1e212b] p-3 rounded border border-[#3b3d4a]">
          <Loader2 className="w-4 h-4 animate-spin text-[#ff4b4b]" />
          <span>Tracking people across frames...</span>
        </div>
      )}

      {/* Video Player & Persistent Bounding Box Display */}
      <div className="w-full bg-[#131720] border border-[#262730] rounded-lg overflow-hidden shadow-2xl relative">
        <div className="relative aspect-video max-h-[440px] w-full flex items-center justify-center bg-black">
          <canvas
            ref={canvasRef}
            width={760}
            height={430}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Video Player Bar */}
        <div className="bg-[#1e212b] px-4 py-2 flex items-center justify-between text-xs text-[#a3a8b8] border-t border-[#262730]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="hover:text-white transition-colors text-white"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
            </button>
            <span className="font-mono text-slate-300">
              Frame {activeFrame + 1} / 41
            </span>
          </div>

          <div className="w-1/2 bg-[#31333f] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#ff4b4b] h-full transition-all"
              style={{ width: `${((activeFrame + 1) / 41) * 100}%` }}
            />
          </div>

          <button
            onClick={handleSimulateRerun}
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Re-track
          </button>
        </div>
      </div>

      {/* Output Stats matching video */}
      <div className="space-y-2 pt-1">
        <div>
          <div className="text-xs text-[#a3a8b8] font-medium">Frames processed</div>
          <div className="text-3xl md:text-4xl font-bold text-white font-mono tabular-nums">
            {framesProcessed}
          </div>
        </div>

        <div className="text-sm font-mono text-slate-200">
          <span className="text-[#a3a8b8]">Flagged track IDs this run: </span>
          <span className="text-[#ff4b4b] font-bold">[{flaggedIdsThisRun.join(', ')}]</span>
        </div>
      </div>

      <hr className="border-[#262730]" />

      {/* Flagged individuals log (persists across runs) matching video */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 tracking-wide">
          Flagged individuals log (persists across runs)
        </h3>

        <div className="space-y-3">
          {flaggedLogs.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 bg-[#131720] border border-[#262730] p-2.5 rounded hover:border-[#3b3d4a] transition-all"
            >
              {/* Crop preview thumbnail matching video */}
              <div className="w-14 h-20 bg-slate-900 border border-slate-700 rounded overflow-hidden shrink-0 flex items-center justify-center relative">
                <img
                  src={defaultTrackImg}
                  alt="Crop preview"
                  className="w-full h-full object-cover scale-150 transform object-center"
                />
                <span className="absolute bottom-0 left-0 right-0 bg-red-600/90 text-[9px] font-mono text-white text-center py-0.2">
                  ID {item.trackId}
                </span>
              </div>

              {/* Text label matching video exact formatting */}
              <div className="text-xs md:text-sm font-mono text-slate-300">
                Track ID <span className="font-bold text-white">{item.trackId}</span> —{' '}
                <span className="text-red-400 font-semibold">{item.behavior}</span> (Frame {item.frame},{' '}
                {item.timestamp})
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
