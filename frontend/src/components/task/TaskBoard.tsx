import { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useTaskStore } from '@/stores/taskStore';
import type { Task, TaskStatus } from '@/types/task';
import TaskColumn from './TaskColumn';
import TaskCard from './TaskCard';
import socketService from '@/services/socket';

interface TaskBoardProps {
  boardId: string;
  cardId: string;
}

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'icebox', title: 'Icebox', color: 'bg-gray-100' },
  { id: 'backlog', title: 'Backlog', color: 'bg-blue-100' },
  { id: 'ongoing', title: 'On Going', color: 'bg-yellow-100' },
  { id: 'review', title: 'Review', color: 'bg-purple-100' },
  { id: 'done', title: 'Done', color: 'bg-green-100' },
];

export default function TaskBoard({ boardId, cardId }: TaskBoardProps) {
  const { tasks, fetchTasks, updateTask, moveTask } = useTaskStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchTasks(boardId, cardId);

    // Socket listeners
    socketService.onTaskCreated((data) => {
      if (data.cardId === cardId) {
        fetchTasks(boardId, cardId);
      }
    });

    socketService.onTaskUpdated((data) => {
      if (data.cardId === cardId) {
        fetchTasks(boardId, cardId);
      }
    });

    socketService.onTaskMoved((data) => {
      if (data.cardId === cardId) {
        moveTask(data.taskId, data.newStatus as TaskStatus);
      }
    });

    return () => {
      socketService.removeAllListeners();
    };
  }, [boardId, cardId, fetchTasks, moveTask]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const task = tasks.find((t) => t.id === taskId);
    
    if (!task) return;

    // If dropped on a column
    const newStatus = over.id as TaskStatus;
    
    if (task.status !== newStatus) {
      // Optimistic update
      moveTask(taskId, newStatus);

      // Update on server
      try {
        await updateTask(boardId, cardId, taskId, { status: newStatus });
        
        // Emit socket event
        socketService.emitTaskMoved({
          boardId,
          cardId,
          taskId,
          oldStatus: task.status,
          newStatus,
        });
      } catch {
        // Revert on error
        moveTask(taskId, task.status);
      }
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div className="h-full overflow-hidden bg-gray-50">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 h-full p-4 overflow-x-auto">
          {COLUMNS.map((column) => (
            <TaskColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              tasks={getTasksByStatus(column.id)}
              boardId={boardId}
              cardId={cardId}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}