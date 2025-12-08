const TrainerLayout = ({ children }: any) => {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-100 p-4">Trainer Sidebar</aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
};

export default TrainerLayout;
