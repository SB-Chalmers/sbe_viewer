import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js';

interface HeightChartProps {
  data: number[];
}

const HeightChart: React.FC<HeightChartProps> = ({ data }) => {
  const chartInstance = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Check if data has changed, if not, don't reload chart
    if (chartInstance.current) {
      const currentData = chartInstance.current.data.datasets?.[0]?.data;
      if (currentData && JSON.stringify(currentData) === JSON.stringify(data)) {
        return; // No changes, skip reloading
      }
      chartInstance.current.destroy();
    }

    // Create new chart
    chartInstance.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: data.map((_, index) => `Building ${index + 1}`),
        datasets: [
          {
            label: 'Height (m)',
            data,
            backgroundColor: '#2196f3',
          },
        ],
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [JSON.stringify(data)]); // ✅ Fix: Only re-run effect when data actually changes

  return <canvas ref={canvasRef}></canvas>;
};

export default HeightChart;
