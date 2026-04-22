export interface WorkOrderLine {
  id: number;
  concept?: string;
  quantity: number;
  pricePerUnit: number;
  IVA: number;
  discount: number;
  subTotal?: number;
}

export interface CreateWorkOrderLineDto {
  concept: string;
  quantity: number;
  pricePerUnit: number;
  IVA: number;
  discount: number;
}
