import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';
import GoogleLogo from '@/components/auth/GoogleLogo';
import { useAuth } from '@/contexts/AuthContext';

export default function SignUpPage() {
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [selectedRole, setSelectedRole] = useState('Teacher');
    const [submitting, setSubmitting] = useState(false);
    const [localError, setLocalError] = useState('');

    const { register, error, clearError } = useAuth();
    const navigate = useNavigate();

    function update(field) {
        return (e) => {
            setForm((prev) => ({ ...prev, [field]: e.target.value }));
            setLocalError('');
            clearError();
        };
    }

    async function handleSubmit(e) {
        e.preventDefault();
        clearError();
        setLocalError('');

        // Kiểm tra phía client
        if (!form.fullName || !form.email || !form.password) {
            setLocalError('Vui lòng điền đầy đủ thông tin.');
            return;
        }

        if (form.password !== form.confirmPassword) {
            setLocalError('Mật khẩu xác nhận không khớp.');
            return;
        }

        if (form.password.length < 6) {
            setLocalError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        setSubmitting(true);
        try {
            await register({
                fullName: form.fullName,
                email: form.email,
                password: form.password,
                role: selectedRole,
            });
            // Đăng ký thành công — chuyển về trang đăng nhập
            navigate('/login', {
                state: { message: 'Đăng ký thành công! Vui lòng đăng nhập.' }
            });
        } catch {
        } finally {
            setSubmitting(false);
        }
    }

    const displayError = localError || error;

    return (
        <AuthLayout>
            <header className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                    Tạo tài khoản Mascoteach
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    Đăng ký để trải nghiệm lớp học thông minh.
                </p>
            </header>

            {/* Thông báo lỗi */}
            {displayError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-600 text-center"
                    role="alert">
                    {displayError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="signup-role" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Bạn là? <span className="text-rose-400">*</span>
                    </label>
                    <select
                        id="signup-role"
                        value={selectedRole}
                        onChange={(e) => { setSelectedRole(e.target.value); setLocalError(''); clearError(); }}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white
                                   text-sm text-slate-700
                                   focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300
                                   transition-all duration-200 appearance-none
                                   bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M2%204l4%204%204-4%22/%3E%3C/svg%3E')]
                                   bg-[length:12px] bg-[right_16px_center] bg-no-repeat"
                    >
                        <option value="Teacher">Giáo viên</option>
                        <option value="Student">Học sinh</option>
                        <option value="Parent">Phụ huynh</option>
                    </select>
                </div>

                <AuthInput
                    id="signup-fullname"
                    label="Họ và tên"
                    placeholder="Nguyễn Văn A"
                    value={form.fullName}
                    onChange={update('fullName')}
                    required
                />

                <AuthInput
                    id="signup-email"
                    label="Địa chỉ Email"
                    type="email"
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={update('email')}
                    required
                />

                <AuthInput
                    id="signup-password"
                    label="Mật khẩu"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={update('password')}
                    required
                />

                <AuthInput
                    id="signup-confirm"
                    label="Xác nhận mật khẩu"
                    type="password"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={update('confirmPassword')}
                    required
                />

                {/* Nút tạo tài khoản */}
                <motion.button
                    type="submit"
                    className="auth-btn auth-btn--primary disabled:opacity-60 disabled:cursor-not-allowed"
                    whileHover={!submitting ? { scale: 1.015, y: -1 } : {}}
                    whileTap={!submitting ? { scale: 0.98 } : {}}
                    disabled={submitting}
                >
                    {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Đang tạo tài khoản...
                        </span>
                    ) : (
                        'Tạo tài khoản'
                    )}
                </motion.button>

                {/* Đường phân cách */}
                <div className="flex items-center gap-4">
                    <span className="flex-1 h-px bg-slate-200" />
                    <span className="text-xs text-slate-400 font-medium">hoặc</span>
                    <span className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Google */}
                <motion.button
                    type="button"
                    className="auth-btn auth-btn--google"
                    whileHover={{ scale: 1.015, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <GoogleLogo />
                    Tiếp tục với Google
                </motion.button>
            </form>

            {/* Điều khoản */}
            <p className="mt-6 text-center text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                Bằng việc đăng ký, bạn đồng ý với{' '}
                <a href="#" className="underline hover:text-brand-blue transition-colors">Điều khoản dịch vụ</a>{' '}
                và{' '}
                <a href="#" className="underline hover:text-brand-blue transition-colors">Chính sách bảo mật</a>.
            </p>

            {/* Chuyển về đăng nhập */}
            <p className="mt-4 text-center text-sm text-slate-500">
                Đã có tài khoản?{' '}
                <Link to="/login" className="font-semibold text-brand-blue hover:text-brand-navy transition-colors">
                    Đăng nhập
                </Link>
            </p>
        </AuthLayout>
    );
}
