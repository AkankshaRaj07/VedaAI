import { create } from 'zustand';

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
  
  // Actions
  setAssignments: (assignments: IAssignment[]) => void;
  setActiveAssignment: (assignment: IAssignment | null) => void;
  setJobProgress: (progress: number) => void;
  setJobStatus: (status: 'idle' | 'pending' | 'processing' | 'completed' | 'failed') => void;
  setErrorMessage: (msg: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  setViewState: (view: 'list' | 'create') => void;
  setToastMessage: (msg: string | null) => void;
  
  // Async API Calls
  fetchAssignments: () => Promise<void>;
  fetchAssignmentDetails: (id: string) => Promise<IAssignment>;
  submitAssignmentForm: (formData: FormData) => Promise<IAssignment>;
  regenerateAssignment: (id: string) => Promise<void>;
  updateAssignmentDetails: (id: string, payload: { title?: string; dueDate?: string; sections: ISection[] }) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const useAssignmentStore = create<AssignmentState>((set, get) => ({
  assignments: [],
  activeAssignment: null,
  loading: false,
  jobProgress: 0,
  jobStatus: 'idle',
  errorMessage: null,
  sidebarOpen: false,
  viewState: 'list',
  toastMessage: null,

  setAssignments: (assignments) => set({ assignments }),
  setActiveAssignment: (activeAssignment) => set({ activeAssignment }),
  setJobProgress: (jobProgress) => set({ jobProgress }),
  setJobStatus: (jobStatus) => set({ jobStatus }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setViewState: (viewState) => set({ viewState }),
  setToastMessage: (toastMessage) => set({ toastMessage }),

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
  }
}));
