import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  text: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  marks: number;
  options?: string[]; // For MCQ type questions
  correctAnswer?: string; // Optional answer key
}

export interface ISection {
  title: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IAssignment extends Document {
  title: string;
  dueDate: Date;
  questionTypes: string[];
  numQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  fileUrl?: string; // Optional uploaded resource file
  fileName?: string; // Original name of file
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  sections: ISection[];
  pdfUrl?: string; // Local file path or cloud URL to generated PDF
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Moderate', 'Hard'], required: true },
  marks: { type: Number, required: true },
  options: [{ type: String }],
  correctAnswer: { type: String }
});

const SectionSchema = new Schema<ISection>({
  title: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: [QuestionSchema]
});

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    dueDate: { type: Date, required: true },
    questionTypes: [{ type: String, required: true }],
    numQuestions: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    additionalInstructions: { type: String },
    fileUrl: { type: String },
    fileName: { type: String },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    errorMessage: { type: String },
    sections: [SectionSchema],
    pdfUrl: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
