import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RegisterForm } from "@/components/register-form";

export const metadata: Metadata = {
  title: "Inscription",
  robots: { index: false },
};

export default function RegisterPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-24">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl italic">
            Créer un compte
          </CardTitle>
          <CardDescription>
            Inscrivez-vous pour suivre vos candidatures et votre progression.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Déjà inscrit ?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Se connecter
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
