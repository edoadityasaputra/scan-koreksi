

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
  if (typeof cv === "undefined") {
    alert("OpenCV belum siap, tunggu beberapa detik dan coba lagi.");
    return [];
  }

  // Konversi ke Mat
  let src = cv.imread(img);
  let gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

  // Blur + threshold untuk pisahkan lingkaran hitam
  let blur = new cv.Mat();
  cv.GaussianBlur(gray, blur, new cv.Size(5, 5), 0);
  let binary = new cv.Mat();
  cv.threshold(blur, binary, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU);

  const width = binary.cols;
  const height = binary.rows;

  // Daftar posisi lingkaran relatif (%)
  const kolom = [
    { start: 0.15, soal: [1, 10] },   // kolom kiri
    { start: 0.47, soal: [11, 20] },  // kolom tengah
    { start: 0.78, soal: [21, 25] }   // kolom kanan
  ];

  const hasil = [];
  let nomorSoal = 1;

  for (let k of kolom) {
    const totalSoal = k.soal[1] - k.soal[0] + 1;
    for (let i = 0; i < totalSoal; i++) {
      // Hitung posisi Y
      const yPersen = 0.15 + i * 0.03; // jarak antar baris
      const y = Math.floor(yPersen * height);

      // Set posisi X setiap pilihan A–D (spasi antar lingkaran)
      const baseX = Math.floor(k.start * width);
      const step = Math.floor(width * 0.03);
      const options = ["A", "B", "C", "D"];

      let nilaiHitam = [];

      for (let j = 0; j < 4; j++) {
        const x = baseX + j * step;
        const w = 20;  // area sekitar lingkaran
        const h = 20;
        const rect = new cv.Rect(x - w / 2, y - h / 2, w, h);
        const roi = binary.roi(rect);
        const jumlahHitam = cv.countNonZero(roi);
        nilaiHitam.push(jumlahHitam);
        roi.delete();
      }

      // Pilih lingkaran paling hitam (jawaban siswa)
      const indexJawaban = nilaiHitam.indexOf(Math.max(...nilaiHitam));
      hasil.push(options[indexJawaban]);

      nomorSoal++;
    }
  }

  // Bersihkan memori
  src.delete(); gray.delete(); blur.delete(); binary.delete();

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
