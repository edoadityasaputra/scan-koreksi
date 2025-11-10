const GAS_URL = "https://script.google.com/macros/s/AKfycbyENJTaix67MsXComxdj1XxHww0j7CGT5iKiZDcQo9lj6XWWv7g5P7OVXZ5bd_YDAbd/exec";

document.getElementById("prosesBtn").addEventListener("click", async () => {
  const kelas = document.getElementById("kelas").value;
  const nama = document.getElementById("nama").value;
  const file = document.getElementById("scan").files[0];

  if (!file) {
    alert("Pilih foto LJK terlebih dahulu!");
    return;
  }

  document.getElementById("jawabanHasil").innerText = "Sedang memproses...";

  // Jalankan OCR
  const result = await Tesseract.recognize(file, "eng", {
    logger: info => console.log(info),
  });

  let teks = result.data.text;
  console.log("Hasil OCR:", teks);

  // Contoh deteksi sederhana (kamu bisa modifikasi nanti)
  // misal hasil OCR "A D B D" → kita ubah jadi array ["a","d","b","d"]
  let jawaban = teks
    .replace(/[^A-Da-d]/g, " ") // hapus karakter selain A-D
    .trim()
    .split(/\s+/)
    .map(h => h.toLowerCase());

  // Tampilkan hasil
  document.getElementById("namaHasil").innerText = nama;
  document.getElementById("jawabanHasil").innerText = jawaban.join(", ");

  // Kirim ke GAS
  fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nama: `${kelas} - ${nama}`,
      hasil: jawaban
    }),
  })
    .then(res => res.text())
    .then(msg => {
      alert("✅ Data berhasil dikirim!\n" + msg);
    })
    .catch(err => {
      alert("❌ Gagal mengirim ke Google Sheets");
      console.error(err);
    });
});
