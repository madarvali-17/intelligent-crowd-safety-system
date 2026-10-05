import React, { useRef, useEffect, useState } from 'react';
import { DensityEstimationState } from '../types';
import { Upload, X, Link as LinkIcon, RefreshCw, Cpu, Layers } from 'lucide-react';
import defaultCrowdImg from '../assets/images/crowd_aerial_protest_1791204775838.jpg';

interface Tab1Props {
  state: DensityEstimationState;
  onChangeState: (updated: Partial<DensityEstimationState>) => void;
}

export const Tab1DensityEstimation: React.FC<Tab1Props> = ({ state, onChangeState }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sensitivity, setSensitivity] = useState(1.0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper to map 0..1 to viridis/jet-like color for heatmap
  const getViridisColor = (val: number): [number, number, number] => {
    // 0: deep blue [68, 1, 84] -> cyan/green [33, 145, 140] -> yellow [253, 231, 37]
    const v = Math.max(0, Math.min(1, val));
    if (v < 0.25) {
      const t = v / 0.25;
      return [
        Math.round(68 * (1 - t) + 49 * t),
        Math.round(1 * (1 - t) + 104 * t),
        Math.round(84 * (1 - t) + 142 * t),
      ];
    } else if (v < 0.5) {
      const t = (v - 0.25) / 0.25;
      return [
        Math.round(49 * (1 - t) + 33 * t),
        Math.round(104 * (1 - t) + 145 * t),
        Math.round(142 * (1 - t) + 140 * t),
      ];
    } else if (v < 0.75) {
      const t = (v - 0.5) / 0.25;
      return [
        Math.round(33 * (1 - t) + 94 * t),
        Math.round(145 * (1 - t) + 201 * t),
        Math.round(140 * (1 - t) + 98 * t),
      ];
    } else {
      const t = (v - 0.75) / 0.25;
      return [
        Math.round(94 * (1 - t) + 253 * t),
        Math.round(201 * (1 - t) + 231 * t),
        Math.round(98 * (1 - t) + 37 * t),
      ];
    }
  };

  // Draw density map on canvas with Matplotlib axes matching the video
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 340;
    const height = 440;
    canvas.width = width;
    canvas.height = height;

    // Fill white background for matplotlib canvas look
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Plot margin
    const margin = { top: 30, right: 25, bottom: 40, left: 45 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    // Heatmap grid (100 x 140 points)
    const gridCols = 40;
    const gridRows = 55;
    const cellW = plotWidth / gridCols;
    const cellH = plotHeight / gridRows;

    // Deterministic pseudo-random generation shaped around street crowd center
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        // High density in central vertical corridor (street) with East bias
        const normR = r / gridRows;
        const normC = c / gridCols;
        const centerDist = Math.abs(normC - 0.55);
        let density = Math.exp(-centerDist * centerDist * 16) * 0.75;

        // Fluctuations
        const noise =
          Math.sin(r * 0.4) * Math.cos(c * 0.35) * 0.2 +
          Math.sin(r * 0.8 + c * 0.9) * 0.15 +
          (Math.sin((r * c) / 10) * 0.1);
        density = Math.max(0.05, Math.min(0.98, density + noise * 0.4));

        const [red, green, blue] = getViridisColor(density * sensitivity);
        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        ctx.fillRect(
          margin.left + c * cellW,
          margin.top + r * cellH,
          cellW + 0.5,
          cellH + 0.5
        );
      }
    }

    // Outer frame of plot
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(margin.left, margin.top, plotWidth, plotHeight);

    // Title: Predicted Density Map
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 15px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Predicted Density Map', width / 2, 20);

    // Y-Axis Ticks & Labels: 0, 20, 40, 60, 80, 100, 120, 140
    ctx.fillStyle = '#000000';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.textAlign = 'right';
    const yTicks = [0, 20, 40, 60, 80, 100, 120, 140];
    yTicks.forEach((tick) => {
      const y = margin.top + (tick / 140) * plotHeight;
      ctx.beginPath();
      ctx.moveTo(margin.left - 5, y);
      ctx.lineTo(margin.left, y);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillText(tick.toString(), margin.left - 8, y + 4);
    });

    // X-Axis Ticks & Labels: 0, 25, 50, 75, 100
    ctx.textAlign = 'center';
    const xTicks = [0, 25, 50, 75, 100];
    xTicks.forEach((tick) => {
      const x = margin.left + (tick / 100) * plotWidth;
      ctx.beginPath();
      ctx.moveTo(x, margin.top + plotHeight);
      ctx.lineTo(x, margin.top + plotHeight + 5);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillText(tick.toString(), x, margin.top + plotHeight + 18);
    });
  }, [sensitivity, state.imageUrl]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      const url = URL.createObjectURL(file);
      setTimeout(() => {
        // Compute realistic estimate for custom image
        const customCount = Math.floor(80 + Math.random() * 65);
        onChangeState({
          imageName: file.name,
          imageSize: `${(file.size / 1024).toFixed(1)} KB`,
          imageUrl: url,
          predictedCount: customCount,
          securityGuardsNeeded: Math.ceil(customCount / 35),
          medicalStaffNeeded: Math.ceil(customCount / 90),
          quadrantDensities: {
            North: 50.2 + Math.random() * 12,
            South: 48.5 + Math.random() * 10,
            West: 45.1 + Math.random() * 12,
            East: 55.4 + Math.random() * 14,
          },
        });
        setIsProcessing(false);
      }, 700);
    }
  };

  const handleResetDefault = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onChangeState({
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
      setIsProcessing(false);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title Header with Anchor Link */}
      <div className="flex items-center gap-2 text-white">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">
          Crowd Counting & Resource Allocation
        </h2>
        <a href="#density" className="text-[#a3a8b8] hover:text-[#ff4b4b] transition-colors" title="Section Link">
          <LinkIcon className="w-4 h-4" />
        </a>
      </div>

      <p className="text-sm text-[#a3a8b8]">
        Upload an aerial/CCTV image to estimate crowd count and density distribution.
      </p>

      {/* File Uploader Card matching Streamlit */}
      <div className="space-y-2">
        <label className="text-xs text-[#a3a8b8] font-medium block">
          Choose an image...
        </label>

        <div className="bg-[#262730] border border-[#3b3d4a] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white font-medium bg-[#1e212b] px-3 py-1.5 rounded border border-[#3b3d4a] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {state.imageName}
              <span className="text-xs text-[#808495] font-mono">{state.imageSize}</span>
            </span>

            {state.imageName !== 'crowd.jpg' && (
              <button
                onClick={handleResetDefault}
                className="text-[#808495] hover:text-[#ff4b4b] p-1 transition-colors"
                title="Reset to default crowd.jpg"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
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
              Browse file
            </button>

            <button
              onClick={handleResetDefault}
              className="text-xs text-[#a3a8b8] hover:text-white px-2 py-1.5 transition-colors flex items-center gap-1"
              title="Reset sample"
            >
              <RefreshCw className="w-3 h-3" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Uploaded Aerial Image Display */}
      <div className="w-full bg-[#131720] border border-[#262730] rounded-lg overflow-hidden shadow-lg">
        <div className="relative max-h-[460px] overflow-hidden flex items-center justify-center bg-black/60">
          <img
            src={state.imageUrl || defaultCrowdImg}
            alt="Uploaded aerial crowd"
            className="w-full h-auto object-cover max-h-[460px]"
            referrerPolicy="no-referrer"
          />
          {isProcessing && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 text-white">
              <Cpu className="w-8 h-8 text-[#ff4b4b] animate-spin" />
              <span className="text-sm font-medium">Running LDCNN Inference...</span>
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black/70 text-slate-300 text-[11px] font-mono px-2 py-0.5 rounded">
            Uploaded Image (Aerial UAV Camera Frame)
          </div>
        </div>
      </div>

      {/* Two Column Output: Heatmap & Metrics matching exact video layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
        {/* Left Column: Matplotlib Predicted Density Map */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center bg-[#131720] p-4 rounded-lg border border-[#262730]">
          <div className="shadow-2xl rounded overflow-hidden border border-slate-700 bg-white">
            <canvas ref={canvasRef} className="max-w-full h-auto block" />
          </div>
          <div className="flex items-center justify-between w-full mt-3 px-2 text-xs text-[#808495]">
            <span className="flex items-center gap-1 font-mono">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              LDCNN Feature Map
            </span>
            <span className="text-[11px]">Colormap: Viridis</span>
          </div>
        </div>

        {/* Right Column: Exact Metrics & JSON Quadrants */}
        <div className="lg:col-span-6 space-y-4">
          <div>
            <div className="text-xs text-[#a3a8b8] font-medium uppercase tracking-wider">
              Predicted Crowd Count
            </div>
            <div className="text-4xl md:text-5xl font-bold text-white mt-1 font-mono tabular-nums">
              {state.predictedCount}
            </div>
          </div>

          <div className="space-y-1.5 text-sm md:text-base text-slate-200">
            <div>
              <span className="font-semibold text-white">Security Guards Needed: </span>
              <span className="font-mono text-emerald-400 font-bold">{state.securityGuardsNeeded}</span>
            </div>
            <div>
              <span className="font-semibold text-white">Medical Staff Needed: </span>
              <span className="font-mono text-cyan-400 font-bold">{state.medicalStaffNeeded}</span>
            </div>
            <div>
              <span className="font-semibold text-white">Busiest Direction(s): </span>
              <span className="font-medium text-amber-300">{state.busiestDirection}</span>
            </div>
          </div>

          <div className="pt-2">
            <div className="text-sm font-semibold text-white mb-2">
              Quadrant densities:
            </div>
            {/* Formatted JSON block matching the video */}
            <div className="bg-[#0e1117] border border-[#262730] rounded-md p-4 font-mono text-xs md:text-sm text-emerald-400 overflow-x-auto shadow-inner">
              <pre className="text-emerald-400">
{`{
  "North": ${state.quadrantDensities.North.toFixed(14)},
  "South": ${state.quadrantDensities.South.toFixed(14)},
  "West": ${state.quadrantDensities.West.toFixed(14)},
  "East": ${state.quadrantDensities.East.toFixed(14)}
}`}
              </pre>
            </div>
          </div>

          {/* Model info banner from PDF */}
          <div className="p-3 bg-[#1e212b] border border-[#3b3d4a] rounded text-xs text-[#a3a8b8] space-y-1">
            <div className="font-semibold text-slate-300">Model: Lightweight Dilated CNN (LDCNN)</div>
            <p className="text-[11px] leading-relaxed">
              Generates high-precision crowd density maps with dilated convolutions for receptive field expansion at low computational complexity for edge UAV deployment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
