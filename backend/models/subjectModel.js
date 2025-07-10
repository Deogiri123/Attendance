import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    enum: ['2', '3', '4'],
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  credits: {
    type: String,
    enum: ['1', '2', '3', '4', '5'],
    default: '3',
  },
});

const subjectModel = mongoose.models.subject || mongoose.model("subject", subjectSchema);

export default subjectModel;