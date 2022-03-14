/*
  Warnings:

  - A unique constraint covering the columns `[cart_id,product_id]` on the table `cart_items` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cart_id_product_id_key" ON "cart_items"("cart_id", "product_id");

-- manager

INSERT INTO "users"("uuid", "first_name", "last_name", "user_name", "address", "email", "password", "role", "is_active","verified_at", "updated_at", "created_at" ) VALUES
('57be8001-27a5-409d-bc4f-ff5630ee88bb', 'Coren','Ancco', 'chesha1', '12 de octubre', 'manager@gmail.com', '$2a$10$KDHEOJPKSutumha6Cf8IqO3HtpvsofApQ.eKj1rB5p0mGOiBFskWa', 'M', false, NOW(), NOW(),NOW());
 
 -- client
 
 INSERT INTO "users"("uuid", "first_name", "last_name", "user_name", "address", "email", "password", "role", "is_active","verified_at", "updated_at", "created_at" ) VALUES
('57be8001-27a5-409d-bc4f-ff5630ee88b2', 'Other','Other', 'client', '12 de octubre', 'client@gmail.com', '$2a$10$KDHEOJPKSutumha6Cf8IqO3HtpvsofApQ.eKj1rB5p0mGOiBFskWa', 'C', false, NOW(), NOW(),NOW());

-- categories

INSERT INTO "categories"("uuid", "name", "created_at", "updated_at") VALUES 
('3e78af91-136d-467c-b31a-eace11bf7219', 'candy', NOW(), NOW()),
('3e78af91-136d-467c-b31a-eace11bf7220', 'chocolate', NOW(), NOW()),
('3e78af91-136d-467c-b31a-eace11bf7221', 'snack', NOW(), NOW())