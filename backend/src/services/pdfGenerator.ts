import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { IAssignment } from '../models/Assignment';

/**
 * Generates a clean, exam-style PDF for a given assignment.
 * Returns the relative static URL to the generated PDF.
 */
export const generateAssignmentPDF = (assignment: IAssignment): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileName = `assignment_${assignment._id}_${Date.now()}.pdf`;
      const filePath = path.join(uploadsDir, fileName);
      const doc = new PDFDocument({ margin: 50, size: 'A4' });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // 1. Exam Header / Logo
      doc.fontSize(22).font('Helvetica-Bold').fillColor('#1e293b').text(assignment.title.toUpperCase(), { align: 'center' });
      doc.moveDown(0.3);

      // 2. Exam Sub-Header (Marks & Time/Date)
      const formattedDate = new Date(assignment.dueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const currentY = doc.y;
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#475569').text(`DATE: ${formattedDate}`, 50, currentY);
      doc.fontSize(10).font('Helvetica-Bold').text(`TOTAL MARKS: ${assignment.totalMarks}`, 400, currentY, { align: 'right' });
      doc.moveDown(1);

      // 3. Student Details Block (Box)
      const boxY = doc.y;
      doc.rect(50, boxY, 495, 35).strokeColor('#cbd5e1').lineWidth(1).stroke();
      
      doc.fontSize(10).font('Helvetica').fillColor('#334155');
      doc.text('STUDENT NAME: ________________________', 65, boxY + 12);
      doc.text('ROLL NO: ____________', 310, boxY + 12);
      doc.text('SEC: ______', 470, boxY + 12);
      
      // Reset doc coordinates below the box
      doc.y = boxY + 35;
      doc.moveDown(1.2);

      // 4. Instructions Section
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text('GENERAL INSTRUCTIONS:');
      doc.fontSize(9.5).font('Helvetica-Oblique').fillColor('#475569');
      
      const defaultInst = '1. Read all questions carefully before answering.\n2. Write your answers neatly in the space provided.\n3. Verify all code syntax or reasoning steps where requested.';
      const instructions = assignment.additionalInstructions 
        ? `${assignment.additionalInstructions}\n${defaultInst}` 
        : defaultInst;
        
      doc.text(instructions, { lineGap: 3 });
      doc.moveDown(1.5);

      // Divider Line
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#94a3b8').lineWidth(0.5).stroke();
      doc.moveDown(1.5);

      // 5. Render Sections and Questions
      assignment.sections.forEach((section, sIndex) => {
        // Prevent layout split of section header if near page end
        if (doc.y > 700) {
          doc.addPage();
        }

        doc.fontSize(13).font('Helvetica-Bold').fillColor('#1e3a8a').text(section.title.toUpperCase());
        doc.fontSize(9.5).font('Helvetica-Oblique').fillColor('#475569').text(section.instruction);
        doc.moveDown(0.8);

        section.questions.forEach((q, qIndex) => {
          // Prevent question split
          if (doc.y > 710) {
            doc.addPage();
          }

          const qNum = `${qIndex + 1}. `;
          const difficultyLabel = `[${q.difficulty}]`;
          const marksLabel = `[${q.marks} Mark${q.marks > 1 ? 's' : ''}]`;
          
          // Question text
          doc.fontSize(10.5).font('Helvetica').fillColor('#0f172a');
          
          // Render question text. Align marks to the right margin
          const qTextY = doc.y;
          doc.text(`${qNum}${q.text}`, 50, qTextY, {
            width: 390,
            lineGap: 2
          });
          
          // Render difficulty badge and marks aligned right
          doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#059669'); // Green for Easy by default
          if (q.difficulty === 'Moderate') doc.fillColor('#d97706'); // Amber
          if (q.difficulty === 'Hard') doc.fillColor('#dc2626'); // Red
          
          doc.text(difficultyLabel, 445, qTextY, { width: 50, align: 'right' });
          
          doc.font('Helvetica-Bold').fillColor('#475569');
          doc.text(marksLabel, 495, qTextY, { width: 50, align: 'right' });
          
          // Update doc Y to the max height between question text and side labels
          const finalY = doc.y;
          doc.y = Math.max(finalY, qTextY) + 6;

          // Render options if MCQ
          if (q.options && q.options.length > 0) {
            q.options.forEach((opt, oIndex) => {
              if (doc.y > 750) {
                doc.addPage();
              }
              const label = String.fromCharCode(97 + oIndex); // a, b, c, d
              doc.fontSize(10).font('Helvetica').fillColor('#334155').text(`    (${label})  ${opt}`, 65, doc.y, {
                lineGap: 1
              });
            });
            doc.y += 6;
          }

          doc.y += 8; // Spacer between questions
        });

        doc.y += 15; // Spacer between sections
      });

      doc.end();

      writeStream.on('finish', () => {
        resolve(`/uploads/${fileName}`);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};
