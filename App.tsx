import React, { useState, useCallback, useEffect } from 'react';
import { Order } from './types';
import OrderCard from './components/OrderCard';
import { fetchOrders, ConfigurationError } from './services/sheetService';
import { ChartBarIcon, CheckIcon, CrossIcon, LoadingSpinner } from './components/icons';
import SetupGuide from './components/SetupGuide';
import Reports from './components/Reports';

const App: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfigError, setIsConfigError] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showReports, setShowReports] = useState(false);

  const loadInitialOrders = useCallback(async () => {
    try {
        setError(null);
        setIsConfigError(false);
        setIsLoading(true);
        const fetchedOrders = await fetchOrders();
        setOrders(fetchedOrders);
    } catch (err: any) {
        if (err instanceof ConfigurationError) {
            setIsConfigError(true);
        } else {
             console.error("Error loading orders:", err);
            setError(err.message || "Failed to load orders. Please check your config.ts and script deployment.");
        }
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialOrders();
  }, [loadInitialOrders]);

  const handleToggleDelivered = useCallback((id: string) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === id ? { ...order, isDelivered: !order.isDelivered } : order
      )
    );
  }, []);

  const handleTogglePaid = useCallback((id:string) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === id ? { ...order, isPaid: !order.isPaid } : order
      )
    );
  }, []);
  
  const handleSelectOrder = useCallback((id: string) => {
    setSelectedOrderIds(prevSelected =>
      prevSelected.includes(id)
        ? prevSelected.filter(selectedId => selectedId !== id)
        : [...prevSelected, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedOrderIds.length === orders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(orders.map(order => order.id));
    }
  }, [orders, selectedOrderIds.length]);
  
  const handleBulkUpdate = (updateFn: (order: Order) => Order) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        selectedOrderIds.includes(order.id) ? updateFn(order) : order
      )
    );
    setSelectedOrderIds([]);
  };

  const handleBulkMarkDelivered = () => handleBulkUpdate(order => ({ ...order, isDelivered: true }));
  const handleBulkMarkPaid = () => handleBulkUpdate(order => ({ ...order, isPaid: true }));
  
  if (isConfigError) {
      return <SetupGuide />;
  }
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        setCopiedText(text);
        setTimeout(() => setCopiedText(null), 2000);
    });
  };

  const renderErrorState = () => {
    if (!error) return null;

    const availableSheetsMatch = error.match(/Available sheets are: (\[.*\])/);
    let availableSheets: string[] | null = null;
    if (availableSheetsMatch && availableSheetsMatch[1]) {
        try {
            availableSheets = JSON.parse(availableSheetsMatch[1]);
        } catch (e) {
            console.error("Could not parse available sheets from error message", e);
        }
    }

    let troubleshootingSteps = (
        <div className="text-left max-w-2xl mx-auto mt-6 bg-slate-800 p-6 rounded-lg border border-slate-700">
            <p className="font-bold text-xl text-amber-300 mb-4">Configuration Helper</p>
            <p className="text-slate-400 mb-4">This error means your script can't find the correct tab in your Google Sheet. Let's fix it!</p>

            {availableSheets && (
                 <div className="mb-6 bg-slate-900/50 p-4 rounded-md border border-cyan-500/30">
                    <h3 className="font-semibold text-cyan-400 text-lg mb-2">We found these tabs in your sheet:</h3>
                    <p className="text-slate-400 mb-3">Click the correct name below to copy it. Then paste it into the <code className="bg-slate-700 text-amber-400 rounded px-1.5 py-0.5 text-sm">SHEET_NAME</code> variable in your script.</p>
                    <div className="flex flex-wrap gap-2">
                        {availableSheets.map(name => (
                            <button 
                                key={name}
                                onClick={() => handleCopy(name)}
                                className="bg-slate-700 hover:bg-slate-600 text-amber-400 font-mono text-sm py-1 px-3 rounded-md transition-colors duration-200"
                            >
                                {copiedText === name ? 'Copied!' : name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
           
            <div className="space-y-6">
              <div>
                <span className="flex items-center justify-center w-8 h-8 bg-cyan-500 text-slate-900 font-bold rounded-full text-lg mb-2">1</span>
                <h3 className="font-semibold text-slate-200 ml-2">Update Sheet Name in Script</h3>
                <p className="text-slate-400 ml-2">Open the <code className="bg-slate-700 text-amber-400 rounded px-1.5 py-0.5 text-sm">google-apps-script.js</code> file. Find the <code className="bg-slate-700 text-amber-400 rounded px-1.5 py-0.5 text-sm">SHEET_NAME</code> variable. Its value must be an <span className="font-bold text-white">EXACT, case-sensitive</span> match to one of the tabs in your sheet.</p>
              </div>
               <div>
                <span className="flex items-center justify-center w-8 h-8 bg-red-500 text-white font-bold rounded-full text-lg mb-2">2</span>
                <h3 className="font-semibold text-slate-200 ml-2">CRITICAL STEP: Re-Deploy Your Script</h3>
                 <p className="text-slate-400 ml-2">After saving any change in the script editor, the change is <span className="font-bold text-red-400">NOT live</span> until you publish it. This is the most common reason for errors.</p>
                  <div className="ml-2 mt-3 bg-slate-700/50 border border-slate-600 rounded-lg p-3">
                      <p className="font-semibold text-white">Deployment Steps:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1 space-y-1">
                          <li>In the script editor, click <span className="font-semibold text-white">Deploy &gt; Manage deployments</span>.</li>
                          <li>Find your active deployment and click the edit icon (✏️).</li>
                          <li>From the "Version" dropdown, select <span className="font-semibold text-white">New version</span>.</li>
                          <li>Click the <span className="font-semibold text-white">Deploy</span> button.</li>
                      </ul>
                  </div>
              </div>
            </div>
        </div>
    );

    return (
        <div className="text-center py-10 bg-red-900/20 border border-red-500 rounded-lg">
            <p className="text-red-400 text-xl font-semibold">An Error Occurred</p>
            <p className="text-slate-400 mt-2 max-w-3xl mx-auto px-4">{error}</p>
            {troubleshootingSteps}
        </div>
    );
  };


  const undeliveredCount = orders.filter(o => !o.isDelivered).length;
  const totalOrders = orders.length;
  const isAllSelected = totalOrders > 0 && selectedOrderIds.length === totalOrders;

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md shadow-md p-4">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 self-start sm:self-center">
            {orders.length > 0 && (
              <div className="flex items-center gap-2 pr-4 border-r border-slate-700">
                <input
                  type="checkbox"
                  id="select-all"
                  className="h-5 w-5 rounded bg-slate-700 border-slate-500 text-cyan-500 focus:ring-cyan-600 cursor-pointer accent-cyan-500"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  aria-label="Select all orders"
                />
                <label htmlFor="select-all" className="text-slate-300 cursor-pointer select-none">All</label>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-cyan-400">Mane Rotti Delivery</h1>
              <p className="text-slate-400">Today's Orders ({undeliveredCount} pending of {totalOrders})</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => setShowReports(prev => !prev)}
              disabled={orders.length === 0}
              className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700/50 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
            >
              <ChartBarIcon className="w-5 h-5"/>
              <span>{showReports ? 'Hide' : 'Show'} Reports</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 pb-28">
        {showReports && orders.length > 0 && <Reports orders={orders} />}

        <section>
          {isLoading ? (
             <div className="text-center py-16 flex flex-col items-center gap-4">
                <LoadingSpinner className="w-10 h-10 text-cyan-400"/>
                <p className="text-slate-400 text-lg">Fetching live orders from your Google Sheet...</p>
            </div>
          ) : error ? (
            renderErrorState()
          ) : orders.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {orders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isSelected={selectedOrderIds.includes(order.id)}
                  onSelect={handleSelectOrder}
                  onToggleDelivered={handleToggleDelivered}
                  onTogglePaid={handleTogglePaid}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
                <p className="text-slate-400 text-lg">Your sheet is empty!</p>
                <p className="text-slate-500">Add some orders to the Google Sheet and they will appear here automatically on page load.</p>
            </div>
          )}
        </section>
      </main>

      {selectedOrderIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-sm border-t border-cyan-500/30 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] z-20">
          <div className="container mx-auto p-3 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="font-semibold text-slate-300">
              <span className="bg-cyan-500 text-slate-900 rounded-full px-2.5 py-0.5 mr-2">{selectedOrderIds.length}</span>
              selected
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleBulkMarkDelivered}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                <CheckIcon className="w-5 h-5"/>
                <span>Mark Delivered</span>
              </button>
              <button
                onClick={handleBulkMarkPaid}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                <CheckIcon className="w-5 h-5"/>
                <span>Mark Paid</span>
              </button>
              <button
                onClick={() => setSelectedOrderIds([])}
                className="flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-500 text-slate-200 font-semibold py-2 px-3 rounded-lg transition-colors duration-200"
                title="Clear Selection"
              >
                <CrossIcon className="w-5 h-5"/>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;