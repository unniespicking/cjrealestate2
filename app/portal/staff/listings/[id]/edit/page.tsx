import { notFound } from "next/navigation";
import { getProperty } from "@/lib/store";
import { PropertyForm } from "@/components/PropertyForm";

export default async function EditListing({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) notFound();
  return (
    <div className="container-site py-10 max-w-5xl">
      <PropertyForm mode="edit" initial={property} />
    </div>
  );
}
