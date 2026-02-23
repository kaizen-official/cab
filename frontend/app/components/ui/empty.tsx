export default function Empty({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-[15px] text-text-secondary font-medium">{title}</p>
      {description && <p className="text-[13px] text-text-tertiary mt-1.5 max-w-[300px]">{description}</p>}
    </div>
  );
}
