import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

/**
 * PortalLayout — Shell layout cho Cổng Giáo viên (Teacher Portal)
 * Sidebar (trái) + Main content area
 * Chỉ giáo viên đã đăng nhập mới truy cập được (đã bảo vệ bởi ProtectedRoute)
 */
export default function PortalLayout() {
    return (
        <div className="min-h-screen bg-white">
            <Sidebar />

            {/* Main content area — offset by sidebar width */}
            <div className="ml-[248px] min-h-screen flex flex-col">
                <main className="flex-1">
                    <div className="max-w-[1200px] mx-auto px-8 py-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
