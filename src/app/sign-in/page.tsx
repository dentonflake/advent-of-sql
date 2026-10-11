import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Header, Footer } from "@/components/shell";
import { SignInForm } from "@/components/sign-in-form";
import { getLearner } from "@/lib/learner";
import { authConfiguration } from "@/lib/auth";
export const metadata = { title: "Enter the workshop" };
export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next =
    params.next &&
    /^\/2025\/day\/(?:[1-9]|1[0-2])(?:\?part=[12])?$/.test(params.next)
      ? params.next
      : "/workshop";
  if (await getLearner()) redirect(next);
  const config = authConfiguration();
  return (
    <>
      <Header />
      <main className="signin-page" id="main">
        <div className="signin-art">
          <Image
            src="/images/workshop.webp"
            alt="Warm lights in Santa’s snowy workshop"
            fill
            sizes="(max-width: 760px) 100vw, 50vw"
          />
          <div>
            <span className="eyebrow">A PLACE FOR CURIOUS MINDS</span>
            <h2>
              Come in.
              <br />
              The cocoa’s warm.
            </h2>
          </div>
        </div>
        <section className="signin-panel">
          <span className="eyebrow">YOUR NORTH POLE ADVENTURE</span>
          <h1>A key to the workshop.</h1>
          <p>
            Sign in to save your stars and pick up your adventure on any device.
          </p>
          {params.error && (
            <p className="form-message error" role="alert">
              Your sign-in couldn’t finish. The link may have expired or already
              been used. Please try again.
            </p>
          )}
          <SignInForm
            google={config.ready && config.google}
            email={config.ready && config.email}
            next={next}
          />
          <p className="signin-fineprint">
            By signing in, you agree to our{" "}
            <Link href="/privacy">privacy policy</Link>. Your adventure is free.
          </p>
          <Link className="inline-link" href="/setup">
            Set up your database first →
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
