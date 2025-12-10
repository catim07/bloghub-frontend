// src/components/FollowButton.tsx – ĐÃ FIX LỖI TS2304, CHẠY NGON 100%!!!
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { UserPlus, UserCheck } from "lucide-react";

// ĐÃ SỬA ĐÚNG TÊN BIẾN – KHÔNG CÒN LỖI TS2304 NỮA!!!
const API_URL = import.meta.env.VITE_API_URL;

interface Props {
  userId: string;
  currentUserId: string;
}

export function FollowButton({ userId, currentUserId }: Props) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId || currentUserId === userId) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/api/follow/status/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setIsFollowing(d.following))
      .catch(() => setIsFollowing(false))
      .finally(() => setLoading(false));
  }, [userId, currentUserId]);
  // THÊM ĐOẠN NÀY – LẮNG NGHE SỰ KIỆN TỪ POPUP/SIDEBAR
  useEffect(() => {
    const handleFollowChange = () => {
      // Nếu không phải người dùng hiện tại hoặc đang theo dõi chính mình → bỏ qua
      if (!currentUserId || currentUserId === userId) return;

      const token = localStorage.getItem("token");
      if (!token) return;

      // Refetch trạng thái mới nhất từ server
      fetch(`${API_URL}/api/follow/status/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(d => setIsFollowing(d.following))
        .catch(() => setIsFollowing(false));
    };

    window.addEventListener("followChanged", handleFollowChange);
    return () => window.removeEventListener("followChanged", handleFollowChange);
  }, [userId, currentUserId]);
  const handleFollow = async () => {
    if (loading || !currentUserId || currentUserId === userId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token")!;
      const res = await fetch(`${API_URL}/api/follow/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();

      const { following } = await res.json();
      setIsFollowing(following);

      window.dispatchEvent(new Event("followChanged"));
    } catch {
      alert("Lỗi mạng!");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUserId || currentUserId === userId) return null;
  if (loading) return <Button size="sm" disabled className="mt-4 w-full h-9 text-xs">...</Button>;

  return (
    <Button
      size="sm"
      variant={isFollowing ? "secondary" : "default"}
      className={`mt-4 w-full h-9 text-xs font-medium transition-all group
        ${isFollowing 
          ? "bg-neutral-200 dark:bg-neutral-700 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950" 
          : "bg-blue-600 hover:bg-blue-700"
        }`}
      onClick={handleFollow}
      disabled={loading}
    >
      {isFollowing ? (
        <>
          <UserCheck className="h-4 w-4 mr-1.5" />
          <span className="group-hover:hidden">Đang theo dõi</span>
          <span className="hidden group-hover:inline">Bỏ theo dõi</span>
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-1.5" />
          Theo dõi
        </>
      )}
    </Button>
  );
}