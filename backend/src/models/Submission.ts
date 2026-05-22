import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmissionAnswer {
  questionId: string;
  questionText: string;
  studentAnswer: string;
  correctAnswer?: string;
  marksObtained?: number;
  maxMarks: number;
  feedback?: string;
}

export interface ISubmission extends Document {
  assignmentId: mongoose.Types.ObjectId;
  studentName: string;
  rollNumber: string;
  section?: string;
  answers: ISubmissionAnswer[];
  totalScore: number;
  totalMaxMarks: number;
  status: 'pending' | 'graded' | 'failed';
  gradedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionAnswerSchema = new Schema<ISubmissionAnswer>({
  questionId: { type: String, required: true },
  questionText: { type: String, required: true },
  studentAnswer: { type: String, required: true },
  correctAnswer: { type: String },
  marksObtained: { type: Number, default: 0 },
  maxMarks: { type: Number, required: true },
  feedback: { type: String }
});

const SubmissionSchema = new Schema<ISubmission>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    studentName: { type: String, required: true },
    rollNumber: { type: String, required: true },
    section: { type: String },
    answers: [SubmissionAnswerSchema],
    totalScore: { type: Number, default: 0 },
    totalMaxMarks: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'graded', 'failed'],
      default: 'pending'
    },
    gradedAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model<ISubmission>('Submission', SubmissionSchema);
