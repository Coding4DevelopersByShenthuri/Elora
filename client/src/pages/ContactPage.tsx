import React, { useState } from 'react';
import { User, Mail, Phone, MessageSquare, Send } from 'lucide-react';
import GlassForm from '@/components/ui/GlassForm';
import { Button } from '@/components/ui/button';
import { AnimatedTransition } from '@/components/common/AnimatedTransition';
import { useAnimateIn } from '@/lib/animations';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  const showContent = useAnimateIn(false, 300);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const whatsappNumber = '94743899907'; // ✅ use intl format without 0
    const textLines = [
      `Name: ${formData.name}`,
      `Email: ${formData.email}`,
      formData.phone && `Phone: ${formData.phone}`,
      formData.subject && `Subject: ${formData.subject}`,
      `Message: ${formData.message}`,
    ].filter(Boolean);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      textLines.join('\n')
    )}`;

    window.open(whatsappUrl, '_blank');

    setToast({
      visible: true,
      message: 'Redirecting to WhatsApp...',
    });

    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    });

    setTimeout(() => {
      setToast({ visible: false, message: '' });
    }, 3000);
  };

  return (
    <div className="relative overflow-hidden pt-24 sm:pt-28 md:pt-36 pb-12 md:pb-16 lg:pb-24">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
      <div className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl -z-10"></div>
      <div className="absolute bottom-1/3 left-0 w-[250px] h-[250px] rounded-full bg-accent/5 blur-3xl -z-10"></div>
      
      {/* Decorative SVG elements - Green and Orange */}
      <div className="absolute top-20 left-10 w-16 h-16 text-green-500 opacity-40 hidden lg:block">
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
          <path d="M20 20C40 10 60 30 80 20C85 18 90 22 90 25C90 30 85 35 80 30C70 25 50 15 30 25C25 27 20 25 20 20Z" stroke="currentColor" strokeWidth="2" fill="currentColor"/>
        </svg>
      </div>
      <div className="absolute top-40 right-20 w-20 h-20 text-orange-500 opacity-30 hidden lg:block">
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
          <path d="M50 10L60 40L90 50L60 60L50 90L40 60L10 50L40 40Z"/>
        </svg>
      </div>
      <div className="absolute bottom-20 left-20 w-24 h-24 text-green-500 opacity-30 hidden lg:block">
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="3" strokeDasharray="10,5"/>
        </svg>
      </div>
      <div className="absolute bottom-40 right-10 w-18 h-18 text-orange-500 opacity-40 hidden lg:block">
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
          <path d="M10 50Q30 20 50 50T90 50" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
      </div>

      {/* Toast */}
      {toast.visible && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-2 rounded shadow-md z-50 text-sm">
          {toast.message}
        </div>
      )}

      <AnimatedTransition show={showContent} animation="slide-up">
        <GlassForm
          title="Send us a message"
          description="Got a question, feedback, or issue? Reach out—we’re here to help!"
          onSubmit={handleSubmit}
        >
          {/* Grid for inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 pr-4 py-2 w-full rounded-md border bg-background border-muted-foreground/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Your name"
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 pr-4 py-2 w-full rounded-md border bg-background border-muted-foreground/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Phone (optional) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10 pr-4 py-2 w-full rounded-md border bg-background border-muted-foreground/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="+94 77 123 4567"
                />
              </div>
            </div>

            {/* Subject (optional) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Subject</label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="pl-10 pr-4 py-2 w-full rounded-md border bg-background border-muted-foreground/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Subject (optional)"
                />
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Message <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className="pl-10 pr-4 py-2 w-full rounded-md border bg-background border-muted-foreground/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Type your message here..."
              />
            </div>
            {errors.message && (
              <p className="text-sm text-red-500">{errors.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 text-center">
            <Button type="submit" size="lg" className="gap-2">
              Send via WhatsApp
              <Send size={18} />
            </Button>
          </div>
        </GlassForm>
      </AnimatedTransition>
    </div>
  );
};

export default ContactPage;
