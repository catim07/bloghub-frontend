// src/components/UserProfile.tsx – ĐÃ CHUYỂN HOÀN TOÀN SANG DÙNG .env (30/11/2025)
import { useEffect, useState } from "react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { ArticleCard } from "./ArticleCard";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "./ui/dialog";
import { ArrowLeft, Edit3, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// DÙNG BIẾN MÔI TRƯỜNG – CHỈ ĐỔI Ở .env LÀ XONG MÃI MÃI!!!
const API_URL = import.meta.env.VITE_API_URL;

export function UserProfile({
  darkMode,
  toggleDarkMode,
  onBack,
  onWriteClick,
  onArticleClick,
}: any) {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    username: "",
    email: "",
    bio: "",
    avatar: "",
  });

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    Promise.all([
      fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_URL}/api/articles/my`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([userRes, postsRes]) =>
        Promise.all([userRes.json(), postsRes.json()])
      )
      .then(([userData, postsData]) => {
        setUser(userData);
        setEditForm({
          name: userData.name || "",
          username: userData.username || userData.name?.toLowerCase().replace(/\s/g, "") || "",
          email: userData.email || "",
          bio: userData.bio || "",
          avatar: userData.avatar || "",
        });
        setPosts(Array.isArray(postsData) ? postsData : []);
      })
      .catch((err) => {
        console.error("Lỗi tải profile:", err);
        toast.error("Không thể tải hồ sơ");
      })
      .finally(() => setLoading(false));
  }, [token, navigate]);

  const handleSaveProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Lưu thất bại");
      }

      const updatedUser = await res.json();
      setUser(updatedUser);
      setEditForm({
        name: updatedUser.name || "",
        username: updatedUser.username || "",
        email: updatedUser.email || "",
        bio: updatedUser.bio || "",
        avatar: updatedUser.avatar || "",
      });

      setIsEditing(false);
      toast.success("Cập nhật hồ sơ thành công!");
    } catch (err: any) {
      console.error("Lỗi lưu profile:", err);
      toast.error(err.message || "Lỗi khi lưu hồ sơ");
    }
  };

  if (!token) return null;
  if (loading) return <div className="p-8 text-center text-lg">Đang tải hồ sơ...</div>;
  if (!user) return <div className="p-8 text-center text-lg">Không tìm thấy người dùng</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        onWriteClick={onWriteClick}
        isLoggedIn={true}
        onProfileClick={() => {}}
        onLogout={() => {
          localStorage.removeItem("token");
          navigate("/login");
          toast.success("Đã đăng xuất");
        }}
      />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" onClick={onBack || (() => navigate(-1))} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
        </Button>

        <Card className="p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <Avatar className="h-32 w-32 ring-4 ring-background">
              <AvatarImage
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=c9d1ff&color=6366f1&bold=true`}
              />
              <AvatarFallback className="text-4xl">
                {user.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold">{user.name}</h1>
                  <p className="text-xl text-muted-foreground">
                    @{user.username || user.name.toLowerCase().replace(/\s/g, "")}
                  </p>
                  {user.bio ? (
                    <p className="text-lg mt-3 text-foreground leading-relaxed">{user.bio}</p>
                  ) : (
                    <p className="text-muted-foreground italic mt-3">Chưa có tiểu sử</p>
                  )}
                </div>

                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="gap-2 whitespace-nowrap">
                      <Edit3 className="h-5 w-5" /> Chỉnh sửa hồ sơ
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="p-0 max-w-md w-full overflow-hidden rounded-2xl">
                    <DialogHeader className="relative h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700">
                      <DialogTitle className="absolute inset-x-0 bottom-0 translate-y-1/2 text-center text-3xl font-black text-white drop-shadow-2xl tracking-tight">
                        Chỉnh sửa hồ sơ
                      </DialogTitle>
                      <DialogClose asChild>
                        <button className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all">
                          <X className="h-5 w-5" />
                        </button>
                      </DialogClose>
                    </DialogHeader>

                    <div className="relative flex justify-center -mt-16 mb-10 px-8">
                      <label htmlFor="avatar-upload" className="group cursor-pointer">
                        <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditForm({ ...editForm, avatar: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }} />
                        <div className="relative">
                          <div className="w-36 h-36 rounded-full ring-8 ring-white shadow-2xl overflow-hidden border-4 border-white transition-all group-hover:scale-105">
                            <Avatar className="w-full h-full">
                              <AvatarImage src={editForm.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(editForm.name || "User")}&background=c9d1ff&color=6366f1&bold=true&size=256`} className="object-cover" />
                              <AvatarFallback className="text-6xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                {editForm.name?.[0] || "U"}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                        </div>
                      </label>
                    </div>

                    <div className="px-10 pb-10 space-y-6">
                      <div>
                        <Label className="text-base font-semibold text-slate-700">Họ tên</Label>
                        <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="mt-2 h-14 text-lg bg-gray-50 border-gray-200 focus:border-indigo-500 rounded-xl" placeholder="Nguyễn Văn A" />
                      </div>
                      <div>
                        <Label className="text-base font-semibold text-slate-700">Username</Label>
                        <Input value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })} className="mt-2 h-14 text-lg bg-gray-50 border-gray-200 focus:border-indigo-500 rounded-xl" placeholder="nguyenvana" />
                      </div>
                      <div>
                        <Label className="text-base font-semibold text-slate-700">Tiểu sử</Label>
                        <Textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} className="mt-2 min-h-32 text-base bg-gray-50 border-gray-200 focus:border-indigo-500 rounded-xl resize-none" placeholder="Mình là một lập trình viên đam mê React..." />
                      </div>

                      <div className="flex justify-end gap-4 pt-6">
                        <DialogClose asChild>
                          <Button style={{width:"60px"}} variant="outline" size="lg" className="px-8 py-6 text-base font-semibold border-2 border-gray-300 hover:bg-gray-50 rounded-xl">
                            Hủy
                          </Button>
                        </DialogClose>
                        <Button size="lg" onClick={handleSaveProfile} className="px-10 py-6 text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl">
                          <Save className="h-5 w-5 mr-2" /> Lưu thay đổi
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="text-2xl font-bold text-blue-600">{posts.length} bài viết</div>
            </div>
          </div>
        </Card>

        {loading ? (
          <p className="text-center py-16 text-lg">Đang tải bài viết...</p>
        ) : posts.length === 0 ? (
          <Card className="p-16 text-center">
            <p className="text-2xl mb-6">Bạn chưa có bài viết nào</p>
            <Button size="lg" onClick={onWriteClick}>Viết bài đầu tiên</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <ArticleCard
                key={post._id}
                title={post.title}
                description={post.content?.replace(/<[^>]*>/g, "").substring(0, 150) + "..."}
                authorName={user.name}
                thumbnail={post.image}
                tags={post.tags || []}
                createdAt={post.createdAt}
                likes={post.likes}
                comments={post.comments}
                onClick={() => onArticleClick(post._id)}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}