import "server-only";

// Slack file upload (v2 flow: getUploadURLExternal → PUT → completeUploadExternal).
// The legacy files.upload endpoint is deprecated as of 2025; this is the
// supported path for posting a generated PDF into a thread.

const BASE = "https://slack.com/api";

export async function uploadFileToThread(opts: {
  channel: string;
  thread_ts: string;
  filename: string;
  title?: string;
  initial_comment?: string;
  bytes: Uint8Array;
  altText?: string;
}): Promise<{ ok: boolean; error?: string; file_id?: string }> {
  const botToken = process.env.SLACK_BOT_TOKEN;
  if (!botToken) return { ok: false, error: "missing_bot_token" };

  // Step 1: get an upload URL.
  try {
    const params = new URLSearchParams({
      filename: opts.filename,
      length: String(opts.bytes.byteLength),
    });
    if (opts.altText) params.set("alt_text", opts.altText);

    const r1 = await fetch(`${BASE}/files.getUploadURLExternal?${params.toString()}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${botToken}` },
    });
    const d1 = await r1.json();
    if (!d1.ok) {
      console.error("getUploadURLExternal failed:", d1.error);
      return { ok: false, error: d1.error };
    }
    const uploadUrl = d1.upload_url as string;
    const fileId = d1.file_id as string;

    // Step 2: PUT the bytes.
    const r2 = await fetch(uploadUrl, {
      method: "POST",
      body: new Blob([opts.bytes]),
    });
    if (!r2.ok) {
      console.error("upload PUT failed:", r2.status);
      return { ok: false, error: `upload_status_${r2.status}` };
    }

    // Step 3: complete and post into the thread.
    const r3 = await fetch(`${BASE}/files.completeUploadExternal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${botToken}`,
      },
      body: JSON.stringify({
        files: [{ id: fileId, title: opts.title ?? opts.filename }],
        channel_id: opts.channel,
        thread_ts: opts.thread_ts,
        initial_comment: opts.initial_comment,
      }),
    });
    const d3 = await r3.json();
    if (!d3.ok) {
      console.error("completeUploadExternal failed:", d3.error);
      return { ok: false, error: d3.error };
    }
    return { ok: true, file_id: fileId };
  } catch (err: any) {
    console.error("uploadFileToThread error:", err?.message);
    return { ok: false, error: err?.message };
  }
}
