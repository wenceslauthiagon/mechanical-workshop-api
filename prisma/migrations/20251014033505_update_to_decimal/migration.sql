/*
  Warnings:

  - You are about to alter the column `price` on the `parts` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to alter the column `price` on the `service_order_items` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to alter the column `total_price` on the `service_order_items` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to alter the column `price` on the `service_order_parts` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to alter the column `total_price` on the `service_order_parts` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to alter the column `estimated_time_hours` on the `service_orders` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to alter the column `total_parts_price` on the `service_orders` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to alter the column `total_price` on the `service_orders` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to alter the column `total_service_price` on the `service_orders` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to alter the column `price` on the `services` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_parts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "part_number" TEXT,
    "price" DECIMAL NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "min_stock" INTEGER NOT NULL DEFAULT 0,
    "supplier" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_parts" ("created_at", "description", "id", "is_active", "min_stock", "name", "part_number", "price", "stock", "supplier", "updated_at") SELECT "created_at", "description", "id", "is_active", "min_stock", "name", "part_number", "price", "stock", "supplier", "updated_at" FROM "parts";
DROP TABLE "parts";
ALTER TABLE "new_parts" RENAME TO "parts";
CREATE UNIQUE INDEX "parts_part_number_key" ON "parts"("part_number");
CREATE TABLE "new_service_order_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "service_order_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DECIMAL NOT NULL,
    "total_price" DECIMAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "service_order_items_service_order_id_fkey" FOREIGN KEY ("service_order_id") REFERENCES "service_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "service_order_items_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_service_order_items" ("created_at", "id", "price", "quantity", "service_id", "service_order_id", "total_price") SELECT "created_at", "id", "price", "quantity", "service_id", "service_order_id", "total_price" FROM "service_order_items";
DROP TABLE "service_order_items";
ALTER TABLE "new_service_order_items" RENAME TO "service_order_items";
CREATE TABLE "new_service_order_parts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "service_order_id" TEXT NOT NULL,
    "part_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL NOT NULL,
    "total_price" DECIMAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "service_order_parts_service_order_id_fkey" FOREIGN KEY ("service_order_id") REFERENCES "service_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "service_order_parts_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "parts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_service_order_parts" ("created_at", "id", "part_id", "price", "quantity", "service_order_id", "total_price") SELECT "created_at", "id", "part_id", "price", "quantity", "service_order_id", "total_price" FROM "service_order_parts";
DROP TABLE "service_order_parts";
ALTER TABLE "new_service_order_parts" RENAME TO "service_order_parts";
CREATE TABLE "new_service_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_number" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "description" TEXT NOT NULL,
    "total_service_price" DECIMAL NOT NULL DEFAULT 0,
    "total_parts_price" DECIMAL NOT NULL DEFAULT 0,
    "total_price" DECIMAL NOT NULL DEFAULT 0,
    "estimated_time_hours" DECIMAL NOT NULL DEFAULT 0,
    "estimated_completion_date" DATETIME NOT NULL,
    "started_at" DATETIME,
    "completed_at" DATETIME,
    "delivered_at" DATETIME,
    "approved_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "service_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "service_orders_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_service_orders" ("approved_at", "completed_at", "created_at", "customer_id", "delivered_at", "description", "estimated_completion_date", "estimated_time_hours", "id", "order_number", "started_at", "status", "total_parts_price", "total_price", "total_service_price", "updated_at", "vehicle_id") SELECT "approved_at", "completed_at", "created_at", "customer_id", "delivered_at", "description", "estimated_completion_date", "estimated_time_hours", "id", "order_number", "started_at", "status", "total_parts_price", "total_price", "total_service_price", "updated_at", "vehicle_id" FROM "service_orders";
DROP TABLE "service_orders";
ALTER TABLE "new_service_orders" RENAME TO "service_orders";
CREATE UNIQUE INDEX "service_orders_order_number_key" ON "service_orders"("order_number");
CREATE TABLE "new_services" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL NOT NULL,
    "estimated_minutes" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_services" ("category", "created_at", "description", "estimated_minutes", "id", "is_active", "name", "price", "updated_at") SELECT "category", "created_at", "description", "estimated_minutes", "id", "is_active", "name", "price", "updated_at" FROM "services";
DROP TABLE "services";
ALTER TABLE "new_services" RENAME TO "services";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
