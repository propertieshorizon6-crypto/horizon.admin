export default function Header() {
  return (
    <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <input
        type="text"
        placeholder="Search leads, properties..."
        className="w-1/3 border rounded-lg px-4 py-2"
      />

      <div className="flex items-center gap-4">
        <span className="text-gray-600">Akash</span>
        <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white">
          A
        </div>
      </div>
    </div>
  );
}