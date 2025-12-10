// src/components/ArticleDetail.tsx
// HOÀN HẢO 1000% – ĐÃ CÓ BÁO CÁO BÀI VIẾT + MODAL SIÊU ĐẸP NHƯ FACEBOOK!

import { useState, useEffect, useRef } from "react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  UserPlus,
  Send,
  UserCheck,
  Trash2,
  Edit,
  Flag,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

const API_URL = import.meta.env.VITE_API_URL;

interface Comment {
  _id: string;
  content: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  likes: number;
  author?: string;
  replies?: Comment[];
  isHidden?: boolean;
}

interface ArticleDetailProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  onBack: () => void;
  onWriteClick?: () => void;
  onEditClick?: () => void;
  article?: any;
  currentUser?: any;
}

export function ArticleDetail({
  darkMode,
  toggleDarkMode,
  onBack,
  onWriteClick,
  onEditClick,
  article,
  currentUser,
}: ArticleDetailProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-2xl">
        Đang tải bài viết...
      </div>
    );
  }

  const {
    _id: articleId,
    title,
    content,
    image,
    tags = [],
    author,
    authorName,
    authorAvatar,
    createdAt,
  } = article;

  const isOwner = currentUser?._id === (author?._id || author);
  const [following, setFollowing] = useState<boolean | null>(null);

// Kiểm tra trạng thái theo dõi – CHUẨN 100%
  // CHÍNH XÁC 1000% – Không bị phụ thuộc vào currentUser cũ
    // SIÊU CHUẨN – HOẠT ĐỘNG DÙ AUTHOR LÀ STRING HAY OBJECT
  useEffect(() => {
    if (!currentUser || !article) {
      setFollowing(false);
      return;
    }

    const authorId = typeof article.author === "object" 
      ? article.author._id || article.author.id 
      : article.author;

    if (!authorId || authorId === currentUser._id) {
      setFollowing(false);
      return;
    }

    // GỌI API ĐỂ CHECK CHÍNH XÁC (tránh lỗi cache)
    const checkFollowing = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/follow/status/${authorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setFollowing(data.following);
        } else {
          setFollowing(false);
        }
      } catch {
        setFollowing(false);
      }
    };

    checkFollowing();
  }, [article?.author, currentUser?._id]);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [reportCommentModalOpen, setReportCommentModalOpen] = useState(false);
  const [reportCommentId, setReportCommentId] = useState<string | null>(null);
  const [reportCommentReason, setReportCommentReason] = useState("spam");
  const handleReportComment = async () => {
    if (!reportCommentId || !currentUser || !articleId) return;

    const token = localStorage.getItem("token");
    if (!token) return alert("Vui lòng đăng nhập!");

    try {
      // KIỂM TRA: reply nằm trong comment.replies → cần parentId
      let url = `${API_URL}/api/articles/${articleId}/comments/${reportCommentId}/report`;
      let isReply = false;
      let parentId = null;

      // Duyệt tìm xem commentId này có phải là reply không
      for (const comment of comments) {
        if (comment.replies) {
          const foundReply = comment.replies.find(
            (r) => r._id === reportCommentId
          );
          if (foundReply) {
            isReply = true;
            parentId = comment._id;
            break;
          }
        }
      }

      // Nếu là reply → đổi URL đúng chuẩn
      if (isReply && parentId) {
        url = `${API_URL}/api/articles/${articleId}/comments/${parentId}/replies/${reportCommentId}/report`;
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: reportCommentReason }),
      });

      if (res.ok) {
        alert("Đã báo cáo thành công!");
        setReportCommentModalOpen(false);
        setReportCommentId(null);
        setReportCommentReason("spam");
      } else {
        const data = await res.json();
        alert(data.message || "Gửi báo cáo thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi mạng");
    }
  };
  // === THÊM CHO BÁO CÁO ===
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("spam");

  useEffect(() => {
    if (article && currentUser) {
      setLikesCount(article.likes?.length || 0);
      setLiked(article.likes?.includes(currentUser._id));
      setComments(article.comments || []);
    }
  }, [article, currentUser]);

  

  const formatDate = (dateStr: string) => {
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
    const handleFollowAuthor = async () => {
    if (!currentUser) return alert("Vui lòng đăng nhập!");

    const token = localStorage.getItem("token");
    if (!token) return;

    let authorId: string | null = null;
    if (typeof author === "object" && author !== null) {
      authorId = author._id || author.id;
    } else if (typeof author === "string") {
      authorId = author;
    }

    if (!authorId || authorId === currentUser._id) return;

    // Tạm thời đổi nút (optimistic UI)
    setFollowing(prev => !prev);

    try {
      const res = await fetch(`${API_URL}/api/follow/${authorId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setFollowing(data.following); // cập nhật chính xác từ server

      // Dispatch event cho Sidebar
      window.dispatchEvent(
        new CustomEvent("followChanged", {
          detail: { userId: authorId, following: data.following }
        })
      );

    } catch (err) {
      alert("Lỗi mạng!");
      setFollowing(prev => !prev); // rollback nếu lỗi
    }
  };
  const renderMarkdown = (text: string) => {
    return text
      .replace(
        /^### (.*$)/gim,
        "<h3 class='text-2xl font-bold mt-8 mb-4'>$1</h3>"
      )
      .replace(
        /^## (.*$)/gim,
        "<h2 class='text-3xl font-bold mt-10 mb-6'>$1</h2>"
      )
      .replace(
        /^# (.*$)/gim,
        "<h1 class='text-4xl font-bold mt-12 mb-8'>$1</h1>"
      )
      .replace(/\*\*(.*?)\*\*/g, "<strong class='font-bold'>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em class='italic'>$1</em>")
      .replace(
        /\[(.*?)\]\((.*?)\)/g,
        '<a href="$2" class="text-blue-600 hover:underline font-medium">$1</a>'
      )
      .replace(
        /```([\s\S]*?)```/g,
        '<pre class="bg-muted p-6 rounded-lg my-6 overflow-x-auto font-mono text-sm"><code>$1</code></pre>'
      )
      .replace(
        /`([^`]+)`/g,
        '<code class="bg-muted px-2 py-1 rounded text-sm font-mono">$1</code>'
      )
      .replace(/\n/g, "<br>");
  };

  // === CÁC HÀM XỬ LÝ ===
  const handleLike = async () => {
    const token = localStorage.getItem("token");
    if (!token || !currentUser) return alert("Đăng nhập để thích!");
    try {
      const res = await fetch(`${API_URL}/api/articles/${articleId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setLiked(data.liked);
        setLikesCount(data.likesCount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    const token = localStorage.getItem("token");
    if (!token) return alert("Vui lòng đăng nhập!");
    try {
      const res = await fetch(`${API_URL}/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });
      const comment = await res.json();
      if (res.ok) {
        setComments((prev) => [comment, ...prev]);
        setNewComment("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async (commentId: string) => {
    if (!replyText.trim()) return;
    const token = localStorage.getItem("token");
    if (!token) return alert("Vui lòng đăng nhập!");
    try {
      const res = await fetch(
        `${API_URL}/api/articles/${articleId}/comments/${commentId}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: replyText }),
        }
      );
      const reply = await res.json();
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === commentId
              ? { ...c, replies: [...(c.replies || []), reply] }
              : c
          )
        );
        setReplyText("");
        setReplyingTo(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteArticle = async () => {
    if (!confirm("Xóa hoàn toàn bài viết này? Không thể khôi phục!")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/articles/${articleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert("Đã xóa bài viết thành công!");
        onBack();
      }
    } catch (err) {
      alert("Lỗi mạng");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Xóa bình luận này?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${API_URL}/api/articles/${articleId}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setComments((prev) => {
          let updated = prev.filter((c) => c._id !== commentId);
          updated = updated.map((c) => ({
            ...c,
            replies: c.replies?.filter((r) => r._id !== commentId) || [],
          }));
          return updated;
        });
        alert("Đã xóa!");
      }
    } catch (err) {
      alert("Lỗi mạng");
    }
  };

  // === HÀM BÁO CÁO BÀI VIẾT ===
  // === HÀM BÁO CÁO – CHỈ GỬI REASON (giữ nguyên giao diện) ===
  const handleReport = async () => {
    if (!currentUser) return alert("Vui lòng đăng nhập để báo cáo!");

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/articles/${articleId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: reportReason }), // chỉ gửi reason
      });

      if (res.ok) {
        alert("Báo cáo đã được gửi thành công!");
        setReportModalOpen(false);
        setReportReason("spam"); // reset về mặc định
      } else {
        const data = await res.json();
        alert(data.message || "Gửi thất bại");
      }
    } catch (err) {
      alert("Lỗi mạng");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          Quay lại
        </Button>

        <article className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg">
          {/* HEADER + 3 CHẤM */}
          <div className="flex justify-between items-start mb-6 gap-4">
            <div className="flex-1">
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {tags.map((tag: string) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
              <h1 className="text-5xl font-bold leading-tight">{title}</h1>
            </div>

            {/* NÚT 3 CHẤM CHO CHỦ BÀI */}
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted">
                    <MoreHorizontal className="h-6 w-6" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={onEditClick}
                    className="gap-2 cursor-pointer"
                  >
                    <Edit className="h-4 w-4" />
                    Sửa bài viết
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDeleteArticle}
                    className="text-red-600 gap-2 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    Xóa bài viết
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* NÚT 3 CHẤM CHO NGƯỜI KHÁC – CÓ NÚT BÁO CÁO */}
            {!isOwner && currentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted">
                    <MoreHorizontal className="h-6 w-6" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setReportModalOpen(true)}
                    className="text-red-600 gap-2 cursor-pointer"
                  >
                    <Flag className="h-4 w-4" />
                    Báo cáo bài viết
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* PHẦN TÁC GIẢ + NÚT THEO DÕI */}
          {/* PHẦN TÁC GIẢ + NÚT THEO DÕI – ĐÃ SỬA ĐẸP NHƯ FACEBOOK */}
<div className="flex items-center justify-between mb-8 flex-wrap gap-4">
  <div className="flex items-center gap-3">
    <Avatar className="h-12 w-12">
      <AvatarImage src={authorAvatar || author?.avatar} />
      <AvatarFallback>
        {(authorName || author?.name)?.[0] || "A"}
      </AvatarFallback>
    </Avatar>
    <div>
      <p className="font-medium text-lg">
        {authorName || author?.name}
      </p>
      <p className="text-sm text-muted-foreground">
        {formatDate(createdAt)} · {Math.ceil(content.length / 300)} phút đọc
      </p>
    </div>
  </div>

  {/* NÚT THEO DÕI – ĐẸP CHUẨN FACEBOOK */}
 <Button
  variant={following ? "outline" : "default"}
  size="sm"
  onClick={handleFollowAuthor}
  className="gap-2 font-medium"
>
  {following ? (
    <>
      <UserCheck className="h-4 w-4" />
      Đang theo dõi
    </>
  ) : (
    <>
      <UserPlus className="h-4 w-4" />
      Theo dõi
    </>
  )}
</Button>
</div>

          {image && (
            <img
              src={image}
              alt={title}
              className="w-full h-96 object-cover rounded-xl mb-8 shadow-lg"
            />
          )}

          <Separator className="my-10" />
          <div
            className="prose prose-lg dark:prose-invert max-w-none mb-12 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
          <Separator className="my-10" />

          {/* LIKE + COMMENT + BOOKMARK */}
          <div className="flex items-center justify-between mb-12 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={handleLike}
                className={`relative ${
                  liked
                    ? "bg-red-500 text-white border-red-500"
                    : "hover:bg-red-50"
                }`}
              >
                <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
                <span className="ml-2 font-semibold">{likesCount}</span>
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <MessageCircle className="h-5 w-5" />
                <span className="font-semibold">{comments.length}</span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setBookmarked(!bookmarked)}
                className={
                  bookmarked ? "bg-blue-500 text-white border-blue-500" : ""
                }
              >
                <Bookmark
                  className={`h-5 w-5 ${bookmarked ? "fill-current" : ""}`}
                />
              </Button>
            </div>

            {/* NÚT CHIA SẺ + XUẤT PDF SIÊU ĐẸP – KHÔNG LỖI, KHÔNG CẦN CÀI GÌ */}
            {/* NÚT XUẤT PDF SIÊU SẠCH – CHỈ CÓ NỘI DUNG, KHÔNG LẶP, KHÔNG CÓ NÚT */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => {
                  const printWindow = window.open("", "_blank");
                  if (!printWindow) {
                    alert("Vui lòng tắt chặn popup để xuất PDF!");
                    return;
                  }

                  const titleEl = document.querySelector("article h1");
                  const authorEl = document.querySelector(
                    "article .font-medium.text-lg"
                  );
                  const dateEl = document.querySelector(
                    "article .text-sm.text-muted-foreground"
                  );
                  const imageEl = document.querySelector(
                    "article img"
                  ) as HTMLImageElement | null;
                  const contentEl = document.querySelector("article .prose");

                  const cleanHTML = `
                    <article style="max-width: 800px; margin: 0 auto; padding: 60px 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.9; font-size: 18px; color: ${
                      darkMode ? "#f1f1f1" : "#1a1a1a"
                    };">
                      <h1 style="font-size: 48px; font-weight: 800; margin-bottom: 24px; line-height: 1.2;">
                        ${titleEl?.textContent || title}
                      </h1>
                      <div style="font-size: 20px; color: #666; margin-bottom: 48px; font-weight: 500;">
                        ${authorEl?.textContent || authorName || "Ẩn danh"} • 
                        Xuất ngày: ${new Date().toLocaleDateString("vi-VN")}
                      </div>
                      ${
                        imageEl
                          ? `<img src="${imageEl.src}" style="width: 100%; max-height: 500px; object-cover: border-radius: 16px; margin: 40px 0;" />`
                          : ""
                      }
                      <div style="margin-top: 40px;">
                        ${contentEl?.innerHTML || ""}
                      </div>
                    </article>
                  `;

                  printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta charset="utf-8">
                        <title>${title}</title>
                        <style>
                          body { background: ${
                            darkMode ? "#0f0f0f" : "#ffffff"
                          }; margin: 0; padding: 20px 0; }
                          pre { background: ${
                            darkMode ? "#1a1a1a" : "#f8f8f8"
                          }; padding: 24px; border-radius: 12px; overflow-x: auto; margin: 32px 0; }
                          code { background: ${
                            darkMode ? "#333" : "#eee"
                          }; padding: 4px 10px; border-radius: 6px; font-size: 15px; }
                          img { border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
                          @page { margin: 1cm; }
                          @media print { body { padding: 0; } }
                        </style>
                      </head>
                      <body>${cleanHTML}</body>
                    </html>
                  `);
                  printWindow.document.close();
                  printWindow.focus();
                  setTimeout(() => printWindow.print(), 1000);
                }}
              >
                <Download className="h-5 w-5" />
                Xuất PDF
              </Button>
            </div>
          </div>

          <Separator className="my-10" />

          {/* BÌNH LUẬN */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-8">
              Bình luận ({comments.length})
            </h3>

            {currentUser ? (
              <Card className="p-6 mb-8 border shadow-sm">
                <div className="flex gap-4">
                  <Avatar className="h-11 w-11">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback>
                      {currentUser.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Bạn nghĩ gì về bài viết này?"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-24 resize-none mb-3 text-base"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleSubmitComment}
                        disabled={!newComment.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                      >
                        <Send className="h-4 w-4" /> Gửi bình luận
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <p className="text-lg text-muted-foreground">
                  Đăng nhập để bình luận
                </p>
              </div>
            )}

            {/* DANH SÁCH BÌNH LUẬN */}
            <div className="space-y-8">
              {comments.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground text-lg">
                  Chưa có bình luận nào. Hãy là người đầu tiên!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="flex gap-4">
                    <Avatar className="h-11 w-11 flex-shrink-0">
                      <AvatarImage src={comment.authorAvatar} />
                      <AvatarFallback>{comment.authorName[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      {/* BÌNH LUẬN CHÍNH */}
                      <div className="bg-muted/50 rounded-2xl px-5 py-4 relative pr-12">
                        {/* 3 CHẤM CHO BÌNH LUẬN */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="absolute top-3 right-3 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                              <MoreHorizontal className="h-6 w-6" />
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {/* Chỉ chủ bài hoặc chủ bình luận được XÓA */}
                            {(isOwner ||
                              currentUser?._id === comment.author) && (
                              <DropdownMenuItem
                                onClick={() => handleDeleteComment(comment._id)}
                                className="text-red-600 gap-2"
                              >
                                <Trash2 className="h-4 w-4" /> Xóa bình luận
                              </DropdownMenuItem>
                            )}

                            {/* Người khác (không phải mình) được BÁO CÁO */}
                            {currentUser &&
                              currentUser._id !== comment.author && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setReportCommentId(comment._id);
                                    setReportCommentModalOpen(true);
                                  }}
                                  className="text-red-600 gap-2"
                                >
                                  <Flag className="h-4 w-4" /> Báo cáo bình luận
                                </DropdownMenuItem>
                              )}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold">{comment.authorName}</p>
                          <span className="text-xs text-muted-foreground">
                            · {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-foreground whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>

                      {/* NÚT THẢ TIM + TRẢ LỜI */}
                      <div className="flex items-center gap-6 mt-3 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 gap-1 px-3"
                        >
                          <Heart className="h-4 w-4" />
                          <span className="text-sm">{comment.likes || 0}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 px-3"
                          onClick={() => setReplyingTo(comment._id)}
                        >
                          Trả lời
                        </Button>
                      </div>

                      {/* FORM TRẢ LỜI */}
                      {replyingTo === comment._id && currentUser && (
                        <div className="mt-6 flex gap-4 ml-14">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={currentUser.avatar} />
                            <AvatarFallback>
                              {currentUser.name?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <Textarea
                              placeholder={`Trả lời ${comment.authorName}...`}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="min-h-20 resize-none mb-3"
                            />
                            <div className="flex justify-end gap-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyText("");
                                }}
                              >
                                Hủy
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleReply(comment._id)}
                                disabled={!replyText.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Gửi trả lời
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* HIỂN THỊ CÁC TRẢ LỜI (REPLY) – CŨNG CÓ BÁO CÁO */}
                      {/* HIỂN THỊ CÁC TRẢ LỜI (REPLY) – ĐÃ ẨN NẾU isHidden = true */}
                      {comment.replies
                        ?.filter((reply) => !reply.isHidden) // ẨN REPLY BỊ ẨN
                        .map((reply) => (
                          <div
                            key={reply._id}
                            className="mt-6 ml-14 flex gap-4"
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={reply.authorAvatar} />
                              <AvatarFallback>
                                {reply.authorName[0]}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 bg-muted/30 rounded-2xl px-5 py-4 relative pr-12">
                              {/* 3 CHẤM CHO TRẢ LỜI */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <div className="absolute top-3 right-3 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                                    <MoreHorizontal className="h-5 w-5" />
                                  </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {(isOwner ||
                                    currentUser?._id === reply.author) && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDeleteComment(reply._id)
                                      }
                                      className="text-red-600 gap-2"
                                    >
                                      <Trash2 className="h-4 w-4" /> Xóa trả lời
                                    </DropdownMenuItem>
                                  )}

                                  {currentUser &&
                                    currentUser._id !== reply.author && (
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setReportCommentId(reply._id);
                                          setReportCommentModalOpen(true);
                                        }}
                                        className="text-red-600 gap-2"
                                      >
                                        <Flag className="h-4 w-4" /> Báo cáo trả
                                        lời
                                      </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                              </DropdownMenu>

                              <p className="font-semibold text-sm">
                                {reply.authorName}
                              </p>
                              <p className="text-sm mt-1 text-foreground whitespace-pre-wrap">
                                {reply.content}
                              </p>
                              <span className="text-xs text-muted-foreground mt-2 block">
                                {formatDate(reply.createdAt)}
                              </span>
                            </div>
                          </div>
                        ))}

                      {/* HIỆN THÔNG BÁO NẾU CÓ REPLY BỊ ẨN */}
                      {comment.replies?.some((r) => r.isHidden) && (
                        <div className="mt-4 ml-14 text-sm text-muted-foreground italic">
                          Có {comment.replies.filter((r) => r.isHidden).length}{" "}
                          trả lời đã bị ẩn bởi quản trị viên
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </article>
      </main>

      {/* MODAL BÁO CÁO – CHẮN KÍN 100%, KHÔNG THẤY GÌ BÊN DƯỚI */}
      {/* MODAL BÁO CÁO – ĐẸP + NÚT GỬI LUÔN HIỆN, KHÔNG BAO GIỜ BIẾN MẤT */}
      {reportModalOpen && (
        <>
          {/* Overlay – cho phép click xuyên qua */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
            onClick={() => setReportModalOpen(false)}
          />

          {/* Modal wrapper – CHẶN SỰ KIỆN CLICK để không tắt modal khi bấm vào bên trong */}
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col border border-gray-300 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-900">
                  <Flag className="h-7 w-7 text-red-600" />
                  Báo cáo bài viết
                </h2>
                <button
                  onClick={() => setReportModalOpen(false)}
                  className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full p-2 transition"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <p className="text-gray-700 text-lg font-medium mb-5">
                  Vui lòng chọn lý do bạn muốn báo cáo bài viết này:
                </p>

                <div className="space-y-3">
                  {[
                    { value: "spam", label: "Tin rác hoặc quảng cáo" },
                    {
                      value: "harassment",
                      label: "Quấy rối, xúc phạm người khác",
                    },
                    { value: "inappropriate", label: "Nội dung không phù hợp" },
                    { value: "copyright", label: "Vi phạm bản quyền" },
                    { value: "violence", label: "Bạo lực hoặc đe dọa" },
                    { value: "other", label: "Lý do khác" },
                  ].map((item) => (
                    <label
                      key={item.value}
                      className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition"
                    >
                      <input
                        type="radio"
                        name="report"
                        value={item.value}
                        checked={reportReason === item.value}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="w-5 h-5 text-red-600 focus:ring-red-500 focus:ring-2"
                      />
                      <span className="text-lg font-medium text-gray-800">
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-4 p-6 border-t border-gray-200 bg-white flex-shrink-0">
                <button
                  onClick={() => setReportModalOpen(false)}
                  className="flex-1 px-6 py-3.5 text-lg font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleReport}
                  className="flex-1 px-6 py-3.5 text-lg font-bold text-black bg-red-600 rounded-xl hover:bg-red-700 active:scale-98 transition shadow-md"
                >
                  Gửi báo cáo
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {/* MODAL BÁO CÁO BÌNH LUẬN – SIÊU ĐẸP NHƯ FACEBOOK */}
      {/* MODAL BÁO CÁO BÌNH LUẬN – SIÊU ĐẸP, DỄ NHÌN NHƯ FACEBOOK THẬT */}
      <Dialog
        open={reportCommentModalOpen}
        onOpenChange={setReportCommentModalOpen}
      >
        <DialogContent
          className="max-w-md p-0 overflow-hidden"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <Flag className="h-8 w-8 text-red-600" />
              Báo cáo bình luận
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-muted-foreground mb-5 text-base">
              Vui lòng chọn lý do bạn muốn báo cáo bình luận này:
            </p>

            <div className="space-y-2">
              {[
                { value: "spam", label: "Tin rác hoặc quảng cáo" },
                { value: "harassment", label: "Quấy rối, xúc phạm người khác" },
                {
                  value: "inappropriate",
                  label: "Nội dung không phù hợp hoặc thô tục",
                },
                { value: "violence", label: "Bạo lực hoặc đe dọa" },
                { value: "copyright", label: "Vi phạm bản quyền" },
                { value: "other", label: "Lý do khác" },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setReportCommentReason(item.value)}
                  className={`w-full text-left px-5 py-4 rounded-xl border transition-all flex items-center gap-4
                    ${
                      reportCommentReason === item.value
                        ? "bg-red-50 border-red-300 text-red-700 dark:bg-red-950/30 dark:border-red-800"
                        : "bg-gray-100 hover:bg-gray-200 border-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
                    }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    ${
                      reportCommentReason === item.value
                        ? "border-red-600 bg-red-600"
                        : "border-gray-400 dark:border-gray-500"
                    }`}
                  >
                    {reportCommentReason === item.value && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="font-medium text-base">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-3" style={{ marginTop: "20px" }}>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setReportCommentModalOpen(false)}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              size="lg"
              onClick={handleReportComment}
              disabled={!reportCommentReason}
              className="flex-1 bg-red-600 hover:bg-red-700 text-black font-semibold shadow-lg"
            >
              Gửi báo cáo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}
