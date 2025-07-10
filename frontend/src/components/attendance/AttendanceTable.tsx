import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import StudentRow from './StudentRow';
import Pagination from '../common/Pagination';
import ActionButtons from './ActionButtons';
import ClassFilter from './ClassFilter';

const AttendanceTable: React.FC = () => {
  const { students, selectedClass } = useAppContext();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter students by selected year/class
  const filteredStudents = React.useMemo(() => {
    if (!selectedClass || selectedClass === 'All Years') {
      return students;
    } else {
      // Extract the year number from the selected class (e.g., "Year 2" -> "2")
      // Safely handle the split operation
      const parts = selectedClass.split(' ');
      const yearFilter = parts.length > 1 ? parts[1] : '';
      return students.filter(student => student.year === yearFilter);
    }
  }, [students, selectedClass]);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedClass]);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-8 mb-12 border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 sm:mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 md:mb-0">Today's Attendance</h2>
        <ClassFilter />
      </div>
      
      {/* Quick Actions */}
      <ActionButtons />
      
      {/* Student List */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roll No
              </th>
              <th scope="col" className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th scope="col" className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parents Phone
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attendance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentStudents.map((student) => (
              <StudentRow key={student.id} student={student} />
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <Pagination 
        currentPage={currentPage}
        totalItems={students.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default AttendanceTable;