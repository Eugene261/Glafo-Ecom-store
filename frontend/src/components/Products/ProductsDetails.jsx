import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ProductGrid from './ProductGrid';



const  selectedProducts = {
    name : "Corteiz Jacket",
    price : 120,
    originalPrice : 150,
    description: "This is a street wear",
    brand: "FashionBrand",
    material : "Leather",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Red", "Blue"],
    images : [
        {
        url : "https://picsum.photos/500/500?random=1",
        alText : "Stylish Jacket 1"
        },
        {
        url : "https://picsum.photos/500/500?random=2",
        alText : "Stylish Jacket 2"
        }
    ]
};

const similarProducts = [
    {
        _id : 1,
        name : "Product 1",
        price : 110,
        images : [{ url : "https://picsum.photos/500/500?random=1" }]
    },
    {
        _id : 2,
        name : "Product 2",
        price : 220,
        images : [{ url : "https://picsum.photos/500/500?random=2" }]
    },
    {
        _id : 3,
        name : "Product 3",
        price : 330,
        images : [{ url : "https://picsum.photos/500/500?random=3" }]
    },
    {
        _id : 4,
        name : "Product 4",
        price : 440,
        images : [{ url : "https://picsum.photos/500/500?random=4" }]
    },
    
];

const ProductsDetails = () => {

    const [mainIMage, setMainImage] = useState("");
    const [seletedSize, setSelectedSize] =  useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);


    useEffect(() => {
        if(selectedProducts?.images?.length > 0) {
            setMainImage(selectedProducts.images[0].url);
        }
    }, [selectedProducts]);


    const handleQuantityChange = (action) =>{
        if(action === "plus") setQuantity((prev) => prev + 1);
        if(action === "minus" && quantity > 1) setQuantity((prev) => prev -1);
    };

    const handleAddToCart = () =>{
        if(!seletedSize || !selectedColor) {
            toast.error("Please select a size and a color before adding to cart.", {
                duration: 1000,
            })
            return;
        };
        setIsButtonDisabled(true);

        setTimeout(() => {
            toast.success('Product added successfully!', {
                duration: 1000,
            });
            setIsButtonDisabled(false);
        }, 500);
    };

  return (
    <div className='p-6'>
        <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg">
            <div className="flex flex-col md:flex-row">

                {/* Left Thumbnails */}
                <div className="hidden md:flex flex-col space-y-4 mr-6">
                    {selectedProducts.images.map((image, index) => (
                        <img
                        key={index}
                         src={image.url} alt={image.alText || `Thumbanail ${index}`}
                         className={`w-20 h-20 object-cover rounded-lg cursor-pointer border ${mainIMage === 
                            image.url ? "border-black" : "border-e-gray-300"}`}
                         onClick={()=>setMainImage(image.url)}
                         />
                    ))}
                </div>

                {/* Main Image */}
                <div className="md:w-1/2 ">
                    <div className="mb-4">
                        <img
                        src={mainIMage} 
                        alt="Main Product" 
                        className='w-full h-auto object-cover rounded-lg'
                        />
                    </div>
                </div>

                {/* MobileThumbnails */}
                <div className="md:hidden flex overflow-x-scroll scroll-px-4 mb-4">
                {selectedProducts.images.map((image, index) => (
                    <img
                    key={index}
                        src={image.url} alt={image.alText || `Thumbanail ${index}`}
                        className={`w-20 h-20 object-cover rounded-lg cursor-pointer border ${mainIMage === 
                            image.url ? "border-black" : "border-e-gray-300"}`}
                        onClick={() => setMainImage(image.url)}
                    />
                ))}
                </div>

                {/* Right Side */}
                <div className="md:w-1/2 md:ml-10">
                    {/* Product Title */}
                    <h1 className="text-2xl md:text-3xl font-semibold mb-2">
                        {selectedProducts.name}
                    </h1>

                    {/* Product Description */}
                    <p className="text-lg text-gray-600  mb-1 line-through">
                        {selectedProducts.originalPrice && `${selectedProducts.originalPrice}`}
                    </p>
                    <p className="text-xl text-gray-500 mb-2">
                        $ {selectedProducts.price}
                    </p>
                    <p className="text-gray-600 mb-4">
                        {selectedProducts.description}
                    </p>

                    {/* Color */}
                    <div className="mb-4">
                        <p className="text-gray-700 ">Color:</p>
                        <div className="flex gap-2 mt-2">
                            {selectedProducts.colors.map((color) => (
                                <button
                                onClick={() => setSelectedColor(color)}
                                key={color} className={`w-8 h-8 rounded-full border ${selectedColor === color ? 
                                    "border-4  border-black" : "border-gray-300"}`  }
                                style={{backgroundColor: color.toLocaleLowerCase(), 
                                    filter: "brightness(0.5)"
                                }}
                                >
                        
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Sizes */}
                    <div className="mb-4">
                        <p className="text-gray-700">Size: </p>
                        <div className="flex gap-2 mt-2">
                            {selectedProducts.sizes.map((size) => (
                                <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                 className={`px-4 py-2 rounded border ${seletedSize === size ? 
                                    "bg-black text-white" : "" }`}
                                >{size}</button>
                            ))}
                        </div>
                    </div>

                        {/* Quantity */}
                    <div className="mb-6">
                        <p className="text-gray-700">Quantity</p>
                        <div className="flex items-center  space-x-4 mt-2">
                            <button 
                            onClick={() => handleQuantityChange("minus")}
                            className="px-2 py-1 bg-gray-200 rounded text-lg">
                                -
                            </button>
                            <span className='text-lg '>{quantity}</span>
                            <button 
                            onClick={() => handleQuantityChange("plus")}
                            className="px-2 py-1 bg-gray-200 rounded text-lg">
                                +
                            </button>
                        </div>
                    </div>

                    {/* Add to cart Button */}
                    <button
                    onClick={ () => {handleAddToCart()}}
                    disabled={isButtonDisabled}
                    className={`bg-black text-white py-2 px-6 rounded w-full mb-4 ${isButtonDisabled ? 
                        "cursor-not-allowed opacity-50 " :
                        "hover:bg-gray-900"
                    }`}>
                        {isButtonDisabled ?  "Adding..." :  "ADD TO CART"}
                    </button>


                    <div className="mt-10 text-gray-700 ">
                        <h3 className="text-xl font-bold mb-4">Characteristics:</h3>
                            <table className="w-full text-left text-sm text-gray-600">
                                <tbody>
                                    <tr>
                                        <td className='py-1'>Brand</td>
                                        <td className='py-1'>{selectedProducts.brand}</td>
                                    </tr>

                                    <tr>
                                        <td className='py-1'>Material</td>
                                        <td className='py-1'>{selectedProducts.material}</td>
                                    </tr>

                                </tbody>
                            </table>
                    </div>
                </div>
            </div>


            <div className="mt-20 ">
                <h2 className="text-2xl text-center font-medium mb-4">
                    You May Also Like
                </h2>
                <ProductGrid products={similarProducts} /> 
            </div>
        </div>
    </div>
  )
}

export default ProductsDetails