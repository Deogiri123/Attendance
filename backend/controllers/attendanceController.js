import mongoose from "mongoose";
import attendanceModel from "../models/attendanceModel.js";
import studentModel from "../models/studentModel.js";
import subjectModel from "../models/subjectModel.js";

/**
 * Record attendance for a student for a specific subject on a specific date
 */
const recordAttendance = async (req, res) => {
  try {
    console.log("\n\n=== RECORD ATTENDANCE REQUEST ===\n");
    console.log("Request body:", req.body);
    
    const { studentId, subjectId, date, year, status, remarks } = req.body;

    console.log("Parsed attendance request data:", { 
      studentId, 
      subjectId, 
      date, 
      year, 
      status: status !== undefined ? status : 'undefined', 
      remarks: remarks || 'none'
    });
    console.log("Data types:", {
      studentIdType: typeof studentId,
      subjectIdType: typeof subjectId,
      dateType: typeof date,
      yearType: typeof year,
      statusType: typeof status
    });

    // Validate required fields
    if (!studentId || !subjectId || !year) {
      return res.status(400).json({ 
        success: false,
        message: "Student ID, Subject ID, and Year are required fields." 
      });
    }

    // Validate and convert IDs to proper MongoDB ObjectIds
    let studentObjId, subjectObjId;
    
    try {
      // Convert to string first to handle any type safely
      const studentIdStr = String(studentId).trim();
      const subjectIdStr = String(subjectId).trim();
      
      console.log(`Validating IDs: studentId=${studentIdStr}, subjectId=${subjectIdStr}`);
      
      if (!mongoose.Types.ObjectId.isValid(studentIdStr)) {
        return res.status(400).json({
          success: false,
          message: "Invalid student ID format."
        });
      }

      if (!mongoose.Types.ObjectId.isValid(subjectIdStr)) {
        return res.status(400).json({
          success: false,
          message: "Invalid subject ID format."
        });
      }
      
      // Convert string IDs to MongoDB ObjectIds
      studentObjId = new mongoose.Types.ObjectId(studentIdStr);
      subjectObjId = new mongoose.Types.ObjectId(subjectIdStr);
      
      console.log(`Converted to ObjectIds: studentObjId=${studentObjId}, subjectObjId=${subjectObjId}`);
    } catch (validationError) {
      console.error("ID validation error:", validationError);
      return res.status(400).json({
        success: false,
        message: "Error validating or converting IDs.",
        error: validationError.message
      });
    }

    // Validate status is a boolean if provided
    if (status !== undefined && typeof status !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: "Status must be a boolean value (true or false)."
      });
    }

    // Check if student exists using our validated ObjectId
    const student = await studentModel.findById(studentObjId);
    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: "Student not found." 
      });
    }
    console.log(`Found student: ${student.name} (ID: ${student._id})`);

    // Check if subject exists using our validated ObjectId
    const subject = await subjectModel.findById(subjectObjId);
    if (!subject) {
      return res.status(404).json({ 
        success: false,
        message: "Subject not found." 
      });
    }
    console.log(`Found subject: ${subject.name} (ID: ${subject._id})`);
    

    // Format the date or use current date
    let attendanceDate;
    try {
      attendanceDate = date ? new Date(date) : new Date();
      if (isNaN(attendanceDate.getTime())) {
        throw new Error("Invalid date format");
      }
    } catch (dateError) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format provided."
      });
    }

    // Create date range for the day (start of day to end of day)
    const startOfDay = new Date(attendanceDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(attendanceDate);
    endOfDay.setHours(23, 59, 59, 999);

    console.log(`Looking for existing record with studentObjId: ${studentObjId}, subjectObjId: ${subjectObjId}, date: ${startOfDay} to ${endOfDay}`);
    
    // Check if attendance record already exists for this student, subject, and date
    try {
      // Use our already validated ObjectIds for the query
      const existingRecord = await attendanceModel.findOne({
        student: studentObjId,
        subject: subjectObjId,
        date: {
          $gte: startOfDay,
          $lt: endOfDay
        }
      });
      
      console.log(`Existing record found: ${existingRecord ? 'Yes' : 'No'}`);
      if (existingRecord) {
        console.log(`Existing record ID: ${existingRecord._id}`);
      }

      if (existingRecord) {
        // Update existing record
        existingRecord.status = status !== undefined ? status : existingRecord.status;
        existingRecord.remarks = remarks || existingRecord.remarks;
        
        try {
          await existingRecord.save();
          
          // Return populated record
          const populatedRecord = await attendanceModel.findById(existingRecord._id)
            .populate('student')
            .populate('subject');
          
          return res.status(200).json({
            success: true,
            message: "Attendance record updated successfully",
            data: populatedRecord
          });
        } catch (saveError) {
          console.error("Error saving existing record:", saveError);
          return res.status(400).json({
            success: false,
            message: "Could not update existing attendance record.",
            error: saveError.message
          });
        }
      }

      // Create new attendance record using our validated ObjectIds
      console.log(`Creating new attendance record with studentObjId: ${studentObjId}, subjectObjId: ${subjectObjId}`);
      
      const newAttendance = new attendanceModel({
        student: studentObjId,
        subject: subjectObjId,
        date: attendanceDate,
        year,
        status: status !== undefined ? Boolean(status) : false,
        remarks: remarks || ""
      });
      
      console.log(`New attendance record created with ID: ${newAttendance._id}`);
      console.log(`New attendance record data:`, {
        student: newAttendance.student,
        subject: newAttendance.subject,
        date: newAttendance.date,
        year: newAttendance.year,
        status: newAttendance.status
      });

      try {
        console.log('Attempting to save new attendance record...');
        const savedRecord = await newAttendance.save();
        console.log('Successfully saved new attendance record with ID:', savedRecord._id);
        
        // Return populated record
        try {
          console.log('Populating saved record with student and subject data...');
          const populatedRecord = await attendanceModel.findById(savedRecord._id)
            .populate('student')
            .populate('subject');
          
          console.log('Successfully populated record:', populatedRecord);
          
          return res.status(201).json({
            success: true,
            message: "Attendance recorded successfully",
            data: populatedRecord
          });
        } catch (populateError) {
          console.error('Error populating saved record:', populateError);
          // Even if population fails, return the saved record
          return res.status(201).json({
            success: true,
            message: "Attendance recorded successfully, but could not populate references",
            data: savedRecord,
            warning: "References could not be populated"
          });
        }
      } catch (saveError) {
        console.error("Error saving new attendance record:", saveError);
        console.error("Error details:", saveError.stack);
        
        // Check for duplicate key error (MongoDB error code 11000)
        if (saveError.code === 11000) {
          return res.status(409).json({
            success: false,
            message: "Duplicate attendance record. A record for this student, subject, and date already exists.",
            error: saveError.message
          });
        }
        
        return res.status(400).json({
          success: false,
          message: "Could not create new attendance record.",
          error: saveError.message
        });
      }
    } catch (findError) {
      console.error("Error finding existing record:", findError);
      return res.status(500).json({
        success: false,
        message: "Error checking for existing attendance records.",
        error: findError.message
      });
    }
  } catch (error) {
    console.error("\n\n=== ERROR RECORDING ATTENDANCE ===\n");
    console.error("Error recording attendance:", error);
    console.error("Error stack:", error.stack);
    
    // Check if it's a MongoDB validation error
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error. Please check your input data.",
        validationErrors: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {}),
        error: error.message
      });
    }
    
    // Check if it's a MongoDB cast error (invalid ID format)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid ${error.path} format.`,
        error: error.message
      });
    }
    
    // Generic server error
    res.status(500).json({
      success: false,
      message: "Server error. Could not record attendance.",
      error: error.message
    });
  }
};

/**
 * Record attendance for multiple students for a specific subject on a specific date
 */
const recordBulkAttendance = async (req, res) => {
  try {
    const { subjectId, date, year, attendanceRecords } = req.body;

    // Validate required fields
    if (!subjectId || !year || !attendanceRecords || !Array.isArray(attendanceRecords)) {
      return res.status(400).json({
        success: false,
        message: "Subject ID, Year, and Attendance Records (array) are required."
      });
    }

    // Check if subject exists
    const subject = await subjectModel.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found."
      });
    }

    // Format the date or use current date
    const attendanceDate = date ? new Date(date) : new Date();
    
    // Process each attendance record
    const results = [];
    const errors = [];

    for (const record of attendanceRecords) {
      try {
        const { studentId, status, remarks } = record;
        
        if (!studentId) {
          errors.push({ studentId, error: "Student ID is required" });
          continue;
        }

        // Check if student exists
        const student = await studentModel.findById(studentId);
        if (!student) {
          errors.push({ studentId, error: "Student not found" });
          continue;
        }

        // Check if attendance record already exists
        const existingRecord = await attendanceModel.findOne({
          student: studentId,
          subject: subjectId,
          date: {
            $gte: new Date(new Date(attendanceDate).setHours(0, 0, 0, 0)),
            $lt: new Date(new Date(attendanceDate).setHours(23, 59, 59, 999))
          }
        });

        if (existingRecord) {
          // Update existing record
          existingRecord.status = status !== undefined ? status : existingRecord.status;
          existingRecord.remarks = remarks || existingRecord.remarks;
          
          await existingRecord.save();
          results.push({ 
            studentId, 
            action: "updated", 
            record: existingRecord 
          });
        } else {
          // Create new attendance record
          const newAttendance = new attendanceModel({
            student: studentId,
            subject: subjectId,
            date: attendanceDate,
            year,
            status: status !== undefined ? status : false,
            remarks: remarks || ""
          });

          await newAttendance.save();
          results.push({ 
            studentId, 
            action: "created", 
            record: newAttendance 
          });
        }
      } catch (error) {
        errors.push({ 
          studentId: record.studentId, 
          error: error.message 
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Bulk attendance processed",
      results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error("Error recording bulk attendance:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Could not process bulk attendance."
    });
  }
};

/**
 * Get attendance records by date and year
 */
const getAttendanceByDateAndYear = async (req, res) => {
  try {
    const { date, year } = req.query;
    
    if (!date || !year) {
      return res.status(400).json({
        success: false,
        message: "Date and Year are required parameters."
      });
    }

    const queryDate = new Date(date);
    
    const attendanceRecords = await attendanceModel.find({
      date: {
        $gte: new Date(queryDate.setHours(0, 0, 0, 0)),
        $lt: new Date(queryDate.setHours(23, 59, 59, 999))
      },
      year
    }).populate('student', 'name rollNo')
      .populate('subject', 'name description');

    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      data: attendanceRecords
    });
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Could not fetch attendance records."
    });
  }
};

/**
 * Get attendance records by student
 */
const getAttendanceByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required."
      });
    }

    // Check if student exists
    const student = await studentModel.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found."
      });
    }

    // Build query
    const query = { student: studentId };
    
    // Add date range if provided
    if (startDate || endDate) {
      query.date = {};
      
      if (startDate) {
        query.date.$gte = new Date(new Date(startDate).setHours(0, 0, 0, 0));
      }
      
      if (endDate) {
        query.date.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
      }
    }

    const attendanceRecords = await attendanceModel.find(query)
      .populate('subject', 'name description')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      data: attendanceRecords
    });
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Could not fetch student attendance."
    });
  }
};

/**
 * Get attendance records by subject
 */
const getAttendanceBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { date, year } = req.query;

    console.log('Getting attendance by subject:', { subjectId, date, year });

    // Validate subject ID format
    if (!subjectId || !mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Subject ID is required."
      });
    }

    // Check if subject exists
    const subject = await subjectModel.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found."
      });
    }

    // Build query
    const query = { subject: subjectId };
    
    // Add year filter if provided
    if (year) {
      query.year = year;
    }
    
    // Add date filter if provided
    if (date) {
      try {
        const queryDate = new Date(date);
        
        // Check if date is valid
        if (isNaN(queryDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid date format provided."
          });
        }
        
        // Create a new Date object for start and end to avoid modifying the same object
        const startOfDay = new Date(queryDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(queryDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        query.date = {
          $gte: startOfDay,
          $lt: endOfDay
        };
      } catch (dateError) {
        console.error('Error parsing date:', dateError);
        return res.status(400).json({
          success: false,
          message: "Invalid date format provided."
        });
      }
    }

    console.log('Query for attendance records:', query);

    try {
      const attendanceRecords = await attendanceModel.find(query)
        .populate('student')
        .populate('subject')
        .sort({ date: -1 });

      console.log(`Found ${attendanceRecords.length} attendance records`);

      res.status(200).json({
        success: true,
        count: attendanceRecords.length,
        data: attendanceRecords
      });
    } catch (findError) {
      console.error('Error finding attendance records:', findError);
      return res.status(500).json({
        success: false,
        message: "Error retrieving attendance records.",
        error: findError.message
      });
    }
  } catch (error) {
    console.error("Error fetching subject attendance:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Could not fetch subject attendance.",
      error: error.message
    });
  }
};

/**
 * Update an attendance record
 */
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    // Validate ID format
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid attendance record ID is required."
      });
    }

    // Validate status is a boolean
    if (status !== undefined && typeof status !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: "Status must be a boolean value (true or false)."
      });
    }

    // Find the attendance record
    const attendanceRecord = await attendanceModel.findById(id);
    
    if (!attendanceRecord) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found."
      });
    }

    // Update fields if provided
    if (status !== undefined) attendanceRecord.status = status;
    if (remarks !== undefined) attendanceRecord.remarks = remarks;

    try {
      // Save with error handling
      await attendanceRecord.save();
    } catch (saveError) {
      console.error("Error saving attendance record:", saveError);
      return res.status(400).json({
        success: false,
        message: "Could not save attendance record. Please check your input.",
        error: saveError.message
      });
    }

    // Return the updated record with populated fields
    const updatedRecord = await attendanceModel.findById(id)
      .populate('student')
      .populate('subject');

    res.status(200).json({
      success: true,
      message: "Attendance record updated successfully",
      data: updatedRecord
    });
  } catch (error) {
    console.error("Error updating attendance record:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Could not update attendance record.",
      error: error.message
    });
  }
};

/**
 * Delete an attendance record
 */
const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Attendance record ID is required."
      });
    }

    const attendanceRecord = await attendanceModel.findByIdAndDelete(id);
    
    if (!attendanceRecord) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found."
      });
    }

    res.status(200).json({
      success: true,
      message: "Attendance record deleted successfully",
      data: attendanceRecord
    });
  } catch (error) {
    console.error("Error deleting attendance record:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Could not delete attendance record."
    });
  }
};

/**
 * Get attendance statistics for a student
 */
const getStudentAttendanceStats = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subjectId, startDate, endDate } = req.query;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required."
      });
    }

    // Check if student exists
    const student = await studentModel.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found."
      });
    }

    // Build query
    const query = { student: studentId };
    
    // Add subject filter if provided
    if (subjectId) {
      query.subject = subjectId;
    }
    
    // Add date range if provided
    if (startDate || endDate) {
      query.date = {};
      
      if (startDate) {
        query.date.$gte = new Date(new Date(startDate).setHours(0, 0, 0, 0));
      }
      
      if (endDate) {
        query.date.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
      }
    }

    const attendanceRecords = await attendanceModel.find(query);
    
    // Calculate statistics
    const totalClasses = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(record => record.status).length;
    const absentCount = totalClasses - presentCount;
    const attendancePercentage = totalClasses > 0 ? (presentCount / totalClasses) * 100 : 0;

    // Get subject-wise breakdown if no specific subject was requested
    let subjectWiseStats = [];
    if (!subjectId) {
      // Get all subjects for this student's attendance
      const subjects = [...new Set(attendanceRecords.map(record => record.subject.toString()))];
      
      // For each subject, calculate stats
      for (const subject of subjects) {
        const subjectRecords = attendanceRecords.filter(record => 
          record.subject.toString() === subject
        );
        
        const subjectTotalClasses = subjectRecords.length;
        const subjectPresentCount = subjectRecords.filter(record => record.status).length;
        const subjectAttendancePercentage = subjectTotalClasses > 0 ? 
          (subjectPresentCount / subjectTotalClasses) * 100 : 0;
        
        // Get subject details
        const subjectDetails = await subjectModel.findById(subject, 'name');
        
        subjectWiseStats.push({
          subject: {
            _id: subject,
            name: subjectDetails ? subjectDetails.name : 'Unknown Subject'
          },
          totalClasses: subjectTotalClasses,
          present: subjectPresentCount,
          absent: subjectTotalClasses - subjectPresentCount,
          attendancePercentage: subjectAttendancePercentage.toFixed(2)
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        student: {
          _id: student._id,
          name: student.name,
          rollNo: student.rollNo,
          year: student.year
        },
        overall: {
          totalClasses,
          present: presentCount,
          absent: absentCount,
          attendancePercentage: attendancePercentage.toFixed(2)
        },
        subjectWise: subjectWiseStats.length > 0 ? subjectWiseStats : undefined
      }
    });
  } catch (error) {
    console.error("Error fetching student attendance statistics:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Could not fetch attendance statistics."
    });
  }
};

export {
  recordAttendance,
  recordBulkAttendance,
  getAttendanceByDateAndYear,
  getAttendanceByStudent,
  getAttendanceBySubject,
  updateAttendance,
  deleteAttendance,
  getStudentAttendanceStats
};
