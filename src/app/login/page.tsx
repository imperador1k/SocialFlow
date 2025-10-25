'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/firebase';
import {
  initiateEmailSignUp,
  initiateEmailSignIn,
} from '@/firebase/non-blocking-login';
import { Loader2, Sparkles } from 'lucide-react';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { toast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';


const signUpSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
});

const signInSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: z.string().min(6, { message: 'A senha é necessária.' }),
});

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleAuthError = (error: unknown) => {
    let title = 'Ocorreu um erro';
    let description = 'Por favor, tente novamente mais tarde.';

    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          title = 'Email já em uso';
          description = 'Este endereço de e-mail já está registrado. Por favor, faça login ou use um e-mail diferente.';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          title = 'Credenciais Inválidas';
          description = 'O e-mail ou a senha que você inseriu estão incorretos. Por favor, verifique e tente novamente.';
          break;
        case 'auth/invalid-email':
          title = 'Email Inválido';
          description = 'O formato do email inserido não é válido.';
          break;
        default:
          description = error.message;
      }
    }
    
    toast({ variant: 'destructive', title, description });
    setIsLoading(false);
  }

  async function onSignUp(values: z.infer<typeof signUpSchema>) {
    setIsLoading(true);
    if (!firestore || !auth) {
        handleAuthError(new Error("Firebase services not available."));
        return;
    }

    try {
      const { email, password, name } = values;
      const userCredential = await initiateEmailSignUp(auth, email, password);
      const user = userCredential.user;

      if (user) {
        const userProfileRef = doc(firestore, 'users', user.uid);
        const userProfile = {
            id: user.uid,
            name: name,
            email: user.email,
            avatar: user.photoURL || `https://avatar.vercel.sh/${name}.png`,
            createdAt: serverTimestamp(),
            motivationalPhotoUrl: '',
        };
        // Use setDocumentNonBlocking to create the user profile with the correct ID
        setDocumentNonBlocking(userProfileRef, userProfile, { merge: false });
      }
      
      // No need to set loading to false here, the AuthGate will handle the redirect.

    } catch (error) {
      handleAuthError(error);
    }
  }

  async function onSignIn(values: z.infer<typeof signInSchema>) {
    setIsLoading(true);
    try {
      await initiateEmailSignIn(auth, values.email, values.password);
      // No need to set loading to false here, the AuthGate will handle the redirect.
    } catch (error) {
      handleAuthError(error);
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">SocialFlow</h1>
          </div>
          <p className="text-muted-foreground">
            A plataforma tudo-em-um para gerir, analisar e otimizar as suas redes sociais.
          </p>
        </div>
        
        <Tabs defaultValue="entrar" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="entrar">Entrar</TabsTrigger>
            <TabsTrigger value="criar-conta">Criar Conta</TabsTrigger>
          </TabsList>
          <TabsContent value="entrar">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Bem-vindo de volta!</CardTitle>
                <CardDescription>
                  Insira o seu e-mail e senha para aceder à sua conta.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...signInForm}>
                  <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                    <FormField
                      control={signInForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="seu@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signInForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Entrar
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="criar-conta">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Crie a sua Conta</CardTitle>
                <CardDescription>
                  É rápido e fácil. Comece a otimizar as suas redes sociais hoje mesmo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...signUpForm}>
                  <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                    <FormField
                      control={signUpForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signUpForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="seu@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signUpForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Criar conta
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <p className="px-8 text-center text-sm text-muted-foreground">
          Ao clicar em continuar, você concorda com os nossos{' '}
          <a href="#" className="underline underline-offset-4 hover:text-primary">
            Termos de Serviço
          </a>{' '}
          e{' '}
          <a href="#" className="underline underline-offset-4 hover:text-primary">
            Política de Privacidade
          </a>
          .
        </p>
      </div>
    </div>
  );
}
