import React from 'react';
import { Order } from '../types';
import { CheckIcon, CrossIcon } from './icons';

interface OrderCardProps {
  order: Order;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onToggleDelivered: (id: string) => void;
  onTogglePaid: (id: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, isSelected, onSelect, onToggleDelivered, onTogglePaid }) => {
  const hasFloor = order.floor && !isNaN(parseInt(order.floor, 10));

  const floorPart = hasFloor ? order.floor.padStart(2, '0') : '';
  const cardId = `${order.tower}-${floorPart}${order.flat}`;

  const displayAddress = hasFloor
    ? `Tower ${order.tower}, Floor ${order.floor}, Flat ${order.flat}`
    : `Tower ${order.tower}, Flat ${order.flat}`;


  // Prevent the card's main onClick from firing when an action button is clicked.
  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div
      onClick={() => onSelect(order.id)}
      className={`bg-slate-800 rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer
                  ${isSelected ? 'ring-2 ring-cyan-400' : 'ring-2 ring-transparent'}`}
    >
      <div className="bg-slate-700 p-3 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-cyan-400 tracking-wider">
            {cardId}
          </h3>
          <p className="text-xs text-slate-400">{displayAddress}</p>
        </div>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation(); // Prevent the main div's onClick
            onSelect(order.id);
          }}
          className="h-5 w-5 rounded bg-slate-600 border-slate-500 text-cyan-500 focus:ring-cyan-600 cursor-pointer accent-cyan-500"
        />
      </div>
      <div className="p-4 space-y-3 flex-grow">
        <div>
          <p className="text-sm font-semibold text-slate-300">Items</p>
          <p className="text-lg text-white">{order.items}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-300">Total Amount</p>
          <p className="text-lg font-mono text-amber-400">₹{order.totalAmount}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-px bg-slate-700">
        <button
          onClick={(e) => handleButtonClick(e, () => onToggleDelivered(order.id))}
          className={`flex items-center justify-center space-x-2 p-3 font-semibold transition-colors duration-200 ${
            order.isDelivered
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-slate-600 hover:bg-slate-500 text-slate-300'
          }`}
        >
          {order.isDelivered ? <CheckIcon className="w-5 h-5" /> : <CrossIcon className="w-5 h-5" />}
          <span>Delivered</span>
        </button>
        <button
          onClick={(e) => handleButtonClick(e, () => onTogglePaid(order.id))}
          className={`flex items-center justify-center space-x-2 p-3 font-semibold transition-colors duration-200 ${
            order.isPaid
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-slate-600 hover:bg-slate-500 text-slate-300'
          }`}
        >
          {order.isPaid ? <CheckIcon className="w-5 h-5" /> : <CrossIcon className="w-5 h-5" />}
          <span>Paid</span>
        </button>
      </div>
    </div>
  );
};

export default OrderCard;