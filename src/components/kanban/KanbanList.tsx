
import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { KanbanCard } from './KanbanCard';
import { Trash2 } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { EditableTitle } from '@/components/ui/editable-title';

interface Card { id: number; title: string; order: number; listId: number; }
interface List { id: number; title: string; cards: Card[]; }

interface KanbanListProps {
    list: List;
    renderAddCardButton: () => React.ReactNode;
    onDelete: () => void;
    onDeleteCard: (cardId: number) => void;
    onEditCard: (card: Card) => void;
    onEditTitle: (newTitle: string) => void;
}

export function KanbanList({ list, renderAddCardButton, onDelete, onDeleteCard, onEditCard, onEditTitle }: KanbanListProps) {
    const { setNodeRef } = useDroppable({
        id: list.id,
    });

    const cardIds = list.cards.map(card => card.id);

    return (
        <div
            ref={setNodeRef}
            className="w-full md:w-72 bg-muted text-muted-foreground rounded-lg p-3 shadow-md md:flex-shrink-0 flex flex-col"
        >
            <div className="flex justify-between items-center mb-3">
                <EditableTitle
                    initialTitle={list.title}
                    onSave={onEditTitle}
                    className="font-semibold"
                />

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-gray-500 hover:text-destructive"
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Isso irá deletar a lista "{list.title}" e **todos os cartões** dentro dela.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete();
                                }}
                                className={buttonVariants({ variant: "destructive" })}
                            >
                                Deletar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            { }
            <SortableContext
                items={cardIds}
                strategy={verticalListSortingStrategy}
            >
                { }
                <div className="space-y-3 flex-1">
                    {list.cards.length > 0 ? (
                        list.cards.map((card) => (
                            <KanbanCard
                                key={card.id}
                                card={card}
                                onDelete={() => onDeleteCard(card.id)}
                                onClick={() => onEditCard(card)}
                            />
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">Nenhum cartão nesta lista.</p>
                    )}
                </div>
            </SortableContext>

            { }
            {renderAddCardButton()}
        </div>
    );
}