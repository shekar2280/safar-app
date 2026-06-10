import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function SignIn() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/auth/Login" as any);
  }, []);
  return null;
}
