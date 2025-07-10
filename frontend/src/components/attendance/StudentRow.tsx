import React from 'react';
import { Student } from '../../types';
import { useAppContext } from '../../context/AppContext';

interface StudentRowProps {
  student: Student;
}

const StudentRow: React.FC<StudentRowProps> = ({ student }) => {
  // Use the direct toggleStudentAttendance function for the dashboard
  const { toggleStudentAttendance } = useAppContext();

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="text-sm font-medium text-gray-900">{student.name}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{student.rollNo}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{student.phone}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{student.parentsPhone}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <label className="inline-flex relative items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={student.present}
              onChange={() => toggleStudentAttendance(student.id)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-700">
              {student.present ? 'Present' : 'Absent'}
            </span>
          </label>
        </div>
      </td>
    </tr>
  );
};

export default StudentRow;