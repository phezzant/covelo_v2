import { redirect } from "next/navigation";

// The Portfolio tab was folded into Home (its holdings are the spine of Home).
// Preserve old links/bookmarks.
export default function PortfolioRedirect() {
  redirect("/app/home");
}
