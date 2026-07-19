/**
 * OrderTracker — Visual order status stepper
 */
import { Package, CheckCircle, Truck, Home, XCircle, Clock, Box } from 'lucide-react';

const STEPS = [
  { status: 'Order Placed', icon: Package, label: 'Ordered' },
  { status: 'Confirmed', icon: CheckCircle, label: 'Confirmed' },
  { status: 'Seller Processing', icon: Clock, label: 'Processing' },
  { status: 'Packed', icon: Box, label: 'Packed' },
  { status: 'Shipped', icon: Truck, label: 'Shipped' },
  { status: 'Out for Delivery', icon: Truck, label: 'Out for Delivery' },
  { status: 'Delivered', icon: Home, label: 'Delivered' },
];

export default function OrderTracker({ currentStatus, statusHistory = [], estimatedDelivery, trackingNumber, courierPartner }) {
  const isCancelled = ['Cancelled', 'Returned', 'Refunded'].includes(currentStatus);
  const currentIndex = STEPS.findIndex(s => s.status === currentStatus);

  return (
    <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
      {/* Tracking header */}
      {(trackingNumber || courierPartner) && (
        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          {courierPartner && (
            <div>
              <span style={{ color: 'var(--pb-text-secondary)' }}>Courier: </span>
              <span className="font-semibold">{courierPartner}</span>
            </div>
          )}
          {trackingNumber && (
            <div>
              <span style={{ color: 'var(--pb-text-secondary)' }}>Tracking: </span>
              <span className="font-mono font-semibold">{trackingNumber}</span>
            </div>
          )}
          {estimatedDelivery && (
            <div>
              <span style={{ color: 'var(--pb-text-secondary)' }}>ETA: </span>
              <span className="font-semibold">{new Date(estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
            </div>
          )}
        </div>
      )}

      {isCancelled ? (
        <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
          <XCircle className="w-8 h-8 text-red-500" />
          <div>
            <p className="font-bold text-red-500">{currentStatus}</p>
            <p className="text-sm" style={{ color: 'var(--pb-text-secondary)' }}>
              {currentStatus === 'Cancelled' && 'This order has been cancelled.'}
              {currentStatus === 'Returned' && 'This order has been returned.'}
              {currentStatus === 'Refunded' && 'Refund has been processed.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between overflow-x-auto pb-2">
          {STEPS.map((step, i) => {
            const isCompleted = i < currentIndex;
            const isCurrent = i === currentIndex;
            const Icon = step.icon;

            return (
              <div key={step.status} className="flex flex-col items-center flex-1 min-w-[70px] relative">
                {/* Connector line */}
                {i > 0 && (
                  <div className="absolute top-4 -left-1/2 w-full h-0.5 -translate-y-1/2"
                    style={{ backgroundColor: isCompleted || isCurrent ? 'var(--pb-accent)' : 'var(--pb-border)' }} />
                )}

                {/* Step dot */}
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isCurrent ? 'ring-4 ring-opacity-30' : ''}`}
                  style={{
                    backgroundColor: isCompleted ? 'var(--pb-success)' : isCurrent ? 'var(--pb-accent)' : 'var(--pb-border)',
                    color: isCompleted || isCurrent ? '#fff' : 'var(--pb-text-secondary)',
                    ringColor: isCurrent ? 'var(--pb-accent)' : undefined,
                    boxShadow: isCurrent ? '0 0 16px rgba(141,182,0,0.4)' : 'none',
                  }}>
                  <Icon className="w-4 h-4" />
                </div>

                {/* Label */}
                <p className="text-[10px] mt-2 text-center font-medium leading-tight"
                  style={{ color: isCurrent ? 'var(--pb-accent)' : isCompleted ? 'var(--pb-success)' : 'var(--pb-text-secondary)' }}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Status History */}
      {statusHistory.length > 0 && (
        <div className="mt-6 border-t pt-4" style={{ borderColor: 'var(--pb-border)' }}>
          <p className="text-xs font-bold mb-3" style={{ color: 'var(--pb-text-secondary)' }}>TRACKING HISTORY</p>
          <div className="space-y-2">
            {statusHistory.slice().reverse().map((h, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: i === 0 ? 'var(--pb-accent)' : 'var(--pb-border)' }} />
                <div>
                  <span className="font-semibold">{h.status}</span>
                  {h.note && <span className="ml-2" style={{ color: 'var(--pb-text-secondary)' }}>— {h.note}</span>}
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--pb-text-secondary)' }}>
                    {new Date(h.updatedAt).toLocaleString('en-IN')}
                    {h.updatedBy?.name && ` · ${h.updatedBy.name}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
