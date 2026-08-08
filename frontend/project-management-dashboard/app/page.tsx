import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div >
      <div  className="flex flex-col gap-3 h-screen items-center justify-center">
        <h3>Login Form</h3>
        <div className="flex  gap-4">
          <Link href="auth/sign-in">
            <Button size="lg" className="bg-blue-500 text-white">
              Login
            </Button>
          </Link>
          <Link href="auth/sign-up">
            <Button size="lg" variant="outline" className="bg-blue-500 text-white">
              Sign Up
            </Button>
          </Link>
      </div>
      </div>

    </div>
  );
}
