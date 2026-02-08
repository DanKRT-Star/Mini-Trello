import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task, TaskStatus } from '@/types/task';
import { Plus, Snowflake, ClipboardList, Zap, Eye, CheckCircle2 } from 'lucide-react';
import TaskCard from './TaskCard';
import { useState } from 'react';
import CreateTaskModal from './CreateTaskModal';

interface TaskColumnProps {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
  boardId: string;
  cardId: string;
}

const columnConfig = {
  icebox: {
    icon: Snowflake,
    className: 'status-icebox'
  },
  backlog: {
    icon: ClipboardList,
    className: 'status-backlog'
  },
  ongoing: {
    icon: Zap,
    className: 'status-ongoing'
  },
  review: {
    icon: Eye,
    className: 'status-review'
  },
  done: {
    icon: CheckCircle2,
    className: 'status-done'
  },
};

export default function TaskColumn({ id, title, tasks, boardId, cardId }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const [showCreateModal, setShowCreateModal] = useState(false);

  const config = columnConfig[id];

  return (
    <>
      <div
        ref={setNodeRef}
        className={`shrink-0 w-80 ${config.className} rounded-2xl p-5 h-full flex flex-col border-2 transition-all duration-300 ${
          isOver ? 'ring-4 ring-purple-400 ring-opacity-50 scale-105' : ''
        }`}
      >
        {/* Column Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-white/50">
          <div className="flex items-center gap-2">
            {config.icon && <config.icon className="w-6 h-6 text-gray-700" />}
            <h3 className="font-bold text-gray-800">
              {title}
            </h3>
            <span className="px-2.5 py-1 bg-white/80 rounded-full text-xs font-bold text-gray-700 shadow-sm">
              {tasks.length}
            </span>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-icon"
          >
            <Plus className="w-5 h-5 text-gray-600 group-hover:text-purple-600 group-hover:rotate-90 transition-all duration-300" />
          </button>
        </div>

        {/* Tasks List */}
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-thin">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                boardId={boardId}
                cardId={cardId}
              />
            ))}

            {tasks.length === 0 && (
              <div className="empty-state py-12">
                <div className="empty-state-icon w-16 h-16 mb-3">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 font-medium">Kéo task vào đây</p>
                <p className="text-xs text-gray-400 mt-1">hoặc tạo mới</p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>

      {showCreateModal && (
        <CreateTaskModal
          boardId={boardId}
          cardId={cardId}
          defaultStatus={id}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </>
  );
}