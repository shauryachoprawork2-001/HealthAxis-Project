export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {Icon && <Icon className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />}
    <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
    {description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
)
