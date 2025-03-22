import React, { useEffect, useRef, useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const NewArrivals = () => {

    const scrollRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const newArrivals = [
        {
            _id : "1",
            name : "Stylish Jacket",
            price : 120,
            image : [
                {
                    url: "http://picsum.photos/500/500?random=1",
                    altText: "Stylish Jacket",
                },
            ],
        },
        {
            _id : "2",
            name : "Stylish Jacket",
            price : 120,
            image : [
                {
                    url: "http://picsum.photos/500/500?random=2",
                    altText: "Stylish Jacket",
                },
            ],
        },
        {
            _id : "3",
            name : "Stylish Jacket",
            price : 120,
            image : [
                {
                    url: "http://picsum.photos/500/500?random=3",
                    altText: "Stylish Jacket",
                },
            ],
        },
        {
            _id : "4",
            name : "Stylish Jacket",
            price : 120,
            image : [
                {
                    url: "http://picsum.photos/500/500?random=4",
                    altText: "Stylish Jacket",
                },
            ],
        },
        {
            _id : "5",
            name : "Stylish Jacket",
            price : 120,
            image : [
                {
                    url: "http://picsum.photos/500/500?random=5",
                    altText: "Stylish Jacket",
                },
            ],
        },
        {
            _id : "6",
            name : "Stylish Jacket",
            price : 120,
            image : [
                {
                    url: "http://picsum.photos/500/500?random=6",
                    altText: "Stylish Jacket",
                },
            ],
        },
        {
            _id : "7",
            name : "Stylish Jacket",
            price : 120,
            image : [
                {
                    url: "http://picsum.photos/500/500?random=7",
                    altText: "Stylish Jacket",
                },
            ],
        },
        {
            _id : "8",
            name : "Stylish Jacket",
            price : 120,
            image : [
                {
                    url: "http://picsum.photos/500/500?random=8",
                    altText: "Stylish Jacket",
                },
            ],
        },
        
    ];

    const handleOnMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setCanScrollLeft(scrollRef.current.scrollLeft);
    };

    const handleOnMouseMove = (e) =>{
        if(!isDragging) return;
        const x = e.pageX - scrollRef.current.offsetLeft;

        // Fixed the scrolling logic
        const walk = x - startX;
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = canScrollLeft - walk;
        }
    }

    const handleOnMouseUpOrLeave = () =>{
        setIsDragging(false);
    }


    const scroll = (direction) => {
        const scrollAmount = direction === "left" ? -300 : 300;
        scrollRef.current.scrollBy({left: scrollAmount, behavior: "smooth"});
    }

    // Update Scroll Buttons 
    const updateScrollButtons = () => {
        const container = scrollRef.current;
        
        if (container) {
            const leftScroll = container.scrollLeft;
            const rightScrollable = container.scrollWidth > leftScroll + container.clientWidth;

            setCanScrollLeft(leftScroll > 0);
            setCanScrollRight(rightScrollable);
        }
    }

    useEffect(() => {
        const container = scrollRef.current;

        if(container) {
            container.addEventListener('scroll', updateScrollButtons);
            updateScrollButtons();
            
            // Cleanup event listener on unmount
            return () => {
                container.removeEventListener('scroll', updateScrollButtons);
            };
        }
    }, []);



  return (
    <section className='my-5 py-16 px-4 lg:px-0'>
        <div className="container mx-auto text-center mb-16 md:mb-10 relative">
            <h2 className="text-3xl font-bold mb-4">
                Explore New Arrivals
            </h2>
            <p className="text-lg text-gray-600 mb-8">
                Discover the latest Styles straight off the runway, freshly added to 
                keep your wardrobe on the cutting edge of fashion.
            </p>

            {/* scroll Buttons - Repositioned for mobile */}
            <div
            className="flex justify-center
             md:justify-end md:absolute
              md:right-0 md:bottom-0 
              space-x-2 mt-4 md:mt-0"
              >
                <button 
                    onClick={() => scroll("left")}
                    disabled={!canScrollLeft}
                    className={`p-2 rounded border ${
                        canScrollLeft ? "bg-white text-black" 
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                >
                    <FiChevronLeft className='text-2xl'/>
                </button>

                <button 
                    onClick={() => scroll("right")}
                    disabled={!canScrollRight}
                    className={`p-2 rounded border ${
                        canScrollRight ? "bg-white text-black" 
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                >
                    <FiChevronRight className='text-2xl'/>
                </button>
            </div>
        </div>


        {/* Scrollable contents  */}
        <div ref={scrollRef}
            className={`container mx-auto overflow-x-scroll flex space-x-6 relative ${
                isDragging ? "cursor-grabbing" : "cursor-grab"}`} 
            onMouseDown={handleOnMouseDown}
            onMouseMove={handleOnMouseMove}
            onMouseUp={handleOnMouseUpOrLeave}
            onMouseLeave={handleOnMouseUpOrLeave}
        >
            {newArrivals.map((product) => (
                <div key={product._id} className='min-w-[100%] sm:min-w-[50%] lg:min-w-[30%] relative'>
                    <img 
                        src={product.image[0]?.url}
                        alt={product.image[0]?.altText || product.name}
                        className='w-full h-[500px] object-cover rounded-lg'
                        draggable="false"
                    />
                    <div
                        className="absolute bottom-0
                        left-0 right-0
                        bg-opacity-50 backdrop-blur-md
                        text-white p-4 rounded-b-lg"
                    >
                        <Link to={`/product/${product._id}`} className='block'>
                            <h4 className='font-medium'>{product.name}</h4>
                            <p className="mt-1">$ {product.price}</p>
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    </section>
  )
}

export default NewArrivals