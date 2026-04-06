export interface WorkOrderLine {
  id: number;
  concept?: string;
  quantity: number;
  pricePerUnit: number;
  IVA: number;
  discount: number;
  subTotal?: number;
}
