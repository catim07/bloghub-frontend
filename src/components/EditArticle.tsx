// src/components/EditArticle.tsx – ĐÃ CHUYỂN SANG .env, KHÔNG CÒN LOCALHOST NỮA!!!
import { useState, useEffect, useCallback, useMemo } from "react";
import { Navigation } from "./Navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  Eye,
  Send,
  X,
  Plus,
  Trash2,
  Upload,
  ArrowLeft,
} from "lucide-react";

// DÙNG BIẾN MÔI TRƯỜNG – CHỈ ĐỔI Ở .env LÀ XONG MÃI MÃI!!!
const API_URL = import.meta.env.VITE_API_URL;

interface ArticleDraft {
  title: string;
  content: string;
  tags: string[];
  coverImage: string | null;
}

export function EditArticle({
  darkMode,
  toggleDarkMode,
  articleId,
  onBack,
}: {
  darkMode: boolean;
  toggleDarkMode: () => void;
  articleId: string;
  onBack: () => void;
}) {
  const [draft, setDraft] = useState<ArticleDraft>({
    title: "",
    content: "",
    tags: [],
    coverImage: null,
  });
  const [tagInput, setTagInput] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load bài viết
  useEffect(() => {
    const fetchArticle = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Vui lòng đăng nhập!");
        onBack();
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/articles/${articleId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Không tải được bài viết");

        const article = await res.json();
        setDraft({
          title: article.title || "",
          content: article.content || "",
          tags: article.tags || [],
          coverImage: article.image || null,
        });
      } catch (err) {
        alert("Lỗi: Không tìm thấy bài viết hoặc bạn không có quyền sửa!");
        onBack();
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId, onBack]);

  // Tag handlers
  const addTag = useCallback(() => {
    const trimmed = tagInput.trim();
    if (!trimmed || draft.tags.includes(trimmed)) return;
    setDraft(prev => ({ ...prev, tags: [...prev.tags, trimmed] }));
    setTagInput("");
  }, [tagInput, draft.tags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setDraft(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove),
    }));
  }, []);

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  // Upload ảnh – VẪN DÙNG CLOUDINARY NHƯ CŨ (KHÔNG ĐỘNG GÌ)
  const uploadToCloudinary = async (file: File): Promise<string> => {
    if (file.size > 10 * 1024 * 1024) throw new Error("Ảnh quá lớn! Chỉ nhận dưới 10MB!");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "bloghub");

    const res = await fetch("https://api.cloudinary.com/v1_1/dop5gaihw/image/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Upload thất bại");
    return data.secure_url;
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setDraft(prev => ({ ...prev, coverImage: url }));
      alert("Đổi ảnh bìa thành công!");
    } catch (err: any) {
      alert("Lỗi upload: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const removeCoverImage = () => {
    setDraft(prev => ({ ...prev, coverImage: null }));
  };

  // CẬP NHẬT BÀI VIẾT – ĐÃ SỬA TỪ localhost → API_URL
  const updateArticle = async () => {
    if (!draft.title.trim() || !draft.content.trim()) {
      alert("Tiêu đề và nội dung không được để trống!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return alert("Token hết hạn!");

    try {
      const res = await fetch(`${API_URL}/api/articles/${articleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: draft.title.trim(),
          content: draft.content,
          tags: draft.tags,
          image: draft.coverImage,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Cập nhật thất bại");
      }

      alert("Cập nhật bài viết thành công!");
      onBack();
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    }
  };

  // Render markdown (giữ nguyên hoàn toàn)
  const renderedContent = useMemo(() => {
    if (!draft.content) return null;
    return draft.content
      .replace(/^### (.*$)/gim, "<h3 class='text-2xl font-bold mt-8 mb-4'>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2 class='text-3xl font-bold mt-10 mb-5'>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1 class='text-5xl font-bold mt-12 mb-6 leading-tight'>$1</h1>")
      .replace(/\*\*(.*?)\*\*/g, "<strong class='font-bold'>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em class='italic'>$1</em>")
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-500 hover:underline font-medium">$1</a>')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-5 rounded-lg my-6 overflow-x-auto font-mono text-sm"><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-2 py-1 rounded text-sm font-mono">$1</code>')
      .replace(/\n/g, "<br>");
  }, [draft.content]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-2xl">
        Đang tải bài viết để sửa...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Quay lại
          </Button>

          <div className="flex gap-3">
            <Button onClick={updateArticle} variant="default" className="gap-2">
              <Send className="h-4 w-4" />
              Cập nhật bài viết
            </Button>

            <Button variant="outline" className="gap-2">
              <Save className="h-4 w-4" />
              Lưu nháp
            </Button>

            <Button
              variant={showPreview ? "default" : "outline"}
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              {showPreview ? "Ẩn" : "Xem"} trước
            </Button>
          </div>
        </div>

        {/* GIAO DIỆN GIỮ NGUYÊN 100% – SIÊU ĐẸP, SIÊU MƯỢT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className={showPreview ? "lg:col-span-6" : "lg:col-span-12"}>
            <Card className="p-6 space-y-8">
              {/* Ảnh bìa */}
              <div>
                <label className="text-sm font-medium mb-3 block">Ảnh bìa bài viết</label>
                {draft.coverImage ? (
                  <div className="relative group rounded-xl overflow-hidden border">
                    <img src={draft.coverImage} alt="Cover" className="w-full h-80 object-cover" />
                    <button onClick={removeCoverImage} className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg z-10">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <label className="block border-2 border-dashed rounded-xl h-80 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition bg-muted/30">
                    <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Click để thay ảnh bìa</p>
                    {isUploading && <p className="text-blue-600 mt-2">Đang upload...</p>}
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>

              <Separator />
              <Input
                placeholder="Tiêu đề thật cuốn..."
                value={draft.title}
                onChange={(e) => setDraft(p => ({ ...p, title: e.target.value }))}
                className="text-4xl font-bold border-0 focus-visible:ring-0"
              />
              <Separator />

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {draft.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="rounded-full pr-1">
                      #{tag}
                      <button onClick={() => removeTag(tag)} className="ml-2 hover:bg-destructive/20 rounded-full p-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Thêm tag..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} />
                  <Button onClick={addTag}><Plus className="h-4 w-4" /></Button>
                </div>
              </div>

              <Separator />
              <Textarea
                placeholder="Sửa nội dung tuyệt vời của anh nào..."
                value={draft.content}
                onChange={(e) => setDraft(p => ({ ...p, content: e.target.value }))}
                className="min-h-96 resize-none border-0 focus-visible:ring-0 p-0"
              />
            </Card>
          </div>

          <AnimatePresence>
            {showPreview && (
              <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="lg:col-span-6">
                <Card className="p-8 sticky top-6">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-lg font-semibold text-muted-foreground">Xem trước</h4>
                    <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)} className="lg:hidden"><X className="h-5 w-5" /></Button>
                  </div>
                  {draft.coverImage && <img src={draft.coverImage} alt="Preview" className="w-full h-96 object-cover rounded-b-xl mb-8" />}
                  {draft.title && <h1 className="text-5xl font-bold mb-6 leading-tight">{draft.title}</h1>}
                  {draft.tags.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-8">
                      {draft.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-lg py-1 px-4 rounded-full">#{tag}</Badge>
                      ))}
                    </div>
                  )}
                  {renderedContent ? (
                    <div dangerouslySetInnerHTML={{ __html: renderedContent }} className="prose prose-lg dark:prose-invert max-w-none" />
                  ) : (
                    <p className="text-muted-foreground italic text-center py-20">Nội dung sẽ hiện ở đây...</p>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}