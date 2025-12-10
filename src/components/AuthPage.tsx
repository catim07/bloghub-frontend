import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Mail, Lock, Eye, EyeOff, User, Chrome } from "lucide-react";
import { motion } from "motion/react"; // Giữ nguyên import của bạn
import axios from "axios";

// Thêm biến môi trường – CHỈ ĐỔI Ở .env LÀ XONG!
const API_URL = import.meta.env.VITE_API_URL;

interface AuthPageProps {
  onClose: () => void;
  onSuccess: (user: any, token: string) => void;
}

export function AuthPage({ onClose, onSuccess }: AuthPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { // Thay localhost
        email: loginEmail,
        password: loginPassword,
      });

      const { user, token } = res.data;
      if (!token) {
        alert("Không nhận được token từ server!");
        return;
      }

      localStorage.setItem("token", token);
      console.log("Login success:", res.data);

      onSuccess(user, token); // ✅ Gửi dữ liệu về App.tsx
      window.location.reload();
    } catch (err: any) {
      console.error("Login error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  // ✅ Đăng ký (không tự đăng nhập)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Xóa token cũ (nếu có)
    localStorage.removeItem("token");

    if (registerPassword !== registerConfirmPassword) {
      alert("Mật khẩu không khớp!");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, { // Thay localhost
        name: registerName,
        email: registerEmail,
        password: registerPassword,
      });

      alert("Đăng ký thành công! Hãy đăng nhập để tiếp tục.");
      console.log("Register success:", res.data);

      // ✅ Không lưu token, không gọi setIsLogin
      // => Chuyển sang tab "Đăng nhập" sau khi đăng ký thành công
      const loginTab = document.querySelector('[data-state="active"][value="register"]');
      const loginTrigger = document.querySelector('[value="login"]') as HTMLElement;
      setActiveTab("login");
    } catch (err: any) {
      console.error("Register error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Đăng ký thất bại");
    }
  };

  const handleGoogleLogin = () => {
    console.log("Google login");
    
    // Giả lập thông tin user và token như khi login thường
    const mockUser = {
      id: "google123",
      name: "Google User",
      email: "googleuser@gmail.com",
      role: "user",
    };
    
    const mockToken = "mock-google-token"; // token giả
    
    localStorage.setItem("token", mockToken);
    onSuccess(mockUser, mockToken); // ✅ truyền đúng dữ liệu
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/30 dark:bg-blue-900/20 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/30 dark:bg-purple-900/20 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-5xl"
      >
        <Card className="overflow-hidden shadow-2xl border-0">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Side - Image/Illustration */}
            <div className="hidden md:block relative bg-gradient-to-br from-blue-600 to-purple-700 p-12">
              <div className="flex flex-col justify-between h-full relative z-10">
                {/* Logo/Brand */}
                <div>
                  <h1 className="text-white mb-2">BlogHub</h1>
                  <p className="text-blue-100">
                    Nền tảng chia sẻ kiến thức và kết nối cộng đồng
                  </p>
                </div>

                {/* Illustration */}
                <div className="my-8">
                  <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white/20">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwd29ya3NwYWNlJTIwZGVza3xlbnwxfHx8fDE3NjAyNjcwNDV8MA&ixlib=rb-4.1.0&q=80&w=1080"
                      alt="Workspace"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-white">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span>Chia sẻ kiến thức dễ dàng</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span>Kết nối với cộng đồng</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span>Phát triển kỹ năng viết</span>
                  </div>
                </div>
              </div>

              {/* Decorative circles */}
              <div className="absolute top-10 right-10 w-20 h-20 rounded-full border-2 border-white/20" />
              <div className="absolute bottom-20 left-10 w-16 h-16 rounded-full border-2 border-white/20" />
            </div>

            {/* Right Side - Auth Forms */}
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-center mb-8">
                <h2>Chào mừng!</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </Button>
              </div>

              <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="login">Đăng nhập</TabsTrigger>
                  <TabsTrigger value="register">Đăng ký</TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="example@email.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Mật khẩu</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded" />
                        <span className="text-muted-foreground">
                          Ghi nhớ đăng nhập
                        </span>
                      </label>
                      <a
                        href="#"
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Quên mật khẩu?
                      </a>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Đăng nhập
                    </Button>

                    <div className="relative my-6">
                      <Separator />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
                        Hoặc
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full gap-2"
                      onClick={handleGoogleLogin}
                    >
                      <Chrome className="h-5 w-5" />
                      Đăng nhập bằng Google
                    </Button>
                  </form>
                </TabsContent>

                {/* Register Tab */}
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Tên đầy đủ</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-name"
                          type="text"
                          placeholder="Nguyễn Văn A"
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="example@email.com"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password">Mật khẩu</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password">
                        Xác nhận mật khẩu
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={registerConfirmPassword}
                          onChange={(e) =>
                            setRegisterConfirmPassword(e.target.value)
                          }
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm">
                      <input type="checkbox" className="mt-1 rounded" required />
                      <span className="text-muted-foreground">
                        Tôi đồng ý với{" "}
                        <a
                          href="#"
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          Điều khoản dịch vụ
                        </a>{" "}
                        và{" "}
                        <a
                          href="#"
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          Chính sách bảo mật
                        </a>
                      </span>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Đăng ký
                    </Button>

                    <div className="relative my-6">
                      <Separator />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
                        Hoặc
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full gap-2"
                      onClick={handleGoogleLogin}
                    >
                      <Chrome className="h-5 w-5" />
                      Đăng ký bằng Google
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}