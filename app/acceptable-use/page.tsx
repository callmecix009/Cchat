import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Acceptable Use Policy — CChat",
  description: "CChat Acceptable Use Policy. Learn the rules for using the CChat platform responsibly.",
};

export default function AcceptableUsePage() {
  redirect("/jinsi-ya-kufanya-biashara-mtandaoni-tanzania#acceptable-use");
}
