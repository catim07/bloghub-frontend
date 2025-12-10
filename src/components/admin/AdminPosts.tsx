// src/components/admin/AdminPosts.tsx – ĐÃ CÓ MODAL CHI TIẾT BÁO CÁO SIÊU ĐẸP!
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Search, MoreHorizontal, Trash2, Edit, Flag } from "lucide-react";
import { format } from "date-fns";

const API_URL = import.meta.env.VITE_API_URL;

interface Report {
  _id: string;
  reporter: {
    _id: string;
    name: string;
    avatar?: string;
  };
  detail: string;
  reportedAt: string;
}

interface Post {
  _id: string;
  title: string;
  authorName?: string;
  likes?: any[];
  comments?: any[];
  reports?: Report[];
  createdAt: string;
  isHidden?: boolean;
  
}

export function AdminPosts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal chi tiết báo cáo
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/articles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Lỗi tải bài viết:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa bài viết này? Không thể khôi phục!")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/articles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPosts(posts.filter((p) => p._id !== id));
      } else {
        alert("Xóa thất bại");
      }
    } catch (err) {
      alert("Lỗi kết nối");
    }
  };

  const handleToggleHide = async (
    id: string,
    currentHidden: boolean = false
  ) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/articles/${id}/toggle-hide`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(
          posts.map((p) =>
            p._id === id ? { ...p, isHidden: data.isHidden } : p
          )
        );
      } else {
        alert("Thao tác thất bại");
      }
    } catch (err) {
      alert("Lỗi kết nối");
    }
  };

  const getStatusBadge = (post: Post) => {
    if (post.isHidden) {
      return (
        <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          Đã ẩn
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
        Đã đăng
      </Badge>
    );
  };

  const openReportModal = (post: Post) => {
    setSelectedPost(post);
    setReportModalOpen(true);
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center py-20 text-xl">Đang tải bài viết...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Quản lý bài viết</h2>
          <p className="text-muted-foreground">
            Quản lý tất cả bài viết trên BlogHub
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Thêm bài viết mới
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm bài viết, tác giả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">Tiêu đề</TableHead>
              <TableHead>Tác giả</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Lượt xem</TableHead>
              <TableHead>Bình luận</TableHead>
              <TableHead>Ngày đăng</TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Flag className="h-4 w-4 text-red-600" />
                  Báo cáo
                </div>
              </TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-10 text-muted-foreground"
                >
                  Không tìm thấy bài viết nào
                </TableCell>
              </TableRow>
            ) : (
              filteredPosts.map((post) => {
                const reportCount = post.reports?.length || 0;

                return (
                  <TableRow key={post._id}>
                    <TableCell className="max-w-md">
                      <p className="font-medium line-clamp-2">{post.title}</p>
                    </TableCell>
                    <TableCell>{post.authorName || "Ẩn danh"}</TableCell>
                    <TableCell>{getStatusBadge(post)}</TableCell>
                    <TableCell>
                      {(
                        (post.likes?.length || 0) * 10 +
                        (post.comments?.length || 0) * 5
                      ).toLocaleString()}
                    </TableCell>
                    <TableCell>{post.comments?.length || 0}</TableCell>
                    <TableCell>
                      {format(new Date(post.createdAt), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => openReportModal(post)}
                        className="font-bold hover:underline transition"
                      >
                        {reportCount > 0 ? (
                          <Badge
                            variant="destructive"
                            className="cursor-pointer"
                          >
                            {reportCount}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
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
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleToggleHide(post._id, post.isHidden)
                            }
                          >
                            {post.isHidden ? "Hiện bài viết" : "Ẩn bài viết"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(post._id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa vĩnh viễn
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* MODAL CHI TIẾT BÁO CÁO – SIÊU ĐẸP NHƯ FACEBOOK */}
      {/* MODAL CHI TIẾT BÁO CÁO – ĐÃ FIX LỖI UNDEFINED 100% */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <Flag className="h-7 w-7 text-red-600" />
              Chi tiết báo cáo bài viết
            </DialogTitle>
          </DialogHeader>

          {selectedPost && (
            <div className="space-y-6">
              {/* Tiêu đề bài viết */}
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Tiêu đề bài viết:
                </h3>
                <p className="text-lg bg-muted p-4 rounded-lg font-medium">
                  {selectedPost.title}
                </p>
              </div>

              {/* Danh sách báo cáo */}
              <div>
  <h3 className="font-semibold text-lg mb-4">
    Danh sách báo cáo ({selectedPost.reports?.length || 0})
  </h3>

  {!selectedPost.reports || selectedPost.reports.length === 0 ? (
    <div className="text-center py-12 text-muted-foreground">
      <Flag className="h-12 w-12 mx-auto mb-3 opacity-30" />
      <p>Chưa có báo cáo nào cho bài viết này</p>
    </div>
  ) : (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Người báo cáo</TableHead>
          <TableHead>Lý do</TableHead>
          <TableHead>Chi tiết</TableHead>
          <TableHead>Thời gian</TableHead>
          {/* CỘT CÔNG CỤ NGAY KẾ BÊN THỜI GIAN */}
          <TableHead className="w-28 text-center">Công cụ</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {selectedPost.reports.map((report: any, index: number) => {
          const reporterName =
            typeof report.reporter === "object" && report.reporter?.name
              ? report.reporter.name
              : "Người dùng đã xóa";

          const reporterAvatar =
            typeof report.reporter === "object" && report.reporter?.avatar
              ? report.reporter.avatar
              : null;

          return (
            <TableRow key={report._id || index}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={reporterAvatar || undefined} />
                    <AvatarFallback>
                      {reporterName[0]?.toUpperCase() || "X"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{reporterName}</span>
                </div>
              </TableCell>

              <TableCell>
                <Badge variant="destructive" className="font-medium">
                  {report.reason || "Không rõ"}
                </Badge>
              </TableCell>

              <TableCell className="text-sm text-muted-foreground max-w-xs">
                {report.detail || "Không có chi tiết"}
              </TableCell>

              <TableCell className="text-sm">
                {format(new Date(report.reportedAt), "dd/MM/yyyy HH:mm")}
              </TableCell>

              {/* CỘT CÔNG CỤ – XÓA BÁO CÁO SAI */}
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-600"
                  onClick={async () => {
                    if (!confirm("Xóa báo cáo này?\nNếu báo cáo sai sự thật hoặc nhầm lẫn.")) return;

                    try {
                      const token = localStorage.getItem("token");
                      const res = await fetch(
                        `${API_URL}/api/articles/${selectedPost._id}/reports/${report._id}`,
                        {
                          method: "DELETE",
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      );

                      if (res.ok) {
                        // Xóa realtime khỏi modal
                        setSelectedPost((prev) => {
                          if (!prev) return null;
                          return {
                            ...prev,
                            reports: prev.reports?.filter((r) => r._id !== report._id)
                          };
                        });

                        // Cập nhật lại bảng danh sách bài viết (nếu cần)
                        setPosts((prev) =>
                          prev.map((p) =>
                            p._id === selectedPost._id
                              ? {
                                  ...p,
                                  reports: p.reports?.filter((r) => r._id !== report._id) || [],
                                }
                              : p
                          )
                        );

                        // toast.success("Đã xóa báo cáo!");
                      } else {
                        alert("Xóa báo cáo thất bại");
                      }
                    } catch (err) {
                      alert("Lỗi kết nối server");
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

              {/* CÔNG CỤ HÀNH ĐỘNG – SIÊU TIỆN LỢI */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                <Button
                  variant="destructive"
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={async () => {
                    if (
                      !confirm(
                        "XÓA VĨNH VIỄN bài viết này?\nHành động KHÔNG THỂ hoàn tác!"
                      )
                    )
                      return;

                    try {
                      const token = localStorage.getItem("token");
                      const res = await fetch(
                        `${API_URL}/api/articles/${selectedPost._id}`,
                        {
                          method: "DELETE",
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      );

                      if (res.ok) {
                        alert("Đã xóa bài viết thành công!");
                        setReportModalOpen(false);
                        // Cập nhật lại danh sách
                        setPosts((prev) =>
                          prev.filter((p) => p._id !== selectedPost._id)
                        );
                      } else {
                        alert("Xóa thất bại. Có thể bạn không có quyền.");
                      }
                    } catch (err) {
                      alert("Lỗi kết nối server");
                    }
                  }}
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Xóa bài viết vĩnh viễn
                </Button>

                <Button
                  style={{ marginBottom: "20px" }}
                  variant={selectedPost.isHidden ? "default" : "secondary"}
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem("token");
                      const res = await fetch(
                        `${API_URL}/api/articles/${selectedPost._id}/toggle-hide`,
                        {
                          method: "PUT",
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      );

                      if (res.ok) {
                        const data = await res.json();
                        setPosts((prev) =>
                          prev.map((p) =>
                            p._id === selectedPost._id
                              ? { ...p, isHidden: data.isHidden }
                              : p
                          )
                        );
                        alert(
                          data.isHidden
                            ? "Đã ẩn bài viết"
                            : "Đã hiện lại bài viết"
                        );
                      }
                    } catch (err) {
                      alert("Lỗi khi thay đổi trạng thái");
                    }
                  }}
                >
                  {selectedPost.isHidden ? "Hiện bài viết" : "Ẩn bài viết"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
