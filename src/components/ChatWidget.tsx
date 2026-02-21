import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Bot, User, Loader2 } from "lucide-react"; // Added User and Loader2
import { api } from "@/lib/api";

type ChatMessage = { role: "user" | "assistant"; content: string };

// --- unchanged pickText function ---
function pickText(payload: any): string {
  if (payload == null) return "";
  if (typeof payload === "string") return payload;
  if (Array.isArray(payload?.response)) {
    const item = payload.response.find((x: any) => x && (x.text || x.message));
    if (item?.text) return item.text;
    if (item?.message) return item.message;
  }
  const keys = ["reply", "response", "message", "text", "output", "answer", "content"];
  for (const k of keys) {
    const v = payload[k];
    if (typeof v === "string" && v.trim().length) return v;
  }
  for (const v of Object.values(payload)) {
    if (typeof v === "string" && v.trim().length) return v;
  }
  try {
    return JSON.stringify(payload);
  } catch {
    return String(payload);
  }
}
// --- end of unchanged pickText function ---

// NEW: Message Bubble Component for cleaner rendering
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const avatar = isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-primary" />;

  return (
    <div className={`flex items-start ${isUser ? "justify-end" : "justify-start"} space-x-2`}>
      {/* Bot Avatar on Left */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center border">
          {avatar}
        </div>
      )}

      {/* Message Content */}
      <div
        className={`max-w-xs sm:max-w-sm lg:max-w-md p-3 rounded-xl shadow-md ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-none" // User bubble styling
            : "bg-background text-foreground rounded-tl-none border" // Assistant bubble styling
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>

      {/* User Avatar on Right */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          {avatar}
        </div>
      )}
    </div>
  );
}


export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! I'm your assistant. How can I help you today?" }, // Updated initial message
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  async function send() {
    const q = input.trim();
    if (!q || loading) return;
    
    // Add User message immediately
    const userMessage: ChatMessage = { role: "user", content: q };
    setMessages((m) => [...m, userMessage]);
    
    setInput("");
    setLoading(true);


    try {
      const res = await api.sendChat(q, threadId);
      setThreadId(res.thread_id);
      const text = (res as any).reply ?? pickText((res as any).data);
      
      setMessages((m) => [
        ...m,
        { role: "assistant", content: text || "No response received." },
      ]);

    } catch (e: any) {
      const msg = e?.message || "An error occurred while fetching the response.";
      setMessages((m) => [
        ...m,
        { role: "assistant", content: msg },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") send();
  }

  return (
    <div>
      {/* 1. Enhanced Chat Button */}
      <Button
        className="fixed bottom-8 right-8 rounded-full h-14 w-14 shadow-xl bg-primary hover:bg-primary/90 transition-all duration-300 group"
        onClick={() => setOpen(true)}
        aria-label="Open Chat Assistant"
      >
        <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
        {/* Removed 'Chat' text from floating button for a cleaner look */}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        {/* 2. Optimized Dialog Size for Better Desktop/Mobile Fit */}
        <DialogContent className="sm:max-w-[450px] h-[70vh] max-h-[600px] flex flex-col p-0">
          {/* 3. Improved Dialog Header */}
          <DialogHeader className="p-4 border-b bg-muted/30">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-primary">
              <Bot className="w-6 h-6 animate-pulse" />
              Bot Assistant
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col flex-grow overflow-hidden">
            {/* 4. Chat Messages Area */}
            <ScrollArea className="flex-grow p-4">
              <div ref={listRef} className="space-y-4">
                {" "}
                {/* Increased space-y for better separation */}
                {messages.map((m, i) => (
                  // Use the new MessageBubble component
                  <MessageBubble key={i} message={m} />
                ))}
                {loading && (
                  <div className="flex justify-start space-x-2">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center border">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="max-w-xs sm:max-w-sm lg:max-w-md p-3 rounded-xl bg-background text-foreground rounded-tl-none border">
                      <div className="flex space-x-1">
                        <span className="animate-pulse w-2 h-2 bg-gray-500 rounded-full"></span>
                        <span className="animate-pulse delay-100 w-2 h-2 bg-gray-500 rounded-full"></span>
                        <span className="animate-pulse delay-200 w-2 h-2 bg-gray-500 rounded-full"></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* 6. Input Area */}
            <div className="p-4 border-t bg-muted/30">
              <div className="flex gap-2">
                <Input
                  placeholder={
                    loading ? "Waiting for response..." : "Ask your question..."
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKey}
                  disabled={loading}
                  className="flex-grow"
                />
                <Button onClick={send} disabled={loading} className="px-3">
                  {" "}
                  {/* Made button slightly smaller */}
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" /> // Removed 'mr-2' and 'Send' text for icon-only button
                  )}
                  <span className="sr-only">Send Message</span>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
