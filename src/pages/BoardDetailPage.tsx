import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import api from '@/libs/api';

import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    closestCenter
} from '@dnd-kit/core';
import type {
    DragStartEvent,
    DragEndEvent
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { NewListForm } from '@/components/forms/NewListForm';
import { NewCardForm } from '@/components/forms/NewCardForm';
import { KanbanList } from '@/components/kanban/KanbanList';
import { EditCardForm } from '@/components/forms/EditCardForm';
import { Skeleton } from '@/components/ui/skeleton';

interface Card { id: number; title: string; order: number; listId: number; description?: string | null; }
interface List { id: number; title: string; order: number; cards: Card[]; }
interface Board { id: number; title: string; lists: List[]; }

export function BoardDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [board, setBoard] = useState<Board | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isListModalOpen, setIsListModalOpen] = useState(false);

    const [activeCardId, setActiveCardId] = useState<number | null>(null);
    const [editingCard, setEditingCard] = useState<Card | null>(null);

    const activeCard = activeCardId ? findCard(activeCardId) : null;

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    useEffect(() => {
        if (!id) return;
        async function fetchBoardDetails() {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get(`/boards/${id}`);
                const fetchedBoard = response.data as Board;

                fetchedBoard.lists.sort((a, b) => a.order - b.order);
                fetchedBoard.lists.forEach(list => {
                    list.cards.sort((a, b) => a.order - b.order);
                });

                setBoard(fetchedBoard);
            } catch (err) {
                console.error("Erro ao buscar detalhes do quadro:", err);
                setError("Falha ao carregar o quadro.");
            } finally {
                setLoading(false);
            }
        }
        fetchBoardDetails();
    }, [id]);

    function onListCreated(newList: unknown) {
        const newListWithCards = { ...newList as List, cards: [] };
        setBoard((currentBoard) => {
            if (!currentBoard) return null;
            return { ...currentBoard, lists: [...currentBoard.lists, newListWithCards] };
        });
        setIsListModalOpen(false);
    }

    function onCardCreated(newListId: number, newCard: unknown) {
        setBoard((currentBoard) => {
            if (!currentBoard) return null;
            const updatedLists = currentBoard.lists.map((list) => {
                if (list.id === newListId) {
                    const newCardWithOrder = { ...newCard as Card, order: list.cards.length + 1 };
                    return { ...list, cards: [...list.cards, newCardWithOrder] };
                }
                return list;
            });
            return { ...currentBoard, lists: updatedLists };
        });
    }

    function handleCardUpdated(updatedCard: Card) {
        setBoard((currentBoard) => {
            if (!currentBoard) return null;
            const newLists = currentBoard.lists.map(list => {
                if (list.id === updatedCard.listId) {
                    return {
                        ...list,
                        cards: list.cards.map(card =>
                            card.id === updatedCard.id ? updatedCard : card
                        )
                    };
                }
                return list;
            });
            return { ...currentBoard, lists: newLists };
        });
    }

    async function handleDeleteList(listId: number) {
        try {
            setBoard((currentBoard) => {
                if (!currentBoard) return null;
                return {
                    ...currentBoard,
                    lists: currentBoard.lists.filter((list) => list.id !== listId)
                };
            });
            await api.delete(`/lists/${listId}`);
        } catch (err) {
            console.error("Erro ao deletar a lista:", err);
            setError("Falha ao deletar a lista. Recarregue a página.");
        }
    }

    async function handleDeleteCard(cardId: number) {
        try {
            setBoard((currentBoard) => {
                if (!currentBoard) return null;
                const newLists = currentBoard.lists.map(list => ({
                    ...list,
                    cards: list.cards.filter(card => card.id !== cardId)
                }));
                return { ...currentBoard, lists: newLists };
            });
            await api.delete(`/cards/${cardId}`);
        } catch (err) {
            console.error("Erro ao deletar o cartão:", err);
            setError("Falha ao deletar o cartão. Recarregue a página.");
        }
    }

    async function handleEditListTitle(listId: number, newTitle: string) {
        setBoard((currentBoard) => {
            if (!currentBoard) return null;
            const newLists = currentBoard.lists.map(list => {
                if (list.id === listId) {
                    return { ...list, title: newTitle };
                }
                return list;
            });
            return { ...currentBoard, lists: newLists };
        });

        try {
            await api.put(`/lists/${listId}`, { title: newTitle });
        } catch (err) {
            console.error("Falha ao atualizar o título da lista:", err);
            setError("Falha ao salvar a mudança. Recarregue.");
        }
    }

    function findList(listId: number | string): List | undefined {
        return board?.lists.find(l => l.id === listId);
    }

    function findCard(cardId: number | string): Card | undefined {
        if (!board) return undefined;
        for (const list of board.lists) {
            const card = list.cards.find(c => c.id === cardId);
            if (card) return card;
        }
        return undefined;
    }

    function handleDragStart(event: DragStartEvent) {
        setActiveCardId(event.active.id as number);
    }

    function handleDragEnd(event: DragEndEvent) {
        const { over } = event;

        if (!over || !activeCardId) {
            setActiveCardId(null);
            return;
        }

        const originalCard = findCard(activeCardId);
        if (!originalCard) {
            setActiveCardId(null);
            return;
        }

        const originalList = findList(originalCard.listId);
        const targetList = findList(over.id) || findList(over.data.current?.sortable.containerId);

        if (!originalList || !targetList) {
            setActiveCardId(null);
            return;
        }

        let targetCardIndex: number;
        if (over.id === targetList.id) {
            targetCardIndex = targetList.cards.length;
        } else {
            targetCardIndex = targetList.cards.findIndex((c: Card) => c.id === over.id);
        }
        if (targetCardIndex === -1) {
            targetCardIndex = 0;
        }

        setBoard((currentBoard) => {
            if (!currentBoard) return null;

            const allLists = JSON.parse(JSON.stringify(currentBoard.lists));
            const originalListIndex = allLists.findIndex((l: List) => l.id === originalList.id);
            const targetListIndex = allLists.findIndex((l: List) => l.id === targetList.id);
            const originalCardIndex = allLists[originalListIndex].cards.findIndex((c: Card) => c.id === activeCardId);

            if (originalListIndex === -1 || targetListIndex === -1 || originalCardIndex === -1) {
                return currentBoard;
            }

            if (originalList.id === targetList.id) {
                if (originalCardIndex === targetCardIndex) {
                    return currentBoard;
                }

                allLists[originalListIndex].cards = arrayMove(
                    allLists[originalListIndex].cards,
                    originalCardIndex,
                    targetCardIndex
                );
                allLists[originalListIndex].cards.forEach((card: Card, index: number) => {
                    card.order = index + 1;
                });

            } else {
                const [movedCard] = allLists[originalListIndex].cards.splice(originalCardIndex, 1);
                movedCard.listId = targetList.id;

                allLists[targetListIndex].cards.splice(targetCardIndex, 0, movedCard);

                allLists[originalListIndex].cards.forEach((card: Card, index: number) => {
                    card.order = index + 1;
                });
                allLists[targetListIndex].cards.forEach((card: Card, index: number) => {
                    card.order = index + 1;
                });
            }

            return { ...currentBoard, lists: allLists };
        });

        const finalApiOrder = targetCardIndex + 1;

        api.patch(`/cards/${originalCard.id}/move`, {
            newListId: targetList.id,
            newOrder: finalApiOrder,
        }).catch((err) => {
            console.error("Falha ao salvar a mudança!", err);
            setError("Não foi possível salvar a mudança. Recarregue a página.");
        });

        setActiveCardId(null);
    }

    if (loading) {
        return <div className="p-8">Carregando quadro...</div>;
    }
    if (error) {
        return <div className="p-8 text-destructive">{error}</div>;
    }
    if (!board) {
        return <div className="p-8">Quadro não encontrado.</div>;
    }

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCenter}
        >
            { }
            <div className="flex flex-col h-screen p-4 text-foreground bg-gradient-to-br from-white via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-black">

                { }
                <header className="mb-4 flex items-center gap-4">
                    <Button asChild variant="outline" size="icon">
                        <Link to="/boards">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold">{board.title}</h1>
                </header>

                <main className="flex-1 flex gap-4 overflow-x-auto">
                    {board.lists.map((list) => (
                        <KanbanList
                            key={list.id}
                            list={list}
                            onDelete={() => handleDeleteList(list.id)}
                            onDeleteCard={handleDeleteCard}
                            onEditCard={(card) => setEditingCard(card)}
                            onEditTitle={(newTitle) => handleEditListTitle(list.id, newTitle)}
                            renderAddCardButton={() => (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <button className="mt-4 w-full text-left text-sm text-gray-600 hover:bg-gray-300 p-2 rounded-md">
                                            + Adicionar um cartão
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Novo Cartão para "{list.title}"</DialogTitle>
                                        </DialogHeader>
                                        <NewCardForm
                                            listId={list.id}
                                            onSuccess={(newCard) => onCardCreated(list.id, newCard)}
                                        />
                                    </DialogContent>
                                </Dialog>
                            )}
                        />
                    ))}

                    <Dialog open={isListModalOpen} onOpenChange={setIsListModalOpen}>
                        <DialogTrigger asChild>
                            { }
                            <button className="w-72 bg-muted/50 hover:bg-muted p-3 rounded-lg text-left font-medium flex-shrink-0">
                                + Adicionar outra lista
                            </button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Adicionar Nova Lista</DialogTitle>
                            </DialogHeader>
                            <NewListForm
                                boardId={board.id}
                                onSuccess={onListCreated}
                            />
                        </DialogContent>
                    </Dialog>
                </main>

                { }
                <Dialog open={!!editingCard} onOpenChange={(isOpen) => !isOpen && setEditingCard(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingCard?.title || "Carregando..."}</DialogTitle>
                        </DialogHeader>
                        {editingCard ? (
                            <EditCardForm
                                card={editingCard}
                                onSuccess={handleCardUpdated}
                                onCancel={() => setEditingCard(null)}
                            />
                        ) : (
                            <div className="space-y-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-10 w-24 ml-auto" />
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {createPortal(
                    <DragOverlay>
                        {activeCard ? (
                            <div className="bg-white p-3 rounded-md shadow w-72">
                                {activeCard.title}
                            </div>
                        ) : null}
                    </DragOverlay>,
                    document.body
                )}
            </div>
        </DndContext>
    );
}