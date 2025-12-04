import { useState, useEffect } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";

const CustomerForm = ({ customer, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  // Populate form if editing
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        street: customer.address?.street || "",
        city: customer.address?.city || "",
        state: customer.address?.state || "",
        zipCode: customer.address?.zipCode || "",
        notes: customer.notes || "",
      });
    }
  }, [customer]);

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

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData = {
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone,
      address: {
        street: formData.street || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zipCode: formData.zipCode || undefined,
      },
      notes: formData.notes || undefined,
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="John Doe"
          required
        />

        <Input
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="0123456789"
          required
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="john@example.com"
          className="md:col-span-2"
        />
      </div>

      {/* Address Section */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Address (Optional)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Street"
            name="street"
            value={formData.street}
            onChange={handleChange}
            placeholder="123 Main Street"
            className="md:col-span-2"
          />

          <Input
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Kuala Lumpur"
          />

          <Input
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="Wilayah Persekutuan"
          />

          <Input
            label="Zip Code"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            placeholder="50000"
          />
        </div>
      </div>

      <Input
        label="Notes"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        placeholder="Additional notes about customer"
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="submit" loading={loading}>
          {customer ? "Update Customer" : "Create Customer"}
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm;
