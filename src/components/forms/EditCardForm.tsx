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
import { Textarea } from "@/components/ui/textarea";
import api from '@/libs/api';

interface Card { id: number; title: string; order: number; listId: number; description?: string | null; }

const formSchema = z.object({
    title: z.string().min(1, { message: "O título não pode estar vazio." }),
    description: z.string().optional(),
});

interface EditCardFormProps {
    card: Card;
    onSuccess: (updatedCard: Card) => void;
    onCancel: () => void;
}

export function EditCardForm({ card, onSuccess, onCancel }: EditCardFormProps) {
    const [apiError, setApiError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: card.title,
            description: card.description || "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setApiError(null);
        try {
            const response = await api.put(`/cards/${card.id}`, values);

            onSuccess(response.data);
            onCancel();

        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setApiError('Ocorreu um erro ao atualizar o cartão.');
            } else {
                setApiError('Ocorreu um erro inesperado.');
            }
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                { }
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Título do Cartão</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                { }
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Adicione uma descrição mais detalhada..."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {apiError && (
                    <p className="text-sm font-medium text-destructive">{apiError}</p>
                )}

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}