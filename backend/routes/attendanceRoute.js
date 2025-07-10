import express from "express";
import {
  recordAttendance,
  recordBulkAttendance,
  getAttendanceByDateAndYear,
  getAttendanceByStudent,
  getAttendanceBySubject,
  updateAttendance,
  deleteAttendance,
  getStudentAttendanceStats
} from "../controllers/attendanceController.js";
import { notifyAbsentStudents, getNotificationChannels } from "../controllers/notificationController.js";
import authUser from "../middleware/authUser.js";

const attendanceRouter = express.Router();

// Record attendance for a single student
attendanceRouter.post('/record', authUser, recordAttendance);

// Record attendance for multiple students at once
attendanceRouter.post('/record-bulk', authUser, recordBulkAttendance);

// Get attendance by date and year
attendanceRouter.get('/by-date', getAttendanceByDateAndYear);

// Get attendance for a specific student
attendanceRouter.get('/student/:studentId', getAttendanceByStudent);

// Get attendance for a specific subject
attendanceRouter.get('/subject/:subjectId', getAttendanceBySubject);

// Update an attendance record
attendanceRouter.put('/update/:id', authUser, updateAttendance);

// Delete an attendance record
attendanceRouter.delete('/delete/:id', authUser, deleteAttendance);

// Get attendance statistics for a student
attendanceRouter.get('/stats/student/:studentId', getStudentAttendanceStats);

// Send notifications to parents of absent students
attendanceRouter.post('/notify-absent', authUser, notifyAbsentStudents);

// Get available notification channels
attendanceRouter.get('/notification-channels', getNotificationChannels);

export default attendanceRouter;
