import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductDetails, fetchSimilarProducts } from '../../redux/slices/productSlice';
import { addToCart, setCartOpen } from '../../redux/slices/cartSlice';
import RenderImage from '../Common/RenderImage';

const ProductsDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  
  const { selectedProduct, loading, error, similarProducts } = useSelector((state) => state.products);
  const { user, guestId } = useSelector((state) => state.auth);

  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetails(id));
      dispatch(fetchSimilarProducts(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedProduct) {
      // Set main image
      if (selectedProduct.images?.[0]?.url) {
        setMainImage(selectedProduct.images[0].url);
      }
      
      // Set default size if available
      if (selectedProduct.sizes?.length > 0) {
        setSelectedSize(selectedProduct.sizes[0]);
      }
      
      // Set default color if available
      if (selectedProduct.colors?.length > 0) {
        setSelectedColor(selectedProduct.colors[0]);
      }
    }
  }, [selectedProduct]);

  const handleQuantityChange = (action) => {
    setQuantity(prev => {
      if (action === 'increment' && prev < 99) return prev + 1;
      if (action === 'decrement' && prev > 1) return prev - 1;
      return prev;
    });
  };

  const handleAddToCart = async () => {
    try {
      if (!selectedProduct) {
        throw new Error("Product not found");
      }

      // Validation checks
      if (selectedProduct.sizes?.length > 0 && !selectedSize) {
        throw new Error("Please select a size");
      }

      if (selectedProduct.colors?.length > 0 && !selectedColor) {
        throw new Error("Please select a color");
      }

      setIsButtonDisabled(true);

      const cartItem = {
        productId: selectedProduct._id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        image: selectedProduct.images?.[0]?.url || '',
        quantity,
        size: selectedSize,
        color: selectedColor,
        guestId,
        userId: user?._id,
      };

      await dispatch(addToCart(cartItem)).unwrap();
      toast.success("Added to cart successfully!", {duration: 2000});
      setQuantity(1);
      // Open the cart drawer after adding the item
      dispatch(setCartOpen(true));
    } catch (err) {
      toast.error(err.message || "Failed to add to cart");
    } finally {
      setIsButtonDisabled(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => dispatch(fetchProductDetails(id))}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-gray-500">Product not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Side - Product Images */}
          <div className="flex gap-4">
            {/* Thumbnail Column */}
            {selectedProduct.images?.length > 0 && (
              <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto">
                {/* Render all thumbnails */}
                {selectedProduct.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setMainImage(image.url)}
                    className={`
                      w-20 aspect-square rounded-lg overflow-hidden transition-all duration-200
                      ${mainImage === image.url 
                        ? 'ring-2 ring-black ring-offset-2' 
                        : 'hover:opacity-75'
                      }
                    `}
                  >
                    <RenderImage
                      src={image.url}
                      alt={`${selectedProduct.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            
            {/* Main Image */}
            <div className="flex-1">
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                <RenderImage
                  src={mainImage}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                  enableZoom={true}
                />
              </div>
            </div>
          </div>

          {/* Right Side - Product Info */}
          <div className="space-y-6">
            {/* Product Title and Price */}
            <div className="border-b pb-6">
              <h1 className="text-3xl font-medium mb-2">
                {selectedProduct.name}
              </h1>
              <div className="flex items-baseline gap-4">
                <p className="text-2xl font-medium text-gray-900">
                  ₵{selectedProduct.price?.toFixed(2)}
                </p>
                {selectedProduct.discountPrice && (
                  <p className="text-xl text-red-500 mt-1">
                    ₵{selectedProduct.discountPrice.toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            {/* Product Description */}
            <div className="prose prose-sm mb-8">
              <p className="text-gray-600">
                {selectedProduct.description}
              </p>
            </div>

            {/* Color Selection */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Color</h3>
              <div className="flex flex-wrap gap-3">
                {selectedProduct.colors.map((color) => {
                  // Convert color names to their CSS color values
                  const colorMap = {
                    'Navy Blue': '#000080',
                    'Dark Blue': '#00008B',
                    'Light Blue': '#ADD8E6',
                    'Dark Wash': '#4A4E69',
                    'White': '#FFFFFF',
                    'Black': '#000000',
                    'Gray': '#808080',
                    'Red': '#FF0000',
                    'Yellow': '#FFFF00',
                    'Pink': '#FFC0CB',
                    'Burgundy': '#800020',
                    'Beige': '#F5F5DC',
                  };
                  
                  const colorValue = colorMap[color] || color.toLowerCase();
                  
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`relative w-8 h-8 rounded-full transition-transform
                        ${selectedColor === color 
                          ? 'ring-2 ring-black ring-offset-2' 
                          : 'hover:scale-110'
                        }`}
                      style={{ backgroundColor: colorValue }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Size</h3>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`
                      relative w-10 h-10 rounded-md transition-all duration-200
                      flex items-center justify-center text-sm font-medium
                      ${selectedSize === size 
                        ? 'bg-black text-white ring-2 ring-black ring-offset-2 scale-105' 
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-black hover:bg-gray-50 hover:scale-105'
                      }
                    `}
                  >
                    {size}
                    {selectedSize === size && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg 
                          className="w-4 h-4 text-white" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="space-y-4 mb-8">
              <span className="text-sm font-medium">Quantity</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantityChange('decrement')}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  readOnly
                  className="w-16 h-10 text-center border border-gray-200 rounded-md"
                />
                <button
                  onClick={() => handleQuantityChange('increment')}
                  disabled={quantity >= 99}
                  className="w-10 h-10 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isButtonDisabled}
              className="w-full h-12 bg-black text-white rounded-md hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isButtonDisabled ? 'Adding to Cart...' : 'Add to Cart'}
            </button>

            {/* Product Details */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-sm font-medium">Product Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedProduct.brand && (
                  <div>
                    <dt className="text-gray-500">Brand</dt>
                    <dd>{selectedProduct.brand}</dd>
                  </div>
                )}
                {selectedProduct.material && (
                  <div>
                    <dt className="text-gray-500">Material</dt>
                    <dd>{selectedProduct.material}</dd>
                  </div>
                )}
                {selectedProduct.category && (
                  <div>
                    <dt className="text-gray-500">Category</dt>
                    <dd>{selectedProduct.category}</dd>
                  </div>
                )}
                {selectedProduct.gender && (
                  <div>
                    <dt className="text-gray-500">Gender</dt>
                    <dd>{selectedProduct.gender}</dd>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products Section */}
        {similarProducts && similarProducts.length > 0 && (
          <div className="mt-16 border-t pt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-medium">
                You May Also Like
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const container = document.getElementById('similar-products-container');
                    container.scrollBy({ left: -300, behavior: 'smooth' });
                  }}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    const container = document.getElementById('similar-products-container');
                    container.scrollBy({ left: 300, behavior: 'smooth' });
                  }}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="relative">
              <div 
                id="similar-products-container"
                className="flex overflow-x-auto gap-6 scroll-smooth scrollbar-hide pb-4"
              >
                {similarProducts.slice(0, 8).map((product) => (
                  <Link
                    key={product._id}
                    to={`/product/${product._id}`}
                    className="flex-none w-72 group"
                  >
                    <div className="relative">
                      <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                        <RenderImage
                          src={product.images?.[0]?.url}
                          alt={product.name}
                          className="h-full w-full object-cover object-center group-hover:opacity-75"
                          enableZoom={true}
                        />
                      </div>
                      <div className="mt-4">
                        <h3 className="text-sm text-gray-700 group-hover:text-gray-900">{product.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">{product.brand}</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">
                          ₵{product.price?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsDetails;