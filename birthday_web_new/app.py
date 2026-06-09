from flask import Flask, render_template, request, jsonify, session
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)

# ============================
# GANTI SESUAI KEINGINAN KAMU
# ============================
SECRET_PASSWORD = "03062008"        # Password brankas
BIRTHDAY_GIRL_NAME = "My Luvly Wifeyy"       # Nama cewe kamu
YOUR_NAME = "your future husband"                  # Nama kamu
BIRTHDAY_MESSAGE = "Terima kasih untuk segalanya, kamu berharga banget buat aku. Aku sayang kamu, selalu dan selamanya. 💕"

# Daftar foto — taruh foto di folder static/images/
# Format: {"src": "nama_file.jpg", "caption": "Judul foto", "message": "Kata-kata khusus untuk foto ini"}
PHOTOS = [
    {
        "src": "photo1.jpg",
        "caption": "Senyum Terindahmu",
        "message": "Senyummu adalah hal pertama yang aku cari setiap pagi. Tidak ada yang lebih indah dari melihat kamu bahagia. 💕"
    },
    {
        "src": "photo2.jpg",
        "caption": "Momen Berharga Kita",
        "message": "Setiap detik bersamamu terasa seperti keajaiban. Aku tidak pernah menyesal satu pun momen yang telah kita lewati. 🌸"
    },
    {
        "src": "photo3.jpg",
        "caption": "youre my happines",
        "message": "Foto ini selalu mengingatkanku betapa beruntungnya aku bisa mengenalmu. Kamu adalah kenangan terbaik hidupku. ✨"
    },
    {
        "src": "photo4.jpg",
        "caption": "Bersamamu Dunia Berwarna",
        "message": "Sebelum ada kamu, hidupku terasa abu-abu. Kamu yang membawa warna, tawa, dan kehangatan ke dalam setiap harinya. 🌈"
    },
    {
        "src": "photo5.jpg",
        "caption": "Terima Kasih Sudah Ada",
        "message": "Terima kasih sudah memilih untuk ada di sini, di hidupku. Kamu adalah jawaban dari doa yang bahkan tidak pernah aku ucapkan. 💖"
    },
    {
        "src": "photo6.jpg",
        "caption": "i love u",
        "message": "Waktu terasa terlalu cepat berlalu saat aku bersamamu. Aku ingin membekukan setiap momen indah ini selamanya. 🥰"
    },
]
# ============================

@app.route("/")
def index():
    return render_template("index.html",
        name=BIRTHDAY_GIRL_NAME,
        your_name=YOUR_NAME,
        message=BIRTHDAY_MESSAGE,
        photos=PHOTOS
    )

@app.route("/unlock", methods=["POST"])
def unlock():
    data = request.get_json()
    password = data.get("password", "")
    if password == SECRET_PASSWORD:
        session["unlocked"] = True
        return jsonify({"success": True})
    return jsonify({"success": False, "error": "Password salah, coba lagi 💔"})

@app.route("/check")
def check():
    return jsonify({"unlocked": session.get("unlocked", False)})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
