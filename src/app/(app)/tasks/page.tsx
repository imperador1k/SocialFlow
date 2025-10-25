
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

function TaskItem({
  task,
  onToggle,
  onDelete,
  onEdit,
}: {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}) {
  return (
    <div className="flex items-center space-x-4 p-2 rounded-md hover:bg-muted/50 transition-colors group">
      <Checkbox
        id={`task-${task.id}`}
        checked={task.completed}
        onCheckedChange={(checked) => onToggle(task.id, !!checked)}
        aria-label={`Marcar tarefa como ${task.completed ? 'incompleta' : 'completa'}`}
      />
      <label
        htmlFor={`task-${task.id}`}
        className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}
      >
        {task.text}
      </label>
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(task)}
          className="h-8 w-8 opacity-0 group-hover:opacity-100"
          aria-label="Editar tarefa"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(task.id)}
          className="h-8 w-8 opacity-0 group-hover:opacity-100"
          aria-label="Excluir tarefa"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [newTask, setNewTask] = useState('');
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const firestore = useFirestore();
  const { user } = useUser();

  const tasksCollection = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/tasks`);
  }, [firestore, user]);

  const tasksQuery = useMemoFirebase(() => {
    if (!tasksCollection) return null;
    return query(tasksCollection, orderBy('createdAt', 'desc'));
  }, [tasksCollection]);

  const { data: tasks = [], isLoading } = useCollection<Omit<Task, 'id'>>(tasksQuery);

  const handleAddTask = () => {
    if (newTask.trim() && tasksCollection) {
      addDocumentNonBlocking(tasksCollection, {
        text: newTask,
        completed: false,
        createdAt: serverTimestamp(),
      });
      setNewTask('');
    }
  };

  const handleToggleTask = (id: string, completed: boolean) => {
    if (!user) return;
    const taskDoc = doc(firestore, `users/${user.uid}/tasks`, id);
    updateDoc(taskDoc, { completed });
  };

  const handleDeleteTask = (id: string) => {
    if (!user) return;
    const taskDoc = doc(firestore, `users/${user.uid}/tasks`, id);
    deleteDocumentNonBlocking(taskDoc);
  };
  
  const handleEditTask = async (text: string) => {
    if (!user || !selectedTask) return;
    const taskDoc = doc(firestore, `users/${user.uid}/tasks`, selectedTask.id);
    await updateDoc(taskDoc, { text });
    setEditDialogOpen(false);
    setSelectedTask(null);
  };

  const openEditDialog = (task: Task) => {
    setSelectedTask(task);
    setEditDialogOpen(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  const pendingTasks = (tasks || []).filter((task) => !task.completed);
  const completedTasks = (tasks || []).filter((task) => task.completed);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gestor de Tarefas</CardTitle>
          <CardDescription>Gerencie suas atividades de redes sociais.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center space-x-2 mb-6">
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="ex: Editar novo vídeo do YouTube"
              disabled={!user || isLoading}
            />
            <Button onClick={handleAddTask} disabled={!user || isLoading || !newTask.trim()}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar Tarefa
            </Button>
          </div>

          <div className="space-y-2">
            {isLoading && <p>A carregar tarefas...</p>}
            {!isLoading && pendingTasks.length > 0 ? (
              pendingTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onDelete={handleDeleteTask}
                  onEdit={openEditDialog}
                />
              ))
            ) : (
              !isLoading && (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <p>Nenhuma tarefa pendente. Bom trabalho!</p>
                </div>
              )
            )}
          </div>

          {completedTasks.length > 0 && (
            <Accordion type="single" collapsible className="w-full mt-8">
              <AccordionItem value="completed-tasks" className="border-t">
                <AccordionTrigger className="text-muted-foreground hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span>Tarefas Concluídas</span>
                    <span className="bg-muted text-muted-foreground text-xs font-mono h-5 w-5 flex items-center justify-center rounded-full">
                      {completedTasks.length}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 mt-2">
                    {completedTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={handleToggleTask}
                        onDelete={handleDeleteTask}
                        onEdit={openEditDialog}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(isOpen) => {
          setEditDialogOpen(isOpen);
          if (!isOpen) setSelectedTask(null);
        }}
      >
        <EditTaskDialog task={selectedTask} onConfirm={handleEditTask} onOpenChange={setEditDialogOpen} />
      </Dialog>
    </>
  );
}


function EditTaskDialog({
    task,
    onConfirm,
    onOpenChange,
}: {
    task: Task | null;
    onConfirm: (text: string) => void;
    onOpenChange: (isOpen: boolean) => void;
}) {
    const [text, setText] = useState('');

    useEffect(() => {
        if(task) {
            setText(task.text);
        }
    }, [task]);

    const handleSubmit = () => {
        if (text.trim()) {
            onConfirm(text);
        }
    }

    if (!task) return null;

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Editar Tarefa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="task-text">Descrição da Tarefa</Label>
                    <Input id="task-text" value={text} onChange={(e) => setText(e.target.value)} />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={!text.trim()}>
                    Guardar Alterações
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}
