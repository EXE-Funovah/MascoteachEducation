import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { useAuth } from '@/contexts/AuthContext';

const roles = [
  { value: 'Teacher', label: 'Giáo viên', available: true },
  { value: 'Student', label: 'Học sinh', available: true },
  { value: 'Parent', label: 'Phụ huynh', available: false },
];

export default function SignUpPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [selectedRole, setSelectedRole] = useState('Teacher');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const { register, googleLogin, error, clearError } = useAuth();
  const navigate = useNavigate();

  function update(field) {
    return (event) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
      setLocalError('');
      clearError();
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    clearError();
    setLocalError('');

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
      navigate('/signin', {
        state: {
          message:
            'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản trước khi đăng nhập.',
          verificationEmail: form.email.trim(),
        },
      });
    } catch {
      // AuthContext owns the visible error message.
    } finally {
      setSubmitting(false);
    }
  }

  const handleGoogleCredential = useCallback(async (credential) => {
    clearError();
    setLocalError('');
    setGoogleSubmitting(true);

    try {
      const profile = await googleLogin(credential, true);
      const role = String(profile?.role || profile?.roleName || 'Teacher').toLowerCase();
      navigate(role === 'teacher' ? '/teacher' : '/', { replace: true });
    } catch (err) {
      setLocalError(err.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.');
    } finally {
      setGoogleSubmitting(false);
    }
  }, [clearError, googleLogin, navigate]);

  const displayError = localError || error;

  return (
    <AuthLayout>
      <header className="auth-form-header">
        <h1>Chào mừng đến Mascoteach</h1>
        <p>
          Đã có tài khoản? <Link to="/signin">Đăng nhập</Link>
        </p>
      </header>

      {displayError && (
        <div className="auth-alert auth-alert--error" role="alert">
          {displayError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-role-group" role="radiogroup" aria-label="Chọn vai trò">
          {roles.map((role) => (
            <button
              key={role.value}
              type="button"
              className={selectedRole === role.value ? 'is-active' : ''}
              disabled={!role.available}
              onClick={() => {
                if (!role.available) return;
                setSelectedRole(role.value);
                setLocalError('');
                clearError();
              }}
            >
              <span>{role.label}</span>
              {!role.available && <small>Sắp ra mắt</small>}
            </button>
          ))}
        </div>

        <AuthInput
          id="signup-fullname"
          label="Họ và tên"
          placeholder="Nguyễn Minh Anh"
          value={form.fullName}
          onChange={update('fullName')}
          required
        />

        <AuthInput
          id="signup-email"
          label="Email"
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

        <motion.button
          type="submit"
          className="auth-btn auth-btn--primary disabled:cursor-not-allowed disabled:opacity-60"
          whileHover={!submitting ? { y: -1 } : {}}
          whileTap={!submitting ? { scale: 0.985 } : {}}
          disabled={submitting}
        >
          {submitting ? (
            <span className="auth-loading">
              <span />
              Đang tạo tài khoản
            </span>
          ) : (
            <>
              Tạo tài khoản
              <ArrowRight size={17} strokeWidth={2.2} />
            </>
          )}
        </motion.button>
      </form>

      <div className="auth-divider">
        <span>Phương thức khác</span>
      </div>

      <GoogleSignInButton
        onCredential={handleGoogleCredential}
        disabled={googleSubmitting || selectedRole !== 'Teacher'}
        text="signup_with"
      />

      {selectedRole === 'Student' && (
        <p className="mt-3 text-center text-xs font-bold text-slate-500">
          Tài khoản học sinh hiện đăng ký bằng email và mật khẩu để giữ đúng vai trò.
        </p>
      )}

      <p className="auth-legal">
        Bằng việc đăng ký, bạn đồng ý với <Link to="/terms">điều khoản dịch vụ</Link> và{' '}
        <Link to="/privacy">chính sách bảo mật</Link> của Mascoteach.
      </p>
    </AuthLayout>
  );
}
