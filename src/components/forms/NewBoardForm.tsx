import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';

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
import api from '@/libs/api';

const formSchema = z.object({
    title: z.string().min(1, {
        message: "O título não pode estar vazio.",
    }),
});

interface NewBoardFormProps {
    onSuccess: (newBoard: unknown) => void;
}

export function NewBoardForm({ onSuccess }: NewBoardFormProps) {
    const [apiError, setApiError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setApiError(null);
        try {
            const response = await api.post('/boards', values);
            onSuccess(response.data);
            form.reset();

        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setApiError('Ocorreu um erro ao criar o quadro.');
            } else {
                setApiError('Ocorreu um erro inesperado.');
            }
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Título do Quadro</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Meu novo projeto" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {apiError && (
                    <p className="text-sm font-medium text-destructive">{apiError}</p>
                )}

                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Criando...' : 'Criar Quadro'}
                </Button>
            </form>
        </Form>
    );
}