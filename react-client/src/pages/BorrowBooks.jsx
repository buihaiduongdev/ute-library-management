import React, { useState } from "react";
import { createBorrow } from "../utils/api";

export default function BorrowBooks() {
  const [readerId, setReaderId] = useState("");
  const [bookIds, setBookIds] = useState("");

  const handleBorrow = async () => {
    try {
      const res = await createBorrow(readerId, bookIds.split(",").map(Number));
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi mượn sách");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">📚 Mượn Sách</h2>

      <input
        className="border p-2 rounded mb-3 block"
        value={readerId}
        onChange={(e) => setReaderId(e.target.value)}
        placeholder="Nhập mã độc giả"
      />

      <input
        className="border p-2 rounded mb-3 block"
        value={bookIds}
        onChange={(e) => setBookIds(e.target.value)}
        placeholder="Nhập danh sách mã sách, cách nhau bằng dấu phẩy"
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleBorrow}
      >
        ✅ Xác nhận mượn hello 
      </button>
    </div>
  );
}
