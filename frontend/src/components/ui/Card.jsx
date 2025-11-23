const Card = ({ children, className = "", padding = true }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-soft ${
        padding ? "p-6" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
