import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js';

interface AreaChartProps {
  data: number[];
}

const AreaChart: React.FC<AreaChartProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Prevent unnecessary re-rendering by checking if data has changed
    if (chartInstance.current) {
      const currentData = chartInstance.current.data.datasets?.[0]?.data;
      if (currentData && JSON.stringify(currentData) === JSON.stringify(data)) {
        return; // No changes, skip reloading
      }
      chartInstance.current.destroy();
    }

    // Create the chart instance
    chartInstance.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: data.map((_, index) => `Building ${index + 1}`),
        datasets: [
          {
            label: 'Area (m²)',
            data,
            backgroundColor: '#ff9800',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
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
  }, [JSON.stringify(data)]); // ✅ Ensures effect runs only when data changes

  return <canvas ref={canvasRef} />;
};

export default AreaChart;
