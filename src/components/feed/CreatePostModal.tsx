"use client";

import { useState, useRef, ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { PenSquare, Image as ImageIcon, Send, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { useVisitor } from "@/hooks/useVisitor";
import { v4 as uuidv4 } from "uuid";

const POST_TYPES = [
  { value: "text",       label: "💬 General" },
  { value: "confession", label: "🤫 Confession" },
  { value: "story",      label: "📖 Story" },
  { value: "meme",       label: "😂 Meme" },
];

interface CreatePostModalProps {
  onSuccess?: () => void;
  children?: ReactNode;
}

export function CreatePostModal({ onSuccess, children }: CreatePostModalProps) {
  const [open, setOpen]           = useState(false);
  const [content, setContent]     = useState("");
  const [type, setType]           = useState("text");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile]   = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { visitorId } = useVisitor();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imageFile) {
      toast.error("Please write something or add an image");
      return;
    }
    if (!visitorId) { toast.error("Please wait a moment…"); return; }

    setIsSubmitting(true);
    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${uuidv4()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("leadit-images")
          .upload(path, imageFile);
        if (uploadErr) throw uploadErr;
        imageUrl = supabase.storage.from("leadit-images").getPublicUrl(path).data.publicUrl;
      }

      const res = await fetch("/api/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          visitor_id: visitorId,
          type: imageFile ? "image" : type,
          image_url: imageUrl,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      toast.success("Posted anonymously! 🎉");
      setOpen(false);
      setContent("");
      setType("text");
      removeImage();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to post. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const charCount = content.length;

  // Default trigger button if no children
  const trigger = children ?? (
    <button className="btn-primary flex items-center gap-2 shadow-sm">
      <PenSquare className="w-4 h-4" />
      <span>Post</span>
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<span onClick={() => setOpen(true)}>{trigger}</span>} />

      <DialogContent className="sm:max-w-lg bg-white border-slate-200 p-0 overflow-hidden rounded-2xl shadow-2xl mx-4">
        <div className="p-5">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <PenSquare className="w-5 h-5 text-primary" />
              Create Post
            </DialogTitle>
          </DialogHeader>

          {/* Type selector */}
          <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar pb-1">
            {POST_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
                  type === t.value
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-primary/40"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Content textarea */}
          <Textarea
            placeholder="What's happening at LEAD? Share anonymously…"
            className="min-h-[120px] resize-none border-slate-200 bg-slate-50 focus-visible:ring-primary text-[15px] leading-relaxed text-slate-800 placeholder:text-slate-400 p-3 rounded-xl"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={1000}
          />
          <div className="flex justify-end mt-1">
            <span className={`text-xs ${charCount > 900 ? "text-red-500" : "text-slate-400"}`}>
              {charCount}/1000
            </span>
          </div>

          {/* Image preview */}
          {imagePreview && (
            <div className="relative mt-3 rounded-xl overflow-hidden border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-sm border border-slate-200 transition-all"
              >
                <X className="w-4 h-4 text-slate-700" />
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <div>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-primary hover:bg-primary/5 transition-all font-medium"
              >
                <ImageIcon className="w-4 h-4" /> Photo
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (!content.trim() && !imageFile)}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Post Anonymously
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
