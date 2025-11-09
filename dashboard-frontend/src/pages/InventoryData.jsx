import { useEffect, useState } from "react";
import TableBarang from "../components/tables/TableBarang";
import Button from "../components/ui/Button";
import FilterUnitMasuk from "../components/filters/FilterUnitRingkasan";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useLocation } from "react-router-dom";
import Modal from "../components/ui/Modal";
import EditInventoryForm from "../components/forms/EditInventoryForm";
import { useNavigate } from "react-router-dom";
import baseURL from "../api";  // Memastikan bahwa baseURL diimpor dengan benar




export default function InventoryData() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [filterUnit, setFilterUnit] = useState("Semua Unit");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const filterLowStock = params.get("filter") === "lowstock";
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const navigate = useNavigate();

 const fetchInventory = async () => {
  try {
    setLoading(true);
    const res = await fetch(`${baseURL}/api/inventory`);
    const contentType = res.headers.get("content-type");

    if (!res.ok || !contentType?.includes("application/json")) {
      const text = await res.text();
      console.error("❌ Error dari /api/inventory:", text);
      throw new Error("Gagal fetch inventory");
    }

    const json = await res.json();

    if (!Array.isArray(json)) {
      console.error("❌ Data inventory bukan array:", json);
      throw new Error("Format data inventory tidak valid");
    }

    setData(json);
  } catch (err) {
    console.error("❌ fetchInventory error:", err.message);
    toast.error("Gagal mengambil data inventory: " + err.message);
  } finally {
    setLoading(false);
  }
};




  useEffect(() => {
    fetchInventory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin mau hapus data ini?")) return;
    try {
      const res = await fetch(`${baseURL}/api/inventory/${id}`, {
          method: "DELETE",
        });

      if (!res.ok) throw new Error("Gagal menghapus");
      toast.success("Data berhasil dihapus!");
      fetchInventory();
    } catch (err) {
      toast.error("Gagal hapus data");
    }
  };

  const enhancedData = data.map((item) => {
    let status = "";
    if (item.jumlah === 0) status = "Stok Habis!";
    else if (item.jumlah <= 5) status = "Stok Hampir Habis";
    return { ...item, status };
  });

  const filteredData = enhancedData.filter((item) => {
    const matchNama = item.nama?.toLowerCase().includes(search.toLowerCase());
    const matchUnit = filterUnit === "Semua Unit" || item.unit === filterUnit;
    const matchLowStock = !filterLowStock || item.jumlah <= 2;
    return matchNama && matchUnit && matchLowStock;
  });

  const exportPDF = () => {
  const doc = new jsPDF();

  if (!filterLowStock) {
    doc.text("Laporan Data Inventory", 14, 10); // hanya tampil jika bukan stok rendah
  }

  autoTable(doc, {
    startY: filterLowStock ? 10 : 20, // supaya tabel tidak bertabrakan
    head: [["Tanggal", "Kode", "Nama", "Jumlah", "Satuan", "Unit"]],
    body: filteredData.map((item) => [
      item.tanggal,
      item.kode,
      item.nama,
      item.jumlah,
      item.satuan,
      item.unit,
    ]),
  });

  doc.save(filterLowStock ? "Stok_Rendah.pdf" : "Laporan_Inventory.pdf");
  toast.success("Export PDF berhasil!");
};

  const exportExcel = () => {
  const ws = XLSX.utils.json_to_sheet(
    filteredData.map((item) => ({
      Tanggal: item.tanggal,
      Kode: item.kode,
      Nama: item.nama,
      Jumlah: item.jumlah,
      Satuan: item.satuan,
      Unit: item.unit,
    }))
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, filterLowStock ? "Stok Rendah" : "Inventory");

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(
    new Blob([buffer], { type: "application/octet-stream" }),
    filterLowStock ? "Stok_Rendah.xlsx" : "Laporan_Inventory.xlsx"
  );

  toast.success("Export Excel berhasil!");
};

  const handleEdit = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
        <div className="flex gap-2 items-center">
          {filterLowStock && (
            <Button onClick={() => navigate("/inventory")} variant="secondary">
              ← Kembali
            </Button>
          )}
          <h1 className="text-xl font-semibold text-left">Data Inventory</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportPDF}>Export PDF</Button>
          <Button onClick={exportExcel} variant="secondary">Export Excel</Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <FilterUnitMasuk value={filterUnit} onChange={setFilterUnit} />
        <input
          type="text"
          placeholder="Cari nama barang..."
          className="p-2 rounded-lg border dark:bg-gray-700 dark:text-white flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-gray-600">Loading data...</p>
      ) : (
        <>
          {filterLowStock && (
            <p className="text-sm text-red-600 font-medium mb-2 mt-2">
              Menampilkan hanya barang dengan stok rendah (≤ 3)
            </p>
          )}

          <div className="max-h-[600px] overflow-y-auto rounded-xl">
            <TableBarang data={filteredData} onDelete={handleDelete} onEdit={handleEdit} />
          </div>

          {modalOpen && selectedItem && (
            <Modal onClose={() => setModalOpen(false)}>
              <EditInventoryForm
                item={selectedItem}
                onClose={() => setModalOpen(false)}
                onUpdated={fetchInventory}
              />
            </Modal>
          )}
        </>
      )}
    </div>
  );
}
