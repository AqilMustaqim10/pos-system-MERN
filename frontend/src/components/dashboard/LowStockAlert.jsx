import { AlertTriangle, Package } from "lucide-react";
import Card from "../ui/Card";

const LowStockAlert = ({ products, loading }) => {
  if (loading) {
    return (
      <Card>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between py-2">
              <div className="h-4 bg-gray-200 rounded w-40"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Low Stock Alert
        </h3>
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">All products are in stock</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
        <span className="px-2 py-1 bg-danger-100 text-danger-700 text-xs font-medium rounded-full">
          {products.length} items
        </span>
      </div>
      <div className="space-y-2">
        {products.slice(0, 5).map((product) => (
          <div
            key={product._id}
            className="flex items-center justify-between py-2 px-3 bg-danger-50 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-danger-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {product.name}
                </p>
                <p className="text-xs text-gray-500">{product.sku}</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-danger-600">
              {product.stock} left
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default LowStockAlert;
