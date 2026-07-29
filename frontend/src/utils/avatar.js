// Helper to generate consistent, beautiful, random animated profile pictures for workers
// using free cartoon/animated avatar APIs without checkered backgrounds

export const getWorkerAvatar = (worker = {}) => {
  const name = worker.user?.name || worker.name || worker._id || 'Worker';
  const seed = encodeURIComponent(name);
  
  // Diverse animated & cartoon character styles
  const styles = [
    'adventurer',
    'avataaars',
    'lorelei',
    'big-smile',
    'micah',
    'personas',
    'bottts',
    'open-peeps'
  ];
  
  // Determine unique consistent index based on worker name or ID
  let hash = 0;
  const str = worker._id || name;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash);
  
  const style = styles[index % styles.length];
  
  // Clean modern solid/gradient backgrounds (never any transparency checkerboard!)
  const bgColors = [
    '6366f1', // Indigo
    '3b82f6', // Blue
    '8b5cf6', // Purple
    'ec4899', // Pink
    '10b981', // Emerald
    'f59e0b', // Amber
    '06b6d4', // Cyan
    '14b8a6', // Teal
    'ef4444', // Red
    '84cc16'  // Lime
  ];
  const bgColor = bgColors[index % bgColors.length];

  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=${bgColor}`;
};
