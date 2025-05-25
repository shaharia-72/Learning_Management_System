export const generateColorFromName = (name) => {
    if (!name) return '#6c757d';
    
    const colors = [
      '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', 
      '#f43f5e', '#ef4444', '#f97316', '#f59e0b',
      '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
      '#3b82f6'
    ];
    
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };