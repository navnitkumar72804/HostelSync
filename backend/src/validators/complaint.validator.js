export function validateCreateComplaint(body) {
  const { title, category, description, priority } = body;
  if (!title || !category || !description) return 'title, category, description are required';
  const categories = ['Cleaning', 'Food Quality', 'Electricity', 'Water', 'Maintenance', 'Security', 'Other'];
  if (!categories.includes(category)) return 'invalid category';
  const priorities = ['Low', 'Medium', 'High'];
  if (priority && !priorities.includes(priority)) return 'invalid priority';
  return null;
}


