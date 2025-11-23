import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import authService from "../../services/authService";
import useAuthStore from "../../store/authStore";

const Login = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const response = await authService.login(
        formData.email,
        formData.password
      );

      if (response.success) {
        setUser(response.data.user);
        toast.success("Login successful! Welcome back!");
        navigate("/dashboard");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Quick login for testing
  const quickLogin = (role) => {
    const credentials = {
      admin: { email: "admin@test.com", password: "admin123" },
      manager: { email: "manager@test.com", password: "manager123" },
      cashier: { email: "cashier@test.com", password: "cashier123" },
    };

    setFormData(credentials[role]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to your POS account</p>
        </div>

        {/* Login Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              error={errors.email}
              icon={Mail}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.password}
              icon={Lock}
              required
            />

            <Button type="submit" fullWidth loading={loading} className="mt-6">
              Sign In
            </Button>
          </form>

          {/* Quick Login for Testing */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">
              Quick Login (Testing)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => quickLogin("admin")}
                className="px-3 py-2 text-xs font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => quickLogin("manager")}
                className="px-3 py-2 text-xs font-medium text-secondary-700 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => quickLogin("cashier")}
                className="px-3 py-2 text-xs font-medium text-success-700 bg-success-50 rounded-lg hover:bg-success-100 transition-colors"
              >
                Cashier
              </button>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          © 2024 POS Inventory System. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
