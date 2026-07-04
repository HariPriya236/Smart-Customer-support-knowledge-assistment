import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { uploadDocument } from '../services/api';
import { DocumentItem } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newDoc: DocumentItem) => void;
}

const CATEGORIES = [
  "FAQs",
  "User Manuals",
  "Product Documentation",
  "Troubleshooting Guides",
  "Warranty Policies",
  "Refund Policies",
  "Internal Knowledge Bases"
];

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>("Troubleshooting Guides");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const doc = await uploadDocument(file, category);
      onSuccess(doc);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Upload failed. Please check backend status.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-brand-accent" />
            <h3 className="font-bold text-white text-base">Upload Enterprise Document</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* File Drag and Drop Area */}
          <div className="border-2 border-dashed border-dark-border hover:border-brand-primary rounded-2xl p-6 text-center bg-dark-bg/60 cursor-pointer transition-colors relative">
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt,.md,.csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {file ? (
              <div className="flex items-center justify-center space-x-3 text-brand-accent font-semibold text-sm">
                <FileText className="w-6 h-6" />
                <span className="truncate">{file.name}</span>
                <span className="text-xs text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 mx-auto text-slate-400" />
                <p className="text-xs text-slate-300 font-medium">Click or drag document here to upload</p>
                <p className="text-[10px] text-slate-500">Supports PDF, DOCX, TXT, MD, CSV (Max 50MB)</p>
              </div>
            )}
          </div>

          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Knowledge Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-brand-primary"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-dark-card text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-dark-bg/60 border-t border-dark-border flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-primary hover:bg-brand-primaryHover disabled:opacity-50 flex items-center space-x-2 glow-indigo shadow-lg"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Indexing Vector DB...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Upload & Index Document</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
