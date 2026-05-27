export const FormField = ({ label, error, required, children, hint }) => (
  <div>
    {label && (
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    {children}
    {hint && !error && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    {error && <p className="text-xs text-red-500 mt-1 font-medium">⚠ {error}</p>}
  </div>
)
