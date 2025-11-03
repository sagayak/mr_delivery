
export interface Order {
  id: string;
  timestamp: string;
  address: string;
  items: string;
  totalAmount: number;
  status: string;
  isDelivered: boolean;
  isPaid: boolean;
  tower: string;
  floor: string;
  flat: string;
}
