export interface WorkOrderLine {
  id?: number;
  concept?: string;
  quantity: number;
  pricePerUnit: number;
  iva: number;
  subTotal?: number;
}
