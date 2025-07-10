import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Subject, Teacher } from '../types';
import { toast } from 'react-toastify';
import axios from 'axios';
import { PlusCircle, Trash2, Save, X, BookOpen, User } from 'lucide-react';

const Subjects: React.FC = () => {
  const { backendUrl, token, fetchTeachers } = useAppContext();
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    year: '2',
    description: '',
    credits: '3',
    teacherId: ''
  });
  
  // Fetch all subjects
  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const years = ['2', '3', '4'];
      const allSubjects: Subject[] = [];
      
      for (const year of years) {
        const response = await axios.get(`${backendUrl}/api/subject/year/${year}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.data) {
          allSubjects.push(...response.data);
        }
      }
      
      setSubjects(allSubjects);
    } catch (err: any) {
      console.error('Error fetching subjects:', err);
      setError(err.response?.data?.message || 'Failed to fetch subjects');
      toast.error(err.response?.data?.message || 'Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };
  
  // Load teachers
  const loadTeachers = async () => {
    try {
      const teachersList = await fetchTeachers();
      setTeachers(teachersList);
    } catch (err) {
      console.error('Error loading teachers:', err);
    }
  };
  
  // Add new subject
  const addSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const subjectData = {
        name: formData.name,
        year: formData.year,
        description: formData.description,
        credits: formData.credits
      };
      
      const response = await axios.post(
        `${backendUrl}/api/subject/add`,
        subjectData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.subject) {
        // If a teacher is selected, assign the subject to the teacher
        if (formData.teacherId) {
          try {
            await axios.post(
              `${backendUrl}/api/teacher/${formData.teacherId}/add-subject/${response.data.subject._id}`,
              {},
              {
                headers: { 'Authorization': `Bearer ${token}` }
              }
            );
          } catch (err) {
            console.error('Error assigning subject to teacher:', err);
            toast.warning('Subject created but could not be assigned to teacher');
          }
        }
        
        toast.success('Subject added successfully');
        setFormData({ name: '', year: '2', description: '', credits: '3', teacherId: '' });
        setShowAddForm(false);
        fetchSubjects();
        loadTeachers(); // Refresh teachers list to show updated subject assignments
      } else {
        toast.error(response.data.message || 'Failed to add subject');
      }
    } catch (err: any) {
      console.error('Error adding subject:', err);
      toast.error(err.response?.data?.message || 'Failed to add subject');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete subject
  const deleteSubject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subject? This will also remove it from any teachers who teach it.')) return;
    
    setLoading(true);
    
    try {
      // Note: You'll need to implement this endpoint in your backend
      const response = await axios.delete(
        `${backendUrl}/api/subject/${id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        toast.success('Subject deleted successfully');
        fetchSubjects();
        loadTeachers(); // Refresh teachers list to show updated subject assignments
      } else {
        toast.error(response.data.message || 'Failed to delete subject');
      }
    } catch (err: any) {
      console.error('Error deleting subject:', err);
      toast.error(err.response?.data?.message || 'Failed to delete subject');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Get teachers who teach a specific subject
  const getTeachersForSubject = (subjectId: string) => {
    return teachers.filter(teacher => 
      teacher.subjects && teacher.subjects.some(subject => subject._id === subjectId)
    );
  };
  
  // Load data on component mount
  useEffect(() => {
    fetchSubjects();
    loadTeachers();
  }, []);
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 sm:mb-10">
        <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-blue-100">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">📚 Subjects Management</h1>
            <p className="text-gray-500 text-sm mt-1">Manage subjects and assign them to teachers</p>
          </div>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setFormData({ name: '', year: '2', description: '', credits: '3', teacherId: '' });
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors"
          >
            {showAddForm ? (
              <>
                <X size={16} className="mr-1" /> Cancel
              </>
            ) : (
              <>
                <PlusCircle size={16} className="mr-1" /> Add Subject
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Add Form */}
      {showAddForm && (
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <BookOpen size={18} className="mr-2 text-indigo-600" />
              Add New Subject
            </h2>
            <form onSubmit={addSubject} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name*</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. Data Structures and Algorithms"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year*</label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                    <select
                      name="credits"
                      value={formData.credits}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="1">1 Credit</option>
                      <option value="2">2 Credits</option>
                      <option value="3">3 Credits</option>
                      <option value="4">4 Credits</option>
                      <option value="5">5 Credits</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Brief description of the subject"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Teacher</label>
                    <select
                      name="teacherId"
                      value={formData.teacherId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Select a teacher (optional) --</option>
                      {teachers.map(teacher => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.name} ({teacher.email})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      You can also assign teachers later from the Teachers page
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors"
                >
                  <X size={16} className="mr-1" /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors"
                >
                  <Save size={16} className="mr-1" /> Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Subjects List */}
      <div className="max-w-7xl mx-auto">
        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        
        {subjects.length === 0 && !loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-8 text-center">
            <p className="text-gray-500">No subjects found. Add a new subject to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => {
              const teachersForSubject = getTeachersForSubject(subject._id);
              
              return (
                <div key={subject._id} className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">{subject.name}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                            Year {subject.year}
                          </span>
                          {subject.credits && (
                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              {subject.credits} {parseInt(subject.credits) === 1 ? 'Credit' : 'Credits'}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteSubject(subject._id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    {/* Description */}
                    {subject.description && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600">{subject.description}</p>
                      </div>
                    )}
                    
                    {/* Teachers Section */}
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <User size={14} className="mr-1" /> Taught by:
                      </h4>
                      
                      {teachersForSubject.length > 0 ? (
                        <div className="space-y-2">
                          {teachersForSubject.map(teacher => (
                            <div key={teacher._id} className="flex items-center text-sm text-gray-600">
                              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                              {teacher.name}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No teachers assigned yet</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default Subjects;
