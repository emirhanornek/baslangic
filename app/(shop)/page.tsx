export default function ShopHomePage() {
    return (
        <div className="min-h-screen bg-slate-100 p-8">

            <div className="p-10 text-center">
                <h1 className="text-3xl font-extrabold text-gray-900">E-Ticaret Mağazamıza Hoş Geldiniz</h1>
                <p className="text-gray-600 mt-2">Burada en yeni ürünleri bulabilirsiniz.</p>

                {/* Panele gitmek için geçici bir link */}
                <a href="/dashboard" className="mt-10 inline-block text-blue-500 underline">
                    Yönetim Paneline Git (Gizli Yol)
                </a>
            </div>
            
        </div>

    )
}