// src/components/Footer.tsx – PREMIUM UI, CLEAN & MODERN
import { Separator } from "./ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useState } from "react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  // State để mở các modal
  const [openModal, setOpenModal] = useState<"terms" | "privacy" | "contact" | null>(null);

  return (
    <>
      <footer className="mt-auto border-t border-neutral-200/60 dark:border-neutral-800/60 bg-white/50 dark:bg-neutral-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                © {currentYear} <span className="font-semibold text-neutral-900 dark:text-white">BlogHub</span> — created by <span className="font-medium">Cường Lê</span>. Tất cả quyền được bảo lưu.
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <button
                onClick={() => setOpenModal("terms")}
                className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200 font-medium"
              >
                Điều khoản
              </button>
              <Separator orientation="vertical" className="h-4 bg-neutral-300 dark:bg-neutral-700" />
              <button
                onClick={() => setOpenModal("privacy")}
                className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200 font-medium"
              >
                Quyền riêng tư
              </button>
              <Separator orientation="vertical" className="h-4 bg-neutral-300 dark:bg-neutral-700" />
              <button
                onClick={() => setOpenModal("contact")}
                className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200 font-medium"
              >
                Liên hệ
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ==================== MODAL ĐIỀU KHOẢN ==================== */}
      <Dialog open={openModal === "terms"} onOpenChange={() => setOpenModal(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto rounded-2xl border-neutral-200 dark:border-neutral-800 shadow-2xl">
          <DialogHeader className="space-y-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Điều khoản sử dụng
            </DialogTitle>
            <DialogDescription className="text-base text-neutral-600 dark:text-neutral-400">
              Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 text-neutral-700 dark:text-neutral-300 leading-relaxed mt-6">
            <p className="text-base">Bằng việc sử dụng BlogHub, bạn đồng ý với các điều khoản sau:</p>
            <ul className="space-y-3 ml-6 list-none">
              <li className="flex items-start gap-3">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                <span>Nội dung do bạn đăng tải phải tuân thủ pháp luật Việt Nam</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                <span>Không spam, quảng cáo trá hình hoặc nội dung phản cảm</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                <span>Tôn trọng bản quyền và quyền riêng tư của người khác</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                <span>BlogHub có quyền xóa nội dung vi phạm mà không cần báo trước</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                <span>Chúng tôi không chịu trách nhiệm về nội dung do người dùng đăng</span>
              </li>
            </ul>
            <div className="pt-4 mt-6 border-t border-neutral-100 dark:border-neutral-800">
              <p className="text-center text-sm font-medium text-indigo-600 dark:text-indigo-400">
                Cảm ơn bạn đã cùng xây dựng cộng đồng văn minh
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==================== MODAL QUYỀN RIÊNG TƯ ==================== */}
      <Dialog open={openModal === "privacy"} onOpenChange={() => setOpenModal(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto rounded-2xl border-neutral-200 dark:border-neutral-800 shadow-2xl">
          <DialogHeader className="space-y-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Chính sách quyền riêng tư
            </DialogTitle>
            <DialogDescription className="text-base text-neutral-600 dark:text-neutral-400">
              Chúng tôi tôn trọng và bảo vệ thông tin của bạn
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 text-neutral-700 dark:text-neutral-300 leading-relaxed mt-6">
            <p className="text-base">BlogHub cam kết:</p>
            <ul className="space-y-3 ml-6 list-none">
              <li className="flex items-start gap-3">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                <span>Chỉ thu thập thông tin cần thiết để vận hành dịch vụ</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                <span>Không bán hoặc chia sẻ dữ liệu cá nhân cho bên thứ ba</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                <span>Email chỉ dùng để gửi thông báo quan trọng</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                <span>Bạn có thể yêu cầu xóa toàn bộ dữ liệu bất kỳ lúc nào</span>
              </li>
            </ul>
            <div className="pt-4 mt-6 border-t border-neutral-100 dark:border-neutral-800">
              <p className="text-center text-sm font-semibold text-green-600 dark:text-green-400">
                Dữ liệu của bạn thuộc về bạn
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==================== MODAL LIÊN HỆ ==================== */}
      <Dialog open={openModal === "contact"} onOpenChange={() => setOpenModal(null)}>
        <DialogContent className="max-w-md rounded-2xl border-neutral-200 dark:border-neutral-800 shadow-2xl">
          <DialogHeader className="space-y-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Liên hệ với chúng tôi
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
              <p className="text-base">Có góp ý, báo lỗi hay chỉ muốn nói "hi"?</p>
              <div className="space-y-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Email:</span>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">hello@bloghub.vn</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Zalo/Telegram:</span>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">@tutu_dev</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">GitHub:</span>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">github.com/tutu</span>
                </div>
              </div>
            </div>
            <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl border border-blue-100 dark:border-blue-900/50">
              <p className="font-bold text-neutral-900 dark:text-white text-center text-base">
                BlogHub – được xây dựng bởi một dev Việt Nam
              </p>
              <p className="text-sm mt-2 text-center text-neutral-600 dark:text-neutral-400">
                Mở nguồn hoàn toàn – bạn có thể góp code bất kỳ lúc nào
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}