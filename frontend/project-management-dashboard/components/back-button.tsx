import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export const BackButton = () => {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => router.back()}
      className="p-4 mr-4"
    >
      ← Back
    </Button>
  );
};