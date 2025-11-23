import { Receipt } from "lucide-react";
import Card from "../ui/Card";

const RecentTransactions = ({ transactions, loading }) => {
  if (loading) {
    return (
      <Card>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between py-3 border-b">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Transactions
        </h3>
        <div className="text-center py-8">
          <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No transactions yet</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Recent Transactions
      </h3>
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction._id}
            className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Receipt className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {transaction.transactionNumber}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(transaction.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                RM {transaction.totalAmount.toFixed(2)}
              </p>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  transaction.paymentMethod === "cash"
                    ? "bg-success-100 text-success-700"
                    : "bg-primary-100 text-primary-700"
                }`}
              >
                {transaction.paymentMethod}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RecentTransactions;
