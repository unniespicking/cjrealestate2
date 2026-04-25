import { PropertyForm } from "@/components/PropertyForm";

export default function NewListing() {
  return (
    <div className="container-site py-10 max-w-5xl">
      <PropertyForm mode="create" />
    </div>
  );
}
