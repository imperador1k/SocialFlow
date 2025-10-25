
'use client';

import { useState } from 'react';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const initialTasks: Task[] = [
  { id: 1, text: 'Brainstorm de 5 novas ideias de vídeo para o TikTok', completed: false },
  { id: 2, text: 'Gravar e editar o vídeo "Um Dia na Vida" para o YouTube', completed: false },
  { id: 3, text: 'Agendar posts do Instagram para a próxima semana', completed: true },
  { id: 4, text: 'Interagir com comentários por 30 minutos', completed: false },
];

function TaskItem({ task, onToggle, onDelete }: { task: Task, onToggle: (id: number) => void, onDelete: (id: number) => void}) {
  return (
    <div className="flex items-center space-x-4 p-2 rounded-md hover:bg-muted/50 transition-colors group">
      <Checkbox
        id={`task-${task.id}`}
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        aria-label={`Marcar tarefa como ${task.completed ? 'incompleta' : 'completa'}`}
      />
      <label
        htmlFor={`task-${task.id}`}
        className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}
      >
        {task.text}
      </label>
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
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTask, setNewTask] = useState('');

  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
      setNewTask('');
    }
  };

  const handleToggleTask = (id: number) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)));
  };

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
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
          />
          <Button onClick={handleAddTask}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar Tarefa
          </Button>
        </div>
        
        <div className="space-y-2">
          {pendingTasks.length > 0 ? (
            pendingTasks.map((task) => (
              <TaskItem key={task.id} task={task} onToggle={handleToggleTask} onDelete={handleDeleteTask} />
            ))
          ) : (
             <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <p>Nenhuma tarefa pendente. Bom trabalho!</p>
            </div>
          )}
        </div>

        {completedTasks.length > 0 && (
            <Accordion type="single" collapsible className="w-full mt-8">
                 <AccordionItem value="completed-tasks" className="border-t">
                    <AccordionTrigger className="text-muted-foreground hover:no-underline">
                        <div className="flex items-center gap-2">
                            <span>Tarefas Concluídas</span>
                            <span className="bg-muted text-muted-foreground text-xs font-mono h-5 w-5 flex items-center justify-center rounded-full">{completedTasks.length}</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2 mt-2">
                            {completedTasks.map((task) => (
                                <TaskItem key={task.id} task={task} onToggle={handleToggleTask} onDelete={handleDeleteTask} />
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
