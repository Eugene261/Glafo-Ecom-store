import React, { useEffect } from 'react';
import Hero from '../Layout/Hero';
import GenderCollectionSection from '../Products/GenderCollectionSection';
import NewArrivals from '../Products/NewArrivals';
import BestSeller from '../Products/BestSeller';
import YouMayAlsoLike from '../Products/YouMayAlsoLike';
import ProductGrid from '../Products/ProductGrid';
import FeaturedCollection from '../Products/FeaturedCollection';
import FeaturedSection from '../Products/FeaturedSection';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsByFilters } from '../../redux/slices/productSlice';

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
      <NewArrivals />
      <div className="container mx-auto px-4">
        <BestSeller />
      </div>
      <div className="container mx-auto my-8 px-4">
        <h2 className="text-3xl text-center font-bold mb-8">
          Top Wears for Women
        </h2>
        <ProductGrid products={products} loading={loading} error={error} />
      </div>
      <div className="container mx-auto px-4">
        <YouMayAlsoLike />
        <FeaturedCollection />
      </div>
      <FeaturedSection />
    </div>
  );
};

export default Home;