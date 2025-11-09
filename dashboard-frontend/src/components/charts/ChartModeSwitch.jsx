  
// === Komponen ChartModeSwitch untuk toggle mode tampilan chart antara number dan analytics ===
export default function ChartModeSwitch({ chartMode, setChartMode }) {
    return (
      <div className="flex justify-center mt-10">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setChartMode("number")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              chartMode === "number" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            Number
          </button>
          <button
            onClick={() => setChartMode("analytics")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              chartMode === "analytics" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            Analytics
          </button>
        </div>
      </div>
    );
  }
  