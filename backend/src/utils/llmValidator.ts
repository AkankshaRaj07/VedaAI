import { z } from 'zod';

export const QuestionSchema = z.object({
  text: z.string(),
  marks: z.number().int().positive(),
  difficulty: z.enum(['Easy', 'Moderate', 'Hard']),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional()
});

export const SectionSchema = z.object({
  title: z.string(),
  instruction: z.string(),
  questions: z.array(QuestionSchema)
});

export const AssessmentSchema = z.object({
  sections: z.array(SectionSchema)
});

export const GradeSchema = z.object({
  questionId: z.string(),
  marksObtained: z.number().nonnegative(),
  feedback: z.string()
});

export const GradesArraySchema = z.object({
  grades: z.array(GradeSchema)
});
