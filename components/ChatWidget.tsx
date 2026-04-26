"use client";

import { useEffect, useRef, useState } from "react";
import { X, Send, Sparkles, RotateCcw } from "lucide-react";
import clsx from "clsx";
import { pushSlackPost } from "@/lib/demo-events";

type Msg = { role: "user" | "bot"; text: string; chips?: string[] };
type Lang = "EN" | "KO" | "ZH";
type Status = "active" | "ended";
type Intent = "buy" | "sell" | "lease" | "inspect";

const MAX_USER_MESSAGES = 25;
const END_TOKEN = /\[END_CONVERSATION\]/i;

const dict = {
  EN: {
    openerGreeting:
      "Hi! I'm CJ RealEstate Agent — the CJ Real Estate concierge. Ask me anything about buying, selling, leasing, or your tenancy.",
    chipBuy: "I want to buy",
    chipSell: "I want to sell",
    chipLease: "Looking to rent",
    chipTenant: "I'm a current tenant",
    chipInspect: "Book an inspection",
    placeholder: "Type a message…",
    youAre: "You're chatting with",
    privacy: "Conversations are reviewed and protected under CJ's Privacy Policy.",
    footer: "Powered by Gemini · multilingual (EN · 中文 · 한국어)",
    thinking: "CJ RealEstate Agent is typing…",
    capReached:
      "We've covered a lot — let me hand this to a CJ agent who can pick it up from here.",
    endedNote: "This conversation is closed.",
    reset: "Start over",
    fallback: "Sorry, something went wrong. Please try again.",
    formPrompt: "Great — please share a few details so a CJ agent can follow up properly.",
    formName: "Name",
    formEmail: "Email",
    formPhone: "Phone",
    formSubmit: "Continue",
    formNamePh: "Your full name",
    formEmailPh: "you@example.com",
    formPhonePh: "04xx xxx xxx",
    formError: "Please fill in name, email, and phone.",
    intentBuy: "buying a property",
    intentSell: "selling a property",
    intentLease: "renting a property",
    intentInspect: "booking an inspection",
  },
  KO: {
    openerGreeting:
      "안녕하세요! CJ Real Estate 컨시어지 CJ RealEstate Agent입니다. 매매·매도·임대·임차 관련 질문 무엇이든 물어보세요.",
    chipBuy: "매매 문의",
    chipSell: "매도 감정",
    chipLease: "임대 검색",
    chipTenant: "현재 거주 중인 임차인",
    chipInspect: "오픈 인스펙션 예약",
    placeholder: "메시지 입력…",
    youAre: "대화 상대:",
    privacy: "대화는 검토될 수 있으며, CJ 개인정보보호방침에 따라 보호됩니다.",
    footer: "Powered by Gemini · 3개국어 지원 (EN · 中文 · 한국어)",
    thinking: "CJ RealEstate Agent가 답변 중…",
    capReached:
      "충분히 이야기 나눴습니다. 이제 CJ 담당자에게 연결해 드리겠습니다.",
    endedNote: "대화가 종료되었습니다.",
    reset: "새로 시작",
    fallback: "죄송합니다. 잠시 후 다시 시도해 주세요.",
    formPrompt: "알겠습니다 — CJ 담당자가 정확히 안내드릴 수 있도록 연락처를 남겨주세요.",
    formName: "이름",
    formEmail: "이메일",
    formPhone: "전화번호",
    formSubmit: "계속",
    formNamePh: "성함",
    formEmailPh: "you@example.com",
    formPhonePh: "010-0000-0000",
    formError: "이름, 이메일, 전화번호를 모두 입력해 주세요.",
    intentBuy: "매매",
    intentSell: "매도",
    intentLease: "임대",
    intentInspect: "오픈 인스펙션 예약",
  },
  ZH: {
    openerGreeting:
      "您好!我是CJ Real Estate的AI礼宾 CJ RealEstate Agent。买房、卖房、租赁、租户事宜,任何问题都可以问我。",
    chipBuy: "我想买房",
    chipSell: "我想卖房",
    chipLease: "寻找出租",
    chipTenant: "我是现有租户",
    chipInspect: "预约看房",
    placeholder: "输入消息…",
    youAre: "正在与您交谈:",
    privacy: "对话可能会被审阅,受CJ隐私政策保护。",
    footer: "由 Gemini 驱动 · 支持 EN · 中文 · 한국어",
    thinking: "CJ RealEstate Agent 正在输入…",
    capReached: "我们已经聊了不少 — 让经纪人继续为您服务。",
    endedNote: "对话已结束。",
    reset: "重新开始",
    fallback: "抱歉,出了点问题。请稍后再试。",
    formPrompt: "好的 — 请留下您的联系方式,以便CJ经纪人为您跟进。",
    formName: "姓名",
    formEmail: "邮箱",
    formPhone: "电话",
    formSubmit: "继续",
    formNamePh: "您的姓名",
    formEmailPh: "you@example.com",
    formPhonePh: "0400 000 000",
    formError: "请填写姓名、邮箱和电话。",
    intentBuy: "买房",
    intentSell: "卖房",
    intentLease: "租房",
    intentInspect: "预约看房",
  },
} satisfies Record<Lang, Record<string, string>>;

function intentLabel(lang: Lang, intent: Intent) {
  const t = dict[lang];
  return { buy: t.intentBuy, sell: t.intentSell, lease: t.intentLease, inspect: t.intentInspect }[intent];
}

function buildIntroMessage(lang: Lang, intent: Intent, name: string, email: string, phone: string) {
  const intentText = intentLabel(lang, intent);
  if (lang === "KO") {
    return `${intentText} 관련해서 문의드려요. 이름: ${name}, 이메일: ${email}, 전화: ${phone}.`;
  }
  if (lang === "ZH") {
    return `我想${intentText}。我的姓名是${name},邮箱${email},电话${phone}。`;
  }
  return `Hi, I'd like help with ${intentText}. My name is ${name}, email ${email}, phone ${phone}.`;
}

function buildThanksMessage(lang: Lang, intent: Intent, name: string) {
  const intentText = intentLabel(lang, intent);
  if (lang === "KO") {
    return `${name}님, 감사합니다! 담당자에게 전달드릴게요. ${intentText} 관련해서 어떻게 도와드릴까요?`;
  }
  if (lang === "ZH") {
    return `${name},谢谢您!我们的经纪人会尽快与您联系。关于${intentText},请问有什么可以帮您的?`;
  }
  return `Thanks, ${name}! A CJ agent will follow up shortly. In the meantime, how can I help you with ${intentText}?`;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Lang>("EN");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [status, setStatus] = useState<Status>("active");
  const [pendingIntent, setPendingIntent] = useState<Intent | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formError, setFormError] = useState(false);
  const savedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const t = dict[lang];
  const userMessageCount = messages.filter((m) => m.role === "user").length;

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "bot",
          text: t.openerGreeting,
          chips: [t.chipBuy, t.chipSell, t.chipLease, t.chipTenant, t.chipInspect],
        },
      ]);
    }
  }, [open, lang, messages.length, t]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking, pendingIntent]);

  const finalize = (msgs: Msg[]) => {
    if (savedRef.current) return;
    if (msgs.filter((m) => m.role === "user").length < 1) return;
    savedRef.current = true;

    fetch("/api/conversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: msgs, language: lang }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.slackPayload) return;
        pushSlackPost({
          channel: data.slackPayload.channel,
          kind: "chat_lead",
          title: `${data.slackPayload.emoji ?? "🤖"} ${data.slackPayload.title}`,
          subtitle: data.slackPayload.subtitle,
          language: lang,
          fields: data.slackPayload.fields,
          transcript: msgs.map((m) => ({ role: m.role, text: m.text })),
          actions: [
            { label: "Open transcript", variant: "primary" },
            { label: "Mark reviewed" },
          ],
        });
      })
      .catch(() => {});
  };

  const resetForm = () => {
    setPendingIntent(null);
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormError(false);
  };

  const handleChip = (chipText: string) => {
    if (status === "ended" || thinking || pendingIntent) return;
    const chipIntentMap: Record<string, Intent> = {
      [t.chipBuy]: "buy",
      [t.chipSell]: "sell",
      [t.chipLease]: "lease",
      [t.chipInspect]: "inspect",
    };
    const intent = chipIntentMap[chipText];
    if (intent) {
      setMessages((prev) => [
        ...prev,
        { role: "user", text: chipText },
        { role: "bot", text: t.formPrompt },
      ]);
      setPendingIntent(intent);
      return;
    }
    void send(chipText);
  };

  const send = async (text: string) => {
    if (!text.trim() || status === "ended" || thinking || pendingIntent) return;

    const newMsgs: Msg[] = [...messages, { role: "user", text: text.trim() }];
    setMessages(newMsgs);
    setInput("");

    const newUserCount = newMsgs.filter((m) => m.role === "user").length;
    if (newUserCount >= MAX_USER_MESSAGES) {
      const ended: Msg[] = [...newMsgs, { role: "bot", text: t.capReached }];
      setMessages(ended);
      setStatus("ended");
      finalize(ended);
      return;
    }

    setThinking(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMsgs, language: lang }),
      });
      const data = await r.json();
      let reply = (data.reply ?? "").trim();
      let shouldEnd = false;
      if (END_TOKEN.test(reply)) {
        reply = reply.replace(END_TOKEN, "").trim();
        shouldEnd = true;
      }
      const final: Msg[] = [
        ...newMsgs,
        { role: "bot", text: reply || "…" },
      ];
      setMessages(final);
      if (shouldEnd) {
        setStatus("ended");
        finalize(final);
      }
    } catch {
      setMessages((m) => [...m, { role: "bot", text: t.fallback }]);
    } finally {
      setThinking(false);
    }
  };

  const submitLeadForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingIntent || thinking) return;
    const name = formName.trim();
    const email = formEmail.trim();
    const phone = formPhone.trim();
    if (!name || !email || !phone) {
      setFormError(true);
      return;
    }
    const intro = buildIntroMessage(lang, pendingIntent, name, email, phone);
    const thanks = buildThanksMessage(lang, pendingIntent, name);
    setMessages((prev) => [
      ...prev,
      { role: "user", text: intro },
      { role: "bot", text: thanks },
    ]);
    resetForm();
  };

  const closeWidget = () => {
    if (status === "active" && userMessageCount >= 1) {
      finalize(messages);
    }
    setOpen(false);
  };

  const reset = () => {
    setMessages([]);
    setStatus("active");
    savedRef.current = false;
    setInput("");
    resetForm();
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-ink text-paper px-5 py-4 shadow-xl flex items-center gap-2.5 hover:bg-copper transition-all group"
        >
          <Sparkles size={18} className="text-copper group-hover:text-paper transition" />
          <span className="text-sm font-medium tracking-wide">Ask CJ RealEstate Agent</span>
          <span className="w-2 h-2 bg-copper pulse-dot" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-40 w-[min(380px,calc(100vw-2rem))] h-[min(620px,calc(100vh-3rem))] bg-paper shadow-2xl flex flex-col border border-ink/10 animate-slide-up">
          <div className="bg-ink text-paper px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-copper flex items-center justify-center">
                <Sparkles size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">CJ RealEstate Agent</p>
                <p className="text-[10px] text-paper/60 uppercase tracking-[0.14em] leading-tight">
                  {t.youAre} CJ Concierge
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={lang}
                onChange={(e) => {
                  setLang(e.target.value as Lang);
                  setMessages([]);
                  setStatus("active");
                  savedRef.current = false;
                  resetForm();
                }}
                className="bg-transparent text-xs border border-paper/20 px-1.5 py-0.5 focus:outline-none"
              >
                <option value="EN">EN</option>
                <option value="ZH">中文</option>
                <option value="KO">한국어</option>
              </select>
              <button onClick={closeWidget} className="text-paper/70 hover:text-paper">
                <X size={16} />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={clsx("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={clsx(
                    "max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                    m.role === "user" ? "bg-ink text-paper" : "bg-stone text-ink"
                  )}
                >
                  {m.text}
                  {m.chips && status === "active" && !pendingIntent && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {m.chips.map((c, j) => (
                        <button
                          key={j}
                          onClick={() => handleChip(c)}
                          className="bg-paper border border-ink/15 text-xs px-2.5 py-1 hover:border-copper hover:text-copper transition"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {thinking && (
              <div className="flex justify-start">
                <div className="bg-stone text-ink-muted px-3.5 py-2.5 text-sm flex items-center gap-2">
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 bg-ink-muted rounded-full pulse-dot" />
                    <span className="w-1 h-1 bg-ink-muted rounded-full pulse-dot" style={{ animationDelay: "0.2s" }} />
                    <span className="w-1 h-1 bg-ink-muted rounded-full pulse-dot" style={{ animationDelay: "0.4s" }} />
                  </span>
                  <span className="text-xs">{t.thinking}</span>
                </div>
              </div>
            )}

            {status === "ended" && (
              <div className="flex justify-center pt-3">
                <div className="text-center">
                  <p className="text-xs text-ink-muted">{t.endedNote}</p>
                  <button
                    onClick={reset}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs text-copper hover:text-copper-deep underline"
                  >
                    <RotateCcw size={11} /> {t.reset}
                  </button>
                </div>
              </div>
            )}
          </div>

          {pendingIntent ? (
            <form
              onSubmit={submitLeadForm}
              className="border-t border-ink/10 p-3 flex flex-col gap-2 bg-paper-warm"
            >
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={t.formNamePh}
                aria-label={t.formName}
                disabled={thinking}
                className="text-sm px-3 py-2 bg-paper border border-ink/15 focus:outline-none focus:border-copper disabled:opacity-50"
              />
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder={t.formEmailPh}
                aria-label={t.formEmail}
                disabled={thinking}
                className="text-sm px-3 py-2 bg-paper border border-ink/15 focus:outline-none focus:border-copper disabled:opacity-50"
              />
              <input
                type="tel"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder={t.formPhonePh}
                aria-label={t.formPhone}
                disabled={thinking}
                className="text-sm px-3 py-2 bg-paper border border-ink/15 focus:outline-none focus:border-copper disabled:opacity-50"
              />
              {formError && (
                <p className="text-[11px] text-copper">{t.formError}</p>
              )}
              <button
                type="submit"
                disabled={thinking}
                className="bg-ink text-paper py-2 text-sm hover:bg-copper transition disabled:opacity-30"
              >
                {t.formSubmit}
              </button>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="border-t border-ink/10 p-3 flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={status === "ended" ? t.endedNote : t.placeholder}
                disabled={status === "ended" || thinking}
                className="flex-1 text-sm px-3 py-2.5 bg-paper-warm border-0 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === "ended" || thinking}
                className="bg-ink text-paper px-4 hover:bg-copper transition disabled:opacity-30"
              >
                <Send size={15} />
              </button>
            </form>
          )}
          <div className="px-3 pb-2 flex items-center justify-between text-[10px] text-ink-subtle">
            <span>{t.footer}</span>
            <span className={clsx(userMessageCount >= 20 && "text-copper font-medium")}>
              {userMessageCount}/{MAX_USER_MESSAGES}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
