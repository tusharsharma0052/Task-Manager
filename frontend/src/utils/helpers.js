import { formatDistanceToNow, format, isToday, isTomorrow } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return format(d, 'MMM dd, yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return format(d, 'MMM dd, yyyy hh:mm a');
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'Completed') return false;
  return new Date(dueDate) < new Date();
};

export const getStatusColor = (status) => {
  const colors = {
    Todo: '#gray',
    InProgress: '#blue',
    InReview: '#purple',
    Completed: '#green',
    Blocked: '#red',
  };
  return colors[status] || '#gray';
};

export const getPriorityColor = (priority) => {
  const colors = {
    Low: '#green',
    Medium: '#blue',
    High: '#orange',
    Critical: '#red',
  };
  return colors[priority] || '#blue';
};

export const getInitials = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};
