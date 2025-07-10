import express from 'express';
import { 
  getAllTeachers, 
  getTeacherById, 
  addTeacher, 
  updateTeacher, 
  deleteTeacher,
  addSubjectToTeacher,
  removeSubjectFromTeacher
} from '../controllers/teacherController.js';
import authUser from '../middleware/authUser.js';

const teacherRouter = express.Router();

// Teacher CRUD routes
teacherRouter.get('/list', authUser, getAllTeachers);
teacherRouter.get('/:id', authUser, getTeacherById);
teacherRouter.post('/add', authUser, addTeacher);
teacherRouter.put('/update/:id', authUser, updateTeacher);
teacherRouter.delete('/delete/:id', authUser, deleteTeacher);

// Subject management routes
teacherRouter.post('/:teacherId/add-subject/:subjectId', authUser, addSubjectToTeacher);
teacherRouter.delete('/:teacherId/remove-subject/:subjectId', authUser, removeSubjectFromTeacher);

export default teacherRouter;
