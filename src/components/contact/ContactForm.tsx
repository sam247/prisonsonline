"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ENDPOINT = "https://admin.betterranking.co.uk/sender/api/f/bs_01aif9zgxqnvldrchtuk2d4i";
const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "msclkid",
] as const;

const LIMITS = { name: 120, email: 200, phone: 40, message: 4000 };

type Status = "idle" | "sending" | "success" | "error";

function attributionFromLocation(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const key of ATTRIBUTION_KEYS) {
    const value = params.get(key)?.trim();
    if (value) out[key] = value.slice(0, 200);
  }
  return out;
}

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const website = String(data.get("website") ?? "");

    if (website) {
      setStatus("success");
      form.reset();
      return;
    }
    if (!name || !email || !message) {
      setError("Name, email, and message are required.");
      setStatus("error");
      return;
    }
    if (name.length > LIMITS.name || email.length > LIMITS.email || phone.length > LIMITS.phone || message.length > LIMITS.message) {
      setError("One of the fields is too long.");
      setStatus("error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    setError("");

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          message,
          form_name: "contact",
          landing_page: window.location.href,
          referrer: document.referrer,
          website: "",
          ...attributionFromLocation(),
        }),
      });
      const payload = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!response.ok || payload?.ok === false) {
        setError("We could not send your message. Please try again.");
        setStatus("error");
        return;
      }
      form.reset();
      setStatus("success");
    } catch {
      setError("We could not send your message. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="rounded-md border border-border bg-card p-4 text-foreground" role="status">
        Thanks. Your message has been sent.
      </p>
    );
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="name">Name</label>
        <Input id="name" name="name" required maxLength={LIMITS.name} autoComplete="name" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="email">Email</label>
        <Input id="email" name="email" type="email" required maxLength={LIMITS.email} autoComplete="email" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="phone">Phone <span className="font-normal text-muted-foreground">(optional)</span></label>
        <Input id="phone" name="phone" type="tel" maxLength={LIMITS.phone} autoComplete="tel" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          required
          maxLength={LIMITS.message}
          rows={6}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        />
      </div>
      {status === "error" ? (
        <p className="text-sm text-destructive" role="alert">{error}</p>
      ) : null}
      <Button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
