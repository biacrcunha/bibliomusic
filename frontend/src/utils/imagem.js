export function lerImagemComoBase64Redimensionada(
  arquivo,
  ladoMaximo = 400,
  qualidade = 0.8,
) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    leitor.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Arquivo de imagem inválido.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > ladoMaximo) {
          height = Math.round((height * ladoMaximo) / width);
          width = ladoMaximo;
        } else if (height > ladoMaximo) {
          width = Math.round((width * ladoMaximo) / height);
          height = ladoMaximo;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', qualidade));
      };
      img.src = leitor.result;
    };
    leitor.readAsDataURL(arquivo);
  });
}
