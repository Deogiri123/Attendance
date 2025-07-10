import subjectModel from '../models/subjectModel.js';
import teacherModel from '../models/teacherModel.js';

// Add Subject
const addSubject = async (req, res) => {
  try {
    const { name, year, description, credits } = req.body;

    const newSubject = new subjectModel({ 
      name, 
      year,
      description: description || '',
      credits: credits || '3'
    });
    await newSubject.save();

    res.status(201).json({ message: 'Subject added successfully', subject: newSubject });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add subject', details: error.message });
  }
};

// Get Subjects by Year
const getSubjectsByYear = async (req, res) => {
  try {
    const { year } = req.params;
    const subjects = await subjectModel.find({ year });

    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
};

// Delete Subject
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if subject exists
    const subject = await subjectModel.findById(id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    
    // Remove subject from all teachers who have it
    await teacherModel.updateMany(
      { subjects: id },
      { $pull: { subjects: id } }
    );
    
    // Delete the subject
    await subjectModel.findByIdAndDelete(id);
    
    res.status(200).json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete subject', error: error.message });
  }
};

export {
  addSubject,
  getSubjectsByYear,
  deleteSubject
}
