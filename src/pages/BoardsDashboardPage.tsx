import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/libs/api';
import { useAuthStore } from '@/stores/authStore';
import { Trash2, Plus } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button, buttonVariants } from '@/components/ui/button';
import { NewBoardForm } from '@/components/forms/NewBoardForm';
import { ModeToggle } from '@/components/mode-toggle';
import { EditableTitle } from '@/components/ui/editable-title';

interface Board {
    id: number;
    title: string;
    userId: number;
    createdAt: string;
    updatedAt: string;
}

export function BoardsDashboardPage() {
    const { logout, user } = useAuthStore();
    const navigate = useNavigate();

    const [boards, setBoards] = useState<Board[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        async function fetchBoards() {
            try {
                setLoading(true);
                const response = await api.get('/boards');
                setBoards(response.data);
            } catch (err) {
                setError('Falha ao carregar os quadros.');
            } finally {
                setLoading(false);
            }
        }
        fetchBoards();
    }, []);

    async function handleDeleteBoard(boardId: number) {
        try {
            setBoards((currentBoards) =>
                currentBoards.filter((board) => board.id !== boardId)
            );

            await api.delete(`/boards/${boardId}`);

        } catch (err) {
            console.error("Erro ao deletar o quadro:", err);
            setError("Falha ao deletar o quadro. Por favor, recarregue a página.");
        }
    }

    async function handleEditBoardTitle(boardId: number, newTitle: string) {
        setBoards((currentBoards) =>
            currentBoards.map((board) =>
                board.id === boardId ? { ...board, title: newTitle } : board
            )
        );

        try {
            await api.put(`/boards/${boardId}`, { title: newTitle });
        } catch (err) {
            console.error("Falha ao atualizar o título do quadro:", err);
            setError("Falha ao salvar a mudança. Recarregue.");
        }
    }

    function handleLogout() {
        logout();
        navigate('/login');
    }

    function onBoardCreated(newBoard: unknown) {
        setBoards((currentBoards) => [...currentBoards, newBoard as Board]);
        setIsModalOpen(false);
    }

    return (
        <div className="min-h-screen p-8 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-black text-foreground">

            { }
            <header className="flex justify-between items-center mb-10">
                { }
                <h1 className="text-2xl font-semibold text-foreground">
                    Olá, <span className="font-bold">{user?.email || 'Usuário'}</span>
                </h1>
                <div className="flex items-center gap-2">
                    <ModeToggle />
                    <Button onClick={handleLogout} variant="outline">
                        Sair
                    </Button>
                </div>
            </header>

            { }
            <main>
                { }
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold">Seus Quadros</h2>

                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            { }
                            <Button>
                                <Plus className="h-4 w-4 mr-2" /> { }
                                Criar Novo Quadro
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Novo Quadro</DialogTitle>
                            </DialogHeader>
                            <NewBoardForm onSuccess={onBoardCreated} />
                        </DialogContent>
                    </Dialog>
                </div>

                { }
                {loading && <p>Carregando quadros...</p>}
                {error && <p className="text-destructive">{error}</p>}

                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"> { }
                        {boards.length > 0 ? (
                            boards.map((board) => (
                                <div
                                    key={board.id}
                                    className="relative p-6 bg-card text-card-foreground rounded-lg shadow-lg hover:shadow-xl transition-shadow group"
                                >
                                    { }

                                    { }
                                    <EditableTitle
                                        initialTitle={board.title}
                                        onSave={(newTitle) => handleEditBoardTitle(board.id, newTitle)}
                                        className="font-bold text-xl mb-2 truncate"
                                    />
                                    { }

                                    <Link to={`/boards/${board.id}`} className="block">
                                        <p className="text-sm text-muted-foreground">Abrir quadro &rarr;</p>
                                    </Link>
                                    { }

                                    { }
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-2 right-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Isso irá deletar o quadro "{board.title}" permanentemente.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDeleteBoard(board.id)}
                                                    className={buttonVariants({ variant: "destructive" })}
                                                >
                                                    Deletar
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-4 p-8 text-center bg-muted rounded-lg">
                                <p className="text-muted-foreground">Você ainda não tem quadros. Crie um!</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}