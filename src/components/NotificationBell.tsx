// src/components/NotificationBell.tsx – BẢN CUỐI CÙNG, HOÀN HẢO TUYỆT ĐỐI 2025
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Heart, MessageCircle, UserPlus, PenSquare } from "lucide-react";

import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const API_URL = import.meta.env.VITE_API_URL;

interface Notification {
  _id: string;
  type: "like" | "comment" | "follow" | "new_post"| "reply";
  from: { _id: string; name: string; avatar?: string };
  article?: { _id: string; title: string };
  message?: string;
  createdAt: string;
  read: boolean;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Lấy thông báo
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Lỗi tải thông báo:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Đánh dấu tất cả đã đọc
  const markAllAsRead = async () => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/notifications/read-all`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Lỗi đánh dấu tất cả:", err);
    }
  };

  // Đánh dấu 1 cái + điều hướng
  const handleClick = async (notif: Notification) => {
    if (!notif.read && token) {
      try {
        await fetch(`${API_URL}/api/notifications/${notif._id}/read`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(prev =>
          prev.map(n => (n._id === notif._id ? { ...n, read: true } : n))
        );
      } catch (err) {
        console.error("Lỗi đánh dấu đã đọc:", err);
      }
    }

    // Điều hướng
    if (notif.type === "follow") {
      navigate(`/profile/${notif.from._id}`);
    } else if (notif.article?._id) {
      navigate(`/post/${notif.article._id}`);
    }

    setOpen(false);
  };

  useEffect(() => {
    if (open && token) fetchNotifications();
  }, [open, token, fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
  switch (type) {
    case "like":
      return <Heart className="h-4 w-4 text-red-500" />;
    case "comment":
    case "reply":
      return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case "follow":
      return <UserPlus className="h-4 w-4 text-green-500" />;
    case "new_post":
      return <PenSquare className="h-4 w-4 text-purple-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

const getMessage = (n: Notification) => {
  const name = <strong className="font-semibold">{n.from.name}</strong>;
  
  switch (n.type) {
    case "like":
      return <>{name} đã thả tim bài viết của bạn</>;
    case "comment":
      return <>{name} đã bình luận bài viết của bạn</>;
    case "reply":
      return <>{name} đã <span className="text-blue-600 font-medium">trả lời bình luận</span> của bạn: <i className="italic text-gray-600">"{n.message}"</i></>;
    case "follow":
      return <>{name} đã theo dõi bạn</>;
    case "new_post":
      return <>{name} vừa đăng bài mới: <strong>{n.article?.title}</strong></>;
    default:
      return <>{name} có hoạt động mới</>;
  }
};

  return (
    <>
      {/* Chuông + Badge */}
      <div className="relative inline-block">
  {/* NÚT CHUÔNG */}
  <Button
    variant="ghost"
    size="icon"
    className="rounded-full hover:bg-accent relative"  // thêm relative ở đây là đủ
    onClick={() => setOpen(true)}
  >
    <Bell className="h-5 w-5" />
  </Button>

  {/* BADGE – DỄ CHỈNH NHẤT */}
  {unreadCount > 0 && (
    <div 
      className="absolute flex items-center justify-center pointer-events-none z-10"
      style={{ 
        top: "-8px",    // ← chỉnh lên xuống ở đây
        right: "-8px",  // ← chỉnh trái phải ở đây
      }}
    >
      <div className="relative">
        <span className="absolute inline-flex h-6 w-6 rounded-full bg-red-500 opacity-75 animate-ping" />
        <span className="relative inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-500 text-white text-xs font-bold shadow-lg">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      </div>
    </div>
  )}
</div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-0 max-h-[80vh] rounded-2xl overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-background z-10">
            <div className="flex items-center justify-between">
              <DialogTitle>Thông báo</DialogTitle>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Đánh dấu tất cả đã đọc
                </Button>
              )}
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] px-4 py-3">
            {loading ? (
              <p className="text-center py-12 text-muted-foreground">Đang tải...</p>
            ) : notifications.length === 0 ? (
              <p className="text-center py-16 text-muted-foreground">
                Chưa có thông báo nào
              </p>
            ) : (
              <div className="space-y-3 pb-6">
                {notifications.map(notif => (
                  <button
                    key={notif._id}
                    onClick={() => handleClick(notif)}
                    className={`w-full text-left flex gap-3 p-3 rounded-xl border transition-all ${
                      !notif.read
                        ? "bg-primary/5 border-primary/20 hover:bg-primary/10"
                        : "bg-background border-transparent hover:bg-muted/50"
                    }`}
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={notif.from.avatar} />
                      <AvatarFallback>{notif.from.name[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 text-sm">
                        {getIcon(notif.type)}
                        <p className="leading-relaxed">{getMessage(notif)}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        <TimeAgo date={notif.createdAt} />
                      </p>
                    </div>

                    {!notif.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Thời gian tiếng Việt đẹp + tự cập nhật mỗi 30s
function TimeAgo({ date }: { date: string }) {
  const [text, setText] = useState("...");

  useEffect(() => {
    let mounted = true;

    const update = () => {
      import("date-fns").then(({ formatDistanceToNow }) => {
        import("date-fns/locale/vi").then((viModule) => {
          const locale = (viModule as any).default || viModule;

          const result = formatDistanceToNow(new Date(date), {
            addSuffix: true,
            locale,
          })
            .replace("khoảng ", "")
            .replace("hơn ", "")
            .replace("ít hơn một phút trước", "vài giây trước");

          if (mounted) setText(result);
        });
      });
    };

    update();
    const interval = setInterval(update, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [date]);

  return <span className="text-xs text-muted-foreground">{text}</span>;
}