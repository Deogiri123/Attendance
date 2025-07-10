import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rollNo: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    parentsPhone: { type: String, required: true },
    year: { type: Number, required: true }, 
    attendance: { type: Boolean, default: false }
});

const studentModel = mongoose.models.student || mongoose.model("student", studentSchema);

export default studentModel;
