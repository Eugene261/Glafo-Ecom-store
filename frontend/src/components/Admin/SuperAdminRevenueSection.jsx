import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSuperAdminRevenue } from '../../redux/slices/revenueSlice';
import RevenueChart from './RevenueChart';
import axios from 'axios';
import { API_URL } from '../../config/apiConfig';

const SuperAdminRevenueSection = () => {
  const dispatch = useDispatch();
  const { superAdminRevenue: revenueData, loading, error } = useSelector((state) => state.revenue);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [directData, setDirectData] = useState(null);
  const [directLoading, setDirectLoading] = useState(false);
  const [directError, setDirectError] = useState(null);
  
  // Debug the entire revenue state
  const revenueState = useSelector((state) => state.revenue);
  console.log('Full revenue state (SuperAdmin):', revenueState);

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
      
      const apiUrl = `${API_URL}/api/orders/super-admin-revenue`;
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
    console.log('SuperAdminRevenueSection: Dispatching fetchSuperAdminRevenue');
    dispatch(fetchSuperAdminRevenue());
    
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
  
  console.log('Active data source:', revenueData ? 'Redux' : 'Direct API');
  console.log('SuperAdmin revenue data structure:', JSON.stringify(activeData, null, 2));
  
  // Check if we have the expected data structure
  if (!activeData.totalRevenue) {
    console.log('Total revenue data missing:', activeData);
    return <div className="text-center py-4">Revenue data structure is incomplete</div>;
  }

  const handleAdminSelect = (adminId) => {
    setSelectedAdmin(adminId === selectedAdmin ? null : adminId);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Revenue Overview</h2>
        <div className="text-2xl font-bold text-green-600">
          ${typeof activeData.totalRevenue.total === 'number' ? 
            activeData.totalRevenue.total.toFixed(2) : '0.00'}
        </div>
      </div>
      
      {/* Total Revenue Chart and Table */}
      <div className="mb-8">
        {Array.isArray(activeData.totalRevenue.labels) && 
         Array.isArray(activeData.totalRevenue.values) && 
         activeData.totalRevenue.labels.length > 0 && 
         activeData.totalRevenue.values.length > 0 ? (
          <>
            <RevenueChart
              title="Total Monthly Revenue (Last 6 Months)"
              labels={activeData.totalRevenue.labels}
              values={activeData.totalRevenue.values}
              height="300px"
            />
            
            {/* Fallback table visualization */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium mb-2">Revenue Breakdown</h3>
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b text-left">Month</th>
                      <th className="py-2 px-4 border-b text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeData.totalRevenue.labels.map((label, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-2 px-4 border-b">{label}</td>
                        <td className="py-2 px-4 border-b text-right">
                          ${typeof activeData.totalRevenue.values[index] === 'number' ? 
                            activeData.totalRevenue.values[index].toFixed(2) : '0.00'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-blue-50">
                      <td className="py-2 px-4 border-b font-bold">Total</td>
                      <td className="py-2 px-4 border-b text-right font-bold">
                        ${typeof activeData.totalRevenue.total === 'number' ? 
                          activeData.totalRevenue.total.toFixed(2) : '0.00'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 bg-gray-100 rounded">
            <p>No chart data available for total revenue</p>
          </div>
        )}
      </div>
      
      {/* Admin Revenue Breakdown */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Revenue by Admin</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {activeData.adminRevenue && typeof activeData.adminRevenue === 'object' ? 
            Object.entries(activeData.adminRevenue).map(([adminId, adminData]) => (
              <div 
                key={adminId}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedAdmin === adminId 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => handleAdminSelect(adminId)}
              >
                <div className="font-medium">{adminData.adminName || 'Admin'}</div>
                <div className="text-sm text-gray-500 mb-2">{adminData.adminEmail || 'No email'}</div>
                <div className="text-xl font-bold text-green-600">
                  ${typeof adminData.total === 'number' ? adminData.total.toFixed(2) : '0.00'}
                </div>
              </div>
            )) : (
              <div className="col-span-3 text-center py-4">No admin revenue data available</div>
            )}
        </div>
        
        {/* Selected Admin Chart */}
        {selectedAdmin && activeData.adminRevenue && activeData.adminRevenue[selectedAdmin] && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">
              {activeData.adminRevenue[selectedAdmin].adminName || 'Admin'}'s Revenue
            </h3>
            {Array.isArray(activeData.adminRevenue[selectedAdmin].labels) && 
             Array.isArray(activeData.adminRevenue[selectedAdmin].values) && 
             activeData.adminRevenue[selectedAdmin].labels.length > 0 && 
             activeData.adminRevenue[selectedAdmin].values.length > 0 ? (
              <>
                <RevenueChart
                  title={`Monthly Revenue for ${activeData.adminRevenue[selectedAdmin].adminName || 'Admin'}`}
                  labels={activeData.adminRevenue[selectedAdmin].labels}
                  values={activeData.adminRevenue[selectedAdmin].values}
                  height="300px"
                />
                
                {/* Fallback table for selected admin */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium mb-2">Monthly Breakdown</h3>
                  <div className="overflow-x-auto mt-4">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead>
                        <tr>
                          <th className="py-2 px-4 border-b text-left">Month</th>
                          <th className="py-2 px-4 border-b text-right">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeData.adminRevenue[selectedAdmin].labels.map((label, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="py-2 px-4 border-b">{label}</td>
                            <td className="py-2 px-4 border-b text-right">
                              ${typeof activeData.adminRevenue[selectedAdmin].values[index] === 'number' ? 
                                activeData.adminRevenue[selectedAdmin].values[index].toFixed(2) : '0.00'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-blue-50">
                          <td className="py-2 px-4 border-b font-bold">Total</td>
                          <td className="py-2 px-4 border-b text-right font-bold">
                            ${typeof activeData.adminRevenue[selectedAdmin].total === 'number' ? 
                              activeData.adminRevenue[selectedAdmin].total.toFixed(2) : '0.00'}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 bg-gray-100 rounded">
                <p>No chart data available for this admin</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminRevenueSection;
