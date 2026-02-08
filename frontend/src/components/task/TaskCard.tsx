import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import type { Task } from '@/types/task';
import { Calendar, User, GripVertical } from 'lucide-react';
import { format } from 'date-fns';
import TaskAssignmentModal from './TaskAssignmentModal';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  boardId?: string;
  cardId?: string;
}

export default function TaskCard({ task, isDragging, boardId, cardId }: TaskCardProps) {
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`group relative bg-white rounded-xl p-5 shadow-md hover:shadow-xl transition-all duration-300 cursor-grab active:cursor-grabbing border-2 border-gray-100 hover:border-purple-200 ${
          isDragging ? 'opacity-50 rotate-3 scale-105' : 'hover:scale-105'
        }`}
      >
        {/* Drag Handle */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        <div className="flex items-start justify-between gap-2 mb-3">
          <h4 className="font-semibold text-gray-900 text-sm flex-1 leading-snug">{task.title}</h4>
          <div className={`badge priority-${task.priority}`}>
            <div className={`w-1.5 h-1.5 rounded-full bg-linear-to-r from-${task.priority === 'low' ? 'green' : task.priority === 'medium' ? 'orange' : 'red'}-500 to-${task.priority === 'low' ? 'emerald' : task.priority === 'medium' ? 'orange' : 'rose'}-600 animate-pulse`}></div>
            <span className="text-xs font-bold uppercase">
              {task.priority}
            </span>
          </div>
        </div>

        {task.description && (
          <p className="text-xs text-gray-600 mb-4 line-clamp-2 leading-relaxed">{task.description}</p>
        )}

        <div className="flex items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2">
            {task.deadline && (
              <div className="badge badge-blue">
                <Calendar className="w-3.5 h-3.5" />
                <span className="font-semibold">{format(new Date(task.deadline), 'MMM dd')}</span>
              </div>
            )}
          </div>

          {task.assignedMembers.length > 0 && (
            <button
              onClick={() => boardId && cardId && setShowAssignmentModal(true)}
              className="badge badge-purple hover:shadow-md transition-all cursor-pointer"
              title="Click để xem/chỉnh sửa members"
            >
              <User className="w-3.5 h-3.5" />
              <span className="font-semibold">{task.assignedMembers.length}</span>
            </button>
          )}
        </div>

        {/* Hover Gradient Border */}
        <div className="absolute inset-0 rounded-xl bg-linear-to-r from-violet-500 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
      </div>

      {showAssignmentModal && boardId && cardId && (
        <TaskAssignmentModal
          task={task}
          boardId={boardId}
          cardId={cardId}
          onClose={() => setShowAssignmentModal(false)}
        />
      )}
    </>
  );
}