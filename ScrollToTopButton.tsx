import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

const ScrollToTopButton: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg z-50 transition"
      aria-label="Scroll to top"
    >
      <ArrowUp size={20} />
    </button>
  );
};

export default ScrollToTopButton;
