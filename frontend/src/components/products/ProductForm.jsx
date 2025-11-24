import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import categoryService from "../../services/categoryService";

const ProductForm = ({ product, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    category: "",
    price: "",
    cost: "",
    stock: "",
    lowStockThreshold: "10",
    unit: "pcs",
    barcode: "",
    description: "",
  });

  const [errors, setErrors] = useState({});

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getAll,
  });

  const categories = categoriesData?.data || [];

  // Populate form if editing
  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku || "",
        name: product.name || "",
        category: product.category?._id || product.category || "",
        price: product.price || "",
        cost: product.cost || "",
        stock: product.stock || "",
        lowStockThreshold: product.lowStockThreshold || "10",
        unit: product.unit || "pcs",
        barcode: product.barcode || "",
        description: product.description || "",
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.sku) newErrors.sku = "SKU is required";
    if (!formData.name) newErrors.name = "Product name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.price || parseFloat(formData.price) < 0) {
      newErrors.price = "Valid price is required";
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = "Valid stock is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost) || 0,
      stock: parseInt(formData.stock),
      lowStockThreshold: parseInt(formData.lowStockThreshold) || 10,
    };

    onSubmit(submitData);
  };

  const unitOptions = [
    { value: "pcs", label: "Pieces" },
    { value: "kg", label: "Kilograms" },
    { value: "liter", label: "Liters" },
    { value: "box", label: "Boxes" },
    { value: "pack", label: "Packs" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="SKU"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          error={errors.sku}
          placeholder="PROD-001"
          required
        />

        <Input
          label="Product Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Coca Cola 330ml"
          required
        />

        <Select
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          options={categories.map((cat) => ({
            value: cat._id,
            label: cat.name,
          }))}
          error={errors.category}
          required
        />

        <Select
          label="Unit"
          name="unit"
          value={formData.unit}
          onChange={handleChange}
          options={unitOptions}
        />

        <Input
          label="Price (RM)"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          error={errors.price}
          placeholder="0.00"
          step="0.01"
          required
        />

        <Input
          label="Cost (RM)"
          name="cost"
          type="number"
          value={formData.cost}
          onChange={handleChange}
          placeholder="0.00"
          step="0.01"
        />

        <Input
          label="Stock Quantity"
          name="stock"
          type="number"
          value={formData.stock}
          onChange={handleChange}
          error={errors.stock}
          placeholder="0"
          required
        />

        <Input
          label="Low Stock Threshold"
          name="lowStockThreshold"
          type="number"
          value={formData.lowStockThreshold}
          onChange={handleChange}
          placeholder="10"
        />

        <Input
          label="Barcode"
          name="barcode"
          value={formData.barcode}
          onChange={handleChange}
          placeholder="Optional"
          className="md:col-span-2"
        />
      </div>

      <Input
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Optional product description"
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="submit" loading={loading}>
          {product ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
