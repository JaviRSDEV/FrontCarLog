export interface WorkOrderLine {
  id?: number;
  description?: number;
  quantity: number;
  pricePerUnit: number;
  iva: number;
  subTotal?: number;
}
