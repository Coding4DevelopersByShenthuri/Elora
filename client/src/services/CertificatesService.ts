export type CertificateLayout = {
  templatePath?: string; // Optional. If missing/unavailable, a styled background is rendered
  namePosition: { x: number; y: number };
  datePosition: { x: number; y: number };
  nameFont?: string; // e.g. 'bold 64px Poppins'
  dateFont?: string; // e.g. '500 28px Poppins'
  nameColor?: string;
  dateColor?: string;
  // Optional built-in styles to avoid external images and CORS
  style?: 'kids' | 'pro';
  titleText?: string; // e.g., 'Certificate of Achievement'
  subtitleText?: string; // e.g., 'Awarded to'
};

export class CertificatesService {
  static async loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  static async generatePNG(
    layout: CertificateLayout,
    childName: string,
    issueDate: Date
  ): Promise<Blob> {
    let img: HTMLImageElement | null = null;
    try {
      if (layout.templatePath) {
        img = await this.loadImage(layout.templatePath);
      }
    } catch (_) {
      img = null;
    }
    const canvas = document.createElement('canvas');
    // Fallback to A4 landscape approx size if template not available
    const fallbackWidth = 1754; // ~ A4 at 150 DPI
    const fallbackHeight = 1240;
    canvas.width = img?.width || fallbackWidth;
    canvas.height = img?.height || fallbackHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    // Draw background
    if (img) {
      ctx.drawImage(img, 0, 0);
    } else {
      // Styled backgrounds without external images
      if (layout.style === 'kids') {
        // Soft gradient
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, '#FFF7ED'); // warm
        grad.addColorStop(1, '#E0F2FE'); // light blue
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Decorative rounded border
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 14;
        ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 6;
        ctx.strokeRect(46, 46, canvas.width - 92, canvas.height - 92);

        // Scatter stars/confetti
        const drawStar = (x: number, y: number, r: number, color: string) => {
          ctx.save();
          ctx.translate(x, y);
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            ctx.lineTo(0, r);
            ctx.translate(0, r);
            ctx.rotate((Math.PI * 2) / 10);
            ctx.lineTo(0, -r);
            ctx.translate(0, -r);
            ctx.rotate((Math.PI * 2) / 10);
          }
          ctx.closePath();
          ctx.fillStyle = color;
          ctx.fill();
          ctx.restore();
        };
        const colors = ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6'];
        for (let i = 0; i < 25; i++) {
          drawStar(
            80 + Math.random() * (canvas.width - 160),
            120 + Math.random() * (canvas.height - 240),
            4 + Math.random() * 6,
            colors[(Math.random() * colors.length) | 0]
          );
        }
      } else {
        // Professional subtle gradient background
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(1, '#F3F4F6');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Double-line elegant border
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 6;
        ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);
        ctx.strokeStyle = '#9CA3AF';
        ctx.lineWidth = 2;
        ctx.strokeRect(56, 56, canvas.width - 112, canvas.height - 112);
      }

      // Title & Subtitle
      const title = layout.titleText || (layout.style === 'kids' ? 'Super Star Certificate' : 'Certificate of Achievement');
      const subtitle = layout.subtitleText || (layout.style === 'kids' ? 'Awarded to' : 'This is presented to');

      ctx.fillStyle = layout.style === 'kids' ? '#0f172a' : '#111827';
      ctx.textAlign = 'center';

      ctx.font = layout.style === 'kids' ? '800 72px system-ui, sans-serif' : '700 64px system-ui, sans-serif';
      ctx.fillText(title, canvas.width / 2, 240);

      ctx.font = '500 28px system-ui, sans-serif';
      ctx.fillStyle = '#374151';
      ctx.fillText(subtitle, canvas.width / 2, 320);
    }

    // Name
    ctx.font = layout.nameFont || 'bold 64px system-ui, sans-serif';
    ctx.fillStyle = layout.nameColor || '#1f2937';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(childName, layout.namePosition.x, layout.namePosition.y);

    // Date string
    const dateStr = issueDate.toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    ctx.font = layout.dateFont || '500 28px system-ui, sans-serif';
    ctx.fillStyle = layout.dateColor || '#374151';
    ctx.fillText(dateStr, layout.datePosition.x, layout.datePosition.y);

    return await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b as Blob), 'image/png'));
  }

  static async downloadPNG(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.png') ? filename : `${filename}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  static async generateAndDownloadPDF(blob: Blob, filename: string) {
    try {
      // Always load from CDN to avoid bundler resolution issues
      let jsPDFCtor: any = (window as any).jspdf?.jsPDF;
      if (!jsPDFCtor) {
        await new Promise<void>((resolve, reject) => {
          const existing = document.querySelector('script[data-jspdf]') as HTMLScriptElement | null;
          if (existing) {
            existing.addEventListener('load', () => resolve());
            existing.addEventListener('error', () => reject(new Error('Failed to load jsPDF from CDN')));
            return;
          }
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
          s.async = true;
          s.setAttribute('data-jspdf', 'true');
          s.onload = () => resolve();
          s.onerror = () => reject(new Error('Failed to load jsPDF from CDN'));
          document.head.appendChild(s);
        });
        jsPDFCtor = (window as any).jspdf?.jsPDF;
        if (!jsPDFCtor) throw new Error('jsPDF not available');
      }
      const arrayBuf = await blob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuf)));
      const pdf = new jsPDFCtor({ orientation: 'landscape', unit: 'px', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add image fitted to page
      pdf.addImage(`data:image/png;base64,${base64}`, 'PNG', 0, 0, pageWidth, pageHeight);
      pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    } catch (e) {
      // Fallback: download PNG if jsPDF not installed
      await this.downloadPNG(blob, filename.replace(/\.pdf$/i, '') + '.png');
    }
  }
}

export default CertificatesService;


