
export const getAQIInfo = (aqi) => {
    let value = Math.round(aqi);

    if (value <= 50) return {
        level: "Baik",
        severity: 0,
        color: "bg-green-500",
        textColor: "text-green-600",
        badgeTextColor: "text-gray-900",
        hex: "#22c55e",
        desc: "Tergolong memuaskan serta berpotensi menimbulkan risiko yang relatif kecil."
    };
    if (value <= 100) return {
        level: "Sedang",
        severity: 1,
        color: "bg-yellow-400",
        textColor: "text-yellow-600",
        badgeTextColor: "text-gray-900",
        hex: "#facc15",
        desc: "Tergolong dapat diterima, namun pada individu yang sensitif dapat berefek ringan."
    };
    if (value <= 150) return {
        level: "Tidak Sehat (Sensitif)",
        severity: 2,
        color: "bg-orange-500",
        textColor: "text-orange-600",
        badgeTextColor: "text-gray-900",
        hex: "#f97316",
        desc: "Kelompok rentan (balita, lansia, penderita paru/jantung) dapat mengalami dampak kesehatan."
    };
    if (value <= 200) return {
        level: "Tidak Sehat",
        severity: 3,
        color: "bg-red-500",
        textColor: "text-red-600",
        badgeTextColor: "text-white",
        hex: "#ef4444",
        desc: "Seluruh individu mungkin mulai berefek kesehatan; kelompok rentan efek lebih serius."
    };
    if (value <= 300) return {
        level: "Sangat Tidak Sehat",
        severity: 4,
        color: "bg-purple-600",
        textColor: "text-purple-600",
        badgeTextColor: "text-white",
        hex: "#9333ea",
        desc: "Kondisi urgen. Seluruh populasi kemungkinan besar akan terpengaruh."
    };
    return {
        level: "Berbahaya",
        severity: 5,
        color: "bg-rose-900",
        textColor: "text-rose-900",
        badgeTextColor: "text-white",
        hex: "#881337",
        desc: "Peringatan kondisi darurat yang serius. Seluruh populasi sangat mungkin terpengaruh."
    };
};

export const AQI_SCALE = [
    { range: "0 - 50", label: "Baik", color: "bg-green-500", badgeTextColor: "text-gray-900", desc: "Risiko relatif kecil" },
    { range: "51 - 100", label: "Sedang", color: "bg-yellow-400", badgeTextColor: "text-gray-900", desc: "Dapat diterima" },
    { range: "101 - 150", label: "Tidak Sehat (Sensitif)", color: "bg-orange-500", badgeTextColor: "text-gray-900", desc: "Berisiko bagi kelompok rentan" },
    { range: "151 - 200", label: "Tidak Sehat", color: "bg-red-500", badgeTextColor: "text-white", desc: "Efek kesehatan bagi semua" },
    { range: "201 - 300", label: "Sangat Tidak Sehat", color: "bg-purple-600", badgeTextColor: "text-white", desc: "Kondisi urgen" },
    { range: "301+", label: "Berbahaya", color: "bg-rose-900", badgeTextColor: "text-white", desc: "Kondisi darurat serius" },
];
