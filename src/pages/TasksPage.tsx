import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Calendar as CalendarIcon,
  Filter,
  MoreVertical,
  ChevronRight,
  LayoutGrid,
  List as ListIcon,
  Search,
  CheckCircle
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuth } from '../context/AuthContext';

interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  created_at: string;
}

const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium' as const,
  });

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'tasks'),
      where('user_id', '==', user.uid),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(taskList);
      setIsLoading(isLoading && false);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching tasks:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTask.title.trim()) return;

    try {
      await addDoc(collection(db, 'tasks'), {
        user_id: user.uid,
        title: newTask.title,
        description: newTask.description,
        due_date: newTask.due_date,
        priority: newTask.priority,
        status: 'todo',
        created_at: new Date().toISOString()
      });
      setIsAddingTask(false);
      setNewTask({ title: '', description: '', due_date: '', priority: 'medium' });
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const nextStatus: Record<string, 'todo' | 'in-progress' | 'completed'> = {
      'todo': 'in-progress',
      'in-progress': 'completed',
      'completed': 'todo'
    };

    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        status: nextStatus[task.status]
      });
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (task.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-rose-500 bg-rose-50 border-rose-100';
      case 'medium': return 'text-amber-500 bg-amber-50 border-amber-100';
      case 'low': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="text-emerald-500" size={20} />;
      case 'in-progress': return <Clock className="text-amber-500" size={20} />;
      default: return <Circle className="text-slate-300" size={20} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display italic text-ink mb-2">My Tasks</h1>
            <p className="text-sm text-ink/60">Organize your journey and stay on track.</p>
          </div>
          <button 
            onClick={() => setIsAddingTask(true)}
            className="btn-luxury px-6 py-3 flex items-center justify-center gap-2"
          >
            <Plus size={20} /> New Task
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-border mb-6 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30" size={18} />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-paper/50 border-none rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex bg-paper/50 rounded-xl p-1">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gold' : 'text-ink/40'}`}
              >
                <ListIcon size={18} />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-gold' : 'text-ink/40'}`}
              >
                <LayoutGrid size={18} />
              </button>
            </div>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-paper/50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-gold flex-1 md:flex-none"
            >
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Task List/Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin mb-4"></div>
            <p className="text-ink/60 font-medium">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-border shadow-sm">
            <div className="w-20 h-20 bg-paper rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-ink/20" size={40} />
            </div>
            <h3 className="text-xl font-display italic text-ink mb-2">No tasks found</h3>
            <p className="text-ink/60 mb-8 max-w-xs mx-auto">
              {searchQuery || filterStatus !== 'all' 
                ? "Try adjusting your filters or search query." 
                : "You don't have any tasks yet. Start by creating your first task!"}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <button onClick={() => setIsAddingTask(true)} className="btn-luxury px-8 py-3">
                Create First Task
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'list' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-6'}>
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-white rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-all group ${task.status === 'completed' ? 'opacity-75' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <button 
                      onClick={() => handleToggleStatus(task)}
                      className="mt-1 transition-transform active:scale-90"
                    >
                      {getStatusIcon(task.status)}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className={`font-bold text-ink truncate ${task.status === 'completed' ? 'line-through text-ink/40' : ''}`}>
                          {task.title}
                        </h3>
                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </div>
                      </div>
                      {task.description && (
                        <p className={`text-sm mb-3 line-clamp-2 ${task.status === 'completed' ? 'text-ink/30' : 'text-ink/60'}`}>
                          {task.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-ink/40 font-medium">
                        {task.due_date && (
                          <div className="flex items-center gap-1.5">
                            <CalendarIcon size={12} />
                            <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} />
                          <span>Added: {new Date(task.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Add Task Modal */}
        <AnimatePresence>
          {isAddingTask && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
              >
                <div className="p-8 border-b border-border flex justify-between items-center">
                  <h2 className="text-2xl font-display italic text-ink">New Task</h2>
                  <button onClick={() => setIsAddingTask(false)} className="text-ink/40 hover:text-ink">
                    <Trash2 size={24} className="rotate-45" />
                  </button>
                </div>
                <form onSubmit={handleCreateTask} className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">Task Title</label>
                    <input 
                      type="text" 
                      required
                      placeholder="What needs to be done?"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      className="w-full bg-paper/50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-gold text-ink"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">Description (Optional)</label>
                    <textarea 
                      placeholder="Add some details..."
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      className="w-full bg-paper/50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-gold text-ink min-h-[100px] resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">Due Date</label>
                      <input 
                        type="date" 
                        value={newTask.due_date}
                        onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                        className="w-full bg-paper/50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-gold text-ink"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">Priority</label>
                      <select 
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                        className="w-full bg-paper/50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-gold text-ink"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setIsAddingTask(false)}
                      className="flex-1 btn-outline py-4"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 btn-luxury py-4"
                    >
                      Create Task
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TasksPage;
