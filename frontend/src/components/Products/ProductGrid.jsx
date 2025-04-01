import React from 'react'
import {Link} from 'react-router-dom'
import RenderImage from '../Common/RenderImage';

const ProductGrid = ({ products, loading, error }) => {
    if (loading) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 aspect-[3/4] rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      );
    }
  
    if (!products || products.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No products found</p>
        </div>
      );
    }
  
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link 
            key={product._id} 
            to={`/product/${product._id}`}
            className="group relative"
          >
            <div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
              <RenderImage
                src={product.images?.[0]?.url || '/placeholder.png'}
                alt={product.name}
                className="h-full w-full object-cover object-center group-hover:opacity-75"
                enableZoom={true}
              />
            </div>
            <div className="mt-4 flex justify-between">
              <div>
                <h3 className="text-sm text-gray-700 line-clamp-1">{product.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{product.brand}</p>
              </div>
              <p className="text-sm font-medium text-gray-900">
                ${product.price.toFixed(2)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    );
  };

export default ProductGrid