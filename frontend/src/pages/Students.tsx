import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Student } from '../types';
import { PlusCircle, Trash2, Edit, Save, RefreshCw, UserPlus, Filter, Users, Search } from 'lucide-react';

const Students: React.FC = () => {
  const { students, addStudent, updateStudent, deleteStudent, loading, error, fetchStudents, searchQuery, setSearchQuery } = useAppContext();
  // Initialize selectedYear from localStorage or default to '2'
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    const savedYear = localStorage.getItem('selectedYear');
    return savedYear || '2';
  });
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState<Partial<Student>>({
    name: '',
    rollNo: '',
    phone: '',
    parentsPhone: '',
    year: '2'
  });

  const years = ['2', '3', '4'];
  
  // Add a button to show all students regardless of year
  const showAllStudents = () => {
    console.log('Showing all students');
    setSelectedYear('all');
    localStorage.setItem('selectedYear', 'all');
  };
  
  // Update localStorage when selectedYear changes
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    localStorage.setItem('selectedYear', year);
  };

  // Log the current students data for debugging
  useEffect(() => {
    console.log('Students in component:', students);
    console.log('Selected year:', selectedYear);
  }, [students, selectedYear]);

  // Filter students by year and search query
  const filteredStudents = students
    // First filter by year
    .filter(student => selectedYear === 'all' || student.year === selectedYear)
    // Then filter by search query if it exists
    .filter(student => {
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase().trim();
      return (
        student.name.toLowerCase().includes(query) ||
        student.rollNo.toLowerCase().includes(query) ||
        student.phone.toLowerCase().includes(query) ||
        student.parentsPhone.toLowerCase().includes(query)
      );
    });
  
  // Log filtered students for debugging
  useEffect(() => {
    console.log('Filtered students:', filteredStudents);
  }, [filteredStudents, searchQuery]);

  const handleAddStudent = () => {
    if (newStudent.name && newStudent.rollNo && newStudent.phone && newStudent.parentsPhone) {
      console.log('Adding new student with data:', {
        ...newStudent,
        year: selectedYear
      });
      
      addStudent({
        ...newStudent,
        id: 0, // This will be replaced by the backend ID
        present: true, // Default to present
        year: selectedYear,
        image: '',
        lectureAttendance: []
      } as Student);
      
      setNewStudent({ name: '', rollNo: '', phone: '', parentsPhone: '', year: selectedYear });
      
      // Force a refresh of students after adding
      setTimeout(() => {
        console.log('Triggering refresh after add');
        fetchStudents();
      }, 1000);
    }
  };
  
  // Note: Auto-refresh functionality removed as requested

  const handleUpdateStudent = (student: Student) => {
    if (editingStudent) {
      console.log('Updating student:', student);
      updateStudent(student);
      setEditingStudent(null);
      
      // Force a refresh of students after updating
      setTimeout(() => {
        console.log('Triggering refresh after update');
        fetchStudents();
      }, 1000);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 sm:mb-10">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100">
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">👨‍🎓 Students Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage students by academic year</p>
        </div>
      </div>
      
      {error && (
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm">
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Add New Student Form */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <UserPlus className="h-5 w-5 mr-2 text-indigo-500" />
            Add New Student
          </h2>
          {loading && 
            <div className="flex items-center text-gray-500 mb-4 bg-gray-50 p-2 rounded-lg">
              <RefreshCw className="w-4 h-4 mr-2 animate-spin text-indigo-500" />
              <p className="text-sm">Processing...</p>
            </div>
          }
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Student Name"
              value={newStudent.name}
              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
            <input
              type="text"
              placeholder="Roll Number"
              value={newStudent.rollNo}
              onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={newStudent.phone}
              onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
            <input
              type="tel"
              placeholder="Parents Phone"
              value={newStudent.parentsPhone}
              onChange={(e) => setNewStudent({ ...newStudent, parentsPhone: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
            <button
              onClick={handleAddStudent}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg px-4 py-2 flex items-center justify-center hover:shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Add Student
            </button>
          </div>
        </div>
      </div>

      {/* Year Selection and Search */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Filter className="h-5 w-5 mr-2 text-indigo-500" />
            Filters
          </h2>
          
          {/* Search Bar */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Students</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, roll number, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
          </div>
          
          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Year</label>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {years.map(year => (
                <button
                  key={year}
                  onClick={() => handleYearChange(year)}
                  className={`px-4 py-2 rounded-lg transition-all font-medium text-sm ${
                    selectedYear === year && selectedYear !== 'all'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Year {year}
                </button>
              ))}
              <button
                onClick={showAllStudents}
                className={`px-4 py-2 rounded-lg transition-all font-medium text-sm ${
                  selectedYear === 'all'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Years
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Users className="h-5 w-5 mr-2 text-indigo-500" />
              {selectedYear === 'all' ? 'All Students' : `Year ${selectedYear} Students`}
            </h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{filteredStudents.length} Students</span>
          </div>
          
          {loading && (
            <div className="flex justify-center items-center p-8">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="ml-2 text-gray-600">Loading students...</p>
            </div>
          )}
          {!loading && students.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-500">No students found. Add your first student above.</p>
            </div>
          )}
          {!loading && students.length > 0 && (
          <div className="overflow-hidden overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                    Student
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                    Roll No
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                    Phone
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                    Parents Phone
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      {editingStudent?.id === student.id ? (
                        <input
                          type="text"
                          value={editingStudent.name}
                          onChange={(e) =>
                            setEditingStudent({ ...editingStudent, name: e.target.value })
                          }
                          className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition w-full min-w-full"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900 break-words">
                          {student.name}
                        </div>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      {editingStudent?.id === student.id ? (
                        <input
                          type="text"
                          value={editingStudent.rollNo}
                          onChange={(e) =>
                            setEditingStudent({ ...editingStudent, rollNo: e.target.value })
                          }
                          className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition w-full min-w-full"
                        />
                      ) : (
                        <div className="text-sm text-gray-500 break-words">{student.rollNo}</div>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      {editingStudent?.id === student.id ? (
                        <input
                          type="tel"
                          value={editingStudent.phone}
                          onChange={(e) =>
                            setEditingStudent({ ...editingStudent, phone: e.target.value })
                          }
                          className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition w-full min-w-full"
                        />
                      ) : (
                        <div className="text-xs sm:text-sm text-gray-500 break-words">{student.phone}</div>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      {editingStudent?.id === student.id ? (
                        <input
                          type="tel"
                          value={editingStudent.parentsPhone}
                          onChange={(e) =>
                            setEditingStudent({ ...editingStudent, parentsPhone: e.target.value })
                          }
                          className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition w-full min-w-full"
                        />
                      ) : (
                        <div className="text-xs sm:text-sm text-gray-500 break-words">{student.parentsPhone}</div>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium">
                      <div className="flex space-x-3">
                        {editingStudent?.id === student.id ? (
                          <button
                            onClick={() => handleUpdateStudent(editingStudent)}
                            className="bg-green-100 text-green-600 hover:bg-green-200 p-2 rounded-lg transition-colors"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditingStudent(student)}
                            className="bg-blue-100 text-blue-600 hover:bg-blue-200 p-2 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            console.log('Deleting student with ID:', student.id);
                            deleteStudent(student.id);
                            // Force a refresh of students after deleting
                            setTimeout(() => {
                              console.log('Triggering refresh after delete');
                              fetchStudents();
                            }, 1000);
                          }}
                          className="bg-red-100 text-red-600 hover:bg-red-200 p-2 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Students;