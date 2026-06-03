import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const prisma = new PrismaClient({
 adapter: new PrismaPg({ connectionString }),
});

async function main() {
 console.log("Seeding database...");

 // Clean up
 await prisma.quotationItem.deleteMany();
 await prisma.quotation.deleteMany();
 await prisma.productUnit.deleteMany();
 await prisma.product.deleteMany();
 await prisma.user.deleteMany();

 // ─── Users ──────────────────────────────────────────────────────────────────
 const adminPass = await bcrypt.hash("admin123", 12);
 const sellerPass = await bcrypt.hash("seller123", 12);

 const admin = await prisma.user.create({
 data: {
 name: "Admin User",
 email: "admin@aasamedchem.com",
 password: adminPass,
 role: "ADMIN",
 },
 });

 const seller = await prisma.user.create({
 data: {
 name: "Ravi Kumar",
 email: "seller@aasamedchem.com",
 password: sellerPass,
 role: "SELLER",
 },
 });

 console.log(`Created admin: ${admin.email}`);
 console.log(`Created seller: ${seller.email}`);

 // ─── Weight Products (stored in grams) ─────────────────────────────────────
 const paracetamol = await prisma.product.create({
 data: {
 name: "Paracetamol BP Grade",
 description: "Pharmaceutical grade paracetamol powder, BP specification",
 category: "Bulk Chemical",
 sku: "CHEM-PARA-001",
 dimension: "WEIGHT",
 baseUnitAmount: "1",
 pricePerBaseUnit: "0.0850", // ₹0.0850 per gram
 stockQuantity: "50000",
 reorderThreshold: "5000",
 units: {
 create: [
 { unit: "g", label: "Grams (g)", amountInBase: "1" },
 { unit: "kg", label: "Kilograms (kg)", amountInBase: "1000" },
 ],
 },
 },
 });

 const metformin = await prisma.product.create({
 data: {
 name: "Metformin HCl",
 description: "Metformin hydrochloride API grade",
 category: "Active Pharmaceutical Ingredient",
 sku: "API-MET-002",
 dimension: "WEIGHT",
 baseUnitAmount: "1",
 pricePerBaseUnit: "0.2200", // ₹0.22 per gram
 stockQuantity: "25000",
 reorderThreshold: "2000",
 units: {
 create: [
 { unit: "g", label: "Grams (g)", amountInBase: "1" },
 { unit: "kg", label: "Kilograms (kg)", amountInBase: "1000" },
 ],
 },
 },
 });

 const vitaminC = await prisma.product.create({
 data: {
 name: "Ascorbic Acid (Vitamin C)",
 description: "Food and pharma grade ascorbic acid powder",
 category: "Vitamin Supplement",
 sku: "VIT-ASC-003",
 dimension: "WEIGHT",
 baseUnitAmount: "1",
 pricePerBaseUnit: "0.0450",
 stockQuantity: "100000",
 reorderThreshold: "10000",
 units: {
 create: [
 { unit: "g", label: "Grams (g)", amountInBase: "1" },
 { unit: "kg", label: "Kilograms (kg)", amountInBase: "1000" },
 ],
 },
 },
 });

 // ─── Volume Products (stored in mL) ────────────────────────────────────────
 const ethanol = await prisma.product.create({
 data: {
 name: "Ethanol 99.9%",
 description: "Analytical grade ethanol for laboratory use",
 category: "Solvent",
 sku: "SOL-ETH-001",
 dimension: "VOLUME",
 baseUnitAmount: "1",
 pricePerBaseUnit: "0.0032", // ₹0.0032 per mL
 stockQuantity: "200000",
 reorderThreshold: "20000",
 units: {
 create: [
 { unit: "mL", label: "Millilitres (mL)", amountInBase: "1" },
 { unit: "L", label: "Litres (L)", amountInBase: "1000" },
 ],
 },
 },
 });

 const glycerol = await prisma.product.create({
 data: {
 name: "Glycerol USP",
 description: "Pharmaceutical grade glycerol",
 category: "Solvent",
 sku: "SOL-GLY-002",
 dimension: "VOLUME",
 baseUnitAmount: "1",
 pricePerBaseUnit: "0.0055",
 stockQuantity: "80000",
 reorderThreshold: "10000",
 units: {
 create: [
 { unit: "mL", label: "Millilitres (mL)", amountInBase: "1" },
 { unit: "L", label: "Litres (L)", amountInBase: "1000" },
 ],
 },
 },
 });

 // ─── Count Products ─────────────────────────────────────────────────────────
 const capsules = await prisma.product.create({
 data: {
 name: "Empty Hard Gelatin Capsules #0",
 description: "Size 0 empty hard gelatin capsules, clear",
 category: "Packaging Material",
 sku: "CAP-HGC-000",
 dimension: "COUNT",
 baseUnitAmount: "1",
 pricePerBaseUnit: "0.85", // ₹0.85 per capsule
 stockQuantity: "100000",
 reorderThreshold: "10000",
 units: {
 create: [
 { unit: "unit", label: "Unit / Item", amountInBase: "1" },
 ],
 },
 },
 });

 console.log("\nProducts created:");
 console.log(` Weight: ${paracetamol.name} — ₹${paracetamol.pricePerBaseUnit}/g`);
 console.log(` Weight: ${metformin.name} — ₹${metformin.pricePerBaseUnit}/g`);
 console.log(` Weight: ${vitaminC.name} — ₹${vitaminC.pricePerBaseUnit}/g`);
 console.log(` Volume: ${ethanol.name} — ₹${ethanol.pricePerBaseUnit}/mL`);
 console.log(` Volume: ${glycerol.name} — ₹${glycerol.pricePerBaseUnit}/mL`);
 console.log(` Count: ${capsules.name} — ₹${capsules.pricePerBaseUnit}/unit`);

 console.log("\n✅ Seed complete!");
 console.log("\nTest credentials:");
 console.log(" Admin: admin@aasamedchem.com / admin123");
 console.log(" Seller: seller@aasamedchem.com / seller123");
}

main()
 .catch(console.error)
 .finally(() => prisma.$disconnect());