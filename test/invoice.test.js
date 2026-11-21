'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const pricing = require('../lib/pricing');
const invoice = require('../lib/invoice');

test('CURRENT BEHAVIOUR: invoice ignores an HSN slab when the order line has no gstRate', function () {
  const items = [{ id: 1, name: 'Rice', hsn: '1006', price: 100, qty: 1 }];
  const billed = pricing.computeTotals(items, '');
  const figures = invoice.computeInvoiceFigures({ items: items, coupon: '' });

  assert.equal(billed.tax, 5);
  assert.equal(billed.total, 105);
  assert.equal(figures.rows[0].gstPercent, 18);
  assert.equal(figures.tax, 18);
  assert.equal(figures.cgst, 9);
  assert.equal(figures.sgst, 9);
  assert.equal(figures.total, 118);
});

test('CURRENT BEHAVIOUR: invoice discount uses gross plus GST and ignores the coupon cap', function () {
  const items = [{ id: 2, name: 'Coffee', hsn: '0901', price: 3000, qty: 1 }];
  const billed = pricing.computeTotals(items, 'SAVE10');
  const figures = invoice.computeInvoiceFigures({ items: items, coupon: 'SAVE10' });

  assert.equal(billed.subtotal, 3000);
  assert.equal(billed.discount, 150);
  assert.equal(billed.tax, 513);
  assert.equal(billed.total, 3363);
  assert.equal(figures.discount, 354);
  assert.equal(figures.tax, 540);
  assert.equal(figures.total, 3186);
});
