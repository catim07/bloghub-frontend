// src/components/FriendsPage.tsx – ĐÃ CHUYỂN SANG .env, KHÔNG CÒN LOCALHOST NỮA!!!
import { useEffect, useState } from "react";
import { ArrowLeft, Search, UserCheck, UserPlus, Users } from "lucide-react";
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

  const token = localStorage.getItem("token");

  // Nếu không có token → hiện thông báo cần đăng nhập
  if (!token) {
    setLoading(false);
    return;
  }

  // Ưu tiên lấy từ storage trước (nếu có thì nhanh hơn)
  const stored = sessionStorage.getItem("currentUser") || localStorage.getItem("currentUser");
  let storedUser = stored ? JSON.parse(stored) : null;

  if (storedUser?._id) {
    // Có trong storage → dùng luôn
    setCurrentUser(storedUser);
    fetchUsers(storedUser._id, token);
    return;
  }

  // Không có trong storage → fetch từ API /me (như các trang khác)
  fetch(`${API_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(r => {
      if (!r.ok) throw new Error();
      return r.json();
    })
    .then(userData => {
      setCurrentUser(userData);
      // Lưu vào storage để lần sau nhanh hơn
      localStorage.setItem("currentUser", JSON.stringify(userData));
      sessionStorage.setItem("currentUser", JSON.stringify(userData));

      fetchUsers(userData._id, token);
    })
    .catch(err => {
      console.error("Lỗi lấy current user:", err);
      setLoading(false);
    });

  // Hàm fetch danh sách users riêng để gọi lại
  function fetchUsers(userId: string, authToken: string) {
    fetch(`${API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data.filter((u: User) => u._id !== userId));
        }
      })
      .catch(err => console.error("Lỗi fetch users:", err))
      .finally(() => setLoading(false));
  }
}, []);
// Fix nút theo dõi hiển thị đúng ngay khi vừa vào trang (không cần bấm gì)
useEffect(() => {
  if (currentUser && users.length > 0) {
    // Force React re-calculate isFollowing() với currentUser mới nhất
    // Shallow copy users để trigger re-render
    setUsers([...users]);
  }
}, [currentUser]);
 const handleFollow = async (userId: string) => {
  try {
    const token = localStorage.getItem("token")!;
    const res = await fetch(`${API_URL}/api/follow/${userId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Lỗi server");

    const { following, user } = await res.json();

    // Cập nhật currentUser mới nhất từ server
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
    sessionStorage.setItem("currentUser", JSON.stringify(user));

    // Cập nhật followerCount trong list users
    setUsers(prev =>
      prev.map(u =>
        u._id === userId
          ? { ...u, followerCount: (u.followerCount || 0) + (following ? 1 : -1) }
          : u
      )
    );

    // Cập nhật popup nếu đang mở
    if (popupUser?._id === userId) {
      setPopupUser(prev => prev ? { ...prev, followerCount: (prev.followerCount || 0) + (following ? 1 : -1) } : null);
    }

    // QUAN TRỌNG: Dispatch event đúng chuẩn để Sidebar và các nơi khác update
    window.dispatchEvent(
      new CustomEvent("followChanged", {
        detail: { userId, following }
      })
    );

  } catch (err) {
    alert("Lỗi mạng hoặc không thể theo dõi!");
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
  <Button
    variant={isFollowing(user._id) ? "outline" : "default"}
    size="lg"
    onClick={() => handleFollow(user._id)}
    className="w-full gap-2 font-semibold"
  >
    {isFollowing(user._id) ? (
      <>
        <UserCheck className="h-5 w-5" />
        Đang theo dõi
      </>
    ) : (
      <>
        <UserPlus className="h-5 w-5" />
        Theo dõi
      </>
    )}
  </Button>
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
                      <Button
  variant={isFollowing(user._id) ? "outline" : "default"}
  size="sm"
  onClick={() => handleFollow(user._id)}
  className="gap-2 font-medium"
>
  {isFollowing(user._id) ? (
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