import { useState } from 'react';
import type { BugAppProps } from './registry';

const catalog = {
  mat: { name: 'Desk mat', cents: 3005 },
  cable: { name: 'Cable kit', cents: 1995 },
  notebook: { name: 'Notebook', cents: 1235 },
} as const;

type Product = keyof typeof catalog;
type Shipping = 'standard' | 'express';
type Row = { id: Product; qty: number };
const initialRows: Row[] = [{ id: 'mat', qty: 1 }, { id: 'cable', qty: 1 }];
const dollars = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const subtotalOf = (rows: Row[]) => rows.reduce((sum, { id, qty }) => sum + (qty > 0 ? catalog[id].cents : 0), 0);
const actualMerchandise = (rows: Row[]) => rows.reduce((sum, { id, qty }) => sum + catalog[id].cents * qty, 0);

export function CheckoutCart({ onTrigger }: BugAppProps) {
  const [rows, setRows] = useState(initialRows);
  const [edits, setEdits] = useState<Partial<Record<Product, string>>>({});
  const [errors, setErrors] = useState<Partial<Record<Product, string>>>({});
  const [shipping, setShipping] = useState<Shipping>('express');
  const [coupon, setCoupon] = useState('');
  const [applications, setApplications] = useState(0);
  const [couponStatus, setCouponStatus] = useState('');

  const subtotal = subtotalOf(rows);
  const discount = Math.min(subtotal, applications * Math.floor(subtotal / 10));
  const shippingFee = rows.length === 0 ? 0 : shipping === 'express' ? 995 : subtotal > 5000 ? 0 : 495;

  function checkAmounts(next: Row[], method = shipping, codes = applications) {
    const amount = subtotalOf(next);
    if (codes > 0 && amount % 10 >= 5 && codes * Math.floor(amount / 10) < amount) onTrigger('round-discount');
    if (method === 'standard' && amount === 5000 && actualMerchandise(next) === 5000) {
      onTrigger('shipping-threshold');
    }
  }

  function applyQuantity(id: Product, value: string) {
    const qty = Number(value);
    if (!/^\d+$/.test(value) || qty > 9) {
      setErrors((previous) => ({ ...previous, [id]: 'Enter a whole quantity from 1 to 9.' }));
      return;
    }
    const next = rows.map((row) => row.id === id ? { ...row, qty } : row);
    setRows(next);
    setErrors((previous) => ({ ...previous, [id]: undefined }));
    if (qty === 0) onTrigger('qty-zero');
    if (qty > 1) onTrigger('subtotal-qty');
    checkAmounts(next);
  }

  function add(id: Product) {
    const next = [...rows, { id, qty: 1 }];
    setRows(next);
    checkAmounts(next);
  }

  function remove(id: Product) {
    const removed = rows[0].id;
    const next = rows.slice(1);
    setRows(next);
    setEdits((previous) => ({ ...previous, [removed]: undefined }));
    setErrors((previous) => ({ ...previous, [removed]: undefined }));
    if (id !== removed) onTrigger('remove-wrong');
    checkAmounts(next);
  }

  function applyCoupon() {
    if (coupon.trim().toUpperCase() !== 'SAVE10') {
      setCouponStatus('Coupon code not recognized.');
      return;
    }
    setApplications(applications + 1);
    setCouponStatus('SAVE10 applied.');
    if (subtotal % 10 >= 5 && (applications + 1) * Math.floor(subtotal / 10) < subtotal) onTrigger('round-discount');
    if (applications > 0 && subtotal > 0 && applications * Math.floor(subtotal / 10) < subtotal) onTrigger('coupon-double');
  }

  return (
    <section className="bug-app" aria-label="Checkout cart">
      <h2 className="h3">Checkout cart</h2>
      {!rows.length && <p className="small muted">The cart is empty.</p>}
      <ul className="bug-cart-lines">
        {rows.map(({ id, qty }) => {
          const { name, cents } = catalog[id];
          const value = edits[id] ?? String(qty);
          return (
            <li key={id}>
              <div className="bug-between">
                <span><strong>{name}</strong> <span className="caption">{dollars(cents)} each</span></span>
                <span className="num">{dollars(cents * qty)}</span>
              </div>
              <form className="bug-cart-quantity" onSubmit={(event) => { event.preventDefault(); applyQuantity(id, value); }}>
                <label className="field">
                  <span>Quantity<span className="sr-only"> for {name}</span></span>
                  <input inputMode="numeric" className="input" value={value} aria-invalid={!!errors[id]} aria-describedby={errors[id] ? `qty-error-${id}` : undefined}
                    onChange={(event) => setEdits((previous) => ({ ...previous, [id]: event.target.value }))} />
                </label>
                <button type="submit" className="btn btn--sm">Apply<span className="sr-only"> quantity for {name}</span></button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => remove(id)}>Remove<span className="sr-only"> {name}</span></button>
              </form>
              {errors[id] && <p className="small fail" id={`qty-error-${id}`} role="alert">{errors[id]}</p>}
            </li>
          );
        })}
      </ul>
      <div className="btn-row">
        {(Object.keys(catalog) as Product[]).filter((id) => !rows.some((row) => row.id === id)).map((id) =>
          <button key={id} type="button" className="btn btn--sm" onClick={() => add(id)}>Add {catalog[id].name.toLowerCase()}</button>,
        )}
      </div>
      <div className="bug-cart-options">
        <form className="bug-cart-coupon" onSubmit={(event) => { event.preventDefault(); applyCoupon(); }}>
          <label className="field">
            <span>Coupon code</span>
            <input className="input" value={coupon} onChange={(event) => setCoupon(event.target.value)} />
          </label>
          <button type="submit" className="btn btn--primary">Apply code</button>
        </form>
        {couponStatus && <p className="small" role="status">{couponStatus}</p>}
        <label className="field">
          <span id="cart-shipping-method">Shipping method</span>
          <select className="select" aria-labelledby="cart-shipping-method" value={shipping} onChange={(event) => {
            const method = event.target.value as Shipping;
            setShipping(method);
            if (method === 'standard' && subtotal === 5000 && actualMerchandise(rows) === 5000) {
              onTrigger('shipping-threshold');
            }
          }}>
            <option value="express">Express</option>
            <option value="standard">Standard</option>
          </select>
        </label>
      </div>
      <dl className="bug-cart-totals" aria-live="polite">
        <div className="bug-between"><dt>Subtotal</dt><dd>{dollars(subtotal)}</dd></div>
        <div className="bug-between"><dt>Discount</dt><dd>{discount > 0 ? `−${dollars(discount)}` : dollars(0)}</dd></div>
        <div className="bug-between"><dt>Shipping</dt><dd>{dollars(shippingFee)}</dd></div>
        <div className="bug-between"><dt>Total</dt><dd>{dollars(subtotal - discount + shippingFee)}</dd></div>
      </dl>
    </section>
  );
}
