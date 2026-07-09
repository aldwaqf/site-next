// Prisma renvoie les montants en type Decimal (précis pour l'argent),
// mais JSON ne connaît pas ce type : on convertit en number avant d'envoyer.
import type { Prisma } from "@prisma/client";

type WithAmounts = {
  goalAmount: Prisma.Decimal;
  collectedAmount: Prisma.Decimal;
};

export function serializeAmounts<T extends WithAmounts>(entity: T) {
  return {
    ...entity,
    goalAmount: Number(entity.goalAmount),
    collectedAmount: Number(entity.collectedAmount),
  };
}
