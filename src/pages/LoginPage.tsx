import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import axios from 'axios';

import api from '@/libs/api';
import { useAuthStore } from '@/stores/authStore';

const formSchema = z.object({
    email: z.string().email({
        message: "Por favor, insira um e-mail válido.",
    }),
    password: z.string().min(1, {
        message: "A senha não pode estar vazia.",
    }),
});

export function LoginPage() {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const [apiError, setApiError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setApiError(null);
        try {
            const response = await api.post('/auth/login', values);

            const { token, user } = response.data;

            login(token, user);

            navigate('/boards');

        } catch (error: unknown) {

            if (axios.isAxiosError(error)) {
                if (error.response && error.response.status === 401) {
                    setApiError('E-mail ou senha inválidos.');
                } else {
                    setApiError('Ocorreu um erro. Tente novamente.');
                }
            }
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="w-full max-w-md p-8 space-y-6 bg-card text-card-foreground rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center">Login</h1>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
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
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Senha</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Sua senha" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        { }
                        {apiError && (
                            <p className="text-sm font-medium text-destructive">{apiError}</p>
                        )}

                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? 'Entrando...' : 'Entrar'}
                        </Button>
                    </form>
                </Form>

                { }
                <p className="text-sm text-center text-gray-600">
                    Não tem uma conta?{' '}
                    <Link to="/register" className="font-medium text-blue-600 hover:underline">
                        Registre-se
                    </Link>
                </p>
            </div>
        </div>
    );
}