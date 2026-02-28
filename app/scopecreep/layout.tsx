export const metadata = {
  title: 'Scope Creep - Project Management',
  description: 'Protect your projects from scope creep with intelligent project tracking and management.',
};

export default function ScopeCreepLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="scope-creep-app h-full w-full">
      {children}
    </div>
  );
}
