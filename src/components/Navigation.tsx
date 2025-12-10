import { Search, Moon, Sun, PenSquare, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { NotificationBell } from "./NotificationBell";

interface NavigationProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  onWriteClick?: () => void;
  onProfileClick?: () => void;
  onAuthClick?: () => void;
  onLogout?: () => void; // 🔹 Thêm props logout
  isLoggedIn?: boolean;
  currentUser?: {
    name?: string;
    avatar?: string;
  } | null;
}

export function Navigation({
  darkMode,
  toggleDarkMode,
  onWriteClick,
  onProfileClick,
  onAuthClick,
  onLogout,
  isLoggedIn = false,
  currentUser
}: NavigationProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <h1 className="text-primary font-bold text-xl cursor-pointer">
              BlogHub
            </h1>
          </div>

          {/* Search Bar */}
          <div className="relative hidden flex-1 max-w-md md:block mx-8">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm bài viết..."
              className="pl-10 bg-muted/50"
            />
          </div>

          {/* Right Side - Buttons */}
          <div className="flex items-center gap-3">
            {/* Viết bài */}
            {onWriteClick && isLoggedIn && (
              <Button
                onClick={onWriteClick}
                className="gap-2 bg-blue-600 hover:bg-blue-700 hidden md:inline-flex"
              >
                <PenSquare className="h-4 w-4" />
                Viết bài
              </Button>
            )}
            {isLoggedIn && <NotificationBell />}
            {/* Dark Mode Toggle */}
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

            {/* Auth Buttons / Avatar */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                {/* Avatar */}
                {onProfileClick && (
                  <Avatar
                    className="h-9 w-9 cursor-pointer ring-2 ring-transparent hover:ring-blue-600 transition-all"
                    onClick={onProfileClick}
                  >
                    <AvatarImage src={currentUser?.avatar || undefined} 
      alt={currentUser?.name || "User"}/>
                    <AvatarFallback>{currentUser?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                )}

                {/* Logout Button */}
                {onLogout && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onLogout}
                    title="Đăng xuất"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="hidden md:inline-flex"
                  onClick={onAuthClick}
                >
                  Đăng nhập
                </Button>
                <Button
                  className="hidden md:inline-flex bg-blue-600 hover:bg-blue-700"
                  onClick={onAuthClick}
                >
                  Đăng ký
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
