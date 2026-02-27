import db from "@/lib/db" // Bizim meşhur Singleton bağlantımız
import Image from "next/image"; // Next.js'in akıllı resim bileşeni


export default async function HomePage() {
    // 1. Veriyi sunucuda çekiyoruz (Server Component gücü!)
    // Fiyata göre pahalıdan ucuza sıralayalım (desc = descending)
    const products = await db.product.findMany({
        orderBy: {
            price: "desc"
        }
    })

    return (
        <main className="p-10 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">
                Marketimizdeki Ürünler
            </h1>

            {/* 2. Ürünleri listeleyen Grid yapısı */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                        <h2 className="text-xl font-semibold text-gray-700">{product.name}</h2>
                        <p className="text-gray-500 mt-2 text-sm">{product.description}</p>

                        {/* RESİM ALANI */}
                        <div className="relative h-48 w-full bg-gray-200">
                            {product.imageUrl ? (
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill // Kutuyu tamamen kapla
                                    className="object-cover" // Resmi bozmadan doldur
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    Görsel Yok
                                </div>
                            )}
                        </div>

                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-2xl font-bold text-green-600">
                                    {product.price} TL
                                </span>
                                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600">
                                    Detaylara Bak
                                </button>
                            </div>
                        </div>
                ))}
                    </div>

            {/* Eğer ürün yoksa gösterilecek mesaj */ }
            {
                        products.length === 0 && (
                            <p className="text-center text-gray-500 mt-20 italic">Henüz ürün eklenmemiş...</p>
                        )
                    }
        </main>
    )
} 