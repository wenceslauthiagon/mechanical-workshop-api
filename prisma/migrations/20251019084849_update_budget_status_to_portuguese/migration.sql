-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_budgets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "service_order_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "subtotal" DECIMAL NOT NULL DEFAULT 0,
    "taxes" DECIMAL NOT NULL DEFAULT 0,
    "discount" DECIMAL NOT NULL DEFAULT 0,
    "total" DECIMAL NOT NULL DEFAULT 0,
    "valid_until" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RASCUNHO',
    "sent_at" DATETIME,
    "approved_at" DATETIME,
    "rejected_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "budgets_service_order_id_fkey" FOREIGN KEY ("service_order_id") REFERENCES "service_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "budgets_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_budgets" ("approved_at", "created_at", "customer_id", "discount", "id", "rejected_at", "sent_at", "service_order_id", "status", "subtotal", "taxes", "total", "updated_at", "valid_until") SELECT "approved_at", "created_at", "customer_id", "discount", "id", "rejected_at", "sent_at", "service_order_id", "status", "subtotal", "taxes", "total", "updated_at", "valid_until" FROM "budgets";
DROP TABLE "budgets";
ALTER TABLE "new_budgets" RENAME TO "budgets";
CREATE UNIQUE INDEX "budgets_service_order_id_key" ON "budgets"("service_order_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
