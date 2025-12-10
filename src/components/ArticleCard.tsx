// src/components/ArticleCard.tsx – BẢN CHÍNH THỨC CUỐI CÙNG CỦA BẠN (KHÔNG SỬA GIAO DIỆN, GIỮ NGUYÊN 100%)
import { Heart, MessageCircle, Bookmark } from "lucide-react";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ArticleCardProps {
  _id?: string;
  title: string;
  description?: string;
  content?: string;
  author?: { name?: string; avatar?: string; _id?: string };
  authorName?: string;
  authorAvatar?: string;
  thumbnail?: string;
  image?: string;
  likes?: number | any[];
  comments?: any[];        // ← để nhận cả số lẫn mảng đều ok
  tags?: string[];
  readTime?: string;
  date?: string;
  createdAt?: string;
  onClick?: () => void;
}

export function ArticleCard({
  title,
  description,
  content,
  author,
  authorName,
  authorAvatar,
  thumbnail,
  image,
  likes = 0,
  comments = [],
  tags = [],
  readTime,
  date,
  createdAt,
  onClick,
}: ArticleCardProps) {
  const displayName = authorName || author?.name || "Ẩn danh";
  const avatarUrl = authorAvatar || author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
  const coverImage = thumbnail || image || "";

  const desc = description || (content ? content.replace(/<[^>]*>/g, "").substring(0, 150) + "..." : "Không có mô tả");

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Vừa xong";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };
  const displayDate = date || (createdAt ? formatDate(createdAt) : "Vừa xong");
  const timeToRead = readTime || (content ? `${Math.ceil(content.replace(/<[^>]*>/g, "").length / 300)} phút đọc` : "1 phút đọc");

  // Xử lý likes & comments count – giữ nguyên logic của bạn
  const likesCount = Array.isArray(likes) ? likes.length : likes || 0;
  const commentsCount = Array.isArray(comments) ? comments.length : (typeof comments === "number" ? comments : 0);

  return (
    <Card
      className="overflow-hidden border border-border hover:shadow-xl transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="aspect-[16/9] overflow-hidden bg-muted">
        {coverImage ? (
          <ImageWithFallback
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-4xl font-bold opacity-50">{displayName[0]}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="secondary" className="rounded-full text-xs">
                #{tag}
              </Badge>
            ))}
            {tags.length > 3 && <Badge variant="secondary" className="rounded-full text-xs">+{tags.length - 3}</Badge>}
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl font-bold line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground text-sm line-clamp-2">
          {desc}
        </p>

        {/* Author & Stats */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 ring-2 ring-background">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>{displayName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground">
                {displayDate} · {timeToRead}
              </p>
            </div>
          </div>

          {/* CHỈ HIỆN SỐ – ĐẸP, SẠCH, MƯỢT */}
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4 hover:fill-red-500 hover:text-red-500 transition-all" />
              <span className="text-sm font-medium">{likesCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4 hover:fill-blue-500 hover:text-blue-500 transition-all" />
              <span className="text-sm font-medium">{commentsCount}</span>
            </div>
            <Bookmark className="h-5 w-5 hover:fill-current hover:text-blue-600 transition-all" />
          </div>
        </div>
      </div>
    </Card>
  );
}