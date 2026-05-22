'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  ArrowLeft, 
  Sparkles, 
  TrendingUp, 
  GraduationCap, 
  ChevronRight, 
  BookOpen, 
  Calendar,
  X,
  UserPlus,
  Trash2
} from 'lucide-react';
import { useAssignmentStore } from '../../store/useAssignmentStore';

interface Student {
  rollNo: string;
  name: string;
  avgScore: number;
  attendance: string;
  grade: string;
  color: string;
}

interface GroupClass {
  id: string;
  name: string;
  subject: string;
  studentCount: number;
  avgScore: number;
  term: string;
  students: Student[];
}

const INITIAL_GROUPS: GroupClass[] = [
  {
    id: 'g1',
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
    id: 'g2',
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
    id: 'g3',
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
    id: 'g4',
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

export default function GroupsPage() {
  const { groups, fetchGroups, createGroup, deleteGroup, setToastMessage } = useAssignmentStore();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  
  // Create Group Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupSubject, setNewGroupSubject] = useState('Physics');
  const [newGroupTerm, setNewGroupTerm] = useState('Term 1');
  const [newGroupCapacity, setNewGroupCapacity] = useState('25');

  // Search inside Roster
  const [rosterSearch, setRosterSearch] = useState('');

  React.useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const activeGroup = groups.find(g => g._id === selectedGroupId);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      alert("Please enter a valid class/group name.");
      return;
    }

    try {
      await createGroup({
        name: newGroupName,
        subject: newGroupSubject,
        studentCount: parseInt(newGroupCapacity) || 0,
        term: newGroupTerm
      });
      setNewGroupName('');
      setIsModalOpen(false);
      setToastMessage(`Group "${newGroupName}" successfully created!`);
    } catch (err) {
      console.error(err);
      alert("Failed to create classroom group.");
    }
  };

  const filteredStudents = activeGroup
    ? activeGroup.students.filter(s => s.name.toLowerCase().includes(rosterSearch.toLowerCase()) || s.rollNo.toLowerCase().includes(rosterSearch.toLowerCase()))
    : [];

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto w-full flex flex-col font-sans animate-fadeIn">
      
      {!activeGroup ? (
        /* ==================== GROUPS PORTAL DASHBOARD ==================== */
        <div className="flex-1 flex flex-col">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-slate-500 text-sm font-semibold">Manage your class groups and review student performance rosters.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#1A1A1A] hover:bg-black text-white font-extrabold text-xs py-3 px-5 rounded-full flex items-center gap-2 transition brand-btn-glow cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Create Group
            </button>
          </div>

          {/* Group Classes Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {groups.map(group => (
              <div
                key={group._id}
                onClick={() => setSelectedGroupId(group._id)}
                className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition cursor-pointer flex flex-col justify-between group min-h-[200px]"
              >
                <div>
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{group.subject}</span>
                      <h3 className="text-xl font-black font-outfit text-brand-dark mt-0.5 group-hover:text-[#E05058] transition truncate">
                        {group.name}
                      </h3>
                    </div>
                    <span className="text-[9px] font-black bg-rose-50 text-[#E05058] border border-[#FECDD3] px-2.5 py-0.5 rounded-full">
                      {group.term}
                    </span>
                  </div>

                  {/* Class quick metrics */}
                  <div className="grid grid-cols-2 gap-4 my-2">
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Students</p>
                        <p className="text-sm font-black text-brand-dark mt-1">{group.studentCount} Students</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center gap-2.5">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Class Average</p>
                        <p className="text-sm font-black text-brand-dark mt-1">{group.avgScore}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-4">
                  <span className="text-[10px] font-black text-[#E05058] flex items-center gap-0.5 uppercase tracking-wider">
                    View Student Roster
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete the group "${group.name}"?`)) {
                          try {
                            await deleteGroup(group._id);
                            setToastMessage(`Group "${group.name}" deleted successfully.`);
                          } catch (err: any) {
                            alert(err.message || "Failed to delete group.");
                          }
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-primary hover:bg-rose-50 transition cursor-pointer"
                      title="Delete Group"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#E05058] transition transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ==================== DETAILED CLASS ROSTER VIEW ==================== */
        <div className="flex-1 flex flex-col">
          {/* Back button and Class title */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => {
                setSelectedGroupId(null);
                setRosterSearch('');
              }}
              className="w-9 h-9 rounded-full border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 transition cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-4.5 h-4.5 stroke-[2.5]" />
            </button>
            <div>
              <span className="text-[10px] font-black text-[#E05058] uppercase tracking-wider">{activeGroup.subject} • {activeGroup.term}</span>
              <h2 className="text-2xl font-black font-outfit text-brand-dark mt-0.5">{activeGroup.name} Roster</h2>
            </div>
          </div>

          {/* Quick Roster Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-rose-50 text-[#E05058] rounded-2xl">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Pupils</p>
                <h4 className="text-lg font-black font-outfit text-brand-dark">{activeGroup.students.length} Registered</h4>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Score</p>
                <h4 className="text-lg font-black font-outfit text-brand-dark">{activeGroup.avgScore}%</h4>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Academic Term</p>
                <h4 className="text-lg font-black font-outfit text-brand-dark">{activeGroup.term}</h4>
              </div>
            </div>
          </div>

          {/* Roster Search Bar */}
          <div className="flex items-center gap-3 bg-white border border-slate-200/80 rounded-full p-2.5 mb-6 shadow-sm relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={rosterSearch}
              onChange={(e) => setRosterSearch(e.target.value)}
              placeholder="Search student name or roll number"
              className="w-full bg-transparent pl-8 pr-3 text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Roster Student Table */}
          <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Student Details</th>
                    <th className="px-6 py-4">Roll Number</th>
                    <th className="px-6 py-4">Avg. Score</th>
                    <th className="px-6 py-4">Attendance</th>
                    <th className="px-6 py-4 text-right">Performance Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-400 font-bold">
                        No students found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, idx) => (
                      <tr key={student.rollNo} className="hover:bg-slate-50/30 transition">
                        {/* Profile Info */}
                        <td className="px-6 py-4.5 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${student.color} flex items-center justify-center text-white font-extrabold text-[10px]`}>
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-xs font-black text-brand-dark">{student.name}</p>
                            <p className="text-[9px] text-slate-400 mt-0.5 font-bold">Enrolled Class 10</p>
                          </div>
                        </td>
                        
                        {/* Roll Number */}
                        <td className="px-6 py-4.5 font-mono text-[11px] font-bold text-slate-500">
                          {student.rollNo}
                        </td>

                        {/* Average Score */}
                        <td className="px-6 py-4.5 font-black text-brand-dark">
                          {student.avgScore}%
                        </td>

                        {/* Attendance rate */}
                        <td className="px-6 py-4.5 text-slate-500 font-bold">
                          {student.attendance}
                        </td>

                        {/* Grade pill */}
                        <td className="px-6 py-4.5 text-right">
                          <span className={`inline-block px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            student.grade.startsWith('A') 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                              : student.grade.startsWith('B') 
                              ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {student.grade}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CREATE GROUP MODAL DIALOG ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-float relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-5 pr-8">
              <div className="p-2 bg-rose-50 text-[#E05058] rounded-xl shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black font-outfit text-brand-dark leading-tight">Create Classroom Group</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Register a class group to manage evaluations.</p>
              </div>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-brand-dark uppercase tracking-wider mb-1.5">
                  Classroom Group Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grade 10-B Mathematics"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-primary text-slate-800 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-brand-dark uppercase tracking-wider mb-1.5">
                    Academic Subject
                  </label>
                  <select
                    value={newGroupSubject}
                    onChange={(e) => setNewGroupSubject(e.target.value)}
                    className="w-full bg-white px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-primary text-slate-800 text-xs font-bold"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-brand-dark uppercase tracking-wider mb-1.5">
                    Semester / Term
                  </label>
                  <select
                    value={newGroupTerm}
                    onChange={(e) => setNewGroupTerm(e.target.value)}
                    className="w-full bg-white px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-primary text-slate-800 text-xs font-bold"
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-brand-dark uppercase tracking-wider mb-1.5">
                  Class Capacity (Pupil Count)
                </label>
                <input
                  type="number"
                  required
                  min="5"
                  max="60"
                  value={newGroupCapacity}
                  onChange={(e) => setNewGroupCapacity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-primary text-slate-800 text-xs font-semibold"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-extrabold text-[11px] rounded-full uppercase tracking-wider hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#1A1A1A] hover:bg-black text-white font-extrabold text-[11px] rounded-full uppercase tracking-wider transition cursor-pointer"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
