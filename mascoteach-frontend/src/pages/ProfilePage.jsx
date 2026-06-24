import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Crown,
  FileText,
  Loader2,
  Mail,
  PencilLine,
  RefreshCw,
  Save,
  Shield,
  Trash2,
  Upload,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  generateAvatarUploadUrl,
  deleteUser,
  updateMyAvatar,
  updateUser,
  uploadAvatarToS3,
} from '@/services/userService';
import { isPremiumActive } from '@/lib/billingUi';

const MAX_AVATAR_SIZE_BYTES = 1024 * 1024;
const ACCEPTED_AVATAR_TYPES = ['image/jpeg', 'image/png'];

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatAvatarInitial(profile) {
  const displayName = profile?.fullName || profile?.email || 'M';
  return displayName.trim().charAt(0).toUpperCase() || 'M';
}

function formatRole(value) {
  const normalized = String(value || '').toLowerCase();

  if (normalized === 'teacher') return 'Giáo viên';
  if (normalized === 'student') return 'Học sinh';
  if (normalized === 'parent') return 'Phụ huynh';
  if (normalized === 'admin') return 'Quản trị viên';

  return value || '—';
}

function formatSubscriptionTier(value) {
  const normalized = String(value || '').toLowerCase();

  if (normalized === 'free') return 'Miễn phí';
  return value || '—';
}

function getInfoItems(profile) {
  return [
    { label: 'Tên hiển thị', value: profile?.fullName || '—', icon: User },
    { label: 'Email', value: profile?.email || '—', icon: Mail },
    { label: 'Vai trò', value: formatRole(profile?.role), icon: Shield },
    { label: 'Gói đăng ký', value: formatSubscriptionTier(profile?.subscriptionTier), icon: Crown },
    { label: 'Ngày tạo tài khoản', value: formatDate(profile?.createdAt), icon: CalendarDays },
    {
      label: 'Tài liệu đã xử lý',
      value: profile?.documentsProcessed ?? 0,
      icon: FileText,
    },
  ];
}

export default function ProfilePage() {
  const { user, loading: authLoading, refreshUser, logout } = useAuth();
  const [profile, setProfile] = useState(user);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });
  const [pageLoading, setPageLoading] = useState(true);
  const [avatarActionsOpen, setAvatarActionsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (user) {
      setProfile(user);
    }
  }, [user]);

  useEffect(() => {
    setFormData({
      fullName: profile?.fullName || '',
      email: profile?.email || '',
    });
  }, [profile]);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function loadProfile() {
      setPageLoading(true);
      setError('');

      try {
        const nextProfile = user ?? await refreshUser();
        if (!cancelled) {
          setProfile(nextProfile);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Không thể tải hồ sơ người dùng.');
        }
      } finally {
        if (!cancelled) {
          setPageLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [authLoading, refreshUser, reloadKey, user]);

  const avatarInitial = useMemo(() => formatAvatarInitial(profile), [profile]);
  const infoItems = useMemo(() => getInfoItems(profile), [profile]);
  const premiumActive = useMemo(() => isPremiumActive(profile), [profile]);

  async function syncProfile() {
    const nextProfile = await refreshUser();
    setProfile(nextProfile);
    return nextProfile;
  }

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    setError('');
    setSuccessMessage('');

    if (!file) return;

    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      setError('Ảnh đại diện chỉ hỗ trợ JPG hoặc PNG.');
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setError('Ảnh đại diện phải nhỏ hơn hoặc bằng 1MB.');
      return;
    }

    setIsUploading(true);

    try {
      const { uploadUrl, s3Key } = await generateAvatarUploadUrl(file.name, file.type);
      await uploadAvatarToS3(uploadUrl, file);
      const updatedProfile = await updateMyAvatar(s3Key);
      setProfile(updatedProfile);
      await syncProfile();
      setAvatarActionsOpen(false);
      setSuccessMessage('Cập nhật ảnh đại diện thành công.');
    } catch (err) {
      setError(err.message || 'Không thể tải ảnh đại diện lên.');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRemoveAvatar() {
    setError('');
    setSuccessMessage('');
    setIsUploading(true);

    try {
      const updatedProfile = await updateMyAvatar(null);
      setProfile(updatedProfile);
      await syncProfile();
      setAvatarActionsOpen(false);
      setSuccessMessage('Đã gỡ ảnh đại diện.');
    } catch (err) {
      setError(err.message || 'Không thể gỡ ảnh đại diện.');
    } finally {
      setIsUploading(false);
    }
  }

  function handleEditStart() {
    setError('');
    setSuccessMessage('');
    setFormData({
      fullName: profile?.fullName || '',
      email: profile?.email || '',
    });
    setIsEditing(true);
  }

  function handleEditCancel() {
    setError('');
    setFormData({
      fullName: profile?.fullName || '',
      email: profile?.email || '',
    });
    setIsEditing(false);
  }

  async function handleProfileSave(event) {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    const fullName = formData.fullName.trim();
    const email = formData.email.trim();

    if (!fullName) {
      setError('Tên hiển thị không được để trống.');
      return;
    }

    if (!email) {
      setError('Email không được để trống.');
      return;
    }

    setIsSaving(true);

    try {
      await updateUser(profile.id, {
        fullName,
        email,
        role: profile.role,
        subscriptionTier: profile.subscriptionTier,
      });

      const nextProfile = await syncProfile();
      setProfile(nextProfile);
      setIsEditing(false);
      setSuccessMessage('Cập nhật hồ sơ thành công.');
    } catch (err) {
      setError(err.message || 'Không thể cập nhật hồ sơ.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!profile?.id || isDeleting) return;

    const confirmed = window.confirm(
      'Tài khoản, tài liệu, quiz và dữ liệu liên quan sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?',
    );

    if (!confirmed) return;

    setError('');
    setSuccessMessage('');
    setIsDeleting(true);

    try {
      await deleteUser(profile.id);
      logout();
    } catch (err) {
      setError(err.message || 'Không thể xóa tài khoản.');
      setIsDeleting(false);
    }
  }

  return (
    <div className="min-h-full bg-[#fbfdff] text-ink">
      <div className="mx-auto w-full max-w-[1120px] px-5 py-8 md:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-[7px] border border-brand-light/70 bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-brand-blue">
              <User className="h-4 w-4" />
              Hồ sơ
            </div>
            <h1 className="mt-4 text-[34px] font-black leading-tight tracking-[-0.02em]">
              Hồ sơ cá nhân
            </h1>
            <p className="mt-2 max-w-[620px] text-sm font-semibold leading-6 text-[#64748B]">
              Xem thông tin tài khoản, vai trò hiện tại và quản lý ảnh đại diện của bạn.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-brand-light/70 bg-white px-5 text-sm font-black text-brand-navy hover:bg-brand-light/15 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => setReloadKey((current) => current + 1)}
            disabled={pageLoading || isUploading || isSaving}
          >
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </button>
        </div>

        {(authLoading || pageLoading) && (
          <div className="mt-8 grid min-h-[320px] place-items-center rounded-[18px] border border-brand-light/60 bg-white">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-blue" />
              <p className="mt-3 text-sm font-black text-[#64748B]">Đang tải hồ sơ</p>
            </div>
          </div>
        )}

        {!authLoading && !pageLoading && error && (
          <div className="mt-8 rounded-[14px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {!authLoading && !pageLoading && successMessage && (
          <div className="mt-8 rounded-[14px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
            {successMessage}
          </div>
        )}

        {!authLoading && !pageLoading && profile && (
          <>
            <section className="mt-8 grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
              <article className="flex items-center rounded-[18px] border border-brand-light/60 bg-white p-6 shadow-[0_18px_48px_rgba(43,122,181,0.08)]">
                <div className="w-full flex flex-col items-center text-center">
                  <div className="relative">
                    <button
                      type="button"
                      aria-label="Mở tùy chọn ảnh đại diện"
                      className="grid h-28 w-28 place-items-center overflow-hidden rounded-full bg-[#173154] text-4xl font-black text-white shadow-[0_18px_40px_rgba(23,49,84,0.22)] transition hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-brand-light/60"
                      onClick={() => setAvatarActionsOpen((current) => !current)}
                    >
                      {profile.avatarUrl ? (
                        <img
                          src={profile.avatarUrl}
                          alt={`${profile.fullName || profile.email || 'Người dùng'} avatar`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        avatarInitial
                      )}
                    </button>
                    <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-[#22C55E]" />
                  </div>

                  <h2 className="mt-5 text-2xl font-black text-[#173154]">
                    {profile.fullName || 'Tài khoản'}
                  </h2>
                  <p className="mt-2 text-sm font-semibold text-[#64748B]">
                    {profile.email || 'Chưa có email'}
                  </p>

                  <div className="mt-3 inline-flex items-center rounded-full border border-brand-light/70 bg-[#F8FBFE] px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-brand-blue">
                    {formatRole(profile.role)}
                  </div>

                  {avatarActionsOpen && (
                    <div className="mt-6 flex w-full flex-col gap-3">
                      <label
                        htmlFor="profile-avatar-upload"
                        className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-brand-blue px-4 text-sm font-black text-white transition hover:bg-brand-navy"
                      >
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        Tải ảnh đại diện
                      </label>
                      <input
                        id="profile-avatar-upload"
                        type="file"
                        accept="image/png,image/jpeg"
                        className="sr-only"
                        aria-label="Tải ảnh đại diện"
                        onChange={handleAvatarChange}
                        disabled={isUploading}
                      />

                      {profile.avatarUrl && (
                        <button
                          type="button"
                          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[12px] border border-rose-200 bg-white px-4 text-sm font-black text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={handleRemoveAvatar}
                          disabled={isUploading}
                        >
                          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          Gỡ ảnh đại diện
                        </button>
                      )}

                      <p className="text-sm font-semibold text-[#64748B]">
                        JPG/PNG, tối đa 1MB
                      </p>
                    </div>
                  )}
                </div>
              </article>

              <div className="grid gap-4">
                <section className="grid gap-4 md:grid-cols-3">
                  <article className="rounded-[18px] border border-brand-light/60 bg-white p-5 shadow-[0_18px_48px_rgba(43,122,181,0.08)]">
                    <Crown className={`h-7 w-7 ${premiumActive ? 'text-[#F59E0B]' : 'text-[#94A3B8]'}`} />
                    <p className="mt-4 text-xs font-black uppercase tracking-[0.08em] text-[#64748B]">
                      Gói hiện tại
                    </p>
                    <p className="mt-1 text-2xl font-black">{formatSubscriptionTier(profile.subscriptionTier)}</p>
                  </article>

                  <article className="rounded-[18px] border border-brand-light/60 bg-white p-5 shadow-[0_18px_48px_rgba(43,122,181,0.08)]">
                    <CalendarDays className="h-7 w-7 text-brand-blue" />
                    <p className="mt-4 text-xs font-black uppercase tracking-[0.08em] text-[#64748B]">
                      Premium hết hạn
                    </p>
                    <p className="mt-1 text-2xl font-black">{formatDate(profile.premiumExpiresAt)}</p>
                  </article>

                  <article className="rounded-[18px] border border-brand-light/60 bg-white p-5 shadow-[0_18px_48px_rgba(43,122,181,0.08)]">
                    <FileText className="h-7 w-7 text-[#24A148]" />
                    <p className="mt-4 text-xs font-black uppercase tracking-[0.08em] text-[#64748B]">
                      Số tài liệu đã xử lý
                    </p>
                    <p className="mt-1 text-2xl font-black">{profile.documentsProcessed ?? 0}</p>
                  </article>
                </section>

            <section className="rounded-[18px] border border-brand-light/60 bg-white p-6 shadow-[0_18px_48px_rgba(43,122,181,0.08)]">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <h2 className="text-lg font-black text-[#173154]">Thông tin tài khoản</h2>
                    {!isEditing ? (
                      <button
                        type="button"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] border border-brand-light/70 bg-white px-4 text-sm font-black text-brand-navy transition hover:bg-brand-light/15"
                        onClick={handleEditStart}
                      >
                        <PencilLine className="h-4 w-4" />
                        Chỉnh sửa hồ sơ
                      </button>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={handleEditCancel}
                          disabled={isSaving}
                        >
                          <X className="h-4 w-4" />
                          Hủy
                        </button>
                        <button
                          type="submit"
                          form="profile-edit-form"
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] bg-brand-blue px-4 text-sm font-black text-white transition hover:bg-brand-navy disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={isSaving}
                        >
                          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          Lưu thay đổi
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <form id="profile-edit-form" className="mt-5 grid gap-4" onSubmit={handleProfileSave}>
                      <label className="block">
                        <span className="mb-2 block text-sm font-black text-[#173154]">Tên hiển thị</span>
                        <input
                          type="text"
                          aria-label="Tên hiển thị"
                          value={formData.fullName}
                          onChange={(event) => setFormData((current) => ({ ...current, fullName: event.target.value }))}
                          className="min-h-12 w-full rounded-[14px] border border-[#D8E5F2] bg-[#F8FBFE] px-4 text-base font-semibold text-[#173154] outline-none transition focus:border-brand-blue focus:bg-white"
                          disabled={isSaving}
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-black text-[#173154]">Email</span>
                        <input
                          type="email"
                          aria-label="Email"
                          value={formData.email}
                          onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                          className="min-h-12 w-full rounded-[14px] border border-[#D8E5F2] bg-[#F8FBFE] px-4 text-base font-semibold text-[#173154] outline-none transition focus:border-brand-blue focus:bg-white"
                          disabled={isSaving}
                        />
                      </label>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-[16px] border border-[#E4EAF1] bg-[#F8FBFE] px-4 py-4">
                          <p className="text-xs font-black uppercase tracking-[0.08em] text-[#64748B]">Vai trò</p>
                          <p className="mt-1 text-base font-black text-[#173154]">{formatRole(profile.role)}</p>
                        </div>
                        <div className="rounded-[16px] border border-[#E4EAF1] bg-[#F8FBFE] px-4 py-4">
                          <p className="text-xs font-black uppercase tracking-[0.08em] text-[#64748B]">Gói đăng ký</p>
                          <p className="mt-1 text-base font-black text-[#173154]">{formatSubscriptionTier(profile.subscriptionTier)}</p>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      {infoItems.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-[16px] border border-[#E4EAF1] bg-[#F8FBFE] px-4 py-4"
                        >
                          <div className="flex items-center gap-3">
                            <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-brand-blue shadow-[0_8px_18px_rgba(43,122,181,0.10)]">
                              <item.icon className="h-5 w-5" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-black uppercase tracking-[0.08em] text-[#64748B]">
                                {item.label}
                              </p>
                              <p className="mt-1 truncate text-base font-black text-[#173154]">
                                {item.value}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="rounded-[18px] border border-rose-200 bg-white p-6 shadow-[0_18px_48px_rgba(43,122,181,0.08)]">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-lg font-black text-rose-700">Vùng nguy hiểm</h2>
                      <p className="mt-2 max-w-[680px] text-sm font-semibold leading-6 text-[#64748B]">
                        Xóa tài khoản sẽ xóa vĩnh viễn hồ sơ, tài liệu và dữ liệu học tập liên quan khỏi hệ thống.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] bg-rose-600 px-4 text-sm font-black text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting || isSaving || isUploading || pageLoading}
                    >
                      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      {isDeleting ? 'Đang xóa tài khoản' : 'Xóa tài khoản'}
                    </button>
                  </div>
                </section>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
