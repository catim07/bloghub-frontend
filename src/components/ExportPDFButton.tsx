// src/components/ExportPDFButton.tsx
import { Button } from "./ui/button";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ExportPDFButtonProps {
  articleRef: React.RefObject<HTMLElement>;
  title: string;
  authorName: string;
  darkMode?: boolean;
}

export function ExportPDFButton({
  articleRef,
  title,
  authorName,
  darkMode = false,
}: ExportPDFButtonProps) {
  const exportToPDF = async () => {
    if (!articleRef.current) {
      alert("Không tìm thấy nội dung bài viết!");
      return;
    }

    try {
      const canvas = await html2canvas(articleRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: darkMode ? "#111111" : "#ffffff",
        logging: false,
        // FIX HOÀN HẢO: oklch + TypeScript + ẩn bình luận
        onclone: (clonedDoc) => {
          // Fix tất cả màu oklch/lch/lab + ép kiểu HTMLElement để TS không kêu
          clonedDoc.querySelectorAll<HTMLElement>("*").forEach((el) => {
            const style = el.getAttribute("style") || "";

            // Fix inline style có chứa oklch/lch/lab
            if (/oklch|lch|lab/i.test(style)) {
              const fixed = style
                .replace(/oklch\([^)]+\)/gi, darkMode ? "white" : "black")
                .replace(/lch\([^)]+\)/gi, darkMode ? "white" : "black")
                .replace(/lab\([^)]+\)/gi, darkMode ? "white" : "black");
              el.setAttribute("style", fixed);
            }

            // Fix màu từ Tailwind (computed style)
            try {
              const computed = window.getComputedStyle(el);
              if (
                computed.color.includes("oklch") ||
                computed.backgroundColor.includes("oklch")
              ) {
                el.style.color = darkMode ? "white" : "black";
                el.style.backgroundColor = darkMode ? "#111111" : "#ffffff";
              }
            } catch (e) {
              // Bỏ qua lỗi getComputedStyle nếu element không hợp lệ
            }
          });

          // Ẩn phần bình luận, footer, nút hành động → PDF sạch đẹp
          clonedDoc
            .querySelectorAll<HTMLElement>(
              'footer, [class*="mb-16"], [class*="comment"], [class*="report"], [class*="Export"], button, [role="dialog"]'
            )
            .forEach((el) => {
              el.style.display = "none";
            });
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;

      // Header đẹp
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.setTextColor(0);
      pdf.text(title.length > 60 ? title.substring(0, 57) + "..." : title, margin, 25);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.setTextColor(100);
      pdf.text(`Tác giả: ${authorName || "Ẩn danh"}`, margin, 35);
      pdf.text(`Xuất ngày: ${new Date().toLocaleDateString("vi-VN")}`, margin, 43);

      // Đường kẻ ngang
      pdf.setDrawColor(200);
      pdf.line(margin, 48, pageWidth - margin, 48);

      // Thêm hình ảnh
      let heightLeft = imgHeight;
      let positionY = 55;

      pdf.addImage(imgData, "PNG", margin, positionY, contentWidth, imgHeight);
      heightLeft -= pageHeight - 70;

      while (heightLeft >= 0) {
        pdf.addPage();
        positionY = heightLeft - imgHeight + 70;
        pdf.addImage(imgData, "PNG", margin, positionY, contentWidth, imgHeight);
        heightLeft -= pageHeight - 70;
      }

      // Tên file đẹp + an toàn
      const safeFileName =
        title
          .replace(/[^a-zA-Z0-9\u00C0-\u1EF9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "_") || "baiviet";
      pdf.save(`${safeFileName}.pdf`);
    } catch (err) {
      console.error("Lỗi khi xuất PDF:", err);
      alert("Không thể xuất PDF. Vui lòng thử lại sau vài giây!");
    }
  };

  return (
    <Button
      onClick={exportToPDF}
      variant="outline"
      size="sm"
      className="gap-2 hover:bg-accent transition-colors"
    >
      <Download className="h-4 w-4" />
      Xuất PDF
    </Button>
  );
}