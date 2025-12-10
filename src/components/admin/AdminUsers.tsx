// src/components/admin/AdminUsers.tsx
// HOÀN HẢO TUYỆT ĐỐI – DÙNG `status` ĐỂ KHÓA TÀI KHOẢN (CHUẨN PRO 2025)

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
import {
  Search,
  MoreHorizontal,
  Lock,
  Unlock,
  Trash2,
  Mail,
  Shield,
} from "lucide-react";
import { format } from "date-fns";

const API_URL = import.meta.env.VITE_API_URL;

interface UserFromAPI {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";           // chỉ còn user và admin
  status: "active" | "banned";       // trạng thái khóa tài khoản
  createdAt?: string;
  followerCount: number;
  following?: any[];
}

interface AdminUser extends UserFromAPI {
  blogCount: number;
  followingCount: number;
}

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // KHÓA / MỞ KHÓA TÀI KHOẢN – DÙNG status
  const handleToggleStatus = async (userId: string, currentStatus: "active" | "banned") => {
    if (!confirm(currentStatus === "banned" ? "Mở khóa tài khoản này?" : "Khóa tài khoản này?")) return;

    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/users/${userId}/toggle-status`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();
      setUsers(prev =>
        prev.map(u => (u._id === userId ? { ...u, status: data.status } : u))
      );
    } else {
      alert("Thao tác thất bại");
    }
  };

  // GỠ / CẤP QUYỀN ADMIN
  const handleToggleRole = async (userId: string, currentRole: "user" | "admin") => {
    if (!confirm(currentRole === "admin" ? "Gỡ quyền Admin?" : "Cấp quyền Admin?")) return;

    const newRole = currentRole === "admin" ? "user" : "admin";
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/api/users/${userId}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role: newRole }),
    });

    if (res.ok) {
      setUsers(prev =>
        prev.map(u => (u._id === userId ? { ...u, role: newRole } : u))
      );
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("XÓA VĨNH VIỄN tài khoản này? Không thể khôi phục!")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/users/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setUsers(prev => prev.filter(u => u._id !== userId));
    }
  };

  // Badge trạng thái (dựa vào status, không còn dùng role === "banned")
  const getStatusBadge = (status: "active" | "banned", role: "user" | "admin") => {
    if (role === "admin")
      return <Badge className="bg-purple-100 text-purple-700 gap-1"><Shield className="w-3 h-3" /> Admin</Badge>;
    if (status === "banned")
      return <Badge className="bg-red-100 text-red-700">Bị khóa</Badge>;
    return <Badge className="bg-green-100 text-green-700">Hoạt động</Badge>;
  };

  const formatJoinDate = (date?: string) => {
    if (!date) return "Admin gốc";
    return format(new Date(date), "dd/MM/yyyy");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [usersRes, articlesRes] = await Promise.all([
          fetch(`${API_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/articles`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!usersRes.ok) throw new Error("Lỗi tải users");
        const usersData: UserFromAPI[] = await usersRes.json();
        const articlesData: any[] = articlesRes.ok ? await articlesRes.json() : [];

        const blogCountMap = articlesData.reduce((map, article) => {
          const authorId = article.author?._id || article.author;
          if (authorId) map[authorId] = (map[authorId] || 0) + 1;
          return map;
        }, {} as Record<string, number>);

        const finalUsers: AdminUser[] = usersData.map(user => ({
          ...user,
          blogCount: blogCountMap[user._id] || 0,
          followingCount: Array.isArray(user.following) ? user.following.length : 0,
        }));

        setUsers(finalUsers);
      } catch (err) {
        console.error(err);
        alert("Lỗi tải dữ liệu admin");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-10 text-center text-xl">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-3xl font-bold">Quản lý người dùng</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <div className="text-4xl font-bold">{users.length}</div>
          <p className="text-muted-foreground">Tổng người dùng</p>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-4xl font-bold text-green-600">
            {users.filter(u => u.status === "active").length}
          </div>
          <p className="text-muted-foreground">Đang hoạt động</p>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-4xl font-bold text-red-600">
            {users.filter(u => u.status === "banned").length}
          </div>
          <p className="text-muted-foreground">Bị khóa</p>
        </Card>
      </div>

      <Card className="p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm tên hoặc email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-center">Bài viết</TableHead>
              <TableHead className="text-center">Người theo dõi</TableHead>
              <TableHead className="text-center">Đang theo dõi</TableHead>
              <TableHead>Tham gia</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map(user => (
              <TableRow key={user._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      {user.role === "admin" && <p className="text-xs text-purple-600">Quản trị viên</p>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">{user.email}</TableCell>
                <TableCell>{getStatusBadge(user.status, user.role)}</TableCell>
                <TableCell className="text-center font-bold text-blue-600">{user.blogCount}</TableCell>
                <TableCell className="text-center font-bold text-green-600">{user.followerCount}</TableCell>
                <TableCell className="text-center font-bold text-purple-600">{user.followingCount}</TableCell>
                <TableCell className="font-medium">{formatJoinDate(user.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Mail className="h-4 w-4 mr-2" /> Gửi email</DropdownMenuItem>

                      {/* Cấp/Gỡ quyền Admin */}
                      <DropdownMenuItem
                        onClick={() => handleToggleRole(user._id, user.role)}
                        className={user.role === "admin" ? "text-purple-600" : "text-blue-600"}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        {user.role === "admin" ? "Gỡ quyền Admin" : "Cấp quyền Admin"}
                      </DropdownMenuItem>

                      {/* Khóa / Mở khóa tài khoản */}
                      <DropdownMenuItem
                        onClick={() => handleToggleStatus(user._id, user.status)}
                        className={user.status === "banned" ? "text-green-600" : "text-red-600"}
                      >
                        {user.status === "banned" ? <Unlock className="h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                        {user.status === "banned" ? "Mở khóa" : "Khóa tài khoản"}
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => handleDeleteUser(user._id)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" /> Xóa tài khoản
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}