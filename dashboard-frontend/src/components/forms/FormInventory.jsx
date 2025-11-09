import { useState } from "react";
import { toast } from "react-hot-toast"; // Optional, bisa dihapus jika tidak pakai
import baseURL from "../../api";

// === Komponen FormInventory untuk form input data inventory ===
export default function FormInventory({ onSubmit, onClose, initialData = {} }) {
  // State form dengan nilai awal dari initialData
  const [form, setForm] = useState({
    tanggal: initialData.tanggal || "",
    kode: initialData.kode || "",
    nama: initialData.nama || "",
    jumlah: initialData.jumlah || "",
    satuan: initialData.satuan || "",
    unit: initialData.unit || "",
  });

  // Handler perubahan input form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Handler submit form: langsung kirim ke server
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${baseURL}/api/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Gagal menambahkan data");

      toast.success("Data berhasil ditambahkan!");
      setForm({ tanggal: "", kode: "", nama: "", jumlah: "", satuan: "", unit: "" });

      if (onSubmit) onSubmit(); // Notify parent jika diperlukan
      onClose();
    } catch (err) {
      toast.error("Gagal menyimpan data!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Tambah Data Inventory</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tanggal</label>
          <input
            type="date"
            name="tanggal"
            value={form.tanggal}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kode Barang</label>
          <input
            type="text"
            name="kode"
            value={form.kode}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nama Barang</label>
          <input
            type="text"
            name="nama"
            value={form.nama}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Jumlah</label>
          <input
            type="number"
            name="jumlah"
            value={form.jumlah}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Satuan</label>
          <input
            type="text"
            name="satuan"
            value={form.satuan}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Unit</label>
          <input
            type="text"
            name="unit"
            value={form.unit}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded"
        >
          Simpan
        </button>
      </div>
    </form>
  );
}
