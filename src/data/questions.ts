export interface Question {
  q: string;
  options: [string, string, string];
  answer: number; // index of correct option
}

export interface Level {
  id: number;
  title: string;
  subtitle: string;
  questions: Question[];
}

export const LEVELS: Level[] = [
  {
    id: 1,
    title: 'Level 1',
    subtitle: 'Arti Asmaul Husna',
    questions: [
      { q: 'Ar-Rahman artinya ...?', options: ['Maha Pengasih', 'Maha Perkasa', 'Maha Mengetahui'], answer: 0 },
      { q: 'Ar-Rahim artinya ...?', options: ['Maha Melihat', 'Maha Penyayang', 'Maha Kuasa'], answer: 1 },
      { q: 'Al-Malik artinya ...?', options: ['Maha Pemberi', 'Maha Mendengar', 'Maha Merajai'], answer: 2 },
      { q: 'Al-Quddus artinya ...?', options: ['Maha Suci', 'Maha Besar', 'Maha Adil'], answer: 0 },
      { q: 'As-Salam artinya ...?', options: ['Maha Kuat', 'Maha Pemberi Keselamatan', 'Maha Pengampun'], answer: 1 },
      { q: 'Al-Khaliq artinya ...?', options: ['Maha Mendengar', 'Maha Bijaksana', 'Maha Pencipta'], answer: 2 },
      { q: "Al-'Alim artinya ...?", options: ['Maha Mengetahui', 'Maha Pengasih', 'Maha Merajai'], answer: 0 },
      { q: "As-Sami' artinya ...?", options: ['Maha Melihat', 'Maha Mendengar', 'Maha Suci'], answer: 1 },
      { q: 'Al-Basir artinya ...?', options: ['Maha Penyayang', 'Maha Pencipta', 'Maha Melihat'], answer: 2 },
      { q: 'Al-Ahad artinya ...?', options: ['Maha Esa', 'Maha Kuat', 'Maha Pemberi'], answer: 0 },
    ],
  },
  {
    id: 2,
    title: 'Level 2',
    subtitle: 'Tebak Nama Allah',
    questions: [
      { q: 'Maha Pengasih adalah arti dari ...', options: ['Ar-Rahman', 'Al-Malik', 'Al-Quddus'], answer: 0 },
      { q: 'Maha Penyayang adalah arti dari ...', options: ['Al-Khaliq', 'Ar-Rahim', 'As-Salam'], answer: 1 },
      { q: 'Maha Merajai adalah arti dari ...', options: ["Al-'Alim", 'Al-Basir', 'Al-Malik'], answer: 2 },
      { q: 'Maha Suci adalah arti dari ...', options: ['Al-Quddus', 'Ar-Rahman', 'Al-Ahad'], answer: 0 },
      { q: 'Maha Pemberi Keselamatan adalah arti dari ...', options: ['Al-Khaliq', 'As-Salam', "As-Sami'"], answer: 1 },
      { q: 'Maha Pencipta adalah arti dari ...', options: ['Al-Basir', 'Al-Malik', 'Al-Khaliq'], answer: 2 },
      { q: 'Maha Mengetahui adalah arti dari ...', options: ["Al-'Alim", 'As-Salam', 'Ar-Rahim'], answer: 0 },
      { q: 'Maha Mendengar adalah arti dari ...', options: ['Al-Basir', "As-Sami'", 'Al-Quddus'], answer: 1 },
      { q: 'Maha Melihat adalah arti dari ...', options: ['Al-Ahad', 'Al-Khaliq', 'Al-Basir'], answer: 2 },
      { q: 'Maha Esa adalah arti dari ...', options: ['Al-Ahad', 'Al-Malik', "As-Sami'"], answer: 0 },
    ],
  },
  {
    id: 3,
    title: 'Level 3',
    subtitle: 'Meneladani Asmaul Husna',
    questions: [
      { q: 'Asmaul Husna artinya ...', options: ['Nama-nama Allah yang baik', 'Nama-nama malaikat', 'Nama-nama nabi'], answer: 0 },
      { q: 'Jumlah Asmaul Husna ada ...', options: ['25', '99', '10'], answer: 1 },
      { q: 'Allah Maha Suci (Al-Quddus). Kita meneladaninya dengan ...', options: ['Malas mandi', 'Membuang sampah sembarangan', 'Menjaga kebersihan badan dan tempat'], answer: 2 },
      { q: 'Allah Maha Penyayang (Ar-Rahim). Kita meneladaninya dengan ...', options: ['Menyayangi teman dan hewan', 'Memukul teman', 'Berkata kasar'], answer: 0 },
      { q: 'Allah Maha Pemberi Keselamatan (As-Salam). Kita meneladaninya dengan ...', options: ['Bertengkar', 'Mengucapkan salam dan berdamai', 'Membuat keributan'], answer: 1 },
      { q: 'Allah Maha Pencipta (Al-Khaliq). Yang menciptakan langit dan bumi adalah ...', options: ['Manusia', 'Malaikat', 'Allah'], answer: 2 },
      { q: "Allah Maha Mengetahui (Al-'Alim). Jadi kita harus ...", options: ['Selalu jujur walau tidak dilihat orang', 'Berbohong saat sendirian', 'Mencontek saat ulangan'], answer: 0 },
      { q: "Allah Maha Mendengar (As-Sami'). Doa yang kita ucapkan pasti ...", options: ['Tidak didengar', 'Didengar Allah', 'Dilupakan'], answer: 1 },
      { q: 'Allah Maha Melihat (Al-Basir). Perbuatan kita yang tersembunyi ...', options: ['Tidak diketahui siapa pun', 'Hanya dilihat orang tua', 'Tetap dilihat Allah'], answer: 2 },
      { q: 'Allah Maha Pengasih (Ar-Rahman). Kasih sayang Allah diberikan kepada ...', options: ['Semua makhluk', 'Orang kaya saja', 'Orang dewasa saja'], answer: 0 },
    ],
  },
  {
    id: 4,
    title: 'Level 4',
    subtitle: 'Nama-nama Allah Lainnya',
    questions: [
      { q: 'Al-Hafiz artinya ...?', options: ['Maha Memelihara', 'Maha Pemurah', 'Maha Kuat'], answer: 0 },
      { q: 'Al-Wali artinya ...?', options: ['Maha Pengampun', 'Maha Pelindung', 'Maha Besar'], answer: 1 },
      { q: 'Al-Khabir artinya ...?', options: ['Maha Pemberi', 'Maha Adil', 'Maha Teliti'], answer: 2 },
      { q: 'Ar-Razzaq artinya ...?', options: ['Maha Pemberi Rezeki', 'Maha Melihat', 'Maha Suci'], answer: 0 },
      { q: 'Al-Ghaffar artinya ...?', options: ['Maha Kuat', 'Maha Pengampun', 'Maha Merajai'], answer: 1 },
      { q: 'Al-Wahhab artinya ...?', options: ['Maha Mendengar', 'Maha Teliti', 'Maha Pemberi Karunia'], answer: 2 },
      { q: 'Al-Kabir artinya ...?', options: ['Maha Besar', 'Maha Kecil', 'Maha Lembut'], answer: 0 },
      { q: 'Al-Qawiyy artinya ...?', options: ['Maha Penyayang', 'Maha Kuat', 'Maha Pencipta'], answer: 1 },
      { q: 'Al-Hakim artinya ...?', options: ['Maha Pemurah', 'Maha Pelindung', 'Maha Bijaksana'], answer: 2 },
      { q: 'Al-Latif artinya ...?', options: ['Maha Lembut', 'Maha Perkasa', 'Maha Memelihara'], answer: 0 },
    ],
  },
  {
    id: 5,
    title: 'Level 5',
    subtitle: 'Tantangan Juara',
    questions: [
      { q: 'Allah menjaga alam semesta dengan baik. Ini sesuai nama Allah ...', options: ['Al-Hafiz', 'Al-Kabir', 'Al-Ghaffar'], answer: 0 },
      { q: 'Allah memberi makan semua makhluk. Ini sesuai nama Allah ...', options: ['Al-Basir', 'Ar-Razzaq', "As-Sami'"], answer: 1 },
      { q: 'Allah mengampuni hamba yang bertobat. Ini sesuai nama Allah ...', options: ['Al-Malik', 'Al-Khaliq', 'Al-Ghaffar'], answer: 2 },
      { q: 'Allah melindungi orang yang beriman. Ini sesuai nama Allah ...', options: ['Al-Wali', 'Al-Quddus', 'Ar-Rahman'], answer: 0 },
      { q: 'Allah mengetahui hal yang sangat kecil dan tersembunyi. Ini sesuai nama Allah ...', options: ['As-Salam', 'Al-Khabir', 'Al-Ahad'], answer: 1 },
      { q: 'Membaca Asmaul Husna adalah perbuatan yang ...', options: ['Sia-sia', 'Dilarang', 'Terpuji dan berpahala'], answer: 2 },
      { q: 'Allah itu satu, tidak ada sekutu bagi-Nya. Ini sesuai nama Allah ...', options: ['Al-Ahad', "Al-'Alim", 'Al-Wahhab'], answer: 0 },
      { q: 'Nama Allah yang artinya Maha Pemberi Karunia adalah ...', options: ['Al-Latif', 'Al-Wahhab', 'Al-Hakim'], answer: 1 },
      { q: 'Allah Maha Besar. Kalimat "Allahu Akbar" sesuai dengan nama ...', options: ['Al-Latif', 'Al-Wali', 'Al-Kabir'], answer: 2 },
      { q: 'Sikap kita setelah mengenal Asmaul Husna adalah ...', options: ['Semakin cinta dan taat kepada Allah', 'Menjauhi salat', 'Sombong kepada teman'], answer: 0 },
    ],
  },
];

export const QUESTIONS_PER_LEVEL = 10;
