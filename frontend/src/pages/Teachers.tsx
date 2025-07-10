import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Teacher, Subject } from '../types';
import { toast } from 'react-toastify';
import axios from 'axios';
import { PlusCircle, Trash2, Edit, Save, X } from 'lucide-react';

const Teachers: React.FC = () => {
  const { backendUrl, token } = useAppContext();
  
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  // Fetch all teachers
  const fetchTeachers = async () => {
    setLoading(true);
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${backendUrl}/api/teacher/list`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setTeachers(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch teachers');
      }
    } catch (err: any) {
      console.error('Error fetching teachers:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch teachers';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // If token is invalid, redirect to login
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch all subjects
  const fetchSubjects = async () => {
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }

      const years = ['2', '3', '4'];
      const allSubjects: Subject[] = [];
      
      for (const year of years) {
        const response = await axios.get(`${backendUrl}/api/subject/year/${year}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data) {
          allSubjects.push(...response.data);
        }
      }
      
      setSubjects(allSubjects);
    } catch (err: any) {
      console.error('Error fetching subjects:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch subjects';
      toast.error(errorMessage);
      
      // If token is invalid, redirect to login
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
  };
  
  // Add new teacher
  const addTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        `${backendUrl}/api/teacher/add`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        toast.success('Teacher added successfully');
        setFormData({ name: '', email: '', phone: '' });
        setShowAddForm(false);
        fetchTeachers();
      } else {
        toast.error(response.data.message || 'Failed to add teacher');
      }
    } catch (err: any) {
      console.error('Error adding teacher:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add teacher';
      toast.error(errorMessage);
      
      // If token is invalid, redirect to login
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Update teacher
  const updateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTeacherId) return;
    
    setLoading(true);
    
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put(
        `${backendUrl}/api/teacher/update/${editingTeacherId}`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        toast.success('Teacher updated successfully');
        setFormData({ name: '', email: '', phone: '' });
        setEditingTeacherId(null);
        fetchTeachers();
      } else {
        toast.error(response.data.message || 'Failed to update teacher');
      }
    } catch (err: any) {
      console.error('Error updating teacher:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update teacher';
      toast.error(errorMessage);
      
      // If token is invalid, redirect to login
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Delete teacher
  const deleteTeacher = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    
    setLoading(true);
    
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.delete(
        `${backendUrl}/api/teacher/delete/${id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        toast.success('Teacher deleted successfully');
        fetchTeachers();
      } else {
        toast.error(response.data.message || 'Failed to delete teacher');
      }
    } catch (err: any) {
      console.error('Error deleting teacher:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete teacher';
      toast.error(errorMessage);
      
      // If token is invalid, redirect to login
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Add subject to teacher
  const addSubjectToTeacher = async (teacherId: string, subjectId: string) => {
    setLoading(true);
    
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        `${backendUrl}/api/teacher/${teacherId}/add-subject/${subjectId}`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        toast.success('Subject added to teacher successfully');
        fetchTeachers();
      } else {
        toast.error(response.data.message || 'Failed to add subject to teacher');
      }
    } catch (err: any) {
      console.error('Error adding subject to teacher:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add subject to teacher';
      toast.error(errorMessage);
      
      // If token is invalid, redirect to login
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Remove subject from teacher
  const removeSubjectFromTeacher = async (teacherId: string, subjectId: string) => {
    setLoading(true);
    
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.delete(
        `${backendUrl}/api/teacher/${teacherId}/remove-subject/${subjectId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        toast.success('Subject removed from teacher successfully');
        fetchTeachers();
      } else {
        toast.error(response.data.message || 'Failed to remove subject from teacher');
      }
    } catch (err: any) {
      console.error('Error removing subject from teacher:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to remove subject from teacher';
      toast.error(errorMessage);
      
      // If token is invalid, redirect to login
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Start editing a teacher
  const startEditing = (teacher: Teacher) => {
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone
    });
    setEditingTeacherId(teacher._id);
    setShowAddForm(false);
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setFormData({ name: '', email: '', phone: '' });
    setEditingTeacherId(null);
  };
  
  // Load data on component mount
  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
  }, []);
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 sm:mb-10">
        <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-blue-100">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">👨‍🏫 Teachers Management</h1>
            <p className="text-gray-500 text-sm mt-1">Manage teachers and their assigned subjects</p>
          </div>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingTeacherId(null);
              setFormData({ name: '', email: '', phone: '' });
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors"
          >
            {showAddForm ? (
              <>
                <X size={16} className="mr-1" /> Cancel
              </>
            ) : (
              <>
                <PlusCircle size={16} className="mr-1" /> Add Teacher
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Add/Edit Form */}
      {(showAddForm || editingTeacherId) && (
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {editingTeacherId ? 'Edit Teacher' : 'Add New Teacher'}
            </h2>
            <form onSubmit={editingTeacherId ? updateTeacher : addTeacher}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter teacher name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                {editingTeacherId && (
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors"
                  >
                    <X size={16} className="mr-1" /> Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors"
                >
                  <Save size={16} className="mr-1" /> {editingTeacherId ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Teachers List */}
      <div className="max-w-7xl mx-auto">
        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        
        {teachers.length === 0 && !loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-8 text-center">
            <p className="text-gray-500">No teachers found. Add a new teacher to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {teachers.map((teacher) => (
              <div key={teacher._id} className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{teacher.name}</h3>
                    <div className="mt-1 space-y-1">
                      <p className="text-gray-600 text-sm flex items-center">
                        <span className="mr-2">📧</span> {teacher.email}
                      </p>
                      <p className="text-gray-600 text-sm flex items-center">
                        <span className="mr-2">📱</span> {teacher.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4 md:mt-0">
                    <button
                      onClick={() => startEditing(teacher)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-md flex items-center text-xs font-medium transition-colors"
                    >
                      <Edit size={14} className="mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => deleteTeacher(teacher._id)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-md flex items-center text-xs font-medium transition-colors"
                    >
                      <Trash2 size={14} className="mr-1" /> Delete
                    </button>
                  </div>
                </div>
                
                {/* Subjects Section */}
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3">Assigned Subjects</h4>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {teacher.subjects && teacher.subjects.length > 0 ? (
                      teacher.subjects.map((subject) => (
                        <div 
                          key={subject._id} 
                          className="bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-1.5 flex items-center"
                        >
                          <span className="text-indigo-700 text-sm mr-2">{subject.name} (Year {subject.year})</span>
                          <button
                            onClick={() => removeSubjectFromTeacher(teacher._id, subject._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No subjects assigned yet.</p>
                    )}
                  </div>
                  
                  {/* Add Subject Dropdown */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Add Subject</label>
                    <div className="flex space-x-2">
                      <select
                        id={`add-subject-${teacher._id}`}
                        className="w-full bg-white text-sm border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        defaultValue=""
                      >
                        <option value="" disabled>Select a subject</option>
                        {subjects
                          .filter(subject => !teacher.subjects?.some(s => s._id === subject._id))
                          .map(subject => (
                            <option key={subject._id} value={subject._id}>
                              {subject.name} (Year {subject.year})
                            </option>
                          ))
                        }
                      </select>
                      <button
                        onClick={() => {
                          const select = document.getElementById(`add-subject-${teacher._id}`) as HTMLSelectElement;
                          if (select && select.value) {
                            addSubjectToTeacher(teacher._id, select.value);
                            select.value = "";
                          }
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors"
                      >
                        <PlusCircle size={16} className="mr-1" /> Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Teachers;
