#!/usr/bin/env node
const { executeUpdate } = require('./lib/update');

(async () => {
  await executeUpdate();
}) ();