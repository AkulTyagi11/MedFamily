import Card from '@/components/ui/Card';
import OrderStatusStepper from '@/components/orders/OrderStatusStepper';
import type { OrderStatus, OrderStatusHistory } from '@/lib/types';

interface OrderTrackerProps {
  status: OrderStatus;
  history?: OrderStatusHistory[];
}

export default function OrderTracker({ status, history }: OrderTrackerProps) {
  return (
    <Card title="Order tracker" eyebrow="Fulfilment timeline" className="rounded-2xl">
      <OrderStatusStepper currentStatus={status} history={history} />
    </Card>
  );
}
