import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Terms of Service — CChat",
  description: "CChat Terms of Service. Read the rules and conditions for using the CChat platform.",
};

export default function TermsPage() {
  redirect("/jinsi-ya-kufanya-biashara-mtandaoni-tanzania#terms");
}
