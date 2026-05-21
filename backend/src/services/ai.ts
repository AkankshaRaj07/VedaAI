import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('WARNING: GEMINI_API_KEY is not defined in environment variables.');
}

const genAI = new GoogleGenerativeAI(apiKey || 'MOCK_API_KEY');

export interface AIInputParams {
  title: string;
  questionTypes: string[];
  numQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  fileContent?: string;
}

export const generateQuestions = async (params: AIInputParams) => {
  if (!apiKey) {
    // Return dummy mocked data for development/testing if no API Key is provided
    return getMockedQuestions(params);
  }

  // Use gemini-1.5-flash as it is highly efficient and supports structured output
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
  });

  const prompt = `
You are VedaAI, an expert school assessment and exam paper creator. Your goal is to generate a high-quality, professional exam question paper based on the parameters below.

EXAM PARAMETERS:
- Assignment Title: "${params.title}"
- Question Types allowed: ${params.questionTypes.join(', ')}
- Target Number of Questions: ${params.numQuestions}
- Target Total Marks: ${params.totalMarks}
- Additional Instructions/Focus Topics: "${params.additionalInstructions || 'None'}"
${params.fileContent ? `- Reference Syllabus/Study Material content:\n"""\n${params.fileContent}\n"""` : ''}

INSTRUCTIONS FOR QUESTION BALANCING:
1. Organize the questions into logical sections (e.g. "Section A: Multiple Choice Questions", "Section B: Short Answer Questions").
2. Assign each question a difficulty level: "Easy", "Moderate", or "Hard". Ensure a realistic balance (e.g. about 30% Easy, 50% Moderate, 20% Hard) unless the user instructions say otherwise.
3. Assign marks to each question based on its section and difficulty. The SUM of all question marks MUST be exactly ${params.totalMarks}.
4. For Multiple Choice Questions (MCQ), you must provide an options array containing exactly 4 options, and set the correctAnswer to one of these options.
`;

  // Define the JSON schema to enforce correct output format
  const schema = {
    type: SchemaType.OBJECT,
    properties: {
      sections: {
        type: SchemaType.ARRAY,
        description: 'List of sections in the exam paper',
        items: {
          type: SchemaType.OBJECT,
          properties: {
            title: {
              type: SchemaType.STRING,
              description: 'Section Title, e.g. "Section A: Multiple Choice Questions"'
            },
            instruction: {
              type: SchemaType.STRING,
              description: 'Instructions for this section, e.g. "Attempt all questions. Each question carries 1 mark."'
            },
            questions: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  text: { type: SchemaType.STRING, description: 'The question text itself' },
                  difficulty: {
                    type: SchemaType.STRING,
                    description: 'Difficulty level',
                    enum: ['Easy', 'Moderate', 'Hard']
                  },
                  marks: { type: SchemaType.INTEGER, description: 'Marks awarded for this question' },
                  options: {
                    type: SchemaType.ARRAY,
                    description: 'Array of exactly 4 choices (MCQs only)',
                    items: { type: SchemaType.STRING }
                  },
                  correctAnswer: {
                    type: SchemaType.STRING,
                    description: 'The correct option (MCQs only)'
                  }
                },
                required: ['text', 'difficulty', 'marks']
              }
            }
          },
          required: ['title', 'instruction', 'questions']
        }
      }
    },
    required: ['sections']
  };

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.3, // Lower temperature for more analytical/precise question generation
      }
    });

    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);
    
    // Safety check: Validate total marks and adjust if slightly off
    validateAndAdjustMarks(parsedData, params.totalMarks);

    return parsedData;
  } catch (error) {
    console.error('Error generating questions with Gemini:', error);
    throw new Error('AI Question Generation failed. Please check your inputs and try again.');
  }
};

// Post-generation validation to ensure LLM complied with total marks requirement
function validateAndAdjustMarks(data: any, targetMarks: number) {
  let totalGeneratedMarks = 0;
  let allQuestions: any[] = [];

  if (!data.sections || !Array.isArray(data.sections)) return;

  for (const section of data.sections) {
    if (section.questions && Array.isArray(section.questions)) {
      for (const q of section.questions) {
        totalGeneratedMarks += q.marks || 0;
        allQuestions.push(q);
      }
    }
  }

  const diff = targetMarks - totalGeneratedMarks;
  if (diff !== 0 && allQuestions.length > 0) {
    console.log(`Adjusting marks: Target = ${targetMarks}, Generated = ${totalGeneratedMarks}, Diff = ${diff}`);
    // Distribute the difference to questions (e.g. adjust the last question or distribute evenly)
    if (diff > 0) {
      // Add marks to the hardest questions or last question
      allQuestions[allQuestions.length - 1].marks += diff;
    } else {
      // Deduct marks, ensuring they don't drop below 1 mark
      let remainingDeduction = Math.abs(diff);
      for (let i = allQuestions.length - 1; i >= 0; i--) {
        if (allQuestions[i].marks > remainingDeduction + 1) {
          allQuestions[i].marks -= remainingDeduction;
          break;
        } else if (allQuestions[i].marks > 1) {
          const deduction = allQuestions[i].marks - 1;
          allQuestions[i].marks = 1;
          remainingDeduction -= deduction;
        }
        if (remainingDeduction <= 0) break;
      }
    }
  }
}

// Fallback Mock generator for offline testing or missing API key
function getMockedQuestions(params: AIInputParams) {
  console.log('Using Mocked Question Generation (No Gemini API Key)');
  
  const sections: any[] = [];
  const qTypes = params.questionTypes.length > 0 ? params.questionTypes : ['MCQ'];
  const questionsPerType = Math.max(1, Math.floor(params.numQuestions / qTypes.length));
  
  let currentQuestionIndex = 1;
  let marksAssigned = 0;
  
  qTypes.forEach((type, sectionIdx) => {
    const sectionChar = String.fromCharCode(65 + sectionIdx); // A, B, C...
    const questions: any[] = [];
    
    for (let i = 0; i < questionsPerType; i++) {
      if (currentQuestionIndex > params.numQuestions) break;
      
      const isLastQuestion = currentQuestionIndex === params.numQuestions;
      // Calculate marks for this question
      let marks = Math.floor(params.totalMarks / params.numQuestions);
      if (isLastQuestion) {
        marks = params.totalMarks - marksAssigned;
      }
      marksAssigned += marks;

      const difficulty = i % 3 === 0 ? 'Easy' : (i % 3 === 1 ? 'Moderate' : 'Hard');
      
      if (type.toLowerCase().includes('mcq')) {
        questions.push({
          text: `Which of the following best describes the core concept related to the topic of ${params.title || 'the study guide'} (Question ${currentQuestionIndex})?`,
          difficulty,
          marks,
          options: [
            'Option A: Primary system architecture and patterns',
            'Option B: Secondary configuration parameters',
            'Option C: Tertiary performance benchmarks',
            'Option D: None of the above'
          ],
          correctAnswer: 'Option A: Primary system architecture and patterns'
        });
      } else if (type.toLowerCase().includes('short')) {
        questions.push({
          text: `Briefly explain the significance of the key mechanisms discussed in ${params.title || 'the study guide'} and highlight their primary use cases.`,
          difficulty,
          marks
        });
      } else {
        questions.push({
          text: `Provide a detailed critical analysis of the methodologies described in ${params.title || 'the study guide'}. Compare its advantages and disadvantages with modern alternatives.`,
          difficulty,
          marks
        });
      }
      currentQuestionIndex++;
    }
    
    sections.push({
      title: `Section ${sectionChar}: ${type} Questions`,
      instruction: `Answer all questions in this section. Each question carries ${Math.floor(params.totalMarks / params.numQuestions)} marks unless specified.`,
      questions
    });
  });

  return { sections };
}
