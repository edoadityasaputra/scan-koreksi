

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
    alert("Isi nama dan pilih kelas dulu ya!");
    return;
  }

  // Simulasi hasil scan (nanti diganti dengan deteksi otomatis)
  const hasilJawaban = ["A","C","B","D","A","C","A","B","C","D","A","A","D","B","C","A","D","C","B","B","A","C","D","A","B"];
  tampilkanHasil(nama, hasilJawaban);

  // Otomatis aktifkan tombol kirim
  btnKirim.disabled = false;
});

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

