import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Connexion",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-24">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl italic">
            Jobwave
          </CardTitle>
          <CardDescription>
            Connectez-vous pour retrouver vos candidatures.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link href="/register" className="text-primary hover:underline">
              S&apos;inscrire
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
