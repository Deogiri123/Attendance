import React, { useEffect } from 'react';
import * as echarts from 'echarts';
import { useAppContext } from '../../context/AppContext';

const AttendanceChart: React.FC = () => {
  const { stats } = useAppContext();
  
  useEffect(() => {
    const chartDom = document.getElementById('attendance-chart');
    if (chartDom) {
      const myChart = echarts.init(chartDom);
      const option = {
        animation: false,
        tooltip: {
          trigger: 'item'
        },
        legend: {
          top: '5%',
          left: 'center'
        },
        series: [
          {
            name: 'Attendance',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: stats.attendanceRate, name: 'Present', itemStyle: { color: '#1a73e8' } },
              { value: 100 - stats.attendanceRate, name: 'Absent', itemStyle: { color: '#f44336' } }
            ]
          }
        ]
      };
      myChart.setOption(option);
      
      // Handle window resize
      window.addEventListener('resize', () => {
        myChart.resize();
      });
      
      return () => {
        window.removeEventListener('resize', () => {
          myChart.resize();
        });
        myChart.dispose();
      };
    }
  }, [stats.attendanceRate]);

  return (
    <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
      <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-6">Attendance Overview</h2>
      <div id="attendance-chart" className="h-64"></div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-500">Present Rate</p>
          <p className="text-xl font-semibold text-blue-600">{stats.attendanceRate}%</p>
          <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-500">Absent Rate</p>
          <p className="text-xl font-semibold text-red-600">{(100 - stats.attendanceRate).toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
        </div>
      </div>
    </div>
  );
};

export default AttendanceChart;