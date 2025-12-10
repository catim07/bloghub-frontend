// src/components/UserProfilePopup.tsx
// FINAL VERSION – ĐẸP, ĐÚNG, HOÀN HẢO TUYỆT ĐỐI – NGÀY THAM GIA ĐÚNG NHƯ ADMIN!!!
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Users, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";

interface UserProfilePopupProps {
  user: {
    _id: string;
    name: string;
    username?: string;
    avatar?: string;
    bio?: string;
    followerCount?: number;
    createdAt?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFollow: () => Promise<void>;
}

export const UserProfilePopup = ({
  user,
  open,
  onOpenChange,
  onFollow,
}: UserProfilePopupProps) => {
  if (!user) return null;

  const API_URL = import.meta.env.VITE_API_URL;

  const [followState, setFollowState] = useState({
    isFollowing: false,
    followerCount: user.followerCount || 0,
  });

  // Chỉ fetch để lấy trạng thái "Đang theo dõi" hay chưa
  const fetchFollowStatus = async () => {
    if (!user._id) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/follow/status/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFollowState(prev => ({ ...prev, isFollowing: !!data.following }));
      }
    } catch (err) {
      console.error("Lỗi lấy trạng thái follow:", err);
    }
  };

  // Khi mở popup → cập nhật từ props (Sidebar đã có dữ liệu đúng)
  useEffect(() => {
    if (open) {
      setFollowState({
        isFollowing: followState.isFollowing,
        followerCount: user.followerCount || 0,
      });
      fetchFollowStatus();
    }
  }, [open, user._id, user.followerCount]);

  // Realtime khi có người follow/unfollow
  useEffect(() => {
    const handler = (e: Event) => {
      const event = e as CustomEvent<{ userId: string; following: boolean }>;
      if (event.detail?.userId === user._id) {
        setFollowState(prev => ({
          isFollowing: event.detail.following,
          followerCount: Math.max(0,
            event.detail.following ? prev.followerCount + 1 : prev.followerCount - 1
          ),
        }));
      }
    };
    window.addEventListener("followChanged", handler);
    return () => window.removeEventListener("followChanged", handler);
  }, [user._id]);

  const handleFollow = async () => {
    try {
      await onFollow();
      const newFollowing = !followState.isFollowing;
      setFollowState(prev => ({
        isFollowing: newFollowing,
        followerCount: newFollowing ? prev.followerCount + 1 : Math.max(0, prev.followerCount - 1),
      }));
      window.dispatchEvent(
        new CustomEvent("followChanged", {
          detail: { userId: user._id, following: newFollowing },
        })
      );
    } catch (err) {
      alert("Lỗi theo dõi!");
    }
  };

  // BẮT CHƯỚC CHUẨN NHƯ ADMIN – ĐẸP, NGẮN GỌN, KHÔNG "CHƯA RÕ" NỮA!
  const formatJoinDate = (date?: string) => {
    if (!date) return "Chưa rõ";
    return format(new Date(date), "dd/MM/yyyy");
  };

  const displayUsername = user.username || user.name.toLowerCase().replace(/\s+/g, "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">{user.name} Profile</DialogTitle>
      <DialogDescription className="sr-only">
        Hồ sơ chi tiết của người dùng {user.name}
      </DialogDescription>

      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-xl bg-white dark:bg-neutral-950">
        <div className="relative h-32 bg-gradient-to-br from-indigo-500/90 via-purple-500/90 to-pink-500/90 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        </div>

        <div className="relative px-6 pb-6 -mt-16">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-md opacity-30" />
              <Avatar className="relative h-32 w-32 ring-4 ring-white dark:ring-neutral-950 shadow-2xl border-2 border-white/50 dark:border-neutral-800/50">
                <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />
                <AvatarFallback className="text-5xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="text-center space-y-3">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
                {user.name}
              </h2>
              <p className="text-base text-neutral-500 dark:text-neutral-400">
                @{displayUsername}
              </p>
            </div>

            <div className="pt-1 pb-2">
              {user.bio ? (
                <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 max-w-sm mx-auto">
                  {user.bio}
                </p>
              ) : (
                <p className="text-sm italic text-neutral-400 dark:text-neutral-500">
                  Chưa có tiểu sử
                </p>
              )}
            </div>

            <div className="flex justify-center items-center gap-8 py-4 border-y border-neutral-100 dark:border-neutral-800">
              {/* Số người theo dõi */}
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-neutral-900 dark:text-white">
                    {followState.followerCount.toLocaleString()}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    người theo dõi
                  </div>
                </div>
              </div>

              <div className="h-10 w-px bg-neutral-200 dark:bg-neutral-700" />

              {/* Ngày tham gia – ĐẸP NHƯ ADMIN */}
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/30">
                  <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    Tham gia
                  </div>
                  <div className="text-sm font-medium text-neutral-900 dark:text-white">
                    {formatJoinDate(user.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Nút theo dõi */}
            <div className="pt-4">
              <Button
                onClick={handleFollow}
                size="lg"
                className={`w-full h-12 text-base font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] ${
                  followState.isFollowing
                    ? "border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30"
                }`}
              >
                {followState.isFollowing ? "Đang theo dõi" : "Theo dõi"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};