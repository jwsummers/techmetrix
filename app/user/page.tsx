'use client';
import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MetricsDashboard from '../components/MetricsDashboard';

// Define interfaces for API responses and repair orders
interface MakeResult {
  MakeName: string;
}

interface ModelResult {
  Model_Name: string;
}

interface RepairOrderType {
  id: string;
  year: string;
  make: string;
  model: string;
  roNumber: string;
  labor: number;
  createdAt: string;
}

export default function UserDashboard() {
  // New repair order form state
  const [formData, setFormData] = useState({
    vin: '',
    year: '',
    make: '',
    model: '',
    roNumber: '',
    labor: '0',
  });
  const [laborTotal, setLaborTotal] = useState(0);

  // Lookup state for vehicle info
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [yearError, setYearError] = useState('');

  // Labor calculator modal state for new order
  const [modalOpen, setModalOpen] = useState(false);
  const [laborInput, setLaborInput] = useState('');

  // State for fetched repair orders
  const [orders, setOrders] = useState<RepairOrderType[]>([]);
  // Toggle showing older orders
  const [showOlder, setShowOlder] = useState(false);

  // State for Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<RepairOrderType | null>(
    null
  );
  const [editFormData, setEditFormData] = useState({
    year: '',
    make: '',
    model: '',
    roNumber: '',
    labor: '',
  });

  // ---------- New Order Form Functions ----------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // VIN lookup: auto-populate year, make, model if available
  const handleVinBlur = async () => {
    if (!formData.vin) return;
    try {
      const res = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${formData.vin}?format=json`
      );
      const data = await res.json();
      if (data.Results && data.Results[0]) {
        const result = data.Results[0];
        setFormData((prev) => ({
          ...prev,
          year: result.ModelYear || prev.year,
          make: result.Make || prev.make,
          model: result.Model || prev.model,
        }));
      }
    } catch (error) {
      console.error('Error decoding VIN:', error);
    }
  };

  // Validate year and fetch makes
  const handleYearBlur = async () => {
    if (!formData.year) return;
    const yearNumber = parseInt(formData.year, 10);
    const currentYear = new Date().getFullYear();
    if (yearNumber < 1900 || yearNumber > currentYear + 1) {
      setYearError('Please enter a valid vehicle model year.');
      setMakes([]);
      return;
    } else {
      setYearError('');
    }
    setLoadingMakes(true);
    try {
      const res = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleModelYear/${formData.year}?format=json`
      );
      const data = await res.json();
      console.log('Data from makes API:', data);
      if (data.Results && Array.isArray(data.Results)) {
        const makeNames = data.Results.map((item: MakeResult) => item.MakeName);
        console.log('Fetched makes:', makeNames);
        setMakes(makeNames);
      } else {
        setMakes([]);
      }
    } catch (error) {
      console.error('Error fetching makes:', error);
      setMakes([]);
    }
    setLoadingMakes(false);
  };

  // Fetch models based on selected make
  const handleMakeBlur = async () => {
    if (!formData.make) return;
    setLoadingModels(true);
    try {
      const res = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${formData.make}?format=json`
      );
      const data = await res.json();
      if (data.Results && Array.isArray(data.Results)) {
        const modelNames = data.Results.map(
          (item: ModelResult) => item.Model_Name
        );
        setModels(modelNames);
      } else {
        setModels([]);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      setModels([]);
    }
    setLoadingModels(false);
  };

  // Labor calculator modal functions for new order
  const openLaborModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setModalOpen(true);
  };
  const closeLaborModal = () => {
    setModalOpen(false);
  };
  const addLaborLine = () => {
    const addedLabor = parseFloat(laborInput) || 0;
    const newTotal = laborTotal + addedLabor;
    setLaborTotal(newTotal);
    setFormData((prev) => ({ ...prev, labor: newTotal.toFixed(1) }));
    setLaborInput('');
  };

  // Handle new repair order form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const repairOrder = {
      year: formData.year,
      make: formData.make,
      model: formData.model,
      roNumber: formData.roNumber,
      labor: parseFloat(formData.labor),
    };
    try {
      const res = await fetch('/api/repair-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(repairOrder),
      });
      if (!res.ok) {
        throw new Error('Failed to save repair order');
      }
      const data = await res.json();
      console.log('Repair order saved:', data);
      // Reset new order form and lookup states
      setFormData({
        vin: '',
        year: '',
        make: '',
        model: '',
        roNumber: '',
        labor: '0',
      });
      setLaborTotal(0);
      setMakes([]);
      setModels([]);
      fetchOrders();
    } catch (error) {
      console.error('Error saving repair order:', error);
    }
  };

  // ---------- Fetching and Displaying Orders ----------
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/repair-orders');
      if (!res.ok) {
        throw new Error('Failed to fetch repair orders');
      }
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Delete a repair order
  const deleteOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/repair-orders/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete repair order');
      }
      fetchOrders();
    } catch (error) {
      console.error(error);
    }
  };

  // ---------- Edit Modal Functions ----------
  const openEditModal = (order: RepairOrderType) => {
    setEditingOrder(order);
    setEditFormData({
      year: order.year,
      make: order.make,
      model: order.model,
      roNumber: order.roNumber,
      labor: order.labor.toString(),
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingOrder(null);
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingOrder) return;
    try {
      const updatedOrder = {
        year: editFormData.year,
        make: editFormData.make,
        model: editFormData.model,
        roNumber: editFormData.roNumber,
        labor: parseFloat(editFormData.labor),
      };
      const res = await fetch(`/api/repair-orders/${editingOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOrder),
      });
      if (!res.ok) {
        throw new Error('Failed to update repair order');
      }
      fetchOrders();
      closeEditModal();
    } catch (error) {
      console.error(error);
    }
  };

  // ---------- Filter Orders for Display ----------
  const todayStr = new Date().toISOString().split('T')[0];
  const filteredOrders = showOlder
    ? [...orders].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
    : [...orders]
        .filter((order) => order.createdAt.split('T')[0] === todayStr)
        .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-black to-gray-900 text-primaryText p-6 relative'>
      {/* Subtle Background Effect */}
      <div className='absolute inset-0 bg-noise opacity-20 pointer-events-none'></div>

      <NavBar />

      {/* Responsive Grid Layout */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto'>
        {/* Metrics Dashboard */}
        <div className='flex justify-center'>
          <div className='bg-black/30 backdrop-blur-md p-6 rounded-2xl shadow-lg w-full max-w-lg'>
            <MetricsDashboard
              orders={orders}
              dailyTarget={8}
              weeklyTarget={40}
            />
          </div>
        </div>

        {/* New Repair Order Form */}
        <div className='bg-black/30 backdrop-blur-md p-6 rounded-2xl shadow-lg w-full max-w-lg'>
          <p className='mb-6 text-secondaryText'>Add a new Repair Order:</p>
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* VIN Field (optional) */}
            <div>
              <label htmlFor='vin' className='block mb-1'>
                Vehicle VIN (optional):
              </label>
              <input
                type='text'
                name='vin'
                id='vin'
                placeholder='Enter VIN to auto-fill details'
                value={formData.vin}
                onChange={handleChange}
                onBlur={handleVinBlur}
                className='w-full p-2 rounded border border-secondaryText bg-black/40 text-primaryText placeholder-gray-400 focus:ring-2 focus:ring-accent transition'
              />
            </div>

            {/* Vehicle Year */}
            <div>
              <label htmlFor='year' className='block mb-1'>
                Vehicle Year:
              </label>
              <input
                type='number'
                name='year'
                id='year'
                placeholder='YYYY'
                value={formData.year}
                onChange={handleChange}
                onBlur={handleYearBlur}
                required
                className='w-full p-2 rounded border border-secondaryText bg-black/40 text-primaryText placeholder-gray-400 focus:ring-2 focus:ring-accent transition'
              />
              {yearError && (
                <p className='text-xs text-pinkAccent mt-1'>{yearError}</p>
              )}
              {loadingMakes && (
                <p className='text-xs text-secondaryText mt-1'>
                  Loading makes...
                </p>
              )}
            </div>

            {/* Vehicle Make */}
            <div>
              <label htmlFor='make' className='block mb-1'>
                Vehicle Make:
              </label>
              {formData.year && makes.length > 0 ? (
                <select
                  name='make'
                  id='make'
                  value={formData.make}
                  onChange={handleChange}
                  onBlur={handleMakeBlur}
                  required
                  className='w-full p-2 rounded border border-secondaryText bg-black/40 text-primaryText placeholder-gray-400 focus:ring-2 focus:ring-accent transition'
                >
                  <option value=''>Select Make</option>
                  {makes.map((makeName) => (
                    <option key={makeName} value={makeName}>
                      {makeName}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <input
                    type='text'
                    name='make'
                    id='make'
                    placeholder='Enter Make'
                    value={formData.make}
                    onChange={handleChange}
                    onBlur={handleMakeBlur}
                    required
                    className='w-full p-2 rounded border border-secondaryText bg-black/40 text-primaryText placeholder-gray-400 focus:ring-2 focus:ring-accent transition'
                  />
                  {formData.year && !loadingMakes && makes.length === 0 && (
                    <p className='text-xs text-pinkAccent mt-1'>
                      Please enter manually.
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Vehicle Model */}
            {formData.make && (
              <div>
                <label htmlFor='model' className='block mb-1'>
                  Vehicle Model:
                </label>
                {formData.make && models.length > 0 ? (
                  <select
                    name='model'
                    id='model'
                    value={formData.model}
                    onChange={handleChange}
                    required
                    className='w-full p-2 rounded border border-secondaryText bg-black/40 text-primaryText placeholder-gray-400 focus:ring-2 focus:ring-accent transition'
                  >
                    <option value=''>Select Model</option>
                    {models.map((modelName) => (
                      <option key={modelName} value={modelName}>
                        {modelName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type='text'
                    name='model'
                    id='model'
                    placeholder='Enter Model'
                    value={formData.model}
                    onChange={handleChange}
                    required
                    className='w-full p-2 rounded border border-secondaryText bg-black/40 text-primaryText placeholder-gray-400 focus:ring-2 focus:ring-accent transition'
                  />
                )}
                {loadingModels && (
                  <p className='text-xs text-secondaryText mt-1'>
                    Loading models...
                  </p>
                )}
              </div>
            )}

            {/* Repair Order Number */}
            <div>
              <label htmlFor='roNumber' className='block mb-1'>
                Repair Order #:
              </label>
              <input
                type='text'
                name='roNumber'
                id='roNumber'
                placeholder='RO Number'
                value={formData.roNumber}
                onChange={handleChange}
                required
                className='w-full p-2 rounded border border-secondaryText bg-black/40 text-primaryText placeholder-gray-400 focus:ring-2 focus:ring-accent transition'
              />
            </div>

            {/* Total Labor Hours */}
            <div>
              <label htmlFor='labor' className='block mb-1'>
                Total Labor Hours:
              </label>
              <input
                type='number'
                name='labor'
                id='labor'
                placeholder='0.0'
                value={formData.labor}
                onChange={handleChange}
                required
                className='w-full p-2 rounded border border-secondaryText bg-black/40 text-primaryText placeholder-gray-400 focus:ring-2 focus:ring-accent transition'
              />
              <button
                onClick={openLaborModal}
                className='mt-2 text-accent underline'
              >
                Need help adding labor?
              </button>
            </div>

            <button
              type='submit'
              className='w-full py-2 px-4 bg-gradient-to-r from-tealAccent to-accent text-background rounded-lg shadow-md transition hover:shadow-lg hover:scale-105'
            >
              Track Work
            </button>
          </form>
        </div>
      </div>

      {/* Labor Calculator Modal */}
      {modalOpen && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
          <div className='bg-surface p-6 rounded shadow-md w-80'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-bold'>Labor Calculator</h2>
              <button
                onClick={closeLaborModal}
                className='text-primaryText text-2xl'
              >
                &times;
              </button>
            </div>
            <p className='mb-2'>Enter hours to add:</p>
            <input
              type='number'
              value={laborInput}
              onChange={(e) => setLaborInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addLaborLine();
                }
              }}
              step='0.1'
              placeholder='Enter hours'
              className='w-full p-2 mb-4 rounded border border-secondaryText bg-surface text-primaryText'
            />
            <div className='flex justify-between mb-4'>
              <button
                onClick={addLaborLine}
                className='bg-tealAccent text-background py-1 px-3 rounded'
              >
                Add This Labor
              </button>
              <button
                onClick={closeLaborModal}
                className='bg-orangeAccent text-background py-1 px-3 rounded'
              >
                Done
              </button>
            </div>
            <p className='text-sm text-secondaryText'>
              Current Total: {laborTotal.toFixed(1)}
            </p>
          </div>
        </div>
      )}

      {/* Repair Orders Grid */}
      <div className='mt-8'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold'>
            {showOlder ? 'All Repair Orders' : "Today's Repair Orders"}
          </h2>
          <button
            onClick={() => setShowOlder((prev) => !prev)}
            className='text-accent underline transition hover:text-accentLight'
          >
            {showOlder ? 'Show Today Only' : 'Show Older Orders'}
          </button>
        </div>

        {filteredOrders.length === 0 ? (
          <p className='text-secondaryText text-lg text-center'>
            No repair orders to display.
          </p>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
            {filteredOrders.map((order: RepairOrderType) => (
              <div
                key={order.id}
                className='bg-black/40 backdrop-blur-md p-5 rounded-xl shadow-lg border border-gray-700 transition hover:scale-105 hover:shadow-xl'
              >
                <div className='mb-3 flex justify-between items-center'>
                  <h3 className='text-lg font-semibold'>
                    RO #{order.roNumber}
                  </h3>
                  <span className='text-sm text-gray-400'>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className='text-gray-300 space-y-2'>
                  <p>
                    <strong>Year:</strong> {order.year}
                  </p>
                  <p>
                    <strong>Make:</strong> {order.make}
                  </p>
                  <p>
                    <strong>Model:</strong> {order.model}
                  </p>
                  <p>
                    <strong>Labor:</strong> {order.labor.toFixed(1)} hrs
                  </p>
                </div>

                {/* Buttons */}
                <div className='mt-4 flex space-x-3'>
                  <button
                    onClick={() => openEditModal(order)}
                    className='flex-1 py-2 px-4 bg-tealAccent text-background rounded-lg transition hover:bg-teal-600 hover:scale-105'
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteOrder(order.id)}
                    className='flex-1 py-2 px-4 bg-orangeAccent text-background rounded-lg transition hover:bg-red-500 hover:scale-105'
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Repair Order Modal */}
      {editModalOpen && editingOrder && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
          <div className='bg-surface p-6 rounded shadow-md w-80'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-bold'>Edit Repair Order</h2>
              <button
                onClick={closeEditModal}
                className='text-primaryText text-2xl'
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className='mb-4'>
                <label htmlFor='editYear' className='block mb-1'>
                  Vehicle Year:
                </label>
                <input
                  type='number'
                  name='year'
                  id='editYear'
                  placeholder='YYYY'
                  value={editFormData.year}
                  onChange={handleEditChange}
                  required
                  className='w-full p-2 rounded border border-secondaryText bg-surface text-primaryText'
                />
              </div>
              <div className='mb-4'>
                <label htmlFor='editMake' className='block mb-1'>
                  Vehicle Make:
                </label>
                <input
                  type='text'
                  name='make'
                  id='editMake'
                  placeholder='Make'
                  value={editFormData.make}
                  onChange={handleEditChange}
                  required
                  className='w-full p-2 rounded border border-secondaryText bg-surface text-primaryText'
                />
              </div>
              <div className='mb-4'>
                <label htmlFor='editModel' className='block mb-1'>
                  Vehicle Model:
                </label>
                <input
                  type='text'
                  name='model'
                  id='editModel'
                  placeholder='Model'
                  value={editFormData.model}
                  onChange={handleEditChange}
                  required
                  className='w-full p-2 rounded border border-secondaryText bg-surface text-primaryText'
                />
              </div>
              <div className='mb-4'>
                <label htmlFor='editRoNumber' className='block mb-1'>
                  Repair Order #:
                </label>
                <input
                  type='text'
                  name='roNumber'
                  id='editRoNumber'
                  placeholder='RO Number'
                  value={editFormData.roNumber}
                  onChange={handleEditChange}
                  required
                  className='w-full p-2 rounded border border-secondaryText bg-surface text-primaryText'
                />
              </div>
              <div className='mb-4'>
                <label htmlFor='editLabor' className='block mb-1'>
                  Total Labor Hours:
                </label>
                <input
                  type='number'
                  name='labor'
                  id='editLabor'
                  placeholder='0.0'
                  value={editFormData.labor}
                  onChange={handleEditChange}
                  required
                  className='w-full p-2 rounded border border-secondaryText bg-surface text-primaryText'
                />
              </div>
              <button
                type='submit'
                className='w-full py-2 px-4 bg-accent text-background rounded'
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
