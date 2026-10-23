import { customAlphabet } from "nanoid";

// Uppercase + digits, no ambiguous chars (0/O, 1/I) — easy to read aloud at pickup
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const nanoid = customAlphabet(alphabet, Number(process.env.ORDER_CODE_LENGTH) || 6);

export function generateOrderCode() {
  return `PB${nanoid()}`;
}
