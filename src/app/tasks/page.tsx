'use client';

import { useState } from 'react';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';

const initialTasks: Task[] = [
  { id: 1, text: 'Brainstorm de 5 novas ideias de vídeo para o TikTok', completed: false },
  { id: 2, text: 'Gravar e editar o vídeo "Um Dia na Vida" para o YouTube', completed: false },
  { id: 3, text: 'Agendar posts do Instagram para a próxima semana', completed: true },
  { id: 4, text: 'Interagir com comentários por 30 minutos', completed: false },
];

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
        <div className="space-y-4">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <div key={task.id} className="flex items-center space-x-4 p-2 rounded-md hover:bg-muted/50 transition-colors group">
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={() => handleToggleTask(task.id)}
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
                  onClick={() => handleDeleteTask(task.id)}
                  className="h-8 w-8 opacity-0 group-hover:opacity-100"
                  aria-label="Excluir tarefa"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))
          ) : (
             <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma tarefa ainda. Adicione uma para começar!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
