import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminRevenue } from '../../redux/slices/revenueSlice';
import RevenueChart from './RevenueChart';
import axios from 'axios';
import { API_URL } from '../../config/apiConfig';

const AdminRevenueSection = () => {
  const dispatch = useDispatch();
  const { adminRevenue: revenueData, loading, error } = useSelector((state) => state.revenue);
  const [directData, setDirectData] = useState(null);
  const [directLoading, setDirectLoading] = useState(false);
  const [directError, setDirectError] = useState(null);
  
  // Debug the entire revenue state
  const revenueState = useSelector((state) => state.revenue);
  console.log('Full revenue state:', revenueState);

  // Try to fetch data directly as a fallback
  const fetchDataDirectly = async () => {
    try {
      setDirectLoading(true);
      const token = localStorage.getItem("userToken");
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const apiUrl = `${API_URL}/api/orders/admin-revenue`;
      console.log('Direct API call to:', apiUrl);
      
      const { data } = await axios.get(apiUrl, config);
      console.log('Direct API response:', data);
      setDirectData(data);
      setDirectLoading(false);
    } catch (error) {
      console.error('Error in direct API call:', error);
      setDirectError(error.message || 'Failed to fetch data directly');
      setDirectLoading(false);
    }
  };

  useEffect(() => {
    console.log('AdminRevenueSection: Dispatching fetchAdminRevenue');
    dispatch(fetchAdminRevenue());
    
    // Also try direct API call as fallback
    fetchDataDirectly();
  }, [dispatch]);

  // Use either Redux data or direct API data
  const isLoading = loading || directLoading;
  const hasError = error || directError;
  const activeData = revenueData || directData;
  
  if (isLoading) {
    return <div className="text-center py-4">Loading revenue data...</div>;
  }

  if (hasError && !activeData) {
    return <div className="text-center text-red-500 py-4">{error || directError}</div>;
  }

  if (!activeData) {
    console.log('No revenue data available from any source');
    return <div className="text-center py-4">No revenue data available</div>;
  }
  
  // Log the structure of the received data
  console.log('Active data source:', revenueData ? 'Redux' : 'Direct API');
  console.log('Revenue data structure:', JSON.stringify(activeData, null, 2));
  
  // Extract the data in the exact format from the backend
  const labels = activeData?.labels || [];
  const values = activeData?.values || [];
  const totalRevenue = activeData?.totalRevenue || 0;
  
  console.log('Extracted chart data:', { labels, values, totalRevenue });
  
  // Ensure data is in the correct format
  if (!Array.isArray(labels) || !Array.isArray(values)) {
    console.error('Data is not in the expected format:', { labels, values });
    return <div className="text-center py-4 bg-red-100 text-red-800 rounded">Data format error: Expected arrays for labels and values</div>;
  }

  // Create a fallback table visualization in case the chart doesn't work
  const renderFallbackTable = () => {
    return (
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left">Month</th>
              <th className="py-2 px-4 border-b text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {labels.map((label, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="py-2 px-4 border-b">{label}</td>
                <td className="py-2 px-4 border-b text-right">
                  ${typeof values[index] === 'number' ? values[index].toFixed(2) : '0.00'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-blue-50">
              <td className="py-2 px-4 border-b font-bold">Total</td>
              <td className="py-2 px-4 border-b text-right font-bold">
                ${typeof totalRevenue === 'number' ? totalRevenue.toFixed(2) : '0.00'}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Revenue Overview</h2>
        <div className="text-2xl font-bold text-green-600">
          ${typeof totalRevenue === 'number' ? totalRevenue.toFixed(2) : '0.00'}
        </div>
      </div>
      
      {/* Try to render the chart first */}
      {labels.length > 0 && values.length > 0 ? (
        <div className="mb-4">
          <RevenueChart
            title="Monthly Revenue (Last 6 Months)"
            labels={labels}
            values={values}
            height="300px"
          />
          
          {/* Also show the fallback table for guaranteed visualization */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-2">Revenue Breakdown</h3>
            {renderFallbackTable()}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-100 rounded">
          <p>No revenue data available</p>
        </div>
      )}
    </div>
  );
};

export default AdminRevenueSection;
