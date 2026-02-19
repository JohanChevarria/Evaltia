import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Exemy",
  description: "Tu camino más fácil para estudiar medicina.",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
