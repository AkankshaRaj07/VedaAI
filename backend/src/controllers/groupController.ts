import { Request, Response } from 'express';
import Group from '../models/Group';

const INITIAL_GROUPS = [
  {
    name: 'Grade 10-A Physics',
    subject: 'Physics',
    studentCount: 28,
    avgScore: 81.2,
    term: 'Term 1',
    students: [
      { rollNo: 'PH-101', name: 'Aarav Sharma', avgScore: 88, attendance: '95%', grade: 'A', color: 'from-orange-400 to-rose-400' },
      { rollNo: 'PH-102', name: 'Ananya Goel', avgScore: 92, attendance: '98%', grade: 'A+', color: 'from-pink-500 to-rose-500' },
      { rollNo: 'PH-103', name: 'Kabir Verma', avgScore: 76, attendance: '88%', grade: 'B', color: 'from-indigo-400 to-cyan-400' },
      { rollNo: 'PH-104', name: 'Meera Iyer', avgScore: 84, attendance: '92%', grade: 'A', color: 'from-emerald-400 to-teal-400' },
      { rollNo: 'PH-105', name: 'Rohan Sen', avgScore: 68, attendance: '82%', grade: 'C', color: 'from-amber-400 to-orange-400' },
      { rollNo: 'PH-106', name: 'Siddharth Roy', avgScore: 80, attendance: '90%', grade: 'B+', color: 'from-violet-400 to-purple-400' },
    ]
  },
  {
    name: 'Grade 9-B Physics',
    subject: 'Physics',
    studentCount: 24,
    avgScore: 74.8,
    term: 'Term 1',
    students: [
      { rollNo: 'PH-901', name: 'Aditya Das', avgScore: 78, attendance: '91%', grade: 'B+', color: 'from-blue-400 to-indigo-400' },
      { rollNo: 'PH-902', name: 'Diya Malhotra', avgScore: 85, attendance: '94%', grade: 'A', color: 'from-pink-400 to-rose-400' },
      { rollNo: 'PH-903', name: 'Ishaan Nair', avgScore: 62, attendance: '80%', grade: 'D', color: 'from-yellow-400 to-amber-400' },
      { rollNo: 'PH-904', name: 'Nikita Rao', avgScore: 89, attendance: '96%', grade: 'A', color: 'from-teal-400 to-emerald-400' },
      { rollNo: 'PH-905', name: 'Pranav Joshi', avgScore: 60, attendance: '78%', grade: 'D', color: 'from-rose-400 to-orange-400' },
    ]
  },
  {
    name: 'Grade 11-A Chemistry',
    subject: 'Chemistry',
    studentCount: 18,
    avgScore: 86.5,
    term: 'Semester 1',
    students: [
      { rollNo: 'CH-111', name: 'Aryan Mehta', avgScore: 94, attendance: '97%', grade: 'A+', color: 'from-violet-500 to-fuchsia-500' },
      { rollNo: 'CH-112', name: 'Kriti Kapoor', avgScore: 89, attendance: '93%', grade: 'A', color: 'from-pink-400 to-rose-400' },
      { rollNo: 'CH-113', name: 'Riya Saxena', avgScore: 81, attendance: '90%', grade: 'B+', color: 'from-emerald-400 to-teal-400' },
      { rollNo: 'CH-114', name: 'Yash Gupta', avgScore: 82, attendance: '91%', grade: 'B+', color: 'from-cyan-400 to-blue-400' },
    ]
  },
  {
    name: 'Grade 12-C Biology',
    subject: 'Biology',
    studentCount: 32,
    avgScore: 79.1,
    term: 'Semester 1',
    students: [
      { rollNo: 'BI-201', name: 'Deepika Padukone', avgScore: 85, attendance: '92%', grade: 'A', color: 'from-rose-400 to-red-400' },
      { rollNo: 'BI-202', name: 'Hrithik Roshan', avgScore: 78, attendance: '88%', grade: 'B+', color: 'from-amber-400 to-yellow-400' },
      { rollNo: 'BI-203', name: 'Ranbir Kapoor', avgScore: 73, attendance: '85%', grade: 'B', color: 'from-blue-400 to-indigo-400' },
      { rollNo: 'BI-204', name: 'Katrina Kaif', avgScore: 80, attendance: '89%', grade: 'B+', color: 'from-teal-400 to-cyan-400' },
    ]
  }
];

export const listGroups = async (req: Request, res: Response): Promise<void> => {
  try {
    let groups = await Group.find().sort({ createdAt: -1 });
    if (groups.length === 0) {
      console.log('Seeding initial class groups database...');
      await Group.insertMany(INITIAL_GROUPS);
      groups = await Group.find().sort({ createdAt: -1 });
    }
    res.json(groups);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to list classroom groups' });
  }
};

export const createGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, subject, studentCount, term, students } = req.body;
    if (!name || !subject) {
      res.status(400).json({ error: 'Name and Subject are required fields.' });
      return;
    }

    const defaultStudents = students || [
      { rollNo: 'NEW-001', name: 'Alice Smith', avgScore: 82, attendance: '95%', grade: 'A', color: 'from-emerald-400 to-teal-400' },
      { rollNo: 'NEW-002', name: 'Bob Johnson', avgScore: 71, attendance: '89%', grade: 'B', color: 'from-orange-400 to-rose-400' },
    ];

    const newGroup = new Group({
      name,
      subject,
      studentCount: studentCount || defaultStudents.length,
      avgScore: 75.0,
      term: term || 'Term 1',
      students: defaultStudents
    });

    const savedGroup = await newGroup.save();
    res.status(201).json(savedGroup);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create classroom group' });
  }
};

export const deleteGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await Group.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ error: 'Classroom group not found.' });
      return;
    }
    res.json({ message: 'Classroom group deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete classroom group' });
  }
};
