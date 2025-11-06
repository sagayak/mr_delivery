import { Order } from './types';

const rawData = [
  { Timestamp: '2/11/2025, 11:06:33 PM', Address: 'Tower 17, Floor 12, Flat 001', Items: 'Mealbox (x1)', 'Total Amount': 85, Status: '' },
  { Timestamp: '3/11/2025, 9:13:31 AM', Address: 'Tower 18, Floor 5, Flat 003', Items: 'Mealbox Plus (x1)', 'Total Amount': 110, Status: '' },
  { Timestamp: '3/11/2025, 9:15:57 AM', Address: 'Tower 11, Floor 10, Flat 005', Items: 'Mealbox (x3)', 'Total Amount': 255, Status: '' },
  { Timestamp: '3/11/2025, 9:42:17 AM', Address: 'Tower 11, Floor 2, Flat 002', Items: 'Mealbox (x1), Roti (x2)', 'Total Amount': 105, Status: '' },
  { Timestamp: '3/11/2025, 10:05:00 AM', Address: 'Tower 17, Floor 8, Flat 004', Items: 'Mealbox (x2), Curry (x1)', 'Total Amount': 220, Status: '' },
  { Timestamp: '3/11/2025, 10:15:23 AM', Address: 'Tower 18, Floor 15, Flat 001', Items: 'Mealbox Plus (x2)', 'Total Amount': 220, Status: '' },
];

const parseAddress = (address: string) => {
  const towerMatch = address.match(/Tower (\d+)/);
  const floorMatch = address.match(/Floor (\d+)/);
  const flatMatch = address.match(/Flat (\d+)/);

  const tower = towerMatch ? towerMatch[1] : 'N/A';
  const floor = floorMatch ? floorMatch[1] : 'N/A';
  const flat = flatMatch ? flatMatch[1] : 'N/A';

  return { tower, floor, flat };
};

export const getInitialOrders = (): Order[] => rawData.map((row, index) => {
    const { tower, floor, flat } = parseAddress(row.Address);
    return {
        id: `${tower}-${floor}-${flat}-${index}`,
        timestamp: row.Timestamp,
        address: row.Address,
        items: row.Items,
        totalAmount: row['Total Amount'],
        status: row.Status,
        isDelivered: false,
        isPaid: false,
        tower,
        floor,
        flat,
    };
});