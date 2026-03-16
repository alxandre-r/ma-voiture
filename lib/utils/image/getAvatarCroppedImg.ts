export default async function getAvatarCroppedImg(
  imageSrc: string,
  croppedAreaPixels: { width: number; height: number; x: number; y: number },
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = imageSrc;

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No 2d context');

      // Circular crop for avatars
      ctx.beginPath();
      ctx.arc(
        croppedAreaPixels.width / 2,
        croppedAreaPixels.height / 2,
        croppedAreaPixels.width / 2,
        0,
        2 * Math.PI,
      );
      ctx.closePath();
      ctx.clip();

      // Draw the cropped image
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
      );

      canvas.toBlob((blob) => {
        if (!blob) return reject('Canvas is empty');
        resolve(blob);
      }, 'image/png');
    };

    image.onerror = (err) => reject(err);
  });
}
