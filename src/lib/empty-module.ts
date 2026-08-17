// Stub for @coinbase/cdp-sdk, aliased in next.config.ts. That package is
// only pulled in by wagmi's Coinbase/Base Account connector to support Base
// Pay's x402 subscription billing, a feature this app never uses — its real
// module chain drags in a long list of optional @x402/* packages we don't
// install. CdpClient is only referenced, never constructed, by the code
// paths this app exercises.
export class CdpClient {}
const emptyModule = {};
export default emptyModule;
