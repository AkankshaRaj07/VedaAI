import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import dotenv from 'dotenv';
import { AssessmentSchema, GradesArraySchema } from './llmValidator';

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
    const rawParsedData = JSON.parse(responseText);
    
    // Zod Validation: Guarantees the LLM output exactly matches our expected interface
    const parsedData = AssessmentSchema.parse(rawParsedData);
    
    // Safety check: Validate total marks and adjust if slightly off
    validateAndAdjustMarks(parsedData, params.totalMarks);

    return parsedData;
  } catch (error: any) {
    console.error('Error generating questions with Gemini:', error?.message || error);
    console.log('Falling back to mock question generation due to API error.');
    return getMockedQuestions(params, true);
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
function getMockedQuestions(params: AIInputParams, isFallback: boolean = false) {
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
      
      const titleL = (params.title || '').toLowerCase();

      let extractedSentence = '';
      if (params.fileContent) {
        const sentences = params.fileContent.replace(/\n/g, ' ').split('. ').map(s => s.trim()).filter(s => s.length > 40 && s.length < 150);
        if (sentences.length > 0) {
          extractedSentence = sentences[(i + sectionIdx * 3) % sentences.length] + '.';
        }
      }

      if (type.toLowerCase().includes('mcq')) {
        if (extractedSentence) {
          questions.push({
            text: `Based on the uploaded document: Which of the following is true regarding this statement: "${extractedSentence}"?`,
            difficulty,
            marks,
            options: [
              'A) It is the primary cause of the phenomenon discussed.',
              'B) It represents an exception to the general rule.',
              'C) It is a key defining characteristic of the subject.',
              'D) It is an outdated theory not supported by the document.'
            ],
            correctAnswer: 'C) It is a key defining characteristic of the subject.'
          });
        } else if (titleL.includes('electric') || titleL.includes('physic')) {
          const mcqs = [
            {
              text: 'What is the SI unit of electrical resistance?',
              options: ['A) Ampere', 'B) Volt', 'C) Ohm', 'D) Watt'],
              correctAnswer: 'C) Ohm'
            },
            {
              text: 'Which law states that current is directly proportional to voltage and inversely proportional to resistance?',
              options: ['A) Newton\'s Law', 'B) Ohm\'s Law', 'C) Faraday\'s Law', 'D) Kirchhoff\'s Law'],
              correctAnswer: 'B) Ohm\'s Law'
            },
            {
              text: 'What happens to the total resistance when resistors are connected in series?',
              options: ['A) It decreases', 'B) It remains the same', 'C) It increases', 'D) It becomes zero'],
              correctAnswer: 'C) It increases'
            }
          ];
          const q = mcqs[i % mcqs.length];
          questions.push({ ...q, difficulty, marks });
        } else {
          const mcqs = [
            {
              text: `Which of the following is the most accurate defining characteristic of ${params.title || 'the main subject'}?`,
              options: [
                'A) It operates independently of external variables.',
                'B) It relies on continuous feedback loops.',
                'C) It is defined by its core structural integrity.',
                'D) Both B and C are correct.'
              ],
              correctAnswer: 'D) Both B and C are correct.'
            },
            {
              text: `When evaluating ${params.title || 'this topic'}, which secondary factor must be considered?`,
              options: [
                'A) Environmental constraints',
                'B) Historical precedence',
                'C) Statistical variance',
                'D) Systemic latency'
              ],
              correctAnswer: 'A) Environmental constraints'
            }
          ];
          const q = mcqs[i % mcqs.length];
          questions.push({ ...q, difficulty, marks });
        }
      } else if (type.toLowerCase().includes('short')) {
        if (extractedSentence) {
          questions.push({
            text: `The document states: "${extractedSentence}". Explain the significance of this concept in your own words.`,
            difficulty,
            marks
          });
        } else if (titleL.includes('electric') || titleL.includes('physic')) {
          const shorts = [
            "Explain the difference between alternating current (AC) and direct current (DC).",
            "Why is tungsten used almost exclusively for filament of electric lamps?",
            "State Joule’s law of heating and give its mathematical expression."
          ];
          questions.push({ text: shorts[i % shorts.length], difficulty, marks });
        } else {
          const shortQuestions = [
            `What are the fundamental principles of ${params.title || 'this topic'}, and how do they function?`,
            `Define the key terminology associated with ${params.title || 'this topic'} and provide a real-world example.`,
            `Describe the primary purpose and applications of the concepts covered in ${params.title || 'this topic'}.`
          ];
          questions.push({ text: shortQuestions[i % shortQuestions.length], difficulty, marks });
        }
      } else if (type.toLowerCase().includes('numerical') || type.toLowerCase().includes('problem')) {
        if (extractedSentence) {
          questions.push({
            text: `Using the information provided in the document ("${extractedSentence}"), formulate a numerical problem and solve it showing all steps.`,
            difficulty,
            marks
          });
        } else if (titleL.includes('electric') || titleL.includes('physic')) {
          const nums = [
            "A current of 0.5 A is drawn by a filament of an electric bulb for 10 minutes. Find the amount of electric charge that flows through the circuit.",
            "An electric iron consumes energy at a rate of 840 W when heating is at the maximum rate. Calculate the current if the voltage is 220 V.",
            "Calculate the equivalent resistance when two resistors of 10 Ω and 20 Ω are connected in parallel."
          ];
          questions.push({ text: nums[i % nums.length], difficulty, marks });
        } else {
          questions.push({ text: `Calculate the expected result for a standard scenario involving ${params.title || 'this topic'}. Ensure you show all formulas, step-by-step working, and the final unit.`, difficulty, marks });
        }
      } else if (type.toLowerCase().includes('diagram') || type.toLowerCase().includes('graph')) {
        if (extractedSentence) {
          questions.push({
            text: `Based on the description in the document: "${extractedSentence}", draw a clearly labeled diagram illustrating this concept.`,
            difficulty,
            marks
          });
        } else if (titleL.includes('electric') || titleL.includes('physic')) {
          questions.push({ text: "Draw a schematic diagram of a circuit consisting of a battery of three cells of 2 V each, a 5 Ω resistor, an 8 Ω resistor, and a plug key, all connected in series.", difficulty, marks });
        } else {
          questions.push({ text: `Draw a clearly labeled diagram or graph illustrating the core relationships and components within ${params.title || 'this topic'}.`, difficulty, marks });
        }
      } else {
        if (extractedSentence) {
          questions.push({
            text: `Critically analyze the following excerpt from the document: "${extractedSentence}". Discuss its broader implications.`,
            difficulty,
            marks
          });
        } else if (titleL.includes('electric') || titleL.includes('physic')) {
          questions.push({ text: "Discuss the environmental and economic impacts of widespread adoption of renewable energy sources for electricity generation compared to traditional fossil fuels.", difficulty, marks });
        } else {
          questions.push({ text: `Provide a comprehensive analysis of the main theories described in ${params.title || 'this topic'}. Compare the advantages and potential limitations of these approaches.`, difficulty, marks });
        }
      }
      currentQuestionIndex++;
    }
    
    sections.push({
      title: `Section ${sectionChar}: ${type} Questions`,
      instruction: `Answer all questions in this section. Each question carries ${Math.floor(params.totalMarks / params.numQuestions)} marks unless specified.`,
      questions
    });
  });

  if (isFallback && sections.length > 0) {
    sections[0].instruction = `[AI GENERATION FAILED - SHOWING FALLBACK RESPONSE] ${sections[0].instruction}`;
  }

  return { sections };
}

export interface GradeInput {
  questionId: string;
  questionText: string;
  studentAnswer: string;
  correctAnswer?: string;
  maxMarks: number;
}

export const gradeAnswers = async (
  assignmentTitle: string,
  answersToGrade: GradeInput[]
) => {
  if (!apiKey) {
    return getMockedGrades(answersToGrade);
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
  });

  const prompt = `
You are VedaAI, an expert school examiner. Your task is to evaluate and grade a student's answers for the exam paper titled: "${assignmentTitle}".
Please evaluate each student response against the question text, the correct answer guideline, and the maximum marks allocated.

For each response:
1. Provide a fair score (marksObtained) between 0 and maxMarks (inclusive).
   - If the question is a Multiple Choice Question (MCQ) and has a correctAnswer, check if the student's answer matches the correct option exactly or is equivalent. If yes, award full marks, otherwise 0.
   - For written responses (Short Answer, Essay, Numerical), evaluate content accuracy, explanation details, and reasoning quality. Be encouraging but objective.
2. Provide a constructive, encouraging feedback string explaining why the marks were awarded (or deducted) and how the student can improve. Keep feedback to 1-2 concise sentences.

Here are the questions and student responses to grade:
${JSON.stringify(answersToGrade, null, 2)}
`;

  const schema = {
    type: SchemaType.OBJECT,
    properties: {
      grades: {
        type: SchemaType.ARRAY,
        description: 'List of graded responses matching the input array order',
        items: {
          type: SchemaType.OBJECT,
          properties: {
            questionId: { type: SchemaType.STRING, description: 'The questionId from the input list' },
            marksObtained: { type: SchemaType.INTEGER, description: 'Marks awarded for this answer' },
            feedback: { type: SchemaType.STRING, description: 'Feedback or explanation of grading' }
          },
          required: ['questionId', 'marksObtained', 'feedback']
        }
      }
    },
    required: ['grades']
  };

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.1, // low temperature for consistent and objective grading
      }
    });

    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);

    // Validate and clamp scores
    if (parsedData.grades && Array.isArray(parsedData.grades)) {
      parsedData.grades.forEach((g: any) => {
        const input = answersToGrade.find((ans) => ans.questionId === g.questionId);
        if (input) {
          if (typeof g.marksObtained !== 'number' || isNaN(g.marksObtained)) {
            g.marksObtained = 0;
          }
          g.marksObtained = Math.max(0, Math.min(input.maxMarks, Math.round(g.marksObtained)));
        }
      });
      return parsedData.grades;
    }
    
    throw new Error('Invalid grade structure returned from AI');
  } catch (error) {
    console.error('Error grading answers with Gemini API:', error);
    return getMockedGrades(answersToGrade);
  }
};

function getMockedGrades(answersToGrade: GradeInput[]) {
  console.log('Using Mocked Grading (Offline Fallback)');
  return answersToGrade.map((ans) => {
    let marksObtained = 0;
    let feedback = '';

    if (ans.correctAnswer) {
      const cleanStudent = ans.studentAnswer.trim().toLowerCase();
      const cleanCorrect = ans.correctAnswer.trim().toLowerCase();
      if (cleanStudent === cleanCorrect || cleanCorrect.includes(cleanStudent)) {
        marksObtained = ans.maxMarks;
        feedback = 'Correct! Your choice matches the correct option.';
      } else {
        marksObtained = 0;
        feedback = `Incorrect. The correct answer was: ${ans.correctAnswer}`;
      }
    } else {
      const len = ans.studentAnswer.trim().length;
      if (len > 35) {
        marksObtained = ans.maxMarks;
        feedback = 'Great job! The explanation is detailed, clear, and demonstrates a good understanding of the material.';
      } else if (len > 15) {
        marksObtained = Math.max(1, Math.round(ans.maxMarks * 0.7));
        feedback = 'Good attempt. The answer addresses the core question but would benefit from further elaboration.';
      } else if (len > 0) {
        marksObtained = Math.max(1, Math.round(ans.maxMarks * 0.4));
        feedback = 'Answer is too brief. Please provide a more complete explanation next time.';
      } else {
        marksObtained = 0;
        feedback = 'No answer was provided.';
      }
    }

    return {
      questionId: ans.questionId,
      marksObtained,
      feedback
    };
  });
}

export interface LessonPlanInputParams {
  grade: string;
  subject: string;
  topic: string;
  learningObjectives: string;
  duration: number;
}

export const generateLessonPlan = async (params: LessonPlanInputParams): Promise<string> => {
  if (!apiKey) {
    return getMockedLessonPlan(params);
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
  });

  const prompt = `
You are VedaAI, an expert curriculum planner and school teacher. Generate a highly detailed, professional, and engaging Lesson Plan based on the parameters below. Output the final plan as clean markdown text.

LESSON PARAMETERS:
- Grade Level: "${params.grade}"
- Subject: "${params.subject}"
- Lesson Topic: "${params.topic}"
- Core Learning Objectives: "${params.learningObjectives}"
- Total Duration: ${params.duration} Minutes

Please structure the markdown output precisely with the following sections:
1. "# Lesson Plan: [Topic Name]"
2. "**Grade Level:** [Grade] | **Subject:** [Subject] | **Duration:** [Duration] Minutes"
3. "## Learning Objectives" (List 2-4 objectives based on the input)
4. "## Key Concept Focus" (Bullet points of core formulas, vocabulary, or concepts)
5. "## Materials Needed" (List of classroom resources or lab equipment needed)
6. "## Outline & Timeline" (Break down the total duration into timed phases, e.g. 10 mins Hook, 20 mins Instruction, 20 mins Activity, 10 mins Assessment/Wrap-up. Allocate exactly ${params.duration} minutes total)
`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error generating lesson plan with Gemini:', error);
    return getMockedLessonPlan(params);
  }
};

function getMockedLessonPlan(params: LessonPlanInputParams): string {
  console.log('Using Mocked Lesson Plan (No Gemini API Key)');
  return `# Lesson Plan: ${params.topic}
**Grade Level:** ${params.grade} | **Subject:** ${params.subject} | **Duration:** ${params.duration} Minutes

## Learning Objectives
1. Explain the fundamental principles of ${params.topic} inside the context of ${params.subject}.
2. Apply classroom theoretical models to solve conceptual and quantitative problems.
3. Critically analyze key examples related to "${params.learningObjectives || 'general topics'}".

## Key Concept Focus
- Core definition of ${params.topic} and surrounding vocabulary.
- Practical application rules and standard formulas.
- Safety procedures and real-world industrial usage.

## Materials Needed
- Interactive projector / whiteboard presentation deck.
- Worksheets with sample problems, pencils, and scientific calculators.
- Laboratory demonstration kits or reference diagrams.

## Outline & Timeline
- **00:00 - 00:10 (Classroom Hook):** Introduce a real-world scenario of ${params.topic}. Prompt students: "Why does this happen in daily life?"
- **00:10 - 00:30 (Core Instruction):** Walkthrough key theories, write major equations, and complete a step-by-step example problem on the board.
- **00:30 - 00:45 (Guided Activity):** Group work: Students collaborate in pairs on practice sheets. Walk around the room providing targeted guidance.
- **00:45 - 00:${params.duration} (Wrap-up / Assessment):** Exit ticket: Solve a single conceptual problem individually and submit it before leaving. Review answers briefly in the final 2 minutes.`;
}

export interface QuestionBankInputParams {
  topic: string;
  count: number;
  difficulty: string;
}

export const generateQuestionBank = async (params: QuestionBankInputParams): Promise<string> => {
  if (!apiKey) {
    return getMockedQuestionBank(params);
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
  });

  const prompt = `
You are VedaAI, an expert school examiner. Generate a professional Question Bank sheet based on the parameters below. Output the final sheet as clean markdown text.

PARAMETERS:
- Topic / Syllabus Area: "${params.topic}"
- Number of Questions: ${params.count}
- Target Difficulty Level: "${params.difficulty}"

Please structure the markdown output precisely as follows:
1. "# AI Generated Question Bank: [Topic]"
2. "**Questions Count:** [Count] | **Difficulty:** [Difficulty]"
3. A numbered list of ${params.count} questions. For each question, provide:
   - "X. **Question ([Marks] Marks):** [Question text]"
   - "   - *Marking Guide:* [Step-by-step marking rubrics or correct answer schema showing how the marks are allocated]"
`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error generating question bank with Gemini:', error);
    return getMockedQuestionBank(params);
  }
};

function getMockedQuestionBank(params: QuestionBankInputParams): string {
  console.log('Using Mocked Question Bank (No Gemini API Key)');
  const questions: string[] = [];
  const qCount = params.count || 3;
  const maxMarks = params.difficulty === 'Hard' ? 10 : (params.difficulty === 'Medium' ? 5 : 2);

  for (let i = 1; i <= qCount; i++) {
    questions.push(`${i}. **Question (${maxMarks} Marks):** Explain the core applications and theoretical implications of ${params.topic} (Item #${i} - ${params.difficulty} level).
   - *Marking Guide:* ${Math.floor(maxMarks/2)} Marks for outlining the correct definition and base mechanism; ${Math.ceil(maxMarks/2)} Marks for providing a clear, real-world example with proper labeling.`);
  }

  return `# AI Generated Question Bank: ${params.topic}
**Questions Count:** ${qCount} | **Difficulty:** ${params.difficulty}

${questions.join('\n\n')}`;
}

export interface FeedbackRemarksInputParams {
  studentName: string;
  tone: string;
  draftObservations: string;
}

export const generateFeedbackRemarks = async (params: FeedbackRemarksInputParams): Promise<string> => {
  if (!apiKey) {
    return getMockedFeedbackRemarks(params);
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
  });

  const prompt = `
You are VedaAI, an expert school evaluator and counselor. Your task is to expand the teacher's brief draft notes into a formal, professional report-card comment/remark.

PARAMETERS:
- Student Name: "${params.studentName}"
- Target Tone: "${params.tone}" (e.g. Encouraging, Constructive, Academic, Motivating)
- Draft Notes / Observations: "${params.draftObservations}"

Please generate a single, high-quality, polished paragraph (3-5 sentences) wrapped in quotation marks.
- Maintain the original academic observations, but express them with the selected tone.
- Make the feedback constructive and action-oriented, providing a concrete path to improvement.
- Ensure the student is addressed by their name: "${params.studentName}".
`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Error generating feedback remarks with Gemini:', error);
    return getMockedFeedbackRemarks(params);
  }
};

function getMockedFeedbackRemarks(params: FeedbackRemarksInputParams): string {
  console.log('Using Mocked Feedback Remarks (No Gemini API Key)');
  const toneLabel = params.tone || 'Constructive';
  const notes = params.draftObservations || 'needs improvement in calculations';
  const name = params.studentName || 'Student';

  if (toneLabel.toLowerCase().includes('encouraging')) {
    return `"${name} has shown a wonderful attitude and solid potential during this term. While ${notes}, with a little more deliberate practice, they are sure to build great confidence. Keep up the high spirits and fantastic work!"`;
  } else if (toneLabel.toLowerCase().includes('academic')) {
    return `"${name}'s academic progress shows consistent involvement. Relative to the observation that they ${notes}, it is recommended they devote systematic study to reinforce key foundational mechanisms. This structured review will aid academic standard compliance."`;
  } else if (toneLabel.toLowerCase().includes('motivating')) {
    return `"${name} is fully capable of achieving top results! Regarding ${notes}, taking this as a challenge to focus more will yield outstanding breakthroughs. Let's push for excellence in the upcoming term!"`;
  } else {
    // Default constructive
    return `"${name} has demonstrated positive effort in class. To build on this foundation, particularly as they ${notes}, they are encouraged to pay closer attention to step-by-step methodology and seek extra clarification. Consistent practice will resolve these minor details."`;
  }
}

