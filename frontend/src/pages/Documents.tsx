import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Trash2, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  HardDrive
} from 'lucide-react';
import { fetchDocuments, deleteDocument } from '../services/api';
import { DocumentItem } from '../types';
import { UploadModal } from '../components/UploadModal';

export const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    const docs = await fetchDocuments();
    setDocuments(docs);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this document and remove its embeddings from ChromaDB?")) {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || doc.doc_category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Enterprise Knowledge Base Documents</h1>
          <p className="text-slate-400 text-sm">
            Manage vector-indexed PDF manuals, warranty policies, FAQs, and troubleshooting guides.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-primary hover:bg-brand-primaryHover flex items-center space-x-2 glow-indigo shadow-lg transition-all"
        >
          <Upload className="w-4 h-4" />
          <span>Upload File</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-dark-card border border-dark-border p-4 rounded-2xl">
        <div className="flex items-center space-x-3 bg-dark-bg border border-dark-border px-3.5 py-2 rounded-xl text-xs w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search document title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-white outline-none w-full placeholder-slate-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <span className="text-xs font-medium text-slate-400">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-white outline-none"
          >
            <option value="All">All Categories</option>
            <option value="FAQs">FAQs</option>
            <option value="User Manuals">User Manuals</option>
            <option value="Product Documentation">Product Documentation</option>
            <option value="Troubleshooting Guides">Troubleshooting Guides</option>
            <option value="Warranty Policies">Warranty Policies</option>
            <option value="Refund Policies">Refund Policies</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-surface/60 border-b border-dark-border text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6">Document Name</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Size</th>
                <th className="py-4 px-4">Chunks</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading enterprise documents...
                  </td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No documents found matching filters.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-dark-surface/40 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-100 flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 text-brand-accent flex items-center justify-center font-bold uppercase text-[10px]">
                        {doc.file_type}
                      </div>
                      <span className="truncate max-w-xs">{doc.filename}</span>
                    </td>
                    <td className="py-4 px-4 text-slate-300">
                      <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-semibold text-slate-300">
                        {doc.doc_category}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-400">
                      {(doc.file_size / (1024 * 1024)).toFixed(2)} MB
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-300 font-bold">
                      {doc.chunk_count}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Indexed</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={(newDoc) => setDocuments((prev) => [newDoc, ...prev])}
      />
    </div>
  );
};
