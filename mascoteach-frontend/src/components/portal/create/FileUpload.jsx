import { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle2 } from 'lucide-react';

/**
 * FileUpload — Drag-and-drop document upload zone
 * Supports PDF, DOCX, TXT with visual feedback and file preview
 */
export default function FileUpload({ onFileSelect }) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            setFile(droppedFile);
            onFileSelect?.(droppedFile);
        }
    }, [onFileSelect]);

    const handleFileInput = useCallback((e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            onFileSelect?.(selectedFile);
        }
    }, [onFileSelect]);

    const removeFile = () => {
        setFile(null);
        onFileSelect?.(null);
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    if (file) {
        return (
            <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">{file.name}</p>
                        <p className="text-xs text-ink-muted mt-0.5">
                            {formatFileSize(file.size)} • Ready for AI processing
                        </p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <button
                        onClick={removeFile}
                        className="p-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                        aria-label="Remove file"
                    >
                        <X className="w-4 h-4 text-ink-muted" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-2xl border-2 border-dashed p-12 text-center
                  transition-all duration-300 cursor-pointer
                  ${isDragging
                    ? 'border-brand-blue bg-brand-light/10 scale-[1.01]'
                    : 'border-slate-200 bg-white hover:border-brand-mid hover:bg-slate-50/50'
                }`}
        >
            <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileInput}
                className="absolute inset-0 opacity-0 cursor-pointer"
                aria-label="Upload document"
            />

            <div className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-2xl mb-5 flex items-center justify-center
                        transition-all duration-300
                        ${isDragging
                        ? 'bg-gradient-to-br from-brand-navy to-brand-blue scale-110'
                        : 'bg-gradient-to-br from-brand-light/30 to-brand-mid/10'
                    }`}>
                    <Upload className={`w-7 h-7 transition-colors duration-300 ${isDragging ? 'text-white' : 'text-brand-blue'}`} />
                </div>

                <p className="text-base font-semibold text-ink mb-1.5">
                    {isDragging ? 'Drop your file here' : 'Upload your document'}
                </p>
                <p className="text-sm text-ink-muted mb-4">
                    Drag & drop or <span className="text-brand-blue font-medium">browse files</span>
                </p>
                <p className="text-xs text-ink-muted/70">
                    Supported formats: PDF, DOCX, TXT • Max 10MB
                </p>
            </div>
        </div>
    );
}
