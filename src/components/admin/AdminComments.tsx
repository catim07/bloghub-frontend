// src/components/admin/AdminComments.tsx – PHIÊN BẢN HOÀN HẢO NHẤT (01/12/2025)
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Card } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Search, MoreHorizontal, Trash2, Check, Flag, Eye, EyeOff} from "lucide-react";
import { format } from "date-fns";

const API_URL = import.meta.env.VITE_API_URL;

// Interface báo cáo bình luận
interface Report {
  _id: string;
  reporter: {
    _id: string;
    name: string;
    avatar?: string;
  } | string;
  reason: string;
  detail?: string;
  reportedAt: string;
}

// Interface bình luận (bao gồm cả reply)
interface CommentItem {
  _id: string;
  content: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  postId: string;
  postTitle: string;
  reports: Report[];
  isReply?: boolean;
  isHidden?: boolean;
  parentCommentId?: string;
}

export function AdminComments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal chi tiết báo cáo
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<CommentItem | null>(null);

  const fetchAllComments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/articles`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Không thể tải bài viết");

      const posts = await res.json();
      const allComments: CommentItem[] = [];

      posts.forEach((post: any) => {
        const processComment = (comment: any, isReply = false) => {
          allComments.push({
            _id: comment._id,
            content: comment.content,
            authorName: comment.authorName || "Người dùng đã xóa",
            authorAvatar: comment.authorAvatar,
            createdAt: comment.createdAt,
            postId: post._id,
            postTitle: post.title,
            reports: comment.reports || [],
            isReply,
            isHidden: comment.isHidden || false,
          });
        };

        // Bình luận chính
        post.comments?.forEach((c: any) => {
  processComment(c, false);

  // Trả lời (reply)
  // Trả lời (reply) – ĐÃ SỬA ĐÚNG 100%
c.replies?.forEach((r: any) => {
  allComments.push({
    _id: r._id,
    content: r.content,
    authorName: r.authorName || "Người dùng đã xóa",
    authorAvatar: r.authorAvatar,
    createdAt: r.createdAt,
    postId: post._id,
    postTitle: post.title,
    reports: r.reports || [],
    isReply: true,                              // BẮT BUỘC CÓ
    parentCommentId: c._id.toString(),          // BẮT BUỘC CÓ VÀ ĐÚNG
    isHidden: r.isHidden || false,
  });
});
});
      });

      // Sắp xếp mới nhất trước
      allComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setComments(allComments);
    } catch (err) {
      console.error("Lỗi tải bình luận:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllComments();
  }, []);
  const toggleHideComment = async (commentId: string, postId: string, currentHidden: boolean) => {
  if (!confirm(currentHidden ? "Hiện lại mục này?" : "Ẩn mục này?")) return;

  const token = localStorage.getItem("token");
  if (!token) return alert("Token hết hạn!");

  try {
    // TÌM COMMENT ĐỂ LẤY THÔNG TIN CHÍNH XÁC
    const comment = comments.find(c => c._id === commentId);
    if (!comment) return alert("Không tìm thấy bình luận");

    let url = "";

    if (comment.isReply && comment.parentCommentId) {
      // LÀ REPLY → GỌI ĐÚNG ROUTE REPLY
      url = `${API_URL}/api/articles/${postId}/comments/${comment.parentCommentId}/replies/${commentId}/toggle-hide`;
    } else {
      // LÀ BÌNH LUẬN CHÍNH
      url = `${API_URL}/api/articles/${postId}/comments/${commentId}/toggle-hide`;
    }

    console.log("URL gọi ẩn:", url); // ← KIỂM TRA LOG NÀY TRONG CONSOLE ĐỂ CHẮC CHẮN!

    const res = await fetch(url, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();
      setComments(prev => prev.map(c => 
        c._id === commentId ? { ...c, isHidden: data.isHidden } : c
      ));
      alert(data.message || (data.isHidden ? "Đã ẩn thành công!" : "Đã hiện lại!"));
    } else {
      const error = await res.json();
      console.error("Lỗi từ server:", error);
      alert(error.message || "Thao tác thất bại (404/500)");
    }
  } catch (err) {
    console.error("Lỗi mạng:", err);
    alert("Lỗi kết nối server");
  }
};
  const handleDeleteComment = async (commentId: string, postId: string, isReply: boolean = false, parentId?: string) => {
  if (!confirm("Xóa vĩnh viễn mục này? Không thể khôi phục!")) return;

  try {
    const token = localStorage.getItem("token");
    let url = "";

    if (isReply && parentId) {
      // XÓA REPLY
      url = `${API_URL}/api/articles/${postId}/comments/${parentId}/replies/${commentId}`;
    } else {
      // XÓA BÌNH LUẬN CHÍNH
      url = `${API_URL}/api/articles/${postId}/comments/${commentId}`;
    }

    const res = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setComments(prev => prev.filter(c => c._id !== commentId));
      alert("Đã xóa thành công!");
    } else {
      const error = await res.text();
      alert("Xóa thất bại: " + error);
    }
  } catch (err) {
    alert("Lỗi kết nối server");
  }
};

  const openReportModal = (comment: CommentItem) => {
    setSelectedComment(comment);
    setReportModalOpen(true);
  };

  const filteredComments = comments.filter(c =>
    c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.postTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: comments.length,
    clean: comments.filter(c => c.reports.length === 0).length,
    reported: comments.filter(c => c.reports.length > 0).length,
    hidden: comments.filter(c => c.isHidden).length,
  };

  if (loading) return <div className="text-center py-20 text-xl">Đang tải bình luận...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Quản lý bình luận</h2>
        <p className="text-muted-foreground">Kiểm duyệt tất cả bình luận & trả lời trên BlogHub</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
  <Card className="p-5 border-l-4 border-l-blue-500">
    <div className="text-sm text-muted-foreground">Tổng bình luận</div>
    <div className="text-3xl font-bold mt-1">{stats.total}</div>
  </Card>
  <Card className="p-5 border-l-4 border-l-green-500">
    <div className="text-sm text-muted-foreground">Sạch sẽ</div>
    <div className="text-3xl font-bold text-green-600 mt-1">{stats.clean}</div>
  </Card>
  <Card className="p-5 border-l-4 border-l-red-500">
    <div className="text-sm text-muted-foreground">Bị báo cáo</div>
    <div className="text-3xl font-bold text-red-600 mt-1">{stats.reported}</div>
  </Card>
  <Card className="p-5 border-l-4 border-l-orange-500">
    <div className="text-sm text-muted-foreground">Đã ẩn</div>
    <div className="text-3xl font-bold text-orange-600 mt-1">{stats.hidden}</div>
  </Card>
</div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm bình luận, người dùng, bài viết..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead className="w-80">Nội dung</TableHead>
              <TableHead>Bài viết</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead className="text-center"><Flag className="h-4 w-4 text-red-600 mx-auto" /> Báo cáo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredComments.map(comment => {
              const reportCount = comment.reports.length;
              return (
                <TableRow key={comment._id} className={comment.isHidden ? "opacity-60 bg-orange-50" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={comment.authorAvatar} />
                        <AvatarFallback>{comment.authorName[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{comment.authorName}</p>
                        <div className="flex gap-1">
  {comment.isReply && <Badge variant="secondary" className="text-xs">Trả lời</Badge>}
  {comment.isHidden && <Badge variant="outline" className="text-orange-600 text-xs">Đã ẩn</Badge>}
</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-lg">
                    <p className={`text-sm line-clamp-3 ${comment.isHidden ? "italic text-muted-foreground" : ""}`}>
  {comment.isHidden ? "[Bình luận đã bị ẩn]" : comment.content}
</p>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-muted-foreground line-clamp-1">{comment.postTitle}</p>
                  </TableCell>
                  <TableCell>
                    {reportCount > 0 ? (
  <Badge variant="destructive" className="gap-1">
    <Flag className="h-3 w-3" />
    {reportCount} báo cáo
  </Badge>
) : comment.isHidden ? (
  <Badge variant="outline" className="text-orange-600">Đã ẩn</Badge>
) : (
  <Badge className="bg-green-100 text-green-700">Bình thường</Badge>
)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(comment.createdAt), "dd/MM HH:mm")}
                  </TableCell>

                  {/* CỘT BÁO CÁO */}
                  <TableCell className="text-center">
                    <button
                      onClick={() => openReportModal(comment)}
                      className="font-bold hover:underline"
                    >
                      {reportCount > 0 ? (
                        <Badge variant="destructive" className="cursor-pointer">
                          {reportCount}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </button>
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
  <DropdownMenuItem
    onClick={() => toggleHideComment(comment._id, comment.postId, comment.isHidden || false)}
    className={comment.isHidden ? "text-green-600" : "text-orange-600"}
  >
    {comment.isHidden ? (
      <>Hiện lại bình luận</>
    ) : (
      <>Ẩn bình luận</>
    )}
  </DropdownMenuItem>
  <DropdownMenuItem className="text-green-600">
    <Check className="h-4 w-4 mr-2" />
    Duyệt bình luận
  </DropdownMenuItem>
  <DropdownMenuItem
  onClick={() => handleDeleteComment(
    comment._id,
    comment.postId,
    comment.isReply || false,
    comment.isReply ? (comment as any).parentCommentId : undefined
  )}
  className="text-red-600"
>
  <Trash2 className="h-4 w-4 mr-2" />
  Xóa bình luận
</DropdownMenuItem>
</DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredComments.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  Không tìm thấy bình luận nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* MODAL CHI TIẾT BÁO CÁO – ĐẸP NHƯ FACEBOOK */}
      {/* MODAL CHI TIẾT BÁO CÁO – ĐÃ THÊM XÓA BÌNH LUẬN + XÓA TỪNG BÁO CÁO */}
<Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="text-2xl flex items-center gap-3">
        <Flag className="h-7 w-7 text-red-600" />
        Chi tiết báo cáo bình luận
      </DialogTitle>
    </DialogHeader>

    {selectedComment && (
      <div className="space-y-6">

        {/* NỘI DUNG BÌNH LUẬN */}
        <div>
          <h3 className="font-semibold text-lg mb-2">Nội dung bình luận:</h3>
          <div className="bg-muted p-4 rounded-lg text-lg">
            "{selectedComment.content}"
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Trong bài: <span className="font-medium">{selectedComment.postTitle}</span>
            {selectedComment.isReply && " (trong phần trả lời)"}
          </p>
        </div>

        {/* DANH SÁCH BÁO CÁO + NÚT XÓA TỪNG BÁO CÁO */}
        <div>
          <h3 className="font-semibold text-lg mb-4">
            Danh sách báo cáo ({selectedComment.reports.length})
          </h3>

          {selectedComment.reports.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Chưa có báo cáo nào</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người báo cáo</TableHead>
                  <TableHead>Lý do</TableHead>
                  <TableHead>Chi tiết</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead className="w-24 text-center">Công cụ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedComment.reports.map((report: any) => {
                  const name = typeof report.reporter === "object" ? report.reporter.name : "Người dùng đã xóa";
                  const avatar = typeof report.reporter === "object" ? report.reporter.avatar : null;

                  return (
                    <TableRow key={report._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={avatar || undefined} />
                            <AvatarFallback>{name[0]?.toUpperCase() || "X"}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">{report.reason || "Không rõ"}</Badge>
                      </TableCell>
                      <TableCell className="text-sm max-w-xs">{report.detail || "—"}</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(report.reportedAt), "dd/MM/yyyy HH:mm")}
                      </TableCell>

                      {/* NÚT XÓA BÁO CÁO SAI */}
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:bg-red-100 rounded-full"
                          onClick={async () => {
                            if (!confirm("Xóa báo cáo này?\n(Nếu báo cáo sai sự thật hoặc nhầm lẫn)")) return;

                            try {
                              const token = localStorage.getItem("token");
                              const res = await fetch(
                                `${API_URL}/api/articles/${selectedComment.postId}/comments/${selectedComment._id}/reports/${report._id}`,
                                {
                                  method: "DELETE",
                                  headers: { Authorization: `Bearer ${token}` },
                                }
                              );

                              if (res.ok) {
                                // Xóa realtime khỏi modal
                                setSelectedComment(prev => prev ? {
                                  ...prev,
                                  reports: prev.reports.filter(r => r._id !== report._id)
                                } : null);

                                // Cập nhật lại danh sách bình luận (nếu cần)
                                setComments(prev => prev.map(c =>
                                  c._id === selectedComment._id
                                    ? { ...c, reports: c.reports.filter(r => r._id !== report._id) }
                                    : c
                                ));
                              } else {
                                alert("Xóa báo cáo thất bại");
                              }
                            } catch (err) {
                              alert("Lỗi kết nối");
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {/* NÚT XÓA BÌNH LUẬN – ĐẸP NHƯ BÊN BÀI VIẾT */}
        <div className="flex justify-end pt-6 border-t">
          <Button
            variant="destructive"
            size="lg"
            onClick={async () => {
              if (!confirm("XÓA VĨNH VIỄN bình luận này?\nKhông thể khôi phục!")) return;

              try {
                const token = localStorage.getItem("token");
                const res = await fetch(
                  `${API_URL}/api/articles/${selectedComment.postId}/comments/${selectedComment._id}`,
                  {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );

                if (res.ok) {
                  // Xóa khỏi danh sách + đóng modal
                  setComments(prev => prev.filter(c => c._id !== selectedComment._id));
                  setReportModalOpen(false);
                  alert("Đã xóa bình luận thành công!");
                } else {
                  alert("Xóa thất bại");
                }
              } catch (err) {
                alert("Lỗi kết nối");
              }
            }}
          >
            <Trash2 className="h-5 w-5 mr-2" />
            Xóa bình luận này
          </Button>
        </div>

      </div>
    )}
  </DialogContent>
</Dialog>
    </div>
  );
}