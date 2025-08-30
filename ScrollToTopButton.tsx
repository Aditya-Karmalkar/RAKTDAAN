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
      className="fixed bottom-6 right-6 bg-primary text-primary-foreground p-3 rounded-full shadow-lg z-50 transition-all duration-200 hover:bg-primary/90 hover:scale-110 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      aria-label="Scroll to top"
    >
      <ArrowUp size={20} className="w-5 h-5" />
    </button>
  );
};

export default ScrollToTopButton;
