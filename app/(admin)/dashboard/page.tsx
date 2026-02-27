import db from "@/lib/db"
import { revalidatePath } from "next/cache"
import fs from "fs/promises"; // Dosya yazmak için
import path from "path";     // Dosya yolu belirlemek için
import { unlink } from "fs/promises"; // Dosya silmek için

export default async function AdnminDashboard() {

    const products = await db.product.findMany({
        orderBy: {
            createdAt: "desc"
        }
    })

    async function createProduct(formData: FormData) {
        "use server";
        try {
            const name = formData.get("name") as string;
            const price = Number(formData.get("price"));
            const file = formData.get("imageUrl") as File;
            const description = formData.get("description") as string;
            let imagePath = "";

            if (file && file.size > 0) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const fileName = `${Date.now()}-${file.name.replaceAll(" ", "_")}`;
                const uploadDir = path.join(process.cwd(), "public", "uploads");

                // Klasörün varlığından emin olalım
                await fs.mkdir(uploadDir, { recursive: true });

                const filePath = path.join(uploadDir, fileName);
                await fs.writeFile(filePath, buffer);

                imagePath = `/uploads/${fileName}`;
            }

            const newProduct = await db.product.create({
                data: { name, price, imageUrl: imagePath, description: description },
            });

            revalidatePath("/");
        } catch (error) {
            console.error("KRİTİK HATA:", error); // Terminalde kırmızı hata verecektir
        }
    }

    async function deleteProduct(formData: FormData) {
        "use server";
        const id = formData.get("id") as string;

        try {
            // 1. Önce veri tabanından ürünü bulalım ki resim yolunu alalım
            const product = await db.product.findUnique({
                where: { id }
            })

            if (product?.imageUrl) {
                // 2. Resim varsa diskten (klasörden) silelim
                // Path: public/uploads/resim.jpg -> başına process.cwd() ekleyerek tam yolu buluruz
                const filePath = path.join(process.cwd(), "public", product.imageUrl);

                try {
                    await unlink(filePath);
                    console.log("Resim başarıyla silindi:", filePath);
                } catch (err) {
                    console.error(err, "Dosya diskte bulunamadı, sadece DB'den siliniyor.");
                }
            }

            // 3. Veri tabanından kaydı silelim
            await db.product.delete({
                where: { id }
            })
            revalidatePath("/");
            revalidatePath("/dashboard");
        } catch (err) {
            console.error("Silme işlemi sırasında hata:", err);
        }
    }


    return (
        <div className="p-10 bg-slate-20 min-h-screen">
            <h1 className="text-2xl font-bold mb-5">Ürün Yönetimi</h1>

            <form action={createProduct} className="flex flex-col gap-4 max-w-md bg-white p-6 rounded shadow" >

                {/* RESİM SEÇME ALANI */}
                <input
                    name="imageUrl"
                    type="file"
                    accept="image/*"
                    className="border p-2"
                />

                <input
                    name="name"
                    placeholder="Ürün Adı"
                    className="border p-2 rounded"
                    required
                />
                <input
                    name="price"
                    type="number"
                    placeholder="Fiyat"
                    className="border p-2 rounded"
                    required
                />

                <textarea placeholder="Açıklama" name="description" className="border p-2 rounded"></textarea>
                <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                    Hafızaya Kaydet (Veri Tabanı)
                </button>
            </form>


            <div className="mt-12">
                <h2 className="text-xl font-bold mb-4">Mevcut Ürünler</h2>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {products.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-4 border-b last:border-0">
                            <div className="flex items-center gap-4">
                                {product.imageUrl && (
                                    <img src={product.imageUrl} className="w-12 h-12 object-cover rounded" />
                                )}
                                <div>
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-sm text-gray-500">{product.price} TL</p>
                                </div>
                            </div>

                            {/* SİLME FORMU */}
                            <form action={deleteProduct}>
                                <input type="hidden" name="id" value={product.id} />
                                <button
                                    type="submit"
                                    className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition-colors text-sm font-semibold"
                                >
                                    Sil
                                </button>
                            </form>
                        </div>
                    ))}
                    {products.length === 0 && <p className="p-4 text-gray-500 italic">Ürün bulunamadı.</p>}
                </div>
            </div>
        </div>

    );
}