import { redirect } from "next/navigation";

// The Research tab was renamed to Trade. Preserve old links/bookmarks.
export default function ResearchRedirect() {
  redirect("/app/trade");
}
