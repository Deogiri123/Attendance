import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subject",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    year: {
      type: String,
      enum: ["2", "3", "4"],
      required: true,
    },
    status: {
      type: Boolean,
      default: false, // false for absent, true for present
    },
    remarks: {
      type: String,
      default: "",
    }
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a student can only have one attendance record per subject per day
attendanceSchema.index({ student: 1, subject: 1, date: 1 }, { unique: true });

const attendanceModel = mongoose.models.attendance || mongoose.model("attendance", attendanceSchema);

export default attendanceModel;
