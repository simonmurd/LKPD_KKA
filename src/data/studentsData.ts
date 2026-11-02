export interface Student {
  id: string;
  school: string;
  className: string;
  noAbsen: string;
  name: string;
  displayName: string;
}

export const RAW_STUDENTS_LIST = [
  // SMK NEGERI 1 SINGKAWANG, X TJK
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "01", name: "ALVINO" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "02", name: "DEBORA RATU GIASTA GULTOM" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "03", name: "DENIS" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "04", name: "DEO REVALDY AHMAD" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "05", name: "EVAN KRESNA LEE" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "06", name: "FEBRIYANTO" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "07", name: "HERKULANUS PERDY" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "08", name: "HIQMAL LIONEL ALVIANO" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "09", name: "INDRA KESUMAH" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "10", name: "JERRY KURNIAWAN" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "11", name: "KABILA SYIFA" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "12", name: "KEYLA KIRANA PUTRI" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "13", name: "KRISTIAN DAFI" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "14", name: "LIONEL VAN EXAUDI HUTABARAT" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "15", name: "MIRATUL TASYA RAMADHANI" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "16", name: "MUHAMMAD RAYHAN AL GHIFARY" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "17", name: "MUHAMMAD ZAKY RAFANANDO" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "18", name: "NATARI KEYZA JUNIAR" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "19", name: "NAZUA KASTINA" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "20", name: "NUR AZANI" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "21", name: "NURAINI" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "22", name: "PIRANDA RAMADANI" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "23", name: "REBHELIA" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "24", name: "REVAN" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "25", name: "RIA ADHA" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "26", name: "RINDU PRANITA NUARI" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "27", name: "RIVALDO RANGGA SAPUTRA" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "28", name: "SELVIA" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "29", name: "SITI MARIYAM" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "30", name: "SYIFA FAHIRA" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "31", name: "WULANDARI" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "32", name: "YULIANTI" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "X TJK", noAbsen: "33", name: "YUNKHI" },

  // SMK NEGERI 1 SINGKAWANG, XI TJK
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "01", name: "RIZKY JUNIANSYAH" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "02", name: "SEMELIA" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "03", name: "AHMAD NOVA RIANTO" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "04", name: "AIDANAZMAN DATINOV" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "05", name: "AJI SOPYAN DWI" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "06", name: "ANGELA DARA LISTA" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "07", name: "ANNISA SALSA SHAFIRA" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "09", name: "AYRA" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "10", name: "AZURA" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "11", name: "BAYU CITRA PRATAMA" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "12", name: "BUNGA LESTARI" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "13", name: "CHASTLE ALPHA RICHIE" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "14", name: "DEVINA YUNA" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "15", name: "DINDA PUTRI RAHAYU" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "16", name: "EDWIN PRAYOGA" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "17", name: "FAJAR JULIANSYAH" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "18", name: "FRANSISCO DWI ADITYA" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "19", name: "GABRIEL ARESTA" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "20", name: "GLORIA ELSIA" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "21", name: "IHSAN AZHALLAH FAWWAZ" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "22", name: "INDRAYANI" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "23", name: "IRFAN RACHMANDANI FERDIAN" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "24", name: "KEVIN APRILIO" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "25", name: "KHOIRUNNISA" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "26", name: "LAFYCA CALYZZA" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "27", name: "MAHLIK ADI SAPUTRA" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "28", name: "MUHAMAD ADHA NUR IKHSAN" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "29", name: "MUHAMMAD NABIL PASHA" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "30", name: "NURLILA FADILLA" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "31", name: "RENI" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "32", name: "RIA KURNIATI" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "33", name: "RIDWAN RAKA HARTONO" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "34", name: "SAEPUL MAJID" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "35", name: "VIONA" },
  { school: "SMK NEGERI 1 SINGKAWANG", className: "XI TJK", noAbsen: "36", name: "WAHYU" },

  // SMK MUDITA SINGKAWANG, XI TJKT
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "01", name: "ALICIA JENIFER" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "02", name: "ANGELA" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "03", name: "CALVINIUS BUNARTO" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "04", name: "CHELSY VEROSSA" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "05", name: "DERMAN JOHAN" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "06", name: "DESTIAN WIJAYA" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "07", name: "DISON NIKANOR" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "08", name: "ENNIO EDWARD" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "09", name: "FANI VANESA" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "10", name: "HANNY PHANGGESTY" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "11", name: "HERWIT BRIAN" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "12", name: "JAVI YANTO" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "13", name: "JEFRY" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "14", name: "JONATHAN VINCENTIUS" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "15", name: "KELLY ANGELA" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "16", name: "KEVIN KURNIAWAN" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "17", name: "LEONARDO" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "18", name: "LORENZO JONATHAN PANGESTU" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "19", name: "MEDY SANJAYA" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "20", name: "MEYCHEN CARNELLA" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "21", name: "MICHELLE" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "22", name: "NESHA FREDELINA XHIAUW" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "23", name: "RAYMEND" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "24", name: "RICARDO" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "25", name: "SUYANBUN LIPFIANDY" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "26", name: "TRI WIJAYA" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "27", name: "VINCENT" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "28", name: "VINCENT ALBERTO FEROZ" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "29", name: "VINCENT BUN" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "30", name: "VINCENT LAUNARDY" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "31", name: "VINSEN" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "32", name: "VITO ALBERT FEROZ" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "33", name: "VITON" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "34", name: "WENNI NINGSI WONGSO" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "35", name: "WILLIAM (35)" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "36", name: "WILLIAM (36)" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "37", name: "WILLIAM (37)" },
  { school: "SMK MUDITA SINGKAWANG", className: "XI TJKT", noAbsen: "38", name: "YUVENSIUS" }
];

export const STUDENTS_DATA: Student[] = RAW_STUDENTS_LIST.map((item, idx) => {
  const schoolShort = item.school.includes("MUDITA") ? "MUDITA" : "SMKN 1";
  return {
    id: `STU-${idx + 1}`,
    school: item.school,
    className: item.className,
    noAbsen: item.noAbsen,
    name: item.name,
    displayName: `[${item.noAbsen}] ${item.name} (${item.className} - ${schoolShort})`
  };
});

export const SCHOOL_OPTIONS = [
  "SEMUA SEKOLAH",
  "SMK NEGERI 1 SINGKAWANG",
  "SMK MUDITA SINGKAWANG"
];

export const CLASS_OPTIONS = [
  "SEMUA KELAS",
  "X TJK",
  "XI TJK",
  "XI TJKT"
];
