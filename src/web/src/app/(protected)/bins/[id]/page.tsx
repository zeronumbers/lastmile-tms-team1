"use client";

import { use } from "react";
import { BinForm } from "@/components/bins/bin-form";

interface EditBinPageProps {
  params: Promise<{ id: string }>;
}

export default function EditBinPage({ params }: EditBinPageProps) {
  const { id } = use(params);
  return <BinForm binId={id} />;
}
