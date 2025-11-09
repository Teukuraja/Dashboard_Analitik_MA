export default function Modal({ children, onClose }) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg"
          >
            ✕
          </button>
          {children}
        </div>
      </div>
    );
  }
  