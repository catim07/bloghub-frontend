// src/components/FriendsPage.tsx – ĐÃ CHUYỂN SANG .env, KHÔNG CÒN LOCALHOST NỮA!!!
import { useEffect, useState } from "react";
import { ArrowLeft, Search, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { UserProfilePopup } from "./UserProfilePopup";

// DÙNG BIẾN MÔI TRƯỜNG – CHỈ ĐỔI Ở .env LÀ XONG MÃI MÃI!!!
const API_URL = import.meta.env.VITE_API_URL;

interface User {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
  followerCount?: number;
  following?: string[];
  followers?: string[];
}

export function FriendsPage({ onBack }: { onBack: () => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "following" | "followers" | "suggestions">("all");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Popup state
  const [popupUser, setPopupUser] = useState<User | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);

useEffect(() => {
  setLoading(true);

  // 1. Lấy currentUser từ storage (ưu tiên session)
  const stored = sessionStorage.getItem("currentUser") || localStorage.getItem("currentUser");
  const storedUser = stored ? JSON.parse(stored) : null;
  setCurrentUser(storedUser);

  // 2. Nếu không có token hoặc không có user → tắt loading ngay
  const token = localStorage.getItem("token");
  if (!token || !storedUser?._id) {
    setLoading(false);
    return;
  }

  // 3. Có đủ điều kiện → fetch danh sách users
  fetch(`${API_URL}/api/users`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(r => r.json())
    .then(data => {
      if (Array.isArray(data)) {
        setUsers(data.filter((u: User) => u._id !== storedUser._id));
      }
    })
    .catch(err => {
      console.error("Lỗi fetch users:", err);
    })
    .finally(() => {
      setLoading(false); // Luôn tắt loading dù thành công hay thất bại
    });
}, []); // Chỉ chạy 1 lần khi mount

  const handleFollow = async (userId: string) => {
    try {
      const token = localStorage.getItem("token")!;
      const res = await fetch(`${API_URL}/api/follow/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();

      const { following, user } = await res.json();

      setCurrentUser(user);
      localStorage.setItem("currentUser", JSON.stringify(user));
      sessionStorage.setItem("currentUser", JSON.stringify(user));

      setUsers(prev =>
        prev.map(u =>
          u._id === userId
            ? { ...u, followerCount: (u.followerCount || 0) + (following ? 1 : -1) }
            : u
        )
      );

      if (popupUser?._id === userId) {
        setPopupUser(prev => prev ? {
          ...prev,
          followerCount: (prev.followerCount || 0) + (following ? 1 : -1)
        } : null);
      }

      window.dispatchEvent(new Event("followChanged"));
    } catch {
      alert("Lỗi mạng!");
    }
  };

  const isFollowing = (userId: string): boolean =>
    currentUser?.following?.includes(userId) || false;

  const filteredUsers = users
    .filter(user => {
      const query = searchQuery.toLowerCase();
      const match = (user.name?.toLowerCase() || "").includes(query) ||
                    (user.email?.toLowerCase() || "").includes(query);
      if (!match) return false;
      if (activeTab === "following") return isFollowing(user._id);
      if (activeTab === "followers") return currentUser?.followers?.includes(user._id);
      if (activeTab === "suggestions") return !isFollowing(user._id);
      return true;
    })
    .sort((a, b) => (b.followerCount || 0) - (a.followerCount || 0));

  if (!currentUser) return <div className="text-center py-20 text-xl">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-3xl font-bold">Tìm kiếm bạn bè</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* DANH SÁCH CHÍNH */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
              {[
                { key: "all", label: "Tất cả" },
                { key: "following", label: "Đang theo dõi" },
                { key: "followers", label: "Theo dõi bạn" },
                { key: "suggestions", label: "Đề xuất" },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-6 py-3 rounded-full font-medium whitespace-nowrap ${
                    activeTab === tab.key
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.key && ` (${filteredUsers.length})`}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                <div className="col-span-2 text-center py-20 text-gray-500">Đang tải...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="col-span-2 text-center py-20">
                  <Users className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl font-medium">Không có kết quả</p>
                </div>
              ) : (
                filteredUsers.map(user => {
                  const following = isFollowing(user._id);
                  return (
                    <div key={user._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition p-6 border">
                      <div className="flex items-center gap-4">
                        <div
                          className="cursor-pointer transition-transform hover:scale-105"
                          onClick={() => {
                            setPopupUser(user);
                            setPopupOpen(true);
                          }}
                        >
                          <Avatar className="h-20 w-20 ring-4 ring-background">
                            <AvatarImage src={user.avatar} crossOrigin="anonymous"/>
                            <AvatarFallback className="text-2xl font-bold">
                              {user.name?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{user.name}</h3>
                          <p className="text-sm text-gray-500">
                            @{user.name.toLowerCase().replace(/\s/g, "")}
                          </p>
                          <p className="text-sm text-blue-600 mt-1">
                            {(user.followerCount || 0).toLocaleString()} người theo dõi
                          </p>
                        </div>
                      </div>

                      <div className="mt-6">
                        <button
                          onClick={() => handleFollow(user._id)}
                          className={`w-full py-3 rounded-lg font-medium transition-all duration-200 group
                            ${following
                              ? "bg-gray-200 dark:bg-gray-700 hover:bg-red-50 hover:text-red-600"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                        >
                          <span className={following ? "group-hover:hidden" : ""}>
                            {following ? "Đang theo dõi" : "Theo dõi"}
                          </span>
                          {following && <span className="hidden group-hover:inline">Bỏ theo dõi</span>}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* GỢI Ý KẾT BẠN */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border sticky top-24">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-600" />
                Gợi ý kết bạn
              </h3>
              <div className="space-y-4">
                {users
                  .filter(u => !isFollowing(u._id))
                  .sort(() => Math.random() - 0.5)
                  .slice(0, 6)
                  .map(user => (
                    <div key={user._id} className="flex items-center justify-between">
                      <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => {
                          setPopupUser(user);
                          setPopupOpen(true);
                        }}
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar} crossOrigin="anonymous"/>
                          <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.followerCount || 0} người theo dõi</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleFollow(user._id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                      >
                        Theo dõi
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* POPUP USER */}
        {popupUser && (
          <UserProfilePopup
            user={popupUser}
            open={popupOpen}
            onOpenChange={setPopupOpen}
            onFollow={() => handleFollow(popupUser._id)}
          />
        )}
      </div>
    </div>
  );
}