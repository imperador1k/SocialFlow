'use client';

import { useState } from 'react';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';

const initialTasks: Task[] = [
  { id: 1, text: 'Brainstorm 5 new video ideas for TikTok', completed: false },
  { id: 2, text: 'Film and edit "Day in the Life" YouTube video', completed: false },
  { id: 3, text: 'Schedule Instagram posts for next week', completed: true },
  { id: 4, text: 'Engage with comments for 30 minutes', completed: false },
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
        <CardTitle>Task Manager</CardTitle>
        <CardDescription>Manage your social media activities.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex w-full items-center space-x-2 mb-6">
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., Edit new YouTube video"
          />
          <Button onClick={handleAddTask}>
            <Plus className="mr-2 h-4 w-4" /> Add Task
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
                  aria-label={`Mark task as ${task.completed ? 'incomplete' : 'complete'}`}
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
                  aria-label="Delete task"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))
          ) : (
             <div className="text-center py-8 text-muted-foreground">
                <p>No tasks yet. Add one to get started!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
