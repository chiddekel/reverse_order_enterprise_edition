import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reverse } from './solution.enterprise.ts';

test('reverse numbers', () => {
  assert.deepEqual(reverse([1, 2, 3]), [3, 2, 1]);
});

test('reverse string chars', () => {
  assert.deepEqual(reverse([...'01234567890123456789']), [...'98765432109876543210']);
});

test('reverse with undefined', () => {
  assert.deepEqual(reverse([0, undefined]), [undefined, 0]);
});
