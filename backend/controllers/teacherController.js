import teacherModel from '../models/teacherModel.js';
import subjectModel from '../models/subjectModel.js';

// Get all teachers
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await teacherModel.find().populate('subjects');
    res.status(200).json({ success: true, data: teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch teachers', error: error.message });
  }
};

// Get teacher by ID
export const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await teacherModel.findById(id).populate('subjects');
    
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    
    res.status(200).json({ success: true, data: teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch teacher', error: error.message });
  }
};

// Add new teacher
export const addTeacher = async (req, res) => {
  try {
    const { name, email, phone, subjects } = req.body;
    
    // Check if teacher with email already exists
    const existingTeacher = await teacherModel.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ success: false, message: 'Teacher with this email already exists' });
    }
    
    const newTeacher = new teacherModel({
      name,
      email,
      phone,
      subjects: subjects || []
    });
    
    await newTeacher.save();
    
    res.status(201).json({ success: true, message: 'Teacher added successfully', data: newTeacher });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add teacher', error: error.message });
  }
};

// Update teacher
export const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, subjects } = req.body;
    
    // Check if teacher exists
    const teacher = await teacherModel.findById(id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    
    // Check if email is being changed and if it's already in use
    if (email !== teacher.email) {
      const existingTeacher = await teacherModel.findOne({ email });
      if (existingTeacher) {
        return res.status(400).json({ success: false, message: 'Email is already in use by another teacher' });
      }
    }
    
    const updatedTeacher = await teacherModel.findByIdAndUpdate(
      id,
      { name, email, phone, subjects },
      { new: true, runValidators: true }
    ).populate('subjects');
    
    res.status(200).json({ success: true, message: 'Teacher updated successfully', data: updatedTeacher });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update teacher', error: error.message });
  }
};

// Delete teacher
export const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if teacher exists
    const teacher = await teacherModel.findById(id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    
    await teacherModel.findByIdAndDelete(id);
    
    res.status(200).json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete teacher', error: error.message });
  }
};

// Add subject to teacher
export const addSubjectToTeacher = async (req, res) => {
  try {
    const { teacherId, subjectId } = req.params;
    
    // Check if teacher exists
    const teacher = await teacherModel.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    
    // Check if subject exists
    const subject = await subjectModel.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    
    // Check if subject is already assigned to teacher
    if (teacher.subjects.includes(subjectId)) {
      return res.status(400).json({ success: false, message: 'Subject is already assigned to this teacher' });
    }
    
    // Add subject to teacher
    teacher.subjects.push(subjectId);
    await teacher.save();
    
    const updatedTeacher = await teacherModel.findById(teacherId).populate('subjects');
    
    res.status(200).json({ success: true, message: 'Subject added to teacher successfully', data: updatedTeacher });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add subject to teacher', error: error.message });
  }
};

// Remove subject from teacher
export const removeSubjectFromTeacher = async (req, res) => {
  try {
    const { teacherId, subjectId } = req.params;
    
    // Check if teacher exists
    const teacher = await teacherModel.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    
    // Check if subject is assigned to teacher
    if (!teacher.subjects.includes(subjectId)) {
      return res.status(400).json({ success: false, message: 'Subject is not assigned to this teacher' });
    }
    
    // Remove subject from teacher
    teacher.subjects = teacher.subjects.filter(subject => subject.toString() !== subjectId);
    await teacher.save();
    
    const updatedTeacher = await teacherModel.findById(teacherId).populate('subjects');
    
    res.status(200).json({ success: true, message: 'Subject removed from teacher successfully', data: updatedTeacher });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove subject from teacher', error: error.message });
  }
};
