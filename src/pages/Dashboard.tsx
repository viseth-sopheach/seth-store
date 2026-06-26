import { useState, useEffect } from "react";
import Modal, { type ComputerPayload } from "./Modal";
import {
  getComputerProducts,
  createComputerProduct,
  updateComputerProduct,
  type Product,
} from "../api/fetchApi";

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Load products ───────────────────────────────────────────
  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getComputerProducts();
      setProducts(data);
    } catch (e) {
      console.error("Failed to load products:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ── Open modal for create ───────────────────────────────────
  const handleAddNew = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  // ── Open modal for edit ──────────────────────────────────────
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  // ── THE KEY FIX: onSave must call update vs create correctly ─
  const handleSave = async (payload: ComputerPayload) => {
    if (editingProduct) {
      // EDIT MODE — must pass the existing product's id
      await updateComputerProduct(editingProduct.id, payload);
    } else {
      // CREATE MODE
      await createComputerProduct(payload);
    }

    await loadProducts(); // refresh list so UI reflects DB changes
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  return (
    <div>
      <button onClick={handleAddNew}>+ Add Product</button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {products.map((p) => (
            <li key={p.id}>
              {p.name} <button onClick={() => handleEdit(p)}>Edit</button>
            </li>
          ))}
        </ul>
      )}

      {showModal && (
        <Modal
          initial={editingProduct}
          onClose={handleClose}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
