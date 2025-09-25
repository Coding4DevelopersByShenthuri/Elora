import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Check, Mail, User, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Tools or platforms relevant to your Spoken English App
const TOOL_OPTIONS = [
  "Offline English Trainer", "Local AI Tutor", "Pronunciation Coach", "Vocabulary Builder",
  "Conversation Simulator", "Grammar Checker", "Others"
];

export function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    linkedin: "",
    currentTool: "",
    reason: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send this data to your backend or local storage
    console.log("Submitted data:", formData);
    toast.success("Thanks for joining our early access! Start improving your English offline soon.", {
      duration: 5000,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Join Our Early Access</DialogTitle>
          <DialogDescription>
            Get early access to our Spoken English Training App running completely offline on your device. Help us improve your learning experience!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Your Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                className="pl-10"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                className="pl-10"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* LinkedIn / Portfolio */}
          <div className="grid gap-2">
            <Label htmlFor="linkedin">LinkedIn or Portfolio</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="linkedin"
                type="url"
                className="pl-10"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                placeholder="Optional: Your LinkedIn or portfolio link"
              />
            </div>
          </div>

          {/* Current Tool / App */}
          <div className="grid gap-2">
            <Label htmlFor="currentTool">Which English Learning Tool do you currently use?</Label>
            <select
              id="currentTool"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={formData.currentTool}
              onChange={(e) => setFormData({ ...formData, currentTool: e.target.value })}
              required
            >
              <option value="">Select a tool</option>
              {TOOL_OPTIONS.map((tool) => (
                <option key={tool} value={tool}>
                  {tool}
                </option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div className="grid gap-2">
            <Label htmlFor="reason">Why are you interested in improving your spoken English?</Label>
            <textarea
              id="reason"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Tell us why you want to join this app"
              required
            />
          </div>

          <Button type="submit" className="w-full">
            <Check className="mr-2 h-4 w-4" /> Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
