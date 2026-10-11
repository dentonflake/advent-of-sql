import { Header, Footer } from "@/components/shell";
export const metadata = { title: "Privacy" };
export default function Privacy() {
  return (
    <>
      <Header />
      <main className="page-container prose-page" id="main">
        <span className="eyebrow">YOUR ADVENTURE, YOUR DATA</span>
        <h1>Privacy at the workshop.</h1>
        <p className="page-lead">Last updated October 11, 2026.</p>
        <h2>What we store</h2>
        <p>
          When you sign in, we store your name, email address, account
          information, selected database dialect, and completed puzzle parts.
          Session records can include your IP address and browser information.
          We record submission times to limit repeated attempts; we do not store
          the answer text you submit.
        </p>
        <h2>Sign-in and service providers</h2>
        <p>
          Google sign-in shares basic profile information with us. Email sign-in
          uses Resend to deliver a short-lived link. Our hosting and database
          providers process the data needed to operate this service. Essential
          session cookies keep you signed in. This application includes no
          advertising or analytics trackers.
        </p>
        <h2>Your workshop database</h2>
        <p>
          The SQL database you set up belongs to you. The website does not
          connect to it or receive your queries. It receives only the answer
          value you choose to submit.
        </p>
        <h2>Keeping and deleting your data</h2>
        <p>
          Account and progress records remain until you delete your account.
          Recent submission timestamps are removed as new attempts are recorded.
          You can delete your account and associated progress from the account
          page. Essential cookies can also be removed in your browser.
        </p>
        <p>
          <a href="/account" className="inline-link">
            Manage your account →
          </a>
        </p>
      </main>
      <Footer />
    </>
  );
}
