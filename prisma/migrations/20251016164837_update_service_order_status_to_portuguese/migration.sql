-- Convert ServiceOrderStatus enum values from English to Portuguese

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- Create new table with updated enum values
CREATE TABLE "new_service_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_number" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "mechanic_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RECEBIDA',
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
    CONSTRAINT "service_orders_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "service_orders_mechanic_id_fkey" FOREIGN KEY ("mechanic_id") REFERENCES "mechanics" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Copy data with status conversion from English to Portuguese
INSERT INTO "new_service_orders" ("approved_at", "completed_at", "created_at", "customer_id", "delivered_at", "description", "estimated_completion_date", "estimated_time_hours", "id", "mechanic_id", "order_number", "started_at", "status", "total_parts_price", "total_price", "total_service_price", "updated_at", "vehicle_id") 
SELECT 
    "approved_at", 
    "completed_at", 
    "created_at", 
    "customer_id", 
    "delivered_at", 
    "description", 
    "estimated_completion_date", 
    "estimated_time_hours", 
    "id", 
    "mechanic_id", 
    "order_number", 
    "started_at", 
    CASE 
        WHEN "status" = 'RECEIVED' THEN 'RECEBIDA'
        WHEN "status" = 'IN_DIAGNOSIS' THEN 'EM_DIAGNOSTICO' 
        WHEN "status" = 'AWAITING_APPROVAL' THEN 'AGUARDANDO_APROVACAO'
        WHEN "status" = 'IN_EXECUTION' THEN 'EM_EXECUCAO'
        WHEN "status" = 'FINISHED' THEN 'FINALIZADA'
        WHEN "status" = 'DELIVERED' THEN 'ENTREGUE'
        ELSE 'RECEBIDA'
    END as "status",
    "total_parts_price", 
    "total_price", 
    "total_service_price", 
    "updated_at", 
    "vehicle_id" 
FROM "service_orders";

-- Drop old table and rename new one
DROP TABLE "service_orders";
ALTER TABLE "new_service_orders" RENAME TO "service_orders";
CREATE UNIQUE INDEX "service_orders_order_number_key" ON "service_orders"("order_number");

-- Update service_order_status_history table
CREATE TABLE "new_service_order_status_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "service_order_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "changed_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "service_order_status_history_service_order_id_fkey" FOREIGN KEY ("service_order_id") REFERENCES "service_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Copy status history data with conversion
INSERT INTO "new_service_order_status_history" ("id", "service_order_id", "status", "notes", "changed_by", "created_at")
SELECT 
    "id", 
    "service_order_id", 
    CASE 
        WHEN "status" = 'RECEIVED' THEN 'RECEBIDA'
        WHEN "status" = 'IN_DIAGNOSIS' THEN 'EM_DIAGNOSTICO' 
        WHEN "status" = 'AWAITING_APPROVAL' THEN 'AGUARDANDO_APROVACAO'
        WHEN "status" = 'IN_EXECUTION' THEN 'EM_EXECUCAO'
        WHEN "status" = 'FINISHED' THEN 'FINALIZADA'
        WHEN "status" = 'DELIVERED' THEN 'ENTREGUE'
        ELSE 'RECEBIDA'
    END as "status",
    "notes", 
    "changed_by", 
    "created_at"
FROM "service_order_status_history";

DROP TABLE "service_order_status_history";
ALTER TABLE "new_service_order_status_history" RENAME TO "service_order_status_history";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
