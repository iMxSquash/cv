type CardElement = "article" | "div" | "li";

interface CardProps {
  as?: CardElement;
  className?: string;
  children: React.ReactNode;
}

export function Card({ as: Element = "div", className = "", children }: CardProps) {
  return (
    <Element className={`rounded-2xl bg-surface-raised p-5 shadow-elevation ${className}`}>
      {children}
    </Element>
  );
}
