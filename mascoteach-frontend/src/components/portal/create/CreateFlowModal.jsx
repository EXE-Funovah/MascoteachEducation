import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Upload, Sparkles, CheckCircle2, ArrowRight, Loader2, File } from 'lucide-react';
import { generateUploadUrl, uploadFileToS3, createDocument } from '@/services/documentService';

/**
 * CreateFlowModal — Upload document then navigate to Quiz Settings
 *
 * Flow: Upload file → S3 + create document → navigate to /teacher/quiz-settings
 */
export default function CreateFlowModal({ onClose }) {
    const navigate = useNavigate();
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setUploadedFile(e.dataTransfer.files[0]);
            setUploadError(null);
        }
    }, []);

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            setUploadedFile(e.target.files[0]);
            setUploadError(null);
        }
    };

    const handleContinue = async () => {
        setIsProcessing(true);
        setUploadError(null);
        try {
            // 1. Get presigned S3 URL from backend
            const { uploadUrl, fileUrl } = await generateUploadUrl(
                uploadedFile.name,
                uploadedFile.type,
            );

            // 2. Upload file directly to S3
            await uploadFileToS3(uploadUrl, uploadedFile);

            // 3. Save document metadata to backend
            const doc = await createDocument({ fileUrl });

            // 4. Close modal & navigate to settings page
            onClose();
            navigate('/teacher/quiz-settings', {
                state: {
                    fileName: uploadedFile.name,
                    fileSize: uploadedFile.size,
                    documentId: doc?.id ?? doc?.documentId ?? null,
                    fileUrl,
                },
            });
        } catch (err) {
            setUploadError(err.message || 'Tải lên thất bại. Vui lòng thử lại.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl
                            border border-slate-200/80 shadow-xl overflow-hidden
                            animate-in"
                role="dialog"
                aria-modal="true"
                aria-label="Tạo quiz mới"
            >
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100/60">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                            <Sparkles className="w-[18px] h-[18px] text-sky-500" />
                        </div>
                        <div>
                            <h2 className="text-[16px] font-bold text-slate-800">
                                Tải lên tài liệu
                            </h2>
                            <p className="text-[12px] text-slate-400 mt-0.5">
                                Bước 1 — Chọn file để AI tạo câu hỏi
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center
                                   text-slate-400 hover:text-slate-600 hover:bg-slate-100
                                   transition-all duration-200"
                        aria-label="Đóng"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ── Content ── */}
                <div className="px-8 py-6 overflow-y-auto max-h-[60vh]">
                    <div className="space-y-6">
                        {/* Error message */}
                        {uploadError && (
                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-600 text-center">
                                {uploadError}
                            </div>
                        )}

                        {/* Drag & Drop Zone */}
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`relative flex flex-col items-center justify-center
                                        py-16 px-8 rounded-2xl border-2 border-dashed
                                        transition-all duration-300 cursor-pointer
                                        ${dragActive
                                    ? 'border-sky-400 bg-sky-50/50'
                                    : uploadedFile
                                        ? 'border-sky-300 bg-sky-50/30'
                                        : 'border-slate-200 bg-slate-50/30 hover:border-sky-300 hover:bg-sky-50/20'
                                }`}
                        >
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileInput}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                id="file-upload-input"
                            />

                            {uploadedFile ? (
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-14 h-14 rounded-xl bg-sky-100 flex items-center justify-center mb-4">
                                        <File className="w-7 h-7 text-sky-500" />
                                    </div>
                                    <p className="text-[14px] font-medium text-slate-700 mb-1">
                                        {uploadedFile.name}
                                    </p>
                                    <p className="text-[12px] text-slate-400">
                                        {(uploadedFile.size / 1024).toFixed(1)} KB — Sẵn sàng xử lý
                                    </p>
                                    <div className="flex items-center gap-1 mt-3 text-sky-500">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span className="text-[12px] font-medium">
                                            File đã sẵn sàng
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-14 h-14 rounded-xl bg-slate-100/80 flex items-center justify-center mb-4">
                                        <Upload className="w-7 h-7 text-slate-400" />
                                    </div>
                                    <p className="text-[14px] font-medium text-slate-600 mb-1">
                                        Tải lên tài liệu của bạn
                                    </p>
                                    <p className="text-[12px] text-slate-400">
                                        Kéo thả hoặc nhấp để chọn file (PDF, Doc)
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Continue Button */}
                        {uploadedFile && (
                            <div className="flex justify-end">
                                <button
                                    onClick={handleContinue}
                                    disabled={isProcessing}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl
                                               bg-sky-500 text-white text-[13px] font-semibold
                                               hover:bg-sky-600 transition-all duration-200
                                               shadow-sm hover:shadow-md
                                               disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Đang tải lên...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            Tiếp tục cấu hình
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
