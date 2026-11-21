'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const pricing = require('../lib/pricing');
const invoice = require('../lib/invoice');
const reports = require('../lib/reports');

function checkoutOrder() {
  const items = [{ id: 1, name: 'Rice', hsn: '1006', price: 640, qty: 1 }];
  const totals = pricing.computeTotals(items, 'WELCOME');
  return Object.assign({
    id: 1,
    date: '2026-11-21',
    customer: 'Test customer',
    coupon: 'WELCOME',
    items: items
  }, totals);
}

test('invoice uses the HSN slab when an order line has no gstRate', function () {
  const order = checkoutOrder();
  const billed = pricing.computeTotals(order.items, order.coupon);
  const figures = invoice.computeInvoiceFigures(order);

  assert.equal(figures.subtotal, 640);
  assert.equal(figures.discount, 32);
  assert.equal(figures.tax, 30.4);
  assert.equal(figures.total, 638.4);
  assert.equal(figures.rows[0].gstPercent, billed.lines[0].gstPercent);
  assert.equal(figures.tax, billed.tax);
  assert.equal(figures.cgst, billed.cgst);
  assert.equal(figures.sgst, billed.sgst);
  assert.equal(figures.total, billed.total);
});

test('invoice applies coupon to taxable value and honors its cap', function () {
  const items = [{ id: 2, name: 'Coffee', hsn: '0901', price: 3000, qty: 1 }];
  const billed = pricing.computeTotals(items, 'SAVE10');
  const figures = invoice.computeInvoiceFigures({ items: items, coupon: 'SAVE10' });

  assert.equal(figures.discount, billed.discount);
  assert.equal(figures.tax, billed.tax);
  assert.equal(figures.total, billed.total);
});

test('invoice interprets a fractional GST rate as a decimal rate', function () {
  const figures = invoice.computeInvoiceFigures({
    items: [{ name: 'Rice', gstRate: 0.05, price: 640, qty: 1 }]
  });

  assert.equal(figures.rows[0].gstPercent, 5);
  assert.equal(figures.tax, 32);
});

test('GST reconciliation matches the corrected invoice to checkout', function () {
  const order = checkoutOrder();
  const result = reports.getGstReconciliation({ orders: [order] });

  assert.equal(result.mismatchCount, 0);
  assert.equal(result.rows[0].matched, true);
});

test('rendered invoice omits the mismatch notice when totals reconcile', function () {
  const html = invoice.render(checkoutOrder());

  assert.equal(html.includes('Accountant Reconciliation Notice:'), false);
});

test('rendered invoice shows the mismatch notice when ledger totals differ', function () {
  const order = checkoutOrder();
  order.total += 1;

  assert.equal(invoice.render(order).includes('Accountant Reconciliation Notice:'), true);
});

test('historical invoices retain coupons that are now inactive', function () {
  const figures = invoice.computeInvoiceFigures({
    items: [{ name: 'Coffee', hsn: '0901', price: 3000, qty: 1 }],
    coupon: 'DIWALI20'
  });

  assert.equal(figures.discount, 250);
  assert.equal(figures.tax, 495);
  assert.equal(figures.total, 3245);
});
