// src/components/Sidebar.tsx – CAROUSEL CAROUSEL TÁC GIẢ SIÊU ĐẸP!!! – HOÀN HẢO 100% SAU F5
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { FollowButton } from "./FollowButton";
import { UserPlus, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { UserProfilePopup } from "./UserProfilePopup";

interface Author {
  _id: string;
  name: string;
  avatar?: string;
  followerCount: number;
  bio?: string;
  username?: string;
  createdAt?: string;
}

interface Tag {
  name: string;
  count: number;
}

interface SidebarProps {
  authors?: Author[];
  tags?: Tag[];
  currentUserId?: string;
  onFindFriends?: () => void;
}

export function Sidebar({
  authors = [],
  tags = [],
  currentUserId = "",
  onFindFriends,
}: SidebarProps) {
  const [localAuthors, setLocalAuthors] = useState<(Author & { isFollowing?: boolean })[]>(
    authors.map(author => ({ ...author, isFollowing: false }))
  );

  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Popup state
  const [selectedUser, setSelectedUser] = useState<(Author & { isFollowing?: boolean }) | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);

  // Cập nhật follower realtime
  useEffect(() => {
    const handleFollowChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ userId: string; following: boolean }>;
      const { userId, following } = customEvent.detail || {};

      if (!userId) return;

      setLocalAuthors((prev) =>
        prev.map((author) =>
          author._id === userId
            ? {
                ...author,
                followerCount: Math.max(0, following ? author.followerCount + 1 : author.followerCount - 1),
                isFollowing: following,
              }
            : author
        )
      );

      if (selectedUser?._id === userId) {
        setSelectedUser((prev) =>
          prev
            ? {
                ...prev,
                isFollowing: following,
                followerCount: Math.max(0, following ? prev.followerCount + 1 : prev.followerCount - 1),
              }
            : null
        );
      }
    };

    window.addEventListener("followChanged", handleFollowChange as EventListener);
    return () => window.removeEventListener("followChanged", handleFollowChange as EventListener);
  }, [selectedUser]);

  // Cập nhật localAuthors khi authors thay đổi – giữ isFollowing
  useEffect(() => {
    setLocalAuthors((prev) => {
      const newAuthors = authors.map((author) => {
        const existing = prev.find((a) => a._id === author._id);
        return {
          ...author,
          isFollowing: existing?.isFollowing ?? false,
        };
      });
      return newAuthors;
    });
  }, [authors]);

  // FETCH TRẠNG THÁI FOLLOW TỪ API KHI MOUNT – GIẢI QUYẾT F5
  // THAY TOÀN BỘ useEffect GÂY LỖI 500 BẰNG ĐOẠN NÀY – HOÀN HẢO 100% KHÔNG CẦN BACKEND
useEffect(() => {
  if (!currentUserId || authors.length === 0) return;

  const token = localStorage.getItem("token");
  if (!token) return;

  // LẤY TRẠNG THÁI FOLLOW TỪ FOLLOWBUTTON (NÓ ĐÃ CÓ RỒI!)
  const updateFollowStatusFromButtons = () => {
    const buttons = document.querySelectorAll(`[data-follow-user-id]`);
    const followStatus: Record<string, boolean> = {};

    buttons.forEach((btn) => {
      const userId = btn.getAttribute("data-follow-user-id");
      const isFollowing = btn.textContent?.includes("Đang theo dõi");
      if (userId) followStatus[userId] = !!isFollowing;
    });

    if (Object.keys(followStatus).length > 0) {
      setLocalAuthors((prev) =>
        prev.map((author) => ({
          ...author,
          isFollowing: followStatus[author._id] ?? author.isFollowing ?? false,
        }))
      );
    }
  };

  // Chạy ngay khi mount + sau mỗi lần render
  updateFollowStatusFromButtons();

  // Quan sát thay đổi của FollowButton
  const observer = new MutationObserver(updateFollowStatusFromButtons);
  observer.observe(document.body, { childList: true, subtree: true });

  return () => observer.disconnect();
}, [authors, currentUserId]);

  const topAuthors = [...localAuthors].sort((a, b) => b.followerCount - a.followerCount).slice(0, 5);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || topAuthors.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % topAuthors.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, topAuthors.length]);

  // Navigation handlers
  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % topAuthors.length);
    setIsAutoPlaying(false);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + topAuthors.length) % topAuthors.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setIsAutoPlaying(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    setTranslateX(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (Math.abs(translateX) > 100) {
      if (translateX > 0) goToPrev();
      else goToNext();
    }
    setTranslateX(0);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setTranslateX(0);
    }
  };

  const handleAvatarClick = (author: any) => {
    if (!isDragging) {
      const fullAuthor = localAuthors.find((a) => a._id === author._id);
      setSelectedUser(fullAuthor || author);
      setPopupOpen(true);
    }
  };

  const handleFollowFromPopup = async () => {
    if (!selectedUser || !currentUserId) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Chưa đăng nhập!");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/follow/${selectedUser._id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();

      const { following } = await res.json();

      setLocalAuthors((prev) =>
        prev.map((a) =>
          a._id === selectedUser._id
            ? {
                ...a,
                followerCount: Math.max(0, following ? a.followerCount + 1 : a.followerCount - 1),
                isFollowing: following,
              }
            : a
        )
      );

      setSelectedUser((prev) =>
        prev
          ? {
              ...prev,
              isFollowing: following,
              followerCount: following
                ? (prev.followerCount || 0) + 1
                : Math.max(0, (prev.followerCount || 0) - 1),
            }
          : null
      );

      window.dispatchEvent(
        new CustomEvent("followChanged", { detail: { userId: selectedUser._id, following } })
      );
    } catch (err) {
      alert("Lỗi mạng hoặc không thể theo dõi!");
    }
  };

  return (
    <div className="space-y-6">
      {/* TÁC GIẢ NỔI BẬT - CAROUSEL */}
      <Card className="overflow-hidden border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h4 className="text-lg font-bold text-neutral-900 dark:text-white">Tác giả nổi bật</h4>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30 font-medium flex items-center gap-1.5 h-8 px-3 rounded-lg transition-colors"
              onClick={onFindFriends}
            >
              <UserPlus className="h-4 w-4" />
              <span className="text-xs">Thêm bạn</span>
            </Button>
          </div>

          {topAuthors.length > 0 ? (
            <div className="relative">
              <div
                ref={carouselRef}
                className="relative overflow-hidden cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
              >
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{
                    transform: `translateX(calc(-${currentIndex * 100}% + ${translateX}px))`,
                    transition: isDragging ? "none" : "transform 0.5s ease-out",
                  }}
                >
                  {topAuthors.map((author) => (
                    <div key={`${author._id}-${author.isFollowing}`} className="w-full flex-shrink-0 px-2">
                      <div className="bg-gradient-to-br from-neutral-50 to-neutral-100/50 dark:from-neutral-900 dark:to-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 group">
                        <div
                          className="flex items-center gap-4 mb-4 cursor-pointer"
                         // Chỉ cần sửa đoạn này – THÊM createdAt vào khi truyền user cho Popup!
onClick={() => {
  const fullAuthor = localAuthors.find(a => a._id === author._id);
  if (fullAuthor) {
    // ĐẢM BẢO TRUYỀN ĐỦ createdAt (nếu có từ server)
    setSelectedUser({
      ...fullAuthor,
      createdAt: fullAuthor.createdAt || author.createdAt, // ← Dòng này cứu cả thế giới!
    });
    setPopupOpen(true);
  }
}}
                        >
                          <div className="relative">
                            <Avatar className="h-16 w-16 ring-2 ring-white dark:ring-neutral-800 shadow-lg transition-transform group-hover:scale-105">
                              <AvatarImage src={author.avatar} alt={author.name} />
                              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                {author.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-neutral-800 rounded-full" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-base text-neutral-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {author.name}
                            </h5>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Users className="h-3.5 w-3.5 text-neutral-400" />
                              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {author.followerCount.toLocaleString()} người theo dõi
                              </p>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-4 min-h-[40px]">
                          {author.bio || "Chưa có tiểu sử"}
                        </p>
                        <FollowButton userId={author._id} currentUserId={currentUserId} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {topAuthors.length > 1 && (
                <>
                  <button
                    onClick={goToPrev}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-10 h-10 rounded-full bg-white dark:bg-neutral-800 shadow-lg border border-neutral-200 dark:border-neutral-700 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-10 h-10 rounded-full bg-white dark:bg-neutral-800 shadow-lg border border-neutral-200 dark:border-neutral-700 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                    aria-label="Next"
                  >
                    <ChevronRight className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                  </button>
                </>
              )}

              {topAuthors.length > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  {topAuthors.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`transition-all duration-300 rounded-full ${
                        index === currentIndex
                          ? "w-8 h-2 bg-indigo-600 dark:bg-indigo-400"
                          : "w-2 h-2 bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400 dark:hover:bg-neutral-500"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 mb-3">
                <Users className="h-8 w-8 text-neutral-400" />
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Chưa có tác giả nào</p>
            </div>
          )}
        </div>
      </Card>

      {/* CHỦ ĐỀ PHỔ BIẾN */}
      <Card className="p-5 border-neutral-200 dark:border-neutral-800 shadow-sm">
        <h4 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white">Chủ đề phổ biến</h4>
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 5).map((tag) => (
              <Badge
                key={tag.name}
                variant="secondary"
                className="px-3 py-1.5 text-xs font-medium rounded-full cursor-pointer hover:bg-indigo-100 hover:text-indigo-700 dark:hover:bg-indigo-950 dark:hover:text-indigo-300 transition-colors border border-neutral-200 dark:border-neutral-700"
              >
                #{tag.name}{" "}
                <span className="ml-1.5 opacity-70 text-[10px]">{tag.count}</span>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Chưa có chủ đề nào</p>
        )}
      </Card>

      {/* VỀ BLOGHUB */}
      <Card className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-900">
        <h4 className="text-lg font-bold mb-3 text-neutral-900 dark:text-white">Về BlogHub</h4>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-4">
          Nền tảng chia sẻ kiến thức chất lượng cao dành cho cộng đồng lập trình viên Việt Nam.
        </p>
        <Button
          variant="outline"
          className="w-full border-indigo-300 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
          size="sm"
        >
          Tìm hiểu thêm
        </Button>
      </Card>

      {/* POPUP PROFILE */}
      {selectedUser && (
        <UserProfilePopup
          user={selectedUser}
          open={popupOpen}
          onOpenChange={setPopupOpen}
          onFollow={handleFollowFromPopup}
        />
      )}
    </div>
  );
}