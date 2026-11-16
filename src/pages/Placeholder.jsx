import { PageHeader } from "../components/page"

/** Shown for a menu that exists in the database but has no page yet. */
export default function Placeholder({ title = "Coming soon" }) {
  return <PageHeader title={title} description="This page isn’t built yet. Its menu is ready — add the page in App.js." />
}
