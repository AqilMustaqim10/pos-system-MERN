import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Package } from "lucide-react";
import productService from "../../services/productService";
import usePOSStore from "../../store/posStore";
import Input from "../ui/Input";
import toast from "react-hot-toast";

const ProductSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const addToCart = usePOSStore((state) => state.addToCart);

  // Fetch products
  const { data, isLoading } = useQuery({
    queryKey: ["products", searchQuery],
    queryFn: () => productService.getAll({ search: searchQuery, limit: 50 }),
  });

  const products = data?.data || [];

  const handleAddToCart = (product) => {
    if (product.stock <= 0) {
      toast.error("Product out of stock!");
      return;
    }
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search products by name or SKU..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={Search}
        />
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-4 shadow-sm animate-pulse"
              >
                <div className="h-24 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {products.map((product) => (
              <button
                key={product._id}
                onClick={() => handleAddToCart(product)}
                disabled={product.stock <= 0}
                className={`bg-white rounded-lg p-4 shadow-sm text-left transition-all hover:shadow-md ${
                  product.stock <= 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-105"
                }`}
              >
                {/* Product Image Placeholder */}
                <div className="w-full h-24 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg mb-3 flex items-center justify-center">
                  <Package className="w-12 h-12 text-primary-600" />
                </div>

                {/* Product Info */}
                <h3 className="font-semibold text-gray-900 mb-1 truncate">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-500 mb-2">{product.sku}</p>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary-600">
                    RM {product.price.toFixed(2)}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      product.stock > product.lowStockThreshold
                        ? "bg-success-100 text-success-700"
                        : product.stock > 0
                        ? "bg-warning-100 text-warning-700"
                        : "bg-danger-100 text-danger-700"
                    }`}
                  >
                    {product.stock > 0
                      ? `${product.stock} left`
                      : "Out of stock"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSearch;
