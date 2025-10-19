-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "service_order_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "subtotal" DECIMAL NOT NULL DEFAULT 0,
    "taxes" DECIMAL NOT NULL DEFAULT 0,
    "discount" DECIMAL NOT NULL DEFAULT 0,
    "total" DECIMAL NOT NULL DEFAULT 0,
    "valid_until" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sent_at" DATETIME,
    "approved_at" DATETIME,
    "rejected_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "budgets_service_order_id_fkey" FOREIGN KEY ("service_order_id") REFERENCES "service_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "budgets_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "budget_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "budget_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "service_id" TEXT,
    "part_id" TEXT,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL NOT NULL,
    "total" DECIMAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "budget_items_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "budgets" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "budget_items_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "budget_items_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "parts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "budgets_service_order_id_key" ON "budgets"("service_order_id");
