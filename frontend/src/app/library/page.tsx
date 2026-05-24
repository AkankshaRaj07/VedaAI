'use client';

import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Search, 
  UploadCloud, 
  FileText, 
  Trash2, 
  Sparkles, 
  Database,
  Filter,
  CheckCircle,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { useAssignmentStore } from '../../store/useAssignmentStore';

const CATEGORIES = ['All Materials', 'Textbooks', 'Past Exams', 'School Guidelines'];

export default function LibraryPage() {
  const { 
    libraryMaterials, 
    fetchLibrary, 
    uploadLibraryMaterial, 
    deleteLibraryMaterial, 
    setToastMessage,
    setBuildingModalOpen,
    loading 
  } = useAssignmentStore();

  const [selectedCategory, setSelectedCategory] = useState('All Materials');
  const [searchQuery, setSearchQuery] = useState('');
  const BACKEND_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{isOpen: boolean, id: string, name: string}>({isOpen: false, id: '', name: ''});

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  // File Upload Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      addUploadedFile(e.target.files[0]);
    }
  };

  const addUploadedFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', selectedCategory === 'All Materials' ? 'Textbooks' : selectedCategory);
      
      await uploadLibraryMaterial(formData);
      setToastMessage(`File "${file.name}" uploaded to VedaAI library!`);
    } catch (err: any) {
      setToastMessage(`Failed to upload file: ${err.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteItem = (id: string, name: string) => {
    setDeleteConfirmDialog({ isOpen: true, id, name });
  };

  const confirmDelete = async () => {
    try {
      await deleteLibraryMaterial(deleteConfirmDialog.id);
      setToastMessage("Reference document removed.");
    } catch (err: any) {
      setToastMessage(`Failed to delete document: ${err.message || 'Unknown error'}`);
    } finally {
      setDeleteConfirmDialog({ isOpen: false, id: '', name: '' });
    }
  };

  // Filter computation
  const filteredMaterials = libraryMaterials.filter(item => {
    const matchesCategory = selectedCategory === 'All Materials' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate total size
  const calculateTotalSizeMB = () => {
    let total = 0;
    libraryMaterials.forEach(item => {
      const sizeStr = item.size.toLowerCase();
      if (sizeStr.includes('mb')) {
        total += parseFloat(sizeStr);
      } else if (sizeStr.includes('kb')) {
        total += parseFloat(sizeStr) / 1024;
      }
    });
    return total.toFixed(1);
  };

  const totalUsedMB = calculateTotalSizeMB();
  const limitMB = 100;
  const usedPercentage = Math.min(100, (parseFloat(totalUsedMB) / limitMB) * 100).toFixed(1);

  return (
    <div className="flex-1 pb-8 w-full flex flex-col font-sans animate-fadeIn">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 ml-2">
        <div>
          <h1 className="text-3xl font-black font-outfit text-brand-dark dark:text-white tracking-tight leading-none transition-colors">
            Reference <span className="text-[#E05058]">Library</span>
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm font-semibold max-w-3xl transition-colors">
            Upload and manage your curriculum resources. VedaAI uses these materials as an <strong className="text-brand-dark dark:text-white">AI Reference Context</strong> to perfectly tailor generated assignments to your classroom.
          </p>
        </div>
      </div>

      {/* Grid: Left Column (Table list) & Right Column (Upload Drop-zone) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Table & Filtering (Left 8 cols) */}
        <div className="lg:col-span-8 space-y-6 w-full">
          
          {/* Category Tabs & Search Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Horizontal Scrollable Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[10px] sm:text-xs font-black tracking-tight whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat 
                      ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-black' 
                      : 'bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Filter Search */}
            <div className="relative flex items-center bg-white dark:bg-transparent border border-slate-200 dark:border-slate-800 rounded-full px-3 py-1.5 shadow-sm max-w-xs w-full transition-colors">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search reference files..."
                className="w-full bg-transparent pl-7 pr-1 text-xs font-bold text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
              />
            </div>

          </div>

          {/* Library Materials Table List */}
          <div className="bg-white dark:bg-[#111111] border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-wider transition-colors">
                    <th className="px-5 py-4">Document Details</th>
                    <th className="px-5 py-4">Size</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">AI References</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors">
                  {loading && libraryMaterials.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-400 font-bold">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-t-transparent border-[#E05058] rounded-full animate-spin"></div>
                          <span>Loading library materials...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredMaterials.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-400 font-bold">
                        No materials found matching this filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredMaterials.map(doc => (
                      <tr key={doc._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition group">
                        {/* Title & Date */}
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-xl shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 max-w-[240px] sm:max-w-[280px]">
                              <p className="text-[13px] font-black text-brand-dark dark:text-white truncate leading-tight group-hover:text-brand-primary transition-colors">{doc.name}</p>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-0.5 inline-block transition-colors">
                                Uploaded: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-') : 'Recent'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Size */}
                        <td className="px-6 py-6 text-slate-500 dark:text-slate-400 font-bold text-[13px] transition-colors">
                          {doc.size}
                        </td>

                        {/* Category */}
                        <td className="px-6 py-6">
                          <span className="px-3 py-1 rounded text-[10px] font-bold bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-colors">
                            {doc.category}
                          </span>
                        </td>

                        {/* Grounding uses */}
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-3">
                            <span className="font-black text-[13px] text-brand-dark dark:text-white transition-colors">{doc.groundingCount || 0} times</span>
                            {(doc.groundingCount || 0) > 10 && (
                              <span className="px-1.5 py-0.5 text-[8px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 rounded flex items-center gap-0.5 uppercase tracking-wide">
                                <Sparkles className="w-2.5 h-2.5 text-emerald-500 fill-emerald-50" /> Highly Referenced
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-6 text-right">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => setBuildingModalOpen(true)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-brand-dark dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                              title="Preview File"
                            >
                              <ExternalLink className="w-4.5 h-4.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(doc._id, doc.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-brand-primary dark:hover:text-brand-primary hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer"
                              title="Delete File"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* File Drop zone (Right 4 cols) */}
        <div className="lg:col-span-4 w-full">
          <div className="bg-white dark:bg-[#111111] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5 transition-colors">
            
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-5 h-5 text-[#E05058]" />
              <h3 className="text-sm font-black font-outfit text-brand-dark dark:text-white transition-colors">Library Storage Status</h3>
            </div>

            {/* Storage Progress indicator */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide transition-colors">
                <span>{totalUsedMB} MB Used</span>
                <span>{limitMB} MB Limit</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden transition-colors">
                <div 
                  className="bg-[#E05058] h-full rounded-full transition-all duration-300"
                  style={{ width: `${usedPercentage}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold leading-relaxed transition-colors">
                AI reference indexing is faster when textbook file uploads are limited to under 10MB each.
              </p>
            </div>

            <hr className="border-slate-100 dark:border-slate-800 transition-colors" />

            {/* Sleek Dotted Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition flex flex-col items-center justify-center min-h-[220px] ${
                dragActive 
                  ? 'border-[#E05058] bg-[#E05058]/5 animate-pulse' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <input
                type="file"
                id="library-file"
                className="hidden"
                accept=".pdf,.txt,.docx"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <label htmlFor="library-file" className="cursor-pointer flex flex-col items-center justify-center w-full h-full py-4">
                <div className="p-3 bg-rose-50 border border-[#FECDD3] text-[#E05058] rounded-2xl mb-3">
                  {uploading ? (
                    <div className="w-6 h-6 border-2 border-t-transparent border-[#E05058] rounded-full animate-spin"></div>
                  ) : (
                    <UploadCloud className="w-6 h-6" />
                  )}
                </div>
                <h5 className="text-xs font-black text-brand-dark dark:text-white transition-colors">
                  {uploading ? 'Uploading Reference...' : 'Ground Reference Document'}
                </h5>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-[180px] mx-auto font-semibold transition-colors">
                  Drag and drop textbook, syllabus draft, or past exams (.pdf, .txt, .docx)
                </p>
                <span className="mt-4 px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-[10px] rounded-full uppercase tracking-wider transition inline-block">
                  {uploading ? 'Please wait' : 'Upload file'}
                </span>
              </label>
            </div>

          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl transition-colors">
            <h3 className="text-xl font-black font-outfit text-brand-dark dark:text-white mb-2 transition-colors">
              Remove Document
            </h3>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-6 transition-colors">
              Are you sure you want to remove "{deleteConfirmDialog.name}" from the reference library? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmDialog({ isOpen: false, id: '', name: '' })}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#E05058] hover:bg-red-600 shadow-sm transition cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
