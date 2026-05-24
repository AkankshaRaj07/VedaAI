import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface IQuestion {
  _id?: string;
  text: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  marks: number;
  options?: string[];
  correctAnswer?: string;
}

export interface ISection {
  _id?: string;
  title: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IAssignment {
  _id: string;
  title: string;
  subject: string;
  classLevel: string;
  schoolName?: string;
  dueDate: string;
  questionTypes: string[];
  numQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  fileUrl?: string;
  fileName?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  sections: ISection[];
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISubmissionAnswer {
  _id?: string;
  questionId: string;
  questionText: string;
  studentAnswer: string;
  correctAnswer?: string;
  marksObtained: number;
  maxMarks: number;
  feedback?: string;
}

export interface ISubmission {
  _id: string;
  assignmentId: string;
  studentName: string;
  rollNumber: string;
  section?: string;
  answers: ISubmissionAnswer[];
  totalScore: number;
  totalMaxMarks: number;
  status: 'pending' | 'graded' | 'failed';
  gradedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IStudent {
  rollNo: string;
  name: string;
  avgScore: number;
  attendance: string;
  grade: string;
  color: string;
}

export interface IGroup {
  _id: string;
  id?: string;
  name: string;
  subject: string;
  studentCount: number;
  avgScore: number;
  term: string;
  students: IStudent[];
  createdAt: string;
  updatedAt: string;
}

export interface ILibraryItem {
  _id: string;
  id?: string;
  name: string;
  size: string;
  category: string;
  groundingCount: number;
  fileUrl: string;
  uploadedAt: string;
}

export interface IDashboardTask {
  _id: string;
  id?: string;
  title: string;
  time: string;
  class: string;
  completed: boolean;
  order?: number;
}

export interface IDashboardStats {
  totalAssignments: number;
  totalSubmissions: number;
  classAverage: number;
  submissionAttempts: number;
  submissionTarget: number;
}

interface AssignmentState {
  assignments: IAssignment[];
  activeAssignment: IAssignment | null;
  loading: boolean;
  jobProgress: number;
  jobStatus: 'idle' | 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage: string | null;
  sidebarOpen: boolean;
  viewState: 'list' | 'create';
  toastMessage: string | null;
  buildingModalOpen: boolean;
  
  // Submissions states
  submissions: ISubmission[];
  activeSubmission: ISubmission | null;
  submittingQuiz: boolean;
  gradingQuiz: boolean;

  // New States for Groups, Library, Dashboard, Toolkit
  groups: IGroup[];
  libraryMaterials: ILibraryItem[];
  dashboardStats: IDashboardStats | null;
  dashboardTasks: IDashboardTask[];
  
  // Actions
  setAssignments: (assignments: IAssignment[]) => void;
  setActiveAssignment: (assignment: IAssignment | null) => void;
  setJobProgress: (progress: number) => void;
  setJobStatus: (status: 'idle' | 'pending' | 'processing' | 'completed' | 'failed') => void;
  setErrorMessage: (msg: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  setViewState: (view: 'list' | 'create') => void;
  setToastMessage: (msg: string | null) => void;
  setBuildingModalOpen: (open: boolean) => void;
  setSubmissions: (submissions: ISubmission[]) => void;
  setActiveSubmission: (submission: ISubmission | null) => void;
  
  userName: string;
  setUserName: (name: string) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  userAvatar: string | null;
  setUserAvatar: (avatar: string | null) => void;
  
  schoolName: string;
  setSchoolName: (name: string) => void;
  schoolLocation: string;
  setSchoolLocation: (location: string) => void;
  schoolAvatar: string | null;
  setSchoolAvatar: (avatar: string | null) => void;
  
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  
  // Async API Calls
  fetchAssignments: () => Promise<void>;
  fetchAssignmentDetails: (id: string) => Promise<IAssignment>;
  submitAssignmentForm: (formData: FormData) => Promise<IAssignment>;
  regenerateAssignment: (id: string) => Promise<void>;
  updateAssignmentDetails: (id: string, payload: { title?: string; dueDate?: string; sections: ISection[] }) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  
  // Submissions async actions
  fetchSubmissions: (assignmentId: string) => Promise<ISubmission[]>;
  fetchSubmissionDetails: (id: string) => Promise<ISubmission>;
  submitQuiz: (payload: {
    assignmentId: string;
    studentName: string;
    rollNumber: string;
    section?: string;
    answers: {
      questionId: string;
      questionText: string;
      studentAnswer: string;
      correctAnswer?: string;
      maxMarks: number;
    }[];
  }) => Promise<ISubmission>;
  gradeSubmission: (id: string) => Promise<ISubmission>;

  // New Async Actions
  fetchGroups: () => Promise<void>;
  createGroup: (payload: { name: string; subject: string; studentCount: number; term: string }) => Promise<IGroup>;
  deleteGroup: (id: string) => Promise<void>;

  fetchLibrary: () => Promise<void>;
  uploadLibraryMaterial: (formData: FormData) => Promise<ILibraryItem>;
  deleteLibraryMaterial: (id: string) => Promise<void>;

  generateToolkitContent: (toolType: 'lesson_plan' | 'question_bank' | 'feedback', payload: any) => Promise<string>;

  fetchDashboardStats: () => Promise<void>;
  fetchDashboardTasks: () => Promise<void>;
  addDashboardTask: (payload: { title: string; time: string; class: string }) => Promise<void>;
  toggleDashboardTask: (id: string) => Promise<void>;
  deleteDashboardTask: (id: string) => Promise<void>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const useAssignmentStore = create<AssignmentState>()(
  persist(
    (set, get) => ({
      assignments: [],
      activeAssignment: null,
      loading: false,
      jobProgress: 0,
      jobStatus: 'idle',
      errorMessage: null,
      sidebarOpen: false,
      viewState: 'list',
      toastMessage: null,
      buildingModalOpen: false,
      
      submissions: [],
      activeSubmission: null,
      submittingQuiz: false,
      gradingQuiz: false,

      groups: [],
      libraryMaterials: [],
      dashboardStats: null,
      dashboardTasks: [],

      setAssignments: (assignments) => set({ assignments }),
      setActiveAssignment: (activeAssignment) => set({ activeAssignment }),
      setJobProgress: (jobProgress) => set({ jobProgress }),
      setJobStatus: (jobStatus) => set({ jobStatus }),
      setErrorMessage: (errorMessage) => set({ errorMessage }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setViewState: (viewState) => set({ viewState }),
      setToastMessage: (toastMessage) => set({ toastMessage }),
      setBuildingModalOpen: (buildingModalOpen) => set({ buildingModalOpen }),
      setSubmissions: (submissions) => set({ submissions }),
      setActiveSubmission: (activeSubmission) => set({ activeSubmission }),

      userName: 'John Doe',
      setUserName: (userName) => set({ userName }),
      userEmail: 'john.doe@delhipublicschool.edu',
      setUserEmail: (userEmail) => set({ userEmail }),
      userAvatar: null,
      setUserAvatar: (userAvatar) => set({ userAvatar }),
      
      schoolName: 'Delhi Public School',
      setSchoolName: (schoolName) => set({ schoolName }),
      schoolLocation: 'Bokaro Steel City',
      setSchoolLocation: (schoolLocation) => set({ schoolLocation }),
      schoolAvatar: null,
      setSchoolAvatar: (schoolAvatar) => set({ schoolAvatar }),

      darkMode: false,
      setDarkMode: (darkMode) => {
        set({ darkMode });
        if (typeof window !== 'undefined') {
          if (darkMode) document.documentElement.classList.add('dark');
          else document.documentElement.classList.remove('dark');
        }
      },

      fetchAssignments: async () => {
        set({ loading: true, errorMessage: null });
        try {
          const res = await fetch(`${API_BASE_URL}/assignments`);
          if (!res.ok) throw new Error('Failed to fetch assignments list.');
          const data = await res.json();
          set({ assignments: data, loading: false });
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error fetching assignments';
          set({ errorMessage: msg, loading: false });
        }
      },

      fetchAssignmentDetails: async (id) => {
        set({ loading: true, errorMessage: null });
        try {
          const res = await fetch(`${API_BASE_URL}/assignments/${id}`);
          if (!res.ok) throw new Error('Failed to fetch assignment details.');
          const data = await res.json() as IAssignment;
          set({ activeAssignment: data, jobStatus: data.status, loading: false });
          return data;
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error fetching assignment';
          set({ errorMessage: msg, loading: false });
          throw err;
        }
      },

      submitAssignmentForm: async (formData) => {
        set({ loading: true, errorMessage: null, jobProgress: 0, jobStatus: 'pending' });
        try {
          const res = await fetch(`${API_BASE_URL}/assignments`, {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Failed to submit assignment creation form.');
          }

          const data = await res.json() as IAssignment;
          set({ activeAssignment: data, jobStatus: 'pending', loading: false });
          return data;
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error submitting assignment form';
          set({ 
            errorMessage: msg, 
            jobStatus: 'failed',
            loading: false 
          });
          throw err;
        }
      },

      regenerateAssignment: async (id) => {
        set({ jobProgress: 0, jobStatus: 'pending', errorMessage: null });
        try {
          const res = await fetch(`${API_BASE_URL}/assignments/${id}/regenerate`, {
            method: 'POST',
          });
          if (!res.ok) throw new Error('Failed to request paper regeneration.');
          const data = await res.json() as IAssignment;
          set({ activeAssignment: data, jobStatus: 'pending' });
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error regenerating assignment';
          set({ errorMessage: msg, jobStatus: 'failed' });
          throw err;
        }
      },

      updateAssignmentDetails: async (id, payload) => {
        set({ loading: true, errorMessage: null });
        try {
          const res = await fetch(`${API_BASE_URL}/assignments/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          if (!res.ok) throw new Error('Failed to update assignment contents.');
          const data = await res.json() as IAssignment;
          set({ activeAssignment: data, jobStatus: 'processing', jobProgress: 75, loading: false });
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error saving edits';
          set({ errorMessage: msg, loading: false });
          throw err;
        }
      },

      deleteAssignment: async (id) => {
        set({ loading: true, errorMessage: null });
        try {
          const res = await fetch(`${API_BASE_URL}/assignments/${id}`, {
            method: 'DELETE',
          });
          if (!res.ok) throw new Error('Failed to delete assignment.');
          
          const { assignments } = get();
          set({ 
            assignments: assignments.filter(asg => asg._id !== id),
            loading: false 
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error deleting assignment';
          set({ errorMessage: msg, loading: false });
          throw err;
        }
      },

      fetchSubmissions: async (assignmentId) => {
        set({ loading: true, errorMessage: null });
        try {
          const res = await fetch(`${API_BASE_URL}/submissions/assignment/${assignmentId}`);
          if (!res.ok) throw new Error('Failed to fetch submissions list.');
          const data = await res.json() as ISubmission[];
          set({ submissions: data, loading: false });
          return data;
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error fetching submissions';
          set({ errorMessage: msg, loading: false });
          throw err;
        }
      },

      fetchSubmissionDetails: async (id) => {
        set({ loading: true, errorMessage: null });
        try {
          const res = await fetch(`${API_BASE_URL}/submissions/${id}`);
          if (!res.ok) throw new Error('Failed to fetch submission details.');
          const data = await res.json() as ISubmission;
          set({ activeSubmission: data, loading: false });
          return data;
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error fetching submission details';
          set({ errorMessage: msg, loading: false });
          throw err;
        }
      },

      submitQuiz: async (payload) => {
        set({ submittingQuiz: true, errorMessage: null });
        try {
          const res = await fetch(`${API_BASE_URL}/submissions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Failed to submit quiz answers.');
          }

          const data = await res.json() as ISubmission;
          set({ activeSubmission: data });

          // Automatically trigger grading immediately
          const gradedData = await get().gradeSubmission(data._id);
          set({ submittingQuiz: false });
          return gradedData;
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error submitting quiz answers';
          set({ errorMessage: msg, submittingQuiz: false });
          throw err;
        }
      },

      gradeSubmission: async (id) => {
        set({ gradingQuiz: true, errorMessage: null });
        try {
          const res = await fetch(`${API_BASE_URL}/submissions/${id}/grade`, {
            method: 'POST',
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Failed to grade submission.');
          }

          const data = await res.json() as ISubmission;
          set({ activeSubmission: data, gradingQuiz: false });
          return data;
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error auto-grading submission';
          set({ errorMessage: msg, gradingQuiz: false });
          throw err;
        }
      },

      fetchGroups: async () => {
        set({ loading: true, errorMessage: null });
        try {
          const res = await fetch(`${API_BASE_URL}/groups`);
          if (!res.ok) throw new Error('Failed to fetch groups.');
          const data = await res.json();
          set({ groups: data, loading: false });
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error fetching groups';
          set({ errorMessage: msg, loading: false });
        }
      },

      createGroup: async (payload) => {
        set({ loading: true, errorMessage: null });
        try {
          const res = await fetch(`${API_BASE_URL}/groups`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error('Failed to create group.');
          const data = await res.json();
          const { groups } = get();
          set({ groups: [data, ...groups], loading: false });
          return data;
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error creating group';
          set({ errorMessage: msg, loading: false });
          throw err;
        }
      },

      deleteGroup: async (id) => {
        set({ loading: true, errorMessage: null });
        try {
          const res = await fetch(`${API_BASE_URL}/groups/${id}`, {
            method: 'DELETE',
          });
          if (!res.ok) throw new Error('Failed to delete group.');
          const { groups } = get();
          set({ groups: groups.filter(g => g._id !== id), loading: false });
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error deleting group';
          set({ errorMessage: msg, loading: false });
          throw err;
        }
      },

      fetchLibrary: async () => {
        set({ loading: true, errorMessage: null });
        try {
          const res = await fetch(`${API_BASE_URL}/library`);
          if (!res.ok) throw new Error('Failed to fetch reference library materials.');
          const data = await res.json();
          set({ libraryMaterials: data, loading: false });
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error fetching library materials';
          set({ errorMessage: msg, loading: false });
        }
      },

      uploadLibraryMaterial: async (formData) => {
        set({ loading: true, errorMessage: null });
        try {
          const res = await fetch(`${API_BASE_URL}/library/upload`, {
            method: 'POST',
            body: formData,
          });
          if (!res.ok) throw new Error('Failed to upload library material.');
          const data = await res.json();
          const { libraryMaterials } = get();
          set({ libraryMaterials: [data, ...libraryMaterials], loading: false });
          return data;
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error uploading library material';
          set({ errorMessage: msg, loading: false });
          throw err;
        }
      },

      deleteLibraryMaterial: async (id) => {
        set({ loading: true, errorMessage: null });
        try {
          const res = await fetch(`${API_BASE_URL}/library/${id}`, {
            method: 'DELETE',
          });
          if (!res.ok) throw new Error('Failed to delete library material.');
          const { libraryMaterials } = get();
          set({ libraryMaterials: libraryMaterials.filter(m => m._id !== id), loading: false });
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error deleting library material';
          set({ errorMessage: msg, loading: false });
          throw err;
        }
      },

      generateToolkitContent: async (toolType, payload) => {
        set({ loading: true, errorMessage: null });
        try {
          const endpoint = `${API_BASE_URL}/toolkit/${toolType === 'lesson_plan' ? 'lesson-plan' : toolType === 'question_bank' ? 'question-bank' : 'feedback'}`;
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error('Failed to generate toolkit content.');
          const data = await res.json();
          set({ loading: false });
          return data.output;
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error generating toolkit content';
          set({ errorMessage: msg, loading: false });
          throw err;
        }
      },

      fetchDashboardStats: async () => {
        set({ loading: true, errorMessage: null });
        try {
          const res = await fetch(`${API_BASE_URL}/dashboard/stats`);
          if (!res.ok) throw new Error('Failed to fetch dashboard statistics.');
          const data = await res.json();
          set({ dashboardStats: data, loading: false });
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error fetching stats';
          set({ errorMessage: msg, loading: false });
        }
      },

      fetchDashboardTasks: async () => {
        set({ loading: true, errorMessage: null });
        try {
          const res = await fetch(`${API_BASE_URL}/dashboard/tasks`);
          if (!res.ok) throw new Error('Failed to fetch tasks checklist.');
          const data = await res.json();
          set({ dashboardTasks: data, loading: false });
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error fetching tasks';
          set({ errorMessage: msg, loading: false });
        }
      },

      addDashboardTask: async (payload) => {
        set({ loading: true, errorMessage: null });
        try {
          const res = await fetch(`${API_BASE_URL}/dashboard/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error('Failed to create task.');
          const data = await res.json();
          const { dashboardTasks } = get();
          set({ dashboardTasks: [...dashboardTasks, data], loading: false });
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error adding task';
          set({ errorMessage: msg, loading: false });
          throw err;
        }
      },

      toggleDashboardTask: async (id) => {
        try {
          const res = await fetch(`${API_BASE_URL}/dashboard/tasks/${id}/toggle`, {
            method: 'PUT',
          });
          if (!res.ok) throw new Error('Failed to toggle task.');
          const data = await res.json();
          const { dashboardTasks } = get();
          set({
            dashboardTasks: dashboardTasks.map(t => t._id === id ? data : t)
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error toggling task';
          set({ errorMessage: msg });
          throw err;
        }
      },

      deleteDashboardTask: async (id) => {
        try {
          const res = await fetch(`${API_BASE_URL}/dashboard/tasks/${id}`, {
            method: 'DELETE',
          });
          if (!res.ok) throw new Error('Failed to delete task.');
          const { dashboardTasks } = get();
          set({
            dashboardTasks: dashboardTasks.filter(t => t._id !== id)
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error deleting task';
          set({ errorMessage: msg });
          throw err;
        }
      }
    }),
    {
      name: 'vedaai-settings',
      partialize: (state) => ({
        userName: state.userName,
        userEmail: state.userEmail,
        userAvatar: state.userAvatar,
        schoolName: state.schoolName,
        schoolLocation: state.schoolLocation,
        schoolAvatar: state.schoolAvatar,
        darkMode: state.darkMode
      }),
    }
  )
);

