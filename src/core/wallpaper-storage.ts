const WALLPAPER_DB_NAME = 'FluentNewTabDB';
const WALLPAPER_DB_VERSION = 1;
const WALLPAPER_STORE_NAME = 'wallpapers';

function openWallpaperDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(WALLPAPER_DB_NAME, WALLPAPER_DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(WALLPAPER_STORE_NAME)) {
                db.createObjectStore(WALLPAPER_STORE_NAME);
            }
        };

        request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
        request.onerror = (event) => reject('Erro ao abrir banco de dados: ' + (event.target as IDBOpenDBRequest).error);
    });
}

async function saveWallpaperToDB(blob: Blob): Promise<boolean> {
    const db = await openWallpaperDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([WALLPAPER_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(WALLPAPER_STORE_NAME);
        const request = store.put(blob, 'custom_wallpaper');

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject('Erro ao salvar no DB');
    });
}

async function getWallpaperFromDB(): Promise<Blob | null> {
    const db = await openWallpaperDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([WALLPAPER_STORE_NAME], 'readonly');
        const store = transaction.objectStore(WALLPAPER_STORE_NAME);
        const request = store.get('custom_wallpaper');

        request.onsuccess = (event) => resolve((event.target as IDBRequest<Blob | undefined>).result ?? null);
        request.onerror = () => reject('Erro ao ler do DB');
    });
}

function convertImageToWebp(
    imageSource: string,
    maxWidth = 1920,
    quality = 0.82
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = imageSource;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            ctx?.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject('Erro na conversão para WebP');
            }, 'image/webp', quality);
        };

        img.onerror = (error) => reject(error);
    });
}

function processWallpaperImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            convertImageToWebp(String((event.target as FileReader).result || ''), 1920, 0.8)
                .then(resolve)
                .catch(reject);
        };

        reader.onerror = (error) => reject(error);
    });
}
