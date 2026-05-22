import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent {
  rollNo: string;
  name: string;
  avgScore: number;
  attendance: string;
  grade: string;
  color: string;
}

export interface IGroup extends Document {
  name: string;
  subject: string;
  studentCount: number;
  avgScore: number;
  term: string;
  students: IStudent[];
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>({
  rollNo: { type: String, required: true },
  name: { type: String, required: true },
  avgScore: { type: Number, default: 75.0 },
  attendance: { type: String, default: '90%' },
  grade: { type: String, default: 'B+' },
  color: { type: String, default: 'from-blue-400 to-indigo-400' }
});

const GroupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true },
    subject: { type: String, required: true },
    studentCount: { type: Number, default: 0 },
    avgScore: { type: Number, default: 75.0 },
    term: { type: String, default: 'Term 1' },
    students: [StudentSchema]
  },
  { timestamps: true }
);

export default mongoose.model<IGroup>('Group', GroupSchema);
