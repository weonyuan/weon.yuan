"use client";

import { useState } from "react";

type ContactFormData = {
  name: string;
  email: string;
  message: string;
};

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Convert FormData to a typed object
    const data = Object.fromEntries(formData.entries()) as Record<string, FormDataEntryValue>;
    const payload: ContactFormData = {
      name: String(data.name ?? ""),
      email: String(data.email ?? ""),
      message: String(data.message ?? ""),
    };

    try {
      // Replace this with your own endpoint/integration
      // await fetch("/api/contact", { method: "POST", body: JSON.stringify(payload) });
      console.log("Contact payload", payload);
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold">Contact</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Drop me a note—I will get back to you soon.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input name="name" required className="mt-1 w-full rounded-md border bg-background p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input type="email" name="email" required className="mt-1 w-full rounded-md border bg-background p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Message</label>
          <textarea name="message" required rows={5} className="mt-1 w-full rounded-md border bg-background p-2" />
        </div>

        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
        >
          {status === "sending" ? "Sending..." : "Send"}
        </button>

        {status === "sent" && (
          <p className="text-sm text-green-600">Message sent! 🎉</p>
        )}
        {status === "error" && (
          <p className="text-sm text-red-600">Something went wrong. Try again?</p>
        )}
      </form>
    </section>
  );
}