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
    loading 
  } = useAssignmentStore();

  const [selectedCategory, setSelectedCategory] = useState('All Materials');
  const [searchQuery, setSearchQuery] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  const handleDeleteItem = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from the reference library?`)) {
      try {
        await deleteLibraryMaterial(id);
        setToastMessage("Reference document removed.");
      } catch (err: any) {
        setToastMessage(`Failed to delete document: ${err.message || 'Unknown error'}`);
      }
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
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto w-full flex flex-col font-sans animate-fadeIn">
      
      {/* Description Header */}
      <p className="text-slate-500 text-sm font-semibold mb-8">
        Store and manage course textbooks, syllabus guidelines, and test papers to serve as grounding material for AI generations.
      </p>

      {/* Grid: Left Column (Table list) & Right Column (Upload Drop-zone) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Table & Filtering (Left 8 cols) */}
        <div className="lg:col-span-8 space-y-6 w-full">
          
          {/* Category Tabs & Search Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Horizontal Scrollable Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-black tracking-tight whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat 
                      ? 'bg-[#1A1A1A] text-white' 
                      : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Filter Search */}
            <div className="relative flex items-center bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-sm max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search reference files..."
                className="w-full bg-transparent pl-7 pr-1 text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none"
              />
            </div>

          </div>

          {/* Library Materials Table List */}
          <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="px-5 py-4">Document Details</th>
                    <th className="px-5 py-4">Size</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">AI Grounding Uses</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
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
                      <tr key={doc._id} className="hover:bg-slate-50/30 transition group">
                        {/* Title & Date */}
                        <td className="px-5 py-4.5">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-rose-50 border border-[#FECDD3] text-[#E05058] rounded-xl shrink-0">
                              <FileText className="w-4.5 h-4.5" />
                            </div>
                            <div className="min-w-0 max-w-[240px] sm:max-w-[280px]">
                              <p className="text-xs font-black text-brand-dark truncate leading-tight group-hover:text-[#E05058] transition">{doc.name}</p>
                              <span className="text-[9px] text-slate-400 font-bold mt-0.5 inline-block">
                                Uploaded: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-') : 'Recent'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Size */}
                        <td className="px-5 py-4.5 text-slate-500 font-bold">
                          {doc.size}
                        </td>

                        {/* Category */}
                        <td className="px-5 py-4.5">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-50 text-slate-500 border border-slate-200">
                            {doc.category}
                          </span>
                        </td>

                        {/* Grounding uses */}
                        <td className="px-5 py-4.5">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-brand-dark">{doc.groundingCount || 0} times</span>
                            {(doc.groundingCount || 0) > 10 && (
                              <span className="px-1.5 py-0.5 text-[8px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 rounded flex items-center gap-0.5 uppercase tracking-wide">
                                <Sparkles className="w-2.5 h-2.5 text-emerald-500 fill-emerald-50" /> High Grounding
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4.5 text-right">
                          <div className="flex justify-end gap-2.5">
                            <a
                              href={doc.fileUrl ? (doc.fileUrl.startsWith('http') ? doc.fileUrl : `http://localhost:5000${doc.fileUrl}`) : '#'}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-brand-dark hover:bg-slate-50 transition cursor-pointer"
                              title="Preview File"
                            >
                              <ExternalLink className="w-4.5 h-4.5" />
                            </a>
                            <button
                              onClick={() => handleDeleteItem(doc._id, doc.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-brand-primary hover:bg-rose-50 transition cursor-pointer"
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
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
            
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-5 h-5 text-[#E05058]" />
              <h3 className="text-sm font-black font-outfit text-brand-dark">Library Storage Status</h3>
            </div>

            {/* Storage Progress indicator */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-wide">
                <span>{totalUsedMB} MB Used</span>
                <span>{limitMB} MB Limit</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#E05058] h-full rounded-full transition-all duration-300"
                  style={{ width: `${usedPercentage}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                Grounding index matches are faster when textbook file uploads are limited to under 10MB each.
              </p>
            </div>

            <hr className="border-slate-100" />

            {/* Sleek Dotted Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition flex flex-col items-center justify-center min-h-[220px] ${
                dragActive 
                  ? 'border-[#E05058] bg-[#E05058]/5 animate-pulse' 
                  : 'border-slate-200 hover:border-slate-300'
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
                <h5 className="text-xs font-black text-brand-dark">
                  {uploading ? 'Uploading Reference...' : 'Ground Reference Document'}
                </h5>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[180px] mx-auto font-semibold">
                  Drag and drop textbook, syllabus draft, or past exams (.pdf, .txt, .docx)
                </p>
                <span className="mt-4 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-[10px] rounded-full uppercase tracking-wider transition inline-block">
                  {uploading ? 'Please wait' : 'Upload file'}
                </span>
              </label>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
