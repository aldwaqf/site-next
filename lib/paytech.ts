// Intégration PayTech (agrégateur de paiement sénégalais : Wave, Orange
// Money, Free Money, carte bancaire). Reprend la logique du backend original.
import crypto from "crypto";

const PAYTECH_BASE_URL = "https://paytech.sn/api";

// En dev, PAYTECH_ENV=test : paiements simulés, aucun argent réel ne bouge.
const paytechEnv = process.env.PAYTECH_ENV ?? "test";
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export interface PayTechResponse {
  success: number;
  token?: string;
  redirect_url?: string;
  redirectUrl?: string;
  message?: string;
}

// Nos codes internes → libellés attendus par PayTech
function mapPaymentMethod(method: string): string | undefined {
  const mapping: Record<string, string> = {
    WAVE: "Wave",
    ORANGE_MONEY: "Orange Money",
    FREE_MONEY: "Free Money",
    VISA: "Carte Bancaire",
    MASTERCARD: "Carte Bancaire",
    CARD: "Carte Bancaire",
  };
  return mapping[method];
}

export async function requestPayment(params: {
  itemName: string;
  amount: number;
  refCommand: string;
  commandName: string;
  customField?: Record<string, unknown>;
  paymentMethod?: string;
  successPath?: string;
  cancelPath?: string;
}): Promise<PayTechResponse> {
  // PayTech exige une ipn_url en HTTPS. En dev local (http://localhost),
  // on met une URL factice : PayTech ne peut de toute façon pas joindre
  // ta machine. Le vrai test IPN se fera une fois déployé sur Vercel.
  const ipnBase = appUrl.startsWith("https")
    ? appUrl
    : "https://site-next.vercel.app";

  const body: Record<string, string | number> = {
    item_name: params.itemName,
    item_price: params.amount,
    currency: "XOF",
    ref_command: params.refCommand,
    command_name: params.commandName,
    env: paytechEnv,
    ipn_url: `${ipnBase}/api/payments/ipn`,
    success_url: `${appUrl}${params.successPath ?? "/fr/payment/success"}`,
    cancel_url: `${appUrl}${params.cancelPath ?? "/fr/payment/cancel"}`,
  };

  if (params.customField) {
    body.custom_field = JSON.stringify(params.customField);
  }

  const targetPayment = params.paymentMethod
    ? mapPaymentMethod(params.paymentMethod)
    : undefined;
  if (targetPayment) {
    body.target_payment = targetPayment;
  }

  const response = await fetch(`${PAYTECH_BASE_URL}/payment/request-payment`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      API_KEY: process.env.PAYTECH_API_KEY as string,
      API_SECRET: process.env.PAYTECH_API_SECRET as string,
    },
    body: JSON.stringify(body),
  });

  return (await response.json()) as PayTechResponse;
}

// L'IPN de PayTech envoie le sha256 de nos clés : on les recalcule et on
// compare. Si ça ne correspond pas, la notification ne vient pas de PayTech.
export function verifyIpnSha256(
  receivedKeyHash: string,
  receivedSecretHash: string,
): boolean {
  const expectedKeyHash = crypto
    .createHash("sha256")
    .update(process.env.PAYTECH_API_KEY as string)
    .digest("hex");
  const expectedSecretHash = crypto
    .createHash("sha256")
    .update(process.env.PAYTECH_API_SECRET as string)
    .digest("hex");
  return (
    expectedKeyHash === receivedKeyHash &&
    expectedSecretHash === receivedSecretHash
  );
}
