import type { TranslationDictionary } from '../i18n.types';

export const id: TranslationDictionary = {
  errors: {
    internalServerError: 'Terjadi kesalahan internal tak terduga pada server',
    validationFailed: 'Validasi Data Gagal',
    unauthorized: 'Autentikasi diperlukan. Harap sertakan token Bearer yang valid.',
    forbidden: 'Anda tidak memiliki izin untuk mengakses sumber daya ini.',
    notFound: 'Sumber daya yang diminta tidak dapat ditemukan.',
    routeNotFound: 'Rute tidak ditemukan: {{method}} {{path}}',
    rateLimitExceeded: 'Terlalu banyak permintaan. Silakan tunggu beberapa saat lagi.',
    authRateLimitExceeded:
      'Terlalu banyak percobaan autentikasi. Silakan coba lagi setelah 1 menit.',
    invalidCredentials: 'Email atau kata sandi tidak cocok dengan data kami.',
    tokenExpired: 'Sesi token akses Anda telah kedaluwarsa. Silakan segarkan sesi Anda.',
    tokenInvalid: 'Token yang diberikan tidak valid atau rusak.',
    tokenRevoked: 'Sesi Anda telah dihentikan atau dicabut.',
    duplicateEmail: 'Akun dengan alamat email ini sudah terdaftar sebelumnya.',
    userNotFound: 'Akun pengguna tidak ditemukan.',
    productNotFound: 'Produk dengan ID yang diminta tidak ditemukan.',
    badRequest: 'Permintaan atau parameter data tidak valid.',
    databaseUnavailable: 'Layanan database sedang tidak tersedia',
  },
  success: {
    healthCheck: 'Semua layanan beroperasi dengan normal',
    registrationSuccessful: 'Pendaftaran berhasil. Akun Anda telah dibuat.',
    loginSuccessful: 'Login berhasil.',
    tokensRefreshed: 'Token berhasil diperbarui.',
    loggedOut: 'Berhasil keluar dari akun.',
    userProfileRetrieved: 'Profil pengguna berhasil dimuat.',
    productsRetrieved: 'Daftar produk berhasil dimuat',
    productStatisticsRetrieved: 'Statistik produk berhasil dimuat',
    productDetailsRetrieved: 'Detail produk berhasil dimuat',
    productCreated: 'Produk berhasil ditambahkan',
    productUpdated: 'Data produk berhasil diperbarui',
    productDeleted: 'Produk berhasil dihapus',
  },
};
