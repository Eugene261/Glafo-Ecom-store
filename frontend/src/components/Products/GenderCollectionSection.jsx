import React from 'react'
import mensCollection from '../../assets/mens-collection.webp';
import womensCollection from '../../assets/womens-collection.webp';
import { Link } from 'react-router-dom';

const GenderCollectionSection = () => {
  return (
    <section className='py-16 px-4 lg:px-0 bg-white'>
      <div className="container mx-auto mb-12 text-center">
        <h2 className="text-3xl font-bold mb-3 tracking-tight">COLLECTIONS</h2>
        <div className="w-16 h-1 bg-black mx-auto mb-6"></div>
        <p className="text-gray-600 max-w-2xl mx-auto">Discover our latest collections designed for your lifestyle. From casual everyday wear to statement pieces that stand out.</p>
      </div>

      <div className="container mx-auto flex flex-col md:flex-row gap-6 lg:gap-12">
        {/* Women's Collection */}
        <div 
          className="relative flex-1 group overflow-hidden rounded-lg shadow-lg transform transition duration-500 hover:shadow-xl"
        >
          <div className="overflow-hidden h-[600px]">
            <img
              src={womensCollection}
              alt="Women's Collection"  
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8">
            <h2 className="text-3xl font-bold text-white mb-3 tracking-wide">
              Women's Collection
            </h2>
            <p className="text-gray-200 mb-6 max-w-xs">
              Elevate your style with our curated selection of women's apparel, footwear, and accessories.
            </p>
            <Link 
              to="/collections/all?gender=Women"
              className="inline-block bg-white text-black font-medium px-6 py-3 rounded-full transition-all duration-300 hover:bg-black hover:text-white hover:shadow-lg transform hover:-translate-y-1 w-fit"
            >
              Shop Women
            </Link>
          </div>
        </div>

        {/* Men's Collection */}
        <div 
          className="relative flex-1 group overflow-hidden rounded-lg shadow-lg transform transition duration-500 hover:shadow-xl"
        >
          <div className="overflow-hidden h-[600px]">
            <img
              src={mensCollection}
              alt="Men's Collection"  
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8">
            <h2 className="text-3xl font-bold text-white mb-3 tracking-wide">
              Men's Collection
            </h2>
            <p className="text-gray-200 mb-6 max-w-xs">
              Discover comfort and style with our premium range of men's clothing, shoes, and accessories.
            </p>
            <Link 
              to="/collections/all?gender=Men"
              className="inline-block bg-white text-black font-medium px-6 py-3 rounded-full transition-all duration-300 hover:bg-black hover:text-white hover:shadow-lg transform hover:-translate-y-1 w-fit"
            >
              Shop Men
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default GenderCollectionSection