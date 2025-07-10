import express from 'express';
import { addSubject, getSubjectsByYear, deleteSubject } from '../controllers/subjectController.js';
import authUser from '../middleware/authUser.js';

const subjectRouter = express.Router();

subjectRouter.post('/add', authUser, addSubject);
subjectRouter.get('/year/:year', authUser, getSubjectsByYear);
subjectRouter.delete('/:id', authUser, deleteSubject);

export default subjectRouter;
