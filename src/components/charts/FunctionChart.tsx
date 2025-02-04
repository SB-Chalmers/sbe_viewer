import React, { useEffect, useRef, useMemo } from 'react';
import Chart from 'chart.js';

interface FunctionChartProps {
  data: { [key: string]: number };
}

const FunctionChart: React.FC<FunctionChartProps> = ({ data }) => {
  const chartInstance = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const memoizedData = useMemo(() => data, [JSON.stringify(data)]);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: Object.keys(memoizedData),
        datasets: [
          {
            label: 'Function Distribution',
            data: Object.values(memoizedData),
            backgroundColor: ['#4caf50', '#ff9800', '#2196f3', '#f44336', '#9c27b0'],
          },
        ],
      },
      options: {
        scales: {
          xAxes: [{ stacked: true }], // ✅ Correct for Chart.js 2.x
          yAxes: [{ stacked: true }]
        }
      }
      
    });

    return () => {
      chartInstance.current?.destroy();
    };
  }, [memoizedData]);

  return <canvas ref={canvasRef}></canvas>;
};

export default React.memo(FunctionChart);
