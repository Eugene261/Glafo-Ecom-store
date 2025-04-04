import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBestSellers } from '../../redux/slices/productSlice';
import RenderImage from '../Common/RenderImage';

const BestSeller = () => {
  const dispatch = useDispatch();
  const { bestSellers, bestSellersLoading: loading, bestSellersError: error } = useSelector((state) => state.products);
  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
    dispatch(fetchBestSellers());
  }, [dispatch]);

  useEffect(() => {
    if (bestSellers?.[0]?.images?.[0]?.url) {
      setMainImage(bestSellers[0].images[0].url);
    }
  }, [bestSellers]);

  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl text-center font-bold mb-8">Best Seller</h2>
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    console.error("BestSeller error:", error);
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl text-center font-bold mb-8">Best Seller</h2>
          <div className="min-h-[200px] flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p>Unable to load best seller at the moment.</p>
              <p className="text-sm mt-2">We're working on it and will be back soon!</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const bestSeller = bestSellers?.[0];

  if (!bestSeller) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl text-center font-bold mb-8">Best Seller</h2>
          <div className="min-h-[200px] flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p>No best seller available at the moment.</p>
              <p className="text-sm mt-2">Check back later for our featured products!</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl text-center font-bold mb-8">Best Seller</h2>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Side - Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <Link 
                to={`/product/${bestSeller._id}`}
                className="block aspect-square overflow-hidden rounded-lg bg-gray-100 group"
              >
                <RenderImage
                  src={mainImage}
                  alt={bestSeller.name}
                  className="w-full h-full object-cover group-hover:opacity-75"
                  enableZoom={true}
                />
              </Link>
              
              {/* Thumbnail Grid */}
              {bestSeller.images?.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {bestSeller.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setMainImage(image.url)}
                      className={`aspect-square rounded-lg overflow-hidden ${
                        mainImage === image.url ? 'ring-2 ring-black' : ''
                      }`}
                    >
                      <RenderImage
                        src={image.url}
                        alt={`${bestSeller.name} view ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side - Product Info */}
            <div className="space-y-6">
              {/* Product Title and Price */}
              <div className="border-b pb-6">
                <Link 
                  to={`/product/${bestSeller._id}`}
                  className="group"
                >
                  <h1 className="text-3xl font-medium mb-2 group-hover:text-gray-600">
                    {bestSeller.name}
                  </h1>
                </Link>
                <div className="flex items-baseline gap-4">
                  <p className="text-2xl font-medium text-gray-900">
                    ₵{bestSeller.price?.toFixed(2)}
                  </p>
                  {bestSeller.discountPrice && (
                    <p className="text-xl text-red-500 mt-1">
                      ₵{bestSeller.discountPrice.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

              {/* Product Description */}
              <div className="prose prose-sm">
                <p className="text-gray-600">
                  {bestSeller.description}
                </p>
              </div>

              {/* View Details Button */}
              <Link
                to={`/product/${bestSeller._id}`}
                className="inline-block w-full text-center py-3 px-4 rounded-md bg-black text-white hover:bg-gray-900 transition-colors"
              >
                View Details
              </Link>

              {/* Product Details */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="text-sm font-medium">Product Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {bestSeller.brand && (
                    <div>
                      <dt className="text-gray-500">Brand</dt>
                      <dd>{bestSeller.brand}</dd>
                    </div>
                  )}
                  {bestSeller.material && (
                    <div>
                      <dt className="text-gray-500">Material</dt>
                      <dd>{bestSeller.material}</dd>
                    </div>
                  )}
                  {bestSeller.category && (
                    <div>
                      <dt className="text-gray-500">Category</dt>
                      <dd>{bestSeller.category}</dd>
                    </div>
                  )}
                  {bestSeller.gender && (
                    <div>
                      <dt className="text-gray-500">Gender</dt>
                      <dd>{bestSeller.gender}</dd>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestSeller; 