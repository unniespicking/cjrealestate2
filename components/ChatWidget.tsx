"use client";

import { useEffect, useRef, useState } from "react";
import { X, Send, Sparkles, RotateCcw } from "lucide-react";
import clsx from "clsx";
import { pushSlackPost } from "@/lib/demo-events";

type ChipKind = "intent" | "topic";
type Msg = { role: "user" | "bot"; text: string; chips?: string[]; chipKind?: ChipKind };
type Lang = "EN" | "KO" | "ZH";
type Status = "active" | "ended";
type Intent = "buy" | "sell" | "lease" | "inspect";
type TenantPhase = null | "form" | "topic" | "detail";
type TenantTopic =
  | "maintenance"
  | "renewal"
  | "payment"
  | "bond"
  | "vacate"
  | "inspection"
  | "other";

const MAX_USER_MESSAGES = 25;
const END_TOKEN = /\[END_CONVERSATION\]/i;
const TOPIC_KEYS: TenantTopic[] = [
  "maintenance",
  "renewal",
  "payment",
  "bond",
  "vacate",
  "inspection",
  "other",
];

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
    tenantFormPrompt: "Sure — please share your details so a CJ property manager can pick this up.",
    formName: "Name",
    formEmail: "Email",
    formPhone: "Phone",
    formAddress: "Current address",
    formSubmit: "Continue",
    formNamePh: "Your full name",
    formEmailPh: "you@example.com",
    formPhonePh: "04xx xxx xxx",
    formAddressPh: "e.g. Apt 802 / 8 Footbridge Blvd, Wentworth Point",
    formError: "Please fill in name, email, and phone.",
    formErrorTenant: "Please fill in name, email, phone, and address.",
    intentBuy: "buying a property",
    intentSell: "selling a property",
    intentLease: "renting a property",
    intentInspect: "booking an inspection",
    topic_maintenance: "Maintenance & repairs",
    topic_renewal: "Lease renewal",
    topic_payment: "Rent payment",
    topic_bond: "Bond refund",
    topic_vacate: "Notice to vacate",
    topic_inspection: "Routine inspection",
    topic_other: "Other tenancy matter",
    pickTopicPlaceholder: "Please pick an option above…",
    detailPlaceholder: "Describe your situation in a few sentences…",
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
    tenantFormPrompt: "알겠습니다 — CJ 부동산 관리자가 도움드릴 수 있도록 정보를 남겨주세요.",
    formName: "이름",
    formEmail: "이메일",
    formPhone: "전화번호",
    formAddress: "현재 거주 주소",
    formSubmit: "계속",
    formNamePh: "성함",
    formEmailPh: "you@example.com",
    formPhonePh: "010-0000-0000",
    formAddressPh: "예) Apt 802 / 8 Footbridge Blvd, Wentworth Point",
    formError: "이름, 이메일, 전화번호를 모두 입력해 주세요.",
    formErrorTenant: "이름, 이메일, 전화번호, 주소를 모두 입력해 주세요.",
    intentBuy: "매매",
    intentSell: "매도",
    intentLease: "임대",
    intentInspect: "오픈 인스펙션 예약",
    topic_maintenance: "시설 보수·유지",
    topic_renewal: "임대 계약 갱신",
    topic_payment: "임차료 납부",
    topic_bond: "보증금 환불",
    topic_vacate: "퇴거 통지",
    topic_inspection: "정기 점검",
    topic_other: "기타 임차 관련 사항",
    pickTopicPlaceholder: "위 옵션 중 하나를 선택해 주세요…",
    detailPlaceholder: "상황을 자세히 설명해 주세요…",
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
    tenantFormPrompt: "好的 — 请留下您的信息,以便CJ物业经理为您跟进。",
    formName: "姓名",
    formEmail: "邮箱",
    formPhone: "电话",
    formAddress: "当前居住地址",
    formSubmit: "继续",
    formNamePh: "您的姓名",
    formEmailPh: "you@example.com",
    formPhonePh: "0400 000 000",
    formAddressPh: "例如:Apt 802 / 8 Footbridge Blvd, Wentworth Point",
    formError: "请填写姓名、邮箱和电话。",
    formErrorTenant: "请填写姓名、邮箱、电话和地址。",
    intentBuy: "买房",
    intentSell: "卖房",
    intentLease: "租房",
    intentInspect: "预约看房",
    topic_maintenance: "维修保养",
    topic_renewal: "续租",
    topic_payment: "租金支付",
    topic_bond: "押金退还",
    topic_vacate: "退租通知",
    topic_inspection: "例行检查",
    topic_other: "其他租赁事宜",
    pickTopicPlaceholder: "请从上方选择一项…",
    detailPlaceholder: "请详细描述您的情况…",
  },
} satisfies Record<Lang, Record<string, string>>;

function intentLabel(lang: Lang, intent: Intent) {
  const t = dict[lang];
  return { buy: t.intentBuy, sell: t.intentSell, lease: t.intentLease, inspect: t.intentInspect }[intent];
}

function topicLabel(lang: Lang, topic: TenantTopic) {
  return dict[lang][`topic_${topic}` as const];
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

function buildTenantIntro(
  lang: Lang,
  name: string,
  email: string,
  phone: string,
  address: string
) {
  if (lang === "KO") {
    return `현재 거주 중인 임차인입니다. 이름: ${name}, 이메일: ${email}, 전화: ${phone}, 주소: ${address}.`;
  }
  if (lang === "ZH") {
    return `我是现有租户。姓名:${name},邮箱:${email},电话:${phone},地址:${address}。`;
  }
  return `I'm a current tenant. Name: ${name}, email: ${email}, phone: ${phone}, address: ${address}.`;
}

function buildTenantTopicPrompt(lang: Lang, name: string) {
  if (lang === "KO") {
    return `${name}님, 감사합니다! 어떤 상황에 해당하시나요? 아래에서 선택해 주세요.`;
  }
  if (lang === "ZH") {
    return `${name},谢谢!以下哪一项最符合您的情况?`;
  }
  return `Thanks, ${name}! Which of these best describes your situation?`;
}

function buildTenantDetailPrompt(lang: Lang, topic: string) {
  if (lang === "KO") {
    return `「${topic}」 관련해서 자세히 설명해 주시겠어요?`;
  }
  if (lang === "ZH") {
    return `请详细描述一下您关于「${topic}」的情况。`;
  }
  return `Could you describe your "${topic}" situation in a few sentences?`;
}

function buildTenantClosePolite(lang: Lang) {
  if (lang === "KO") {
    return "자세히 알려주셔서 감사합니다. 담당 매니저가 곧 연락드릴 거예요. 좋은 하루 보내세요!";
  }
  if (lang === "ZH") {
    return "感谢您提供详细信息。CJ物业经理会尽快与您联系。祝您愉快!";
  }
  return "Thanks for the details. We've logged everything and a CJ property manager will reach out shortly. Have a great day!";
}

function buildTenantOffTopicNudge(lang: Lang, topic: string) {
  if (lang === "KO") {
    return `방금 말씀하신 내용이 「${topic}」와 관련 없어 보여요. 「${topic}」 상황을 구체적으로 알려주시겠어요?`;
  }
  if (lang === "ZH") {
    return `您刚才的内容似乎与「${topic}」无关,可以具体描述一下「${topic}」的情况吗?`;
  }
  return `That doesn't seem related to "${topic}". Could you describe your "${topic}" situation specifically?`;
}

function buildTenantCloseMismatch(lang: Lang, topic: string) {
  if (lang === "KO") {
    return `남겨주신 정보가 선택하신 「${topic}」과 맞지 않는 것 같습니다. 대화를 종료하겠습니다 — 추가 문의는 CJ에 직접 연락 주세요.`;
  }
  if (lang === "ZH") {
    return `您提供的信息似乎与所选的「${topic}」不符。我们将结束本次对话 — 如需进一步帮助,请直接联系CJ。`;
  }
  return `It seems the information you've shared doesn't match the "${topic}" topic you selected. We'll close this conversation — please contact CJ directly if you'd like to continue.`;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Lang>("EN");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [status, setStatus] = useState<Status>("active");
  const [pendingIntent, setPendingIntent] = useState<Intent | null>(null);
  const [tenantPhase, setTenantPhase] = useState<TenantPhase>(null);
  const [tenantTopic, setTenantTopic] = useState<TenantTopic | null>(null);
  const [tenantOffTopic, setTenantOffTopic] = useState(0);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formError, setFormError] = useState(false);
  const savedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const t = dict[lang];
  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const isTenantForm = tenantPhase === "form";
  const isLeadForm = pendingIntent !== null;
  const showForm = isLeadForm || isTenantForm;

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "bot",
          text: t.openerGreeting,
          chips: [t.chipBuy, t.chipSell, t.chipLease, t.chipTenant, t.chipInspect],
          chipKind: "intent",
        },
      ]);
    }
  }, [open, lang, messages.length, t]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking, pendingIntent, tenantPhase]);

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
    setTenantPhase(null);
    setTenantTopic(null);
    setTenantOffTopic(0);
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormAddress("");
    setFormError(false);
  };

  const handleChip = (chipText: string) => {
    if (status === "ended" || thinking || pendingIntent || tenantPhase) return;
    if (chipText === t.chipTenant) {
      setMessages((prev) => [
        ...prev,
        { role: "user", text: chipText },
        { role: "bot", text: t.tenantFormPrompt },
      ]);
      setTenantPhase("form");
      return;
    }
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

  const handleTopic = (topicText: string) => {
    if (tenantPhase !== "topic" || thinking) return;
    const topicKey = TOPIC_KEYS.find((k) => topicLabel(lang, k) === topicText);
    if (!topicKey) return;
    setTenantTopic(topicKey);
    setTenantPhase("detail");
    setMessages((prev) => [
      ...prev,
      { role: "user", text: topicText },
      { role: "bot", text: buildTenantDetailPrompt(lang, topicText) },
    ]);
  };

  const send = async (text: string) => {
    if (!text.trim() || status === "ended" || thinking || showForm) return;

    const trimmed = text.trim();
    const newMsgs: Msg[] = [...messages, { role: "user", text: trimmed }];
    setMessages(newMsgs);
    setInput("");

    if (tenantPhase === "detail" && tenantTopic) {
      await handleTenantDetail(trimmed, newMsgs);
      return;
    }

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

  const handleTenantDetail = async (message: string, msgsAfterUser: Msg[]) => {
    if (!tenantTopic) return;
    const topicText = topicLabel(lang, tenantTopic);
    setThinking(true);
    let relevant = true;
    try {
      const r = await fetch("/api/tenant-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicText, message }),
      });
      const data = await r.json();
      relevant = data?.relevant !== false;
    } catch {
      relevant = true;
    }

    if (relevant) {
      const closing: Msg[] = [
        ...msgsAfterUser,
        { role: "bot", text: buildTenantClosePolite(lang) },
      ];
      setMessages(closing);
      setStatus("ended");
      setThinking(false);
      finalize(closing);
      return;
    }

    const nextOffTopic = tenantOffTopic + 1;
    if (nextOffTopic >= 2) {
      const closing: Msg[] = [
        ...msgsAfterUser,
        { role: "bot", text: buildTenantCloseMismatch(lang, topicText) },
      ];
      setMessages(closing);
      setStatus("ended");
      setTenantOffTopic(nextOffTopic);
      setThinking(false);
      finalize(closing);
      return;
    }

    setTenantOffTopic(nextOffTopic);
    setMessages([
      ...msgsAfterUser,
      { role: "bot", text: buildTenantOffTopicNudge(lang, topicText) },
    ]);
    setThinking(false);
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

  const submitTenantForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (tenantPhase !== "form" || thinking) return;
    const name = formName.trim();
    const email = formEmail.trim();
    const phone = formPhone.trim();
    const address = formAddress.trim();
    if (!name || !email || !phone || !address) {
      setFormError(true);
      return;
    }
    const intro = buildTenantIntro(lang, name, email, phone, address);
    const topicChips = TOPIC_KEYS.map((k) => topicLabel(lang, k));
    setMessages((prev) => [
      ...prev,
      { role: "user", text: intro },
      {
        role: "bot",
        text: buildTenantTopicPrompt(lang, name),
        chips: topicChips,
        chipKind: "topic",
      },
    ]);
    setTenantPhase("topic");
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormAddress("");
    setFormError(false);
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

  const inputDisabled =
    status === "ended" || thinking || tenantPhase === "topic";
  const inputPlaceholder =
    status === "ended"
      ? t.endedNote
      : tenantPhase === "topic"
      ? t.pickTopicPlaceholder
      : tenantPhase === "detail"
      ? t.detailPlaceholder
      : t.placeholder;

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
            {messages.map((m, i) => {
              const kind = m.chipKind ?? "intent";
              const showIntentChips =
                kind === "intent" &&
                status === "active" &&
                !pendingIntent &&
                tenantPhase === null;
              const showTopicChips =
                kind === "topic" && tenantPhase === "topic";
              const showChips = m.chips && (showIntentChips || showTopicChips);
              return (
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
                    {showChips && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {m.chips!.map((c, j) => (
                          <button
                            key={j}
                            onClick={() =>
                              kind === "topic" ? handleTopic(c) : handleChip(c)
                            }
                            className="bg-paper border border-ink/15 text-xs px-2.5 py-1 hover:border-copper hover:text-copper transition"
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

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

          {isLeadForm ? (
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
          ) : isTenantForm ? (
            <form
              onSubmit={submitTenantForm}
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
              <input
                type="text"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder={t.formAddressPh}
                aria-label={t.formAddress}
                disabled={thinking}
                className="text-sm px-3 py-2 bg-paper border border-ink/15 focus:outline-none focus:border-copper disabled:opacity-50"
              />
              {formError && (
                <p className="text-[11px] text-copper">{t.formErrorTenant}</p>
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
                placeholder={inputPlaceholder}
                disabled={inputDisabled}
                className="flex-1 text-sm px-3 py-2.5 bg-paper-warm border-0 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={inputDisabled}
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
