import React from "react";
import {
  Home,
  Building2,
  CreditCard,
  Briefcase,
  Car,
  GraduationCap,
  Coins,
  TrendingUp,
  FileText,
  Landmark
} from "lucide-react";

export function getLoanIconComponent(typeKey, props = {}) {
  const key = String(typeKey || "").toLowerCase().replace(/[^a-z0-9]/g, "");

  if (key.includes("home")) {
    return <Home {...props} />;
  }
  if (key.includes("lap") || key.includes("property")) {
    return <Building2 {...props} />;
  }
  if (key.includes("personal")) {
    return <CreditCard {...props} />;
  }
  if (key.includes("business")) {
    return <Briefcase {...props} />;
  }
  if (key.includes("vehicle") || key.includes("car") || key.includes("auto")) {
    return <Car {...props} />;
  }
  if (key.includes("education") || key.includes("student")) {
    return <GraduationCap {...props} />;
  }
  if (key.includes("gold")) {
    return <Coins {...props} />;
  }
  if (key.includes("working") || key.includes("capital")) {
    return <TrendingUp {...props} />;
  }
  return <FileText {...props} />;
}

export default function LoanIcon({ type, size = 24, className = "", color, style = {} }) {
  return getLoanIconComponent(type, { size, className, color, style });
}
