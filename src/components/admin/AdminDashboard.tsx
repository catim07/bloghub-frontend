// src/components/admin/AdminDashboard.tsx – ĐÃ HOÀN HẢO, KHÔNG CẦN SỬA ENV VÌ KHÔNG GỌI API TRỰC TIẾP
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  LayoutDashboard,
  FileText,
  MessageCircle,
  Users,
  Search,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { AdminStats } from "./AdminStats";
import { AdminPosts } from "./AdminPosts";
import { AdminUsers } from "./AdminUsers";
import { AdminComments } from "./AdminComments";

interface AdminDashboardProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
}

export function AdminDashboard({
  darkMode,
  toggleDarkMode,
  onLogout,
}: AdminDashboardProps) {
  const [currentPage, setCurrentPage] = useState<
    "stats" | "posts" | "comments" | "users"
  >("stats");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: "stats", label: "Thống kê", icon: LayoutDashboard },
    { id: "posts", label: "Bài viết", icon: FileText },
    { id: "comments", label: "Bình luận", icon: MessageCircle },
    { id: "users", label: "Người dùng", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-64 bg-background border-r border-border`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">BlogHub Admin</h2>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                  currentPage === item.id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Avatar className="h-10 w-10">
                <AvatarImage src="https://i.pravatar.cc/150?img=30" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">Admin User</p>
                <p className="text-xs text-muted-foreground truncate">
                  admin@bloghub.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex h-16 items-center gap-4 px-6">
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Desktop Sidebar Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm..."
                className="pl-10 bg-muted/50"
              />
            </div>

            {/* Right Side */}
                        {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* NÚT MỚI: QUAY LẠI TRANG CHỦ */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = "/"}  // Quay thẳng về trang chủ luôn!
                className="hidden sm:flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Trang chủ
              </Button>

              {/* Mobile: chỉ hiện icon */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.location.href = "/"}
                className="sm:hidden text-blue-600"
                title="Về trang chủ"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="rounded-full"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                className="rounded-full text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                title="Đăng xuất"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {currentPage === "stats" && <AdminStats />}
          {currentPage === "posts" && <AdminPosts />}
          {currentPage === "comments" && <AdminComments />}
          {currentPage === "users" && <AdminUsers />}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}