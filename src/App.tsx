// src/App.tsx – HOÀN CHỈNH 100% – DÙNG .env + KHÔNG CÒN LOCALHOST (30/11/2025)
import { useEffect, useState, useCallback } from "react";
import { Navigation } from "./components/Navigation";
import { ArticleCard } from "./components/ArticleCard";
import { Sidebar } from "./components/Sidebar";
import { Footer } from "./components/Footer";
import { NewArticle } from "./components/NewArticle";
import { EditArticle } from "./components/EditArticle";
import { ArticleDetail } from "./components/ArticleDetail";
import { UserProfile } from "./components/UserProfile";
import { AuthPage } from "./components/AuthPage";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { FriendsPage } from "./components/FriendsPage";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import { PenSquare, Shield } from "lucide-react";

// BIẾN API CHUNG – CHỈ ĐỔI Ở .env LÀ XONG MÃI MÃI!!!
const API_URL = import.meta.env.VITE_API_URL;

interface UserType {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  isAdmin?: boolean;
  following?: string[];
  followers?: string[];
  role?: "admin" | "user";
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const [currentPage, setCurrentPage] = useState<
    | "home"
    | "new-article"
    | "edit-article"
    | "article-detail"
    | "profile"
    | "auth"
    | "admin"
    | "friends"
  >("home");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [currentArticle, setCurrentArticle] = useState<any>(null);
  const [featuredAuthors, setFeaturedAuthors] = useState<any[]>([]);
  const [topTags, setTopTags] = useState<any[]>([]);

  // Dark mode
  useEffect(() => {
    if (localStorage.getItem("darkMode") === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      document.documentElement.classList.toggle("dark", newMode);
      localStorage.setItem("darkMode", newMode ? "dark" : "light");
      return newMode;
    });
  };

  const goToEditArticle = (articleId: string) => {
    setCurrentArticle({ _id: articleId });
    setCurrentPage("edit-article");
  };

  const goToAdmin = () => {
    if (!isLoggedIn) {
      setCurrentPage("auth");
      return;
    }
    if (currentUser?.role !== "admin") {
      setCurrentPage("home");
      return;
    }
    setCurrentPage("admin");
  };

  const loadHomeData = useCallback(async () => {
    if (currentPage !== "home") return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const [artRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/api/articles`, { headers }),
        fetch(`${API_URL}/api/users/top`, { headers }),
      ]);

      const articlesData = artRes.ok ? await artRes.json() : [];
      const usersData = usersRes.ok ? await usersRes.json() : [];
            const articlesArray = Array.isArray(articlesData) 
        ? articlesData.filter((article: any) => !article.isHidden)  // ẨN BÀI VIẾT BỊ ADMIN ẨN
        : [];

      // Top tags
      const tagCount: Record<string, number> = {};
      articlesArray.forEach((a: any) => {
        a.tags?.forEach((t: string) => {
          const tag = t.trim();
          if (tag) tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      });
      const topTags = Object.entries(tagCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Featured authors
      const enrichedAuthors = Array.isArray(usersData)
        ? usersData
            .filter((u: any) => u._id !== currentUser?._id)
            .map((u: any) => ({
              _id: u._id,
              name: u.name,
              avatar: u.avatar,
              bio: u.bio || "",
              followerCount: u.followerCount || 0,
              articleCount: u.articleCount || 0,
              createdAt: u.createdAt,
            }))
            .sort((a: any, b: any) => b.followerCount - a.followerCount)
            .slice(0, 10)
        : [];

      setArticles(articlesArray);
      setFeaturedAuthors(enrichedAuthors);
      setTopTags(topTags);
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentUser?._id]);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  // Refresh khi follow/unfollow
  useEffect(() => {
    const handler = () => {
      loadHomeData();
      const token = localStorage.getItem("token");
      if (token) {
        fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((user) => user && setCurrentUser(user));
      }
    };
    window.addEventListener("followChanged", handler);
    return () => window.removeEventListener("followChanged", handler);
  }, [loadHomeData]);

  // Check login
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?._id) {
          setCurrentUser(data);
          setIsLoggedIn(true);
          loadHomeData();
        }
      })
      .catch(() => localStorage.removeItem("token"));
  }, []);

  const handleLoginSuccess = (user: UserType, token: string) => {
    localStorage.setItem("token", token);
    setCurrentUser(user);
    setIsLoggedIn(true);
    setCurrentPage("home");
    loadHomeData();
  };

  const handleArticleAdded = (newPost: any) => {
    setArticles((prev) => [newPost, ...prev]);
  };

  const handleArticleClick = async (id: string) => {
    const res = await fetch(`${API_URL}/api/articles/${id}`);
    if (res.ok) {
      const article = await res.json();
      setCurrentArticle(article);
      setCurrentPage("article-detail");
    }
  };

  const goToHome = () => setCurrentPage("home");

  // === CÁC TRANG RIÊNG ===
    // === CÁC TRANG RIÊNG – GIỮ NGUYÊN GIAO DIỆN, CHỈ SỬA LỖI HEADER ===
  if (currentPage === "edit-article" && currentArticle?._id) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onWriteClick={() => setCurrentPage(isLoggedIn ? "new-article" : "auth")}
          onProfileClick={() => setCurrentPage(isLoggedIn ? "profile" : "auth")}
          onAuthClick={() => setCurrentPage("auth")}
          onLogout={() => {
            localStorage.removeItem("token");
            setIsLoggedIn(false);
            setCurrentUser(null);
            goToHome();
          }}
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
        />
        <EditArticle
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          articleId={currentArticle._id}
          onBack={goToHome}
        />
      </div>
    );
  }

  if (currentPage === "auth") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onWriteClick={() => setCurrentPage(isLoggedIn ? "new-article" : "auth")}
          onProfileClick={() => setCurrentPage(isLoggedIn ? "profile" : "auth")}
          onAuthClick={() => setCurrentPage("auth")}
          onLogout={() => {
            localStorage.removeItem("token");
            setIsLoggedIn(false);
            setCurrentUser(null);
            goToHome();
          }}
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
        />
        <AuthPage onClose={goToHome} onSuccess={handleLoginSuccess} />
      </div>
    );
  }

  if (currentPage === "new-article") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onWriteClick={() => setCurrentPage(isLoggedIn ? "new-article" : "auth")}
          onProfileClick={() => setCurrentPage(isLoggedIn ? "profile" : "auth")}
          onAuthClick={() => setCurrentPage("auth")}
          onLogout={() => {
            localStorage.removeItem("token");
            setIsLoggedIn(false);
            setCurrentUser(null);
            goToHome();
          }}
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
        />
        <NewArticle
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onBack={goToHome}
          onArticleAdded={handleArticleAdded}
        />
      </div>
    );
  }

  if (currentPage === "article-detail" && currentArticle) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onWriteClick={() => setCurrentPage(isLoggedIn ? "new-article" : "auth")}
          onProfileClick={() => setCurrentPage(isLoggedIn ? "profile" : "auth")}
          onAuthClick={() => setCurrentPage("auth")}
          onLogout={() => {
            localStorage.removeItem("token");
            setIsLoggedIn(false);
            setCurrentUser(null);
            goToHome();
          }}
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
        />
        <ArticleDetail
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onBack={goToHome}
          onWriteClick={() => setCurrentPage("new-article")}
          article={currentArticle}
          currentUser={currentUser}
          onEditClick={() => goToEditArticle(currentArticle._id)}
        />
      </div>
    );
  }

  if (currentPage === "article-detail" && currentArticle) {
    return (
      <ArticleDetail
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        onBack={goToHome}
        onWriteClick={() => setCurrentPage("new-article")}
        article={currentArticle}
        currentUser={currentUser}
        onEditClick={() => goToEditArticle(currentArticle._id)}
      />
    );
  }

  if (currentPage === "admin") {
    if (!isLoggedIn) {
      return <AuthPage onClose={goToHome} onSuccess={handleLoginSuccess} />;
    }
    if (currentUser?.role !== "admin") {
      setCurrentPage("home");
      return null;
    }
    return (
      <AdminDashboard
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        onLogout={() => {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
          setCurrentUser(null);
          setCurrentPage("home");
        }}
      />
    );
  }

  if (currentPage === "profile")
    return !isLoggedIn ? (
      <AuthPage onClose={goToHome} onSuccess={handleLoginSuccess} />
    ) : (
      <UserProfile
        key={currentUser?._id}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        onBack={goToHome}
        onWriteClick={() => setCurrentPage("new-article")}
        onArticleClick={handleArticleClick}
      />
    );

  if (currentPage === "friends")
    return <FriendsPage onBack={() => setCurrentPage("home")} />;

  // === TRANG CHỦ ===
  return (
    <div className="min-h-screen bg-background">
      <Navigation
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        onWriteClick={() => setCurrentPage(isLoggedIn ? "new-article" : "auth")}
        onProfileClick={() => setCurrentPage(isLoggedIn ? "profile" : "auth")}
        onAuthClick={() => setCurrentPage("auth")}
        onLogout={() => {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
          setCurrentUser(null);
          goToHome();
        }}
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
          {isLoggedIn && currentUser?.role === "admin" && (
            <Button
              onClick={goToAdmin}
              className="h-14 w-14 rounded-full shadow-xl bg-purple-600 hover:bg-purple-700 flex items-center justify-center"
              size="icon"
              title="Admin Dashboard"
            >
              <Shield className="h-7 w-7" />
            </Button>
          )}
          <Button
            onClick={() => setCurrentPage(isLoggedIn ? "new-article" : "auth")}
            className="h-14 w-14 rounded-full shadow-xl bg-blue-600 hover:bg-blue-700"
            size="icon"
          >
            <PenSquare className="h-7 w-7" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <Tabs defaultValue="newest">
              <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
                <TabsTrigger value="newest">Mới nhất</TabsTrigger>
                <TabsTrigger value="popular">Phổ biến</TabsTrigger>
                <TabsTrigger value="following">Theo dõi</TabsTrigger>
              </TabsList>

              <TabsContent value="newest" className="mt-6">
                {loading ? (
                  <div className="text-center py-20 text-xl">Đang tải...</div>
                ) : articles.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-2xl mb-4">Chưa có bài viết nào</p>
                    <Button onClick={() => setCurrentPage("new-article")}>
                      Viết bài đầu tiên
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {articles
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((article) => (
                        <ArticleCard
                          key={article._id}
                          {...article}
                          authorName={
                            article.authorName ||
                            (typeof article.author === "object" ? article.author.name : "Ẩn danh")
                          }
                          onClick={() => handleArticleClick(article._id)}
                        />
                      ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="popular" className="mt-6">
                {loading ? (
                  <div className="text-center py-20 text-xl">Đang tải...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {articles
                      .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
                      .map((article) => (
                        <ArticleCard
                          key={article._id}
                          {...article}
                          authorName={
                            article.authorName ||
                            (typeof article.author === "object" ? article.author.name : "Ẩn danh")
                          }
                          onClick={() => handleArticleClick(article._id)}
                        />
                      ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="following" className="mt-6" key={currentUser?._id || "guest"}>
                {loading ? (
                  <div className="text-center py-20 text-xl">Đang tải...</div>
                ) : !isLoggedIn ? (
                  <div className="text-center py-20">
                    <p className="text-2xl mb-4">Đăng nhập để xem bài viết từ người bạn theo dõi</p>
                    <Button onClick={() => setCurrentPage("auth")}>Đăng nhập ngay</Button>
                  </div>
                ) : !currentUser?.following || currentUser.following.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-2xl mb-4">Bạn chưa theo dõi ai</p>
                    <p className="text-muted-foreground mb-6">
                      Theo dõi tác giả để xem bài viết của họ ở đây!
                    </p>
                    <Button onClick={() => document.querySelector('[value="newest"]')?.scrollIntoView({ behavior: "smooth" })}>
                      Khám phá tác giả
                    </Button>
                  </div>
                ) : (
                  <>
                    {articles
                      .filter((article) => {
                        const following = Array.isArray(currentUser?.following) ? currentUser.following : [];
                        let authorId: string | undefined;
                        if (article.author) {
                          if (typeof article.author === "object" && article.author !== null) {
                            authorId = article.author._id || article.author.id;
                          } else if (typeof article.author === "string") {
                            authorId = article.author;
                          }
                        }
                        if (!authorId && article.authorId) authorId = article.authorId;
                        if (!authorId) return false;
                        return following.some((id: any) => String(id._id || id.id || id) === authorId);
                      })
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((article) => (
                        <ArticleCard
                          key={article._id}
                          {...article}
                          authorName={
                            article.authorName ||
                            (typeof article.author === "object" && article.author ? article.author.name : "Ẩn danh")
                          }
                          onClick={() => handleArticleClick(article._id)}
                        />
                      ))}

                    {articles.filter((article) => {
                      const following = Array.isArray(currentUser?.following) ? currentUser.following : [];
                      let authorId: string | undefined;
                      if (article.author) {
                        if (typeof article.author === "object" && article.author !== null) {
                          authorId = article.author._id || article.author.id;
                        } else if (typeof article.author === "string") {
                          authorId = article.author;
                        }
                      }
                      if (!authorId && article.authorId) authorId = article.authorId;
                      if (!authorId) return false;
                      return following.some((id: any) => String(id._id || id.id || id) === authorId);
                    }).length === 0 && (
                      <div className="col-span-2 text-center py-20">
                        <p className="text-2xl mb-4">Chưa có bài viết mới từ người bạn theo dõi</p>
                        <p className="text-muted-foreground">Họ sẽ xuất hiện ngay khi đăng bài!</p>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-24">
              <Sidebar
                key={currentUser?._id || "guest"}
                authors={featuredAuthors}
                tags={topTags}
                currentUserId={currentUser?._id || ""}
                onFindFriends={() => setCurrentPage("friends")}
              />
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}