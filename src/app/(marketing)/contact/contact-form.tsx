"use client";

import { useActionState } from "react";
import { submitContact, type ContactResult } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Alert } from "@/components/ui/misc";

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactResult | null, FormData>(submitContact, null);
  if (state?.ok) return <Alert tone="success" title="Message sent">{state.message}</Alert>;
  const err = state?.fieldErrors ?? {};
  return (
    <form action={action} className="grid gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" htmlFor="name" error={err.name}><Input id="name" name="name" required autoComplete="name" /></Field>
        <Field label="Email" htmlFor="email" error={err.email}><Input id="email" name="email" type="email" required autoComplete="email" /></Field>
      </div>
      <Field label="Subject" htmlFor="subject" error={err.subject}><Input id="subject" name="subject" required placeholder="e.g. Error in UKSSSC mock test 2, Q14" /></Field>
      <Field label="Message" htmlFor="message" error={err.message}><Textarea id="message" name="message" rows={5} required /></Field>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <Button type="submit" loading={pending} className="sm:w-fit">Send message</Button>
    </form>
  );
}
