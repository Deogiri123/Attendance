import express from "express";
import { addStudent, deleteStudent, listStudent, updateStudent } from "../controllers/studentController.js";
import authUser from "../middleware/authUser.js";

const studentRouter = express.Router();


studentRouter.post('/add-student', authUser, addStudent);
studentRouter.get('/list-student', listStudent);
studentRouter.put('/update-student/:id', authUser, updateStudent);
studentRouter.delete('/delete-student/:id', authUser, deleteStudent);

export default studentRouter;
              
