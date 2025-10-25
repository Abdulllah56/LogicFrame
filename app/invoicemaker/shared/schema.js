import { z } from "zod";

// Schema for service/line items
const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.string().transform((val) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  }),
  rate: z.string().transform((val) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  }),
  amount: z.string().transform((val) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  }),
});

// Main invoice form schema
export const invoiceFormSchema = z.object({
  invoiceNumber: z.string().optional(),
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("Invalid email format"),
  projectName: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  dueDate: z.union([
    z.date(),
    z.string().transform((val) => new Date(val))
  ]).refine((val) => !isNaN(val.getTime()), {
    message: "Invalid date format",
  }),
  status: z.enum(["pending", "paid", "overdue"]).default("pending"),
  subtotal: z.string().transform((val) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  }),
  taxRate: z.string().transform((val) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  }),
  taxAmount: z.string().transform((val) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  }),
  total: z.string().transform((val) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  }),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
});