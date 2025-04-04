import React, { useEffect } from 'react';
import Hero from '../Layout/Hero';
import GenderCollectionSection from '../Products/GenderCollectionSection';
import BestSeller from '../Products/BestSeller';
import NewArrivals from '../Products/NewArrivals';
import YouMayAlsoLike from '../Products/YouMayAlsoLike';
import ProductGrid from '../Products/ProductGrid';
import FeaturedCollection from '../Products/FeaturedCollection';
import FeaturedSection from '../Products/FeaturedSection';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsByFilters } from '../../redux/slices/productSlice';
import { Link } from 'react-router-dom';

const Home = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);

  useEffect(() => {
    // Fetch products for Top Wears for Women section (limited to 8)
    dispatch(fetchProductsByFilters({
      gender: "Women",
      category: "Top Wear",
      limit: 8,
      isPublished: true
    }));
  }, [dispatch]);

  return (
    <div>
      <Hero />
      <GenderCollectionSection />
      <BestSeller />
      <NewArrivals />
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Top Wear for Women</h2>
            <p className="text-gray-600">Explore our curated collection of women's tops, featuring the latest trends and timeless classics.</p>
          </div>
          <ProductGrid products={products} loading={loading} error={error} />
          {products?.length > 0 && (
            <div className="text-center mt-12">
              <Link 
                to="/collections/all?category=Top%20Wear&gender=Women"
                className="inline-block bg-black text-white px-8 py-3.5 rounded-full hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                View All Women's Tops
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4">
        <YouMayAlsoLike />
        <FeaturedCollection />
      </div>
      <FeaturedSection />
    </div>
  );
};

export default Home;