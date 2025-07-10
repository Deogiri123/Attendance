export interface LectureAttendance {
  id: string;
  name: string;
  present: boolean;
  date: string;
}

export interface Student {
  id: number;
  name: string;
  rollNo: string;
  phone: string;
  parentsPhone: string;
  present: boolean;
  image: string;
  year: string;
  lectureAttendance: LectureAttendance[];
}

export interface Stats {
  totalStudents: number;
  todayAttendance: number;
  absentStudents: number;
  attendanceRate: number;
}

export interface Activity {
  id: number;
  type: 'new_student' | 'attendance_update' | 'attendance_alert' | 'report';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

export interface ClassOption {
  id: string;
  name: string;
}

export interface Subject {
  _id: string;
  name: string;
  year: string;
  description?: string;
  credits?: string;
}

export interface Teacher {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subjects: Subject[];
}