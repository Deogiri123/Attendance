import studentModel from "../models/studentModel.js";



 const addStudent = async (req, res) => {
    try {
      const { name, rollNo, phone, parentsPhone, year, attendance } = req.body;
  
      // Check if student with same roll number already exists
      const existingStudent = await studentModel.findOne({ rollNo });
      if (existingStudent) {
        return res.status(400).json({ message: "Student with this roll number already exists." });
      }
      if (!name || !rollNo || !phone || !parentsPhone || !year) {
        return res.status(400).json({ message: "All fields are required." });
      }
  
      const newStudent = new studentModel({
        name,
        rollNo,
        phone,
        parentsPhone,
        year,
        attendance: attendance !== false, // Default to true unless explicitly set to false
      });
  
      await newStudent.save();
  
      res.status(201).json({ message: "Student added successfully!", student: newStudent });
    } catch (error) {
      console.error("Error adding student:", error);
      res.status(500).json({ message: "Server error. Could not add student." });
    }
  };

//list student database
const listStudent = async (req, res) => {
  try {
    const students = await studentModel.find(); // You can add filters or projections if needed
    res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error('Error fetching students:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

//update student database
const updateStudent = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const student = await studentModel.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  } catch (error) {
    console.error('Error updating student:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

//delete student database
const deleteStudent = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await studentModel.findByIdAndDelete(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
      data: student,
    });
  } catch (error) {
    console.error("Error deleting student:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export { 
    addStudent, 
    listStudent, 
    updateStudent, 
    deleteStudent 
};