import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import lasagnaImg from "@/assets/dishes/lasagna.jpg";
import pastaImg from "@/assets/dishes/pasta.jpg";
import friesImg from "@/assets/dishes/fries.jpg";
import karahiImg from "@/assets/dishes/karahi.jpg";
import riceImg from "@/assets/dishes/rice.jpg";
import waffleImg from "@/assets/dishes/waffle.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "El Rincón — Arcade Food Ordering" },
      { name: "description", content: "An arcade-style restaurant ordering game. Pick your dishes, fill your cart, and clear the bill!" },
      { property: "og:title", content: "El Rincón — Arcade Food Ordering" },
      { property: "og:description", content: "Khao Peo Zindigi Jeo — order food, arcade-game style." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap" },
    ],
  }),
  component: Game,
});

type Item = { name: string; price: number; emoji: string; image: string; color: string; size?: string };

const ITEMS: Item[] = [
  { name: "Lasagna", price: 1800, emoji: "🍝", image: lasagnaImg, color: "var(--color-primary)" },
  { name: "Pasta", price: 1200, emoji: "🍜", image: pastaImg, color: "var(--color-secondary)" },
  { name: "Loaded Fries", price: 650, emoji: "🍟", image: friesImg, color: "var(--color-coin)" },
  { name: "Beef Karahi", price: 1300, emoji: "🍛", image: karahiImg, color: "var(--color-destructive)", size: "Half" },
  { name: "Beef Karahi", price: 2400, emoji: "🍛", image: karahiImg, color: "var(--color-destructive)", size: "Full" },
  { name: "Singaporean Rice", price: 950, emoji: "🍚", image: riceImg, color: "var(--color-success)" },
  { name: "Ice Cream Waffle", price: 850, emoji: "🍦", image: waffleImg, color: "var(--color-accent)" },
];

const labelOf = (it: Item) => it.size ? `${it.name} (${it.size})` : it.name;
const KARAHI_HALF = 3;
const KARAHI_FULL = 4;

type Stage = "intro" | "menu" | "bill";
type Customer = { name: string; phone: string; address: string };

function Game() {
  const [stage, setStage] = useState<Stage>("intro");
  const [customer, setCustomer] = useState<Customer>({ name: "", phone: "", address: "" });
  const [cart, setCart] = useState<number[]>(() => ITEMS.map(() => 0));
  const [toast, setToast] = useState<string | null>(null);

  const total = useMemo(
    () => cart.reduce((s, q, i) => s + q * ITEMS[i].price, 0),
    [cart],
  );
  const itemCount = cart.reduce((s, q) => s + q, 0);

  const flash = (msg: string) => {
    setToast(msg);
    window.clearTimeout((flash as any)._t);
    (flash as any)._t = window.setTimeout(() => setToast(null), 1400);
  };

  const add = (i: number) => {
    setCart((c) => c.map((q, idx) => (idx === i ? q + 1 : q)));
    flash(`+1 ${labelOf(ITEMS[i])}`);
  };
  const remove = (i: number) => {
    setCart((c) => c.map((q, idx) => (idx === i ? Math.max(0, q - 1) : q)));
  };
  const clearItem = (i: number) =>
    setCart((c) => c.map((q, idx) => (idx === i ? 0 : q)));

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 scanlines" aria-hidden />
      <Header itemCount={itemCount} total={total} stage={stage} setStage={setStage} />

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-6">
        {stage === "intro" && (
          <IntroScreen
            customer={customer}
            setCustomer={setCustomer}
            onStart={() => setStage("menu")}
          />
        )}

        {stage === "menu" && (
          <MenuScreen
            cart={cart}
            total={total}
            onAdd={add}
            onRemove={remove}
            onClear={clearItem}
            onCheckout={() => itemCount > 0 ? setStage("bill") : flash("Cart is empty!")}
          />
        )}

        {stage === "bill" && (
          <BillScreen
            customer={customer}
            cart={cart}
            total={total}
            onBack={() => setStage("menu")}
            onNewGame={() => {
              setCart(ITEMS.map(() => 0));
              setCustomer({ name: "", phone: "", address: "" });
              setStage("intro");
            }}
          />
        )}
      </div>

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 top-24 z-50 flex justify-center">
          <div className="animate-pop pixel-border rounded-md bg-card px-4 py-2 pixel text-xs text-accent">
            {toast}
          </div>
        </div>
      )}
    </main>
  );
}

function Header({
  itemCount,
  total,
  stage,
  setStage,
}: {
  itemCount: number;
  total: number;
  stage: Stage;
  setStage: (s: Stage) => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b-4 border-black bg-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <button
          onClick={() => setStage("intro")}
          className="flex items-center gap-2"
        >
          <span className="text-2xl animate-float">🍽️</span>
          <h1 className="text-stroke text-sm text-primary sm:text-base">
            EL RINCÓN
          </h1>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <Badge label={`x${itemCount}`} icon="🛒" tone="secondary" />
          <div className="pixel-border-sm flex items-center gap-2 rounded-md bg-background px-3 py-1.5">
            <span className="animate-coin text-lg">🪙</span>
            <span className="pixel text-xs text-coin">Rs.{total}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function Badge({ label, icon, tone }: { label: string; icon?: string; tone: "accent" | "secondary" }) {
  const bg = tone === "accent" ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground";
  return (
    <div className={`pixel-border-sm hidden sm:flex items-center gap-1 rounded-md ${bg} px-2 py-1 pixel text-[10px]`}>
      {icon && <span className="text-sm">{icon}</span>}
      {label}
    </div>
  );
}

/* ---------------- Intro / Player Setup ---------------- */

function IntroScreen({
  customer,
  setCustomer,
  onStart,
}: {
  customer: Customer;
  setCustomer: (c: Customer) => void;
  onStart: () => void;
}) {
  const [err, setErr] = useState("");

  const submit = () => {
    if (!customer.name.trim()) return setErr("Enter your player name!");
    if (!/^\d+$/.test(customer.phone)) return setErr("Phone must be digits only!");
    if (!customer.address.trim()) return setErr("Enter a delivery address!");
    setErr("");
    onStart();
  };

  return (
    <section className="mx-auto max-w-2xl animate-pop">
      <div className="mb-6 text-center">
        <div className="mb-3 text-6xl animate-float">👨‍🍳</div>
        <h2 className="text-stroke pixel text-2xl text-primary sm:text-3xl">
          EL RINCÓN
        </h2>
        <p className="mt-3 text-xl text-muted-foreground">
          Khao Peo Zindigi Jeo — enter your details to begin your order.
        </p>
      </div>

      <div className="pixel-border rounded-lg bg-card p-6">
        <Field
          label="Player Name"
          value={customer.name}
          onChange={(v) => setCustomer({ ...customer, name: v })}
          placeholder="e.g. Hungry Hero"
        />
        <Field
          label="Phone"
          value={customer.phone}
          onChange={(v) => setCustomer({ ...customer, phone: v.replace(/\D/g, "") })}
          placeholder="03001234567"
          inputMode="numeric"
        />
        <Field
          label="Delivery Address"
          value={customer.address}
          onChange={(v) => setCustomer({ ...customer, address: v })}
          placeholder="House, Street, City"
          textarea
        />

        {err && (
          <p className="mb-3 pixel text-[10px] text-destructive">⚠ {err}</p>
        )}

        <button
          onClick={submit}
          className="primary-glow pixel-border w-full rounded-md bg-primary px-6 py-4 pixel text-sm text-primary-foreground transition active:translate-y-0.5"
          style={{ backgroundImage: "var(--gradient-primary)" }}
        >
          ▶ START YOUR ORDER
        </button>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
  inputMode?: "numeric" | "text";
}) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block pixel text-[10px] text-accent">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="pixel-border-sm w-full rounded-md bg-input px-3 py-2 text-lg text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
      ) : (
        <input
          value={value}
          inputMode={inputMode}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pixel-border-sm w-full rounded-md bg-input px-3 py-2 text-lg text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
      )}
    </label>
  );
}

/* ---------------- Menu / Cart ---------------- */

function MenuScreen({
  cart,
  total,
  onAdd,
  onRemove,
  onClear,
  onCheckout,
}: {
  cart: number[];
  total: number;
  onAdd: (i: number) => void;
  onRemove: (i: number) => void;
  onClear: (i: number) => void;
  onCheckout: () => void;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="pixel text-stroke text-lg text-accent sm:text-xl">SELECT DISH</h2>
          <span className="pixel text-[10px] text-muted-foreground">CHOOSE WISELY</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ITEMS.map((it, i) => {
            if (i === KARAHI_FULL) return null;
            if (i === KARAHI_HALF) {
              return (
                <KarahiCard
                  key="karahi"
                  half={ITEMS[KARAHI_HALF]}
                  full={ITEMS[KARAHI_FULL]}
                  qtyHalf={cart[KARAHI_HALF]}
                  qtyFull={cart[KARAHI_FULL]}
                  onAdd={(size) => onAdd(size === "Half" ? KARAHI_HALF : KARAHI_FULL)}
                  onRemove={(size) => onRemove(size === "Half" ? KARAHI_HALF : KARAHI_FULL)}
                  onClearAll={() => { onClear(KARAHI_HALF); onClear(KARAHI_FULL); }}
                />
              );
            }
            return (
              <DishCard
                key={it.name}
                item={it}
                qty={cart[i]}
                onAdd={() => onAdd(i)}
                onRemove={() => onRemove(i)}
                onClear={() => onClear(i)}
              />
            );
          })}
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="pixel-border rounded-lg bg-card p-4">
          <h3 className="pixel text-sm text-secondary">🛒 INVENTORY</h3>
          <div className="mt-3 space-y-2 text-lg">
            {cart.every((q) => q === 0) ? (
              <p className="text-muted-foreground">Empty… go grab some loot!</p>
            ) : (
              cart.map((q, i) =>
                q > 0 ? (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <span className="truncate">
                      {ITEMS[i].emoji} {labelOf(ITEMS[i])} ×{q}
                    </span>
                    <span className="pixel text-[10px] text-coin">
                      Rs.{q * ITEMS[i].price}
                    </span>
                  </div>
                ) : null,
              )
            )}
          </div>

          <div className="mt-4 border-t-2 border-dashed border-border pt-3">
            <div className="flex items-center justify-between">
              <span className="pixel text-[10px] text-muted-foreground">TOTAL</span>
              <span className="pixel text-base text-coin">Rs.{total}</span>
            </div>
          </div>

          <button
            onClick={onCheckout}
            className="pixel-border mt-4 w-full rounded-md bg-success px-4 py-3 pixel text-xs text-success-foreground transition active:translate-y-0.5"
          >
            ▶ CHECKOUT
          </button>
        </div>
      </aside>
    </section>
  );
}

function DishCard({
  item,
  qty,
  onAdd,
  onRemove,
  onClear,
}: {
  item: Item;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
  onClear: () => void;
}) {
  return (
    <div className="pixel-border group relative overflow-hidden rounded-lg bg-card transition hover:-translate-y-1">
      <div className="relative h-40 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          width={600}
          height={600}
          className="h-full w-full object-cover transition group-hover:scale-105"
          style={{ imageRendering: "auto" }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `linear-gradient(180deg, transparent 55%, color-mix(in oklab, ${item.color} 40%, transparent))` }}
        />
        <span className="pixel-border-sm absolute left-2 top-2 rounded-md bg-background/80 px-2 py-1 text-lg backdrop-blur">
          {item.emoji}
        </span>
        {qty > 0 && (
          <span className="pixel-border-sm absolute right-2 top-2 rounded-md bg-secondary px-2 py-1 pixel text-[10px] text-secondary-foreground">
            ×{qty}
          </span>
        )}
      </div>


      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="pixel text-[11px] leading-tight text-foreground">{item.name}</h4>
          <span className="pixel text-[10px] text-coin">Rs.{item.price}</span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={onRemove}
            disabled={qty === 0}
            className="pixel-border-sm h-9 w-9 rounded-md bg-muted pixel text-xs disabled:opacity-40"
            aria-label={`Remove ${item.name}`}
          >
            −
          </button>
          <div className="pixel-border-sm flex h-9 flex-1 items-center justify-center rounded-md bg-background pixel text-xs">
            {qty}
          </div>
          <button
            onClick={onAdd}
            className="pixel-border-sm h-9 w-9 rounded-md bg-primary pixel text-xs text-primary-foreground"
            style={{ backgroundImage: "var(--gradient-primary)" }}
            aria-label={`Add ${item.name}`}
          >
            +
          </button>
          {qty > 0 && (
            <button
              onClick={onClear}
              className="pixel-border-sm h-9 rounded-md bg-destructive px-2 pixel text-[10px] text-destructive-foreground"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Bill / Victory Screen ---------------- */

function BillScreen({
  customer,
  cart,
  total,
  onBack,
  onNewGame,
}: {
  customer: Customer;
  cart: number[];
  total: number;
  onBack: () => void;
  onNewGame: () => void;
}) {
  return (
    <section className="mx-auto max-w-xl animate-pop">
      <div className="mb-4 text-center">
        <div className="text-6xl animate-float">🏆</div>
        <h2 className="text-stroke pixel mt-2 text-xl text-coin sm:text-2xl">
          QUEST COMPLETE
        </h2>
        <p className="pixel mt-2 text-[10px] text-accent animate-blink">
          ▶ RECEIPT UNLOCKED
        </p>
      </div>

      <div className="pixel-border rounded-lg bg-card p-6">
        <div className="mb-4 space-y-1 text-lg">
          <Row k="Player" v={customer.name} />
          <Row k="Phone" v={customer.phone} />
          <Row k="Address" v={customer.address} />
        </div>

        <div className="border-y-2 border-dashed border-border py-3">
          <h3 className="pixel mb-2 text-[10px] text-accent">ORDERED LOOT</h3>
          {cart.every((q) => q === 0) ? (
            <p className="text-muted-foreground">No items ordered.</p>
          ) : (
            <ul className="space-y-1 text-lg">
              {cart.map((q, i) =>
                q > 0 ? (
                  <li key={i} className="flex justify-between">
                    <span>
                      {ITEMS[i].emoji} {ITEMS[i].name} ×{q}
                    </span>
                    <span className="pixel text-[10px] text-coin">
                      Rs.{q * ITEMS[i].price}
                    </span>
                  </li>
                ) : null,
              )}
            </ul>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="pixel text-xs text-muted-foreground">TOTAL</span>
          <span className="pixel text-lg text-coin">Rs.{total}</span>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onBack}
            className="pixel-border-sm flex-1 rounded-md bg-muted px-4 py-3 pixel text-[10px]"
          >
            ◀ EDIT ORDER
          </button>
          <button
            onClick={onNewGame}
            className="pixel-border flex-1 rounded-md bg-primary px-4 py-3 pixel text-[10px] text-primary-foreground"
            style={{ backgroundImage: "var(--gradient-primary)" }}
          >
            NEW GAME ▶
          </button>
        </div>
      </div>

      <p className="mt-4 text-center pixel text-[10px] text-muted-foreground">
        THANK YOU FOR PLAYING ♥
      </p>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-3">
      <span className="pixel min-w-20 text-[10px] text-muted-foreground">{k}</span>
      <span className="flex-1 break-words">{v || "—"}</span>
    </div>
  );
}
