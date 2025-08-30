import { useEffect } from "react";

interface ScrollToTopProps {
  screen: string;
}

export default function ScrollToTop({ screen }: ScrollToTopProps) {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // can use auto if you donr want animation
    });
  }, [screen]); 

  return null;
}