// Placeholder "already purchased this wallet" reader. Once the contract is
// live this should read the on-chain purchased-amount mapping directly —
// this stub just derives a stable demo value from the address so the buy
// widget has something realistic to enforce the cap against.
export function getMockPurchasedUsd(address: string): number {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = (Math.imul(31, hash) + address.charCodeAt(i)) | 0;
  }
  const normalized = (hash >>> 0) / 4294967296;
  return Math.round(normalized * 55 * 100) / 100; // $0 – $55 already spent
}
