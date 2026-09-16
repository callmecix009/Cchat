import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Privacy Policy — CChat",
  description: "CChat Privacy Policy. Learn how CChat collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  redirect("/jinsi-ya-kufanya-biashara-mtandaoni-tanzania#privacy");
}
