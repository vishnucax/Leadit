"use client";

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export const useVisitor = () => {
  const [visitorId, setVisitorId] = useState<string | null>(null);

  useEffect(() => {
    // Generate or retrieve visitor ID from local storage
    if (typeof window !== "undefined") {
      let storedId = localStorage.getItem("leadit_visitor_id");
      if (!storedId) {
        storedId = uuidv4();
        localStorage.setItem("leadit_visitor_id", storedId);
      }
      setVisitorId(storedId);
    }
  }, []);

  return { visitorId };
};
