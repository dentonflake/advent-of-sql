"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Download, ArrowRight, Database } from "lucide-react";
import { dialects, dialectLabels, type Dialect } from "@/lib/dialects";
const guides: Record<
  Dialect,
  {
    version: string;
    intro: string;
    command: string;
    run: string;
    verify: string;
    notes: string;
  }
> = {
  postgresql: {
    version: "PostgreSQL 15 or newer",
    intro:
      "Create an empty database called advent_workshop on your PostgreSQL server. In pgAdmin, select it and open the Query Tool. Open the downloaded script and run it once.",
    command:
      "createdb advent_workshop\npsql -d advent_workshop -v ON_ERROR_STOP=1 -f advent-of-sql-2025-postgresql.sql",
    run: "Write your queries in pgAdmin’s Query Tool or connect with psql -d advent_workshop. For a hosted database, connect with the database URL supplied by your provider instead.",
    verify: "SELECT COUNT(*) FROM toys;",
    notes:
      "The setup script uses a transaction. Run it in an empty database; it never drops existing tables. If setup fails, roll back before trying again.",
  },
  mysql: {
    version: "MySQL 8.0 or newer",
    intro:
      "In MySQL Workbench, connect to your server and create a new schema named advent_workshop. Set it as the default schema, open the downloaded SQL file, and run the whole script once.",
    command:
      "mysql -u YOUR_USER -p -e 'CREATE DATABASE advent_workshop;'\nmysql -u YOUR_USER -p advent_workshop < advent-of-sql-2025-mysql.sql",
    run: "Open a query tab in MySQL Workbench with advent_workshop selected, or use mysql -u YOUR_USER -p advent_workshop. Write and execute your SQL there.",
    verify: "SELECT COUNT(*) FROM toys;",
    notes:
      "MySQL commits table creation automatically. If a first setup run fails halfway through, create a fresh empty schema for the next attempt. Use the script only in your workshop schema.",
  },
  sqlite: {
    version: "SQLite 3",
    intro:
      "SQLite needs no database server. In DB Browser for SQLite, create a new database file named advent_workshop.db. Under Execute SQL, open the downloaded script and run it, then save your changes.",
    command: "sqlite3 advent_workshop.db < advent-of-sql-2025-sqlite.sql",
    run: "Write queries in DB Browser for SQLite’s Execute SQL tab, or open sqlite3 advent_workshop.db in a terminal. Keep this file to reuse the same workshop for all twelve days.",
    verify: "SELECT COUNT(*) FROM toys;",
    notes:
      "Use a new, empty database file. The script enables foreign keys and runs in a transaction. It doesn’t delete or overwrite an existing workshop.",
  },
};
export function SetupGuide({
  initial,
  signedIn,
}: {
  initial: Dialect;
  signedIn: boolean;
}) {
  const [dialect, setDialect] = useState(initial);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  async function choose(value: Dialect) {
    setDialect(value);
    setMessage("");
    setCopied(false);
    if (!signedIn) return;
    setSaving(true);
    try {
      const response = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dialect: value }),
      });
      if (!response.ok)
        setMessage(
          "Your download is ready, but we couldn’t save your preference. Please try again.",
        );
      else {
        setMessage("Database preference saved.");
        router.refresh();
      }
    } catch {
      setMessage(
        "Your download is ready. We couldn’t save your preference while offline.",
      );
    } finally {
      setSaving(false);
    }
  }
  const guide = guides[dialect];
  return (
    <>
      <div
        className="dialect-selector"
        role="group"
        aria-label="Choose your SQL dialect"
      >
        {dialects.map((value) => (
          <button
            key={value}
            type="button"
            disabled={saving}
            onClick={() => choose(value)}
            aria-pressed={dialect === value}
            className={dialect === value ? "selected" : ""}
          >
            <Database size={20} strokeWidth={1.5} />
            <span>
              {dialectLabels[value]}
              <small>
                {value === "sqlite"
                  ? "A simple local file"
                  : value === "postgresql"
                    ? "A powerful all-rounder"
                    : "A familiar favorite"}
              </small>
            </span>
            {dialect === value && <Check size={17} />}
          </button>
        ))}
      </div>
      <div className="setup-download">
        <div>
          <span className="eyebrow">ONE SCRIPT. THE WHOLE WORKSHOP.</span>
          <h2>{dialectLabels[dialect]} setup</h2>
          <p>{guide.version} · 9 tables · 302 rows · Dataset v1.0</p>
        </div>
        <a
          href={`/downloads/advent-of-sql-2025-${dialect}.sql`}
          download
          className="button primary"
        >
          <Download size={17} /> Download setup script
        </a>
      </div>
      <p className="preference-status" role="status">
        {saving
          ? "Saving your preference…"
          : message ||
            (signedIn
              ? "Your database choice is saved with your account."
              : "Sign in to save your preferred database.")}
      </p>
      <div className="setup-steps">
        <section>
          <span className="number-circle">1</span>
          <div>
            <h3>Create your workshop</h3>
            <p>{guide.intro}</p>
            <details>
              <summary>Prefer the terminal?</summary>
              <div className="code-block">
                <pre>
                  <code>{guide.command}</code>
                </pre>
                <button
                  className="copy-button"
                  aria-label="Copy setup commands"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(guide.command);
                      setCopied(true);
                    } catch {
                      setMessage(
                        "Copy didn’t work. Select the commands and copy them manually.",
                      );
                    }
                  }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <p className="field-help">
                Run from the folder containing your downloaded script. Use your
                own server credentials where needed.
              </p>
            </details>
            <p className="setup-caution">{guide.notes}</p>
          </div>
        </section>
        <section>
          <span className="number-circle">2</span>
          <div>
            <h3>Check the shelves</h3>
            <p>
              Run this quick check. If the result is <strong>18</strong>, your
              toy ledger is ready.
            </p>
            <pre className="code-block">
              <code>{guide.verify}</code>
            </pre>
          </div>
        </section>
        <section>
          <span className="number-circle">3</span>
          <div>
            <h3>Keep your query window open</h3>
            <p>{guide.run}</p>
            <p>
              Return here to read each puzzle and submit a single answer value.
              Use this same database for the whole adventure; you only need to
              load it once.
            </p>
            <a className="inline-link" href="/workshop">
              Open the challenges <ArrowRight size={16} />
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
