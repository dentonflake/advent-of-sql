import { Header, Footer } from "@/components/shell";
import { SetupGuide } from "@/components/setup-guide";
import { getLearner } from "@/lib/learner";
import { tables } from "@/lib/sql";
export const metadata = { title: "Set up your database" };
const descriptions: Record<string, string> = {
  departments: "Workshop teams and their buildings.",
  elves: "The crew, their teams, and their first year here.",
  toys: "Toy names, categories, prices, weights, and fragile flags.",
  regions: "Delivery destinations and sleigh route codes.",
  children: "The nice-list ledger and mailing details.",
  wishes: "Each child’s requested toy, quantity, and letter date.",
  inventory: "Units on shelves and restock thresholds.",
  production: "Batches made by elves and quality checks.",
  shipments: "Packing and delivery records for individual wishes.",
};
export default async function Setup() {
  const learner = await getLearner();
  return (
    <>
      <Header />
      <main className="page-container setup-page" id="main">
        <span className="eyebrow">BEFORE THE FIRST LETTER</span>
        <h1>Build your little workshop.</h1>
        <p className="page-lead">
          Your database. Your favorite SQL.
          <br />
          The same Christmas adventure, whichever you choose.
        </p>
        <SetupGuide
          initial={learner?.dialect ?? "postgresql"}
          signedIn={Boolean(learner)}
        />
        <section className="schema-section" id="schema">
          <span className="eyebrow">THE WORKSHOP LEDGER</span>
          <h2>Meet your tables.</h2>
          <p>
            Nine connected tables, loaded once. IDs link the ledgers together.
          </p>
          <div className="schema-relations">
            <code>departments → elves → production ← toys ← inventory</code>
            <code>regions → children → wishes ← toys</code>
            <code>wishes → shipments ← elves</code>
          </div>
          <div className="schema-grid">
            {Object.entries(tables).map(([name, table]) => (
              <details key={name}>
                <summary>
                  <code>{name}</code>
                  <span>{table.rows.length} rows</span>
                </summary>
                <p>{descriptions[name]}</p>
                <table>
                  <caption className="sr-only">Columns in {name}</caption>
                  <thead>
                    <tr>
                      <th>Column</th>
                      <th>Type and relationship</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(table.columns).map(([column, type]) => (
                      <tr key={column}>
                        <td>
                          <code>{column}</code>
                        </td>
                        <td>{type.toLowerCase()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            ))}
          </div>
          <div className="schema-conventions">
            <h3>A few ledger conventions</h3>
            <ul>
              <li>
                Prices are whole <code>price_coins</code>; weights are whole{" "}
                <code>weight_grams</code>.
              </li>
              <li>
                <code>fragile</code> and <code>quality_checked</code> use 1 for
                yes and 0 for no.
              </li>
              <li>
                Dates are stored as <code>YYYY-MM-DD</code> text, so simple date
                comparisons work in every dialect.
              </li>
              <li>
                Missing values are <code>NULL</code>. A shipment’s status is{" "}
                <code>packed</code>, <code>in_transit</code>, or{" "}
                <code>delivered</code>.
              </li>
              <li>
                Each wish has at most one shipment. No shipment means the wish
                hasn’t reached the shipping desk.
              </li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
