import React, { useState } from "react";

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  titleCslp?: Record<string, unknown>;
}

interface AccordionStyleProps {
  header: React.CSSProperties;
  content: React.CSSProperties;
  icon: React.CSSProperties;
}

const styles: AccordionStyleProps = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    backgroundColor: "#f5f5f5",
    cursor: "pointer",
    borderBottom: "1px solid #ddd",
  },
  content: {
    padding: "15px",
    backgroundColor: "#fff",
    overflow: "hidden",
    transition: "max-height 0.3s ease-out",
  },
  icon: {
    transition: "transform 0.3s ease",
  },
};

const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  defaultOpen = false,
  titleCslp = {},
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      style={{ border: "1px solid #ddd", borderRadius: "4px" }}
      // data-cslp={"test"}
    >
      <div
        style={styles.header}
        onClick={toggleAccordion}
        role="button"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <span
          style={{
            ...styles.icon,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▼
        </span>
      </div>
      <div
        style={{
          ...styles.content,
          maxHeight: isOpen ? "1000px" : "0",
          padding: isOpen ? "15px" : "0",
        }}
        aria-hidden={!isOpen}
      >
        {children}
      </div>
    </div>
  );
};

export default Accordion;
