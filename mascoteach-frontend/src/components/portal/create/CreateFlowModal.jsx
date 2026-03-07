import { useState, useEffect, useCallback } from 'react';
import { X, Upload, FileText, Sparkles, CheckCircle2, Swords, Zap, Shield, Gem, Heart, ArrowRight, Loader2, File, AlertCircle } from 'lucide-react';
import { getAllGameTemplates } from '@/services/gameTemplateService';
import { generateUploadUrl, uploadFileToS3, createDocument } from '@/services/documentService';

/**
 * CreateFlowModal — Full AI Quiz creation flow
 * Step 1: Upload document (drag-and-drop zone) → calls real API
 * Step 2: Choose Game Mode (from real API game templates)
 * Clean, spacious, Wayground-inspired modal design
 */
const modeIcons = {
    'Swords': Swords,
    'Zap': Zap,
    'Shield': Shield,
    'Gem': Gem,
    'Heart': Heart,
};

// Fallback icon mapping for templates from API
function getIconForTemplate(name) {
    const lower = (name || '').toLowerCase();
    if (lower.includes('battle') || lower.includes('chiến')) return Swords;
    if (lower.includes('speed') || lower.includes('nhanh') || lower.includes('đua')) return Zap;
    if (lower.includes('team') || lower.includes('đội')) return Shield;
    if (lower.includes('treasure') || lower.includes('kho')) return Gem;
    if (lower.includes('survival') || lower.includes('sinh tồn')) return Heart;
    return Sparkles;
}

export default function CreateFlowModal({ onClose }) {
    const [step, setStep] = useState(1);
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedMode, setSelectedMode] = useState(null);
    const [uploadError, setUploadError] = useState(null);

    // Game templates from API
    const [gameTemplates, setGameTemplates] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [templatesError, setTemplatesError] = useState(null);

    // Fetch game templates when moving to step 2
    useEffect(() => {
        if (step === 2) {
            fetchTemplates();
        }
    }, [step]);

    async function fetchTemplates() {
        try {
            setLoadingTemplates(true);
            setTemplatesError(null);
            const data = await getAllGameTemplates();
            setGameTemplates(Array.isArray(data) ? data : []);
        } catch (err) {
            setTemplatesError(err.message || 'Không thể tải chế độ chơi');
        } finally {
            setLoadingTemplates(false);
        }
    }

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
            // Step 1: Get presigned S3 URL from backend
            const { uploadUrl, fileUrl } = await generateUploadUrl(
                uploadedFile.name,
                uploadedFile.type,
            );

            // Step 2: Upload file directly to S3 (no auth header)
            await uploadFileToS3(uploadUrl, uploadedFile);

            // Step 3: Save document metadata to backend
            await createDocument({ fileUrl });

            setStep(2);
        } catch (err) {
            setUploadError(err.message || 'Tải lên thất bại. Vui lòng thử lại.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSelectMode = (template) => {
        setSelectedMode(template.id);
        // In real app, this would create a live session with the template
        setTimeout(() => {
            onClose();
        }, 800);
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
                                {step === 1 ? 'Tải lên tài liệu' : 'Chọn chế độ chơi'}
                            </h2>
                            <p className="text-[12px] text-slate-400 mt-0.5">
                                {step === 1 ? 'Bước 1 / 2' : 'Bước 2 / 2'}
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

                {/* ── Step Progress ── */}
                <div className="px-8 pt-5">
                    <div className="flex items-center gap-2">
                        <div className={`flex-1 h-1 rounded-full transition-colors duration-300
                                         ${step >= 1 ? 'bg-sky-400' : 'bg-slate-100'}`} />
                        <div className={`flex-1 h-1 rounded-full transition-colors duration-300
                                         ${step >= 2 ? 'bg-sky-400' : 'bg-slate-100'}`} />
                    </div>
                </div>

                {/* ── Content ── */}
                <div className="px-8 py-6 overflow-y-auto max-h-[60vh]">
                    {/* ═══ STEP 1: Upload ═══ */}
                    {step === 1 && (
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
                                                Đã tải lên thành công
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
                                                Tiếp tục
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══ STEP 2: Choose Game Mode ═══ */}
                    {step === 2 && (
                        <div className="space-y-5">
                            <p className="text-[13px] text-slate-500">
                                Tài liệu đã được tải lên. Chọn chế độ chơi để tạo phiên.
                            </p>

                            {loadingTemplates ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
                                    <span className="ml-3 text-sm text-slate-400">Đang tải chế độ chơi...</span>
                                </div>
                            ) : templatesError ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <AlertCircle className="w-8 h-8 text-slate-300 mb-3" />
                                    <p className="text-sm text-slate-400 mb-3">{templatesError}</p>
                                    <button
                                        onClick={fetchTemplates}
                                        className="px-4 py-2 rounded-lg text-sm font-medium text-sky-600 bg-sky-50
                                                   hover:bg-sky-100 transition-colors"
                                    >
                                        Thử lại
                                    </button>
                                </div>
                            ) : gameTemplates.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <p className="text-sm text-slate-400">
                                        Chưa có chế độ chơi nào. Vui lòng liên hệ admin.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {gameTemplates.map((template) => {
                                        const IconComponent = modeIcons[template.icon] || getIconForTemplate(template.name);
                                        const isSelected = selectedMode === template.id;

                                        return (
                                            <button
                                                key={template.id}
                                                onClick={() => handleSelectMode(template)}
                                                className={`group relative flex flex-col p-5 rounded-xl
                                                            border text-left transition-all duration-200
                                                            ${isSelected
                                                        ? 'border-sky-400 bg-sky-50/50 ring-2 ring-sky-200/50'
                                                        : 'border-slate-200/80 bg-white hover:border-sky-300 hover:bg-sky-50/30'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center
                                                                     transition-colors duration-200
                                                                     ${isSelected ? 'bg-sky-100' : 'bg-slate-50 group-hover:bg-sky-50'}`}>
                                                        <IconComponent className={`w-[18px] h-[18px] transition-colors duration-200
                                                            ${isSelected ? 'text-sky-500' : 'text-slate-400 group-hover:text-sky-500'}`} />
                                                    </div>
                                                    <h3 className={`text-[13px] font-semibold transition-colors duration-200
                                                        ${isSelected ? 'text-sky-600' : 'text-slate-700'}`}>
                                                        {template.name}
                                                    </h3>
                                                </div>

                                                {template.thumbnailUrl && (
                                                    <div className="w-full h-20 rounded-lg bg-slate-50 overflow-hidden mb-3">
                                                        <img
                                                            src={template.thumbnailUrl}
                                                            alt={template.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between mt-auto">
                                                    <span className="text-[11px] text-slate-400">
                                                        Template #{template.id}
                                                    </span>
                                                    <span className={`text-[11px] font-semibold transition-all duration-200
                                                        ${isSelected
                                                            ? 'text-sky-500'
                                                            : 'text-slate-400 group-hover:text-sky-500'
                                                        }`}>
                                                        {isSelected ? '✓ Đã chọn' : 'Chọn →'}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
