import React, { useState, useEffect, useRef } from 'react';
import { CongestionForecastState } from '../types';
import { TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';

interface Tab2Props {
  state: CongestionForecastState;
  currentCountFromTab1: number;
  onChangeState: (updated: Partial<CongestionForecastState>) => void;
}

export const Tab2CongestionForecast: React.FC<Tab2Props> = ({
  state,
  currentCountFromTab1,
  onChangeState,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [inputText, setInputText] = useState(state.pastCountsString);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: number; isForecast?: boolean } | null>(null);

  // Parse input string into numbers
  const parseCounts = (str: string): number[] => {
    return str
      .split(',')
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n));
  };

  // Autoregressive / Holt-Winters forecasting calculation
  const calculateForecast = (counts: number[]): number => {
    if (counts.length === 0) return currentCountFromTab1;
    if (counts.length === 1) return counts[0];
    
    // Weight recent observations more heavily (exponential moving average + trend)
    let ema = counts[0];
    const alpha = 0.35;
    for (let i = 1; i < counts.length; i++) {
      ema = alpha * counts[i] + (1 - alpha) * ema;
    }
    const recentSlope = (counts[counts.length - 1] - counts[Math.max(0, counts.length - 4)]) / 4;
    const forecasted = Math.round(ema + recentSlope * 0.5);
    return Math.max(50, Math.min(250, forecasted));
  };

  // Handle text input changes
  const handleInputChange = (text: string) => {
    setInputText(text);
    const parsed = parseCounts(text);
    if (parsed.length > 0) {
      const forecast = calculateForecast(parsed);
      onChangeState({
        pastCounts: parsed,
        pastCountsString: text,
        predictedCount: forecast,
        readingsCollected: Math.min(20, parsed.length),
      });
    }
  };

  const handleAppendTab1 = () => {
    const parsed = parseCounts(inputText);
    parsed.push(currentCountFromTab1);
    if (parsed.length > 20) parsed.shift();
    const newStr = parsed.join(', ');
    handleInputChange(newStr);
  };

  const handleResetDefault = () => {
    const defaultStr =
      '83, 117, 94, 108, 89, 115, 120, 97, 86, 118, 96, 119, 104, 86, 113, 104, 86, 113, 106, 109';
    handleInputChange(defaultStr);
  };

  // Draw Line Chart with Matplotlib styling on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const counts = parseCounts(inputText);
    const forecastVal = state.predictedCount;

    const width = 850;
    const height = 400;
    canvas.width = width;
    canvas.height = height;

    // Matplotlib white card styling
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const margin = { top: 35, right: 35, bottom: 50, left: 65 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    // Determine Y limits (min 80, max 120, or adjust dynamically)
    const allVals = [...counts, forecastVal];
    const minVal = Math.min(75, Math.floor(Math.min(...allVals) / 10) * 10);
    const maxVal = Math.max(125, Math.ceil(Math.max(...allVals) / 10) * 10);
    const yRange = maxVal - minVal;

    // Outer border of plot
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(margin.left, margin.top, plotWidth, plotHeight);

    // Subtle horizontal gridlines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.8;
    const yStep = 10;
    for (let v = minVal; v <= maxVal; v += yStep) {
      const y = margin.top + plotHeight - ((v - minVal) / yRange) * plotHeight;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + plotWidth, y);
      ctx.stroke();

      // Y-axis tick and label
      ctx.fillStyle = '#000000';
      ctx.font = '13px -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(v.toString(), margin.left - 10, y + 4);

      // Tick mark
      ctx.beginPath();
      ctx.moveTo(margin.left - 5, y);
      ctx.lineTo(margin.left, y);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Y-Axis Title: Crowd count (rotated or vertical)
    ctx.save();
    ctx.translate(20, margin.top + plotHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.font = '16px -apple-system, sans-serif';
    ctx.fillStyle = '#000000';
    ctx.fillText('Crowd count', 0, 0);
    ctx.restore();

    // X-axis: 0.0 to 20.0
    const xTicks = [0.0, 2.5, 5.0, 7.5, 10.0, 12.5, 15.0, 17.5, 20.0];
    xTicks.forEach((xt) => {
      const x = margin.left + (xt / 20.0) * plotWidth;
      ctx.beginPath();
      ctx.moveTo(x, margin.top + plotHeight);
      ctx.lineTo(x, margin.top + plotHeight + 5);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.font = '13px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(xt.toFixed(1), x, margin.top + plotHeight + 20);
    });

    // Draw Observed Line in Blue (#1f77b4)
    if (counts.length > 0) {
      ctx.strokeStyle = '#1f77b4';
      ctx.lineWidth = 2.4;
      ctx.lineJoin = 'round';
      ctx.beginPath();

      const n = Math.max(1, counts.length);
      counts.forEach((val, idx) => {
        const xNorm = idx / (Math.max(20, n) - 1);
        const x = margin.left + xNorm * plotWidth;
        const y = margin.top + plotHeight - ((val - minVal) / yRange) * plotHeight;
        if (idx === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    // Draw Forecast Point in Red (#d62728)
    const forecastX = margin.left + plotWidth; // at x=20.0
    const forecastY = margin.top + plotHeight - ((forecastVal - minVal) / yRange) * plotHeight;

    ctx.fillStyle = '#d62728';
    ctx.beginPath();
    ctx.arc(forecastX, forecastY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Bottom-Right Legend
    const legendW = 135;
    const legendH = 68;
    const legX = margin.left + plotWidth - legendW - 12;
    const legY = margin.top + plotHeight - legendH - 12;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(legX, legY, legendW, legendH);
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    ctx.strokeRect(legX, legY, legendW, legendH);

    // Observed item
    ctx.strokeStyle = '#1f77b4';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(legX + 12, legY + 22);
    ctx.lineTo(legX + 38, legY + 22);
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.font = '13px -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Observed', legX + 46, legY + 26);

    // Forecast item
    ctx.fillStyle = '#d62728';
    ctx.beginPath();
    ctx.arc(legX + 25, legY + 48, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.fillText('Forecast', legX + 46, legY + 52);
  }, [inputText, state.predictedCount]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Short-Term Congestion Forecast
        </h2>
        <p className="text-sm text-[#a3a8b8] mt-1">
          Predicts crowd count several minutes ahead, based on the last 20 readings from Tab 1 (or manually entered below).
        </p>
      </div>

      {/* Readings Counter */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-300 font-medium">
          Readings collected this session:{' '}
          <span className="font-mono text-emerald-400 font-bold">
            {state.readingsCollected}
          </span>{' '}
          / {state.neededReadings} needed
        </span>

        <button
          onClick={handleAppendTab1}
          className="text-xs bg-[#262730] hover:bg-[#31333f] text-slate-200 border border-[#3b3d4a] px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <TrendingUp className="w-3.5 h-3.5 text-[#ff4b4b]" />
          Append Tab 1 Count ({currentCountFromTab1})
        </button>
      </div>

      {/* Comma-separated Text Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs text-[#a3a8b8]">
            Or paste a comma-separated list of past counts (oldest first):
          </label>
          <button
            onClick={handleResetDefault}
            className="text-xs text-[#808495] hover:text-white flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Reset default
          </button>
        </div>

        <textarea
          rows={2}
          value={inputText}
          onChange={(e) => handleInputChange(e.target.value)}
          className="w-full bg-[#1e212b] border border-[#3b3d4a] rounded p-2.5 text-xs md:text-sm font-mono text-slate-100 focus:outline-none focus:border-[#ff4b4b] transition-colors"
          placeholder="83, 117, 94, 108..."
        />
      </div>

      {/* Result Stat Box */}
      <div className="pt-1">
        <div className="text-xs text-[#a3a8b8] font-medium">
          Predicted Count (several minutes ahead)
        </div>
        <div className="text-4xl md:text-5xl font-bold text-white mt-1 font-mono tabular-nums">
          {state.predictedCount}
        </div>
      </div>

      {/* Matplotlib Matched Canvas Chart */}
      <div className="bg-[#131720] border border-[#262730] rounded-lg p-3 md:p-6 shadow-xl flex flex-col items-center">
        <div className="w-full overflow-x-auto">
          <canvas
            ref={canvasRef}
            className="w-full max-w-[850px] mx-auto rounded border border-slate-700 block bg-white"
          />
        </div>
      </div>

      {/* Algorithm description from PDF */}
      <div className="p-4 bg-[#1e212b] border border-[#3b3d4a] rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[#ff4b4b] shrink-0 mt-0.5" />
        <div className="text-xs text-[#a3a8b8] leading-relaxed">
          <span className="font-semibold text-slate-200">Temporal Congestion Forecasting: </span>
          The temporal prediction model evaluates sequential density counts over time windows to forecast impending crowd congestion 5–10 minutes ahead. This enables authorities to enact early perimeter routing, gate adjustments, and preventive crowd containment before stampede risk escalates.
        </div>
      </div>
    </div>
  );
};
