import { redirect } from "next/navigation";
import Link from "next/link";
import { Header, Footer } from "@/components/shell";
import { SignOut } from "@/components/sign-out";
import { DeleteAccount } from "@/components/delete-account";
import { getLearner } from "@/lib/learner";
import { dialectLabels } from "@/lib/dialects";
export const metadata = { title: "Your account" };
export default async function Account() {
  const learner = await getLearner();
  if (!learner) redirect("/sign-in");
  return (
    <>
      <Header />
      <main className="page-container prose-page" id="main">
        <span className="eyebrow">YOUR PLACE AT THE WORKSHOP</span>
        <h1>Your account.</h1>
        <dl className="account-details">
          <dt>Name</dt>
          <dd>{learner.name}</dd>
          <dt>Email</dt>
          <dd>{learner.email}</dd>
          <dt>Christmas stars</dt>
          <dd>{learner.completions.length} / 24</dd>
          <dt>Preferred database</dt>
          <dd>
            {dialectLabels[learner.dialect]} ·{" "}
            <Link href="/setup" className="inline-link">
              Change
            </Link>
          </dd>
        </dl>
        {!learner.localPreview && <SignOut />}
        <DeleteAccount localPreview={learner.localPreview} />
      </main>
      <Footer />
    </>
  );
}
