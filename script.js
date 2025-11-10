

// Ganti dengan URL Web Apps kamu dari Google Apps Script
const GAS_URL = "https://script.google.com/macros/s/AKfycbyENJTaix67MsXComxdj1XxHww0j7CGT5iKiZDcQo9lj6XWWv7g5P7OVXZ5bd_YDAbd/exec";

const btnFoto = document.getElementById("ambilFoto");
const inputGambar = document.getElementById("inputGambar");
const hasilDiv = document.getElementById("hasilScan");
const btnKirim = document.getElementById("kirimGAS");

btnFoto.addEventListener("click", () => inputGambar.click());

inputGambar.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const nama = document.getElementById("nama").value.trim();
  const kelas = document.getElementById("kelas").value;
  if (!nama || !kelas) {
    alert("Isi nama dan kelas dulu ya!");
    return;
  }

  // Konversi gambar ke elemen Image
  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = async () => {
    const hasilJawaban = await deteksiJawaban(img);
    tampilkanHasil(nama, hasilJawaban);
    btnKirim.disabled = false;
  };
});

async function deteksiJawaban(img) {
  // Tunggu OpenCV siap
  if (typeof cv === "undefined") {
    alert("OpenCV belum siap, tunggu beberapa detik dan coba lagi.");
    return [];
  }

  // Konversi gambar ke OpenCV Mat
  let src = cv.imread(img);
  let gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

  // Threshold (hitam putih)
  let binary = new cv.Mat();
  cv.threshold(gray, binary, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU);

  // (Simulasi sementara)
  // Nanti kamu bisa isi posisi lingkaran sesuai LJK PDF
  // Misal array posisi koordinat tiap lingkaran
  const totalSoal = 25;
  let hasil = [];

  for (let i = 1; i <= totalSoal; i++) {
    const random = ["A", "B", "C", "D"][Math.floor(Math.random() * 4)];
    hasil.push(random);
  }

  // Bersihkan memory
  src.delete(); gray.delete(); binary.delete();

  return hasil;
}

function tampilkanHasil(nama, jawaban) {
  document.getElementById("outputNama").innerText = `Nama: ${nama}`;
  document.getElementById("outputJawaban").innerText = `Jawaban: ${jawaban.join(", ")}`;
  hasilDiv.style.display = "block";
}

// Kirim ke GAS
btnKirim.addEventListener("click", async () => {
  const nama = document.getElementById("nama").value;
  const jawaban = document.getElementById("outputJawaban").innerText.replace("Jawaban: ", "");

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama, jawaban })
    });

    if (res.ok) {
      alert("✅ Data berhasil dikirim ke Google Sheet!");
    } else {
      alert("❌ Gagal kirim data. Cek koneksi atau URL GAS kamu.");
    }
  } catch (err) {
    alert("⚠️ Error: " + err.message);
  }
});
